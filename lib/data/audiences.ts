import type { TrendSeries } from "@/components/app/charts/TrendChart";
import { audienceSeries } from "@/lib/data/insights";

/* Audience-segment fixtures for Answer Engine Insights › Audiences.

   The Audiences page is segment-driven: picking a segment card swaps the
   headline visibility + delta, the trend series, the "Rank in segment" board
   and the highlighted comparison row. Everything a segment needs therefore
   lives on one record here.

   Endpoint constraints honored (per segment, self-consistent):
   - `headline` === last point of `series`
   - `delta`    === last point − first point (rounded to 1dp)
   - `ranks` contains exactly one `you: true` row and its value === headline
   - every point sits inside `yDomain`, whose four ticks are `yLabels`

   Marathon runners keeps the shipped fixture verbatim — its series is reused
   from lib/data/insights.ts (41.5 → 44.6, "↑ 3.1"), and its comparison /
   rank numbers are the ones the frame printed. Gym / cross-training and
   Casual / lifestyle wearers are authored to the same rules from the numbers
   the comparison table already showed (31.8 ↑1.2 and 18.2 ↓0.4). */

export type SegmentRank = { brand: string; value: number; you?: boolean };

export type AudienceSegment = {
  id: string;
  name: string;
  description: string;
  promptCount: number;
  /** headline visibility %, equals the series endpoint */
  headline: number;
  /** 30-day change, equals endpoint − start */
  delta: number;
  series: TrendSeries[];
  yDomain: [number, number];
  /** four axis ticks drawn beside the plot, top → bottom */
  yLabels: string[];
  ranks: SegmentRank[];
  /** comparison-table columns */
  shareOfVoice: number;
  sentimentLabel: string;
  sentimentTone: "positive" | "neutral" | "negative";
  /** segments created in-session have no run history yet */
  pending?: boolean;
  /** prompt set generated for an in-session segment */
  prompts?: { text: string; intent: string }[];
};

/* Marathon runners — shipped fixture, numbers untouched. */
const MARATHON_POINTS = audienceSeries[0].points;

/* Gym / cross-training — 30.6 → 31.8 (↑ 1.2). */
const GYM_POINTS = [
  30.6, 30.5, 30.7, 30.8, 30.7, 30.9, 31.0, 30.8, 31.1, 31.0,
  31.2, 31.1, 31.3, 31.2, 31.4, 31.3, 31.2, 31.5, 31.4, 31.6,
  31.5, 31.4, 31.6, 31.7, 31.5, 31.7, 31.6, 31.8, 31.7, 31.8,
];

/* Casual / lifestyle wearers — 18.6 → 18.2 (↓ 0.4). */
const CASUAL_POINTS = [
  18.6, 18.7, 18.6, 18.8, 18.7, 18.5, 18.6, 18.4, 18.6, 18.5,
  18.7, 18.5, 18.4, 18.6, 18.5, 18.3, 18.5, 18.4, 18.2, 18.4,
  18.3, 18.5, 18.3, 18.2, 18.4, 18.3, 18.1, 18.3, 18.2, 18.2,
];

export const audienceSegments: AudienceSegment[] = [
  {
    id: "marathon-runners",
    name: "Marathon runners",
    description: "Distance runners choosing shoes for marathon and half-marathon training",
    promptCount: 96,
    headline: 44.6,
    delta: 3.1,
    series: [{ id: "marathon-runners", label: "Marathon runners", color: "var(--ac)", area: true, points: MARATHON_POINTS }],
    yDomain: [20, 50],
    yLabels: ["50%", "40%", "30%", "20%"],
    ranks: [
      { brand: "Nike", value: 44.6, you: true },
      { brand: "Adidas", value: 31.2 },
      { brand: "Puma", value: 19.4 },
      { brand: "Under Armour", value: 14.8 },
    ],
    shareOfVoice: 36.2,
    sentimentLabel: "Positive · 78",
    sentimentTone: "positive",
  },
  {
    id: "gym-cross-training",
    name: "Gym / cross-training",
    description: 'Everyday gym-goers asking practical "what should I buy" questions',
    promptCount: 74,
    headline: 31.8,
    delta: 1.2,
    series: [{ id: "gym-cross-training", label: "Gym / cross-training", color: "var(--ac)", area: true, points: GYM_POINTS }],
    yDomain: [20, 50],
    yLabels: ["50%", "40%", "30%", "20%"],
    ranks: [
      { brand: "Nike", value: 31.8, you: true },
      { brand: "Under Armour", value: 28.4 },
      { brand: "Adidas", value: 26.7 },
      { brand: "Puma", value: 14.2 },
    ],
    shareOfVoice: 26.4,
    sentimentLabel: "Positive · 71",
    sentimentTone: "positive",
  },
  {
    id: "casual-lifestyle",
    name: "Casual / lifestyle wearers",
    description: "Everyday wearers focused on comfort, style and wide-fit sizing",
    promptCount: 52,
    headline: 18.2,
    delta: -0.4,
    series: [{ id: "casual-lifestyle", label: "Casual / lifestyle wearers", color: "var(--ac)", area: true, points: CASUAL_POINTS }],
    yDomain: [10, 40],
    yLabels: ["40%", "30%", "20%", "10%"],
    ranks: [
      { brand: "Adidas", value: 24.1 },
      { brand: "New Balance", value: 21.7 },
      { brand: "Nike", value: 18.2, you: true },
      { brand: "Puma", value: 12.4 },
    ],
    shareOfVoice: 15.9,
    sentimentLabel: "Neutral · 55",
    sentimentTone: "neutral",
  },
];

