"use client";

import Link from "next/link";
import { useState } from "react";
import Hint from "@/components/ui/Hint";
import { fmtInt } from "@/lib/filters/windows";
import type { CitedDomain } from "@/lib/live/metrics";
import { CardEmpty } from "./StateNotice";

/* Cited domains — markup from frame #citations, rows are now the real domains
   the sampled answers cited (lib/live/metrics → citedDomains).

   - Type is the live `owned` flag: OWNED (a domain the workspace controls) or
     EARNED (everything else). The frame's editorial / community / reference
     classes are not derivable from the live engine, so they are gone rather
     than guessed.
   - The frame's "Δ 30d" column is gone too: the engine keeps no per-domain
     daily history, so every delta would have been invented.
   - The bar is the row's share scaled against the top row — a drawing of the
     real share beside it, not a separate number. */

const FILTERS = ["All", "Owned", "Earned"] as const;
type Filter = (typeof FILTERS)[number];

const GRID = "1.6fr .8fr .8fr 1.4fr";
const MAX_ROWS = 12;

const OWNED_STYLE = { color: "var(--ac)", border: "1px solid color-mix(in oklab,var(--ac) 40%,transparent)" };
const EARNED_STYLE = { color: "#7fa7d9", border: "1px solid rgba(127,167,217,.35)" };

export default function CitedDomainsCard({ domains, collecting }: { domains: CitedDomain[]; collecting: boolean }) {
  const [filter, setFilter] = useState<Filter>("All");
  const rows = domains.filter((d) => (filter === "All" ? true : filter === "Owned" ? d.owned : !d.owned));
  const top = rows.slice(0, MAX_ROWS);
  const maxShare = rows.reduce((mx, r) => Math.max(mx, r.share), 0) || 1;

  return (
    <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px 12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{fontSize:"14.5px",fontWeight:"600"}}>{"Cited domains"}</div><Hint text="Websites AI quotes when answering" /></div>
        <div style={{display:"flex",gap:"8px",fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums"}}>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              style={
                filter === f
                  ? {color:"#fff",background:"var(--ac)",borderRadius:"5px",padding:"4px 9px",fontWeight:600,border:"none",fontSize:"11px",fontVariantNumeric:"tabular-nums",fontFamily:"inherit",cursor:"pointer"}
                  : {color:"var(--mut)",background:"transparent",border:"1px solid var(--brd)",borderRadius:"5px",padding:"4px 9px",fontWeight:400,fontSize:"11px",fontVariantNumeric:"tabular-nums",fontFamily:"inherit",cursor:"pointer"}
              }
            >
              {f}
            </button>
          ))}
          <Link href="/app/citations/watched" style={{fontSize:"11.5px",fontWeight:"500",padding:"4px 4px 4px 8px"}}>{"Watched URLs →"}</Link>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:GRID,padding:"8px 20px",fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",letterSpacing:".12em",textTransform:"uppercase",color:"var(--fnt)",borderBottom:"1px solid var(--brd)"}}><span>{"Domain"}</span><span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Type"}<Hint text="Your site, or someone else's" size={12} /></span><span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Citations"}<Hint text="Times AI quoted this website" size={12} /></span><span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Share"}<Hint text="Share of all sampled citations" size={12} align="right" /></span></div>
      {top.length === 0 ? (
        <CardEmpty
          line={collecting ? "No citations collected yet." : filter === "All" ? "No answers in the sample carried a parseable citation." : `No ${filter.toLowerCase()} domains in the sample.`}
          note={collecting ? "Domains appear here as soon as the first sampled answers quote a source." : undefined}
        />
      ) : (
        top.map((r, i) => (
          <div
            key={r.domain}
            className="row-hover"
            style={{display:"grid",gridTemplateColumns:GRID,alignItems:"center",padding:"11px 20px",fontSize:"13px",...(i > 0 ? {borderTop:"1px solid var(--brd)"} : {})}}
          >
            <span style={{fontSize:"12.5px",fontWeight:"400",fontVariantNumeric:"tabular-nums"}}>{r.domain}</span>
            <span><span style={{fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",...(r.owned ? OWNED_STYLE : EARNED_STYLE),borderRadius:"4px",padding:"2px 6px"}}>{r.owned ? "OWNED" : "EARNED"}</span></span>
            <span style={{fontSize:"12.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{fmtInt(r.count)}</span>
            <span style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{width:"110px",height:"4px",background:"var(--bg2)",borderRadius:"2px",display:"inline-block"}}><span style={{display:"block",width:`${Math.max(2, Math.round((r.share / maxShare) * 100))}%`,height:"4px",background:"var(--ac)",borderRadius:"2px"}} /></span>
              <span style={{fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{`${r.share}%`}</span>
            </span>
          </div>
        ))
      )}
      {rows.length > MAX_ROWS && (
        <div style={{padding:"9px 20px",borderTop:"1px solid var(--brd)",fontSize:"11.5px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>
          {`Showing the top ${MAX_ROWS} of ${fmtInt(rows.length)} cited domains — the full list is in the CSV export.`}
        </div>
      )}
    </div>
  );
}
