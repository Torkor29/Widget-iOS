// Apple Push Notification service over HTTP/2 with token-based (.p8) auth.
import { importPKCS8, SignJWT } from "jose";
import { admin } from "./supabase.ts";

const keyId = Deno.env.get("APNS_KEY_ID") ?? "";
const teamId = Deno.env.get("APNS_TEAM_ID") ?? "";
const bundleId = Deno.env.get("APNS_BUNDLE_ID") ?? "";
const privateKey = (Deno.env.get("APNS_PRIVATE_KEY") ?? "").replace(/\\n/g, "\n");

let cached: { token: string; issuedAt: number } | null = null;

async function providerToken(): Promise<string> {
  // Apple accepts tokens up to 60 min old and rejects refreshing more than every 20 min.
  if (cached && Date.now() - cached.issuedAt < 45 * 60_000) return cached.token;
  const key = await importPKCS8(privateKey, "ES256");
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt()
    .sign(key);
  cached = { token, issuedAt: Date.now() };
  return token;
}

export type Device = { token: string; environment: "sandbox" | "production" };

export type PushOptions = {
  collapseId?: string;
  threadId?: string;
};

async function send(device: Device, payload: Record<string, unknown>, opts: PushOptions) {
  const host = device.environment === "sandbox" ? "api.sandbox.push.apple.com" : "api.push.apple.com";
  const headers: Record<string, string> = {
    authorization: `bearer ${await providerToken()}`,
    "apns-topic": bundleId,
    "apns-push-type": "alert",
    "apns-priority": "10",
  };
  if (opts.collapseId) headers["apns-collapse-id"] = opts.collapseId;
  const res = await fetch(`https://${host}/3/device/${device.token}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (res.ok) return { ok: true as const };
  const reason = (await res.json().catch(() => ({}))).reason as string | undefined;
  return { ok: false as const, status: res.status, reason };
}

/** Sends a notification to every device of a user and prunes dead tokens. */
export async function pushToUser(
  userId: string,
  payload: Record<string, unknown>,
  opts: PushOptions = {},
): Promise<number> {
  if (!keyId || !teamId || !bundleId || !privateKey) {
    console.warn("APNs is not configured; skipping push");
    return 0;
  }
  const { data: devices } = await admin
    .from("devices").select("token, environment").eq("user_id", userId);
  return await pushToDevices(devices ?? [], payload, opts);
}

export async function pushToDevices(
  devices: Device[],
  payload: Record<string, unknown>,
  opts: PushOptions = {},
): Promise<number> {
  let delivered = 0;
  await Promise.all(devices.map(async (device) => {
    try {
      const result = await send(device, payload, opts);
      if (result.ok) {
        delivered++;
      } else if (result.status === 410 || result.reason === "BadDeviceToken" || result.reason === "Unregistered") {
        await admin.from("devices").delete().eq("token", device.token);
      } else {
        console.warn("APNs error", result.status, result.reason);
      }
    } catch (e) {
      console.error("APNs request failed", e);
    }
  }));
  return delivered;
}
