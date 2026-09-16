"use client";

import TrendChart, { type TrendSeries } from "@/components/app/charts/TrendChart";
import type { DayPoint } from "@/lib/live/metrics";
import { axisTicks, dayLabel, historyNote, niceAxis, pct, s } from "./aei-format";

/* The Insights trend — the sampled series, and nothing else.

   Replaces <RangeTrend> on this screen. RangeTrend re-sliced a 30-day fixture
   through lib/filters/windows, which synthesizes back-history; this chart plots
   one point per day the sampler actually ran, taken from LiveMetrics.series.

   Two lines, because two lines are what the pipeline measures per day: the
   workspace's visibility and its share of voice. Per-competitor daily lines are
   not drawn — the store keeps competitor mentions in aggregate, not as a daily
   series per brand, so those lines would have to be invented. The brand
   comparison beside this card carries the measured competitor figures instead.

   The caller only renders this once `series.length >= 2`; a single sampled day
   is not a trend. */

export default function AeiTrend({ series, brand, days }: { series: DayPoint[]; brand: string; days: number }) {
  const visibility = series.map((p) => p.visibility);
  const shareOfVoice = series.map((p) => p.shareOfVoice);
  const chart: TrendSeries[] = [
    { id: "vis", label: `${brand} · visibility`, color: "var(--ac)", area: true, points: visibility },
    { id: "sov", label: `${brand} · share of voice`, color: "#7fa7d9", points: shareOfVoice },
  ];
  const xLabels = series.map((p) => dayLabel(p.date));
  const axis = niceAxis([...visibility, ...shareOfVoice], "%", 0);

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
            width: "30px",
          }}
        >
          {axis.labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <div style={{ position: "relative", flex: "1", minWidth: "0" }}>
          <TrendChart
            series={chart}
            xLabels={xLabels}
            width={690}
            height={250}
            yDomain={axis.domain}
            yUnit="%"
            yDecimals={1}
            showLegend={false}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "10.5px",
          color: "var(--fnt)",
          marginTop: "8px",
          fontVariantNumeric: "tabular-nums",
          paddingLeft: "38px",
        }}
      >
        {axisTicks(xLabels).map((l, i) => (
          <span key={`${l}-${i}`}>{l}</span>
        ))}
      </div>

      <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "10px", lineHeight: 1.55 }}>
        {`${historyNote(days)} — one point per day actually sampled (${series.length} point${s(series.length)}). ` +
          `Latest: visibility ${pct(visibility[visibility.length - 1])}, share of voice ${pct(shareOfVoice[shareOfVoice.length - 1])}. ` +
          "Competitor lines aren't plotted: the store keeps competitor mentions in aggregate, not as a daily series per brand."}
      </div>
    </>
  );
}
