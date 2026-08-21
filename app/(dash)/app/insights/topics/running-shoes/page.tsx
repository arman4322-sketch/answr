import Link from "next/link";
import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import ExportButton from "@/components/ui/ExportButton";
import Hint from "@/components/ui/Hint";
import InsightsTabs from "../../InsightsTabs";
import RangeTrend from "../../RangeTrend";
import RangeStat from "../../RangeStat";
import RangeValue from "../../RangeValue";
import { topicRunningShoesSeries } from "@/lib/data/insights";
import { runningShoesSpec } from "../../reports";

export const metadata: Metadata = { title: "Running shoes · Answer Engine Insights" };

/* Export (topbar + in-page button) — both controls download the same executive
   report (../../reports.ts): the 42.6% topic-visibility headline with its
   +6.2pt delta, the daily trend as a dated table, the topic-scoped brand rank
   and the per-prompt table. */
const EXPORT_FILENAME = "nike-topic-running-shoes-30d.csv";

/* Topic detail — Running shoes — converted from canvas frame #m-topic.
   Wired (W2): topic-visibility trend → TrendChart (ends 42.6 = the AEI topics
   table's Running shoes row, start 36.4 so "↑ 6.2" is true; data:
   lib/data/insights.ts); prompt-table rows get row-hover. No standalone KPI
   stat cards exist on the frame (the 42.6% headline lives in the chart-card
   header), so KpiCard(topic_visibility) is not used. */
export default function Page() {
  return (
    <div className="frame-m-topic">
      <Topbar
        crumb={["Answer Engine Insights", "Topics"]}
        rangeLive
        platformNote="This topic is scored across all platforms here — the platform filter re-slices Overview."
        exportFilename={EXPORT_FILENAME}
        exportReport={runningShoesSpec}
      />
      <InsightsTabs />
      <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:"14px"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{fontSize:"11.5px",color:"var(--fnt)"}}><Link href="/app/insights" style={{color:"var(--fnt)"}}>{"Answer Engine Insights / Topics"}</Link>{" / "}<span style={{color:"var(--tx)"}}>{"Running shoes"}</span></div><div style={{fontSize:"16px",fontWeight:"600",marginTop:"5px"}}>{"Running shoes "}<span style={{fontSize:"11px",color:"var(--fnt)",fontWeight:"400",fontVariantNumeric:"tabular-nums",marginLeft:"6px"}}>{"132 prompts"}</span></div></div><ExportButton label="Export" filename={EXPORT_FILENAME} report={runningShoesSpec} /></div><div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:"12px"}}><div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"15px 17px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}><span style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"12.5px",fontWeight:"600"}}>{"Topic visibility"}<Hint text="Your visibility for one subject area" /></span><RangeStat series={topicRunningShoesSeries} seed="insights:topic-running-shoes" metricId="topic_visibility" variant="inline" valueFontSize="19px" deltaFontSize="11px" /></div><RangeTrend series={topicRunningShoesSeries} seed="insights:topic-running-shoes" yLabels={["50%", "35%", "20%"]} yDomain={[20, 50]} width={600} height={110} marginTop="10px" showXAxis={false} /><div style={{fontSize:"11.5px",color:"var(--mut)",marginTop:"10px",lineHeight:"1.5"}}>{"Competitor set is topic-scoped — specialist running brands appear here but not in the workspace set."}</div></div><div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"15px 17px"}}><div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"12.5px",fontWeight:"600"}}>{"Rank in topic"}<Hint text="Who AI names most in this subject" align="right" /></div><div style={{display:"flex",flexDirection:"column",marginTop:"6px",fontSize:"12.5px"}}><div style={{display:"flex",gap:"9px",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--brd)"}}><span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"1"}</span><span style={{fontWeight:"600"}}>{"Nike"}</span><span style={{fontSize:"10px",fontWeight:"600",color:"#b3a7f8",background:"rgba(142,124,242,0.16)",borderRadius:"4px",padding:"1px 6px"}}>{"You"}</span><span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}><RangeValue series={topicRunningShoesSeries} seed="insights:topic-running-shoes" /></span></div><div style={{display:"flex",gap:"9px",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--brd)",color:"var(--mut)"}}><span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"2"}</span><span>{"Adidas"}</span><span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"28.4%"}</span></div><div style={{display:"flex",gap:"9px",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--brd)",color:"var(--mut)"}}><span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"3"}</span><span>{"Brooks Running"}</span><span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"14.1%"}</span></div><div style={{display:"flex",gap:"9px",alignItems:"center",padding:"8px 0",color:"var(--mut)"}}><span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"4"}</span><span>{"Asics"}</span><span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"11.9%"}</span></div></div></div></div><div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",overflow:"hidden"}}><div style={{display:"grid",gridTemplateColumns:"2.4fr .8fr .8fr .7fr",padding:"8px 16px",fontSize:"10.5px",fontWeight:"500",color:"var(--fnt)",borderBottom:"1px solid var(--brd)"}}><span>{"Prompt"}</span><span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Visibility"}<Hint text="How often AI mentions you here" size={12} /></span><span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Position"}<Hint text="How early AI names you in answers" size={12} /></span><span>{"Δ 30d"}</span></div><div className="row-hover" style={{display:"grid",gridTemplateColumns:"2.4fr .8fr .8fr .7fr",padding:"9px 16px",fontSize:"12.5px",alignItems:"center"}}><span>{"best running shoes for marathon training"}</span><span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"78%"}</span><span style={{fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"1.4"}</span><span style={{fontSize:"11.5px",color:"#4cb782"}}>{"↑ 6"}</span></div><div className="row-hover" style={{display:"grid",gridTemplateColumns:"2.4fr .8fr .8fr .7fr",padding:"9px 16px",fontSize:"12.5px",alignItems:"center",borderTop:"1px solid var(--brd)",color:"var(--mut)"}}><span>{"how long do running shoes actually last"}</span><span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"52%"}</span><span style={{fontVariantNumeric:"tabular-nums"}}>{"2.3"}</span><span style={{fontSize:"11.5px",color:"#4cb782"}}>{"↑ 3"}</span></div><div className="row-hover" style={{display:"grid",gridTemplateColumns:"2.4fr .8fr .8fr .7fr",padding:"9px 16px",fontSize:"12.5px",alignItems:"center",borderTop:"1px solid var(--brd)",color:"var(--mut)"}}><span>{"running shoes that work for wide feet"}</span><span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"61%"}</span><span style={{fontVariantNumeric:"tabular-nums"}}>{"1.8"}</span><span style={{fontSize:"11.5px",color:"#e5636e"}}>{"↓ 1"}</span></div><Link href="/app/prompts" style={{display:"block",padding:"9px 16px",borderTop:"1px solid var(--brd)",fontSize:"11.5px",color:"var(--ac)",fontWeight:"500"}}>{"All 132 prompts →"}</Link></div></div>
    </div>
  );
}
