"use client";

import { toast } from "@/lib/toast";

/* Client controls for the Watched URLs page — creation-style buttons toast the
   honest demo line (playbook 3); the Gap view / All sources toggle keeps the
   depicted gap view and toasts on the missing view (playbook 8). */

export function WatchUrlButton() {
  return (
    <button
      type="button"
      className="btn-ac"
      onClick={() => toast("Creating a watched URL needs a live workspace — this demo is read-only.")}
      style={{fontSize:"12px",fontWeight:500,borderRadius:"7px",padding:"5px 12px",border:"none",cursor:"pointer",fontFamily:"inherit"}}
    >
      {"+ Watch a URL"}
    </button>
  );
}

export function GapViewToggle() {
  return (
    <div style={{display:"inline-flex",border:"1px solid var(--brd)",borderRadius:"6px",padding:"2px",fontSize:"11px"}}>
      <span style={{fontWeight:"600",background:"var(--ac)",color:"#fff",borderRadius:"4px",padding:"3px 10px"}}>{"Gap view"}</span>
      <button
        type="button"
        onClick={() => toast("The demo ships the gap-view fixture — the full source list lives on live workspaces.")}
        style={{color:"var(--mut)",padding:"3px 10px",background:"none",border:"none",fontSize:"11px",fontFamily:"inherit",cursor:"pointer"}}
      >
        {"All sources"}
      </button>
    </div>
  );
}

export function SuggestedPlay({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => toast("Creating an outreach action needs a live workspace — this demo is read-only.")}
      style={{fontSize:"11.5px",color:"var(--ac)",fontWeight:500,background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}
    >
      {label}
    </button>
  );
}
