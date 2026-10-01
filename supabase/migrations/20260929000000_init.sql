-- Morni — initial schema
-- Couples share one selfie ("drop") a day that lands on the partner's widget.
-- Writes that need validation or push notifications go through Edge Functions
-- (service role); clients read their own couple's data through RLS.

-- ─────────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '' check (char_length(first_name) <= 30),
  locale text not null default 'en' check (locale in ('en', 'fr', 'es')),
  timezone text not null default 'UTC',
  reminder_hour smallint not null default 8 check (reminder_hour between 0 and 23),
  reminders_enabled boolean not null default true,
  couple_id uuid,
  -- Set by the RevenueCat webhook. A couple is premium if either partner is.
  premium_until timestamptz,
  created_at timestamptz not null default now()
);

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null unique references public.profiles (id) on delete cascade,
  user_b uuid not null unique references public.profiles (id) on delete cascade,
  started_on date,
  reunion_on date,
  streak integer not null default 0,
  best_streak integer not null default 0,
  streak_last_day date,
  created_at timestamptz not null default now(),
  check (user_a <> user_b)
);

alter table public.profiles
  add constraint profiles_couple_id_fkey foreign key (couple_id) references public.couples (id) on delete set null;

create table public.invites (
  code text primary key check (code ~ '^[A-Z2-9]{6}$'),
  inviter uuid not null unique references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '14 days'
);

create table public.drops (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  image_path text not null,
  thumb_path text not null,
  -- Mood sticker id; the allowed list lives in the post-drop function (design/moods/moods.json).
  mood text check (mood ~ '^[a-z]{2,20}$'),
  caption text check (char_length(caption) <= 40),
  -- The author's local calendar day, used for streaks and the free daily limit.
  day_key date not null,
  created_at timestamptz not null default now()
);
create index drops_couple_created_idx on public.drops (couple_id, created_at desc);
create index drops_author_day_idx on public.drops (author_id, day_key);

create table public.reactions (
  drop_id uuid not null references public.drops (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 16),
  created_at timestamptz not null default now(),
  primary key (drop_id, user_id)
);

