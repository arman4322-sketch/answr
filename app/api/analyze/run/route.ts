import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { runClassification } from "@/lib/live/classify";
import { runEntityVerification } from "@/lib/live/entity";
import { getEnrichedMetrics } from "@/lib/live/enriched";

/* Analysis trigger — the enrichment pass over answers the sampler has already
   stored. Two stages, in order:

     1. Entity verification: for a brand whose name is shared with something
        else, decide which one each contested answer is about. Everything
        downstream depends on this, so it runs first.
     2. Classification: sentiment and topics, over the answers that survived.

   Cheap and idempotent: both stages only process what is new, so re-running
   costs almost nothing.

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
  // Order matters: classification reads the entity verdicts this pass writes.
  const entity = await runEntityVerification();
  const report = await runClassification();
  return NextResponse.json({ ...report, entity });
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
