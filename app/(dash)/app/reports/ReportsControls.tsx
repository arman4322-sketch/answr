"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";

/* Reports cluster client controls (INTERACTIVITY_CONVENTIONS):
   - NewReportButton  → playbook 3: the topbar "+ New report" opens the designed
     ReportWizardModal (a modal already exists for it, so we open it instead of
     toasting). It lives inside the shared <Topbar extra> slot, which is a server
     boundary away from the modal's state, so it asks for the modal over the same
     window-event channel lib/toast uses.
   - DownloadButton   → playbook 1: real CSV built from the report's own fixture
     manifest (metadata + the sections that report ships).
   - ScheduleToggle   → playbook 5: real visual flip + honest toast; nothing else
     on the page changes. Dimensions copied from the frame's depicted pills. */

export const WIZARD_EVENT = "answr:report-wizard";

export function NewReportButton() {
  return (
    <button
      type="button"
      className="btn-ac"
      onClick={() => window.dispatchEvent(new CustomEvent(WIZARD_EVENT))}
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
      {"+ New report"}
    </button>
  );
}

export function DownloadButton({
  name,
  filename,
  format,
  rows,
}: {
  name: string;
  /** e.g. "nike-report-board-pack-q2-2026.csv" */
  filename: string;
  /** the row's depicted format — PDF rows get the honest CSV-instead line */
  format: string;
  /** header row first */
  rows: string[][];
}) {
  function download() {
    const csv = rows
      .map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replaceAll('"', '""')}"` : c)).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast(
      format === "PDF"
        ? `Downloaded ${filename} — ${rows.length - 1} rows. The demo exports report data as CSV; PDF rendering runs on live workspaces.`
        : `Downloaded ${filename} — ${rows.length - 1} rows.`
    );
  }

  return (
    <button
      type="button"
      aria-label={`Download ${name}`}
      onClick={download}
      style={{
        textAlign: "right",
        color: "var(--ac)",
        fontSize: "12px",
        fontWeight: "500",
        fontVariantNumeric: "tabular-nums",
        background: "none",
        border: "none",
        padding: "0",
        fontFamily: "inherit",
        cursor: "pointer",
      }}
    >
      {"Download ↓"}
    </button>
  );
}

export function ScheduleToggle({ label, defaultOn = true }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={on ? `Pause ${label}` : `Resume ${label}`}
      onClick={() => {
        setOn((v) => !v);
        toast(
          on
            ? "Paused here only — schedule delivery runs on live workspaces."
            : "Resumed here only — schedule delivery runs on live workspaces."
        );
      }}
      style={
        on
          ? {
              width: "34px",
              height: "19px",
              borderRadius: "10px",
              background: "var(--ac)",
              border: "none",
              position: "relative",
              display: "inline-block",
              flex: "none",
              padding: 0,
              cursor: "pointer",
            }
          : {
              width: "34px",
              height: "19px",
              borderRadius: "10px",
              background: "var(--bg2)",
              border: "1px solid var(--brd)",
              position: "relative",
              display: "inline-block",
              flex: "none",
              padding: 0,
              cursor: "pointer",
            }
      }
    >
      <span
        style={
          on
            ? { position: "absolute", right: "2px", top: "2px", width: "15px", height: "15px", borderRadius: "50%", background: "#fff" }
            : { position: "absolute", left: "2px", top: "2px", width: "14px", height: "14px", borderRadius: "50%", background: "var(--fnt)" }
        }
      />
    </button>
  );
}
