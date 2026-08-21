import { NextResponse } from "next/server";
import { signup, sessionCookie } from "@/lib/auth";

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
  return res;
}
