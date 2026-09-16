import { NextResponse } from "next/server";
import { MemoryStore, summarize, telemetry, type TelemetrySummary } from "@/lib/telemetry";
import { authorizedTenant, DEMO_WORKSPACE_ID } from "@/lib/tenant";

/* Read side of first-party telemetry — powers /app/live.
 *
 * WHY THIS IS AUTHENTICATED BUT NOT SPLIT PER WORKSPACE
 *
 * Telemetry rows are AI-crawler hits and AI-referral click-throughs observed on
 * THIS deployment: proxy.ts → /api/ingest for the bots, public/snippet.js →
 * /api/collect for the referrals. Neither writer knows, or could know, a
 * workspace — a GPTBot request for /pricing carries a user agent, a path and a
 * status code, and nothing that identifies a tenant. There is no key to split
 * on, so splitting the rows between workspaces would mean inventing an
 * attribution that the pipeline never captured. That is why the rows have no
 * workspace field, and it would be wrong to give them one here.
 *
 * So the fix is the other two halves:
 *
 *   1. Require an identified caller. This route used to be a wide-open public
 *      GET. Anonymous `curl /api/telemetry` returned the whole summary — every
 *      crawled path on the tracked site, which assistants fetched it and when,
 *      the referral sources, the last 25 raw events with their ids, and the
 *      store label naming the env var that selected the backend. The dashboard
 *      deliberately withholds exactly this from any workspace it does not
 *      belong to (see the note in lib/live/metrics), and this endpoint handed
 *      it to people with no workspace at all.
 *
 *   2. Serve the events only to the workspace they actually describe. The
 *      deployment's traffic belongs to the demo workspace — the brand this
 *      installation tracks and whose pages the crawlers hit. Any other tenant
 *      reads an empty summary rather than somebody else's traffic, which is the
 *      same rule lib/live/metrics and the Agent Analytics view already apply,
 *      so /app/live can no longer disagree with /app/agents.
 *
 * The response therefore carries an explicit `scope` block saying WHOSE traffic
 * the numbers describe and whether anything is attributed to this caller, so a
 * screen can state it outright instead of letting a reader assume the counts
 * are their own. Zero here means "nothing is attributed to you", never
 * "measured zero traffic".
 *
 * `store` stays a fact about the deployment, not about a tenant, so an
 * authorized caller gets the real backend either way. An unauthorized one is
 * told only about the empty throwaway store that answered them. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Who the events belong to and whether this caller is that party. */
type Scope = {
  workspaceId: string | null;
  via: "account" | "demo" | "none";
  /** true only when the captured events describe this caller's own property */
  attributed: boolean;
  /** one sentence a screen can print verbatim */
  note: string;
};

/** An empty read, served from a throwaway buffer — genuinely zero, not blanked. */
function emptySummary(): Promise<TelemetrySummary> {
  return summarize(new MemoryStore());
}

export async function GET() {
  const tenant = await authorizedTenant();

  if (!tenant) {
    const summary = await emptySummary();
    return NextResponse.json(
      {
        ...summary,
        ok: false,
        error: "Not authorized.",
        // Describes the empty store that answered THIS request. It deliberately
        // says nothing about which backend the deployment runs.
        store: { kind: "memory" as const, label: "Not authorized — no events served", durable: false, degraded: null },
        scope: {
          workspaceId: null,
          via: "none",
          attributed: false,
          note: "Sign in or unlock the demo to read this deployment's captured traffic.",
        } satisfies Scope,
      },
      { status: 401 },
    );
  }

  // The demo workspace is the brand this deployment tracks, so its pages are
  // the ones the captured crawlers and referrals actually hit.
  if (tenant.workspaceId === DEMO_WORKSPACE_ID) {
    const summary = await summarize();
    return NextResponse.json({
      ...summary,
      ok: true,
      scope: {
        workspaceId: tenant.workspaceId,
        via: tenant.via,
        attributed: true,
        note: "AI crawler hits and AI referrals observed on this deployment's own pages.",
      } satisfies Scope,
    });
  }

  // Any other tenant: nothing here is theirs. Report the empty read honestly,
  // and keep telling them the truth about the store backing the deployment.
  const summary = await emptySummary();
  return NextResponse.json({
    ...summary,
    ok: true,
    store: {
      kind: telemetry.kind,
      label: telemetry.label,
      durable: telemetry.durable,
      degraded: null,
    },
    scope: {
      workspaceId: tenant.workspaceId,
      via: tenant.via,
      attributed: false,
      note:
        "No traffic is attributed to this workspace. Crawler and referral capture records requests made to this deployment's own pages, and carries no workspace, so nothing here can be counted as yours.",
    } satisfies Scope,
  });
}
