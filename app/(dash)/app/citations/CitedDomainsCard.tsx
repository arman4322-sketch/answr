"use client";

import Link from "next/link";
import { useState } from "react";
import Hint from "@/components/ui/Hint";
import { useFilters } from "@/lib/filters/context";
import { fmtDelta, fmtInt } from "@/lib/filters/windows";
import { citationWindow } from "./citationWindow";

/* Cited domains card — markup verbatim from frame #citations, with the
   All / Owned / Earned chips made into real filters over the fixture rows
   (Owned = OWNED type, Earned = everything else). */

type DomainType = "OWNED" | "EDITORIAL" | "COMMUNITY" | "REFERENCE";

const TYPE_STYLE: Record<DomainType, { color: string; border: string }> = {
  OWNED: { color: "var(--ac)", border: "1px solid color-mix(in oklab,var(--ac) 40%,transparent)" },
  EDITORIAL: { color: "#7fa7d9", border: "1px solid rgba(127,167,217,.35)" },
  COMMUNITY: { color: "#b98ed9", border: "1px solid rgba(185,142,217,.35)" },
  REFERENCE: { color: "#d9b679", border: "1px solid rgba(217,182,121,.35)" },
};

const ROWS: {
  domain: string;
  type: DomainType;
  /** citations over the shipped 30-day window; other windows scale by volume */
  citations30d: number;
  bar: string;
  /** share of all citations — the constant the fixture actually states */
  share: string;
  /** change over the shipped window; null where the fixture prints "—" */
  delta30d: number | null;
}[] = [
  { domain: "runnersworld.com", type: "EDITORIAL", citations30d: 248, bar: "78%", share: "19.3%", delta30d: 41 },
  { domain: "nike.com/running", type: "OWNED", citations30d: 201, bar: "63%", share: "15.7%", delta30d: 38 },
  { domain: "reddit.com", type: "COMMUNITY", citations30d: 164, bar: "52%", share: "12.8%", delta30d: 67 },
  { domain: "help.nike.com", type: "OWNED", citations30d: 122, bar: "38%", share: "9.5%", delta30d: 19 },
  { domain: "wirecutter.com", type: "EDITORIAL", citations30d: 97, bar: "30%", share: "7.6%", delta30d: -8 },
  { domain: "letsrun.com", type: "COMMUNITY", citations30d: 88, bar: "27%", share: "6.9%", delta30d: 24 },
  { domain: "wikipedia.org", type: "REFERENCE", citations30d: 61, bar: "19%", share: "4.8%", delta30d: null },
];

const FILTERS = ["All", "Owned", "Earned"] as const;
type Filter = (typeof FILTERS)[number];

export default function CitedDomainsCard() {
  const [filter, setFilter] = useState<Filter>("All");
  const { window } = useFilters();
  /* counts and deltas are window measures — shares are not (see citationWindow.ts) */
  const { scale, deltaScale } = citationWindow(window.days);
  const rows = ROWS.filter((r) =>
    filter === "All" ? true : filter === "Owned" ? r.type === "OWNED" : r.type !== "OWNED"
  );
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
      <div style={{display:"grid",gridTemplateColumns:"1.5fr .8fr .8fr 1.2fr .8fr",padding:"8px 20px",fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",letterSpacing:".12em",textTransform:"uppercase",color:"var(--fnt)",borderBottom:"1px solid var(--brd)"}}><span>{"Domain"}</span><span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Type"}<Hint text="Your site, press, forum or encyclopedia" size={12} /></span><span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Citations"}<Hint text="Times AI quoted this website" size={12} /></span><span>{"Share"}</span><span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{`Δ ${window.short}`}<Hint text="Change since the previous window" size={12} align="right" /></span></div>
      {rows.map((r, i) => (
        <div
          key={r.domain}
          className="row-hover"
          style={{display:"grid",gridTemplateColumns:"1.5fr .8fr .8fr 1.2fr .8fr",alignItems:"center",padding:"11px 20px",fontSize:"13px",...(i > 0 ? {borderTop:"1px solid var(--brd)"} : {})}}
        >
          <span style={{fontSize:"12.5px",fontWeight:"400",fontVariantNumeric:"tabular-nums"}}>{r.domain}</span>
          <span><span style={{fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:TYPE_STYLE[r.type].color,border:TYPE_STYLE[r.type].border,borderRadius:"4px",padding:"2px 6px"}}>{r.type}</span></span>
          <span style={{fontSize:"12.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{fmtInt(r.citations30d * scale)}</span>
          <span style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <span style={{width:"110px",height:"4px",background:"var(--bg2)",borderRadius:"2px",display:"inline-block"}}><span style={{display:"block",width:r.bar,height:"4px",background:"var(--ac)",borderRadius:"2px"}} /></span>
            <span style={{fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{r.share}</span>
          </span>
          <span
            style={{
              fontSize:"12px",
              fontWeight:"500",
              fontVariantNumeric:"tabular-nums",
              color: r.delta30d === null ? "var(--mut)" : r.delta30d >= 0 ? "#4cb782" : "#e5636e",
            }}
          >
            {r.delta30d === null ? "—" : fmtDelta(r.delta30d * deltaScale, 0)}
          </span>
        </div>
      ))}
    </div>
  );
}
