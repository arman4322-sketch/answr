/* Overview fixtures — 30 daily visibility points, window Jul 7 – Aug 5, 2026.
   Endpoint constraints honored:
   - Nike ends 34.2 (the page's headline "34.2%") and starts 31.4 so the KPI's
     "↑ 2.8" delta is true. Upward inflection after Jul 26 = the digest's "three
     new runnersworld.com citations" driving AI Overviews growth.
   - Competitor endpoints are visibility (not SoV) — scaled below Nike's,
     consistent with the SoV table ordering (Adidas 24.1% > Puma 18.9%,
     ≈ SoV × 34.2/28.6): Adidas ends 28.9 drifting down (SoV ↓ 0.6),
     Puma ends 22.8 drifting up (SoV ↑ 0.3).
   - Jul 26 (index 19) matches the frame's depicted tooltip:
     Nike 32.4 / Adidas 29.7 / Puma 22.6.
   Series colors follow the page's own legend + SoV-table sparklines
   (Nike var(--ac), Adidas #7fa7d9, Puma #b98ed9). */

import { last30Days, lastWeeks } from "@/lib/data/dates";
import type { TrendSeries } from "@/components/app/charts/TrendChart";

export const overviewXLabels = last30Days();

/* Platform series colors — canvas rev 7 spec (README "Platform series colors"):
   ChatGPT #8E7CF2, Perplexity #7fa7d9, Google AI Overviews #d9b679,
   Claude #d985a8, Gemini #6ec9b8. */
export const PLATFORM_COLORS = {
  chatgpt: "#8E7CF2",
  perplexity: "#7fa7d9",
  aioverviews: "#d9b679",
  claude: "#d985a8",
  gemini: "#6ec9b8",
} as const;

/* Appearances tab — count of tracked prompts (of 412) where Nike appears in
   the answer, per platform, daily runs. Endpoint constraints from the rev-7
   mock's legend chips: ChatGPT 172, Perplexity 150, AI Overviews 128,
   Claude 114, Gemini 91; window starts read off the mock's path left ends
   (≈147/129/100/120/87 — Claude gently declining, the rest rising, AI Overviews
   steepest per the digest's runnersworld.com-citation story). Per-platform
   counts overlap (one prompt can appear on several platforms), so they need not
   sum to 412. */
export const appearancesTrend: TrendSeries[] = [
  {
    id: "chatgpt",
    label: "ChatGPT",
    color: PLATFORM_COLORS.chatgpt, area: true,
    points: [
      147, 148, 148, 149, 150, 151, 151, 152, 153, 154,
      155, 156, 156, 157, 158, 159, 160, 161, 162, 163,
      164, 165, 166, 167, 168, 169, 170, 171, 172, 172,
    ],
  },
  {
    id: "perplexity",
    label: "Perplexity",
    color: PLATFORM_COLORS.perplexity, area: true,
    points: [
      129, 130, 130, 131, 132, 132, 133, 134, 135, 135,
      136, 137, 138, 138, 139, 140, 141, 142, 143, 144,
      144, 145, 146, 147, 148, 148, 149, 149, 150, 150,
    ],
  },
  {
    id: "aioverviews",
    label: "AI Overviews",
    color: PLATFORM_COLORS.aioverviews, area: true,
    points: [
      100, 101, 102, 103, 104, 105, 106, 107, 108, 109,
      110, 111, 112, 113, 114, 115, 116, 117, 118, 119,
      120, 121, 122, 123, 124, 125, 126, 127, 128, 128,
    ],
  },
  {
    id: "claude",
    label: "Claude",
    color: PLATFORM_COLORS.claude, area: true,
    points: [
      120, 120, 119, 119, 119, 118, 118, 118, 117, 117,
      117, 116, 116, 116, 116, 115, 115, 115, 115, 114,
      114, 114, 114, 114, 114, 114, 114, 114, 114, 114,
    ],
  },
  {
    id: "gemini",
    label: "Gemini",
    color: PLATFORM_COLORS.gemini, area: true,
    points: [
      87, 87, 87, 88, 88, 88, 88, 89, 89, 89,
      89, 89, 90, 90, 90, 90, 90, 90, 91, 91,
      91, 91, 91, 91, 91, 91, 91, 91, 91, 91,
    ],
  },
];

