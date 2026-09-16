import KpiCard from "@/components/app/KpiCard";
import Sparkline from "@/components/ui/Sparkline";
import type { LiveMetrics } from "@/lib/live/metrics";
import { fmtDelta, historyNote, int, pct, s, seriesDelta } from "./format";

/* Overview KPI row — live values from lib/live/metrics.

   Every figure is measured: the visibility score and share of voice are the
   scored values for the sampled corpus, citations are the citations actually
   parsed out of those answers, and the answer position is the mean mention rank
   (null — rendered as a dash — until the brand is named at all).

   Deltas are the honest part. There is no 30-day back-history to compare to:
   the only trend that exists is `series`, one point per day actually sampled.
   So a delta is shown ONLY when that series has two or more points, computed
   last-minus-first, and captioned with how many days it covers. Citations and
   answer position have no per-day series behind them, so they carry no delta at
   all rather than a fabricated one. Card markup and layout are the frame's. */

export default function OverviewKpis({ m }: { m: LiveMetrics }) {
  const visPoints = m.series.map((p) => p.visibility);
  const sovPoints = m.series.map((p) => p.shareOfVoice);
  const visDelta = seriesDelta(m.series, (p) => p.visibility);
  const sovDelta = seriesDelta(m.series, (p) => p.shareOfVoice);

  /* One caption for the two trended cards: what the delta covers, or why there
     isn't one yet. */
  const trendSub = !m.hasData
    ? "Collecting — first sample runs tonight"
    : m.series.length < 2
      ? `${historyNote(m.days)} — trend starts on the second sampled day`
      : `Change over ${historyNote(m.days)}`;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
      <KpiCard
        label="Visibility score"
        value={pct(m.visibilityScore)}
        metricId="visibility_score"
        delta={visDelta === null ? undefined : fmtDelta(visDelta)}
        deltaGood={visDelta === null ? undefined : visDelta >= 0}
        sub={trendSub}
      >
        {visPoints.length >= 2 && <Sparkline points={visPoints} good={(visDelta ?? 0) >= 0} />}
      </KpiCard>

      <KpiCard
        label="Share of voice"
        value={pct(m.shareOfVoice)}
        metricId="share_of_voice"
        delta={sovDelta === null ? undefined : fmtDelta(sovDelta)}
        deltaGood={sovDelta === null ? undefined : sovDelta >= 0}
        sub={trendSub}
      >
        {sovPoints.length >= 2 && <Sparkline points={sovPoints} good={(sovDelta ?? 0) >= 0} />}
      </KpiCard>

      {/* Citations are counted over the sampled corpus, not over a calendar
          window, and there is no per-day citation series — so the label names
          the sample and the card shows no delta. */}
      <KpiCard
        label="Citations · sampled answers"
        value={int(m.citationsCount)}
        metricId="citations_count"
        sub={
          m.hasData
            ? `${int(m.uniqueCitedDomains)} domain${s(m.uniqueCitedDomains)} · ${pct(m.ownedCitationShare)} owned`
            : "Collecting — first sample runs tonight"
        }
      />

      <KpiCard
        label="Avg. answer position"
        value={m.avgAnswerPosition == null ? "—" : m.avgAnswerPosition.toFixed(1)}
        metricId="avg_answer_position"
        valueColor={m.avgAnswerPosition == null ? "var(--fnt)" : undefined}
        sub={
          m.avgAnswerPosition == null
            ? m.hasData
              ? "Not named in any sampled answer yet"
              : "Collecting — first sample runs tonight"
            : `Named first in ${int(m.answerRankFirst)} answer${s(m.answerRankFirst)}`
        }
      />
    </div>
  );
}
