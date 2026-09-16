import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { getLiveMetrics } from "@/lib/live/metrics";

/* Live metrics — every dashboard figure, computed from real sampled answers.
   Server components can call getLiveMetrics() directly; this endpoint serves
   client components and makes the live data inspectable. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  if (!isUnlocked(jar.get(GATE_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const metrics = await getLiveMetrics();
  return NextResponse.json({ ok: true, ...metrics });
}
