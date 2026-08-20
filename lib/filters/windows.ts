/* Live topbar filters — window model + honest multi-window data derivation.
   ============================================================================

   The demo used to ship a single 30-day fixture, so the date-range and platform
   pills could only toast an apology. They now really re-slice the data, and the
   rule that makes that honest is:

       THE LAST 30 POINTS OF EVERY EXTENDED HISTORY ARE THE SHIPPED FIXTURE,
       BYTE FOR BYTE.

   Today's numbers therefore never move: "Last 30 days" renders exactly what it
   always rendered, and every headline stays the endpoint of the chart under it.
   Longer windows prepend a deterministic back-history that is *derived from the
   fixture itself* — its own slope, its own volatility, its own weekday shape —
   damped so a year of back-history stays plausible rather than running off the
   scale. Nothing is random per render: a seeded PRNG makes the same series come
   out identical on the server and in the browser, run after run.

   Two aggregation kinds, because the metrics are two kinds:
   - LEVEL  (visibility %, share of voice, sentiment, avg. position): the KPI is
     the window's endpoint and the delta is endpoint − start-of-window.
   - COUNT  (citations, crawler requests, clicks): the KPI is the window's sum
     and the delta is that sum minus the previous window's sum. Where the frame
     published a delta ("↑ 212", "↑ 18%"), the previous 30-day block is scaled
     to hit that number exactly, so 30d reproduces the shipped card.

   A third shape — DISTINCT counts (unique domains, unique agents, pages
   crawled) — cannot be summed from daily counts (a domain seen twice is still
   one domain), so it uses an explicit saturating accrual curve instead: see
   `accrued()`. */

import type { TrendSeries } from "@/components/app/charts/TrendChart";
import { lastDays, lastWeeks } from "@/lib/data/dates";

/* ───────────────────────────── window model ───────────────────────────── */

export type RangeId = "7d" | "30d" | "90d" | "ytd";
export type PlatformId = "all" | "chatgpt" | "perplexity" | "aioverviews" | "claude" | "gemini";

export type RangeMeta = {
  id: RangeId;
  /** pill label, verbatim from the shipped control */
  label: string;
  /** short suffix for KPI labels ("Citations · 7d") */
  short: string;
  days: number;
  /** whole weeks covered — weekly series (clicks) report at week granularity */
  weeks: number;
};

/* YTD = Jan 1 → Aug 5, 2026, the demo workspace's "today" = 217 days. */
export const RANGES: RangeMeta[] = [
  { id: "7d", label: "Last 7 days · vs prev", short: "7d", days: 7, weeks: 2 },
  { id: "30d", label: "Last 30 days · vs prev", short: "30d", days: 30, weeks: 5 },
  { id: "90d", label: "Last 90 days · vs prev", short: "90d", days: 90, weeks: 13 },
  { id: "ytd", label: "Year to date · vs prev", short: "YTD", days: 217, weeks: 31 },
];

export const DEFAULT_RANGE: RangeId = "30d";

export const RANGE_LABELS: string[] = RANGES.map((r) => r.label);

export function rangeMeta(id: RangeId): RangeMeta {
  return RANGES.find((r) => r.id === id) ?? RANGES[1];
}

export function rangeFromLabel(label: string): RangeId | null {
  return RANGES.find((r) => r.label === label)?.id ?? null;
}

export type PlatformMeta = {
  id: PlatformId;
  /** pill label, verbatim from the shipped control */
  label: string;
  /** short label used inside cards ("ChatGPT only") */
  short: string;
};

export const PLATFORMS: PlatformMeta[] = [
  { id: "all", label: "All platforms", short: "all platforms" },
  { id: "chatgpt", label: "ChatGPT", short: "ChatGPT" },
  { id: "perplexity", label: "Perplexity", short: "Perplexity" },
  { id: "aioverviews", label: "Google AI Overviews", short: "AI Overviews" },
  { id: "claude", label: "Claude", short: "Claude" },
  { id: "gemini", label: "Gemini", short: "Gemini" },
];

export const DEFAULT_PLATFORM: PlatformId = "all";

export const PLATFORM_LABELS: string[] = PLATFORMS.map((p) => p.label);

export function platformMeta(id: PlatformId): PlatformMeta {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0];
}

export function platformFromLabel(label: string): PlatformId | null {
  return PLATFORMS.find((p) => p.label === label)?.id ?? null;
}

