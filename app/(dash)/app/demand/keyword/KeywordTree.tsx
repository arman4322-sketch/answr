"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";

/* Keyword tree rows — markup verbatim from the frame, activated:
   - the parent row's ▾ really collapses/expands the long-tail children
     (chevron flips to ▸, accordion playbook);
   - ☆ stars are real local toggles that flip to the frame's depicted ★ accent
     state + honest toast (playbook 5);
   - long-tail .row-hover rows click through to the honest single-detail toast
     (only the "best running shoes" detail exists in the demo). */

function Star({ initialOn }: { initialOn?: boolean }) {
  const [on, setOn] = useState(!!initialOn);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Remove from watchlist" : "Add to watchlist"}
      onClick={(e) => {
        e.stopPropagation();
        setOn((v) => !v);
        toast("Watchlist stars apply on live workspaces.");
      }}
      style={{background:"none",border:"none",padding:"0",font:"inherit",cursor:"pointer",color:on ? "var(--ac)" : "var(--fnt)"}}
    >
      {on ? "★" : "☆"}
    </button>
  );
}

const ONLY_DETAIL = "This is the only keyword detail in the demo.";

function LongTailRow({ label, vol, delta, deltaColor }: { label: string; vol: string; delta: string; deltaColor: string }) {
  return (
    <div
      className="row-hover"
      role="button"
      tabIndex={0}
      onClick={() => toast(ONLY_DETAIL)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toast(ONLY_DETAIL);
        }
      }}
      style={{display:"flex",alignItems:"center",gap:"8px",padding:"7px 10px 7px 30px",borderRadius:"6px",color:"var(--mut)",cursor:"pointer"}}
    >
      <span>{label}</span>
      <span style={{marginLeft:"auto",fontWeight:"600"}}>{vol}</span>
      <span style={{fontSize:"11px",fontWeight:"500",color:deltaColor}}>{delta}</span>
      <Star />
    </div>
  );
}

export default function KeywordTree() {
  const [open, setOpen] = useState(true);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"2px",marginTop:"12px",fontSize:"12.5px",fontVariantNumeric:"tabular-nums"}}>
      <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"7px 10px",borderRadius:"6px",background:"rgba(255,255,255,0.04)"}}>
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Collapse long-tail keywords" : "Expand long-tail keywords"}
          onClick={() => setOpen((v) => !v)}
          style={{color:"var(--fnt)",background:"none",border:"none",padding:"0",font:"inherit",cursor:"pointer"}}
        >
          {open ? "▾" : "▸"}
        </button>
        <span style={{fontWeight:"600"}}>{"running shoes"}</span>
        <span style={{marginLeft:"auto",fontWeight:"600"}}>{"312K"}</span>
        <span style={{fontSize:"11px",fontWeight:"500",color:"#4cb782"}}>{"↑ 9%"}</span>
        <Star />
      </div>
      {open && (
        <>
          <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"7px 10px 7px 30px",borderRadius:"6px",background:"rgba(142,124,242,0.08)"}}>
            <span style={{fontWeight:"500"}}>{"best running shoes"}</span>
            <span style={{marginLeft:"auto",fontWeight:"600"}}>{"128K"}</span>
            <span style={{fontSize:"11px",fontWeight:"500",color:"#4cb782"}}>{"↑ 10%"}</span>
            <Star initialOn />
          </div>
          <LongTailRow label="running shoes for flat feet" vol="96K" delta="↓ 6%" deltaColor="#e5636e" />
          <LongTailRow label="carbon plate running shoes" vol="41K" delta="↑ 38%" deltaColor="#4cb782" />
          <LongTailRow label="trail running shoes" vol="24K" delta="↑ 12%" deltaColor="#4cb782" />
          <LongTailRow label="nike pegasus review" vol="8.4K" delta="↑ 22%" deltaColor="#4cb782" />
        </>
      )}
    </div>
  );
}
