import type { TrendSeries } from "@/components/app/charts/TrendChart";
import type { Bar } from "@/components/app/charts/BarChart";

/* Demand cluster chart fixtures — keyword detail "best running shoes".

   Endpoint constraints honored (fixture story):
   - Granularity follows the frame, not lastWeeks(): 13 bi-weekly points
     Feb 1 → Aug 1 2026, matching the frame's 13-vertex path and its static
     Feb–Jul month axis (kept verbatim under the chart).
   - Last point = 128 → the page's headline "128K" prompt volume.
   - Jul 1 = 116 → headline delta "↑ 12K vs prev." (reading 30 days back = 128 − 12).
   - Jun 15 = 106 → the frame's depicted hover tooltip ("Jun · 106K").
   - All values sit inside the frame's 40K–160K axis (page passes yDomain [40, 160]).
   - Growth accelerates after mid-June, matching the platform card's note
     ("ChatGPT demand grew 13% after the June shopping rollout"). */

export const demandKeywordTrendLabels: string[] = [
  "Feb 1", "Feb 15", "Mar 1", "Mar 15", "Apr 1", "Apr 15", "May 1",
  "May 15", "Jun 1", "Jun 15", "Jul 1", "Jul 15", "Aug 1",
];

export const demandKeywordTrend: TrendSeries[] = [
  {
    id: "volume",
    label: "Total prompt volume",
    color: "var(--ac)",
    area: true,
    points: [79, 81, 80, 87, 90, 88, 96, 99, 98, 106, 116, 121, 128],
  },
];

/* Age breakdown (the "Age" demographic card — the page's only vertical-bar
   chart; the "By platform" breakdown is a row list, left static). Shares sum
   to 100 and reproduce the frame's relative bar heights (25-34 tallest, then
   35-44, 45-54, 18-24, 55+). Colors are the frame's accent-opacity ramp
   (--ac = #8E7CF2 = rgb(142,124,242)). */
export const demandKeywordAgeBars: Bar[] = [
  { label: "18-24", segments: [{ key: "share", label: "Share of demand", value: 9, color: "rgba(142,124,242,0.35)" }] },
  { label: "25-34", segments: [{ key: "share", label: "Share of demand", value: 37, color: "var(--ac)" }] },
  { label: "35-44", segments: [{ key: "share", label: "Share of demand", value: 30, color: "rgba(142,124,242,0.8)" }] },
  { label: "45-54", segments: [{ key: "share", label: "Share of demand", value: 18, color: "rgba(142,124,242,0.55)" }] },
  { label: "55+", segments: [{ key: "share", label: "Share of demand", value: 6, color: "rgba(142,124,242,0.3)" }] },
];
