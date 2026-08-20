"use client";

import { METRICS, type MetricId } from "@/lib/metrics";
import Hint from "@/components/ui/Hint";

/* Canonical KPI card (audit fix C5 — one padding, one value style everywhere).
   Pass `metricId` to get the ⓘ provenance popover: definition, real data source,
   and calculation from lib/metrics.ts.

   The label also carries a plain-language <Hint> (the (i) bubble): it defaults to
   METRICS[metricId].plain and can be overridden — or supplied for cards with no
   metricId — via the `hint` prop. Hint answers "what am I looking at?"; the ⓘ
   answers "where does this number come from?". */

export default function KpiCard({
  label,
  value,
  metricId,
  hint,
  delta,
  deltaGood,
  sub,
  children,
  valueColor,
}: {
  label: string;
  value: string;
  /** Key into the metrics dictionary — enables the ⓘ provenance popover */
  metricId?: MetricId;
  /** Plain-language line (under 10 words). Defaults to METRICS[metricId].plain */
  hint?: string;
  /** e.g. "↑ 2.8pt vs prev" */
  delta?: string;
  /** colors the delta: true = green, false = red, undefined = muted */
  deltaGood?: boolean;
  /** small caption under the value row */
  sub?: string;
  /** extra content (sparkline etc.) rendered right-aligned beside the value */
  children?: React.ReactNode;
  /** override the value color (e.g. "var(--fnt)" for day-zero dashes, "var(--ac)" for accent) */
  valueColor?: string;
}) {
  const def = metricId ? METRICS[metricId] : null;
  const plain = hint ?? def?.plain;

  return (
    <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "15px 17px", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <div style={{ fontSize: "11.5px", fontWeight: 500, color: "var(--mut)" }}>{label}</div>
        {plain && <Hint text={plain} />}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "10px", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", minWidth: 0 }}>
          <span style={{ fontSize: "24px", fontWeight: 600, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em", color: valueColor ?? "var(--tx)" }}>{value}</span>
          {delta && (
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: 500,
                fontVariantNumeric: "tabular-nums",
                color: deltaGood === undefined ? "var(--fnt)" : deltaGood ? "var(--good)" : "var(--bad)",
              }}
            >
              {delta}
            </span>
          )}
        </div>
        {children}
      </div>
      {sub && <div style={{ fontSize: "10.5px", color: "var(--fnt)", marginTop: "6px", fontVariantNumeric: "tabular-nums" }}>{sub}</div>}
    </div>
  );
}
