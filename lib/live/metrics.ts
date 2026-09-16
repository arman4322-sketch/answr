import { answerStore, type PromptRun } from "@/lib/sampler/store";
import { scoreRuns } from "@/lib/scoring";
import { getWorkspace, type Workspace } from "@/lib/workspace";
import { summarize } from "@/lib/telemetry";

/* The live metrics layer — the single source every dashboard reads.

   Replaces lib/data/* fixtures entirely. Everything here is derived from real
   sampled answers (lib/sampler → answer store) scored by lib/scoring, plus
   first-party telemetry for crawler/referral figures.

   Honesty rules baked in:
   - No workspace configured → `configured: false`; screens show a setup state.
   - No runs collected yet    → zeros + `hasData: false`; screens show "collecting".
   - Trends need history: a series only spans the days actually sampled. On day
     one that is a single point — we report `days` so the UI can say so rather
     than implying 30 days of history that does not exist.
   - Crawler/referral numbers come from real traffic; they are 0 until AI bots
     and referred visitors actually arrive. We never synthesize them. */

export interface BrandShare {
  name: string;
  isBrand: boolean;
  /** prompts (of those answered) where this brand appeared */
  mentions: number;
  /** share of total brand mentions, 0–100 */
  share: number;
}

export interface PlatformRow {
  provider: string;
  label: string;
  /** answers from this provider mentioning the brand */
  appearances: number;
  /** answers received from this provider */
  answers: number;
  /** appearances ÷ answers, 0–100 */
  visibility: number;
}

export interface CitedDomain {
  domain: string;
  count: number;
  /** share of all citations, 0–100 */
  share: number;
  owned: boolean;
}

export interface PromptRow {
  prompt: string;
  mentioned: boolean;
  /** 1 = named before every competitor; null when absent */
  rank: number | null;
  competitorsMentioned: string[];
  providersAnswered: number;
  excerpt: string;
  ts: number;
}

export interface DayPoint {
  /** YYYY-MM-DD */
  date: string;
  visibility: number;
  shareOfVoice: number;
  runs: number;
}

export interface LiveMetrics {
  configured: boolean;
  hasData: boolean;
  workspace: Workspace | null;
  /** distinct days of sampled history — drives honest trend labelling */
  days: number;
  lastRunAt: number | null;
  promptsTracked: number;
  answersSampled: number;

  visibilityScore: number;
  shareOfVoice: number;
  avgAnswerPosition: number | null;
  answerRankFirst: number;

  citationsCount: number;
  uniqueCitedDomains: number;
  ownedCitationShare: number;
  answersWithCitationRate: number;

  brands: BrandShare[];
  platforms: PlatformRow[];
  citedDomains: CitedDomain[];
  prompts: PromptRow[];
  series: DayPoint[];

  /** first-party telemetry — real traffic only, 0 until bots/visitors arrive */
  crawlerEvents: number;
  uniqueAgents: number;
  pagesCrawled: number;
  aiReferrals: number;
  telemetryDurable: boolean;
}

const PROVIDER_LABELS: Record<string, string> = {
  openai: "ChatGPT",
  anthropic: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  dataforseo: "Google AI Overviews",
};

