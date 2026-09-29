// Emoji reactions on the partner's selfie, and "miss you" nudges.
import { handle, HttpError, isUUID, json, readJSON } from "../_shared/http.ts";
import { admin, profileWithPartner, requireUser } from "../_shared/supabase.ts";
import { pushToUser } from "../_shared/apns.ts";
import { asLocale, t } from "../_shared/i18n.ts";

type Body = { type: "reaction"; drop_id: string; emoji: string } | { type: "nudge" };

const EMOJIS = new Set(["❤️", "😍", "😂", "🥺", "🔥", "😘", "🫶", "😮"]);
const NUDGES_PER_DAY = 10;

Deno.serve(handle(async (req) => {
  const user = await requireUser(req);
  const body = await readJSON<Body>(req);
  const { me, partner } = await profileWithPartner(user.id);
  if (!me.couple_id || !partner) throw new HttpError(409, "NOT_PAIRED");
  const l = asLocale(partner.locale);

  if (body.type === "reaction") {
    if (!isUUID(body.drop_id) || !EMOJIS.has(body.emoji)) throw new HttpError(400, "BAD_REQUEST");
    const { data: drop } = await admin
      .from("drops").select("id, couple_id, author_id").eq("id", body.drop_id)
      .maybeSingle<{ id: string; couple_id: string; author_id: string }>();
    if (!drop || drop.couple_id !== me.couple_id || drop.author_id !== partner.id) {
      throw new HttpError(404, "DROP_NOT_FOUND");
    }
    const { error } = await admin
      .from("reactions")
      .upsert({ drop_id: drop.id, user_id: me.id, emoji: body.emoji, created_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    await pushToUser(partner.id, {
      aps: { alert: { body: t.reaction(me.first_name, body.emoji, l) }, sound: "default", "thread-id": "reactions" },
      type: "reaction",
      drop_id: drop.id,
      emoji: body.emoji,
    }, { collapseId: `reaction-${drop.id}` });
    return json({ ok: true });
  }

  if (body.type === "nudge") {
    const since = new Date(Date.now() - 86_400_000).toISOString();
    const { count } = await admin
      .from("nudges").select("id", { count: "exact", head: true })
      .eq("from_user", me.id).gte("created_at", since);
    if ((count ?? 0) >= NUDGES_PER_DAY) throw new HttpError(429, "TOO_MANY_NUDGES");
    const { error } = await admin.from("nudges").insert({ couple_id: me.couple_id, from_user: me.id });
    if (error) throw new Error(error.message);
    await pushToUser(partner.id, {
      aps: {
        alert: { title: t.nudge(me.first_name, l), body: t.nudgeBody(l) },
        sound: "default",
        "thread-id": "nudges",
      },
      type: "nudge",
    });
    return json({ ok: true });
  }

  throw new HttpError(400, "BAD_REQUEST");
}));
