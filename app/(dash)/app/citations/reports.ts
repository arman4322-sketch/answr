import type { ReportSpec } from "@/lib/export/report";
import { WINDOW_30D } from "@/lib/export/reports";
import { METRICS } from "@/lib/metrics";
import { CITATIONS_TOTAL, sourceMix } from "@/lib/data/evidence";

/* Citations cluster → executive CSVs.

   The Citations screen has no trend chart, so its report leads with the four
   KPIs (each with a plain-English read from METRICS[id].plain), then the source
   mix, the cited-domain league table, the most-cited pages, and the raw-answer
   preview the export dialog shows. Watched URLs gets its own spec. */

const FOOTNOTE_CITATIONS =
  "Source: citation links parsed from stored answer payloads — Perplexity and AI Overviews expose source lists directly; ChatGPT/Claude/Gemini citations are captured when browsing or retrieval surfaces them.";
const FOOTNOTE_METRICS = "Full metric definitions: METRICS.md, or the ⓘ beside each figure in-app.";

export const citationsSpec: ReportSpec = {
  module: "Citations",
  brand: "Nike",
  window: WINDOW_30D,
  summary: [
    {
      label: METRICS.citations_count.label,
      value: "1,284",
      delta: "+212",
      note: `${METRICS.citations_count.plain}. Every figure below is a cut of these 1,284 citations.`,
    },
    {
      label: METRICS.unique_cited_domains.label,
      value: "86",
      delta: "+9",
      note: `${METRICS.unique_cited_domains.plain}. Nine new domains entered the answer set this window.`,
    },
    {
      label: METRICS.owned_citation_share.label,
      value: "38%",
      delta: "+4pt",
      note: `${METRICS.owned_citation_share.plain}. 488 of 1,284 citations point at domains Nike controls.`,
    },
    {
      label: METRICS.answers_with_citation_rate.label,
      value: "71%",
      delta: "-2pt",
      note: `${METRICS.answers_with_citation_rate.plain}. Falling — a coverage warning, not a performance one: fewer sampled answers exposed parseable sources.`,
    },
    {
      label: "Biggest mover",
      value: "reddit.com — 164 citations",
      delta: "+67",
      note: "Community citations doubled since June, mostly reddit.com and letsrun.com running-shoe threads.",
    },
    {
      label: "Top owned page",
      value: "nike.com/running/marathon-training-guide — 84 citations",
      note: "Cited across ChatGPT, Perplexity and AI Overviews for 31 different tracked prompts.",
    },
  ],
  sections: [
    {
      title: "Source mix",
      note: "Who AI quotes — owned pages versus press, forums and reference sites. Counts sum to the 1,284 total.",
      columns: ["Source class", "Citations", "Share"],
      rows: [
        ...sourceMix.map((s) => [s.label, String(s.count), `${s.pct}%`]),
        ["Total", String(CITATIONS_TOTAL), "100%"],
      ],
    },
    {
      title: "Cited domains",
      note: "Every domain AI drew on for these prompts, ranked by citations.",
      columns: ["Domain", "Type", "Citations", "Share of all citations", "Change vs previous"],
      rows: [
        ["runnersworld.com", "Editorial", "248", "19.3%", "+41"],
        ["nike.com/running", "Owned", "201", "15.7%", "+38"],
        ["reddit.com", "Community", "164", "12.8%", "+67"],
        ["help.nike.com", "Owned", "122", "9.5%", "+19"],
        ["wirecutter.com", "Editorial", "97", "7.6%", "-8"],
        ["letsrun.com", "Community", "88", "6.9%", "+24"],
        ["wikipedia.org", "Reference", "61", "4.8%", "—"],
      ],
    },
    {
      title: "Most cited pages",
      note: "The individual URLs AI links to most, and which assistants quote them.",
      columns: ["URL", "Citations", "Prompts", "Cited on"],
      rows: [
        ["nike.com/running/marathon-training-guide", "84", "31", "ChatGPT · Perplexity · AIO"],
        ["runnersworld.com/gear/best-running-shoes", "71", "28", "ChatGPT · AIO"],
        ["help.nike.com/running-shoe-fit-guide", "56", "19", "Claude · Perplexity"],
        ["reddit.com/r/running/best_running_shoes_2026", "49", "12", "ChatGPT · Gemini"],
      ],
    },
    {
      title: "Raw answers — preview",
      note: "First rows of the 1,306 answers in scope for this window; the full set exports on live workspaces.",
      columns: ["Date", "Prompt", "Brand mentioned", "Position"],
      rows: [
        ["Aug 2", "best running shoes for…", "yes", "1"],
        ["Aug 2", "alternatives to carbon-plate…", "no", "—"],
        ["Aug 1", "nike vs adidas running shoes", "yes", "1"],
      ],
    },
  ],
  footnotes: [
    FOOTNOTE_CITATIONS,
    "One answer citing two owned pages counts twice; the same page cited in two answers counts twice. Domain classes are set in Settings › Watched URLs.",
    "Answers-with-citation rate is a data-quality indicator: platforms that rarely expose sources pull it down without changing visibility.",
    FOOTNOTE_METRICS,
  ],
};

