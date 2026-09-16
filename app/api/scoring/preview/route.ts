import { NextResponse } from "next/server";
import { answerStore, type PromptRun } from "@/lib/sampler/store";
import { scoreRuns } from "@/lib/scoring";
import { getWorkspace, identityOf } from "@/lib/workspace";
import { brandMatcher } from "@/lib/live/entity";
import { currentTenant } from "@/lib/tenant";

/* Scoring preview — the scoring engine run against THIS workspace.
 *
 * It used to score whatever answers the caller had sampled against a hard-coded
 * "Nike" and Nike's competitors, and fell back to a synthetic Nike example when
 * the store was empty. Both were fabrications: the screen printed a real-looking
 * visibility score for a company that has nothing to do with the workspace
 * looking at it. That was the last of the Nike fixtures.
 *
 * Now it resolves the caller's workspace and scores its brand, its domain and
 * its competitors — through the SAME entity matcher the dashboard uses
 * (lib/live/entity brandMatcher over lib/workspace identityOf), so this preview
 * cannot disagree with the dashboard about what counts as a mention. That
 * agreement is the whole point of the screen.
 *
 * There is no fallback example. A workspace that is not configured, or that has
 * no sampled answers yet, gets `configured` / `hasData` false and the client
 * renders an honest empty state rather than a zero that looks measured.
 *
 * Tenancy: the tenant is resolved once and the same id is threaded into the
 * answer store and the matcher. Auth is the caller's session or the demo gate. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const tenant = await currentTenant();
  if (tenant.via === "none") {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const workspaceId = tenant.workspaceId;

  const workspace = await getWorkspace(workspaceId);
  if (!workspace || !workspace.brand) {
    return NextResponse.json({ ok: true, configured: false, hasData: false, brand: null, runsScored: 0, scores: null });
  }

  // Headline metrics are the OVERALL picture, so segmented runs are excluded —
  // exactly as lib/live/metrics does it, for the same reason.
  const stored: PromptRun[] = await answerStore(workspaceId).recentRuns(200);
  const runs = stored.filter((r) => !r.segment);

  if (runs.length === 0) {
    return NextResponse.json({
      ok: true,
      configured: true,
      hasData: false,
      brand: workspace.brand,
      runsScored: 0,
      scores: null,
    });
  }

  const isBrand = await brandMatcher(identityOf(workspace), workspaceId);
  const scores = scoreRuns(runs, {
    brand: workspace.brand,
    brandDomain: workspace.domain,
    competitors: workspace.competitors,
    brandMatch: isBrand,
  });

  return NextResponse.json({
    ok: true,
    configured: true,
    hasData: true,
    brand: workspace.brand,
    runsScored: runs.length,
    scores,
  });
}
