import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getUser } from "./data/store";
import type { PublicUser } from "./types";

/**
 * Cookie sessions for shop customers.
 *
 * The cookie holds "<userId>.<expiresAt>.<signature>", signed with HMAC-SHA256,
 * so it can't be forged or extended without AUTH_SECRET. The admin login can
 * reuse these helpers later with its own cookie name and a role check.
 */

const COOKIE = "lt_session";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
    throw new Error("Set AUTH_SECRET before running the shop in production.");
  }
  return "little-treasures-dev-only-secret";
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("hex");

export function encodeSession(userId: string, expiresAt: number): string {
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

/** Returns the user id if the token is genuine and not expired. */
export function decodeSession(token: string | undefined, now = Date.now()): string | null {
  const parts = token?.split(".") ?? [];
  if (parts.length !== 3) return null;
  const [userId, expires, signature] = parts;
  const expected = Buffer.from(sign(`${userId}.${expires}`), "hex");
  const actual = Buffer.from(signature, "hex");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  if (!(Number(expires) > now)) return null;
  return userId;
}

export async function startSession(userId: string) {
  const store = await cookies();
  store.set(COOKIE, encodeSession(userId, Date.now() + MAX_AGE_SECONDS * 1000), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** The signed-in customer, or null. Safe to call from any server component. */
export async function currentUser(): Promise<PublicUser | null> {
  const id = decodeSession((await cookies()).get(COOKIE)?.value);
  return (id && (await getUser(id))) || null;
}

/** Only allow redirects back into this site, never to another domain. */
export function safeNext(next: string | null | undefined, fallback = "/account"): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}