/** Legend-chip values for the Appearances tab (current counts, of 412 prompts). */
export const appearancesLegend = [
  { label: "ChatGPT", color: PLATFORM_COLORS.chatgpt, value: "172" },
  { label: "Perplexity", color: PLATFORM_COLORS.perplexity, value: "150" },
  { label: "AI Overviews", color: PLATFORM_COLORS.aioverviews, value: "128" },
  { label: "Claude", color: PLATFORM_COLORS.claude, value: "114" },
  { label: "Gemini", color: PLATFORM_COLORS.gemini, value: "91" },
];

/* Clicks tab — weekly AI-referral clicks landing on nike.com by source
   platform ("from Demand"). Five weekly points ending Aug 3; each series sums
   EXACTLY to the mock's 30d legend totals: ChatGPT 1,842 · AI Overviews 1,204 ·
   Perplexity 926 · Gemini 512 · Claude 388. (Distinct from the Referrals
   module's 3,412 referred sessions — clicks are raw, sessions are deduped.) */
export const clicksXLabels = lastWeeks(5);

export const clicksTrend: TrendSeries[] = [
  { id: "chatgpt", label: "ChatGPT", color: PLATFORM_COLORS.chatgpt, area: true, points: [341, 356, 368, 378, 399] },
  { id: "aioverviews", label: "AI Overviews", color: PLATFORM_COLORS.aioverviews, area: true, points: [219, 231, 242, 251, 261] },
  { id: "perplexity", label: "Perplexity", color: PLATFORM_COLORS.perplexity, area: true, points: [172, 179, 185, 191, 199] },
  { id: "gemini", label: "Gemini", color: PLATFORM_COLORS.gemini, area: true, points: [96, 99, 103, 105, 109] },
  { id: "claude", label: "Claude", color: PLATFORM_COLORS.claude, area: true, points: [72, 75, 78, 80, 83] },
];

/** Legend-chip values for the Clicks tab (30-day totals). */
export const clicksLegend = [
  { label: "ChatGPT", color: PLATFORM_COLORS.chatgpt, value: "1,842" },
  { label: "Perplexity", color: PLATFORM_COLORS.perplexity, value: "926" },
  { label: "AI Overviews", color: PLATFORM_COLORS.aioverviews, value: "1,204" },
  { label: "Claude", color: PLATFORM_COLORS.claude, value: "388" },
  { label: "Gemini", color: PLATFORM_COLORS.gemini, value: "512" },
];

/* ── KPI-backing daily series (added with the live topbar filters) ──────────
   Every Overview KPI now reads its number off a real series, so the headline
   is the window's endpoint and the delta is endpoint − start-of-window rather
   than a hardcoded string. The 30-day window of each series reproduces the
   shipped card exactly: endpoint = the published value, start = value − the
   published delta. Longer windows extend backwards from these (see
   lib/filters/windows.ts); today's numbers never move. */

/** Share of voice, daily — ends 28.6 (the KPI), starts 27.5 so "↑ 1.1" is true. */
export const shareOfVoiceSeries: number[] = [
  27.5, 27.4, 27.6, 27.5, 27.7, 27.6, 27.8, 27.7, 27.9, 27.8,
  27.9, 28.0, 27.9, 28.1, 28.0, 28.2, 28.1, 28.2, 28.0, 28.2,
  28.3, 28.2, 28.4, 28.3, 28.4, 28.5, 28.4, 28.5, 28.6, 28.6,
];

/** Avg. answer position, daily — ends 2.4 (the KPI), starts 2.6 so "↓ 0.2" is
    true. The frame paints a falling position red; that polarity is preserved
    (see OverviewKpis) rather than silently re-coloured. */
export const avgPositionSeries: number[] = [
  2.6, 2.6, 2.6, 2.5, 2.6, 2.6, 2.5, 2.6, 2.5, 2.5,
  2.6, 2.5, 2.5, 2.6, 2.5, 2.5, 2.4, 2.5, 2.5, 2.4,
  2.5, 2.4, 2.5, 2.4, 2.4, 2.5, 2.4, 2.4, 2.5, 2.4,
];

