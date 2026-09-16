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
  /* Signup used to ALSO set the shared demo gate cookie, so that the flow could
     reach /app even if the session store lost the record. That is no longer
     needed — the proxy and the dashboard layout both accept a session on its own
     merit — and it was actively harmful: the gate cookie is stateless and lasts
     30 days, so anyone who signed up silently acquired permanent access to the
     demo workspace's data without ever knowing the passphrase, and kept it after
     logging out. An account gets its own workspace and nothing else. */
  return res;
}
