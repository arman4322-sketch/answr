import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { getWorkspace, saveWorkspace, identityOf } from "@/lib/workspace";
import { resolveIdentity, identitySummary } from "@/lib/brand/identity";
import { observedConflicts, runEntityVerification, brandMatcher, clearEntityVerdicts } from "@/lib/live/entity";
import { answerStore } from "@/lib/sampler/store";

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
 * Auth: the dashboard cookie, or the cron/ingest secret. */

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

export async function GET(req: Request) {
  if (!(await authorized(req))) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const ws = await getWorkspace();
  if (!ws) return NextResponse.json({ ok: false, error: "No workspace configured." }, { status: 400 });
  const identity = identityOf(ws);
  const [observed, audit] = await Promise.all([observedConflicts(identity), auditMentions(identity)]);
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
async function auditMentions(identity: Awaited<ReturnType<typeof identityOf>>) {
  const isBrand = await brandMatcher(identity);
  const runs = await answerStore().recentRuns(500);
  const esc = identity.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const named = new RegExp(`\\b${esc}\\b`, "i");

  const rows: {
    prompt: string; provider: string; verdict: string; verified: boolean; reason: string; excerpt: string;
  }[] = [];
  for (const run of runs) {
    for (const a of run.answers) {
      if (a.error || !a.text || !named.test(a.text)) continue;
      const e = isBrand.explain(run.id, a);
      const at = a.text.search(named);
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
  if (!(await authorized(req))) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const ws = await getWorkspace();
  if (!ws) return NextResponse.json({ ok: false, error: "No workspace configured." }, { status: 400 });
  if (!ws.domain) {
    return NextResponse.json(
      { ok: false, error: "This workspace has no website. Add one in Settings — the domain is what identifies the brand." },
      { status: 400 },
    );
  }

  const before = identityOf(ws);
  const observed = await observedConflicts(before);

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
  });

  // Verdicts were judgements about the OLD profile; they say nothing about the
  // new one. Discard them, then re-judge every stored answer from scratch.
  const discarded = await clearEntityVerdicts();
  const verification = await runEntityVerification();

  return NextResponse.json({
    ok: true,
    identity,
    summary: identitySummary(identity),
    ambiguous: identity.ambiguous,
    observed,
    wasAmbiguous: before.ambiguous,
    discardedVerdicts: discarded,
    verification,
    audit: await auditMentions(identity),
    workspace: saved,
  });
}
