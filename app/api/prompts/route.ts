import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { addPrompt, listPrompts } from "@/lib/db/entities";
import { db } from "@/lib/db";

/* Tracked-prompt write path. Persists prompts a user adds (durable once KV is
   set) and feeds them to the sampler (lib/sampler/run reads these). Gated behind
   the demo access cookie. Without real auth yet, everything is scoped to a single
   "demo" workspace; real per-user workspace scoping arrives with lib/auth. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WORKSPACE = "demo";

export async function POST(req: Request) {
  const jar = await cookies();
  if (!isUnlocked(jar.get(GATE_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  let texts: string[] = [];
  try {
    const body = (await req.json()) as { prompts?: unknown };
    if (Array.isArray(body.prompts)) {
      texts = body.prompts.map((p) => String(p).trim()).filter(Boolean).slice(0, 500);
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }
  if (texts.length === 0) {
    return NextResponse.json({ ok: false, error: "No prompts provided." }, { status: 400 });
  }
  const added = [];
  for (const t of texts) added.push(await addPrompt(WORKSPACE, t.slice(0, 400)));
  const total = (await listPrompts(WORKSPACE)).length;
  return NextResponse.json({ ok: true, added: added.length, total, durable: db().durable });
}

export async function GET() {
  const jar = await cookies();
  if (!isUnlocked(jar.get(GATE_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const prompts = await listPrompts(WORKSPACE);
  return NextResponse.json({ ok: true, count: prompts.length, prompts, durable: db().durable });
}