/* Competitor share of voice — one daily series per brand, each ending on the
   value the table prints and starting at value − its Δ30d (Nike 28.6 ↑1.1 ·
   Adidas 24.1 ↓0.6 · Puma 18.9 ↑0.3 · Under Armour 15.2 ↓1.4 ·
   New Balance 13.2 ↑0.9). "Top platform" is a per-brand attribute, not a
   window measure, so it stays as the frame printed it. */
export type CompetitorRow = {
  brand: string;
  you?: boolean;
  topPlatform: string;
  color: string;
  points: number[];
};

export const competitorSovRows: CompetitorRow[] = [
  { brand: "Nike", you: true, topPlatform: "ChatGPT", color: "var(--ac)", points: shareOfVoiceSeries },
  {
    brand: "Adidas",
    topPlatform: "Perplexity",
    color: "#7fa7d9",
    points: [
      24.7, 24.7, 24.6, 24.5, 24.7, 24.6, 24.7, 24.6, 24.5, 24.5,
      24.4, 24.4, 24.4, 24.5, 24.4, 24.5, 24.3, 24.3, 24.3, 24.3,
      24.3, 24.3, 24.3, 24.3, 24.2, 24.1, 24.2, 24.1, 24.1, 24.1,
    ],
  },
  {
    brand: "Puma",
    topPlatform: "Gemini",
    color: "#b98ed9",
    points: [
      18.6, 18.5, 18.6, 18.7, 18.6, 18.6, 18.6, 18.7, 18.6, 18.7,
      18.8, 18.8, 18.7, 18.7, 18.8, 18.7, 18.7, 18.7, 18.8, 18.7,
      18.8, 18.8, 18.7, 18.8, 18.8, 18.8, 18.9, 19.0, 19.0, 18.9,
    ],
  },
  {
    brand: "Under Armour",
    topPlatform: "ChatGPT",
    color: "#d9b679",
    points: [
      16.6, 16.5, 16.6, 16.5, 16.5, 16.3, 16.3, 16.2, 16.2, 16.1,
      16.2, 16.0, 15.9, 16.0, 15.9, 15.8, 15.9, 15.9, 15.7, 15.8,
      15.7, 15.5, 15.5, 15.5, 15.4, 15.3, 15.2, 15.4, 15.1, 15.2,
    ],
  },
  {
    brand: "New Balance",
    topPlatform: "Claude",
    color: "#d985a8",
    points: [
      12.3, 12.4, 12.5, 12.3, 12.4, 12.3, 12.5, 12.6, 12.5, 12.5,
      12.6, 12.5, 12.6, 12.6, 12.8, 12.9, 12.8, 12.8, 12.9, 12.9,
      12.9, 12.8, 13.0, 13.1, 13.0, 13.0, 13.0, 13.2, 13.1, 13.2,
    ],
  },
];

/* Top cited sources (Overview card) — the shipped 30-day counts. Per-domain
   daily history is not part of the fixture, so longer windows scale each
   domain's count by the window's own citation volume (its share of citations
   is what the card is really showing). At 30 days that returns 248 / 201 /
   164 / 97 / 61 exactly. */
export const topCitedSources: { domain: string; count30d: number; barWidth: string; opacity?: number }[] = [
  { domain: "runnersworld.com", count30d: 248, barWidth: "86%" },
  { domain: "nike.com/running", count30d: 201, barWidth: "70%", opacity: 0.8 },
  { domain: "reddit.com", count30d: 164, barWidth: "57%", opacity: 0.6 },
  { domain: "wirecutter.com", count30d: 97, barWidth: "34%", opacity: 0.45 },
  { domain: "wikipedia.org", count30d: 61, barWidth: "21%", opacity: 0.3 },
];

/* Visibility by platform — one daily series per platform, each ending on the
   value the card prints and starting at value − the card's delta
   (ChatGPT 41.8 ↑3.2 · Perplexity 36.4 ↑1.9 · AI Overviews 31.0 ↑4.6 ·
   Claude 27.7 ↓0.8 · Gemini 22.1 ↑0.4). The bar widths are derived from the
   value (round(41.8)=42% …), which reproduces the frame's painted widths. */
export type PlatformVisibilityRow = {
  id: keyof typeof PLATFORM_COLORS;
  label: string;
  /** bar fill opacity, verbatim from the frame's row order */
  opacity: number;
  points: number[];
};

