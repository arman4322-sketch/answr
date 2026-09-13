import { NextResponse } from "next/server";
import { signup, sessionCookie } from "@/lib/auth";
import { GATE_COOKIE, gateToken } from "@/lib/gate";

/* Real account signup — creates a scrypt-hashed user + workspace in the data
   layer and issues a session cookie. Distinct from the demo passphrase gate. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { email?: string; password?: string; name?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }
  const result = await signup({ email: body.email ?? "", password: body.password ?? "", name: body.name });
  if (!result.ok) return NextResponse.json(result, { status: 400 });

  const res = NextResponse.json({ ok: true, user: { id: result.user.id, email: result.user.email, name: result.user.name, workspaceId: result.user.workspaceId } });
  res.cookies.set(sessionCookie(result.session.id));
  // Also grant demo access so the flow reaches /app after onboarding. The auth
  // session lives in a non-durable store (unreliable across serverless instances
  // until KV is configured), but the demo gate cookie is validated statelessly —
  // so signup → onboarding → dashboard works reliably. Real per-user tenancy is
  // the buyer's build (HANDOFF/LAUNCH_ROADMAP).
  res.cookies.set(GATE_COOKIE, gateToken(), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
