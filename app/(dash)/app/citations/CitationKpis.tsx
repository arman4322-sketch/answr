import KpiCard from "@/components/app/KpiCard";
import { fmtInt } from "@/lib/filters/windows";
import type { LiveMetrics } from "@/lib/live/metrics";
import { historyLabel } from "./live";

/* Citations KPI row — live figures from lib/live/metrics.

   No deltas are shown: the live engine keeps a daily series for visibility and
   share of voice only, so there is no previous-window citation total to compare
   against. Printing an arrow here would be an invention, so the cards carry the
   sample scope (`sub`) instead of a fabricated change.

   Rates render as "—" when their denominator is empty (no citations parsed, no
   answers sampled) — an unmeasured rate is not 0%. */

export default function CitationKpis({ m }: { m: LiveMetrics }) {
  const scope = m.hasData ? `${historyLabel(m.days)} · ${fmtInt(m.answersSampled)} answers sampled` : "no samples yet";
  const dash = "var(--fnt)";
  const ownedKnown = m.citationsCount > 0;
  const rateKnown = m.answersSampled > 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
      <KpiCard label="Total citations" value={fmtInt(m.citationsCount)} metricId="citations_count" sub={scope} />
      <KpiCard
        label="Unique domains"
        value={fmtInt(m.uniqueCitedDomains)}
        metricId="unique_cited_domains"
        sub={m.hasData ? "distinct domains in the sample" : "no samples yet"}
      />
      <KpiCard
        label="Owned sources"
        value={ownedKnown ? `${Math.round(m.ownedCitationShare)}%` : "—"}
        metricId="owned_citation_share"
        valueColor={ownedKnown ? undefined : dash}
        sub={ownedKnown ? `of ${fmtInt(m.citationsCount)} citations` : "no citations parsed yet"}
      />
      <KpiCard
        label="Answers with ≥1 citation"
        value={rateKnown ? `${Math.round(m.answersWithCitationRate)}%` : "—"}
        metricId="answers_with_citation_rate"
        valueColor={rateKnown ? undefined : dash}
        sub={rateKnown ? `of ${fmtInt(m.answersSampled)} sampled answers` : "no answers sampled yet"}
      />
    </div>
  );
}
