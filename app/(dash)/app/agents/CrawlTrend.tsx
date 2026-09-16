import TrendChart, { type TrendSeries } from "@/components/app/charts/TrendChart";
import { fmtInt, niceMax } from "./telemetryView";

/* Daily activity chart for captured telemetry.

   The x axis is the days that actually have events — nothing is back-filled to
   fill a 30-day frame — and the y axis is scaled to the real maximum instead of
   the fixture's fixed 0–1,200 ticks. A single captured day is not a trend, so
   the caller renders a note instead of a one-point line. */

export default function CrawlTrend({
  series,
  labels,
  height = 210,
  width = 1080,
}: {
  series: TrendSeries[];
  labels: string[];
  height?: number;
  width?: number;
}) {
  const all = series.flatMap((s) => s.points);
  const top = niceMax(Math.max(0, ...all));
  const ticks = [top, top * 0.75, top * 0.5, top * 0.25, 0].map((v) => fmtInt(v));
  /* at most five x labels, always real dates from the captured days */
  const xTicks =
    labels.length <= 5 ? labels : [0, 1, 2, 3, 4].map((i) => labels[Math.round((i * (labels.length - 1)) / 4)]);

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
          {ticks.map((l, i) => (
            <span key={`${l}-${i}`}>{l}</span>
          ))}
        </div>
        <div style={{ position: "relative", flex: "1", minWidth: "0" }}>
          <TrendChart
            series={series}
            xLabels={labels}
            width={width}
            height={height}
            yDomain={[0, top]}
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
        {xTicks.map((l, i) => (
          <span key={`${l}-${i}`}>{l}</span>
        ))}
      </div>
    </>
  );
}
