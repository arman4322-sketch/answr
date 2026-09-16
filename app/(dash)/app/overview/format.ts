import type { DayPoint, LiveMetrics } from "@/lib/live/metrics";

/* Overview view helpers — formatting only.

   Deliberately local to this screen and deliberately free of lib/data and
   lib/filters/windows: those synthesize back-history from a fixture, and this
   screen now reports only days that were actually sampled. Nothing here invents
   a value — every function takes real numbers in and returns a string.

   Dates are formatted in UTC from the day keys the metrics layer produces
   (YYYY-MM-DD), so server and client render identical text. */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09-16" → "Sep 16" */
export function dayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d || m < 1 || m > 12) return iso;
  return `${MONTHS[m - 1]} ${d}`;
}

/** epoch ms → "Sep 16, 09:04 UTC" (UTC keeps SSR and hydration identical) */
export function stampUTC(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`;
}

export const pct = (n: number, dp = 1) => `${n.toFixed(dp)}%`;
export const int = (n: number) => Math.round(n).toLocaleString("en-US");
export const s = (n: number) => (n === 1 ? "" : "s");

/** "↑ 2.8" / "↓ 0.4" — only ever called with a delta computed from real points. */
export function fmtDelta(d: number, dp = 1): string {
  return `${d >= 0 ? "↑" : "↓"} ${Math.abs(d).toFixed(dp)}`;
}

/**
 * Change across the sampled series, or null when there is not enough history.
 * A single sampled day yields no delta — the card hides it rather than
 * fabricating one.
 */
export function seriesDelta(series: DayPoint[], pick: (p: DayPoint) => number): number | null {
  if (series.length < 2) return null;
  return Math.round((pick(series[series.length - 1]) - pick(series[0])) * 10) / 10;
}

/** "1 day of history" / "12 days of history" — the honest trend label. */
export function historyNote(days: number): string {
  return `${days} day${s(days)} of history`;
}

/** Axis from the data itself (no fixed fixture domain). */
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

/**
 * The screen's written summary, composed strictly from measured values.
 * Replaces the fixture's authored weekly narrative: no claim appears here that
 * is not a number this workspace actually produced.
 */
export function summaryLines(m: LiveMetrics): string[] {
  const brand = m.workspace?.brand ?? "This workspace";

  if (!m.configured) {
    return ["No brand configured yet — set your brand, domain and competitors, then start a run from Settings › Platforms to collect answers."];
  }
  if (!m.hasData) {
    return [
      `No sample has run yet for ${brand}. The first run covers ${int(m.promptsTracked)} tracked prompt${s(m.promptsTracked)}; every figure on this screen stays at zero until it lands. Start it from Settings › Platforms.`,
    ];
  }

  const lines: string[] = [];
  lines.push(
    `${brand} appears in ${pct(m.visibilityScore)} of sampled answers and holds ${pct(m.shareOfVoice)} of tracked-brand mentions — from ${int(m.answersSampled)} answer${s(m.answersSampled)} across ${int(m.promptsTracked)} prompt${s(m.promptsTracked)}, over ${historyNote(m.days)}.`
  );

  const delta = seriesDelta(m.series, (p) => p.visibility);
  lines.push(
    delta === null
      ? `Only ${historyNote(m.days)} so far — a trend needs at least two sampled days, so no change is reported.`
      : `Visibility ${delta >= 0 ? "rose" : "fell"} ${Math.abs(delta).toFixed(1)}pt between ${dayLabel(m.series[0].date)} and ${dayLabel(m.series[m.series.length - 1].date)}.`
  );

  lines.push(
    m.avgAnswerPosition != null
      ? `Average mention position ${m.avgAnswerPosition.toFixed(1)}; named ahead of every competitor in ${int(m.answerRankFirst)} answer${s(m.answerRankFirst)}.`
      : `${brand} has not been named in any sampled answer yet, so there is no answer position to report.`
  );

  const top = m.platforms[0];
  if (top) {
    lines.push(
      `Strongest platform: ${top.label} at ${pct(top.visibility)} (${int(top.appearances)} of ${int(top.answers)} answer${s(top.answers)}).`
    );
  }

  lines.push(
    m.citationsCount > 0
      ? `${int(m.citationsCount)} citation${s(m.citationsCount)} across ${int(m.uniqueCitedDomains)} domain${s(m.uniqueCitedDomains)}; ${pct(m.ownedCitationShare)} point at ${m.workspace?.domain || "your own domain"}.`
      : "No citations captured yet — the sampled answers returned no source links."
  );

  return lines;
}
