import { NextResponse } from "next/server";
import { stepJob } from "@/lib/sampler/job";
import { currentTenant, isWorkspaceId, DEMO_WORKSPACE_ID } from "@/lib/tenant";

/* One unit of the first-run job, then return.
 *
 * A unit is one prompt sampled across every connected lane, or the entity
 * verification stage, or the classification stage. The client calls this in a
 * loop until `done`. Keeping each request to one unit is what stops the pass
 * being killed by the platform's function timeout, and it is what makes the
 * progress on screen real rather than a spinner.
 *
 * Safe to call twice for the same step (a retry, a duplicated click): the job
 * engine re-reads the stored record before advancing, so a prompt is never
 * skipped and `doneCount` never passes the frozen denominator.
 *
 * Auth and tenancy: identical to /api/runs/start. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// One prompt across every lane, in parallel; a lane's own timeout is 30–60s.
export const maxDuration = 120;

function secret(): string | undefined {
  return (process.env.CRON_SECRET ?? process.env.ANSWR_INGEST_SECRET)?.trim() || undefined;
}
function presented(req: Request): string | undefined {
  const m = (req.headers.get("authorization") ?? "").match(/^Bearer\s+(.+)$/i);
  return (m?.[1] ?? req.headers.get("x-cron-secret") ?? "").trim() || undefined;
}

/** The workspace this call acts on, or null when the caller is not authorized. */
async function workspaceFor(req: Request): Promise<string | null> {
  const tenant = await currentTenant();
  if (tenant.via !== "none") return tenant.workspaceId;
  const s = secret();
  if (!s || presented(req) !== s) return null;
  const named = new URL(req.url).searchParams.get("workspaceId");
  return isWorkspaceId(named) ? named : DEMO_WORKSPACE_ID;
}

export async function POST(req: Request) {
  const workspaceId = await workspaceFor(req);
  if (!workspaceId) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    /* an empty body steps whatever job this workspace currently has */
  }
  const jobId = typeof body.jobId === "string" ? body.jobId.trim() : "";

  const result = await stepJob(workspaceId, jobId || undefined);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error, job: result.job ?? null }, { status: 400 });
  }
  return NextResponse.json({ ok: true, job: result.job, done: result.done });
}
