import { NextResponse } from "next/server";
import { getJob } from "@/lib/sampler/job";
import { currentTenant, isWorkspaceId, DEMO_WORKSPACE_ID } from "@/lib/tenant";

/* Where this workspace's first-run job is now.
 *
 * Read-only and cheap: it spends nothing and starts nothing, so a screen can
 * poll it, and a page loaded fresh can tell whether a run is still going before
 * deciding to resume the step loop.
 *
 * `job` is null when this workspace has never started one — that is a state to
 * render honestly ("no run yet"), not an error.
 *
 * Auth and tenancy: identical to /api/runs/start. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// One record read.
export const maxDuration = 30;

function secret(): string | undefined {
  return (process.env.CRON_SECRET ?? process.env.ANSWR_INGEST_SECRET)?.trim() || undefined;
}
function presented(req: Request): string | undefined {
  const m = (req.headers.get("authorization") ?? "").match(/^Bearer\s+(.+)$/i);
  return (m?.[1] ?? req.headers.get("x-cron-secret") ?? "").trim() || undefined;
}

/** The workspace this call reads, or null when the caller is not authorized. */
async function workspaceFor(req: Request): Promise<string | null> {
  const tenant = await currentTenant();
  if (tenant.via !== "none") return tenant.workspaceId;
  const s = secret();
  if (!s || presented(req) !== s) return null;
  const named = new URL(req.url).searchParams.get("workspaceId");
  return isWorkspaceId(named) ? named : DEMO_WORKSPACE_ID;
}

export async function GET(req: Request) {
  const workspaceId = await workspaceFor(req);
  if (!workspaceId) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, job: await getJob(workspaceId) });
}
