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

   Fewer than two sampled days means there is no measured line to draw. Rather
   than leave the card empty, it plots a SAMPLE shape so the screen reads as a
   finished product on day one. That sample is unmistakable: a dashed, muted
   line, a "SAMPLE" badge beside the title, a legend that says Sample instead of
   the brand, and a caption stating it is not the brand's data. Nothing about it
   can be read as a measurement, which is the whole point — the card still never
   presents an invented number as a real one. */

type TabId = "vis" | "sov" | "runs";

/* A deterministic placeholder shape. Fixed values, never random, so the server
   and the browser render the identical line and hydration stays quiet. */
const SAMPLE_POINTS: Record<TabId, number[]> = {
  vis: [12.4, 14.1, 13.0, 16.8, 15.9, 19.2, 21.0, 20.3, 23.6, 22.8, 26.1, 28.4, 27.5, 31.2],
  sov: [8.1, 9.0, 8.6, 10.4, 10.1, 12.3, 13.0, 12.7, 14.9, 14.2, 16.0, 17.3, 16.8, 18.6],
  runs: [5, 7, 7, 7, 6, 7, 7, 7, 7, 7, 7, 8, 7, 7],
};
const SAMPLE_LENGTH = SAMPLE_POINTS.vis.length;

/** Axis labels for the sample: the days leading up to the one real day, when
 *  there is one, so the placeholder sits on the workspace's own timeline. */
function sampleLabels(anchorIso?: string): string[] {
  if (!anchorIso) return Array.from({ length: SAMPLE_LENGTH }, (_, i) => `Day ${i + 1}`);
  const [y, m, d] = anchorIso.split("-").map(Number);
  if (!y || !m || !d) return Array.from({ length: SAMPLE_LENGTH }, (_, i) => `Day ${i + 1}`);
  const out: string[] = [];
  for (let i = SAMPLE_LENGTH - 1; i >= 0; i--) {
    const dt = new Date(Date.UTC(y, m - 1, d - i));
    out.push(dayLabel(dt.toISOString().slice(0, 10)));
  }
  return out;
}

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

  /* Configured, but not yet two sampled days: draw the sample instead of an
     empty card. An unconfigured workspace gets the setup note, because a
     placeholder chart there would replace the one instruction that matters. */
  const isSample = configured && series.length < 2;

  const header = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600 }}>Performance over time</div>
        {isSample && (
          <span
            style={{
              fontSize: "9.5px",
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--fnt)",
              border: "1px solid var(--brd)",
              borderRadius: "4px",
              padding: "1px 6px",
            }}
          >
            Sample
          </span>
        )}
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

  /* ── nothing configured: the setup instruction, not a chart ── */
  if (!configured) {
    return (
      <div>
        {header}
        <div style={{ marginTop: "14px" }}>
          <CardNote
            title="No history yet"
            body="Set up your brand, then start a run from Settings › Platforms — this chart adds one point for every day the sampler runs."
          />
        </div>
      </div>
    );
  }

  const cfg = CONFIG[tab];
  const points = isSample ? SAMPLE_POINTS[tab] : series.map(cfg.pick);
  const legend = isSample ? `Sample · ${cfg.legend}` : `${brand} · ${cfg.legend}`;
  const chart: TrendSeries[] = [
    {
      id: tab,
      label: legend,
      color: isSample ? "var(--fnt)" : "var(--ac)",
      area: !isSample,
      dash: isSample ? "5 4" : undefined,
      points,
    },
  ];
  const xLabels = isSample ? sampleLabels(series[0]?.date) : series.map((p) => dayLabel(p.date));
  const axis = niceAxis(points, cfg.unit, cfg.decimals);
  const latest = points[points.length - 1];

  return (
    <div>
      {header}

      <div style={{ display: "flex", gap: "13px", fontSize: "11.5px", color: "var(--mut)", marginTop: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "8px",
              height: "2px",
              borderRadius: "1px",
              background: isSample ? "var(--fnt)" : "var(--ac)",
            }}
          />
          {legend}
          <span style={{ color: isSample ? "var(--fnt)" : "var(--tx)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
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
        {isSample
          ? `Sample shape, not this workspace's data. ${
              hasData
                ? `${historyNote(days)} collected so far; this placeholder is replaced by the real line once a second day has been sampled.`
                : "Nothing has been sampled yet — start the first run from Settings › Platforms, and the real line replaces this after the second day."
            }`
          : `${cfg.footnote(brand)} · ${historyNote(days)}, one point per day actually sampled (${series.length} point${s(series.length)}).`}
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
