// Read-only feed for the home-screen widget, authenticated by a per-install
// widget key (the widget can't share the app's rotating Supabase session).
import { handle, HttpError, json } from "../_shared/http.ts";
import { admin } from "../_shared/supabase.ts";

type DropJSON = { thumb_path: string } | null;
type State = { my_drop: DropJSON; partner_drop: DropJSON } | null;

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(handle(async (req) => {
  const key = req.headers.get("x-widget-key") ?? "";
  if (key.length < 32 || key.length > 128) throw new HttpError(401, "UNAUTHORIZED");

  const { data: row } = await admin
    .from("widget_keys").select("user_id").eq("key_hash", await sha256Hex(key))
    .maybeSingle<{ user_id: string }>();
  if (!row) throw new HttpError(401, "UNAUTHORIZED");

  const { data: state, error } = await admin.rpc("widget_state", { p_user: row.user_id });
  if (error) throw new Error(error.message);
  const s = state as State;

  const paths = [s?.my_drop?.thumb_path, s?.partner_drop?.thumb_path].filter((p): p is string => !!p);
  let signed: { path: string | null; signedUrl: string }[] = [];
  if (paths.length > 0) {
    const { data } = await admin.storage.from("drops").createSignedUrls(paths, 60 * 60);
    signed = data ?? [];
  }
  const urlFor = (path?: string) => (path ? signed.find((x) => x.path === path)?.signedUrl ?? null : null);

  return json({
    state: s,
    my_thumb_url: urlFor(s?.my_drop?.thumb_path),
    partner_thumb_url: urlFor(s?.partner_drop?.thumb_path),
  });
}));
