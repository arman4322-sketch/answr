import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import KpiCard from "@/components/app/KpiCard";
import Hint from "@/components/ui/Hint";
import ReportCsvButton from "@/components/ui/ReportCsvButton";
import ToastButton from "../ToastButton";
import ChecklistStep from "./ChecklistStep";
import { action92Spec } from "../reports";

/* P2 — Action detail — converted from canvas frame #p2-action-detail.
   Route is /app/actions/92 (the frame depicts the score-92 comparison-page action; content verbatim from the frame; the
   GPTBot→AI-crawlers copy fix does not occur in this frame.
   Wiring pass: the "Current performance" block is a <KpiCard metricId="share_of_voice">
   (the frame's own caption says "share of voice, topic scope", and 28.6 matches SoV);
   the 28.6→31.4 progress bar is kept as the card's `children`, and the caption moves
   into `sub`.
   Activation pass: Prev/Next → "only action detail in the demo" toast; Mark in
   progress / Done / Dismiss → status toast (playbook 4); "View all 41 →" →
   fixture-rows toast (playbook 8); open implementation steps → real local
   checklist toggles (ChecklistStep; step 1 stays static — it shipped with
   fixture metadata).
   Export pass: a quiet "Export brief" pill (same treatment as Agent Analytics)
   downloads this action as a standalone brief — see ../reports.ts. */

export const metadata: Metadata = {
  title: "Action #92 — comparison page",
};

/* Quiet export pill — matches the Prev/Next controls beside it. */
const EXPORT_PILL: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--mut)",
  background: "rgba(255,255,255,0.045)",
  borderRadius: "7px",
  padding: "6px 12px",
  border: "none",
  fontFamily: "inherit",
  cursor: "pointer",
};

