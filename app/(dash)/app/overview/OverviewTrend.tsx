"use client";

import { useState } from "react";
import TrendChart, { type TrendSeries } from "@/components/app/charts/TrendChart";
import Hint from "@/components/ui/Hint";
import { METRICS, type MetricId } from "@/lib/metrics";
import { useFilters } from "@/lib/filters/context";
import {
  axisTicks,
  fmtInt,
  levelSeriesForRange,
  weeklySeriesForRange,
  windowAxis,
  windowDayLabels,
  windowWeekLabels,
  sum,
} from "@/lib/filters/windows";
import { visibilityTrend, appearancesTrend, clicksTrend, platformVisibilityRows } from "@/lib/data/overview";

/* "Performance over time" card interior — canvas rev 7: a working segmented
   control (Visibility % / Appearances / Clicks) swaps the chart series, legend
   chips, y-axis and footnote. Default tab Visibility %; active tab styling from
   the mock runtime: rgba(255,255,255,0.08) + #eeeff2.

   Both topbar filters are live here:
   - DATE RANGE re-slices every tab. The daily tabs slice the extended daily
     history (last 30 points = the shipped fixture, so 30d is unchanged); the
     Clicks tab reports weekly, so its window is expressed in whole weeks and
     the footnote says so. Legend chips are computed from the window — at 30
     days they come out as the shipped chips (172/150/128/114/91 appearances;
     1,842/926/1,204/388/512 clicks).
   - PLATFORM narrows Appearances and Clicks to that platform's own series. On
     Visibility % there is no per-platform competitor fixture, so rather than
     invent one the chart shows that platform's own Nike visibility series (the
     same series behind the "Visibility by platform" card) and says so. */

type TabId = "vis" | "app" | "clk";

const TABS: { id: TabId; label: string }[] = [
  { id: "vis", label: "Visibility %" },
  { id: "app", label: "Appearances" },
  { id: "clk", label: "Clicks" },
];

const TAB_CONFIG: Record<
  TabId,
  {
    metricId: MetricId;
    yAxis: string[];
    yDomain: [number, number];
    yUnit: string;
    yDecimals: number;
    footnote: string | null;
  }
> = {
  vis: {
    metricId: "visibility_score",
    yAxis: ["45%", "35%", "25%", "15%"],
    yDomain: [15, 45],
    yUnit: "%",
    yDecimals: 1,
    footnote: null,
  },
  app: {
    metricId: "platform_appearances",
    yAxis: ["180", "140", "100", "60"],
    yDomain: [60, 180],
    yUnit: "",
    yDecimals: 0,
    footnote: "Count of tracked prompts where Nike appears in the answer, per platform · of 412 prompts, daily runs.",
  },
  clk: {
    metricId: "ai_referrals",
    yAxis: ["500", "250", "0"],
    yDomain: [0, 500],
    yUnit: "",
    yDecimals: 0,
    footnote: "Weekly AI-referral clicks landing on nike.com, by source platform · from Demand.",
  },
};

/* Legend order the frame printed for the Clicks tab (differs from series order). */
const CLICKS_LEGEND_ORDER = ["chatgpt", "perplexity", "aioverviews", "claude", "gemini"];

export default function OverviewTrend() {
  const [tab, setTab] = useState<TabId>("vis");
  const { platform, platformInfo, range, window } = useFilters();
  const cfg = TAB_CONFIG[tab];

  /* ── series for the active tab, window and platform ── */
  let series: TrendSeries[];
  let xLabels: string[];
  let legend: { label: string; color: string; value: string | null }[];
  let footnote = cfg.footnote;

  if (tab === "vis") {
    const row = platform === "all" ? null : platformVisibilityRows.find((r) => r.id === platform);
    if (row) {
      series = levelSeriesForRange(
        [{ id: row.id, label: `Nike · ${row.label}`, color: "var(--ac)", area: true, points: row.points }],
        range,
        "overview:platform"
      );
      legend = [{ label: `Nike · ${row.label}`, color: "var(--ac)", value: null }];
      footnote = `Visibility on ${row.label} only. Competitor visibility is tracked across all platforms, so the Adidas and Puma lines are hidden while this filter is on.`;
    } else {
      series = levelSeriesForRange(visibilityTrend, range, "overview:visibility");
      legend = series.map((s) => ({ label: s.label, color: s.color, value: null }));
    }
    xLabels = windowDayLabels(range);
  } else if (tab === "app") {
    const all = levelSeriesForRange(appearancesTrend, range, "overview:appearances");
    series = platform === "all" ? all : all.filter((s) => s.id === platform);
    xLabels = windowDayLabels(range);
    legend = series.map((s) => ({
      label: s.label,
      color: s.color,
      value: fmtInt(s.points[s.points.length - 1]),
    }));
  } else {
    const all = weeklySeriesForRange(clicksTrend, range, "overview:clicks");
    series = platform === "all" ? all : all.filter((s) => s.id === platform);
    xLabels = windowWeekLabels(range);
    legend = CLICKS_LEGEND_ORDER.map((id) => all.find((s) => s.id === id))
      .filter((s): s is TrendSeries => !!s && (platform === "all" || s.id === platform))
      .map((s) => ({
        label: s.id === "aioverviews" ? "AI Overviews" : s.label,
        color: s.color,
        value: fmtInt(sum(s.points)),
      }));
    footnote = `Weekly AI-referral clicks landing on nike.com, by source platform · from Demand. Clicks report weekly, so this window covers the ${window.weeks} most recent weeks.`;
  }

  if (platform !== "all" && !series.length) {
    /* every filterable tab has a series per platform, so this is unreachable —
       but never render an empty chart if a platform is ever added upstream */
    series = [{ id: "none", label: platformInfo.label, color: "var(--ac)", points: [0, 0] }];
  }

  const values = series.flatMap((s) => s.points);
  const axis = windowAxis(
    values,
    { domain: cfg.yDomain, labels: cfg.yAxis },
    (v) => `${Number(v.toFixed(cfg.yDecimals)).toLocaleString("en-US")}${cfg.yUnit}`
  );
  const xAxisRow = axisTicks(xLabels);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600 }}>Performance over time</div>
          <Hint text={METRICS[cfg.metricId].plain} />
          <Hint text={METRICS[cfg.metricId].plain} />
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

      <div style={{ display: "flex", gap: "13px", fontSize: "11.5px", color: "var(--mut)", marginTop: "12px", flexWrap: "wrap" }}>
        {legend.map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "2px", borderRadius: "1px", background: l.color }} />
            {l.label}
            {l.value && (
              <span style={{ color: "var(--tx)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{l.value}</span>
            )}
          </div>
        ))}
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
            series={series}
            xLabels={xLabels}
            width={656}
            height={240}
            yDomain={axis.domain}
            yUnit={cfg.yUnit}
            yDecimals={cfg.yDecimals}
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
        {xAxisRow.map((v, i) => (
          <span key={`${v}-${i}`}>{v}</span>
        ))}
      </div>

      {footnote && <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "10px" }}>{footnote}</div>}
    </div>
  );
}
