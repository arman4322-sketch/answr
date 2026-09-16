import type { CitedDomain, LiveMetrics } from "@/lib/live/metrics";

/* Citations screen — live data helpers.

   Everything this screen renders comes from lib/live/metrics (real sampled
   answers). Nothing here invents a figure: where the live engine cannot fill a
   cell the screen says so instead of printing a plausible number.

   Two citation piles exist and they are NOT the same number, so each is
   labelled on screen:
   - `citationsCount` / `uniqueCitedDomains` / the rates — the engine headline,
     computed over every sampled run in the store (`days` days of history).
   - `citedDomains[]` — the latest run of each tracked prompt, which is what the
     donut and the domain league table slice. Its counts and shares are exact
     against each other, so the two never contradict inside one card. */

export type ScreenState = "setup" | "collecting" | "live";

export function screenState(m: Pick<LiveMetrics, "configured" | "hasData">): ScreenState {
  if (!m.configured) return "setup";
  return m.hasData ? "live" : "collecting";
}

export type SourceSegment = {
  key: "owned" | "earned";
  label: string;
  count: number;
  /** share of the latest-sample citation pile, 0–100 */
  pct: number;
  color: string;
  /** stroke-dasharray length on the r=60 ring (circumference ≈ 377) */
  dash: number;
  offset: number;
};

const RING = 377;

/** Owned vs earned, straight off the `owned` flag — no third source class is
    derivable from the live engine, so the donut only shows the two it knows. */
export function sourceSegments(citedDomains: CitedDomain[]): { segments: SourceSegment[]; total: number } {
  const total = citedDomains.reduce((s, d) => s + d.count, 0);
  const owned = citedDomains.filter((d) => d.owned).reduce((s, d) => s + d.count, 0);
  const earned = total - owned;
  if (total === 0) return { segments: [], total: 0 };

  const pct = (n: number) => Math.round((n / total) * 1000) / 10;
  const ownedDash = (owned / total) * RING;
  const segments: SourceSegment[] = [
    { key: "owned", label: "Owned", count: owned, pct: pct(owned), color: "var(--ac)", dash: ownedDash, offset: 0 },
    { key: "earned", label: "Earned", count: earned, pct: pct(earned), color: "#7fa7d9", dash: (earned / total) * RING, offset: -ownedDash },
  ];
  return { segments: segments.filter((s) => s.count > 0), total };
}

/** "1 day of history" / "12 days of history" — never implies a 30-day window. */
export function historyLabel(days: number): string {
  if (days <= 0) return "no history yet";
  return `${days} day${days === 1 ? "" : "s"} of history`;
}

/** Filename stem for exports — the real workspace, not a fixture brand. */
export function exportStem(m: LiveMetrics, suffix: string): string {
  const base = (m.workspace?.brand ?? "workspace")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "workspace";
  return `${base}-${suffix}`;
}

/** The window string printed in exported CSVs — the sample that actually exists. */
export function exportWindow(m: LiveMetrics): string {
  if (!m.hasData) return "No samples collected yet";
  return `${historyLabel(m.days)} sampled${m.lastRunAt ? ` (last run ${new Date(m.lastRunAt).toISOString().slice(0, 10)})` : ""}`;
}
