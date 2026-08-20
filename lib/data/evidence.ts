/* Evidence-cluster chart fixtures (Citations / Watched URLs / Prompts /
   Conversations).

   Endpoint constraints honored (fixture story, Jul 7 – Aug 5 window):
   - `sourceMix` counts sum to exactly 1,284 — the Citations page headline
     ("Total citations" KPI and the donut's center label).
   - Each segment's `pct` matches the frame's legend (Owned 38 / Editorial 30 /
     Community 20 / Reference 12, summing to 100) and each `count` is that
     share of 1,284 (488 + 385 + 257 + 154 = 1,284).
   - `dash`/`offset` are the frame's exact stroke-dasharray geometry on the
     r=60 ring (circumference ≈ 377), kept verbatim for pixel fidelity. */

export type SourceMixSegment = {
  key: string;
  label: string;
  /** citations attributed to this source class over the 30-day window */
  count: number;
  /** share of all 1,284 citations, % — matches the frame legend */
  pct: number;
  color: string;
  /** frame-exact donut geometry: strokeDasharray first value */
  dash: number;
  /** frame-exact donut geometry: strokeDashoffset (0 for the first segment) */
  offset: number;
};

export const CITATIONS_TOTAL = 1284;

export const sourceMix: SourceMixSegment[] = [
  { key: "owned", label: "Owned", count: 488, pct: 38, color: "var(--ac)", dash: 143, offset: 0 },
  { key: "editorial", label: "Editorial", count: 385, pct: 30, color: "#7fa7d9", dash: 113, offset: -143 },
  { key: "community", label: "Community", count: 257, pct: 20, color: "#b98ed9", dash: 75, offset: -256 },
  { key: "reference", label: "Reference", count: 154, pct: 12, color: "#d9b679", dash: 46, offset: -331 },
];

/* ── KPI-backing series (added with the live topbar filters) ────────────────
   The Citations KPI row now derives from data instead of hardcoded strings, so
   picking 7d / 90d / YTD re-slices it honestly. The 30-day window reproduces
   the shipped card exactly.

   `citationsDaily` sums to CITATIONS_TOTAL (1,284) over the window and its
   previous 30-day block is pinned to 1,072 = 1,284 − the card's "↑ 212", so
   the 30-day delta is exactly the shipped one. */

export const CITATIONS_PREV_TOTAL = CITATIONS_TOTAL - 212;

/** Citations per day, Jul 7 – Aug 5 — sums to exactly 1,284. */
export const citationsDaily: number[] = [
  35, 38, 41, 39, 37, 40, 43, 39, 40, 44,
  38, 41, 39, 41, 42, 42, 45, 45, 46, 48,
  47, 48, 42, 42, 47, 50, 48, 43, 44, 50,
];

/** Owned-source share, daily — ends 38 (the KPI), starts 34 so "↑ 4pt" is true. */
export const ownedShareSeries: number[] = [
  34.0, 34.1, 34.2, 34.5, 34.6, 34.7, 34.8, 34.9, 35.1, 35.2,
  35.4, 35.6, 35.7, 35.8, 36.0, 36.0, 36.3, 36.4, 36.4, 36.7,
  36.7, 36.8, 37.0, 37.1, 37.2, 37.4, 37.5, 37.7, 37.8, 38.0,
];

/** Answers with ≥1 citation, daily — ends 71, starts 73 so "↓ 2pt" is true. */
export const answersWithCitationSeries: number[] = [
  73.0, 73.0, 72.8, 72.7, 72.6, 72.7, 72.6, 72.5, 72.5, 72.4,
  72.4, 72.3, 72.3, 72.0, 72.1, 72.0, 72.0, 71.8, 71.7, 71.8,
  71.7, 71.7, 71.4, 71.4, 71.2, 71.3, 71.2, 71.2, 71.1, 71.0,
];

/** Unique cited domains over the shipped 30-day window, and its "↑ 9". Distinct
    counts do not sum across days, so other windows use the saturating accrual
    curve in lib/filters/windows.ts rather than a sum. */
export const UNIQUE_DOMAINS_30D = 86;
export const UNIQUE_DOMAINS_DELTA_30D = 9;
