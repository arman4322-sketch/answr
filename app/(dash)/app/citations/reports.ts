import type { ReportSpec, ReportSection, SummaryStat } from "@/lib/export/report";
import { METRICS } from "@/lib/metrics";
import type { LiveMetrics } from "@/lib/live/metrics";
import { exportWindow, historyLabel, sourceSegments } from "./live";

/* Citations cluster → executive CSVs, built from live metrics.

   Every figure in these specs is read off lib/live/metrics — there are no
   fixture rows left. Where the live engine has nothing (no runs yet, no
   per-URL aggregation, no per-domain history) the spec says so in a footnote
   instead of shipping a number the data never supported. Deltas are absent
   throughout: the engine keeps no previous-window citation total, so a
   "change vs previous" column would have been fabricated. */

const FOOTNOTE_CITATIONS =
  "Source: citation links parsed from stored answer payloads — Perplexity and AI Overviews expose source lists directly; ChatGPT/Claude/Gemini citations are captured when browsing or retrieval surfaces them.";
const FOOTNOTE_METRICS = "Full metric definitions: METRICS.md, or the ⓘ beside each figure in-app.";
const FOOTNOTE_NO_DELTA =
  "No change-vs-previous column: the sample covers the days actually collected, and no previous-window citation total exists to compare against.";

const int = (n: number) => Math.round(n).toLocaleString("en-US");
const day = (ts: number) => new Date(ts).toISOString().slice(0, 10);

function brandOf(m: LiveMetrics): string {
  return m.workspace?.brand ?? "Not configured";
}

function scopeNote(m: LiveMetrics): string {
  if (!m.configured) return "No workspace configured — nothing has been sampled.";
  if (!m.hasData) return "Workspace configured; no sampled runs yet, so every citation figure is zero.";
  return `${historyLabel(m.days)}, ${int(m.answersSampled)} sampled answers.`;
}

function summary(m: LiveMetrics): SummaryStat[] {
  return [
    {
      label: METRICS.citations_count.label,
      value: int(m.citationsCount),
      note: `${METRICS.citations_count.plain}. ${scopeNote(m)}`,
    },
    {
      label: METRICS.unique_cited_domains.label,
      value: int(m.uniqueCitedDomains),
      note: `${METRICS.unique_cited_domains.plain}. Distinct registrable domains across the sampled citations.`,
    },
    {
      label: METRICS.owned_citation_share.label,
      value: m.citationsCount > 0 ? `${Math.round(m.ownedCitationShare)}%` : "not measured",
      note:
        m.citationsCount > 0
          ? `${METRICS.owned_citation_share.plain}. Share of the ${int(m.citationsCount)} sampled citations pointing at ${m.workspace?.domain || "the workspace domain"}.`
          : "No citations parsed yet, so the owned share has no denominator.",
    },
    {
      label: METRICS.answers_with_citation_rate.label,
      value: m.answersSampled > 0 ? `${Math.round(m.answersWithCitationRate)}%` : "not measured",
      note:
        m.answersSampled > 0
          ? `${METRICS.answers_with_citation_rate.plain}. A coverage indicator: platforms that rarely expose sources pull it down without changing visibility.`
          : "No answers sampled yet, so the coverage rate has no denominator.",
    },
  ];
}

function sourceMixSection(m: LiveMetrics): ReportSection {
  const { segments, total } = sourceSegments(m.citedDomains);
  return {
    title: "Source mix",
    note: "Owned versus earned, from the owned-domain flag on each sampled citation. Covers the latest run of each tracked prompt.",
    columns: ["Source class", "Citations", "Share"],
    rows: total
      ? [...segments.map((s) => [s.label, String(s.count), `${s.pct}%`]), ["Total", String(total), "100%"]]
      : [["No citations sampled yet", "0", ""]],
  };
}

function citedDomainsSection(m: LiveMetrics): ReportSection {
  return {
    title: "Cited domains",
    note: "Every domain the sampled answers drew on, ranked by citations.",
    columns: ["Domain", "Type", "Citations", "Share of sampled citations"],
    rows: m.citedDomains.length
      ? m.citedDomains.map((d) => [d.domain, d.owned ? "Owned" : "Earned", String(d.count), `${d.share}%`])
      : [["No domains cited yet", "", "0", ""]],
  };
}

function sampledAnswersSection(m: LiveMetrics, includeCompetitors: boolean): ReportSection {
  const columns = ["Date", "Prompt", "Brand mentioned", "Position", "Providers answered"];
  return {
    title: "Sampled prompts — latest run each",
    note: `The most recent sampled answer for each tracked prompt${includeCompetitors ? ", with the competitors named alongside" : ""}.`,
    columns: includeCompetitors ? [...columns, "Competitors mentioned"] : columns,
    rows: m.prompts.length
      ? m.prompts.map((p) => {
          const base = [day(p.ts), p.prompt, p.mentioned ? "yes" : "no", p.rank == null ? "—" : String(p.rank), String(p.providersAnswered)];
          return includeCompetitors ? [...base, p.competitorsMentioned.join(" · ") || "none"] : base;
        })
      : [["", "No prompts sampled yet", "", "", "", ...(includeCompetitors ? [""] : [])]],
  };
}

/** The export dialog's two checkboxes really change what the CSV contains. */
export function citationsReport(
  m: LiveMetrics,
  { includeCitations = true, includeCompetitors = false }: { includeCitations?: boolean; includeCompetitors?: boolean } = {}
): ReportSpec {
  const detail = [sourceMixSection(m), citedDomainsSection(m)];
  return {
    module: "Citations",
    brand: brandOf(m),
    window: exportWindow(m),
    windowNote: scopeNote(m),
    summary: summary(m),
    sections: includeCitations ? [...detail, sampledAnswersSection(m, includeCompetitors)] : [sampledAnswersSection(m, includeCompetitors)],
    footnotes: [
      ...(includeCitations
        ? []
        : ['Citation detail was excluded from this export — re-run with "Include citations" checked for the source mix and cited domains.']),
      FOOTNOTE_CITATIONS,
      "Source classes are owned versus earned only: the live engine classifies a citation by whether its domain belongs to the workspace, and keeps no editorial / community / reference taxonomy.",
      "Citations are aggregated by domain; per-URL (page-level) aggregation is not part of the live metrics layer, so no most-cited-pages table is exported.",
      FOOTNOTE_NO_DELTA,
      FOOTNOTE_METRICS,
    ],
  };
}

/** Watched URLs export — honest about a feature the live engine does not back. */
export function watchedUrlsReport(m: LiveMetrics): ReportSpec {
  return {
    module: "Citations · Watched URLs",
    brand: brandOf(m),
    window: exportWindow(m),
    windowNote: scopeNote(m),
    summary: [
      {
        label: "URLs watched",
        value: "0",
        note: "Per-URL watching and alerting is not backed by the live metrics layer — citations are tracked per domain.",
      },
      ...summary(m).slice(0, 3),
    ],
    sections: [citedDomainsSection(m)],
    footnotes: [
      FOOTNOTE_CITATIONS,
      "Watched URLs: the live engine aggregates citations by domain and exposes no per-URL history, so no watched-page table is exported.",
      "Source gap: identifying domains that cite the category but never this brand needs per-citation brand attribution, which the live metrics layer does not compute. Nothing is estimated in its place.",
      FOOTNOTE_NO_DELTA,
      FOOTNOTE_METRICS,
    ],
  };
}
