// Runs the Supabase migrations against an in-process Postgres (PGlite) with
// minimal stand-ins for Supabase's auth/storage schemas, then exercises the
// main flows: invite → pair → drops → streak → daily limit → RLS.
// Usage: cd supabase/tests && npm i && npm test
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const db = new PGlite();

await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
  create schema auth;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
  grant usage on schema storage to anon, authenticated, service_role;
  grant all on storage.objects to authenticated;
`);

for (const f of readdirSync(join(here, '../migrations')).sort()) {
  await db.exec(readFileSync(join(here, '../migrations', f), 'utf8'));
}

const U1 = '11111111-1111-1111-1111-111111111111';
const U2 = '22222222-2222-2222-2222-222222222222';
const U3 = '33333333-3333-3333-3333-333333333333';

async function as(uid, sql, params = []) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false); set role ${uid ? 'authenticated' : 'anon'};`);
  try { return await db.query(sql, params); } finally { await db.exec('reset role;'); }
}
async function asService(sql, params = []) {
  await db.exec(`reset role; set role service_role;`);
  try { return await db.query(sql, params); } finally { await db.exec('reset role;'); }
}
async function rejects(promise, code) {
  await assert.rejects(promise, (e) => { assert.match(String(e.message), new RegExp(code)); return true; });
}
let passed = 0;
const ok = (name) => { passed++; console.log('✓', name); };

// Sign-up creates profiles from provider metadata.
await db.query(`insert into auth.users (id, raw_user_meta_data) values ($1, '{"full_name":"Léa Martin"}'), ($2, '{"given_name":"Tom"}'), ($3, '{}')`, [U1, U2, U3]);
const names = (await db.query('select id, first_name from public.profiles order by id')).rows.map((r) => r.first_name);
assert.deepEqual(names, ['Léa', 'Tom', '']);
ok('profiles created on sign-up with first names');

// Invite + pairing.
const code = (await as(U1, 'select public.create_invite() as code')).rows[0].code;
assert.match(code, /^[A-Z2-9]{6}$/);
assert.equal((await as(U1, 'select public.create_invite() as code')).rows[0].code, code);
ok('create_invite returns a stable 6-char code');
assert.equal((await as(null, 'select public.invite_preview($1) as n', [code.toLowerCase()])).rows[0].n, 'Léa');
ok('invite_preview works for anon');
await rejects(as(U1, 'select public.accept_invite($1)', [code]), 'INVITE_SELF');
await rejects(as(U2, 'select public.accept_invite($1)', ['ZZZZZZ']), 'INVITE_NOT_FOUND');
const couple = (await as(U2, 'select public.accept_invite($1) as id', [` ${code.toLowerCase()} `])).rows[0].id;
assert.ok(couple);
assert.equal((await db.query('select count(*)::int as n from public.invites')).rows[0].n, 0);
await rejects(as(U1, 'select public.create_invite()'), 'ALREADY_PAIRED');
ok('accept_invite pairs both users and consumes the invite');

// RLS: partner visibility.
assert.equal((await as(U1, 'select count(*)::int as n from public.profiles')).rows[0].n, 2);
assert.equal((await as(U3, 'select count(*)::int as n from public.profiles')).rows[0].n, 1);
assert.equal((await as(U3, 'select count(*)::int as n from public.couples')).rows[0].n, 0);
ok('RLS: users see themselves and their partner only');

// Column privileges.
await as(U1, `update public.profiles set first_name = ' Léa ', timezone = 'Europe/Paris', locale = 'fr' where id = $1`, [U1]);
assert.equal((await db.query('select first_name from public.profiles where id = $1', [U1])).rows[0].first_name, 'Léa');
await rejects(as(U1, `update public.profiles set premium_until = now() + interval '1 year' where id = $1`, [U1]), 'permission denied');
await rejects(as(U1, `update public.profiles set timezone = 'Mars/Olympus' where id = $1`, [U1]), 'INVALID_TIMEZONE');
await rejects(as(U1, `insert into public.drops (couple_id, author_id, image_path, thumb_path, day_key) values ($1, $2, 'x', 'y', '2026-09-01')`, [couple, U1]), 'permission denied');
ok('clients cannot grant themselves premium or insert drops directly');

