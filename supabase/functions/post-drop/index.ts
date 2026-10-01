// Records a selfie the app already uploaded to storage, then pushes it to the partner.
import { handle, HttpError, json, readJSON } from "../_shared/http.ts";
import { admin, profileWithPartner, requireUser } from "../_shared/supabase.ts";
import { pushToUser } from "../_shared/apns.ts";
import { asLocale, MOOD_IDS, t } from "../_shared/i18n.ts";

type Body = {
  image_path: string;
  thumb_path: string;
  mood?: string | null;
  caption?: string | null;
  day_key: string;
};

const DAY_MS = 86_400_000;

Deno.serve(handle(async (req) => {
  const user = await requireUser(req);
  const body = await readJSON<Body>(req);
  const { me, partner } = await profileWithPartner(user.id);
  if (!me.couple_id || !partner) throw new HttpError(409, "NOT_PAIRED");

  const pathPattern = new RegExp(`^${me.couple_id}/[0-9A-Za-z_-]{1,80}\\.jpg$`, "i");
  if (!pathPattern.test(body.image_path ?? "") || !pathPattern.test(body.thumb_path ?? "")) {
    throw new HttpError(400, "BAD_PATH");
  }
  const mood = body.mood ?? null;
  if (mood !== null && !MOOD_IDS.includes(mood)) throw new HttpError(400, "BAD_MOOD");
  const caption = typeof body.caption === "string" ? body.caption.trim().slice(0, 40) || null : null;

  // The client sends its local calendar day; it can't be more than a day off UTC.
  const day = /^\d{4}-\d{2}-\d{2}$/.test(body.day_key ?? "") ? Date.parse(`${body.day_key}T00:00:00Z`) : NaN;
  const today = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(day) || Math.abs(day - today) > DAY_MS) throw new HttpError(400, "BAD_DAY");

  const { data: drop, error } = await admin
    .from("drops")
    .insert({
      couple_id: me.couple_id,
      author_id: me.id,
      image_path: body.image_path,
      thumb_path: body.thumb_path,
      mood,
      caption,
      day_key: body.day_key,
    })
    .select("id, created_at")
    .single<{ id: string; created_at: string }>();
  if (error) throw new Error(error.message);

  const { count } = await admin
    .from("drops")
    .select("id", { count: "exact", head: true })
    .eq("author_id", partner.id)
    .eq("day_key", body.day_key);
  const { data: signed } = await admin.storage.from("drops").createSignedUrl(body.thumb_path, 60 * 60);
  const createdAt = Date.parse(drop.created_at) / 1000;
  const l = asLocale(partner.locale);

  // mutable-content lets the Notification Service Extension download the photo,
  // update the partner's widget and attach the image to the notification.
  await pushToUser(partner.id, {
    aps: {
      alert: { title: t.dropTitle(me.first_name, mood, l), body: t.dropBody((count ?? 0) > 0, l) },
      sound: "default",
      "mutable-content": 1,
      "thread-id": "drops",
    },
    type: "drop",
    drop: {
      id: drop.id,
      author_id: me.id,
      author_name: me.first_name,
      mood,
      caption,
      day_key: body.day_key,
      created_at: createdAt,
      image_path: body.image_path,
      thumb_path: body.thumb_path,
    },
    thumb_url: signed?.signedUrl ?? null,
  }, { collapseId: `drop-${me.id}` });

  return json({ id: drop.id, created_at: createdAt });
}));