export default function ActionDetailPage() {
  return (
    <div className="frame-p2-action-detail" style={{flex:"1",display:"flex",flexDirection:"column"}}>
      <Topbar
        crumb={["Actions", "Comparison page"]}
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
        extra={
          <>
            <span style={{fontSize:"12px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"1 of 24 open"}</span>
            <ToastButton message="This is the only action detail in the demo." style={{fontSize:"12px",fontWeight:500,color:"var(--mut)",background:"rgba(255,255,255,0.045)",borderRadius:"7px",padding:"6px 12px",border:"none",fontFamily:"inherit",cursor:"pointer"}}>{"‹ Prev"}</ToastButton>
            <ToastButton message="This is the only action detail in the demo." style={{fontSize:"12px",fontWeight:500,color:"var(--mut)",background:"rgba(255,255,255,0.045)",borderRadius:"7px",padding:"6px 12px",border:"none",fontFamily:"inherit",cursor:"pointer"}}>{"Next ›"}</ToastButton>
            <ReportCsvButton filename="nike-action-92-brief.csv" report={action92Spec} style={EXPORT_PILL}>
              {"Export brief"}
            </ReportCsvButton>
          </>
        }
      />
      <div style={{flex:"1",display:"flex"}}>
        <div style={{flex:"1",padding:"28px 32px",display:"flex",flexDirection:"column",gap:"22px",minWidth:"0"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <div style={{width:"40px",height:"40px",flex:"none",borderRadius:"9px",background:"rgba(142,124,242,0.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:"600",color:"var(--ac)",fontVariantNumeric:"tabular-nums"}}>{"92"}</div>
              <div style={{fontSize:"20px",fontWeight:"600",letterSpacing:"-0.01em"}}>{"Publish a \"Nike vs Adidas\" running-shoe comparison page"}</div>
            </div>
            <div style={{display:"flex",gap:"8px",marginTop:"12px"}}>
              <span style={{fontSize:"10px",fontWeight:"600",color:"#7fa7d9",border:"1px solid rgba(127,167,217,.35)",borderRadius:"4px",padding:"2px 7px"}}>{"CONTENT"}</span>
              <span style={{fontSize:"10px",fontWeight:"600",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"4px",padding:"2px 7px"}}>{"TOPIC: RUNNING SHOES"}</span>
              <span style={{fontSize:"10px",fontWeight:"600",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"4px",padding:"2px 7px"}}>{"EFFORT M"}</span>
              <Hint text="Work needed: small, medium or large" size={12} />
            </div>
          </div>
          <div>
            <div style={{fontSize:"13.5px",fontWeight:"600"}}>{"Why this matters"}</div>
            <div style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.7",marginTop:"8px",maxWidth:"640px"}}>{"ChatGPT cites comparison pages 3× more often than category pages for commercial prompts. Adidas's own comparison page currently appears in 31 answers where Nike is absent — for prompts you already rank #1 on elsewhere. A neutral, well-structured comparison page redirects those citations."}</div>
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{fontSize:"13.5px",fontWeight:"600"}}>{"Implementation"}</div><Hint text="Steps to finish this fix" /></div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"10px",maxWidth:"640px"}}>
              <div style={{display:"flex",gap:"11px",alignItems:"flex-start",padding:"12px 14px",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"9px"}}>
                <div style={{width:"16px",height:"16px",flex:"none",borderRadius:"4px",background:"var(--ac)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"10px",fontWeight:"700",marginTop:"1px"}}>{"✓"}</div>
                <div>
                  <div style={{fontSize:"13px",fontWeight:"500",textDecoration:"line-through",textDecorationColor:"var(--fnt)",color:"var(--mut)"}}>{"Outline from the 41 affected prompts — mirror the questions AI actually answers"}</div>
                  <div style={{fontSize:"11px",color:"var(--fnt)",marginTop:"3px",fontVariantNumeric:"tabular-nums"}}>{"done Aug 1 · Dana"}</div>
                </div>
              </div>
              <ChecklistStep label="Draft with a criteria table and FAQ schema; keep brand tone neutral — cited pages skew factual" />
              <ChecklistStep label="Publish under /compare, submit to index, add to Watched URLs" />
            </div>
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{fontSize:"13.5px",fontWeight:"600"}}>{"References"}</div><Hint text="Pages AI already quotes for this" /></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginTop:"10px"}}>
              <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"9px",padding:"13px 15px"}}>
                <div style={{fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"adidas.com/compare"}</div>
                <div style={{fontSize:"12.5px",fontWeight:"500",marginTop:"5px",lineHeight:"1.4"}}>{"The page winning your prompts"}</div>
                <div style={{fontSize:"11px",color:"var(--mut)",marginTop:"5px",fontVariantNumeric:"tabular-nums"}}>{"cited in 31 answers · 30d"}</div>
              </div>
              <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"9px",padding:"13px 15px"}}>
                <div style={{fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"runnersworld.com/compare/…"}</div>
                <div style={{fontSize:"12.5px",fontWeight:"500",marginTop:"5px",lineHeight:"1.4"}}>{"Comparison grid AI leans on"}</div>
                <div style={{fontSize:"11px",color:"var(--mut)",marginTop:"5px",fontVariantNumeric:"tabular-nums"}}>{"cited in 22 answers · 30d"}</div>
              </div>
              <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"9px",padding:"13px 15px"}}>
                <div style={{fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"reddit.com/r/running/…"}</div>
                <div style={{fontSize:"12.5px",fontWeight:"500",marginTop:"5px",lineHeight:"1.4"}}>{"Thread framing the comparison"}</div>
                <div style={{fontSize:"11px",color:"var(--mut)",marginTop:"5px",fontVariantNumeric:"tabular-nums"}}>{"cited in 12 answers · 30d"}</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{width:"340px",flex:"none",borderLeft:"1px solid var(--brd)",background:"var(--bg1)",padding:"24px",display:"flex",flexDirection:"column",gap:"18px"}}>
          <KpiCard
            label="Current performance"
            value="28.6%"
            metricId="share_of_voice"
            delta="→ 31.4%"
            sub="share of voice, topic scope · projected +2.8pt"
          >
            <div style={{width:"90px",height:"6px",background:"var(--bg2)",borderRadius:"3px",position:"relative",flex:"none",marginBottom:"7px"}}>
              <div style={{width:"57%",height:"6px",background:"var(--ac)",borderRadius:"3px"}} />
              <div style={{position:"absolute",left:"63%",top:"-2px",width:"2px",height:"10px",background:"var(--ac)",opacity:".5"}} />
            </div>
          </KpiCard>
          <div style={{borderTop:"1px solid var(--brd)",paddingTop:"16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11.5px",fontWeight:"500",color:"var(--mut)"}}>{"Affected prompts · 41"}<Hint text="Questions this fix could change" /></div>
            <div style={{display:"flex",flexDirection:"column",gap:"6px",marginTop:"10px",fontSize:"12px",color:"var(--mut)"}}>
              <div style={{padding:"8px 10px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"6px",lineHeight:"1.4"}}>{"best running shoes for marathon training"}</div>
              <div style={{padding:"8px 10px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"6px",lineHeight:"1.4"}}>{"Nike vs Adidas running shoes"}</div>
              <div style={{padding:"8px 10px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"6px",lineHeight:"1.4"}}>{"compare Nike and Adidas for marathon training"}</div>
              <ToastButton message="The demo ships the first page of fixture rows — full history lives on live workspaces." style={{fontSize:"11.5px",color:"var(--ac)",fontWeight:500,padding:"2px 0 0",background:"none",border:"none",fontFamily:"inherit",cursor:"pointer",textAlign:"left"}}>{"View all 41 →"}</ToastButton>
            </div>
          </div>
          <div style={{borderTop:"1px solid var(--brd)",paddingTop:"16px",display:"flex",flexDirection:"column",gap:"8px",fontSize:"12.5px"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:"6px",color:"var(--fnt)"}}>{"Status"}<Hint text="Waiting, started, or already shipped" /></span>
              <span style={{fontSize:"10.5px",fontWeight:"600",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"5px",padding:"3px 8px"}}>{"OPEN"}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{color:"var(--fnt)"}}>{"Assignee"}</span>
              <span style={{fontWeight:"500"}}>{"Dana Okafor"}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{color:"var(--fnt)"}}>{"Created"}</span>
              <span style={{fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"Jul 28 · auto"}</span>
            </div>
          </div>
          <div style={{marginTop:"auto",display:"flex",flexDirection:"column",gap:"8px"}}>
            <ToastButton message="Action statuses update on live workspaces." className="btn-ac" style={{textAlign:"center",fontSize:"13px",fontWeight:500,borderRadius:"7px",padding:"10px 0",border:"none",fontFamily:"inherit",cursor:"pointer"}}>{"Mark in progress"}</ToastButton>
            <div style={{display:"flex",gap:"8px"}}>
              <ToastButton message="Action statuses update on live workspaces." style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:500,border:"1px solid var(--brd)",borderRadius:"7px",padding:"9px 0",background:"none",color:"var(--tx)",fontFamily:"inherit",cursor:"pointer"}}>{"Done"}</ToastButton>
              <ToastButton message="Action statuses update on live workspaces." style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:500,color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"7px",padding:"9px 0",background:"none",fontFamily:"inherit",cursor:"pointer"}}>{"Dismiss"}</ToastButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