/** The export dialog's two checkboxes really change what the CSV contains. */
export function citationsReport({
  includeCitations = true,
  includeCompetitors = false,
}: { includeCitations?: boolean; includeCompetitors?: boolean } = {}): ReportSpec {
  return {
    ...citationsSpec,
    /* Uncheck "Include citations" and only the raw-answer preview survives. */
    sections: includeCitations ? citationsSpec.sections : citationsSpec.sections.slice(-1),
    footnotes: [
      ...(includeCitations
        ? []
        : ['Citation detail was excluded from this export — re-run with "Include citations" checked for the source mix, cited domains and most-cited pages.']),
      ...(includeCompetitors
        ? ["Competitor mentions were requested: the demo fixture ships Nike-scoped answers, so per-answer competitor columns populate on live workspaces. Competitive share of voice is in the Overview export."]
        : []),
      ...(citationsSpec.footnotes ?? []),
    ],
  };
}

export const watchedUrlsSpec: ReportSpec = {
  module: "Citations · Watched URLs",
  brand: "Nike",
  window: WINDOW_30D,
  summary: [
    {
      label: "URLs watched",
      value: "3",
      note: "Pages Answr alerts on when their citation performance shifts — one owned, one competitor, one editorial.",
    },
    {
      label: "New this window",
      value: "nike.com/compare/adidas — 18 citations",
      delta: "+18",
      note: "From zero: the comparison page started earning citations on ChatGPT and AI Overviews. This is action #92 landing.",
    },
    {
      label: "Competitor page being displaced",
      value: "adidas.com/compare — 24 citations",
      delta: "-7",
      note: "Still ahead, but falling as the Nike comparison page picks up the same prompts.",
    },
    {
      label: "Largest source gap",
      value: "believeintherun.com — 64 category citations, 0 for Nike",
      note: "Cites Adidas 41 times and never Nike. The single biggest earned-source opportunity in the category.",
    },
    {
      label: "Total gap volume",
      value: "131 category citations across 3 domains",
      note: "believeintherun.com 64 + youtube.com/@runningweekly 38 + quora.com/topic/running-shoes 29 — none of them citing Nike.",
    },
  ],
  sections: [
    {
      title: "Watched URLs",
      note: "Pages under citation alerting, with 30-day citation counts.",
      columns: ["URL", "Citations 30d", "Change vs previous", "Cited on", "Note"],
      rows: [
        ["nike.com/compare/adidas", "18", "+18", "ChatGPT · AIO", "NEW"],
        ["adidas.com/compare", "24", "-7", "ChatGPT", "Competitor"],
        ["wirecutter.com/best-running-shoes", "31", "—", "all platforms", "Editorial"],
      ],
    },
    {
      title: "Source gap",
      note: "Domains that cite this category often and never cite Nike, with the suggested play.",
      columns: ["Domain", "Category citations", "Cites most", "Suggested play"],
      rows: [
        ["believeintherun.com", "64", "Adidas ×41", "Pitch inclusion"],
        ["youtube.com/@runningweekly", "38", "Puma ×22", "Collab outreach"],
        ["quora.com/topic/running-shoes", "29", "Under Armour ×17", "Answer threads"],
      ],
    },
  ],
  footnotes: [
    FOOTNOTE_CITATIONS,
    "The demo ships the gap-view fixture — the full source list, including domains that already cite Nike, lives on live workspaces.",
    FOOTNOTE_METRICS,
  ],
};
