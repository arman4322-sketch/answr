import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, sessionUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  const user = await sessionUser(jar.get(AUTH_COOKIE)?.value);
  if (!user) return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });
  return NextResponse.json({ ok: true, authenticated: true, user: { id: user.id, email: user.email, name: user.name, workspaceId: user.workspaceId } });
}
