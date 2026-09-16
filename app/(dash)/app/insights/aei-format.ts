import type { DayPoint } from "@/lib/live/metrics";

/* Answer Engine Insights — formatting helpers for the live Topics screen.

   Formatting only: every function takes numbers the metrics layer measured and
   returns a string. Nothing here invents a value, and nothing here reaches into
   lib/data or lib/filters/windows (both synthesize back-history from fixtures —
   this screen reports only the days the sampler actually ran).

   Dates are formatted in UTC from the metrics layer's YYYY-MM-DD day keys so
   server render and hydration produce identical text. */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09-16" → "Sep 16" */
export function dayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d || m < 1 || m > 12) return iso;
  return `${MONTHS[m - 1]} ${d}`;
}

/** epoch ms → "Sep 16, 09:04 UTC" */
export function stampUTC(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`;
}

export const pct = (n: number, dp = 1) => `${n.toFixed(dp)}%`;
export const int = (n: number) => Math.round(n).toLocaleString("en-US");
export const s = (n: number) => (n === 1 ? "" : "s");

/** "N day(s) of history" — the honest trend label. */
export function historyNote(days: number): string {
  return `${days} day${s(days)} of history`;
}

/**
 * Change across the sampled series, or null when there is not enough history.
 * One sampled day yields no delta — callers hide the figure rather than
 * fabricate a trend.
 */
export function seriesDelta(series: DayPoint[], pick: (p: DayPoint) => number): number | null {
  if (series.length < 2) return null;
  return Math.round((pick(series[series.length - 1]) - pick(series[0])) * 10) / 10;
}

/** Axis derived from the data itself — no fixed fixture domain. */
export function niceAxis(values: number[], unit: string, dp: number): { domain: [number, number]; labels: string[] } {
  const clean = values.filter((v) => Number.isFinite(v));
  let lo = clean.length ? Math.min(...clean) : 0;
  let hi = clean.length ? Math.max(...clean) : 1;
  if (hi === lo) {
    const pad = Math.max(Math.abs(hi) * 0.1, 1);
    lo -= pad;
    hi += pad;
  } else {
    const pad = (hi - lo) * 0.15;
    lo -= pad;
    hi += pad;
  }
  lo = Math.max(0, lo);
  const labels = [0, 1, 2, 3].map((i) => {
    const v = hi - ((hi - lo) * i) / 3;
    return `${Number(v.toFixed(dp)).toLocaleString("en-US")}${unit}`;
  });
  return { domain: [lo, hi], labels };
}

/** Evenly spaced subset of x labels so a long series doesn't crowd the axis. */
export function axisTicks(labels: string[], max = 6): string[] {
  if (labels.length <= max) return labels;
  const out: string[] = [];
  for (let i = 0; i < max; i++) out.push(labels[Math.round((i * (labels.length - 1)) / (max - 1))]);
  return out;
}
