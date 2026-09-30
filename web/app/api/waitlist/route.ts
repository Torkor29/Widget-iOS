import { joinWaitlist } from "@/lib/supabase";
import { hasLocale } from "@/lib/site";

export async function POST(request: Request) {
  let body: { email?: unknown; locale?: unknown; source?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ status: "invalid" }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email : "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
    return Response.json({ status: "invalid" }, { status: 400 });
  }
  const locale = typeof body.locale === "string" && hasLocale(body.locale) ? body.locale : "en";
  const source = typeof body.source === "string" ? body.source.slice(0, 64) : "site";
  const status = await joinWaitlist(email, locale, source);
  return Response.json({ status }, { status: status === "ok" ? 200 : status === "invalid" ? 400 : 502 });
}
