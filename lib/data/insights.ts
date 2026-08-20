/* Fixture data for the Answer Engine Insights cluster (Topics, Sentiment,
   Shopping, Audiences, Topic detail). 30 daily points per series covering the
   demo window Jul 7 – Aug 5, 2026 (labels from last30Days()).

   Endpoint constraints honored (series' last point = the headline the page shows):
   - Share of voice, Nike: ends 34.2 — the workspace's headline number per the
     wiring assignment (chart is the OVERALL trend; the AEI topics table values
     are per-topic and intentionally differ). Window start 23.5 keeps the frame's
     strong upward story with a visible lift after late July.
   - Share of voice, competitors: endpoints match the frame's painted final
     points (read off the frame's 10–40% axis): Adidas 24.9, Puma 18.8,
     Under Armour 13.1. Colors are the frame's legend assignments.
   - Positive sentiment: ends 74 (headline "74%"), starts 71 so "↑ 3pt" is true.
   - Shopping recommendation rate: ends 31.4 (headline "31.4%"), starts 29.2 so
     "↑ 2.2" is true.
   - Audience visibility (Marathon runners): ends 44.6 (headline "44.6%"), starts
     41.5 so "↑ 3.1" is true.
   - Topic visibility (Running shoes): ends 42.6 — the AEI topics table's
     Running shoes share-of-voice row — starts 36.4 so "↑ 6.2" is true.
   - Heatmap cell visibilities are the frame's printed cell labels; per-cell
     30d deltas average to each topic's Δ30d from the topics table (+6.2, +3.8,
     +1.4, −2.1, −0.7), with the Running shoes × ChatGPT cell keeping the
     frame's depicted "↑ 4pt".
   - Regional visibility (US / UK / DACH): three constraints, all fixed by the
     Regions screen itself — see the comment on regionsSeries below. */

import { last30Days } from "@/lib/data/dates";
import type { TrendSeries } from "@/components/app/charts/TrendChart";

export const insightsDays = last30Days();

/* AEI Topics — "Share of voice — all tracked prompts" */
export const visibilityByBrandSeries: TrendSeries[] = [
  {
    id: "nike",
    label: "Nike",
    color: "var(--ac)",
    points: [23.5, 23.8, 24.3, 25.6, 25.7, 25.8, 26.1, 26.4, 26.6, 27.2, 27.6, 27.5, 27.8, 28.6, 28.7, 28.8, 29.2, 29.5, 30.1, 30.2, 31.2, 30.9, 31.8, 31.6, 31.9, 32.3, 32.8, 33.4, 34.0, 34.2],
  },
  {
    id: "adidas",
    label: "Adidas",
    color: "#7fa7d9",
    points: [23.3, 23.4, 23.4, 23.6, 23.6, 23.9, 23.7, 23.4, 23.8, 23.9, 23.8, 23.9, 24.2, 24.0, 24.2, 24.3, 23.9, 24.0, 24.1, 24.3, 24.3, 24.5, 24.2, 24.6, 24.7, 24.6, 25.0, 25.0, 25.1, 24.9],
  },
  {
    id: "puma",
    label: "Puma",
    color: "#b98ed9",
    points: [16.0, 16.1, 16.1, 16.0, 16.1, 16.2, 16.2, 16.4, 16.7, 16.9, 17.2, 17.2, 17.3, 17.1, 17.1, 17.5, 17.5, 17.7, 17.8, 17.6, 18.0, 18.0, 18.2, 18.1, 18.0, 18.6, 18.4, 18.3, 18.6, 18.8],
  },
  {
    id: "under-armour",
    label: "Under Armour",
    color: "#d9b679",
    points: [14.7, 14.8, 14.4, 14.6, 14.2, 14.1, 14.6, 14.2, 14.3, 14.0, 14.3, 14.3, 13.9, 13.8, 13.7, 14.0, 14.0, 13.6, 13.7, 13.8, 13.7, 13.6, 13.6, 13.5, 13.3, 13.0, 13.0, 13.5, 13.0, 13.1],
  },
];

/* AEI Topics — "Visibility by topic × platform" heatmap */
export type AeiHeatCell = { visibility: number; delta: number };

export const aeiHeatPlatforms = ["ChatGPT", "Perplexity", "AI Overviews", "Claude", "Gemini"] as const;

export const aeiHeatRows: { topic: string; cells: AeiHeatCell[] }[] = [
  {
    topic: "Running shoes",
    cells: [
      { visibility: 58, delta: 4.0 },
      { visibility: 44, delta: 6.6 },
      { visibility: 51, delta: 7.8 },
      { visibility: 33, delta: 5.4 },
      { visibility: 27, delta: 7.2 },
    ],
  },
  {
    topic: "Training apparel",
    cells: [
      { visibility: 49, delta: 4.2 },
      { visibility: 41, delta: 3.1 },
      { visibility: 36, delta: 4.6 },
      { visibility: 30, delta: 2.9 },
      { visibility: 22, delta: 4.2 },
    ],
  },
  {
    topic: "Sneaker releases",
    cells: [
      { visibility: 38, delta: 2.2 },
      { visibility: 34, delta: 0.8 },
      { visibility: 24, delta: 1.9 },
      { visibility: 29, delta: 1.6 },
      { visibility: 18, delta: 0.5 },
    ],
  },
  {
    topic: "Sustainability",
    cells: [
      { visibility: 26, delta: -2.8 },
      { visibility: 21, delta: -1.6 },
      { visibility: 15, delta: -2.4 },
      { visibility: 19, delta: -1.2 },
      { visibility: 12, delta: -2.5 },
    ],
  },
  {
    topic: "Basketball gear",
    cells: [
      { visibility: 22, delta: -1.1 },
      { visibility: 17, delta: -0.3 },
      { visibility: 11, delta: -0.9 },
      { visibility: 14, delta: 0.2 },
      { visibility: 8, delta: -1.4 },
    ],
  },
];

