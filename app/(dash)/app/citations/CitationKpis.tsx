"use client";

import KpiCard from "@/components/app/KpiCard";
import { useFilters } from "@/lib/filters/context";
import { accruedStat, deltaTone, extendLevel, fmtDelta, fmtInt, levelStat, sliceWindow } from "@/lib/filters/windows";
import {
  UNIQUE_DOMAINS_30D,
  UNIQUE_DOMAINS_DELTA_30D,
  answersWithCitationSeries,
  ownedShareSeries,
} from "@/lib/data/evidence";
import { citationWindow } from "./citationWindow";

/* Citations KPI row — live on the topbar's date range.

   - Total citations is the window's sum against the previous window's sum.
   - Owned sources and Answers-with-a-citation are rates, so they read the
     endpoint of their daily series and the change since the window's start.
   - Unique domains is a distinct count: twenty days of runnersworld.com is
     still one domain, so it accrues on the saturating curve in
     lib/filters/windows.ts rather than being summed.

   At 30 days: 1,284 ↑212 · 86 ↑9 · 38% ↑4pt · 71% ↓2pt — the shipped row. */

export default function CitationKpis() {
  const { window } = useFilters();
  const citations = citationWindow(window.days);
  const domains = accruedStat(UNIQUE_DOMAINS_30D, UNIQUE_DOMAINS_DELTA_30D, window.days, 0.45);
  const owned = levelStat(sliceWindow(extendLevel(ownedShareSeries, "citations:owned"), window.days));
  const withCitation = levelStat(sliceWindow(extendLevel(answersWithCitationSeries, "citations:coverage"), window.days));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
      <KpiCard
        label="Total citations"
        value={fmtInt(citations.value)}
        metricId="citations_count"
        delta={fmtDelta(citations.delta, 0)}
        deltaGood={deltaTone(citations.delta, 0)}
      />
      <KpiCard
        label="Unique domains"
        value={fmtInt(domains.value)}
        metricId="unique_cited_domains"
        delta={fmtDelta(domains.delta, 0)}
        deltaGood={deltaTone(domains.delta, 0)}
      />
      <KpiCard
        label="Owned sources"
        value={`${Math.round(owned.value)}%`}
        metricId="owned_citation_share"
        delta={fmtDelta(owned.delta, 0, "pt")}
        deltaGood={deltaTone(owned.delta, 0)}
      />
      <KpiCard
        label="Answers with ≥1 citation"
        value={`${Math.round(withCitation.value)}%`}
        metricId="answers_with_citation_rate"
        delta={fmtDelta(withCitation.delta, 0, "pt")}
        deltaGood={deltaTone(withCitation.delta, 0)}
      />
    </div>
  );
}