create table public.nudges (
  id bigint generated always as identity primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  from_user uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index nudges_from_created_idx on public.nudges (from_user, created_at desc);

create table public.devices (
  token text primary key check (token ~ '^[0-9a-f]{64,200}$'),
  user_id uuid not null references public.profiles (id) on delete cascade,
  environment text not null default 'production' check (environment in ('sandbox', 'production')),
  updated_at timestamptz not null default now()
);
create index devices_user_idx on public.devices (user_id);

-- Widgets can't hold a Supabase session (refresh-token rotation would log the
-- app out), so each install registers a random key; only its SHA-256 is stored.
create table public.widget_keys (
  key_hash text primary key check (key_hash ~ '^[0-9a-f]{64}$'),
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index widget_keys_user_idx on public.widget_keys (user_id);

create table public.waitlist (
  email text primary key check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  locale text check (locale in ('en', 'fr', 'es')),
  source text check (char_length(source) <= 64),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Helpers
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.my_couple_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select couple_id from public.profiles where id = auth.uid()
$$;

create or replace function public.partner_id(p_user uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select case when c.user_a = p_user then c.user_b else c.user_a end
  from public.profiles p
  join public.couples c on c.id = p.couple_id
  where p.id = p_user
$$;

create or replace function public.is_premium(p_user uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id in (p_user, public.partner_id(p_user))
      and p.premium_until > now()
  )
$$;

create or replace function public.drop_json(d public.drops) returns jsonb
language sql immutable set search_path = '' as $$
  select jsonb_build_object(
    'id', d.id,
    'author_id', d.author_id,
    'image_path', d.image_path,
    'thumb_path', d.thumb_path,
    'mood', d.mood,
    'caption', d.caption,
    'day_key', d.day_key::text,
    'created_at', extract(epoch from d.created_at)::double precision
  )
$$;

-- Everything the home screen and the widgets need, in one round trip.
create or replace function public.widget_state(p_user uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_me public.profiles;
  v_partner public.profiles;
  v_couple public.couples;
  v_my_drop public.drops;
  v_partner_drop public.drops;
begin
  select * into v_me from public.profiles where id = p_user;
  if v_me.id is null then
    return null;
  end if;
  if v_me.couple_id is not null then
    select * into v_couple from public.couples where id = v_me.couple_id;
    select * into v_partner from public.profiles
      where id = case when v_couple.user_a = p_user then v_couple.user_b else v_couple.user_a end;
    select * into v_my_drop from public.drops
      where couple_id = v_couple.id and author_id = p_user order by created_at desc limit 1;
    select * into v_partner_drop from public.drops
      where couple_id = v_couple.id and author_id = v_partner.id order by created_at desc limit 1;
  end if;
  return jsonb_build_object(
    'me', jsonb_build_object(
      'id', v_me.id,
      'first_name', v_me.first_name,
      'reminder_hour', v_me.reminder_hour,
      'reminders_enabled', v_me.reminders_enabled),
    'partner', case when v_partner.id is null then null
               else jsonb_build_object('id', v_partner.id, 'first_name', v_partner.first_name) end,
    'couple', case when v_couple.id is null then null else jsonb_build_object(
      'id', v_couple.id,
      'streak', v_couple.streak,
      'best_streak', v_couple.best_streak,
      'streak_last_day', v_couple.streak_last_day::text,
      'started_on', v_couple.started_on::text,
      'reunion_on', v_couple.reunion_on::text) end,
    'premium', public.is_premium(p_user),
    'my_drop', case when v_my_drop.id is null then null else public.drop_json(v_my_drop) end,
    'partner_drop', case when v_partner_drop.id is null then null else public.drop_json(v_partner_drop) end
  );
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Triggers
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, first_name)
  values (
    new.id,
    left(coalesce(
      nullif(new.raw_user_meta_data ->> 'given_name', ''),
      split_part(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), ' ', 1)
    ), 30)
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.validate_profile() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
    raise exception 'INVALID_TIMEZONE' using errcode = '22023';
  end if;
  new.first_name := btrim(new.first_name);
  return new;
end $$;

create trigger profiles_validate
  before insert or update of timezone, first_name on public.profiles
  for each row execute function public.validate_profile();

create or replace function public.before_drop_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.couple_id is distinct from (select couple_id from public.profiles where id = new.author_id) then
    raise exception 'NOT_IN_COUPLE' using errcode = 'P0001';
  end if;
  -- Free plan: one selfie per (local) day. Morni+ couples post as much as they like.
  if not public.is_premium(new.author_id) and exists (
    select 1 from public.drops where author_id = new.author_id and day_key = new.day_key
  ) then
    raise exception 'DAILY_LIMIT' using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger drops_before_insert
  before insert on public.drops
  for each row execute function public.before_drop_insert();

-- A streak day counts once both partners posted on their own local day D.
create or replace function public.after_drop_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_couple public.couples;
  v_streak integer;
begin
  if not exists (
    select 1 from public.drops
    where couple_id = new.couple_id and author_id <> new.author_id and day_key = new.day_key
  ) then
    return new;
  end if;
  select * into v_couple from public.couples where id = new.couple_id for update;
  if v_couple.streak_last_day is not null and v_couple.streak_last_day >= new.day_key then
    return new;
  end if;
  v_streak := case when v_couple.streak_last_day = new.day_key - 1 then v_couple.streak + 1 else 1 end;
  update public.couples
     set streak = v_streak,
         best_streak = greatest(best_streak, v_streak),
         streak_last_day = new.day_key
   where id = new.couple_id;
  return new;
end $$;

create trigger drops_after_insert
  after insert on public.drops
  for each row execute function public.after_drop_insert();

-- ─────────────────────────────────────────────────────────────────────────────
-- RPCs called by the app (as the signed-in user)
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.home_state() returns jsonb
language sql stable security definer set search_path = '' as $$
  select public.widget_state(auth.uid())
$$;

create or replace function public.list_drops(p_before double precision default null, p_limit integer default 60)
returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(public.drop_json(d) order by d.created_at desc), '[]'::jsonb)
  from (
    select * from public.drops
    where couple_id = public.my_couple_id()
      and (p_before is null or created_at < to_timestamp(p_before))
    order by created_at desc
    limit least(greatest(p_limit, 1), 200)
  ) d
$$;

create or replace function public.create_invite() returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if v_uid is null then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if (select couple_id from public.profiles where id = v_uid) is not null then
    raise exception 'ALREADY_PAIRED' using errcode = 'P0001';
  end if;
  select code into v_code from public.invites where inviter = v_uid and expires_at > now();
  if v_code is not null then
    return v_code;
  end if;
  delete from public.invites where inviter = v_uid or expires_at <= now();
  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::integer, 1);
    end loop;
    begin
      insert into public.invites (code, inviter) values (v_code, v_uid);
      return v_code;
    exception when unique_violation then
      -- Code collision: draw another one.
    end;
  end loop;
end $$;

create or replace function public.accept_invite(p_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_inviter uuid;
  v_couple uuid;
begin
  if v_uid is null then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  select inviter into v_inviter from public.invites
   where code = upper(btrim(p_code)) and expires_at > now()
   for update;
  if v_inviter is null then
    raise exception 'INVITE_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_inviter = v_uid then
    raise exception 'INVITE_SELF' using errcode = 'P0001';
  end if;
  perform 1 from public.profiles where id in (v_uid, v_inviter) for update;
  if exists (select 1 from public.profiles where id in (v_uid, v_inviter) and couple_id is not null) then
    raise exception 'ALREADY_PAIRED' using errcode = 'P0001';
  end if;
  insert into public.couples (user_a, user_b) values (v_inviter, v_uid) returning id into v_couple;
  update public.profiles set couple_id = v_couple where id in (v_uid, v_inviter);
  delete from public.invites where inviter in (v_uid, v_inviter);
  return v_couple;
end $$;

create or replace function public.register_device(p_token text, p_environment text) returns void
language sql security definer set search_path = '' as $$
  insert into public.devices (token, user_id, environment, updated_at)
  values (lower(p_token), auth.uid(), p_environment, now())
  on conflict (token) do update
    set user_id = excluded.user_id, environment = excluded.environment, updated_at = now()
$$;

create or replace function public.unregister_device(p_token text) returns void
language sql security definer set search_path = '' as $$
  delete from public.devices where token = lower(p_token) and user_id = auth.uid()
$$;

create or replace function public.register_widget_key(p_key_hash text) returns void
language sql security definer set search_path = '' as $$
  insert into public.widget_keys (key_hash, user_id)
  values (lower(p_key_hash), auth.uid())
  on conflict (key_hash) do update set user_id = excluded.user_id
$$;

-- Public (anon) — used by the website to personalise invite link previews.
create or replace function public.invite_preview(p_code text) returns text
language sql stable security definer set search_path = '' as $$
  select nullif(p.first_name, '')
  from public.invites i
  join public.profiles p on p.id = i.inviter
  where i.code = upper(btrim(p_code)) and i.expires_at > now()
$$;

-- Service role only — hourly reminder job.
create or replace function public.due_reminders()
returns table (user_id uuid, locale text, partner_name text, token text, environment text)
language sql stable security definer set search_path = '' as $$
  select p.id, p.locale, coalesce(pp.first_name, ''), d.token, d.environment
  from public.profiles p
  join public.couples c on c.id = p.couple_id
  join public.profiles pp on pp.id = case when c.user_a = p.id then c.user_b else c.user_a end
  join public.devices d on d.user_id = p.id
  where p.reminders_enabled
    and extract(hour from now() at time zone p.timezone) = p.reminder_hour
    and not exists (
      select 1 from public.drops dr
      where dr.author_id = p.id and dr.day_key = (now() at time zone p.timezone)::date
    )
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Privileges & Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.invites enable row level security;
alter table public.drops enable row level security;
alter table public.reactions enable row level security;
alter table public.nudges enable row level security;
alter table public.devices enable row level security;
alter table public.widget_keys enable row level security;
alter table public.waitlist enable row level security;

revoke all on public.profiles, public.couples, public.invites, public.drops, public.reactions,
  public.nudges, public.devices, public.widget_keys, public.waitlist from anon, authenticated;

grant select on public.profiles, public.couples, public.drops, public.reactions to authenticated;
grant update (first_name, locale, timezone, reminder_hour, reminders_enabled) on public.profiles to authenticated;
grant update (started_on, reunion_on) on public.couples to authenticated;
grant insert on public.waitlist to anon, authenticated;

create policy "profiles: read self and partner" on public.profiles
  for select to authenticated
  using (id = auth.uid() or (couple_id is not null and couple_id = public.my_couple_id()));

create policy "profiles: update self" on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "couples: read own" on public.couples
  for select to authenticated using (id = public.my_couple_id());

create policy "couples: update own" on public.couples
  for update to authenticated
  using (id = public.my_couple_id()) with check (id = public.my_couple_id());

create policy "drops: read own couple" on public.drops
  for select to authenticated using (couple_id = public.my_couple_id());

create policy "reactions: read own couple" on public.reactions
  for select to authenticated
  using (exists (select 1 from public.drops d where d.id = drop_id and d.couple_id = public.my_couple_id()));

create policy "waitlist: anyone can join" on public.waitlist
  for insert to anon, authenticated with check (true);

-- Functions: PUBLIC can execute by default, so lock everything down first.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.my_couple_id() to authenticated;
grant execute on function public.home_state() to authenticated;
grant execute on function public.list_drops(double precision, integer) to authenticated;
grant execute on function public.create_invite() to authenticated;
grant execute on function public.accept_invite(text) to authenticated;
grant execute on function public.register_device(text, text) to authenticated;
grant execute on function public.unregister_device(text) to authenticated;
grant execute on function public.register_widget_key(text) to authenticated;
grant execute on function public.invite_preview(text) to anon, authenticated;
grant execute on all functions in schema public to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage: private bucket, one folder per couple: drops/<couple_id>/<uuid>.jpg
-- ─────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('drops', 'drops', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

create policy "drops bucket: couple can upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'drops' and (storage.foldername(name))[1] = public.my_couple_id()::text);

create policy "drops bucket: couple can read" on storage.objects
  for select to authenticated
  using (bucket_id = 'drops' and (storage.foldername(name))[1] = public.my_couple_id()::text);
