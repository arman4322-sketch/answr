import { NextResponse } from "next/server";
import { startJob } from "@/lib/sampler/job";
import { currentTenant, isWorkspaceId, DEMO_WORKSPACE_ID } from "@/lib/tenant";

/* Start the first-run job for the caller's workspace.
 *
 * This is the "collect my first data" button at the end of onboarding, not the
 * nightly cron (that is /api/runs/execute, which does the whole pass in one
 * call because nobody is watching it). Here somebody IS watching, so this only
 * creates the job and the client drives it with /api/runs/step.
 *
 * Idempotent: a workspace already running a job gets that job back rather than
 * a second one, so a reload or a double click cannot double-spend credits.
 *
 * Auth: the caller's session or the demo gate, or the cron secret for machine
 * callers. Tenancy: a cookie call acts on its own workspace; a secret call has
 * no session to resolve, so it acts on the demo workspace unless it names
 * another with ?workspaceId=. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Reads the workspace and writes one record; it never samples.
export const maxDuration = 60;

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

  const result = await startJob(workspaceId);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, job: result.job });
}
