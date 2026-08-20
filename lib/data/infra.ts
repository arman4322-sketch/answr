import type { TrendSeries } from "@/components/app/charts/TrendChart";
import { last30Days } from "@/lib/data/dates";

/* Fixture data for the Agent Analytics (infrastructure) cluster.
   Window: Jul 7 – Aug 5, 2026 (30 daily points, labels from last30Days()).

   Endpoint / sum constraints honored (the fixture story):
   - Crawl activity by agent: each bot's 30 points sum EXACTLY to its 30-day
     request total in the Agents table on /app/agents —
       GPTBot 21,408 · PerplexityBot 11,872 · ClaudeBot 8,455 · Google-Extended 4,206.
     The page's headline "AI crawler requests 48,231" = those four (45,941)
     + Bytespider 1,914 + Applebot-Extended 347 + 29 requests across the eight
     remaining minor agents (14 unique agents total).
   - Jul 26 (index 19) is a crawl-burst day pinned to the values the design's
     depicted tooltip showed: 806 / 480 / 351 / 209 requests.
   - Referred humans by platform: series sums match the Referring-platform
     share table on /app/agents/referrals — ChatGPT 1,877 (55%), Perplexity 819
     (24%), Gemini 341 (10%) of the 3,412 total AI referrals.
   - Analytics connection: Answr-logs points are the all-platform daily totals
     (ChatGPT + Perplexity + Gemini + Copilot/Claude remainder), summing to the
     headline 3,412; GA4 sessions sum to 3,274 — i.e. Answr's edge logs count
     4.2% more AI referrals than GA4 (3,412 ÷ 3,274 ≈ 1.042), per the card copy. */

/** X labels shared by every 30-day chart in this cluster: ["Jul 7", …, "Aug 5"] */
export const infraDays: string[] = last30Days();

/** Crawl activity by agent (requests/day) — /app/agents */
export const crawlerActivitySeries: TrendSeries[] = [
  {
    id: "gptbot",
    label: "GPTBot",
    color: "var(--ac)",
    // sum = 21,408 (Agents table); Jul 26 = 806
    points: [612, 624, 614, 611, 610, 627, 653, 678, 669, 680, 665, 653, 670, 698, 711, 748, 731, 741, 743, 806, 784, 785, 782, 773, 754, 766, 771, 805, 813, 831],
  },
  {
    id: "perplexitybot",
    label: "PerplexityBot",
    color: "#7fa7d9",
    // sum = 11,872 (Agents table); Jul 26 = 480
    points: [337, 334, 323, 326, 343, 354, 357, 374, 356, 348, 350, 360, 380, 385, 404, 399, 393, 410, 443, 480, 470, 460, 430, 421, 411, 426, 439, 452, 456, 451],
  },
  {
    id: "claudebot",
    label: "ClaudeBot",
    color: "#b98ed9",
    // sum = 8,455 (Agents table); Jul 26 = 351
    points: [241, 225, 227, 234, 250, 253, 260, 255, 250, 248, 250, 270, 282, 283, 270, 275, 274, 308, 326, 351, 341, 321, 297, 298, 292, 313, 321, 317, 317, 306],
  },
  {
    id: "google-extended",
    label: "Google-Extended",
    color: "#d9b679",
    // sum = 4,206 (Agents table); Jul 26 = 209
    points: [104, 103, 110, 118, 115, 119, 119, 111, 111, 123, 125, 130, 129, 130, 126, 131, 142, 167, 196, 209, 188, 167, 156, 150, 155, 160, 154, 151, 152, 155],
  },
];

/* ── Window-aware totals (added with the live topbar filters) ───────────────
   The Agents KPI row sums the crawl series over whichever window is selected,
   so 7d / 90d / YTD are real sums rather than a hardcoded string. The four
   charted bots cover 45,941 of the headline's 48,231 requests; the remaining
   2,290 belong to the ten minor agents the chart does not draw, so the total
   is the charted sum lifted by a constant factor. At 30 days that returns
   exactly 48,231, and the previous 30-day block is pinned to 48,231 ÷ 1.18 so
   the card's "↑ 18%" is exactly true. */