/** Longest window (YTD) plus an equal prior window, so count deltas resolve. */
export const HISTORY_DAYS = RANGES[3].days * 2;
export const HISTORY_WEEKS = RANGES[3].weeks * 2;

/* ─────────────────────────── deterministic noise ─────────────────────────── */

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

export function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}

/* ───────────────────────────── level histories ───────────────────────────── */

const levelCache = new Map<string, number[]>();

/** Damping constant: how fast the fixture's own slope fades going backwards. */
const SLOPE_TAU = 110;

/**
 * Extend a level series backwards so the returned array ends with `points`
 * unchanged. The back-history walks the fixture's own slope (damped, so a year
 * back does not run off the chart) with an AR(1) wobble scaled to the fixture's
 * own day-to-day volatility, clamped to a sane band.
 */
export function extendLevel(points: number[], seed: string, total = HISTORY_DAYS): number[] {
  const key = `${seed}|${total}|${points.length}|${points[0]}|${points[points.length - 1]}`;
  const hit = levelCache.get(key);
  if (hit) return hit;

  const n = points.length;
  if (n === 0) return [];
  if (total <= n) {
    const tail = points.slice(n - total);
    levelCache.set(key, tail);
    return tail;
  }

  const decimals = points.every((p) => Number.isInteger(p)) ? 0 : 1;
  const round = (v: number) => Number(v.toFixed(decimals));

  const head = mean(points.slice(0, Math.min(5, n)));
  const tail = mean(points.slice(-Math.min(5, n)));
  const slope = (tail - head) / Math.max(1, n - Math.min(5, n));

  let vol = 0;
  for (let i = 1; i < n; i++) vol += Math.abs(points[i] - points[i - 1]);
  vol = n > 1 ? vol / (n - 1) : 0;

  const dMin = Math.min(...points);
  const dMax = Math.max(...points);
  const lo = Math.max(0, dMin * 0.35);
  const hi = dMax * 1.65;

  const rnd = mulberry32(hashSeed(seed));
  const back: number[] = [];
  let base = points[0];
  let wobble = 0;
  for (let t = 1; t <= total - n; t++) {
    base -= slope * Math.exp(-t / SLOPE_TAU);
    wobble = wobble * 0.72 + (rnd() - 0.5) * vol * 1.3;
    back.push(round(Math.min(hi, Math.max(lo, base + wobble))));
  }
  back.reverse();

  const out = [...back, ...points];
  levelCache.set(key, out);
  return out;
}

/* ───────────────────────────── count histories ───────────────────────────── */

const countCache = new Map<string, number[]>();

/**
 * Extend a daily-count series backwards. The back-history keeps the fixture's
 * weekday shape and grows/shrinks at the rate the published delta implies:
 * pass `prevSum` (the previous window's total, e.g. 1,284 − 212 = 1,072) and
 * the block immediately before the fixture is scaled to hit it EXACTLY, so the
 * 30-day card reproduces the shipped number to the unit.
 */
export function extendCount(
  points: number[],
  seed: string,
  opts: { prevSum?: number; total?: number } = {}
): number[] {
  const total = opts.total ?? HISTORY_DAYS;
  const key = `${seed}|${total}|${points.length}|${opts.prevSum ?? "auto"}`;
  const hit = countCache.get(key);
  if (hit) return hit;

  const n = points.length;
  if (n === 0) return [];
  if (total <= n) {
    const tail = points.slice(n - total);
    countCache.set(key, tail);
    return tail;
  }

  const cur = sum(points);
  const avg = cur / n;

  /* r = previous window ÷ current window. Without a published delta, read the
     fixture's own first-half/second-half ratio (clamped to a believable band). */
  const half = Math.floor(n / 2);
  const shapeRatio = sum(points.slice(0, half)) / Math.max(1e-6, sum(points.slice(half)));
  const r = opts.prevSum ? opts.prevSum / cur : Math.min(1.05, Math.max(0.7, shapeRatio));

  /* Weekday shape, aligned to the fixture's own first day. */
  const wf: number[] = [];
  for (let j = 0; j < 7; j++) {
    const vals = points.filter((_, i) => i % 7 === j);
    wf.push(avg > 0 ? mean(vals) / avg : 1);
  }

  const rnd = mulberry32(hashSeed(seed));
  const back: number[] = [];
  for (let d = 1; d <= total - n; d++) {
    const level = avg * Math.pow(r, d / n);
    const j = ((-d % 7) + 7) % 7;
    const noise = 1 + (rnd() - 0.5) * 0.14;
    back.push(Math.max(0, level * wf[j] * noise));
  }
  back.reverse(); // oldest → newest, ending the day before the fixture starts

  /* Make the immediately-preceding window sum to prevSum exactly. */
  const k = back.length;
  const blockStart = Math.max(0, k - n);
  if (opts.prevSum) {
    const block = back.slice(blockStart);
    const factor = block.length ? opts.prevSum / Math.max(1e-6, sum(block)) : 1;
    for (let i = blockStart; i < k; i++) back[i] *= factor;
  }

  const rounded = back.map((v) => Math.round(v));
  if (opts.prevSum) {
    const drift = Math.round(opts.prevSum) - sum(rounded.slice(blockStart));
    if (drift !== 0) rounded[k - 1] = Math.max(0, rounded[k - 1] + drift);
  }

  const out = [...rounded, ...points];
  countCache.set(key, out);
  return out;
}

