import "server-only";

// Minimal Supabase REST access with the public anon key (RLS applies).
const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
const anonKey = process.env.SUPABASE_ANON_KEY;

function headers(extra: Record<string, string> = {}) {
  return { apikey: anonKey ?? "", Authorization: `Bearer ${anonKey}`, "Content-Type": "application/json", ...extra };
}

/** First name of the person who created an invite code, if the code is valid. */
export async function invitePreview(code: string): Promise<string | null> {
  if (!url || !anonKey || !/^[A-Za-z2-9]{6}$/.test(code)) return null;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/invite_preview`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ p_code: code }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const name = (await res.json()) as string | null;
    return typeof name === "string" && name.trim() ? name.trim() : null;
  } catch {
    return null;
  }
}

export async function joinWaitlist(email: string, locale: string, source: string): Promise<"ok" | "invalid" | "error"> {
  if (!url || !anonKey) return "error";
  const res = await fetch(`${url}/rest/v1/waitlist`, {
    method: "POST",
    headers: headers({ Prefer: "return=minimal" }),
    body: JSON.stringify({ email: email.trim().toLowerCase(), locale, source }),
  });
  if (res.ok || res.status === 409) return "ok"; // 409: already on the list
  if (res.status === 400) return "invalid";
  return "error";
}
