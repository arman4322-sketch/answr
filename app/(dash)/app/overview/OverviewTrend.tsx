"use client";

import { useState } from "react";
import TrendChart, { type TrendSeries } from "@/components/app/charts/TrendChart";
import Hint from "@/components/ui/Hint";
import { METRICS, type MetricId } from "@/lib/metrics";
import type { DayPoint } from "@/lib/live/metrics";
import CardNote from "./CardNote";
import { axisTicks, dayLabel, historyNote, int, niceAxis, pct, s } from "./format";

/* "Performance over time" — the sampled series, and nothing else.

   The card keeps its segmented control, legend, axis and footnote; what changed
   is that all three tabs are now real daily measurements from
   `LiveMetrics.series`, which has exactly one point per day the sampler
   actually ran. The two fixture-only tabs are gone: "Appearances" had no live
   per-platform daily series behind it and "Clicks" had no per-day referral
   series at all, so rather than draw invented lines the tabs are the three
   things the engine does measure per day — visibility, share of voice, and the
   number of runs collected.

   Fewer than two sampled days means there is no line to draw: the card says it
   is still collecting history instead of plotting a single point as a trend. */

type TabId = "vis" | "sov" | "runs";

const TABS: { id: TabId; label: string }[] = [
  { id: "vis", label: "Visibility %" },
  { id: "sov", label: "Share of voice" },
  { id: "runs", label: "Runs" },
];

export default function OverviewTrend({
  series,
  days,
  brand,
  configured,
  hasData,
}: {
  series: DayPoint[];
  days: number;
  brand: string;
  configured: boolean;
  hasData: boolean;
}) {
  const [tab, setTab] = useState<TabId>("vis");

  const header = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600 }}>Performance over time</div>
        <Hint text={METRICS[metricFor(tab)].plain} />
      </div>
      <div
        role="tablist"
        aria-label="Chart metric"
        style={{ display: "flex", background: "var(--bg0)", border: "1px solid var(--brd)", borderRadius: "7px", padding: "2px", fontSize: "11.5px", fontWeight: 500 }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "4px 11px",
              borderRadius: "5px",
              cursor: "pointer",
              border: "none",
              fontFamily: "inherit",
              fontSize: "inherit",
              fontWeight: "inherit",
              background: tab === t.id ? "rgba(255,255,255,0.08)" : "transparent",
              color: tab === t.id ? "#eeeff2" : "#9b9ca3",
              transition: "background .12s, color .12s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );

  /* ── not enough sampled days to draw a line ── */
  if (series.length < 2) {
    return (
      <div>
        {header}
        <div style={{ marginTop: "14px" }}>
          <CardNote
            title={
              !configured
                ? "No history yet"
                : !hasData
                  ? "No sample has run yet"
                  : `Collecting history — ${historyNote(days)}`
            }
            body={
              !configured
                ? "Set up your brand, then start a run from Settings › Platforms — this chart adds one point for every day the sampler runs."
                : !hasData
                  ? "Nothing has been sampled yet — start the first run from Settings › Platforms. The chart draws its first line once two days of runs exist."
                  : "A trend needs at least two sampled days. Today's numbers are on the cards above; this line appears after the next run."
            }
          />
        </div>
      </div>
    );
  }

  const cfg = CONFIG[tab];
  const points = series.map(cfg.pick);
  const chart: TrendSeries[] = [
    { id: tab, label: `${brand} · ${cfg.legend}`, color: "var(--ac)", area: true, points },
  ];
  const xLabels = series.map((p) => dayLabel(p.date));
  const axis = niceAxis(points, cfg.unit, cfg.decimals);
  const latest = points[points.length - 1];

  return (
    <div>
      {header}

      <div style={{ display: "flex", gap: "13px", fontSize: "11.5px", color: "var(--mut)", marginTop: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "8px", height: "2px", borderRadius: "1px", background: "var(--ac)" }} />
          {`${brand} · ${cfg.legend}`}
          <span style={{ color: "var(--tx)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {cfg.unit === "%" ? pct(latest) : int(latest)}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "stretch" }}>
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
          {axis.labels.map((v) => (
            <span key={v}>{v}</span>
          ))}
        </div>
        <div style={{ position: "relative", flex: "1", minWidth: "0" }}>
          <TrendChart
            series={chart}
            xLabels={xLabels}
            width={656}
            height={240}
            yDomain={axis.domain}
            yUnit={cfg.unit}
            yDecimals={cfg.decimals}
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
          paddingLeft: "34px",
        }}
      >
        {axisTicks(xLabels).map((v, i) => (
          <span key={`${v}-${i}`}>{v}</span>
        ))}
      </div>

      <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "10px" }}>
        {`${cfg.footnote(brand)} · ${historyNote(days)}, one point per day actually sampled (${series.length} point${s(series.length)}).`}
      </div>
    </div>
  );
}

function metricFor(tab: TabId): MetricId {
  return CONFIG[tab].metricId;
}

const CONFIG: Record<
  TabId,
  {
    metricId: MetricId;
    legend: string;
    unit: string;
    decimals: number;
    pick: (p: DayPoint) => number;
    footnote: (brand: string) => string;
  }
> = {
  vis: {
    metricId: "visibility_score",
    legend: "visibility",
    unit: "%",
    decimals: 1,
    pick: (p) => p.visibility,
    footnote: (brand) => `Share of that day's sampled answers naming ${brand}, weighted by platform and mention rank`,
  },
  sov: {
    metricId: "share_of_voice",
    legend: "share of voice",
    unit: "%",
    decimals: 1,
    pick: (p) => p.shareOfVoice,
    footnote: (brand) => `${brand}'s share of all tracked-brand mentions in that day's answers`,
  },
  runs: {
    metricId: "prompts_tracked",
    legend: "prompt runs",
    unit: "",
    decimals: 0,
    pick: (p) => p.runs,
    footnote: () => "Prompt runs the sampler collected that day",
  },
};
