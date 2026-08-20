/* Executive CSV reports.

   Every Export button in the app produces a report a VP can open in Excel and
   read top-to-bottom — not a raw table dump: a titled header block (brand,
   window, generated-at, methodology pointer), an EXECUTIVE SUMMARY of headline
   metrics with deltas and plain-English reads, then the supporting detail
   sections, then footnotes naming the data source per METRICS.md.

   Pages either pass a full ReportSpec (rich, multi-section) or just rows, which
   get wrapped in the same envelope automatically — so no export is ever a bare
   dump. */

export type SummaryStat = {
  label: string;
  value: string;
  /** e.g. "+2.8pt" / "-0.4" — arrows are normalized to +/- for spreadsheets */
  delta?: string;
  /** plain-English read: what this number means / why it moved */
  note?: string;
};

export type ReportSection = {
  title: string;
  columns: string[];
  rows: (string | number)[][];
  /** optional one-line explanation printed under the section title */
  note?: string;
};

export type ReportSpec = {
  /** e.g. "Answer Engine Insights" */
  module: string;
  /** the workspace brand, e.g. "Nike" */
  brand: string;
  /** e.g. "Last 30 days (vs previous 30 days)" — the window the DATA covers */
  window: string;
  /** printed under the window: why it may differ from the on-screen filter */
  windowNote?: string;
  summary?: SummaryStat[];
  sections: ReportSection[];
  footnotes?: string[];
};

const ARROWS: Record<string, string> = { "↑": "+", "↓": "-", "▲": "+", "▼": "-" };

/* A lone em/en dash is the UI's "no change" marker and becomes an empty cell.
   It must only match a cell that IS that dash — em dashes also punctuate the
   summary prose, and a blanket replace ate them ("Rising — see the drivers
   below" → "Rising see the drivers below"). */
const NO_CHANGE = /^[—–]$/;

/** Spreadsheets mangle ↑/↓; normalize to +/- and strip stray whitespace. */
function clean(v: string | number): string {
  let s = String(v ?? "");
  for (const [k, r] of Object.entries(ARROWS)) s = s.split(k).join(r);
  s = s.replace(/\s+/g, " ").trim();
  return NO_CHANGE.test(s) ? "" : s;
}

function esc(v: string | number): string {
  const s = clean(v);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

function row(cells: (string | number)[]): string {
  return cells.map(esc).join(",");
}

function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function buildExecutiveCsv(spec: ReportSpec): string {
  const out: string[] = [];

  // ---- header block -------------------------------------------------------
  out.push(row([`Answr — ${spec.module} report`]));
  out.push(row(["Brand", spec.brand]));
  out.push(row(["Reporting window", spec.window]));
  /* The reporting window above always describes the DATA in this file. When the
     workspace filter is set to something else, say so here rather than letting
     a mislabeled file leave the building inside a stakeholder's inbox. */
  if (spec.windowNote) out.push(row(["Note on window", spec.windowNote]));
  out.push(row(["Generated", stamp()]));
  out.push(row(["Source", "Answr answer-sampling pipeline · metric definitions in METRICS.md"]));
  out.push("");

  // ---- executive summary --------------------------------------------------
  if (spec.summary?.length) {
    out.push(row(["EXECUTIVE SUMMARY"]));
    out.push(row(["Metric", "Value", "Change vs previous", "What it means"]));
    for (const s of spec.summary) out.push(row([s.label, s.value, s.delta ?? "", s.note ?? ""]));
    out.push("");
  }

  // ---- detail sections ----------------------------------------------------
  for (const sec of spec.sections) {
    out.push(row([sec.title.toUpperCase()]));
    if (sec.note) out.push(row([sec.note]));
    out.push(row(sec.columns));
    for (const r of sec.rows) out.push(row(r));
    out.push("");
  }

  // ---- footnotes ----------------------------------------------------------
  if (spec.footnotes?.length) {
    out.push(row(["NOTES"]));
    for (const f of spec.footnotes) out.push(row([f]));
  }

  return out.join("\n");
}

/** Legacy call sites pass a bare table; wrap it in the same executive envelope. */
export function wrapRows(
  rows: string[][],
  meta: { module: string; brand: string; window: string; sectionTitle?: string }
): ReportSpec {
  const [columns = [], ...body] = rows;
  return {
    module: meta.module,
    brand: meta.brand,
    window: meta.window,
    sections: [{ title: meta.sectionTitle ?? meta.module, columns, rows: body }],
    footnotes: ["Figures are the values shown on screen for the selected window.", "Metric definitions: METRICS.md (also in-app via the ⓘ on each KPI)."],
  };
}

/** UTF-8 BOM so Excel renders ° · — and accented characters correctly. */
export function csvBlob(csv: string): Blob {
  return new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
}
