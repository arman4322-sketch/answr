import type { ReportSpec, ReportSection, SummaryStat } from "@/lib/export/report";
import { seriesSection } from "@/lib/export/reports";
import { METRICS } from "@/lib/metrics";
import type { LiveMetrics } from "@/lib/live/metrics";
import { dayLabel, historyNote, int, pct, s, seriesDelta } from "./format";

/* Overview → executive CSV, built from the same live metrics the screen renders.

   Every cell is a measured value. Where the fixture report used to carry a
   "Change vs previous" column, this one does not: there is no previous window
   to compare against until the sampler has accumulated history, so the report
   states the window it really covers ("Sampled history: N days") and omits
   deltas it cannot compute. The visibility/share-of-voice trend table prints
   only the days that were actually sampled, one row each. */

export function overviewSpec(m: LiveMetrics): ReportSpec {
  const brand = m.workspace?.brand ?? "Workspace";
  const visDelta = seriesDelta(m.series, (p) => p.visibility);
  const sovDelta = seriesDelta(m.series, (p) => p.shareOfVoice);
  const first = m.series[0]?.date;
  const last = m.series[m.series.length - 1]?.date;

  const summary: SummaryStat[] = [
    {
      label: METRICS.visibility_score.label,
      value: pct(m.visibilityScore),
      delta: visDelta === null ? undefined : `${visDelta >= 0 ? "+" : "-"}${Math.abs(visDelta).toFixed(1)}pt`,
      note:
        `${METRICS.visibility_score.plain}. Scored over ${int(m.answersSampled)} sampled answer${s(m.answersSampled)}` +
        (visDelta === null ? `. Only ${historyNote(m.days)} — no change reported.` : ` across ${historyNote(m.days)}.`),
    },
    {
      label: METRICS.share_of_voice.label,
      value: pct(m.shareOfVoice),
      delta: sovDelta === null ? undefined : `${sovDelta >= 0 ? "+" : "-"}${Math.abs(sovDelta).toFixed(1)}pt`,
      note: `${METRICS.share_of_voice.plain}. ${brand} against ${int(m.workspace?.competitors.length ?? 0)} tracked competitor${s(m.workspace?.competitors.length ?? 0)}.`,
    },
    {
      label: "Citations · sampled answers",
      value: int(m.citationsCount),
      note: `${METRICS.citations_count.plain}. ${int(m.uniqueCitedDomains)} distinct domain${s(m.uniqueCitedDomains)}; ${pct(m.ownedCitationShare)} point at ${m.workspace?.domain || "the workspace domain"}.`,
    },
    {
      label: METRICS.avg_answer_position.label,
      value: m.avgAnswerPosition == null ? "Not named yet" : m.avgAnswerPosition.toFixed(1),
      note: `${METRICS.avg_answer_position.plain}. Named ahead of every competitor in ${int(m.answerRankFirst)} answer${s(m.answerRankFirst)}.`,
    },
    {
      label: METRICS.prompts_tracked.label,
      value: `${int(m.promptsTracked)} prompt${s(m.promptsTracked)}`,
      note: `${METRICS.prompts_tracked.plain}. Everything in this report is computed over these prompts.`,
    },
    {
      label: "Sampled history",
      value: `${int(m.days)} day${s(m.days)}`,
      note:
        m.lastRunAt == null
          ? "No runs collected yet."
          : `Days on which runs were actually collected${first && last ? ` (${dayLabel(first)} – ${dayLabel(last)})` : ""}. Trends are computed from these days only.`,
    },
  ];

  const sections: ReportSection[] = [];

  if (m.series.length > 0) {
    sections.push(
      seriesSection(
        "Visibility and share of voice — sampled days",
        [
          { id: "vis", label: "Visibility", color: "var(--ac)", points: m.series.map((p) => p.visibility) },
          { id: "sov", label: "Share of voice", color: "#7fa7d9", points: m.series.map((p) => p.shareOfVoice) },
        ],
        m.series.map((p) => p.date),
        { unit: "%", note: "One row per day the sampler ran. Days with no runs are absent rather than interpolated." }
      )
    );
    sections.push({
      title: "Runs collected per sampled day",
      note: "Prompt runs stored that day — the sample size behind that day's scores.",
      columns: ["Date", "Runs"],
      rows: m.series.map((p) => [p.date, p.runs]),
    });
  }

  sections.push({
    title: "Share of voice by brand",
    note: "Of all tracked-brand mentions in the latest answer per prompt. Rows sum to 100%.",
    columns: ["Rank", "Brand", "Share of voice", "Prompts naming it"],
    rows: m.brands.map((b, i) => [String(i + 1), b.isBrand ? `${b.name} (You)` : b.name, pct(b.share), b.mentions]),
  });

  sections.push({
    title: "Visibility by platform",
    note: "Answers naming the brand ÷ answers returned, per engine that answered.",
    columns: ["Platform", "Visibility", "Answers naming brand", "Answers returned"],
    rows: m.platforms.map((p) => [p.label, pct(p.visibility), p.appearances, p.answers]),
  });

  sections.push({
    title: "Top cited sources",
    note: "Domains the sampled answers linked to, most cited first.",
    columns: ["Source", "Citations", "Share of citations", "Owned"],
    rows: m.citedDomains.map((d) => [d.domain, d.count, pct(d.share), d.owned ? "yes" : "no"]),
  });

  return {
    module: "Overview",
    brand,
    window:
      m.series.length > 0 && first && last
        ? `Sampled history: ${int(m.days)} day${s(m.days)} (${dayLabel(first)} – ${dayLabel(last)})`
        : "No sampled runs yet",
    windowNote:
      "This report covers only the days the sampler actually ran — there is no 30-day comparison window, so change-vs-previous columns are omitted rather than estimated.",
    summary,
    sections,
    footnotes: [
      "Visibility is platform- and position-weighted; share of voice is unweighted mention share. They differ by design.",
      `Figures are computed live from sampled answers (lib/live/metrics), not from a sample dataset${m.lastRunAt ? `; last run ${dayLabel(new Date(m.lastRunAt).toISOString().slice(0, 10))}` : ""}.`,
      "Full metric definitions: METRICS.md, or the ⓘ beside each KPI in-app.",
    ],
  };
}
