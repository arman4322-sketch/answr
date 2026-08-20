"use client";

import TrendChart from "@/components/app/charts/TrendChart";
import { useFilters } from "@/lib/filters/context";
import { axisTicks, fmtInt, windowAxis, windowDayLabels } from "@/lib/filters/windows";
import { crawlSeriesForRange } from "./crawlWindow";

/* "Crawl activity by agent" — chart plus both axes, live on the date range.
   The plotted requests are the same daily numbers the KPI above sums, so the
   card and the headline can never disagree. The y axis keeps the frame's
   0–1,200 ticks while the window fits inside them and widens to a round axis
   when a longer window runs past. */

export default function CrawlTrend() {
  const { range } = useFilters();
  const series = crawlSeriesForRange(range);
  const labels = windowDayLabels(range);
  const axis = windowAxis(
    series.flatMap((s) => s.points),
    { domain: [0, 1200], labels: ["1,200", "800", "400", "0"] },
    (v) => fmtInt(v)
  );

  return (
    <>
      <div style={{ display: "flex", gap: "8px", marginTop: "14px", alignItems: "stretch" }}>
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
            width: "32px",
          }}
        >
          {axis.labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <div style={{ position: "relative", flex: "1", minWidth: "0" }}>
          <TrendChart
            series={series}
            xLabels={labels}
            width={1080}
            height={210}
            yDomain={axis.domain}
            yDecimals={0}
            showLegend={false}
            pad={{ top: 2, right: 2, bottom: 2, left: 2 }}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "10.5px",
          fontWeight: "400",
          fontVariantNumeric: "tabular-nums",
          color: "var(--fnt)",
          marginTop: "8px",
          paddingLeft: "40px",
        }}
      >
        {axisTicks(labels).map((l, i) => (
          <span key={`${l}-${i}`}>{l}</span>
        ))}
      </div>
    </>
  );
}
