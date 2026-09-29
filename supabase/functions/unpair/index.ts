// Ends the connection: deletes the couple, its selfies and their photos for both partners.
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
  return json({ ok: true });
}));
