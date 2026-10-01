// Hourly job: reminds users whose local reminder hour is now and who haven't posted today.
// Triggered by .github/workflows/cron.yml (or pg_cron) with the x-cron-secret header.
import { handle, HttpError, json } from "../_shared/http.ts";
import { admin } from "../_shared/supabase.ts";
import { type Device, pushToDevices } from "../_shared/apns.ts";
import { asLocale, t } from "../_shared/i18n.ts";

type Row = { user_id: string; locale: string; partner_name: string; token: string; environment: Device["environment"] };

Deno.serve(handle(async (req) => {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) throw new HttpError(401, "UNAUTHORIZED");

  const { data, error } = await admin.rpc("due_reminders");
  if (error) throw new Error(error.message);

  const byUser = new Map<string, { locale: string; partner: string; devices: Device[] }>();
  for (const row of (data ?? []) as Row[]) {
    const entry = byUser.get(row.user_id) ?? { locale: row.locale, partner: row.partner_name, devices: [] };
    entry.devices.push({ token: row.token, environment: row.environment });
    byUser.set(row.user_id, entry);
  }

  let delivered = 0;
  for (const { locale, partner, devices } of byUser.values()) {
    const l = asLocale(locale);
    delivered += await pushToDevices(devices, {
      aps: { alert: { body: t.reminder(partner, l) }, sound: "default", "thread-id": "reminders" },
      type: "reminder",
    }, { collapseId: "reminder" });
  }
  return json({ users: byUser.size, delivered });
}));