/* Sentiment — "Positive sentiment" (green = semantic good, the frame's color) */
export const sentimentSeries: TrendSeries[] = [
  {
    id: "positive",
    label: "Positive sentiment",
    color: "var(--good)",
    points: [71.0, 70.6, 71.0, 71.3, 71.7, 72.1, 71.4, 71.9, 71.9, 72.0, 72.4, 71.7, 72.2, 72.4, 72.3, 72.6, 72.2, 72.3, 72.9, 73.2, 73.4, 73.1, 72.9, 72.9, 73.1, 73.7, 73.5, 73.4, 74.3, 74.0],
  },
];

/* Shopping — "Recommendation rate" */
export const shoppingSeries: TrendSeries[] = [
  {
    id: "rec-rate",
    label: "Recommendation rate",
    color: "var(--ac)",
    points: [29.2, 29.0, 29.0, 29.5, 29.3, 29.4, 29.4, 29.7, 30.2, 30.1, 29.6, 30.2, 29.9, 29.9, 30.7, 30.6, 30.4, 30.7, 30.2, 30.6, 30.8, 31.2, 30.6, 31.2, 30.8, 30.8, 31.4, 31.0, 31.5, 31.4],
  },
];

/* Audiences — "Visibility — Marathon runners" (frame draws a soft area fill) */
export const audienceSeries: TrendSeries[] = [
  {
    id: "marathon-runners",
    label: "Marathon runners",
    color: "var(--ac)",
    area: true,
    points: [41.5, 41.3, 41.4, 41.7, 41.7, 41.9, 42.0, 42.1, 42.2, 42.2, 42.2, 42.8, 42.3, 43.0, 43.2, 43.5, 43.2, 43.5, 43.0, 43.9, 43.9, 44.0, 43.6, 44.0, 43.7, 44.0, 43.9, 44.0, 44.6, 44.6],
  },
];

/* Regions — "Regional visibility" (the three regions the card's legend charts).

   Three constraints the Regions screen fixes, honored exactly:
   1. Jul 26 (index 19) is canon — it is the reading the frame painted into its
      pinned tooltip: US 35.3, UK 29.8, DACH 22.4.
   2. Each ENDPOINT (Aug 5, index 29) is that region's Visibility in the page's
      own "By region" table: US 41.2, UK 33.8, DACH 27.4.
   3. Each START (Jul 7, index 0) is endpoint − the table's Δ 30d (+2.4, +1.6,
      +3.9), so the printed delta is literally true of the line: US 38.8,
      UK 32.2, DACH 23.5.
   Constraints 1 and 3 put Jul 26 BELOW the window's start in all three regions,
   so the honest shape is a mid-window slide bottoming out around Jul 24–25 and
   a strong recovery through the final ten days — the same story the screen's
   "fastest-rising region" and translation-gap findings tell. Between-points
   carry gentle day-to-day noise and every point stays inside the card's painted
   15–45% axis band. Colors are the card's own legend swatches. */
export const regionsSeries: TrendSeries[] = [
  {
    id: "united-states",
    label: "United States",
    color: "var(--ac)",
    points: [38.8, 38.6, 38.9, 38.4, 38.0, 38.2, 37.6, 37.4, 37.7, 37.1, 36.8, 36.9, 36.4, 36.0, 35.8, 35.9, 35.4, 35.0, 35.1, 35.3, 35.8, 36.5, 37.0, 37.8, 38.3, 39.1, 39.5, 40.2, 40.9, 41.2],
  },
  {
    id: "united-kingdom",
    label: "United Kingdom",
    color: "#7fa7d9",
    points: [32.2, 32.0, 32.1, 31.8, 31.5, 31.6, 31.2, 31.0, 31.1, 30.7, 30.5, 30.6, 30.2, 30.0, 29.8, 29.9, 29.5, 29.4, 29.6, 29.8, 30.2, 30.7, 31.0, 31.5, 31.9, 32.3, 32.6, 33.1, 33.5, 33.8],
  },
  {
    id: "dach",
    label: "DACH",
    color: "#d9b679",
    points: [23.5, 23.4, 23.6, 23.3, 23.2, 23.4, 23.1, 22.9, 23.0, 22.8, 22.7, 22.9, 22.6, 22.4, 22.3, 22.5, 22.2, 22.1, 22.2, 22.4, 22.9, 23.5, 24.1, 24.6, 25.2, 25.7, 26.2, 26.6, 27.1, 27.4],
  },
];

/* Topic detail — Running shoes "Topic visibility" */
export const topicRunningShoesSeries: TrendSeries[] = [
  {
    id: "topic-visibility",
    label: "Topic visibility",
    color: "var(--ac)",
    points: [36.4, 36.9, 37.4, 37.5, 37.0, 37.6, 37.7, 37.7, 38.7, 38.8, 38.8, 38.7, 39.3, 39.3, 39.4, 39.9, 39.4, 40.3, 40.5, 40.8, 40.4, 41.2, 41.4, 41.6, 41.8, 42.2, 42.1, 42.3, 41.9, 42.6],
  },
];
