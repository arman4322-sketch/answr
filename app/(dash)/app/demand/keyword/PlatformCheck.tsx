"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";

/* By-platform inclusion checkbox — a real toggle (playbook 5): flipping swaps
   between the frame's two depicted square styles and toasts the honest demo
   line. Nothing else on the page changes (volumes/deltas stay fixture). */

export default function PlatformCheck({ platform, initialChecked }: { platform: string; initialChecked: boolean }) {
  const [checked, setChecked] = useState(initialChecked);
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={`Include ${platform}`}
      onClick={() => {
        setChecked((v) => !v);
        toast("Platform toggles apply on live workspaces.");
      }}
      style={
        checked
          ? {width:"12px",height:"12px",flex:"none",borderRadius:"3px",background:"var(--ac)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"9px",fontWeight:700,border:"none",padding:"0",cursor:"pointer",fontFamily:"inherit"}
          : {width:"12px",height:"12px",flex:"none",borderRadius:"3px",border:"1px solid var(--brd)",display:"inline-block",background:"none",padding:"0",cursor:"pointer"}
      }
    >
      {checked ? "✓" : ""}
    </button>
  );
}
