import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { createAction, listActions } from "@/lib/db/entities";
import { db } from "@/lib/db";

/* Action-item write path. Persists actions created from prompts/insights (durable
   once KV is set). Gated behind the demo access cookie; single "demo" workspace
   until real auth lands. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WORKSPACE = "demo";

export async function POST(req: Request) {
  const jar = await cookies();
  if (!isUnlocked(jar.get(GATE_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  let title = "";
  let impact = "";
  let effort = "";
  try {
    const body = (await req.json()) as { title?: string; impact?: string; effort?: string };
    title = (body.title ?? "").trim().slice(0, 200);
    impact = (body.impact ?? "").trim().slice(0, 60);
    effort = (body.effort ?? "").trim().slice(0, 60);
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }
  if (!title) return NextResponse.json({ ok: false, error: "A title is required." }, { status: 400 });

  const action = await createAction(WORKSPACE, { title, impact, effort });
  const total = (await listActions(WORKSPACE)).length;
  return NextResponse.json({ ok: true, id: action.id, total, durable: db().durable });
}

export async function GET() {
  const jar = await cookies();
  if (!isUnlocked(jar.get(GATE_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const actions = await listActions(WORKSPACE);
  return NextResponse.json({ ok: true, count: actions.length, actions, durable: db().durable });
}
