"use client";

import KpiCard from "@/components/app/KpiCard";
import Sparkline from "@/components/ui/Sparkline";
import { useFilters } from "@/lib/filters/context";
import {
  countStat,
  deltaTone,
  extendCount,
  extendLevel,
  fmtDelta,
  fmtInt,
  levelStat,
  seriesKey,
  sliceWindow,
} from "@/lib/filters/windows";
import { avgPositionSeries, shareOfVoiceSeries, visibilityTrend } from "@/lib/data/overview";
import { CITATIONS_PREV_TOTAL, citationsDaily } from "@/lib/data/evidence";

/* Overview KPI row — live on the topbar's date range.

   Each card reads its number off the daily series behind it: the value is the
   window's endpoint (or its sum, for citations), the delta is endpoint −
   start-of-window (or window sum − previous window's sum), and the sparkline
   draws the same points. On "Last 30 days" every card renders exactly the
   numbers the frame shipped — 34.2% ↑2.8 · 28.6% ↑1.1 · 1,284 ↑212 · 2.4 ↓0.2. */

export default function OverviewKpis() {
  const { window, platform, platformInfo } = useFilters();
  const days = window.days;

  /* Keys match the cards these KPIs restate — the Visibility line in
     "Performance over time" (overview:visibility:nike) and the Nike row in
     "Competitor share of voice" (overview:sov:Nike) — so a KPI can never show a
     different window than the chart under it. */
  const visibility = sliceWindow(extendLevel(visibilityTrend[0].points, seriesKey("overview:visibility", visibilityTrend[0].id)), days);
  const sov = sliceWindow(extendLevel(shareOfVoiceSeries, "overview:sov:Nike"), days);
  const position = sliceWindow(extendLevel(avgPositionSeries, "overview:position"), days);

  const citationHistory = extendCount(citationsDaily, "citations:daily", { prevSum: CITATIONS_PREV_TOTAL });
  const citations = countStat(citationHistory, days);
  const citationWindow = sliceWindow(citationHistory, days);

  const vis = levelStat(visibility);
  const share = levelStat(sov);
  const pos = levelStat(position);

  return (
    <>
      {/* Overview is the one screen that honors the platform filter, but only
          partly: the trend chart and "Visibility by platform" re-slice, while
          these four KPIs (and competitor share of voice / top sources) have no
          per-platform fixture behind them and stay all-platform. Rather than
          let a selected platform silently imply it scoped everything, say so —
          inline, only while a platform is selected, so the default render at
          "all platforms" is untouched. */}
      {platform !== "all" && (
        <div
          role="note"
          style={{
            fontSize: "11.5px",
            lineHeight: 1.5,
            color: "var(--fnt)",
            background: "var(--bg1)",
            border: "1px solid var(--brd)",
            borderRadius: "8px",
            padding: "8px 12px",
          }}
        >
          Filtered to <span style={{ color: "var(--mut)" }}>{platformInfo.label}</span>. That applies to
          Performance over time and Visibility by platform. The four cards below, competitor share of
          voice and top sources have no per-platform breakdown in this workspace and stay scored across
          all platforms.
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
        <KpiCard
          label="Visibility score"
          value={`${vis.value.toFixed(1)}%`}
          metricId="visibility_score"
          delta={fmtDelta(vis.delta)}
          deltaGood={deltaTone(vis.delta)}
        >
          <Sparkline points={visibility} good={vis.delta >= 0} />
        </KpiCard>
        <KpiCard
          label="Share of voice"
          value={`${share.value.toFixed(1)}%`}
          metricId="share_of_voice"
          delta={fmtDelta(share.delta)}
          deltaGood={deltaTone(share.delta)}
        >
          <Sparkline points={sov} good={share.delta >= 0} />
        </KpiCard>
        <KpiCard
          label={`Citations · ${window.short}`}
          value={fmtInt(citations.value)}
          metricId="citations_count"
          delta={fmtDelta(citations.delta, 0)}
          deltaGood={deltaTone(citations.delta, 0)}
        >
          <Sparkline points={citationWindow} good={citations.delta >= 0} />
        </KpiCard>
        {/* Avg. answer position: the frame paints a falling position red, so the
            card's polarity is preserved rather than silently re-coloured. */}
        <KpiCard
          label="Avg. answer position"
          value={pos.value.toFixed(1)}
          metricId="avg_answer_position"
          delta={fmtDelta(pos.delta)}
          deltaGood={deltaTone(pos.delta)}
        >
          <Sparkline points={position} good={pos.delta >= 0} />
        </KpiCard>
      </div>
    </>
  );
}
