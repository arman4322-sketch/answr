import { NextResponse } from "next/server";
import { getWorkspace, saveWorkspace, identityOf } from "@/lib/workspace";
import { resolveIdentity, identitySummary } from "@/lib/brand/identity";
import { observedConflicts, runEntityVerification, brandMatcher, clearEntityVerdicts } from "@/lib/live/entity";
import { answerStore } from "@/lib/sampler/store";
import { namesBrand, firstBrandIndex } from "@/lib/brand/match";
import { authorizedTenant, currentWorkspaceId, isWorkspaceId, DEMO_WORKSPACE_ID } from "@/lib/tenant";

/* Re-resolve the tracked brand's identity, then re-check the answers already
   collected against it.
 *
 * Run this when the brand or website changes, and whenever the numbers look
 * like they might be about someone else. It does three things in order:
 *
 *   1. Mines collisions out of the answers already sampled — a cited domain
 *      carrying the brand's name that is not the brand's own site.
 *   2. Re-reads the website and searches the live web for anything else of the
 *      same name, folding in what step 1 found.
 *   3. Re-runs entity verification, so the stored answers are re-judged
 *      against the new profile and every dashboard updates.
 *
 * Auth: the dashboard cookie, or the cron/ingest secret.
 *
 * Tenancy: a cookie-authenticated call is a real request and resolves its own
 * workspace — an account's, or the demo's for a passphrase visitor. A
 * secret-authenticated call is a script or a cron with no session at all, so
 * there is nothing to resolve: it acts on the DEMO workspace unless the caller
 * names another one as `?workspaceId=`, validated with isWorkspaceId. */

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

export async function GET(req: Request) {
  const via = await authorized(req);
  if (!via) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const workspaceId = await workspaceFor(req, via);
  const ws = await getWorkspace(workspaceId);
  if (!ws) return NextResponse.json({ ok: false, error: "No workspace configured." }, { status: 400 });
  const identity = identityOf(ws);
  const [observed, audit] = await Promise.all([
    observedConflicts(identity, workspaceId),
    auditMentions(identity, workspaceId),
  ]);
  return NextResponse.json({
    ok: true,
    identity,
    summary: identitySummary(identity),
    observed,
    audit,
  });
}

/** Every answer whose text contains the brand name, and the call made on it —
 *  the receipt behind "16 answers named Answr but meant someone else". */
async function auditMentions(identity: Awaited<ReturnType<typeof identityOf>>, workspaceId: string) {
  const isBrand = await brandMatcher(identity, workspaceId);
  const runs = await answerStore(workspaceId).recentRuns(500);
  // Match on every name and alias, the same set the scorer uses. Matching
  // identity.name alone reports "0 answers named the brand" for any workspace
  // whose detected name is its legal name rather than the one people write.
  const named = (text: string) => namesBrand(text, identity);

  const rows: {
    prompt: string; provider: string; verdict: string; verified: boolean; reason: string; excerpt: string;
  }[] = [];
  for (const run of runs) {
    for (const a of run.answers) {
      if (a.error || !a.text || !named(a.text)) continue;
      const e = isBrand.explain(run.id, a);
      const at = Math.max(0, firstBrandIndex(a.text, identity));
      rows.push({
        prompt: run.prompt,
        provider: a.provider,
        verdict: e.verdict,
        verified: e.verified,
        reason: e.reason,
        excerpt: a.text.slice(Math.max(0, at - 90), at + 180).replace(/\s+/g, " ").trim(),
      });
    }
  }
  return {
    answersNamingTheBrand: rows.length,
    countedAsBrand: rows.filter((r) => r.verdict === "brand").length,
    otherEntity: rows.filter((r) => r.verdict === "other-entity").length,
    rows: rows.slice(0, 60),
  };
}

export async function POST(req: Request) {
  const via = await authorized(req);
  if (!via) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  // Resolve the tenant once; every read and write below uses this id.
  const workspaceId = await workspaceFor(req, via);
  const ws = await getWorkspace(workspaceId);
  if (!ws) return NextResponse.json({ ok: false, error: "No workspace configured." }, { status: 400 });
  if (!ws.domain) {
    return NextResponse.json(
      { ok: false, error: "This workspace has no website. Add one in Settings — the domain is what identifies the brand." },
      { status: 400 },
    );
  }

  const before = identityOf(ws);
  const observed = await observedConflicts(before, workspaceId);

  const identity = await resolveIdentity({
    name: ws.brand,
    url: ws.domain,
    category: ws.category,
    knownConflicts: observed.map(({ name, what, domain }) => ({ name, what, domain })),
  });

  const saved = await saveWorkspace({
    brand: ws.brand,
    domain: ws.domain,
    category: ws.category || identity.category,
    competitors: ws.competitors,
    prompts: ws.prompts,
    identity,
    workspaceId,
  });

  // Verdicts were judgements about the OLD profile; they say nothing about the
  // new one. Discard them, then re-judge every stored answer from scratch.
  const discarded = await clearEntityVerdicts(workspaceId);
  const verification = await runEntityVerification({ workspaceId });

  return NextResponse.json({
    ok: true,
    identity,
    summary: identitySummary(identity),
    ambiguous: identity.ambiguous,
    observed,
    wasAmbiguous: before.ambiguous,
    discardedVerdicts: discarded,
    verification,
    audit: await auditMentions(identity, workspaceId),
    workspace: saved,
  });
}