/* ─────────────────────────────── slicing ─────────────────────────────── */

export function sliceWindow<T>(history: T[], n: number): T[] {
  return history.slice(Math.max(0, history.length - n));
}

/**
 * The back-history key for one series inside a chart. A headline and the chart
 * under it MUST resolve to the same key, or their windows would be built from
 * two different histories and the delta would stop matching the line.
 */
export function seriesKey(seed: string, id: string): string {
  return `${seed}:${id}`;
}

/** Extend + slice a whole chart's worth of level series for the active range. */
export function levelSeriesForRange(series: TrendSeries[], range: RangeId, seed: string): TrendSeries[] {
  const days = rangeMeta(range).days;
  return series.map((s) => ({ ...s, points: sliceWindow(extendLevel(s.points, seriesKey(seed, s.id)), days) }));
}

/** Windowed points for one series of a chart, keyed exactly as the chart is. */
export function seriesWindow(series: TrendSeries[], range: RangeId, seed: string, index = 0): number[] {
  const s = series[index];
  if (!s) return [];
  return sliceWindow(extendLevel(s.points, seriesKey(seed, s.id)), rangeMeta(range).days);
}

/** The headline for one series of a chart — always that line's own endpoint. */
export function levelStatForRange(series: TrendSeries[], range: RangeId, seed: string, index = 0): LevelStat {
  return levelStat(seriesWindow(series, range, seed, index));
}

/** Extend + slice daily-count series (crawler requests) for the active range. */
export function countSeriesForRange(
  series: TrendSeries[],
  range: RangeId,
  seed: string,
  prevRatio?: number
): TrendSeries[] {
  const days = rangeMeta(range).days;
  return series.map((s) => ({
    ...s,
    points: sliceWindow(
      extendCount(s.points, `${seed}:${s.id}`, prevRatio ? { prevSum: sum(s.points) * prevRatio } : {}),
      days
    ),
  }));
}

/** Extend + slice weekly-count series (clicks) for the active range. */
export function weeklySeriesForRange(series: TrendSeries[], range: RangeId, seed: string): TrendSeries[] {
  const weeks = rangeMeta(range).weeks;
  return series.map((s) => ({
    ...s,
    points: sliceWindow(extendCount(s.points, `${seed}:${s.id}:w`, { total: HISTORY_WEEKS }), weeks),
  }));
}

/* ──────────────────────────── stats & formatting ──────────────────────────── */

export type LevelStat = { value: number; delta: number };

/** KPI for a level metric: endpoint, and endpoint − start-of-window. */
export function levelStat(points: number[]): LevelStat {
  if (!points.length) return { value: 0, delta: 0 };
  return { value: points[points.length - 1], delta: points[points.length - 1] - points[0] };
}

export type CountStat = { value: number; prev: number; delta: number; pct: number };

/** KPI for a count metric: window sum vs the previous window's sum. */
export function countStat(history: number[], n: number): CountStat {
  const end = history.length;
  const value = sum(history.slice(Math.max(0, end - n), end));
  const prev = sum(history.slice(Math.max(0, end - 2 * n), Math.max(0, end - n)));
  return { value, prev, delta: value - prev, pct: prev > 0 ? ((value - prev) / prev) * 100 : 0 };
}

