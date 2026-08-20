"use client";

import { toast } from "@/lib/toast";
import { buildExecutiveCsv, csvBlob, type ReportSpec } from "@/lib/export/report";
import { withWindowNote, windowToastSuffix } from "@/lib/export/active-window";
import { useFilters } from "@/lib/filters/context";

/* Sibling of <ExportButton> for export controls the design draws as a quiet
   pill rather than the accent primary — Agent Analytics' "Export 48,231
   events", and the Actions / Demand screens whose primary slot is already taken
   by a create action. Same payload as every other export (the full executive
   envelope from lib/export/report.ts), with the caller's exact inline styles so
   activation never restyles. */

export default function ReportCsvButton({
  filename,
  report,
  className,
  style,
  children,
}: {
  /** e.g. "nike-agents-30d.csv" */
  filename: string;
  report: ReportSpec;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const { range, platform } = useFilters();

  function download() {
    /* same window honesty as <ExportButton>: the header names the window the
       rows cover, plus a note when the workspace filter is off its defaults */
    const spec = withWindowNote(report, range, platform);
    const url = URL.createObjectURL(csvBlob(buildExecutiveCsv(spec)));
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
    <button type="button" className={className} onClick={download} style={style}>
      {children}
    </button>
  );
}
