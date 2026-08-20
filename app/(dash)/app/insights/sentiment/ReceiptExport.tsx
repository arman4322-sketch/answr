"use client";

import { toast } from "@/lib/toast";
import { buildExecutiveCsv, csvBlob, type ReportSpec } from "@/lib/export/report";

/* In-card export for the "Answer receipt" (playbook 1) — the shared
   <ExportButton> renders the btn-ac primary treatment, but the frame draws
   this control as a tiny accent text link, so the download logic is inlined
   here with the frame's exact styles. It still produces the same executive
   envelope every other export does (header block, summary, sections,
   footnotes), scoped to this single answer. Filename has no "-30d" suffix
   because this exports one answer receipt, not a 30-day table. */

const FILENAME = "nike-answer-receipt.csv";

const SPEC: ReportSpec = {
  module: "Sentiment — answer receipt",
  brand: "Nike",
  window: "Single sampled answer · Aug 2, 2026 (30-day window Jul 7 – Aug 5)",
  summary: [
    {
      label: "Prompt",
      value: '"are the nike pegasus worth it at full price for a 50-mile week"',
      note: "A purchase-intent question where the brand wins on product and loses on price.",
    },
    {
      label: "Classified theme",
      value: "Price at full retail — negative",
      delta: "+34 mentions vs previous 30 days",
      note: "The workspace's fastest-growing negative theme; 31 of 34 new occurrences cite the old cached pricing page.",
    },
    {
      label: "Where and when",
      value: "ChatGPT · US · Aug 2",
      note: "One of the 186 answers analyzed for the 74% positive-sentiment headline.",
    },
    {
      label: "Sources the assistant cited",
      value: "nike.com/pegasus (cached Jun) · runnersworld.com",
      note: "The cached owned page is the fixable half — refreshing it removes the stale price the answer reasons from.",
    },
  ],
  sections: [
    {
      title: "Answer",
      note: "Verbatim excerpt, with the spans that drove the classification.",
      columns: ["Excerpt", "Positive span", "Negative span"],
      rows: [
        [
          "…Nike is the strongest option technically, with best-in-class cushioning, though paying full retail adds up beyond ~40 miles a week — budget-sensitive runners sometimes choose Adidas…",
          "best-in-class cushioning",
          "paying full retail adds up beyond ~40 miles a week",
        ],
      ],
    },
    {
      title: "Engine sub-queries",
      note: "Searches the assistant ran on its own before answering.",
      columns: ["Sub-query"],
      rows: [['"nike pegasus price 2026"'], ['"nike vs adidas running shoe cost"']],
    },
    {
      title: "Cited sources",
      note: "Every source attached to this answer, in citation order.",
      columns: ["#", "Source", "Class"],
      rows: [
        ["1", "nike.com/pegasus (cached Jun)", "Owned — stale cache"],
        ["2", "runnersworld.com", "Editorial"],
      ],
    },
  ],
  footnotes: [
    "Sentiment = LLM classification of each brand-mention span, calibrated against a human-audited set (Settings › Data quality).",
    "34 answers share this prompt's theme in the window — Conversations lists them all.",
    "Full metric definitions: METRICS.md, or the ⓘ beside each figure in-app.",
  ],
};

export default function ReceiptExport() {
  function download() {
    const url = URL.createObjectURL(csvBlob(buildExecutiveCsv(SPEC)));
    const a = document.createElement("a");
    a.href = url;
    a.download = FILENAME;
    a.click();
    URL.revokeObjectURL(url);
    toast(`${FILENAME} downloaded — 1 answer, ${SPEC.summary?.length ?? 0} summary metrics, ${SPEC.sections.length} sections.`);
  }

  return (
    <button
      type="button"
      onClick={download}
      style={{ fontSize: "11px", color: "var(--ac)", fontWeight: "500", background: "none", border: "none", padding: "0", cursor: "pointer", fontFamily: "inherit" }}
    >
      {"Export"}
    </button>
  );
}