/**
 * Distinct-entity counts (unique domains, unique agents, distinct pages
 * crawled) do not add up across days — a domain seen on twenty days is still
 * one domain. They accrue on a saturating curve instead: the 30-day fixture is
 * the anchor and other windows scale by (days/30)^exponent.
 */
export function accrued(value30: number, days: number, exponent = 0.5): number {
  return Math.round(value30 * Math.pow(days / 30, exponent));
}

/** Distinct-count KPI: the curve for this window, minus the same curve for the
    previous window's (lower) anchor. At 30 days it returns the shipped pair. */
export function accruedStat(value30: number, delta30: number, days: number, exponent = 0.5): LevelStat {
  const value = accrued(value30, days, exponent);
  const prev = accrued(value30 - delta30, days, exponent);
  return { value, delta: value - prev };
}

/** True when the delta rounds to nothing at this precision (a flat window). */
export function isFlat(delta: number, decimals = 1): boolean {
  return Math.abs(Number(delta.toFixed(decimals))) < Number.EPSILON;
}

export function fmtDelta(delta: number, decimals = 1, unit = ""): string {
  const v = Math.abs(delta);
  const shown = decimals === 0 ? Math.round(v).toLocaleString("en-US") : v.toFixed(decimals);
  /* a short window can be genuinely flat — say so instead of pointing an arrow
     at nothing (the card then renders it muted rather than green/red) */
  return `${isFlat(delta, decimals) ? "±" : delta < 0 ? "↓" : "↑"} ${shown}${unit}`;
}

/** KpiCard's `deltaGood`: green up, red down, muted when flat. */
export function deltaTone(delta: number, decimals = 1): boolean | undefined {
  return isFlat(delta, decimals) ? undefined : delta >= 0;
}

export function fmtInt(v: number): string {
  return Math.round(v).toLocaleString("en-US");
}

/* ─────────────────────────────── axis labels ─────────────────────────────── */

/* ─────────────────────────────── y axes ─────────────────────────────── */

function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  for (const m of [1, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * mag >= raw - 1e-9) return m * mag;
  return 10 * mag;
}

/**
 * Keep the frame's painted y-axis whenever the window still fits inside it —
 * so "Last 30 days" is pixel-identical — and widen to a nice round axis with
 * the same tick count when a longer window runs past it.
 */
export function windowAxis(
  values: number[],
  shipped: { domain: [number, number]; labels: string[] },
  fmtTick: (v: number) => string
): { domain: [number, number]; labels: string[] } {
  if (!values.length) return shipped;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min >= shipped.domain[0] && max <= shipped.domain[1]) return shipped;

  const ticks = shipped.labels.length;
  let step = niceStep((max - min) / Math.max(1, ticks - 1));
  let lo = Math.floor(min / step) * step;
  let guard = 0;
  while (lo + step * (ticks - 1) < max && guard++ < 20) {
    step = niceStep(step * 1.5);
    lo = Math.floor(min / step) * step;
  }
  const hi = lo + step * (ticks - 1);
  const labels: string[] = [];
  for (let i = ticks - 1; i >= 0; i--) labels.push(fmtTick(lo + step * i));
  return { domain: [lo, hi], labels };
}

/** Daily date labels for the active window, ending on the workspace's Aug 5. */
export function windowDayLabels(range: RangeId): string[] {
  return lastDays(rangeMeta(range).days);
}

/** Weekly date labels for the active window (weekly series: clicks). */
export function windowWeekLabels(range: RangeId): string[] {
  return lastWeeks(rangeMeta(range).weeks);
}

/**
 * Five evenly spaced ticks. The floor-spacing reproduces the shipped 30-day
 * axis exactly (Jul 7 · Jul 14 · Jul 21 · Jul 28 · Aug 5).
 */
export function axisTicks(labels: string[], count = 5): string[] {
  const n = labels.length;
  if (n === 0) return [];
  /* a 7-day window has few enough points to label every one — evenly spaced
     ticks would otherwise land on uneven dates (Jul 30 · Jul 31 · Aug 2 …) */
  if (n <= count + 3) return labels;
  const out: string[] = [];
  for (let k = 0; k < count - 1; k++) out.push(labels[Math.floor((k * (n - 1)) / (count - 1))]);
  out.push(labels[n - 1]);
  return out;
}
