import { answerStore, type PromptRun } from "@/lib/sampler/store";
import { scoreRuns } from "@/lib/scoring";
import { getWorkspace, identityOf } from "@/lib/workspace";
import { brandMatcher } from "./entity";
import { ownedHosts } from "@/lib/brand/match";
import { trackedRegions, listAudiences } from "@/lib/segments/catalog";
import { currentWorkspaceId } from "@/lib/tenant";
import type { SegmentKind } from "@/lib/segments/types";

/* Segment metrics — visibility and share of voice sliced by where the question
   was asked from, or by who asked it.
 *
 * Every figure comes from the same scorer and the same entity matcher as the
 * headline numbers, run over the subset of stored runs carrying that segment's
 * tag. Nothing is modelled or interpolated: a segment with no sampled runs
 * reports hasData false and the screen says so rather than showing a zero that
 * looks like a measurement.
 *
 * The honesty that matters here is `nativeShare`. A regional answer is only a
 * real regional measurement when the lane searched from that region. Lanes
 * without a location parameter were told the location in the question instead,
 * and that is a different, weaker thing. Both are reported, never blended. */

export interface SegmentRow {
  id: string;
  label: string;
  /** the persona line, for audience segments */
  persona?: string;
  note?: string;
  hasData: boolean;
  prompts: number;
  answers: number;
  visibility: number;
  shareOfVoice: number;
  avgAnswerPosition: number | null;
  /** answers where the brand NAME appeared but meant another company */
  nameCollisions: number;
  /** leading brand in this segment by mentions, and its count */
  leader: { name: string; mentions: number; isBrand: boolean } | null;
  /** share of this segment's answers where the engine applied it natively */
  nativeShare: number;
  lastRunAt: number | null;
}

export interface SegmentMetrics {
  configured: boolean;
  kind: SegmentKind;
  /** true once at least one segment has sampled runs */
  hasData: boolean;
  /** segments configured but never sampled */
  pending: string[];
  rows: SegmentRow[];
  /** overall figures for the same prompts, for comparison */
  overall: { visibility: number; shareOfVoice: number; answers: number } | null;
  /**
   * How the segment reached the engines across every sampled answer:
   *   native — the lane searched from that location
   *   prompt — the location or persona was stated in the question
   */
  applied: { native: number; prompt: number };
  lastRunAt: number | null;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

const empty = (kind: SegmentKind, configured: boolean, pending: string[] = []): SegmentMetrics => ({
  configured,
  kind,
  hasData: false,
  pending,
  rows: [],
  overall: null,
  applied: { native: 0, prompt: 0 },
  lastRunAt: null,
});

export async function getSegmentMetrics(
  kind: SegmentKind,
  workspaceId?: string,
  limit = 2000,
): Promise<SegmentMetrics> {
  // Resolve the tenant once; every read below uses this id.
  const wsId = workspaceId ?? (await currentWorkspaceId());
  const [workspace, stored] = await Promise.all([getWorkspace(wsId), answerStore(wsId).recentRuns(limit)]);
  if (!workspace) return empty(kind, false);

  const definitions =
    kind === "region"
      ? (await trackedRegions(wsId)).map((r) => ({ id: r.id, label: r.label, persona: undefined, note: undefined }))
      : (await listAudiences(wsId)).map((a) => ({ id: a.id, label: a.label, persona: a.persona, note: a.note }));

  if (definitions.length === 0) return empty(kind, true);

  const identity = identityOf(workspace);
  const isBrand = await brandMatcher(identity, wsId);
  const scoreOpts = {
    brand: workspace.brand,
    brandDomain: workspace.domain,
    ownedDomains: ownedHosts(identity),
    competitors: workspace.competitors,
    brandMatch: isBrand,
  };

  const segmented = stored.filter((r) => r.segment?.kind === kind);
  const byId = new Map<string, PromptRun[]>();
  for (const run of segmented) {
    const id = run.segment!.id;
    byId.set(id, [...(byId.get(id) ?? []), run]);
  }

  let native = 0;
  let framed = 0;
  for (const run of segmented) {
    for (const a of run.answers) {
      if (a.error || !a.text) continue;
      if (a.applied === "native") native += 1;
      else if (a.applied === "prompt") framed += 1;
    }
  }

  const rows: SegmentRow[] = [];
  const pending: string[] = [];

  for (const def of definitions) {
    const runs = byId.get(def.id) ?? [];
    if (runs.length === 0) {
      pending.push(def.label);
      rows.push({
        ...def,
        hasData: false,
        prompts: 0,
        answers: 0,
        visibility: 0,
        shareOfVoice: 0,
        avgAnswerPosition: null,
        nameCollisions: 0,
        leader: null,
        nativeShare: 0,
        lastRunAt: null,
      });
      continue;
    }

    const s = scoreRuns(runs, scoreOpts);

    // Who leads this segment — the brand or a competitor — counted per answer,
    // on the same basis as share of voice.
    const answers = runs.flatMap((r) => r.answers.map((a) => ({ runId: r.id, a }))).filter(({ a }) => !a.error && a.text);
    const tally: { name: string; mentions: number; isBrand: boolean }[] = [
      { name: workspace.brand, isBrand: true, mentions: answers.filter(({ runId, a }) => isBrand(runId, a)).length },
      ...workspace.competitors.map((c) => ({
        name: c,
        isBrand: false,
        mentions: answers.filter(({ a }) => new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(a.text)).length,
      })),
    ].sort((a, b) => b.mentions - a.mentions);

    const nativeHere = answers.filter(({ a }) => a.applied === "native").length;

    rows.push({
      ...def,
      hasData: true,
      prompts: new Set(runs.map((r) => r.prompt)).size,
      answers: s.sampledAnswers,
      visibility: s.visibilityScore,
      shareOfVoice: s.shareOfVoice,
      avgAnswerPosition: s.avgAnswerPosition,
      nameCollisions: s.nameCollisions,
      leader: tally[0]?.mentions ? tally[0] : null,
      nativeShare: answers.length ? r1((nativeHere / answers.length) * 100) : 0,
      lastRunAt: Math.max(...runs.map((r) => r.ts)),
    });
  }

  rows.sort((a, b) => Number(b.hasData) - Number(a.hasData) || b.visibility - a.visibility);

  // Compare against the overall run restricted to the SAME prompts, so a
  // difference between a segment and the baseline is about the segment rather
  // than about which questions each one happened to ask.
  const sampledPrompts = new Set(segmented.map((r) => r.prompt));
  const overallRuns = stored.filter((r) => !r.segment && sampledPrompts.has(r.prompt));
  const overallScores = overallRuns.length ? scoreRuns(overallRuns, scoreOpts) : null;

  return {
    configured: true,
    kind,
    hasData: rows.some((r) => r.hasData),
    pending,
    rows,
    overall: overallScores
      ? {
          visibility: overallScores.visibilityScore,
          shareOfVoice: overallScores.shareOfVoice,
          answers: overallScores.sampledAnswers,
        }
      : null,
    applied: { native, prompt: framed },
    lastRunAt: segmented.length ? Math.max(...segmented.map((r) => r.ts)) : null,
  };
}
