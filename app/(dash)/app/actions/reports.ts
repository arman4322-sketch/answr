import type { ReportSpec, ReportSection, SummaryStat } from "@/lib/export/report";
import {
  enginesLabel,
  fmtDateTime,
  historyLabel,
  kindLabel,
  rankLabel,
  savedStatusLabel,
  type ActionsScreen,
  type GapRow,
} from "./rows";

/* Actions → executive CSVs, built from the live queue the screen renders.

   The old specs exported a story the product could not support: a "+9.4pt
   available" impact model, per-category gains, a measured-lift calibration, an
   owner and effort per action and a 30-day window the data never covered. All
   of it was fixture text. What ships now is the evidence itself — which tracked
   prompts the brand lost, to whom, on how many engines, and when it was last
   sampled — plus whatever actions the user saved themselves.

   No estimate, score, effort, owner or date is exported that the pipeline does
   not actually produce. */

const FOOTNOTE_DERIVED =
  "Every row is derived from the latest sampled run per prompt (lib/live/metrics) — no figure in this file is estimated, projected or modelled.";
const FOOTNOTE_ORDER =
  "Sorted worst-first: prompts whose answers named no one from your brand come before prompts where the brand is named after a competitor.";
const FOOTNOTE_NO_MODEL =
  "No impact score, effort size, owner, due date or projected lift is exported. Nothing in the sampling pipeline measures the effect of a fix, so those columns do not exist rather than being guessed.";
const FOOTNOTE_METRICS = "Full metric definitions: METRICS.md, or the ⓘ beside each figure in-app.";

/** The window the exported rows really cover — never a fixed "last 30 days". */
export function actionsWindowLabel(d: ActionsScreen): string {
  if (!d.configured) return "No workspace configured — nothing has been sampled";
  if (!d.hasData) return "No runs sampled yet — no gaps can be derived";
  return `Latest run per prompt · ${historyLabel(d.days)} (last run ${fmtDateTime(d.lastRunAt)})`;
}

function gapRow(g: GapRow, i: number): (string | number)[] {
  return [
    i + 1,
    kindLabel(g.kind),
    g.prompt,
    g.kind === "missing" ? "not named" : rankLabel(g.rank),
    g.providersAnswered,
    g.competitorsMentioned.join(" · "),
    fmtDateTime(g.ts),
  ];
}

const GAP_COLUMNS = [
  "Queue position",
  "Gap",
  "Prompt",
  "Rank in answers",
  "Engines answered",
  "Competitors named",
  "Last run (UTC)",
];

