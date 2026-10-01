// Pairs the caller with the owner of an invite code and tells the inviter.
import { handle, HttpError, json, readJSON } from "../_shared/http.ts";
import { profileWithPartner, requireUser, userClient } from "../_shared/supabase.ts";
import { pushToUser } from "../_shared/apns.ts";
import { asLocale, t } from "../_shared/i18n.ts";

Deno.serve(handle(async (req) => {
  const user = await requireUser(req);
  const { code } = await readJSON<{ code?: string }>(req);
  if (typeof code !== "string" || code.trim().length !== 6) throw new HttpError(404, "INVITE_NOT_FOUND");

  const { data: coupleId, error } = await userClient(req).rpc("accept_invite", { p_code: code });
  if (error) throw new Error(error.message);

  const { me, partner } = await profileWithPartner(user.id);
  if (partner) {
    const l = asLocale(partner.locale);
    await pushToUser(partner.id, {
      aps: { alert: { title: t.joined(me.first_name, l), body: t.joinedBody(l) }, sound: "default" },
      type: "paired",
    });
  }
  return json({ couple_id: coupleId });
}));
