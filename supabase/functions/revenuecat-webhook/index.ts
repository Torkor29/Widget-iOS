// RevenueCat → Supabase: keeps profiles.premium_until in sync so that one
// subscription unlocks Morni+ for both partners (see public.is_premium).
import { handle, HttpError, isUUID, json, readJSON } from "../_shared/http.ts";
import { admin } from "../_shared/supabase.ts";

const ENTITLEMENT = Deno.env.get("REVENUECAT_ENTITLEMENT") ?? "premium";
const FOREVER = "9999-12-31T00:00:00Z";

type RCEvent = {
  type: string;
  app_user_id?: string;
  original_app_user_id?: string;
  aliases?: string[];
  expiration_at_ms?: number | null;
  entitlement_ids?: string[] | null;
  cancel_reason?: string;
  transferred_from?: string[];
};

const userIds = (values: (string | undefined)[]) => [...new Set(values.filter(isUUID).map((v) => v.toLowerCase()))];

Deno.serve(handle(async (req) => {
  const expected = Deno.env.get("REVENUECAT_WEBHOOK_AUTH");
  const got = req.headers.get("Authorization") ?? "";
  if (!expected || (got !== expected && got !== `Bearer ${expected}`)) throw new HttpError(401, "UNAUTHORIZED");

  const { event } = await readJSON<{ event: RCEvent }>(req);
  if (!event?.type) throw new HttpError(400, "BAD_REQUEST");
  if (event.entitlement_ids && !event.entitlement_ids.includes(ENTITLEMENT)) return json({ ignored: true });

  let ids = userIds([event.app_user_id, event.original_app_user_id, ...(event.aliases ?? [])]);
  let until: string | null | undefined; // undefined = leave unchanged

  switch (event.type) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "PRODUCT_CHANGE":
    case "UNCANCELLATION":
    case "SUBSCRIPTION_EXTENDED":
    case "TEMPORARY_ENTITLEMENT_GRANT":
    case "NON_RENEWING_PURCHASE":
      until = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : FOREVER;
      break;
    case "EXPIRATION":
      until = new Date(event.expiration_at_ms ?? Date.now()).toISOString();
      break;
    case "CANCELLATION":
      // Auto-renew turned off keeps access until expiration; a refund ends it now.
      if (event.cancel_reason === "CUSTOMER_SUPPORT") until = new Date().toISOString();
      break;
    case "TRANSFER":
      ids = userIds(event.transferred_from ?? []);
      until = null;
      break;
  }

  if (until !== undefined && ids.length > 0) {
    const { error } = await admin.from("profiles").update({ premium_until: until }).in("id", ids);
    if (error) throw new Error(error.message);
  }
  return json({ ok: true, updated: until === undefined ? 0 : ids.length });
}));
