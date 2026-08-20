import { NextResponse } from "next/server";
import { GATE_COOKIE, DEMO_EMAIL, demoPassword, gateToken } from "@/lib/gate";

/* Demo gate sign-in. Verifies the shared passphrase SERVER-SIDE and sets an
   HTTP-only cookie — the previous build compared strings in the browser and
   simply router.push()ed, which meant /app/* was reachable by typing the URL.

   Not authentication: no accounts, no per-user session. See lib/gate.ts. */

export async function POST(request: Request) {
  let email = "";
  let password = "";
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    email = (body.email ?? "").trim().toLowerCase();
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  if (email !== DEMO_EMAIL || password !== demoPassword()) {
    // Deliberately vague: one message for both fields.
    return NextResponse.json({ ok: false, error: "That email and password don't match." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(GATE_COOKIE, gateToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

/** Sign out — used by the account menu's Log out. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(GATE_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
