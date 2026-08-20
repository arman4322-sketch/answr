import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import RegionMap from "@/components/app/RegionMap";
import Hint from "@/components/ui/Hint";
import InsightsTabs from "../InsightsTabs";
import RangeTrend from "../RangeTrend";
import ByRegionTable from "./ByRegionTable";
import { regionsSpec } from "../reports";
import { regionsSeries } from "@/lib/data/insights";

export const metadata: Metadata = { title: "Regions · Answer Engine Insights" };

/* Answer Engine Insights — Regions — converted from canvas frame #p2-regions.
   The frame's embedded region-map.html iframe is replaced by the real
   <RegionMap /> client component (d3-geo + topojson-client + world-atlas).

   Wired: the "Regional visibility" card's painted SVG — which pinned a tooltip
   at Jul 26 and drew its crosshair and endpoint dots by hand — is now
   <RangeTrend> over regionsSeries (lib/data/insights.ts), so the crosshair,
   dots and tooltip are live on every one of the 30 points and the x axis reads
   the canonical Jul 7 · Jul 14 · Jul 21 · Jul 28 · Aug 5 (the frame's stale
   Jul 5 – Aug 2 row is gone). The card keeps its own legend, so the chart draws
   none. The series honor the screen's own numbers: Jul 26 still reads 35.3 /
   29.8 / 22.4, each line ends on its "By region" visibility (41.2 / 33.8 /
   27.4) and starts far enough back that the table's Δ 30d is true.

   Topbar Export downloads the executive report (../reports.ts): strongest /
   fastest-rising / weakest region with plain-English reads, the full dated
   trend for the three charted regions, the region-rank and by-region tables,
   and the translation-gap finding. */
export default function Page() {
  return (
    <div className="frame-p2-regions">
      <Topbar crumb={["Answer Engine Insights", "Regions"]} rangeLive platformNote="Regional visibility is scored across all platforms here — the platform filter re-slices Overview." exportFilename="nike-insights-regions-30d.csv" exportReport={regionsSpec} />
      <InsightsTabs />
      <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:"16px"}}><div style={{display:"grid",gridTemplateColumns:"1fr 372px",gap:"14px"}}><div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"17px 19px"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13.5px",fontWeight:"600"}}>{"Regional visibility"}<Hint text="Your visibility in one country or region" /></div><div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"3px"}}>{"% of answers mentioning Nike, by answer locale · 8 regions, 5 languages tracked"}</div></div><div style={{display:"flex",gap:"14px",fontSize:"11.5px",color:"var(--mut)"}}><div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{width:"8px",height:"2px",borderRadius:"1px",background:"var(--ac)"}} />{"United States"}</div><div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{width:"8px",height:"2px",borderRadius:"1px",background:"#7fa7d9"}} />{"United Kingdom"}</div><div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{width:"8px",height:"2px",borderRadius:"1px",background:"#d9b679"}} />{"DACH"}</div></div></div><RangeTrend series={regionsSeries} seed="insights:regions" yLabels={["45%", "35%", "25%", "15%"]} yDomain={[15, 45]} width={700} height={200} marginTop="14px" /></div><div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"17px 19px"}}><div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13.5px",fontWeight:"600"}}>{"Region rank"}<Hint text="Countries where you show up most" align="right" /></div><div style={{display:"flex",flexDirection:"column",marginTop:"8px"}}><div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 0",borderBottom:"1px solid var(--brd)",fontSize:"13px"}}><span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums",width:"16px"}}>{"1"}</span><span>{"United States"}</span><span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"41.2%"}</span><span style={{fontSize:"11.5px",fontWeight:"500",color:"#4cb782"}}>{"↑ 2.4"}</span></div><div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 0",borderBottom:"1px solid var(--brd)",fontSize:"13px"}}><span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums",width:"16px"}}>{"2"}</span><span>{"United Kingdom"}</span><span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"33.8%"}</span><span style={{fontSize:"11.5px",fontWeight:"500",color:"#4cb782"}}>{"↑ 1.6"}</span></div><div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 0",borderBottom:"1px solid var(--brd)",fontSize:"13px"}}><span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums",width:"16px"}}>{"3"}</span><span>{"DACH"}</span><span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"27.4%"}</span><span style={{fontSize:"11.5px",fontWeight:"500",color:"#4cb782"}}>{"↑ 3.9"}</span></div><div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 0",borderBottom:"1px solid var(--brd)",fontSize:"13px"}}><span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums",width:"16px"}}>{"4"}</span><span>{"France"}</span><span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"22.1%"}</span><span style={{fontSize:"11.5px",fontWeight:"500",color:"#e5636e"}}>{"↓ 0.8"}</span></div><div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 0",borderBottom:"1px solid var(--brd)",fontSize:"13px"}}><span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums",width:"16px"}}>{"5"}</span><span>{"Brazil"}</span><span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"12.2%"}</span><span style={{fontSize:"11.5px",fontWeight:"500",color:"#4cb782"}}>{"↑ 1.1"}</span></div><div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 0",fontSize:"13px"}}><span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums",width:"16px"}}>{"6"}</span><span>{"Japan"}</span><span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"9.8%"}</span><span style={{fontSize:"11.5px",fontWeight:"500",color:"var(--fnt)"}}>{"—"}</span></div></div></div></div><div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",overflow:"hidden"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"15px 19px 11px"}}><span style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"13.5px",fontWeight:"600"}}>{"World view"}<Hint text="Darker means AI names you more" /></span><span style={{fontSize:"10px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"VISIBILITY BY ANSWER LOCALE · 8 REGIONS TRACKED"}</span></div><RegionMap height={400} /></div><ByRegionTable /><div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"14px 19px",display:"flex",gap:"10px",alignItems:"flex-start"}}><div style={{width:"5px",height:"5px",borderRadius:"50%",background:"var(--ac)",marginTop:"6px",flex:"none"}} /><div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.6"}}><span style={{color:"var(--tx)",fontWeight:"500"}}>{"Translation gap:"}</span>{" German answers cite help.nike.com 4× less than English answers — DACH visibility is rising on earned sources only. Localizing the top 12 product pages is projected at "}<span style={{color:"#4cb782",fontWeight:"500"}}>{"+4.2pt"}</span>{" regional visibility."}</div></div></div>
    </div>
  );
}
