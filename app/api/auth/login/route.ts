import { NextResponse } from "next/server";
import { login, sessionCookie } from "@/lib/auth";
import { GATE_COOKIE, gateToken } from "@/lib/gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }
  const result = await login(body.email ?? "", body.password ?? "");
  if (!result.ok) return NextResponse.json(result, { status: 401 });

  const res = NextResponse.json({ ok: true, user: { id: result.user.id, email: result.user.email, name: result.user.name, workspaceId: result.user.workspaceId } });
  res.cookies.set(sessionCookie(result.session.id));
  // Grant demo access too (stateless gate cookie) so /app is reachable even when
  // the non-durable session store can't be read across instances. See signup route.
  res.cookies.set(GATE_COOKIE, gateToken(), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
