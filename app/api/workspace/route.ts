import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { getWorkspace, saveWorkspace, defaultPromptsFor } from "@/lib/workspace";

/* The active workspace — which brand this deployment tracks. Configured here
   (or via onboarding); every dashboard reads it. Replaces the hard-coded demo
   brand entirely. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cap = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

export async function GET() {
  const ws = await getWorkspace();
  return NextResponse.json({ ok: true, configured: !!ws, workspace: ws });
}

export async function POST(req: Request) {
  const jar = await cookies();
  if (!isUnlocked(jar.get(GATE_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const brand = cap(body.brand, 80);
  if (!brand) return NextResponse.json({ ok: false, error: "Brand is required." }, { status: 400 });
  const domain = cap(body.domain, 120).replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  const category = cap(body.category, 120);
  const competitors = Array.isArray(body.competitors)
    ? body.competitors.map((c) => cap(c, 60)).filter(Boolean).slice(0, 10)
    : [];
  const prompts = Array.isArray(body.prompts) && body.prompts.length
    ? body.prompts.map((p) => cap(p, 300)).filter(Boolean).slice(0, 25)
    : defaultPromptsFor(brand, category);

  const ws = await saveWorkspace({ brand, domain, category, competitors, prompts });
  return NextResponse.json({ ok: true, workspace: ws });
}
