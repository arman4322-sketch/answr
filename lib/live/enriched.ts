import { answerStore, type PromptRun } from "@/lib/sampler/store";
import { getWorkspace, identityOf } from "@/lib/workspace";
import { listSentiment, listPromptTopics, type Sentiment } from "./classify";
import { brandMatcher } from "./entity";

/* Enriched live metrics — sentiment and topic breakdowns computed from the
   classification pass (lib/live/classify) over answers Answr already sampled.

   Same honesty contract as lib/live/metrics: when nothing has been classified
   the screens get hasData:false and render their preview state rather than a
   fabricated split. Nothing here invents a figure. */

export interface SentimentSplit {
  positive: number;
  neutral: number;
  negative: number;
  /** total classified answers */
  total: number;
  /** each as a % of total, rounded to 1dp */
  positivePct: number;
  neutralPct: number;
  negativePct: number;
}

export interface ThemeRow {
  theme: string;
  count: number;
  /** the sentiment this theme most often appeared with */
  leaning: Sentiment;
}

export interface SentimentByProvider {
  provider: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  positivePct: number;
}

export interface SentimentDay {
  date: string;
  positivePct: number;
  total: number;
}

export interface TopicRow {
  topic: string;
  /** tracked prompts in this topic */
  prompts: number;
  /** answers for those prompts that named the brand */
  appearances: number;
  /** answers received for those prompts */
  answers: number;
  /** appearances ÷ answers, 0–100 */
  visibility: number;
  /** provider with the highest visibility for this topic */
  bestPlatform: string | null;
}

export interface EnrichedMetrics {
  configured: boolean;
  /** true once at least one answer has been classified */
  hasSentiment: boolean;
  /** true once at least one prompt has been tagged */
  hasTopics: boolean;
  classifiedAnswers: number;
  split: SentimentSplit;
  themes: ThemeRow[];
  byProvider: SentimentByProvider[];
  sentimentSeries: SentimentDay[];
  topics: TopicRow[];
  lastClassifiedAt: number | null;
}

const PROVIDER_LABELS: Record<string, string> = {
  openai: "ChatGPT",
  anthropic: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  dataforseo: "Google AI Overviews",
};
export const providerLabel = (id: string) => PROVIDER_LABELS[id] ?? id;

const r1 = (n: number) => Math.round(n * 10) / 10;
const dayKey = (ts: number) => new Date(ts).toISOString().slice(0, 10);

const emptySplit: SentimentSplit = {
  positive: 0, neutral: 0, negative: 0, total: 0,
  positivePct: 0, neutralPct: 0, negativePct: 0,
};