/* ---------------------------------------------------------------------------
   "+ New segment" — describe an audience, Answr generates its prompt set.

   The generator is deterministic and derived from what the user typed: the
   description is reduced to a subject phrase, which is slotted into Nike's
   category templates (running shoes / training apparel). No network, no model
   — the demo is honest that a real workspace runs these daily.
--------------------------------------------------------------------------- */

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from", "how", "i", "in", "into", "is", "it",
  "its", "my", "of", "on", "or", "our", "people", "that", "the", "their", "them", "they", "this", "to", "up",
  "us", "want", "wants", "was", "we", "were", "what", "when", "which", "who", "will", "with", "you", "your",
  "someone", "anyone", "customers", "audience", "segment", "shoppers", "buyers", "users",
  /* verbs that make a poor segment label */
  "ask", "asks", "asking", "buy", "buys", "buying", "choose", "choosing", "find", "finding", "look",
  "looking", "need", "needs", "prefer", "prefers", "search", "searching", "shop", "shopping",
]);

function meaningfulWords(description: string): string[] {
  return description
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !STOPWORDS.has(w));
}

/** Reduce a free-text audience description to the short noun phrase the prompt
    templates slot in ("trail runners in cold, wet climates" → "trail runners").
    Two words keeps every generated prompt reading like a real question. */
export function subjectFrom(description: string): string {
  const phrase = meaningfulWords(description).slice(0, 2).join(" ").trim();
  return phrase || "this audience";
}

/** Short, label-like segment name from the same description. */
export function nameFrom(description: string): string {
  const s = subjectFrom(description);
  if (s === "this audience") return "New segment";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export type GeneratedPrompt = { text: string; intent: string };

/** 8 category prompts derived from the typed description, each with an intent. */
export function generatePromptSet(description: string): GeneratedPrompt[] {
  const s = subjectFrom(description);
  return [
    { text: `best running shoes for ${s}`, intent: "Discovery" },
    { text: `nike vs adidas running shoes for ${s}`, intent: "Comparison" },
    { text: `are nike running shoes worth it for ${s}`, intent: "Evaluation" },
    { text: `what training apparel should ${s} look for`, intent: "Research" },
    { text: `most comfortable nike trainers for ${s}`, intent: "Discovery" },
    { text: `where to buy nike gear for ${s}`, intent: "Purchase" },
    { text: `how should nike shoes fit for ${s}`, intent: "Support" },
    { text: `top shoe brands recommended for ${s}`, intent: "Comparison" },
  ];
}

export const INTENT_COLORS: Record<string, { fg: string; bg: string }> = {
  Discovery: { fg: "#b3a7f8", bg: "rgba(142,124,242,0.16)" },
  Comparison: { fg: "#7fa7d9", bg: "rgba(127,167,217,0.16)" },
  Evaluation: { fg: "#d9b679", bg: "rgba(217,182,121,0.16)" },
  Research: { fg: "#b98ed9", bg: "rgba(185,142,217,0.16)" },
  Purchase: { fg: "#4cb782", bg: "rgba(76,183,130,0.16)" },
  Support: { fg: "#9aa0ab", bg: "rgba(154,160,171,0.14)" },
};

/** Build the client-side segment record for a segment created in-session. */
export function draftSegment(description: string, prompts: GeneratedPrompt[]): AudienceSegment {
  const s = subjectFrom(description);
  const name = nameFrom(description);
  return {
    id: `draft-${s.replace(/[^a-z0-9]+/g, "-")}`,
    name,
    description: description.trim(),
    promptCount: prompts.length,
    headline: 0,
    delta: 0,
    series: [],
    yDomain: [0, 50],
    yLabels: ["50%", "40%", "30%", "20%"],
    ranks: [],
    shareOfVoice: 0,
    sentimentLabel: "—",
    sentimentTone: "neutral",
    pending: true,
    prompts,
  };
}
