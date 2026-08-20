import Link from "next/link";
import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import KpiCard from "@/components/app/KpiCard";
import TrendChart from "@/components/app/charts/TrendChart";
import FilterPill from "@/components/ui/FilterPill";
import Hint from "@/components/ui/Hint";
import ReportCsvButton from "@/components/ui/ReportCsvButton";
import ToastButton from "./ToastButton";
import { impactHistory, impactProjection, impactXLabels } from "@/lib/data/optimize";
import { actionsSpec } from "./reports";

/* Actions — converted from canvas frame #actions.
   Audit fixes applied:
   - action #87 title "…allow GPTBot on /help" → "…allow AI crawlers on /help" and body
     "GPTBot was blocked…" → "AI crawlers were blocked…".
   Wiring pass:
   - KPI strip → <KpiCard> grid ("Est. visibility available" carries metricId
     impact_estimate with the frame's accent value color; the three action counts
     carry actions_queue).
   - Impact-model chart → <TrendChart> with two series from lib/data/optimize.ts:
     "Measured" (var(--ac), area, 30 pts ending 34.2) and "Projected" (#b98ed9,
     45 pts — past indices duplicate the measured line so the projection continues
     from today, rising to 43.6 by +90d). The frame's static "Today · Visibility ·
     34.2%" tooltip is superseded by TrendChart's live hover tooltip.
   The staged frame carried the retired 232px sidebar variant — the shared layout's
   canonical 236px Sidebar replaces it.
   The staged actions.css only contained hover rules for the embedded sidebar, which the
   shared layout now owns — nothing left to import.
   Activation pass: "All categories ▾" / "Sort: Impact ▾" → FilterPill (playbook 2,
   option sets from the queue's own categories); "+ New action" → honest-demo toast
   (playbook 3) via the cluster ToastButton. Action cards 87/81/76/64 stay static —
   only #92 has a detail frame and only it carries the card-hover affordance.
   Export pass: the screen had no export control, so it gains the quiet pill
   treatment Agent Analytics already uses (the accent slot belongs to "+ New
   action"). It downloads the executive report in ./reports.ts: queue counts and
   the +9.4pt available with plain-English reads, the measured + projected
   visibility curves as one dated table, the action queue, impact by category
   and the evidence behind each open action. */

export const metadata: Metadata = {
  title: "Actions — Answr",
};

const DEMO_NOTE = "This filter needs a live workspace — the demo ships one fixture set for this list.";

/* Quiet export pill — same treatment as Agent Analytics' "Export 48,231 events". */
const EXPORT_PILL: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--mut)",
  background: "rgba(255,255,255,0.045)",
  borderRadius: "7px",
  padding: "6px 12px",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};

