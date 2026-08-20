"use client";

import { toast } from "@/lib/toast";
import { buildExecutiveCsv, csvBlob, wrapRows, type ReportSpec } from "@/lib/export/report";
import { withWindowNote, windowToastSuffix } from "@/lib/export/active-window";
import { useFilters } from "@/lib/filters/context";

/* Export → an executive CSV (see lib/export/report.ts): titled header block,
   EXECUTIVE SUMMARY with deltas and plain-English reads, supporting detail
   sections, then source footnotes.

   Pass `report` for a rich multi-section export, or `rows` for a single table —
   rows are wrapped in the same envelope, so no export is ever a bare dump.

   Window honesty: the report specs are fixed snapshots of the shipped fixture,
   so "Reporting window" always names the window the ROWS cover — never the
   topbar pill. When the workspace filter is off its defaults, the header picks
   up a "Note on window" row saying which filter was active and that it is not
   applied, so a downloaded file can never be mistaken for a 90-day report. */

export default function ExportButton({
  label = "Export",
  filename,
  rows,
  report,
  module: moduleName,
  brand = "Nike",
  window: windowLabel = "Last 30 days (vs previous 30 days)",
}: {
  label?: string;
  /** e.g. "nike-citations-30d.csv" */
  filename: string;
  /** single table (header row first) — wrapped in the executive envelope */
  rows?: string[][];
  /** full executive report spec (preferred for module-level exports) */
  report?: ReportSpec;
  /** module name for the header block when passing `rows` */
  module?: string;
  brand?: string;
  window?: string;
}) {
  const { range, platform } = useFilters();

  function download() {
    const base: ReportSpec =
      report ??
      wrapRows(rows ?? [], {
        module: moduleName ?? (label.replace(/^Export\s*/i, "").trim() || "Report"),
        brand,
        window: windowLabel,
      });
    const spec = withWindowNote(base, range, platform);

    const csv = buildExecutiveCsv(spec);
    const url = URL.createObjectURL(csvBlob(csv));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    const dataRows = spec.sections.reduce((n, s) => n + s.rows.length, 0);
    toast(
      `${filename} downloaded — ${spec.summary?.length ? `${spec.summary.length} summary metrics, ` : ""}${dataRows} rows across ${spec.sections.length} section${spec.sections.length === 1 ? "" : "s"}.${windowToastSuffix(range, platform)}`
    );
  }

  return (
    <button
      type="button"
      className="btn-ac"
      onClick={download}
      style={{
        fontSize: "12.5px",
        fontWeight: 500,
        borderRadius: "7px",
        padding: "6px 14px",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  );
}
