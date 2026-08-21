import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, logout } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const jar = await cookies();
  await logout(jar.get(AUTH_COOKIE)?.value);
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: AUTH_COOKIE, value: "", httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