export function actionsReport(d: ActionsScreen): ReportSpec {
  const brand = d.brand || "Not configured";
  const summary: SummaryStat[] = [
    {
      label: "Visibility gaps",
      value: String(d.missingCount),
      note: `Tracked prompts whose latest sampled answers named ${brand} nowhere. These are the queue's worst rows.`,
    },
    {
      label: "Ranking gaps",
      value: String(d.trailingCount),
      note: `Tracked prompts where ${brand} is named, but at least one tracked competitor is named first.`,
    },
    {
      label: "Prompts named first",
      value: String(d.leadCount),
      note: `Sampled prompts where ${brand} is named ahead of every tracked competitor — no action derived.`,
    },
    {
      label: "Prompts sampled",
      value: String(d.promptsSampled),
      note: `Prompts with a completed run; ${d.promptsTracked} prompt(s) are tracked right now. A prompt with no run produces no gap and appears nowhere in this file.`,
    },
    {
      label: "Sampled history",
      value: historyLabel(d.days),
      note: `Last run ${fmtDateTime(d.lastRunAt)}. Every row reflects that run only — no trend is implied.`,
    },
    {
      label: "Actions you saved",
      value: String(d.saved.length),
      note: "Actions created by hand in this workspace, with whatever estimate and effort you typed.",
    },
  ];

  const sections: ReportSection[] = [];

  const missing = d.gaps.filter((g) => g.kind === "missing");
  const trailing = d.gaps.filter((g) => g.kind === "trailing");

  if (missing.length) {
    sections.push({
      title: "Visibility gaps — no engine named your brand",
      note: "The latest answers to these prompts did not mention the brand at all. Queue position is the screen's worst-first order.",
      columns: GAP_COLUMNS,
      rows: missing.map((g, i) => gapRow(g, i)),
    });
  }
  if (trailing.length) {
    sections.push({
      title: "Ranking gaps — competitors named first",
      note: "The brand appears, but after a tracked competitor. Rank is the average position of the brand's first mention across the engines that answered.",
      columns: GAP_COLUMNS,
      rows: trailing.map((g, i) => gapRow(g, missing.length + i)),
    });
  }
  if (d.rivals.length) {
    sections.push({
      title: "Competitors named across this queue",
      note: "How many prompts in the queue above named each tracked competitor in their latest answers.",
      columns: ["Competitor", "Prompts in this queue naming them"],
      rows: d.rivals.map((r) => [r.name, r.prompts]),
    });
  }
  if (d.saved.length) {
    sections.push({
      title: "Actions you saved",
      note: "Created through the action queue. Impact is your own estimate — Answr does not compute one.",
      columns: ["Title", "Your impact estimate", "Effort", "Status", "Created (UTC)"],
      rows: d.saved.map((a) => [
        a.title,
        a.impact || "not estimated",
        a.effort || "—",
        savedStatusLabel(a.status),
        fmtDateTime(a.createdAt),
      ]),
    });
  }
  if (!sections.length) {
    sections.push({
      title: "Action queue",
      note: "Nothing to report yet.",
      columns: ["State"],
      rows: [
        [
          !d.configured
            ? "No workspace configured — set up a brand, domain and prompt set before anything can be sampled."
            : !d.hasData
              ? "Workspace configured, but no answers have been sampled yet. The queue fills after the first run."
              : `No gaps in the latest runs — ${brand} was named ahead of every tracked competitor on all ${d.promptsSampled} sampled prompt(s).`,
        ],
      ],
    });
  }

  return {
    module: "Actions",
    brand,
    window: actionsWindowLabel(d),
    summary,
    sections,
    footnotes: [FOOTNOTE_DERIVED, FOOTNOTE_ORDER, FOOTNOTE_NO_MODEL, FOOTNOTE_METRICS],
  };
}

export function gapBriefReport(d: ActionsScreen, g: GapRow): ReportSpec {
  const brand = d.brand || "Not configured";
  const summary: SummaryStat[] = [
    { label: "Gap", value: kindLabel(g.kind), note: g.title },
    { label: "Prompt", value: g.prompt, note: "The tracked prompt exactly as the sampler asks it." },
    {
      label: "Rank in answers",
      value: g.kind === "missing" ? "not named" : rankLabel(g.rank),
      note:
        g.kind === "missing"
          ? `No engine named ${brand} in the latest answers to this prompt.`
          : `Average position of ${brand}'s first mention across the engines that answered.`,
    },
    {
      label: "Engines answered",
      value: String(g.providersAnswered),
      note: `${enginesLabel(g.providersAnswered)} returned an answer for this prompt in the latest run.`,
    },
    {
      label: "Competitors named",
      value: g.competitorsMentioned.length ? g.competitorsMentioned.join(", ") : "none",
      note: "Tracked competitors appearing in the same answers.",
    },
    {
      label: "Last run",
      value: fmtDateTime(g.ts),
      note: `Workspace has ${historyLabel(d.days)}.`,
    },
  ];

  const sections: ReportSection[] = [
    {
      title: "What the answers show",
      note: "Assembled only from values in the run.",
      columns: ["Observation"],
      rows: [[g.evidence]],
    },
  ];
  if (g.excerpt) {
    sections.push({
      title: "Sampled answer — excerpt",
      note: "The opening of the first answer received for this prompt, verbatim.",
      columns: ["Excerpt"],
      rows: [[g.excerpt]],
    });
  }

  return {
    module: `Actions · ${kindLabel(g.kind).toLowerCase()}`,
    brand,
    window: actionsWindowLabel(d),
    summary,
    sections,
    footnotes: [
      FOOTNOTE_DERIVED,
      FOOTNOTE_NO_MODEL,
      "Citations are reported across the whole workspace, not per prompt, so no source list is attached to this gap.",
      FOOTNOTE_METRICS,
    ],
  };
}
