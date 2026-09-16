import { NextResponse } from "next/server";
import { authorizedTenant } from "@/lib/tenant";
import { getLiveMetrics } from "@/lib/live/metrics";

/* Live metrics — every dashboard figure, computed from real sampled answers.
   Server components can call getLiveMetrics() directly; this endpoint serves
   client components and makes the live data inspectable. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Any identified caller: an account session, or the demo passphrase.
  if (!(await authorizedTenant())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const metrics = await getLiveMetrics();
  return NextResponse.json({ ok: true, ...metrics });
}
