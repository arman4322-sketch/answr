"use client";

import Link from "next/link";
import Hint from "@/components/ui/Hint";
import { useFilters } from "@/lib/filters/context";
import { countStat, extendCount, fmtInt } from "@/lib/filters/windows";
import { CITATIONS_PREV_TOTAL, CITATIONS_TOTAL, citationsDaily } from "@/lib/data/evidence";
import { topCitedSources } from "@/lib/data/overview";

/* "Top cited sources" — counts are window measures, so they move with the
   citations KPI above them. Per-domain daily history is not in the fixture;
   what the card really shows is each domain's share of citations, so the count
   scales with the window's own citation volume. At 30 days it prints the
   shipped 248 / 201 / 164 / 97 / 61. Bar widths are the frame's (share is what
   they encode, and share is what is held constant). */

export default function TopSourcesCard() {
  const { window } = useFilters();
  const citations = countStat(
    extendCount(citationsDaily, "citations:daily", { prevSum: CITATIONS_PREV_TOTAL }),
    window.days
  );
  const scale = citations.value / CITATIONS_TOTAL;

  return (
    <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"17px 19px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
          <div style={{fontSize:"13px",fontWeight:"600"}}>{"Top cited sources"}</div>
          <Hint text="Websites AI quotes most for these questions" />
        </div>
        <Link href="/app/citations" style={{fontSize:"11.5px",fontWeight:"500",color:"var(--ac)"}}>{"View all →"}</Link>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"12px",marginTop:"15px"}}>
        {topCitedSources.map((s) => (
          <div className="row-hover" key={s.domain}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"12.5px",marginBottom:"5px"}}>
              <span>{s.domain}</span>
              <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{fmtInt(s.count30d * scale)}</span>
            </div>
            <div style={{height:"3px",background:"var(--bg2)",borderRadius:"2px"}}>
              <div style={{width:s.barWidth,height:"3px",background:"var(--ac)",borderRadius:"2px",opacity:s.opacity === undefined ? undefined : String(s.opacity)}} />
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop:"16px",padding:"11px 13px",border:"1px solid var(--brd)",borderRadius:"8px",background:"var(--bg0)",display:"flex",gap:"9px",alignItems:"flex-start"}}>
        <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"var(--ac)",marginTop:"6px",flex:"none"}} />
        <div style={{fontSize:"12px",color:"var(--mut)",lineHeight:"1.55"}}>
          <span style={{color:"var(--tx)",fontWeight:"500"}}>{"New:"}</span>
          {" reddit.com/r/running thread cited in 12 ChatGPT answers this week."}
        </div>
      </div>
    </div>
  );
}
