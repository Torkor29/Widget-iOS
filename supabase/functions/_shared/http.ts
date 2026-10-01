export class HttpError extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-widget-key",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...cors },
  });
}

/** Wraps a handler: CORS preflight, JSON errors as `{ error: CODE }`. */
export function handle(fn: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    try {
      return await fn(req);
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.code }, e.status);
      const message = e instanceof Error ? e.message : String(e);
      for (const code of ["DAILY_LIMIT", "NOT_IN_COUPLE", "INVITE_NOT_FOUND", "INVITE_SELF", "ALREADY_PAIRED"]) {
        if (message.includes(code)) return json({ error: code }, code === "DAILY_LIMIT" ? 402 : 409);
      }
      console.error(e);
      return json({ error: "INTERNAL" }, 500);
    }
  };
}

export async function readJSON<T>(req: Request): Promise<T> {
  try {
    return await req.json() as T;
  } catch {
    throw new HttpError(400, "BAD_REQUEST");
  }
}

export const isUUID = (v: unknown): v is string =>
  typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
