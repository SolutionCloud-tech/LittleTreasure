import "server-only";

/**
 * Where the store's data lives between requests.
 *
 * - With Upstash Redis configured (Vercel → Storage → Upstash Redis adds the
 *   env vars), the whole POC dataset is kept as one JSON document in Redis, so
 *   every server instance sees the same orders, stock and accounts.
 * - Without it (local dev), nothing is persisted and the store stays in memory.
 *
 * Talks to Upstash's REST API with plain fetch, so there's no extra dependency.
 */

const URL_ = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "little-treasures:db:v1";

export const persistenceEnabled = Boolean(URL_ && TOKEN);

async function redis<T>(command: (string | number)[]): Promise<T> {
  const res = await fetch(URL_!, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const body = (await res.json()) as { result?: T; error?: string };
  if (!res.ok || body.error) throw new Error(`Redis ${command[0]} failed: ${body.error ?? res.status}`);
  return body.result as T;
}

export async function loadSnapshot<T>(): Promise<T | null> {
  const raw = await redis<string | null>(["GET", KEY]);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function saveSnapshot<T>(data: T): Promise<void> {
  await redis(["SET", KEY, JSON.stringify(data)]);
}

/** Stores the first snapshot only if none exists yet, so two cold starts can't both seed. */
export async function seedSnapshot<T>(data: T): Promise<boolean> {
  return (await redis<string | null>(["SET", KEY, JSON.stringify(data), "NX"])) === "OK";
}
