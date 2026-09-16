import type { PromptRun, SampledAnswer } from "@/lib/sampler/store";

/* Scoring — turns sampled answers (lib/sampler) into the metrics defined in
   lib/metrics.ts. Pure functions: given the runs, the tracked brand, its domain,
   and its competitors, compute the visibility / share-of-voice / citation family.

   These are the exact formulas the metric dictionary specifies:
     visibility_score = Σ(brand_present × position_weight × platform_weight)
                        ÷ Σ(position_weight × platform_weight),
       position_weight = 0.5^(rank-1)  (1st mention 1.0, halving per rank)
       platform_weight = equal by default (override with a weights map)
     share_of_voice   = brand_mentions ÷ (brand + Σ competitor mentions)
     answer_rank_first = answers mentioning the brand before any competitor

   This is the step that replaces the fixture dashboards with real numbers once
   the sampler is accumulating runs. It needs no keys or accounts to run — feed
   it runs and it scores them. */

export interface ScoreInput {
  brand: string;
  brandDomain?: string;
  /** every host the brand owns, when it has more than one (e.g. after a move) */
  ownedDomains?: string[];
  competitors: string[];
  /** per-provider weight; defaults to equal weighting */
  platformWeights?: Record<string, number>;
  /**
   * Decides whether an answer mentions the tracked ENTITY, not merely the
   * brand string. Supply the workspace matcher (lib/live/entity) so answers
   * about an unrelated company of the same name are not counted. Defaults to
   * the word-boundary name match, which is correct for unshared names.
   */
  brandMatch?: (runId: string, answer: SampledAnswer) => boolean;
}

export interface Scores {
  sampledAnswers: number;
  visibilityScore: number; // 0–100
  shareOfVoice: number; // 0–100
  platformAppearances: Record<string, number>;
  citationsCount: number;
  uniqueCitedDomains: number;
  ownedCitationShare: number; // 0–100
  answersWithCitationRate: number; // 0–100
  avgAnswerPosition: number | null; // ≥1 or null when never mentioned
  answerRankFirst: number;
  /** answers where the brand NAME appeared but described a different entity */
  nameCollisions: number;
}

function mentions(text: string, name: string): boolean {
  return firstIndex(text, name) >= 0;
}

/** First case-insensitive, word-bounded index of `name` in `text`, or -1. */
function firstIndex(text: string, name: string): number {
  if (!name) return -1;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\b${escaped}\\b`, "i");
  const m = re.exec(text);
  return m ? m.index : -1;
}

/** Rank of the brand among all mentioned brands in one answer (1 = first).
 *  `present` comes from the entity test, so an answer that names a different
 *  company of the same name never gets a rank. */
function brandRank(text: string, brand: string, competitors: string[], present: boolean): number | null {
  if (!present) return null;
  const brandIdx = firstIndex(text, brand);
  if (brandIdx < 0) return null;
  let earlier = 0;
  for (const c of competitors) {
    const idx = firstIndex(text, c);
    if (idx >= 0 && idx < brandIdx) earlier += 1;
  }
  return earlier + 1;
}

function domainOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

export function scoreRuns(runs: PromptRun[], input: ScoreInput): Scores {
  const { brand, brandDomain, competitors, platformWeights, brandMatch } = input;
  // Owned hosts: the domain given, plus any others the brand owns. A brand that
  // has moved is cited at both, and counting only one reported "owned 0%".
  const owned = [...new Set([brandDomain, ...(input.ownedDomains ?? [])]
    .map((d) => d?.trim().toLowerCase())
    .filter((d): d is string => !!d))];
  const isOwned = (host: string) => owned.some((o) => host === o || host.endsWith(`.${o}`));
  const isBrand = brandMatch ?? ((_runId: string, a: SampledAnswer) => mentions(a.text, brand));

  const weightFor = (provider: string) => platformWeights?.[provider] ?? 1;

  let sampledAnswers = 0;
  let visNum = 0;
  let visDen = 0;
  let brandMentions = 0;
  let nameCollisions = 0;
  const competitorMentions = new Map<string, number>();
  const platformAppearances: Record<string, number> = {};
  let citationsCount = 0;
  let answersWithCitation = 0;
  const domains = new Set<string>();
  let ownedCitations = 0;
  const ranks: number[] = [];
  let rankFirst = 0;

  for (const run of runs) {
    for (const a of run.answers) {
      if (a.error || !a.text) continue;
      sampledAnswers += 1;
      const w = weightFor(a.provider);
      visDen += w; // denominator uses max position weight (1.0)

      const present = isBrand(run.id, a);
      // The name is there but the answer is about something else of the same
      // name: worth reporting, never worth counting.
      if (!present && mentions(a.text, brand)) nameCollisions += 1;

      const rank = brandRank(a.text, brand, competitors, present);
      if (rank !== null) {
        visNum += w * Math.pow(0.5, rank - 1);
        brandMentions += 1;
        ranks.push(rank);
        if (rank === 1) rankFirst += 1;
        platformAppearances[a.provider] = (platformAppearances[a.provider] ?? 0) + 1;
      }
      for (const c of competitors) {
        if (mentions(a.text, c)) competitorMentions.set(c, (competitorMentions.get(c) ?? 0) + 1);
      }
      if (a.citations.length > 0) answersWithCitation += 1;
      for (const cit of a.citations) {
        citationsCount += 1;
        const d = domainOf(cit.url);
        if (d) {
          domains.add(d);
          if (isOwned(d)) ownedCitations += 1;
        }
      }
    }
  }

  const totalCompetitorMentions = [...competitorMentions.values()].reduce((s, n) => s + n, 0);
  const sovDen = brandMentions + totalCompetitorMentions;

  return {
    sampledAnswers,
    visibilityScore: visDen > 0 ? round1((visNum / visDen) * 100) : 0,
    shareOfVoice: sovDen > 0 ? round1((brandMentions / sovDen) * 100) : 0,
    platformAppearances,
    citationsCount,
    uniqueCitedDomains: domains.size,
    ownedCitationShare: citationsCount > 0 ? round1((ownedCitations / citationsCount) * 100) : 0,
    answersWithCitationRate: sampledAnswers > 0 ? round1((answersWithCitation / sampledAnswers) * 100) : 0,
    avgAnswerPosition: ranks.length > 0 ? round1(ranks.reduce((s, r) => s + r, 0) / ranks.length) : null,
    answerRankFirst: rankFirst,
    nameCollisions,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
