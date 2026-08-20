import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import CitationKpis from "./CitationKpis";
import MostCitedPages from "./MostCitedPages";
import Hint from "@/components/ui/Hint";
import ExportModal from "./ExportModal";
import SourceMixDonut from "./SourceMixDonut";
import CitedDomainsCard from "./CitedDomainsCard";

/* Citations — converted from canvas frame #citations. Export control opens the
   answers-export modal (frame #m-export) via the Topbar `extra` slot.
   Wired: KPI row uses the canonical <KpiCard> (provenance popovers where the
   dictionary has a matching metric); the source-mix donut gets its hover layer
   via SourceMixDonut (data in lib/data/evidence.ts). The frame contains no
   citations-over-time trend chart, so there is no TrendChart on this page.
   Live filters (F9): the date range re-slices the KPI row (<CitationKpis>), the
   donut's total and segments, the cited-domains table and the most-cited pages
   — every one of them is a slice of the same citation pile, so they move
   together (see ./citationWindow.ts). At 30 days the screen is unchanged. */

export const metadata: Metadata = {
  title: "Citations",
};

export default function CitationsPage() {
  return (
    <div className="frame-citations" style={{flex:"1",display:"flex",flexDirection:"column"}}>
      <Topbar crumb="Citations" exportLabel={null} extra={<ExportModal />} rangeLive platformNote="Citations are counted across all platforms here — the platform filter re-slices Overview." />
      <div style={{padding:"24px",display:"flex",flexDirection:"column",gap:"20px"}}><CitationKpis /><div style={{display:"grid",gridTemplateColumns:"380px 1fr",gap:"16px"}}><div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"18px 20px"}}><div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{fontSize:"14.5px",fontWeight:"600"}}>{"Source mix"}</div><Hint text="Who AI quotes: you, press, forums" /></div><div style={{display:"flex",alignItems:"center",gap:"24px",marginTop:"18px"}}><SourceMixDonut /><div style={{display:"flex",flexDirection:"column",gap:"11px",fontSize:"12.5px",flex:"1"}}><div style={{display:"flex",alignItems:"center",gap:"8px"}}><span style={{width:"8px",height:"8px",borderRadius:"2px",background:"var(--ac)"}} />{"Owned"}<span style={{marginLeft:"auto",fontSize:"12px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"38%"}</span></div><div style={{display:"flex",alignItems:"center",gap:"8px"}}><span style={{width:"8px",height:"8px",borderRadius:"2px",background:"#7fa7d9"}} />{"Editorial"}<span style={{marginLeft:"auto",fontSize:"12px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"30%"}</span></div><div style={{display:"flex",alignItems:"center",gap:"8px"}}><span style={{width:"8px",height:"8px",borderRadius:"2px",background:"#b98ed9"}} />{"Community"}<span style={{marginLeft:"auto",fontSize:"12px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"20%"}</span></div><div style={{display:"flex",alignItems:"center",gap:"8px"}}><span style={{width:"8px",height:"8px",borderRadius:"2px",background:"#d9b679"}} />{"Reference"}<span style={{marginLeft:"auto",fontSize:"12px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"12%"}</span></div></div></div><div style={{marginTop:"18px",paddingTop:"14px",borderTop:"1px solid var(--brd)",fontSize:"12px",color:"var(--mut)",lineHeight:"1.5"}}>{"Community citations doubled since June — mostly reddit.com and letsrun.com threads comparing running shoes."}</div></div><CitedDomainsCard /></div><MostCitedPages /></div>
    </div>
  );
}
