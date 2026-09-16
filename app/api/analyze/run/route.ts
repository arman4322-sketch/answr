import { NextResponse } from "next/server";
import { runClassification } from "@/lib/live/classify";
import { runEntityVerification } from "@/lib/live/entity";
import { getEnrichedMetrics } from "@/lib/live/enriched";
import { authorizedTenant, currentWorkspaceId, isWorkspaceId, DEMO_WORKSPACE_ID } from "@/lib/tenant";

/* Analysis trigger — the enrichment pass over answers the sampler has already
   stored. Two stages, in order:

     1. Entity verification: for a brand whose name is shared with something
        else, decide which one each contested answer is about. Everything
        downstream depends on this, so it runs first.
     2. Classification: sentiment and topics, over the answers that survived.

   Cheap and idempotent: both stages only process what is new, so re-running
   costs almost nothing.

   Auth: the dashboard cookie (a signed-in operator) OR the cron/ingest secret,
   so the nightly schedule can enrich each fresh sample automatically.

   Tenancy: a cookie-authenticated call is a real request and resolves its own
   workspace — an account's, or the demo's for a passphrase visitor. A
   secret-authenticated call is a cron with no session at all, so there is
   nothing to resolve: it enriches the DEMO workspace unless the caller names
   another one as `?workspaceId=`, validated with isWorkspaceId. */

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

type Via = "cookie" | "secret";

async function authorized(req: Request): Promise<Via | null> {
  // An account session counts on its own merit. Checking the shared demo gate
  // cookie by hand used to be the ONLY cookie path here, which meant a
  // signed-in account could not use this endpoint at all once signup stopped
  // granting demo access.
  if (await authorizedTenant()) return "cookie";
  const s = secret();
  return !!s && presented(req) === s ? "secret" : null;
}

/** The workspace this call acts on. See the Tenancy note above. */
async function workspaceFor(req: Request, via: Via): Promise<string> {
  if (via === "cookie") return currentWorkspaceId();
  const named = new URL(req.url).searchParams.get("workspaceId");
  return isWorkspaceId(named) ? named : DEMO_WORKSPACE_ID;
}

async function handle(req: Request) {
  const via = await authorized(req);
  if (!via) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  // Resolve the tenant once; both stages enrich the SAME workspace.
  const workspaceId = await workspaceFor(req, via);
  // Order matters: classification reads the entity verdicts this pass writes.
  const entity = await runEntityVerification({ workspaceId });
  const report = await runClassification({ workspaceId });
  return NextResponse.json({ ...report, entity, workspaceId });
}

export async function POST(req: Request) {
  return handle(req);
}
export async function GET(req: Request) {
  // GET returns the current enriched state without spending anything.
  const via = await authorized(req);
  if (!via) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const metrics = await getEnrichedMetrics(await workspaceFor(req, via));
  return NextResponse.json({ ok: true, ...metrics });
}
