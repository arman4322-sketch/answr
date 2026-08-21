import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import {
  findUserByEmail,
  putUser,
  putSession,
  getSession,
  deleteSession,
  type User,
  type Session,
} from "@/lib/db/entities";
import { db, newId } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/gate";

/* Real authentication primitives — the hard, security-sensitive core built for
   real: scrypt password hashing (node:crypto, no dependency), opaque session
   tokens, and user/session records in the data layer (durable once KV is set).

   This is a complete, working account system (signup → login → session → logout),
   exercised by the /api/auth/* routes. It runs today with no accounts or keys.

   What it deliberately does NOT do yet: replace the demo passphrase gate that
   governs /app. That gate is edge middleware (proxy.ts) and validating a
   data-layer session there needs either a stateless JWT verifiable at the edge or
   a node-runtime layout guard — the documented final integration step. Keeping
   the gate as-is means the live demo keeps working while this system is ready to
   switch on. A security review is warranted before production use. */

export const AUTH_COOKIE = SESSION_COOKIE;
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, KEYLEN).toString("hex");
  return `scrypt$${salt}$${key}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, keyHex] = parts;
  const expected = Buffer.from(keyHex, "hex");
  const actual = scryptSync(password, salt, KEYLEN);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export interface SignupInput {
  email: string;
  password: string;
  name?: string;
  workspaceName?: string;
}

export type AuthResult = { ok: true; user: User; session: Session } | { ok: false; error: string };

export async function signup(input: SignupInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Enter a valid email." };
  if (!input.password || input.password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  if (await findUserByEmail(email)) return { ok: false, error: "An account with that email already exists." };

  const workspaceId = newId("ws");
  const user: User = {
    id: newId("user"),
    email,
    name: input.name?.trim() || email.split("@")[0],
    passwordHash: hashPassword(input.password),
    workspaceId,
    createdAt: Date.now(),
  };
  await putUser(user);
  const session = await createSession(user);
  return { ok: true, user, session };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { ok: false, error: "That email and password don't match." };
  }
  const session = await createSession(user);
  return { ok: true, user, session };
}

export async function createSession(user: User): Promise<Session> {
  const now = Date.now();
  const session: Session = {
    id: randomBytes(32).toString("base64url"),
    userId: user.id,
    workspaceId: user.workspaceId,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };
  return putSession(session);
}

export async function sessionUser(token: string | undefined): Promise<User | null> {
  if (!token) return null;
  const session = await getSession(token);
  if (!session || session.expiresAt < Date.now()) return null;
  return db().get<User>("users", session.userId);
}

export async function logout(token: string | undefined): Promise<void> {
  if (token) await deleteSession(token);
}

/** Cookie options for the session token. */
export function sessionCookie(token: string, maxAgeMs = SESSION_TTL_MS) {
  return {
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  };
}
