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
  competitors: string[];
  /** per-provider weight; defaults to equal weighting */
  platformWeights?: Record<string, number>;
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

/** Rank of the brand among all mentioned brands in one answer (1 = first). */
function brandRank(text: string, brand: string, competitors: string[]): number | null {
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
  const { brand, brandDomain, competitors, platformWeights } = input;
  const answers: SampledAnswer[] = runs.flatMap((r) => r.answers).filter((a) => !a.error && a.text);

  const weightFor = (provider: string) => platformWeights?.[provider] ?? 1;

  let visNum = 0;
  let visDen = 0;
  let brandMentions = 0;
  const competitorMentions = new Map<string, number>();
  const platformAppearances: Record<string, number> = {};
  let citationsCount = 0;
  let answersWithCitation = 0;
  const domains = new Set<string>();
  let ownedCitations = 0;
  const ranks: number[] = [];
  let rankFirst = 0;

  for (const a of answers) {
    const w = weightFor(a.provider);
    visDen += w; // denominator uses max position weight (1.0)
    const rank = brandRank(a.text, brand, competitors);
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
        if (brandDomain && (d === brandDomain.toLowerCase() || d.endsWith(`.${brandDomain.toLowerCase()}`))) {
          ownedCitations += 1;
        }
      }
    }
  }

  const totalCompetitorMentions = [...competitorMentions.values()].reduce((s, n) => s + n, 0);
  const sovDen = brandMentions + totalCompetitorMentions;

  return {
    sampledAnswers: answers.length,
    visibilityScore: visDen > 0 ? round1((visNum / visDen) * 100) : 0,
    shareOfVoice: sovDen > 0 ? round1((brandMentions / sovDen) * 100) : 0,
    platformAppearances,
    citationsCount,
    uniqueCitedDomains: domains.size,
    ownedCitationShare: citationsCount > 0 ? round1((ownedCitations / citationsCount) * 100) : 0,
    answersWithCitationRate: answers.length > 0 ? round1((answersWithCitation / answers.length) * 100) : 0,
    avgAnswerPosition: ranks.length > 0 ? round1(ranks.reduce((s, r) => s + r, 0) / ranks.length) : null,
    answerRankFirst: rankFirst,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