function wordIn(text: string, name: string): boolean {
  return firstIndex(text, name) >= 0;
}
function firstIndex(text: string, name: string): number {
  if (!name) return -1;
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = new RegExp(`\\b${esc}\\b`, "i").exec(text);
  return m ? m.index : -1;
}
function rankOf(text: string, brand: string, competitors: string[]): number | null {
  const bi = firstIndex(text, brand);
  if (bi < 0) return null;
  let earlier = 0;
  for (const c of competitors) {
    const i = firstIndex(text, c);
    if (i >= 0 && i < bi) earlier += 1;
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
const r1 = (n: number) => Math.round(n * 10) / 10;
const dayKey = (ts: number) => new Date(ts).toISOString().slice(0, 10);

function emptyMetrics(workspace: Workspace | null, telemetry: Awaited<ReturnType<typeof summarize>>): LiveMetrics {
  return {
    configured: !!workspace,
    hasData: false,
    workspace,
    days: 0,
    lastRunAt: null,
    promptsTracked: workspace?.prompts.length ?? 0,
    answersSampled: 0,
    visibilityScore: 0,
    shareOfVoice: 0,
    avgAnswerPosition: null,
    answerRankFirst: 0,
    citationsCount: 0,
    uniqueCitedDomains: 0,
    ownedCitationShare: 0,
    answersWithCitationRate: 0,
    brands: [],
    platforms: [],
    citedDomains: [],
    prompts: [],
    series: [],
    crawlerEvents: telemetry.crawlerEvents,
    uniqueAgents: telemetry.uniqueAgents,
    pagesCrawled: telemetry.pagesCrawled,
    aiReferrals: telemetry.referrals,
    telemetryDurable: !!telemetry.store?.durable,
  };
}

/** Compute every dashboard metric from real sampled runs. */
export async function getLiveMetrics(limit = 1000): Promise<LiveMetrics> {
  const [workspace, runs, telemetry] = await Promise.all([
    getWorkspace(),
    answerStore().recentRuns(limit),
    Promise.resolve(summarize()),
  ]);

  if (!workspace || runs.length === 0) return emptyMetrics(workspace, telemetry);

  const brand = workspace.brand;
  const competitors = workspace.competitors;
  const scores = scoreRuns(runs, { brand, brandDomain: workspace.domain, competitors });

  // ---- per-prompt (latest run per prompt text) ----
  const latest = new Map<string, PromptRun>();
  for (const r of runs) {
    const prev = latest.get(r.prompt);
    if (!prev || r.ts > prev.ts) latest.set(r.prompt, r);
  }
  const promptRows: PromptRow[] = [...latest.values()]
    .sort((a, b) => b.ts - a.ts)
    .map((run) => {
      const ok = run.answers.filter((a) => !a.error && a.text);
      const combined = ok.map((a) => a.text).join("  ");
      const ranks = ok.map((a) => rankOf(a.text, brand, competitors)).filter((x): x is number => x != null);
      return {
        prompt: run.prompt,
        mentioned: wordIn(combined, brand),
        rank: ranks.length ? Math.round((ranks.reduce((s, n) => s + n, 0) / ranks.length) * 10) / 10 : null,
        competitorsMentioned: competitors.filter((c) => wordIn(combined, c)),
        providersAnswered: ok.length,
        excerpt: (ok[0]?.text ?? "").slice(0, 260).replace(/\s+/g, " ").trim(),
        ts: run.ts,
      };
    });

  // ---- brand share of voice (mentions across latest answers) ----
  const mentionCount = (name: string) =>
    promptRows.filter((p) => (name === brand ? p.mentioned : p.competitorsMentioned.includes(name))).length;
  const rawBrands = [brand, ...competitors].map((name) => ({
    name,
    isBrand: name === brand,
    mentions: mentionCount(name),
  }));
  const totalMentions = rawBrands.reduce((s, b) => s + b.mentions, 0) || 1;
  const brands: BrandShare[] = rawBrands
    .map((b) => ({ ...b, share: r1((b.mentions / totalMentions) * 100) }))
    .sort((a, b) => b.mentions - a.mentions);

  // ---- per-platform visibility ----
  const byProvider = new Map<string, { answers: number; appearances: number }>();
  for (const run of latest.values()) {
    for (const a of run.answers) {
      if (a.error || !a.text) continue;
      const e = byProvider.get(a.provider) ?? { answers: 0, appearances: 0 };
      e.answers += 1;
      if (wordIn(a.text, brand)) e.appearances += 1;
      byProvider.set(a.provider, e);
    }
  }
  const platforms: PlatformRow[] = [...byProvider.entries()]
    .map(([provider, e]) => ({
      provider,
      label: PROVIDER_LABELS[provider] ?? provider,
      appearances: e.appearances,
      answers: e.answers,
      visibility: e.answers ? r1((e.appearances / e.answers) * 100) : 0,
    }))
    .sort((a, b) => b.visibility - a.visibility);

  // ---- cited domains ----
  const domainCounts = new Map<string, number>();
  let citationsTotal = 0;
  for (const run of latest.values()) {
    for (const a of run.answers) {
      for (const c of a.citations ?? []) {
        const d = domainOf(c.url);
        if (!d) continue;
        citationsTotal += 1;
        domainCounts.set(d, (domainCounts.get(d) ?? 0) + 1);
      }
    }
  }
  const ownDomain = workspace.domain.replace(/^www\./, "").toLowerCase();
  const citedDomains: CitedDomain[] = [...domainCounts.entries()]
    .map(([domain, count]) => ({
      domain,
      count,
      share: citationsTotal ? r1((count / citationsTotal) * 100) : 0,
      owned: !!ownDomain && (domain === ownDomain || domain.endsWith(`.${ownDomain}`)),
    }))
    .sort((a, b) => b.count - a.count);

  // ---- daily series (only days actually sampled) ----
  const byDay = new Map<string, PromptRun[]>();
  for (const r of runs) {
    const k = dayKey(r.ts);
    byDay.set(k, [...(byDay.get(k) ?? []), r]);
  }
  const series: DayPoint[] = [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, dayRuns]) => {
      const s = scoreRuns(dayRuns, { brand, brandDomain: workspace.domain, competitors });
      return { date, visibility: s.visibilityScore, shareOfVoice: s.shareOfVoice, runs: dayRuns.length };
    });

  return {
    configured: true,
    hasData: true,
    workspace,
    days: byDay.size,
    lastRunAt: Math.max(...runs.map((r) => r.ts)),
    promptsTracked: workspace.prompts.length || latest.size,
    answersSampled: scores.sampledAnswers,
    visibilityScore: scores.visibilityScore,
    shareOfVoice: scores.shareOfVoice,
    avgAnswerPosition: scores.avgAnswerPosition,
    answerRankFirst: scores.answerRankFirst,
    citationsCount: scores.citationsCount,
    uniqueCitedDomains: scores.uniqueCitedDomains,
    ownedCitationShare: scores.ownedCitationShare,
    answersWithCitationRate: scores.answersWithCitationRate,
    brands,
    platforms,
    citedDomains,
    prompts: promptRows,
    series,
    crawlerEvents: telemetry.crawlerEvents,
    uniqueAgents: telemetry.uniqueAgents,
    pagesCrawled: telemetry.pagesCrawled,
    aiReferrals: telemetry.referrals,
    telemetryDurable: !!telemetry.store?.durable,
  };
}
