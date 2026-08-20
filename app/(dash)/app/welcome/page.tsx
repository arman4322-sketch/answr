import Link from "next/link";
import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import KpiCard from "@/components/app/KpiCard";
import Hint from "@/components/ui/Hint";
import RunNowButton from "./RunNowButton";

export const metadata: Metadata = { title: "Welcome" };

/* Overview — day zero — converted from canvas frame #m-empty.
   Audit fix: the day-zero screen lives INSIDE the app shell (sidebar comes from the
   layout); the 900px card is centered in the content column under a minimal topbar. */
export default function Page() {
  return (
    <div className="frame-m-empty">
      <Topbar crumb="Overview" showDateRange={false} showPlatforms={false} exportLabel={null} />
      <div style={{padding:"22px 24px",display:"flex",justifyContent:"center"}}>
        <div style={{width:"900px",maxWidth:"100%",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"22px",display:"flex",flexDirection:"column",gap:"14px",minHeight:"560px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px"}}>
            <KpiCard label="Visibility score" value="—" metricId="visibility_score" valueColor="var(--fnt)" />
            <KpiCard label="Share of voice" value="—" metricId="share_of_voice" valueColor="var(--fnt)" />
            <KpiCard label="Citations" value="—" metricId="citations_count" valueColor="var(--fnt)" />
            <KpiCard label="Avg. position" value="—" metricId="avg_answer_position" valueColor="var(--fnt)" />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:"12px",flex:"1"}}>
            <div style={{border:"1px dashed var(--brd)",borderRadius:"10px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"10px",textAlign:"center",padding:"32px"}}><div style={{width:"40px",height:"40px",borderRadius:"10px",background:"rgba(142,124,242,0.14)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--ac)",fontSize:"17px",fontWeight:"700"}}>{"⏱"}</div><div style={{fontSize:"15px",fontWeight:"600"}}>{"Your first prompt run starts tonight"}</div><div style={{fontSize:"12.5px",color:"var(--mut)",maxWidth:"380px",lineHeight:"1.6"}}>{"412 prompts across 5 platforms, then daily. First results land within 24 hours — we'll email you."}</div><RunNowButton /></div>
            <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"12.5px",fontWeight:"600"}}>{"While you wait"}<Hint text="Setup steps you can finish now" /></div>
              <div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"12px",fontSize:"12.5px"}}>
                <div style={{display:"flex",gap:"9px",alignItems:"center",padding:"9px 11px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px"}}><span style={{width:"14px",height:"14px",borderRadius:"4px",background:"var(--ac)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"9px",fontWeight:"700"}}>{"✓"}</span>{"Brand & competitors set"}</div>
                <Link href="/app/settings" style={{display:"flex",gap:"9px",alignItems:"center",padding:"9px 11px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",color:"var(--mut)"}}><span style={{width:"14px",height:"14px",borderRadius:"4px",border:"1px solid var(--brd)"}} />{"Connect your website "}<span style={{marginLeft:"auto",color:"var(--ac)"}}>{"→"}</span></Link>
                <Link href="/app/settings" style={{display:"flex",gap:"9px",alignItems:"center",padding:"9px 11px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",color:"var(--mut)"}}><span style={{width:"14px",height:"14px",borderRadius:"4px",border:"1px solid var(--brd)"}} />{"Invite your team "}<span style={{marginLeft:"auto",color:"var(--ac)"}}>{"→"}</span></Link>
                <Link href="/app/prompts" style={{display:"flex",gap:"9px",alignItems:"center",padding:"9px 11px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",color:"var(--mut)"}}><span style={{width:"14px",height:"14px",borderRadius:"4px",border:"1px solid var(--brd)"}} />{"Review generated prompts "}<span style={{marginLeft:"auto",color:"var(--ac)"}}>{"→"}</span></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
