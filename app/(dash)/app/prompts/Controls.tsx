"use client";

import { toast } from "@/lib/toast";
import { buildExecutiveCsv, csvBlob, wrapRows } from "@/lib/export/report";
import { fmtDateTime, slugify, type PromptsScreen, type ScreenPromptRow } from "./rows";

/* Prompts exports. Every cell comes from the live rows the screen renders —
   the fixture table (PROMPT_ROWS: Nike, 8 painted rows, "412 prompts") is gone.

   The executive envelope states the window the file actually covers: the latest
   run per prompt plus the number of days the workspace has really sampled. A
   prompt with no run yet exports as "not sampled yet", never as a number. */

export const PROMPT_CSV_HEADER = [
  "Prompt",
  "Mentioned",
  "Rank in answer",
  "Engines answered",
  "Competitors named",
  "Last run (UTC)",
];

export function promptRowToCsv(r: ScreenPromptRow): string[] {
  if (!r.sampled) return [r.prompt, "not sampled yet", "", "", "", ""];
  return [
    r.prompt,
    r.mentioned ? "yes" : "no",
    r.rank != null ? r.rank.toFixed(1) : "",
    String(r.providersAnswered),
    r.competitorsMentioned.join(" · "),
    fmtDateTime(r.ts),
  ];
}

/** The window the exported rows really cover — never a fixed "last 30 days". */
export function exportWindowLabel(d: PromptsScreen): string {
  if (!d.configured) return "No workspace configured — nothing has been sampled";
  if (!d.hasData) return "No runs sampled yet — tracked prompt list only";
  return `Latest run per prompt · ${d.days} day${d.days === 1 ? "" : "s"} of sampled history (last run ${fmtDateTime(d.lastRunAt)})`;
}

export function downloadPromptCsv(
  d: PromptsScreen,
  rows: ScreenPromptRow[],
  opts: { filename: string; sectionTitle?: string },
) {
  if (rows.length === 0) {
    toast("Nothing to export yet — no tracked prompts.");
    return;
  }
  const sampled = rows.filter((r) => r.sampled).length;
  const csv = buildExecutiveCsv({
    ...wrapRows([PROMPT_CSV_HEADER, ...rows.map(promptRowToCsv)], {
      module: "Prompts",
      brand: d.brand || "Not configured",
      window: exportWindowLabel(d),
      sectionTitle: opts.sectionTitle ?? "Tracked prompts",
    }),
    footnotes: [
      `${rows.length} prompt${rows.length === 1 ? "" : "s"} in this file · ${sampled} with a completed run · ${rows.length - sampled} awaiting their first run.`,
      "Rank is the average position of the brand's first mention in the latest run; blank when the answer did not name the brand.",
      "Metric definitions: METRICS.md (also in-app via the ? beside each column).",
    ],
  });
  const url = URL.createObjectURL(csvBlob(csv));
  const a = document.createElement("a");
  a.href = url;
  a.download = opts.filename;
  a.click();
  URL.revokeObjectURL(url);
  toast(`Downloaded ${opts.filename} — ${rows.length} prompt${rows.length === 1 ? "" : "s"}.`);
}

export function ExportPromptsButton({ data }: { data: PromptsScreen }) {
  const n = data.rows.length;
  return (
    <button
      type="button"
      aria-disabled={n === 0}
      onClick={() =>
        downloadPromptCsv(data, data.rows, { filename: `${slugify(data.brand)}-prompts.csv` })
      }
      style={{fontSize:"12px",fontWeight:500,color:"var(--mut)",background:"rgba(255,255,255,0.045)",borderRadius:"7px",padding:"6px 12px",border:"none",cursor:"pointer",fontFamily:"inherit",opacity:n === 0 ? 0.5 : 1}}
    >
      {n === 0 ? "Export prompts" : `Export ${n} prompt${n === 1 ? "" : "s"}`}
    </button>
  );
}
