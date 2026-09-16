"use client";

import { toast } from "@/lib/toast";

/* Client controls for the Watched URLs page. Both buttons are honest about the
   live engine: citations are sampled and aggregated per domain, so watching an
   individual URL and the all-sources view have nothing behind them yet. Neither
   control invents rows to fill its table. */

export function WatchUrlButton() {
  return (
    <button
      type="button"
      className="btn-ac"
      onClick={() => toast("Watching a single URL isn't supported yet — sampled citations are tracked per domain.")}
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
        onClick={() => toast("Every domain in the sample is listed on the Citations screen — the gap split needs per-citation brand attribution, which isn't computed yet.")}
        style={{color:"var(--mut)",padding:"3px 10px",background:"none",border:"none",fontSize:"11px",fontFamily:"inherit",cursor:"pointer"}}
      >
        {"All sources"}
      </button>
    </div>
  );
}
