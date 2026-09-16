import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { runClassification } from "@/lib/live/classify";
import { getEnrichedMetrics } from "@/lib/live/enriched";

/* Classification trigger — runs the sentiment + topic pass over answers the
   sampler has already stored. Cheap and idempotent: it only classifies what is
   new, so re-running costs almost nothing.

   Auth: the dashboard cookie (a signed-in operator) OR the cron/ingest secret,
   so the nightly schedule can enrich each fresh sample automatically. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function secret(): string | undefined {
  return (process.env.CRON_SECRET ?? process.env.ANSWR_INGEST_SECRET)?.trim() || undefined;
}
function presented(req: Request): string | undefined {
  const m = (req.headers.get("authorization") ?? "").match(/^Bearer\s+(.+)$/i);
  return (m?.[1] ?? req.headers.get("x-cron-secret") ?? "").trim() || undefined;
}

async function authorized(req: Request): Promise<boolean> {
  const jar = await cookies();
  if (isUnlocked(jar.get(GATE_COOKIE)?.value)) return true;
  const s = secret();
  return !!s && presented(req) === s;
}

async function handle(req: Request) {
  if (!(await authorized(req))) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const report = await runClassification();
  return NextResponse.json({ ...report });
}

export async function POST(req: Request) {
  return handle(req);
}
export async function GET(req: Request) {
  // GET returns the current enriched state without spending anything.
  if (!(await authorized(req))) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const metrics = await getEnrichedMetrics();
  return NextResponse.json({ ok: true, ...metrics });
}