export default function ActionsPage() {
  return (
    <div className="frame-actions">
      <Topbar
        crumb="Actions"
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
        extra={
          <>
            <FilterPill label="All categories" items={["All categories", "Content", "Technical", "Authority"]} note={DEMO_NOTE} />
            <FilterPill label="Sort: Impact" items={["Sort: Impact", "Sort: Effort", "Sort: Prompts affected", "Sort: Newest"]} note={DEMO_NOTE} />
            <ReportCsvButton filename="nike-actions-30d.csv" report={actionsSpec} style={EXPORT_PILL}>
              {"Export queue"}
            </ReportCsvButton>
            <ToastButton
              message="Creating an action needs a live workspace — this demo is read-only."
              className="btn-ac"
              style={{fontSize:"12.5px",fontWeight:500,borderRadius:"7px",padding:"6px 14px",border:"none",cursor:"pointer",fontFamily:"inherit"}}
            >
              {"+ New action"}
            </ToastButton>
          </>
        }
      />
      <div style={{padding:"24px",display:"flex",flexDirection:"column",gap:"20px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px"}}>
          <KpiCard label="Open" value="24" metricId="actions_queue" hint="Fixes nobody has started yet" />
          <KpiCard label="In progress" value="6" metricId="actions_queue" hint="Fixes someone is working on now" />
          <KpiCard label="Shipped · 90d" value="38" metricId="actions_queue" hint="Fixes finished in the last three months" />
          <KpiCard label="Est. visibility available" value="+9.4pt" metricId="impact_estimate" hint="Points you could gain by fixing everything" valueColor="var(--ac)" />
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:"16px",alignItems:"start"}}>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <Link href="/app/actions/92" className="card-hover" style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"16px 18px",display:"flex",gap:"16px",alignItems:"flex-start",color:"var(--tx)"}}>
              <div style={{width:"44px",height:"44px",flex:"none",borderRadius:"9px",background:"color-mix(in oklab,var(--ac) 14%,transparent)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:"600",fontVariantNumeric:"tabular-nums",color:"var(--ac)"}}>{"92"}</div>
              <div style={{flex:"1",minWidth:"0"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{fontSize:"14px",fontWeight:"600"}}>{"Publish a \"Nike vs Adidas\" running-shoe comparison page"}</div>
                  <span style={{fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"#7fa7d9",border:"1px solid rgba(127,167,217,.35)",borderRadius:"4px",padding:"2px 6px"}}>{"CONTENT"}</span>
                </div>
                <div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.55",marginTop:"5px"}}>{"ChatGPT cites comparison pages 3× more often than category pages for commercial prompts. Adidas's own comparison page is cited in 31 answers where Nike is absent."}</div>
                <div style={{display:"flex",gap:"16px",marginTop:"10px",fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>
                  <span>{"Impact "}<span style={{color:"var(--ac)"}}>{"+2.8pt"}</span></span>
                  <span>{"Effort M"}</span>
                  <span>{"Prompts affected 41"}</span>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"8px",alignItems:"flex-end",flex:"none"}}>
                <span style={{fontSize:"10.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"5px",padding:"4px 9px"}}>{"OPEN"}</span>
                <div style={{width:"22px",height:"22px",borderRadius:"50%",background:"var(--bg2)",border:"1px solid var(--brd)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"DO"}</div>
              </div>
            </Link>
            <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"16px 18px",display:"flex",gap:"16px",alignItems:"flex-start"}}>
              <div style={{width:"44px",height:"44px",flex:"none",borderRadius:"9px",background:"color-mix(in oklab,var(--ac) 12%,transparent)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:"600",fontVariantNumeric:"tabular-nums",color:"var(--ac)"}}>{"87"}</div>
              <div style={{flex:"1",minWidth:"0"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{fontSize:"14px",fontWeight:"600"}}>{"Add llms.txt and allow AI crawlers on /help"}</div>
                  <span style={{fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"#d9b679",border:"1px solid rgba(217,182,121,.35)",borderRadius:"4px",padding:"2px 6px"}}>{"TECHNICAL"}</span>
                </div>
                <div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.55",marginTop:"5px"}}>{"AI crawlers were blocked on 214 help-center pages last month. Help citations lag running-guide citations 5:1 despite higher answer relevance."}</div>
                <div style={{display:"flex",gap:"16px",marginTop:"10px",fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>
                  <span>{"Impact "}<span style={{color:"var(--ac)"}}>{"+1.9pt"}</span>{" "}<Hint text="Visibility points this fix should add" size={12} /></span>
                  <span>{"Effort S"}{" "}<Hint text="Work needed: small, medium or large" size={12} /></span>
                  <span>{"Prompts affected 28"}{" "}<Hint text="Questions this fix could change" size={12} /></span>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"8px",alignItems:"flex-end",flex:"none"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><Hint text="Someone is working on this fix now" align="right" size={12} /><span style={{fontSize:"10.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 40%,transparent)",borderRadius:"5px",padding:"4px 9px"}}>{"IN PROGRESS"}</span></span>
                <div style={{width:"22px",height:"22px",borderRadius:"50%",background:"var(--bg2)",border:"1px solid var(--brd)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"MK"}</div>
              </div>
            </div>
            <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"16px 18px",display:"flex",gap:"16px",alignItems:"flex-start"}}>
              <div style={{width:"44px",height:"44px",flex:"none",borderRadius:"9px",background:"color-mix(in oklab,var(--ac) 10%,transparent)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:"600",fontVariantNumeric:"tabular-nums",color:"var(--ac)"}}>{"81"}</div>
              <div style={{flex:"1",minWidth:"0"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{fontSize:"14px",fontWeight:"600"}}>{"Add FAQ + Product schema to shoe product pages"}</div>
                  <span style={{fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"#d9b679",border:"1px solid rgba(217,182,121,.35)",borderRadius:"4px",padding:"2px 6px"}}>{"TECHNICAL"}</span>
                </div>
                <div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.55",marginTop:"5px"}}>{"AI Overviews pulls pricing answers from structured data. Competitors with Product schema win 68% of \"how much does X cost\" prompts."}</div>
                <div style={{display:"flex",gap:"16px",marginTop:"10px",fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>
                  <span>{"Impact "}<span style={{color:"var(--ac)"}}>{"+1.4pt"}</span>{" "}<Hint text="Visibility points this fix should add" size={12} /></span>
                  <span>{"Effort S"}{" "}<Hint text="Work needed: small, medium or large" size={12} /></span>
                  <span>{"Prompts affected 16"}{" "}<Hint text="Questions this fix could change" size={12} /></span>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"8px",alignItems:"flex-end",flex:"none"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><Hint text="Nobody has started this fix yet" align="right" size={12} /><span style={{fontSize:"10.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"5px",padding:"4px 9px"}}>{"OPEN"}</span></span>
                <div style={{width:"22px",height:"22px",borderRadius:"50%",background:"var(--bg2)",border:"1px solid var(--brd)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"—"}</div>
              </div>
            </div>
            <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"16px 18px",display:"flex",gap:"16px",alignItems:"flex-start"}}>
              <div style={{width:"44px",height:"44px",flex:"none",borderRadius:"9px",background:"color-mix(in oklab,var(--ac) 9%,transparent)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:"600",fontVariantNumeric:"tabular-nums",color:"var(--ac)"}}>{"76"}</div>
              <div style={{flex:"1",minWidth:"0"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{fontSize:"14px",fontWeight:"600"}}>{"Pitch Wirecutter's running-shoe roundup"}</div>
                  <span style={{fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"#b98ed9",border:"1px solid rgba(185,142,217,.35)",borderRadius:"4px",padding:"2px 6px"}}>{"AUTHORITY"}</span>
                </div>
                <div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.55",marginTop:"5px"}}>{"wirecutter.com is a top-5 source across all platforms but cites Nike in only 9% of relevant answers. The 2026 roundup refresh is scheduled for September."}</div>
                <div style={{display:"flex",gap:"16px",marginTop:"10px",fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>
                  <span>{"Impact "}<span style={{color:"var(--ac)"}}>{"+1.2pt"}</span>{" "}<Hint text="Visibility points this fix should add" size={12} /></span>
                  <span>{"Effort L"}{" "}<Hint text="Work needed: small, medium or large" size={12} /></span>
                  <span>{"Prompts affected 33"}{" "}<Hint text="Questions this fix could change" size={12} /></span>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"8px",alignItems:"flex-end",flex:"none"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><Hint text="Nobody has started this fix yet" align="right" size={12} /><span style={{fontSize:"10.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"5px",padding:"4px 9px"}}>{"OPEN"}</span></span>
                <div style={{width:"22px",height:"22px",borderRadius:"50%",background:"var(--bg2)",border:"1px solid var(--brd)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"JT"}</div>
              </div>
            </div>
            <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"16px 18px",display:"flex",gap:"16px",alignItems:"flex-start",opacity:".65"}}>
              <div style={{width:"44px",height:"44px",flex:"none",borderRadius:"9px",background:"var(--bg2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:"600",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"64"}</div>
              <div style={{flex:"1",minWidth:"0"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{fontSize:"14px",fontWeight:"600",textDecoration:"line-through",textDecorationColor:"var(--fnt)"}}>{"Consolidate duplicate help-center pages"}</div>
                  <span style={{fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"#d9b679",border:"1px solid rgba(217,182,121,.35)",borderRadius:"4px",padding:"2px 6px"}}>{"TECHNICAL"}</span>
                </div>
                <div style={{display:"flex",gap:"16px",marginTop:"8px",fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>
                  <span>{"Shipped Jul 22"}</span>
                  <span>{"Measured "}<span style={{color:"var(--ac)"}}>{"+0.6pt"}</span>{" vs +0.4 est."}{" "}<Hint text="Actual gain after a fix went live" size={12} /></span>
                </div>
              </div>
              <span style={{display:"inline-flex",alignItems:"center",gap:"6px",flex:"none"}}><Hint text="This fix is live and already measured" align="right" size={12} /><span style={{fontSize:"10.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 40%,transparent)",borderRadius:"5px",padding:"4px 9px"}}>{"SHIPPED ✓"}</span></span>
            </div>
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"18px 20px",position:"sticky",top:"0"}}>
            <div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{fontSize:"14.5px",fontWeight:"600"}}>{"Impact model"}</div><Hint text="Where you land if you ship everything" /></div>
            <div style={{fontSize:"12px",color:"var(--mut)",lineHeight:"1.55",marginTop:"6px"}}>{"Projected visibility if all open actions ship, based on measured lift from 38 shipped actions."}</div>
            <div style={{display:"flex",alignItems:"baseline",gap:"10px",marginTop:"16px"}}>
              <span style={{fontSize:"24px",fontWeight:"600",letterSpacing:"-0.01em",fontVariantNumeric:"tabular-nums"}}>{"34.2%"}</span>
              <span style={{color:"var(--fnt)"}}>{"→"}</span>
              <span style={{fontSize:"24px",fontWeight:"600",letterSpacing:"-0.01em",fontVariantNumeric:"tabular-nums",color:"var(--ac)"}}>{"43.6%"}</span>
            </div>
            <div style={{display:"flex",gap:"8px",marginTop:"12px",alignItems:"stretch"}}>
              <div style={{display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"2px 0",textAlign:"right",fontSize:"10.5px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums",flex:"none",width:"26px"}}>
                <span>{"45%"}</span>
                <span>{"35%"}</span>
                <span>{"25%"}</span>
              </div>
              <div style={{position:"relative",flex:"1",minWidth:"0"}}>
                <TrendChart
                  series={[
                    { id: "projected", label: "Projected", color: "#b98ed9", points: impactProjection },
                    { id: "measured", label: "Measured", color: "var(--ac)", points: impactHistory, area: true },
                  ]}
                  xLabels={impactXLabels}
                  width={286}
                  height={120}
                  yDomain={[25, 45]}
                  yDecimals={1}
                  yUnit="%"
                  showLegend={false}
                />
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"10px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)",marginTop:"6px",paddingLeft:"34px"}}>
              <span>{"Jul 7"}</span>
              <span>{"today"}</span>
              <span>{"+90d"}</span>
            </div>
            <div style={{marginTop:"16px",paddingTop:"14px",borderTop:"1px solid var(--brd)",display:"flex",flexDirection:"column",gap:"9px",fontSize:"12px",color:"var(--mut)"}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span>{"Content actions"}</span>
                <span style={{fontSize:"11.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--tx)"}}>{"+4.1pt"}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span>{"Technical actions"}</span>
                <span style={{fontSize:"11.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--tx)"}}>{"+3.5pt"}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span>{"Authority actions"}</span>
                <span style={{fontSize:"11.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--tx)"}}>{"+1.8pt"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
