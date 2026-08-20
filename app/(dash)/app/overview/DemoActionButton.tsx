"use client";

import { toast } from "@/lib/toast";

/* "Improve visibility" quick-action row (Create content / Optimize a page) —
   these imply operations that need a live workspace, so they toast the honest
   demo line (INTERACTIVITY_CONVENTIONS playbook 3). Styles verbatim from the
   frame's static buttons. */
export default function DemoActionButton({ label, note }: { label: string; note: string }) {
  return (
    <button
      type="button"
      onClick={() => toast(note)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "9px 12px",
        background: "var(--bg0)",
        border: "1px solid var(--brd)",
        borderRadius: "7px",
        color: "var(--tx)",
        font: "inherit",
        fontSize: "12.5px",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span style={{ fontWeight: "500" }}>{label}</span>
      <span style={{ color: "var(--ac)" }}>{"→"}</span>
    </button>
  );
}
