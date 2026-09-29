import { createClient } from "@supabase/supabase-js";
import { HttpError } from "./http.ts";

const url = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

/** Service-role client: bypasses RLS. Only use after checking who the caller is. */
export const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Client acting as the caller, so RLS and auth.uid() apply. */
export function userClient(req: Request) {
  return createClient(url, anonKey, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function requireUser(req: Request) {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new HttpError(401, "UNAUTHORIZED");
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, "UNAUTHORIZED");
  return data.user;
}

export type Profile = { id: string; first_name: string; locale: string; couple_id: string | null };

export async function profileWithPartner(userId: string) {
  const { data: me, error } = await admin
    .from("profiles").select("id, first_name, locale, couple_id").eq("id", userId).single<Profile>();
  if (error || !me) throw new HttpError(404, "PROFILE_NOT_FOUND");
  if (!me.couple_id) return { me, partner: null as Profile | null };
  const { data: couple } = await admin
    .from("couples").select("user_a, user_b").eq("id", me.couple_id).single<{ user_a: string; user_b: string }>();
  const partnerId = couple ? (couple.user_a === userId ? couple.user_b : couple.user_a) : null;
  if (!partnerId) return { me, partner: null as Profile | null };
  const { data: partner } = await admin
    .from("profiles").select("id, first_name, locale, couple_id").eq("id", partnerId).single<Profile>();
  return { me, partner: partner ?? null };
}

/** Removes every stored photo of a couple (storage objects are not cascaded). */
export async function deleteCouplePhotos(coupleId: string) {
  const bucket = admin.storage.from("drops");
  for (;;) {
    const { data, error } = await bucket.list(coupleId, { limit: 1000 });
    if (error) throw error;
    if (!data || data.length === 0) return;
    const { error: removeError } = await bucket.remove(data.map((f) => `${coupleId}/${f.name}`));
    if (removeError) throw removeError;
  }
}
