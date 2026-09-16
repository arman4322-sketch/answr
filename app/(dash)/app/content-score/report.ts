import type { ReportSpec } from "@/lib/export/report";
import type { LiveMetrics } from "@/lib/live/metrics";

/* Content score → export.

   The fixture manifest this button used to download (one Nike draft, its 68/100
   grade, four subscores and three estimated lifts) is gone. Nothing in the
   pipeline scores content, so the export carries no figures at all: it states
   what would have to exist for a grade to be computed, and says plainly that
   nothing is estimated. The button stays real — it downloads a file that is
   true. */

export function contentScoreSpec(m: LiveMetrics): ReportSpec {
  const brand = m.workspace?.brand ?? "Workspace";
  const needs =
    "Scoring a draft needs a page-fetching step that retrieves it and a scoring pass that grades it against the answers sampled for the tracked prompts. The sampler runs neither — it records the assistants' answers and their cited domains only.";

  return {
    module: "Content score",
    brand,
    window: "Not collected",
    windowNote:
      "No draft has been scored, and no grade is estimated here. This file exists so the Export button reports the truth rather than a fixture.",
    summary: [
      {
        label: "Content score",
        value: "Not available yet",
        note: `${needs} No estimated figures are shown.`,
      },
    ],
    sections: [
      {
        title: "Content score — not collecting data yet",
        note: "Nothing below is estimated; each row names a figure the screen would show and why it is absent.",
        columns: ["What this report would contain", "Why it is empty"],
        rows: [
          ["Likely-to-be-cited grade (0–100)", needs],
          ["Answerability, structure, evidence and freshness subscores", "Same requirement — no draft is fetched or parsed."],
          ["Median grade for pages on this topic", "The live layer stores no per-page corpus and no topic tags, so no median exists."],
          ["Estimated lift per recommendation", "A lift can only be estimated against a measured grade; there is none."],
        ],
      },
    ],
    footnotes: [
      "Source: lib/live/metrics — sampled answers and their cited domains. Neither page content nor page structure is collected.",
      "Measured figures for this workspace are in the Overview, Answer Engine Insights and Citations reports.",
      "Full metric definitions: METRICS.md, or the ⓘ beside each figure in-app.",
    ],
  };
}
