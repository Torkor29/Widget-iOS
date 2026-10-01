// In-app account deletion (App Store guideline 5.1.1(v)).
import { handle, json } from "../_shared/http.ts";
import { admin, deleteCouplePhotos, profileWithPartner, requireUser } from "../_shared/supabase.ts";

Deno.serve(handle(async (req) => {
  const user = await requireUser(req);
  const { me } = await profileWithPartner(user.id);
  if (me.couple_id) {
    await deleteCouplePhotos(me.couple_id);
    const { error } = await admin.from("couples").delete().eq("id", me.couple_id);
    if (error) throw new Error(error.message);
  }
  // Cascades to profile, devices, widget keys, reactions and nudges.
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw new Error(error.message);
  return json({ ok: true });
}));
