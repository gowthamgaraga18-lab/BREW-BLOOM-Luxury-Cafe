import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin authentication — server-side only.
 * HMAC-signed httpOnly session cookie (functional equivalent of Supabase Auth
 * for admin access). Passwords hashed with scrypt.
 */

const SECRET =
  process.env.ADMIN_SESSION_SECRET || "dev-only-insecure-secret-change-me";
const COOKIE_NAME = "bb_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type AdminSession = {
  sub: string;
  email: string;
  name: string;
  role: string;
  exp: number;
};

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}
function b64urlDecode(input: string): Buffer {
  return Buffer.from(input, "base64url");
}

export function createSessionToken(payload: Omit<AdminSession, "exp">): string {
  const body: AdminSession = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const data = b64url(JSON.stringify(body));
  const sig = b64url(crypto.createHmac("sha256", SECRET).update(data).digest());
  return `${data}.${sig}`;
}

export function verifySessionToken(token: string): AdminSession | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = b64url(
    crypto.createHmac("sha256", SECRET).update(data).digest()
  );
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length === 0 || sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const body = JSON.parse(b64urlDecode(data).toString("utf8")) as AdminSession;
    if (body.exp && body.exp < Math.floor(Date.now() / 1000)) return null;
    return body;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(
  payload: Omit<AdminSession, "exp">
): Promise<void> {
  const store = await cookies();
  const token = createSessionToken(payload);
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

/* Password hashing (scrypt) */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64).toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(test, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
