"use client";

import Hint from "@/components/ui/Hint";
import { METRICS } from "@/lib/metrics";
import { useFilters } from "@/lib/filters/context";
import type { TrendSeries } from "@/components/app/charts/TrendChart";
import { fmtDelta, levelStatForRange, type RangeId } from "@/lib/filters/windows";
import type { MetricId } from "@/lib/metrics";

/* Card headline (value + delta) for the insights screens, live on the topbar's
   date range and always equal to the endpoint of the chart beside it.

   Two shapes, both lifted from the frames:
   - "stacked": Sentiment / Shopping — 24px value, ⓘ, then the delta chip.
   - "inline":  Topic detail — 19px value with the delta tucked inside it. */

/** Same key the chart builds its line from — headline and line can't diverge. */
export function statFor(series: TrendSeries[], seed: string, range: RangeId) {
  return levelStatForRange(series, range, seed);
}

export default function RangeStat({
  series,
  seed,
  metricId,
  variant = "stacked",
  valueDecimals = 1,
  valueUnit = "%",
  deltaDecimals = 1,
  deltaUnit = "",
  valueFontSize = "24px",
  deltaFontSize = "12px",
}: {
  /** the same series array the card's chart renders */
  series: TrendSeries[];
  seed: string;
  metricId: MetricId;
  variant?: "stacked" | "inline";
  valueDecimals?: number;
  valueUnit?: string;
  deltaDecimals?: number;
  /** "pt" where the frame writes "↑ 3pt" */
  deltaUnit?: string;
  valueFontSize?: string;
  deltaFontSize?: string;
}) {
  const { range } = useFilters();
  const stat = statFor(series, seed, range);
  const value = `${stat.value.toFixed(valueDecimals)}${valueUnit}`;
  const delta = fmtDelta(stat.delta, deltaDecimals, deltaUnit);
  const color = stat.delta >= 0 ? "#4cb782" : "#e5636e";

  if (variant === "inline") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: valueFontSize, fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>
          {`${value} `}
          <span style={{ fontSize: deltaFontSize, color }}>{delta}</span>
        </span>
        <Hint text={METRICS[metricId].plain} align="right" />
      </span>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: valueFontSize, fontWeight: "600", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>
          {value}
        </span>
        <Hint text={METRICS[metricId].plain} align="right" />
      </span>
      <span style={{ fontSize: deltaFontSize, fontWeight: "500", color }}>{delta}</span>
    </div>
  );
}
