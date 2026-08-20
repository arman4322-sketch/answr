"use client";

import { useState } from "react";

/* Implementation checklist step — a real, self-contained toggle (playbook 4's
   trivial-toggle exception: flipping local visual state instead of a toast).
   Checked state mirrors the frame's own depicted done style (accent ✓ square +
   struck-through muted label). Step 1 stays static server markup — it shipped
   Aug 1 and carries fixture metadata. */

export default function ChecklistStep({ label }: { label: string }) {
  const [done, setDone] = useState(false);
  return (
    <div style={{display:"flex",gap:"11px",alignItems:"flex-start",padding:"12px 14px",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"9px"}}>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? `Mark not done: ${label}` : `Mark done: ${label}`}
        onClick={() => setDone((v) => !v)}
        style={
          done
            ? {width:"16px",height:"16px",flex:"none",borderRadius:"4px",background:"var(--ac)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"10px",fontWeight:700,marginTop:"1px",border:"none",padding:"0",cursor:"pointer",fontFamily:"inherit"}
            : {width:"16px",height:"16px",flex:"none",borderRadius:"4px",border:"1px solid var(--brd)",background:"var(--bg0)",marginTop:"1px",padding:"0",cursor:"pointer"}
        }
      >
        {done ? "✓" : ""}
      </button>
      <div
        style={
          done
            ? {fontSize:"13px",fontWeight:500,textDecoration:"line-through",textDecorationColor:"var(--fnt)",color:"var(--mut)"}
            : {fontSize:"13px",fontWeight:500}
        }
      >
        {label}
      </div>
    </div>
  );
}
