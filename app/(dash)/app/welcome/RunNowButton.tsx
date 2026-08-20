"use client";

import { toast } from "@/lib/toast";

/* Day-zero "Run now instead" — a workflow button; toasts the honest demo line
   (INTERACTIVITY_CONVENTIONS playbook 4). Styles verbatim from the frame. */
export default function RunNowButton() {
  return (
    <button
      type="button"
      className="btn-ac"
      onClick={() => toast("Prompt runs start on live workspaces — tonight's scheduled run is already queued.")}
      style={{
        fontSize: "12.5px",
        fontWeight: "500",
        borderRadius: "7px",
        padding: "8px 18px",
        marginTop: "4px",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {"Run now instead"}
    </button>
  );
}
