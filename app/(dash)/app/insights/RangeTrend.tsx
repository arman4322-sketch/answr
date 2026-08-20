"use client";

import TrendChart, { type TrendSeries } from "@/components/app/charts/TrendChart";
import { useFilters } from "@/lib/filters/context";
import { axisTicks, levelSeriesForRange, windowAxis, windowDayLabels } from "@/lib/filters/windows";

/* Percent trend + its two axes, live on the topbar's date range.

   The insights pages are server components, so this client child owns the
   y-axis column, the chart and the x-axis row as one unit — exactly the markup
   the frames drew, with the labels now coming from the active window. On
   "Last 30 days" the axes read Jul 7 · Jul 14 · Jul 21 · Jul 28 · Aug 5 and the
   series is the shipped fixture, unchanged; longer windows slice the extended
   history (lib/filters/windows.ts) and widen the y axis only if the data runs
   past the frame's painted one. */

export default function RangeTrend({
  series,
  seed,
  yLabels,
  yDomain,
  width,
  height,
  marginTop = "12px",
  showLegend = false,
  showXAxis = true,
}: {
  series: TrendSeries[];
  /** stable key for the deterministic back-history */
  seed: string;
  /** the frame's painted y ticks, top → bottom */
  yLabels: string[];
  yDomain: [number, number];
  width?: number;
  height?: number;
  marginTop?: string;
  showLegend?: boolean;
  /** the topic-detail card draws no date axis — keep its layout */
  showXAxis?: boolean;
}) {
  const { range } = useFilters();
  const windowed = levelSeriesForRange(series, range, seed);
  const labels = windowDayLabels(range);
  const axis = windowAxis(
    windowed.flatMap((s) => s.points),
    { domain: yDomain, labels: yLabels },
    (v) => `${Number(v.toFixed(0)).toLocaleString("en-US")}%`
  );

  return (
    <>
      <div style={{ display: "flex", gap: "8px", marginTop, alignItems: "stretch" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "2px 0",
            textAlign: "right",
            fontSize: "10.5px",
            color: "var(--fnt)",
            fontVariantNumeric: "tabular-nums",
            flex: "none",
            width: "26px",
          }}
        >
          {axis.labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <div style={{ position: "relative", flex: "1", minWidth: "0" }}>
          <TrendChart
            series={windowed}
            xLabels={labels}
            width={width}
            height={height}
            yDomain={axis.domain}
            showLegend={showLegend}
            yUnit="%"
            yDecimals={1}
          />
        </div>
      </div>
      {showXAxis && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "10.5px",
            color: "var(--fnt)",
            marginTop: "8px",
            fontVariantNumeric: "tabular-nums",
            paddingLeft: "34px",
          }}
        >
          {axisTicks(labels).map((l, i) => (
            <span key={`${l}-${i}`}>{l}</span>
          ))}
        </div>
      )}
    </>
  );
}
