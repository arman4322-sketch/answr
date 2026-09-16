import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, logout } from "@/lib/auth";
import { GATE_COOKIE } from "@/lib/gate";

/* Sign out — and actually sign out.
 *
 * This used to clear only the session cookie. Signup and login also set the
 * shared demo gate cookie, which is stateless and lasts 30 days, so a person who
 * logged out kept access to the demo workspace and its sampled data. Both
 * cookies go. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const expire = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 0 };

export async function POST() {
  const jar = await cookies();
  await logout(jar.get(AUTH_COOKIE)?.value);
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: AUTH_COOKIE, value: "", ...expire });
  res.cookies.set({ name: GATE_COOKIE, value: "", ...expire });
  return res;
}
