import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { getProvider } from "@/lib/providers/registry";
import type { ProviderId } from "@/lib/providers/types";

/* Connection test for the Settings › Integrations page. Makes ONE real, minimal
   provider call so the operator can confirm a key works. Gated behind the demo
   access cookie so it can't be used anonymously to spend a configured key. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const jar = await cookies();
  if (!isUnlocked(jar.get(GATE_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  let id: ProviderId | undefined;
  try {
    id = ((await req.json()) as { provider?: ProviderId }).provider;
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const provider = id ? getProvider(id) : undefined;
  if (!provider) return NextResponse.json({ ok: false, error: "Unknown provider." }, { status: 400 });
  if (!provider.isConfigured()) {
    return NextResponse.json({ ok: false, error: `Not configured — set ${provider.envVars.join(" / ")}.` });
  }

  try {
    const r = await provider.sample("Give a one-sentence test answer.", { timeoutMs: 20_000 });
    return NextResponse.json({
      ok: true,
      model: r.model,
      citations: r.citations.length,
      preview: r.text.slice(0, 160),
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
}