export async function getEnrichedMetrics(): Promise<EnrichedMetrics> {
  const [workspace, runs, sentiment, topics] = await Promise.all([
    getWorkspace(),
    answerStore().recentRuns(500),
    listSentiment(),
    listPromptTopics(),
  ]);

  const empty: EnrichedMetrics = {
    configured: !!workspace,
    hasSentiment: false,
    hasTopics: false,
    classifiedAnswers: 0,
    split: emptySplit,
    themes: [],
    byProvider: [],
    sentimentSeries: [],
    topics: [],
    lastClassifiedAt: null,
  };
  if (!workspace) return empty;

  // Topic visibility asks the same "did this answer name the brand" question as
  // every other metric, so it uses the same entity matcher.
  const isBrand = await brandMatcher(identityOf(workspace));

  // ---------- sentiment ----------
  const hasSentiment = sentiment.length > 0;
  let split = emptySplit;
  const themes: ThemeRow[] = [];
  const byProvider: SentimentByProvider[] = [];
  const sentimentSeries: SentimentDay[] = [];

  if (hasSentiment) {
    const pos = sentiment.filter((s) => s.sentiment === "positive").length;
    const neu = sentiment.filter((s) => s.sentiment === "neutral").length;
    const neg = sentiment.filter((s) => s.sentiment === "negative").length;
    const total = sentiment.length;
    split = {
      positive: pos, neutral: neu, negative: neg, total,
      positivePct: r1((pos / total) * 100),
      neutralPct: r1((neu / total) * 100),
      negativePct: r1((neg / total) * 100),
    };

    // themes, with the sentiment they most often accompany
    const themeMap = new Map<string, { count: number; tally: Record<Sentiment, number> }>();
    for (const s of sentiment) {
      for (const raw of s.themes) {
        const key = raw.toLowerCase();
        const e = themeMap.get(key) ?? { count: 0, tally: { positive: 0, neutral: 0, negative: 0 } };
        e.count += 1;
        e.tally[s.sentiment] += 1;
        themeMap.set(key, e);
      }
    }
    for (const [theme, e] of themeMap) {
      const leaning = (Object.entries(e.tally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "neutral") as Sentiment;
      themes.push({ theme, count: e.count, leaning });
    }
    themes.sort((a, b) => b.count - a.count);

    // per provider
    const provMap = new Map<string, { positive: number; neutral: number; negative: number }>();
    for (const s of sentiment) {
      const e = provMap.get(s.provider) ?? { positive: 0, neutral: 0, negative: 0 };
      e[s.sentiment] += 1;
      provMap.set(s.provider, e);
    }
    for (const [provider, e] of provMap) {
      const total = e.positive + e.neutral + e.negative;
      byProvider.push({
        provider: providerLabel(provider),
        positive: e.positive, neutral: e.neutral, negative: e.negative, total,
        positivePct: total ? r1((e.positive / total) * 100) : 0,
      });
    }
    byProvider.sort((a, b) => b.positivePct - a.positivePct);

    // daily positive rate — only days actually classified
    const dayMap = new Map<string, { pos: number; total: number }>();
    for (const s of sentiment) {
      const k = dayKey(s.ts);
      const e = dayMap.get(k) ?? { pos: 0, total: 0 };
      e.total += 1;
      if (s.sentiment === "positive") e.pos += 1;
      dayMap.set(k, e);
    }
    for (const [date, e] of [...dayMap.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      sentimentSeries.push({ date, positivePct: r1((e.pos / e.total) * 100), total: e.total });
    }
  }

  // ---------- topics ----------
  const hasTopics = topics.length > 0;
  const topicRows: TopicRow[] = [];
  if (hasTopics) {
    const topicOf = new Map(topics.map((t) => [t.prompt, t.topic]));
    // latest run per prompt
    const latest = new Map<string, PromptRun>();
    for (const r of runs) {
      const prev = latest.get(r.prompt);
      if (!prev || r.ts > prev.ts) latest.set(r.prompt, r);
    }
    const grouped = new Map<string, { prompts: Set<string>; appearances: number; answers: number; perProvider: Map<string, { a: number; n: number }> }>();
    for (const [prompt, run] of latest) {
      const topic = topicOf.get(prompt);
      if (!topic) continue;
      const g = grouped.get(topic) ?? { prompts: new Set(), appearances: 0, answers: 0, perProvider: new Map() };
      g.prompts.add(prompt);
      for (const ans of run.answers) {
        if (ans.error || !ans.text) continue;
        g.answers += 1;
        const named = isBrand(run.id, ans);
        if (named) g.appearances += 1;
        const p = g.perProvider.get(ans.provider) ?? { a: 0, n: 0 };
        p.n += 1;
        if (named) p.a += 1;
        g.perProvider.set(ans.provider, p);
      }
      grouped.set(topic, g);
    }
    for (const [topic, g] of grouped) {
      let best: string | null = null;
      let bestPct = -1;
      for (const [prov, p] of g.perProvider) {
        const pct = p.n ? (p.a / p.n) * 100 : 0;
        if (pct > bestPct) { bestPct = pct; best = providerLabel(prov); }
      }
      topicRows.push({
        topic,
        prompts: g.prompts.size,
        appearances: g.appearances,
        answers: g.answers,
        visibility: g.answers ? r1((g.appearances / g.answers) * 100) : 0,
        bestPlatform: g.appearances > 0 ? best : null,
      });
    }
    topicRows.sort((a, b) => b.visibility - a.visibility);
  }

  return {
    configured: true,
    hasSentiment,
    hasTopics,
    classifiedAnswers: sentiment.length,
    split,
    themes: themes.slice(0, 12),
    byProvider,
    sentimentSeries,
    topics: topicRows,
    lastClassifiedAt: sentiment.length ? Math.max(...sentiment.map((s) => s.ts)) : null,
  };
}
