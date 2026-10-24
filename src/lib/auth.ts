import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "formcraft_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function secret() {
  return process.env.AUTH_SECRET || "formcraft-dev-secret-change-me";
}

export function adminEmail() {
  return process.env.ADMIN_EMAIL || "admin@formcraft.local";
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD || "formcraft-admin";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function checkCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === adminEmail().toLowerCase() && password === adminPassword();
}

export function createSessionToken() {
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = Buffer.from(JSON.stringify({ e: adminEmail(), exp }), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  if (!/^[0-9a-f]+$/.test(sig)) return false;
  let data: { e?: string; exp?: number };
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return false;
  }
  if (typeof data.exp !== "number" || data.exp < Date.now()) return false;
  const expected = sign(payload);
  return (
    sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  );
}

export async function isAuthenticated() {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export async function setSessionCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    // Opt-in: only set Secure when serving over HTTPS, so plain-HTTP
    // self-hosted installs (http://raspberrypi.local:3000) can still sign in.
    secure: process.env.COOKIE_SECURE === "true",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