// Drops + streak (inserted by Edge Functions with the service role).
const drop = (u, day) => asService(
  `insert into public.drops (couple_id, author_id, image_path, thumb_path, mood, day_key) values ($1, $2, $3, $4, 'sunny', $5) returning id`,
  [couple, u, `${couple}/${day}-${u}.jpg`, `${couple}/${day}-${u}_t.jpg`, day]);
const streak = async () => (await db.query('select streak, best_streak, streak_last_day::text as d from public.couples')).rows[0];
await drop(U1, '2026-09-01');
assert.equal((await streak()).streak, 0);
await drop(U2, '2026-09-01');
assert.deepEqual(await streak(), { streak: 1, best_streak: 1, d: '2026-09-01' });
await drop(U2, '2026-09-02'); await drop(U1, '2026-09-02');
assert.equal((await streak()).streak, 2);
await drop(U1, '2026-09-04'); await drop(U2, '2026-09-04');
assert.deepEqual(await streak(), { streak: 1, best_streak: 2, d: '2026-09-04' });
ok('streak counts days where both posted and resets after a gap');

// Daily limit, lifted when either partner is premium.
await rejects(drop(U1, '2026-09-04'), 'DAILY_LIMIT');
await db.query(`update public.profiles set premium_until = now() + interval '1 year' where id = $1`, [U2]);
await drop(U1, '2026-09-04');
ok('free daily limit, lifted by the partner\'s Morni+');

// Home state + history.
const home = (await as(U1, 'select public.home_state() as s')).rows[0].s;
assert.equal(home.partner.first_name, 'Tom');
assert.equal(home.premium, true);
assert.equal(home.couple.streak, 1);
assert.equal(home.partner_drop.day_key, '2026-09-04');
assert.equal(typeof home.my_drop.created_at, 'number');
assert.equal((await as(U1, 'select jsonb_array_length(public.list_drops()) as n')).rows[0].n, 7);
assert.equal((await as(U3, 'select jsonb_array_length(public.list_drops()) as n')).rows[0].n, 0);
assert.equal((await as(U3, 'select public.home_state() as s')).rows[0].s.couple, null);
ok('home_state and list_drops return the couple\'s data only');

// Devices, widget keys, storage policies.
await as(U1, `select public.register_device($1, 'production')`, ['ab'.repeat(32)]);
await as(U2, `select public.register_device($1, 'sandbox')`, ['AB'.repeat(32)]);
assert.equal((await db.query('select user_id from public.devices')).rows[0].user_id, U2);
await as(U1, `select public.register_widget_key($1)`, ['f'.repeat(64)]);
await as(U1, `insert into storage.objects (bucket_id, name) values ('drops', $1)`, [`${couple}/a.jpg`]);
await rejects(as(U3, `insert into storage.objects (bucket_id, name) values ('drops', $1)`, [`${couple}/b.jpg`]), 'row-level security');
assert.equal((await as(U3, `select count(*)::int as n from storage.objects`)).rows[0].n, 0);
await rejects(as(U1, 'select * from public.due_reminders()'), 'permission denied');
ok('devices, widget keys and storage policies');

// Reminders: users whose local hour matches and who haven't posted today.
const hour = (await db.query(`select extract(hour from now() at time zone 'Europe/Paris')::int as h`)).rows[0].h;
await db.query(`update public.profiles set reminder_hour = $1 where id = $2`, [hour, U1]);
await as(U1, `select public.register_device($1, 'production')`, ['cd'.repeat(32)]);
assert.equal((await asService('select * from public.due_reminders()')).rows.length, 1);
ok('due_reminders');

// Unpair: deleting the couple cascades drops and frees both profiles.
await db.query('delete from public.couples');
assert.equal((await db.query('select count(*)::int as n from public.drops')).rows[0].n, 0);
assert.equal((await db.query('select count(*)::int as n from public.profiles where couple_id is not null')).rows[0].n, 0);
ok('unpair cascades');

console.log(`\n${passed} checks passed`);