export const platformVisibilityRows: PlatformVisibilityRow[] = [
  {
    id: "chatgpt",
    label: "ChatGPT",
    opacity: 1,
    points: [
      38.6, 38.6, 38.8, 38.9, 39.0, 39.1, 39.3, 39.4, 39.5, 39.5,
      39.6, 39.8, 40.0, 40.1, 40.2, 40.2, 40.4, 40.4, 40.7, 40.8,
      40.7, 40.9, 41.0, 41.1, 41.2, 41.3, 41.4, 41.6, 41.7, 41.8,
    ],
  },
  {
    id: "perplexity",
    label: "Perplexity",
    opacity: 0.8,
    points: [
      34.5, 34.5, 34.6, 34.8, 34.7, 34.8, 35.0, 34.9, 35.1, 35.1,
      35.3, 35.3, 35.4, 35.4, 35.5, 35.5, 35.5, 35.5, 35.7, 35.8,
      35.8, 35.8, 36.0, 35.9, 36.2, 36.1, 36.3, 36.2, 36.4, 36.4,
    ],
  },
  {
    id: "aioverviews",
    label: "Google AI Overviews",
    opacity: 0.65,
    points: [
      26.4, 26.5, 26.8, 26.9, 26.9, 27.2, 27.4, 27.4, 27.7, 27.9,
      27.9, 28.2, 28.4, 28.4, 28.5, 28.9, 28.9, 29.1, 29.2, 29.3,
      29.7, 29.8, 29.8, 29.9, 30.3, 30.4, 30.6, 30.8, 30.9, 31.0,
    ],
  },
  {
    id: "claude",
    label: "Claude",
    opacity: 0.5,
    points: [
      28.5, 28.5, 28.5, 28.5, 28.5, 28.5, 28.4, 28.3, 28.4, 28.2,
      28.2, 28.1, 28.1, 28.2, 28.1, 28.0, 28.0, 28.0, 28.1, 28.1,
      27.9, 28.0, 28.0, 27.8, 27.8, 27.9, 27.8, 27.7, 27.6, 27.7,
    ],
  },
  {
    id: "gemini",
    label: "Gemini",
    opacity: 0.35,
    points: [
      21.7, 21.7, 21.6, 21.9, 21.8, 21.7, 21.7, 21.9, 21.9, 21.8,
      21.9, 21.7, 21.8, 21.9, 21.9, 22.0, 21.8, 21.9, 21.9, 22.1,
      22.0, 22.1, 21.9, 22.0, 22.0, 21.9, 22.2, 22.1, 22.0, 22.1,
    ],
  },
];

export const visibilityTrend: TrendSeries[] = [
  {
    id: "nike",
    label: "Nike",
    color: "var(--ac)",
    area: true,
    points: [
      31.4, 31.6, 31.3, 31.5, 31.8, 31.7, 31.9, 32.1, 31.9, 32.0,
      32.2, 32.1, 32.3, 32.2, 32.4, 32.3, 32.1, 32.2, 32.3, 32.4,
      32.6, 32.9, 33.2, 33.1, 33.4, 33.6, 33.8, 33.7, 34.0, 34.2,
    ],
  },
  {
    id: "adidas",
    label: "Adidas",
    color: "#7fa7d9",
    points: [
      29.4, 29.5, 29.3, 29.6, 29.4, 29.7, 29.5, 29.6, 29.8, 29.6,
      29.7, 29.5, 29.8, 29.6, 29.7, 29.8, 29.6, 29.5, 29.6, 29.7,
      29.5, 29.4, 29.2, 29.3, 29.1, 29.0, 29.1, 28.9, 29.0, 28.9,
    ],
  },
  {
    id: "puma",
    label: "Puma",
    color: "#b98ed9",
    points: [
      22.3, 22.1, 22.4, 22.2, 22.3, 22.5, 22.3, 22.4, 22.6, 22.4,
      22.5, 22.3, 22.5, 22.6, 22.4, 22.5, 22.7, 22.5, 22.4, 22.6,
      22.5, 22.7, 22.6, 22.8, 22.6, 22.7, 22.9, 22.7, 22.8, 22.8,
    ],
  },
];