/** Requests logged by the four charted bots over the shipped 30-day window. */
export const CHARTED_CRAWL_REQUESTS = crawlerActivitySeries.reduce(
  (t, s) => t + s.points.reduce((a, b) => a + b, 0),
  0
); // 45,941

/** Headline "AI crawler requests" for the shipped window (all 14 agents). */
export const CRAWL_REQUESTS_30D = 48231;

/** Minor-agent uplift: charted bots → all agents. */
export const CRAWL_TOTAL_UPLIFT = CRAWL_REQUESTS_30D / CHARTED_CRAWL_REQUESTS;

/** Previous window ÷ current window, from the card's "↑ 18%". */
export const CRAWL_PREV_RATIO = 1 / 1.18;

/** Blocked requests and the /help share of them, over the shipped window. */
export const BLOCKED_REQUESTS_30D = 312;
export const BLOCKED_ON_HELP_30D = 214;

/** Distinct-count anchors for the shipped window (see `accrued()`). */
export const UNIQUE_AGENTS_30D = 14;
export const UNIQUE_AGENTS_DELTA_30D = 2;
export const PAGES_CRAWLED_30D = 1846;
export const PAGES_CRAWLED_DELTA_30D = 214;

/** Referred humans by platform (humans/day) — /app/agents/referrals */
export const referredHumansSeries: TrendSeries[] = [
  {
    id: "chatgpt",
    label: "ChatGPT",
    color: "var(--ac)",
    // sum = 1,877 = 55% of the 3,412 total (Referring-platform table)
    points: [48, 54, 56, 58, 57, 55, 55, 53, 58, 62, 63, 63, 61, 59, 59, 61, 66, 68, 67, 68, 63, 63, 68, 71, 73, 70, 71, 70, 68, 69],
  },
  {
    id: "perplexity",
    label: "Perplexity",
    color: "#7fa7d9",
    // sum = 819 = 24% of 3,412 (share table; ↓ 2pt window = gently declining)
    points: [29, 29, 30, 30, 28, 27, 27, 28, 30, 28, 29, 28, 26, 24, 27, 29, 29, 27, 26, 24, 25, 26, 27, 30, 28, 26, 24, 23, 26, 29],
  },
  {
    id: "gemini",
    label: "Gemini",
    color: "#b98ed9",
    // sum = 341 = 10% of 3,412 (share table)
    points: [12, 13, 12, 9, 10, 9, 10, 13, 11, 11, 10, 9, 10, 11, 13, 13, 11, 10, 11, 10, 12, 13, 13, 13, 11, 11, 11, 12, 13, 14],
  },
];

/** Answr edge logs vs GA4 sessions (AI referrals/day) — Analytics connection card */
export const analyticsComparisonSeries: TrendSeries[] = [
  {
    id: "answr",
    label: "Answr logs",
    color: "var(--ac)",
    // sum = 3,412 (headline total; daily totals across all five platforms)
    points: [101, 110, 109, 108, 106, 102, 105, 107, 111, 113, 112, 111, 109, 108, 113, 116, 118, 116, 116, 115, 114, 116, 122, 127, 124, 119, 118, 119, 122, 125],
  },
  {
    id: "ga4",
    label: "GA4 sessions",
    color: "#7fa7d9",
    // sum = 3,274 — Answr counts 4.2% more (3,412 ÷ 3,274 ≈ 1.042)
    points: [97, 106, 105, 104, 102, 98, 101, 103, 107, 108, 107, 107, 105, 104, 108, 111, 113, 111, 111, 110, 109, 111, 117, 122, 119, 114, 113, 114, 117, 120],
  },
];
