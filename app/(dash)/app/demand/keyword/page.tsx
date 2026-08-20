import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import FilterPill from "@/components/ui/FilterPill";
import Hint from "@/components/ui/Hint";
import { METRICS } from "@/lib/metrics";
import ReportCsvButton from "@/components/ui/ReportCsvButton";
import ToastButton from "../../actions/ToastButton";
import { demandKeywordSpec } from "../reports";
import ExactPhraseToggle from "./ExactPhraseToggle";
import PlatformCheck from "./PlatformCheck";
import KeywordTree from "./KeywordTree";
import { KeywordVolumeTrend, KeywordAgeBars } from "./KeywordCharts";

/* P2 — Demand keyword detail — converted from canvas frame #p2-demand.
   Wiring pass: the hand-drawn volume SVG (incl. its depicted static "Jun ·
   106K" tooltip and crosshair) → <TrendChart>, and the Age demographic bars →
   <BarChart>, both fed from lib/data/demand.ts via ./KeywordCharts (client
   wrapper). Long-tail keyword-tree rows get the global row-hover class.
   Activation pass: Exact/Phrase → real segmented toggle (ExactPhraseToggle,
   pure local state); "vs previous 30 days ▾" → FilterPill; "+ Add to
   watchlist" + "Send 3 prompts to tracking →" → honest-demo toasts (playbook
   3); by-platform ✓ squares → real toggles + toast (PlatformCheck, playbook
   5); keyword tree → KeywordTree (▾ collapses, ☆ stars toggle, long-tail rows
   toast the single-detail line). "Asked recently" cards are quotes, static.
   Export pass: the screen had no export control, so it gains the quiet pill
   treatment Agent Analytics already uses (the accent slot belongs to "+ Add to
   watchlist"). It downloads the executive report in ../reports.ts: the 128K
   volume with its +12K delta in plain English, the bi-weekly volume curve as a
   dated table, the platform split, every demographic breakdown, the keyword
   tree and the recent questions. */

export const metadata: Metadata = {
  title: "best running shoes · Demand — Answr",
};

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

export default function DemandKeywordPage() {
  return (
    <div className="frame-p2-demand">
      <Topbar
        crumb={["Demand", "best running shoes"]}
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
        extra={
          <>
            <span style={{fontSize:"11px",fontWeight:"500",color:"var(--mut)",border:"1px dashed var(--brd)",borderRadius:"6px",padding:"5px 10px",fontVariantNumeric:"tabular-nums"}}>{"18 searches left this month"}</span>
            <FilterPill label="vs previous 30 days" items={["vs previous 30 days", "vs previous 90 days", "vs same period last year"]} note="This filter needs a live workspace — the demo ships one fixture set for this list." />
            <ReportCsvButton filename="nike-demand-best-running-shoes.csv" report={demandKeywordSpec} style={EXPORT_PILL}>
              {"Export keyword"}
            </ReportCsvButton>
            <ToastButton
              message="Adding to a watchlist needs a live workspace — this demo is read-only."
              className="btn-ac"
              style={{fontSize:"12.5px",fontWeight:500,borderRadius:"7px",padding:"6px 14px",border:"none",cursor:"pointer",fontFamily:"inherit"}}
            >
              {"+ Add to watchlist"}
            </ToastButton>
          </>
        }
      />
      <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:"16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{fontSize:"20px",fontWeight:"600",letterSpacing:"-0.01em"}}>{"best running shoes"}</div>
          <span style={{fontSize:"10px",fontWeight:"600",color:"#7fa7d9",border:"1px solid rgba(127,167,217,.35)",borderRadius:"4px",padding:"2px 7px"}}>{"COMMERCIAL INTENT"}</span>
          <Hint text="People asking this are close to buying" size={12} />
          <ExactPhraseToggle />
          <span style={{fontSize:"11.5px",color:"var(--fnt)"}}>{"in 2 watchlists"}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 372px",gap:"14px"}}>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"17px 19px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13.5px",fontWeight:"600"}}>{"Prompt volume"}<Hint text="How many people ask AI this monthly" /></div>
                <div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"3px"}}>{"monthly conversations containing this keyword, from consented panels"}</div>
              </div>
              <div style={{display:"flex",alignItems:"baseline",gap:"8px"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><span style={{fontSize:"24px",fontWeight:"600",fontVariantNumeric:"tabular-nums",letterSpacing:"-0.01em"}}>{"128K"}</span><Hint text={METRICS.demand_volume.plain} align="right" /></span>
                <span style={{fontSize:"12px",fontWeight:"500",color:"#4cb782"}}>{"↑ 12K vs prev."}</span>
              </div>
            </div>
            <div style={{display:"flex",gap:"8px",marginTop:"12px",alignItems:"stretch"}}>
              <div style={{display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"2px 0",textAlign:"right",fontSize:"10.5px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums",flex:"none",width:"26px"}}>
                <span>{"160K"}</span>
                <span>{"120K"}</span>
                <span>{"80K"}</span>
                <span>{"40K"}</span>
              </div>
              <div style={{position:"relative",flex:"1",minWidth:"0"}}>
                <KeywordVolumeTrend />
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"10.5px",color:"var(--fnt)",marginTop:"8px",fontVariantNumeric:"tabular-nums",paddingLeft:"34px"}}>
              <span>{"Feb"}</span>
              <span>{"Mar"}</span>
              <span>{"Apr"}</span>
              <span>{"May"}</span>
              <span>{"Jun"}</span>
              <span>{"Jul"}</span>
            </div>
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"17px 19px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13.5px",fontWeight:"600"}}>{"By platform"}<Hint text="Which AI people ask this on" align="right" /></div>
            <div style={{display:"flex",flexDirection:"column",gap:"9px",marginTop:"12px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 12px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",fontSize:"12.5px"}}>
                <PlatformCheck platform="ChatGPT" initialChecked />{"ChatGPT"}<span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"61K"}</span>
                <span style={{fontSize:"11px",fontWeight:"500",color:"#4cb782"}}>{"↑ 7.2K"}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 12px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",fontSize:"12.5px"}}>
                <PlatformCheck platform="Gemini" initialChecked />{"Gemini"}<span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"28K"}</span>
                <span style={{fontSize:"11px",fontWeight:"500",color:"#4cb782"}}>{"↑ 2.1K"}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 12px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",fontSize:"12.5px"}}>
                <PlatformCheck platform="Perplexity" initialChecked />{"Perplexity"}<span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"22K"}</span>
                <span style={{fontSize:"11px",fontWeight:"500",color:"#4cb782"}}>{"↑ 1.9K"}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 12px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",fontSize:"12.5px",color:"var(--mut)"}}>
                <PlatformCheck platform="Claude" initialChecked={false} />{"Claude"}<span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"17K"}</span>
                <span style={{fontSize:"11px",fontWeight:"500",color:"#e5636e"}}>{"↓ 0.4K"}</span>
              </div>
            </div>
            <div style={{marginTop:"14px",paddingTop:"12px",borderTop:"1px solid var(--brd)",fontSize:"12px",color:"var(--mut)",lineHeight:"1.55"}}>{"ChatGPT demand grew 13% after the June shopping rollout."}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"14px"}}>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"15px 17px"}}>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between"}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"12.5px",fontWeight:"600"}}>{"Age"}<Hint text="Ages of people asking this" /></span>
              <span style={{fontSize:"10px",color:"var(--fnt)"}}>{"vs prev · "}<span style={{color:"#4cb782"}}>{"25-34 ↑2pt"}</span></span>
            </div>
            <div style={{marginTop:"12px"}}>
              <KeywordAgeBars />
            </div>
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"15px 17px"}}>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between"}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"12.5px",fontWeight:"600"}}>{"Household income"}<Hint text="What people asking this earn" /></span>
              <span style={{fontSize:"10px",color:"var(--fnt)"}}>{"vs prev · "}<span style={{color:"#4cb782"}}>{"$150K+ ↑1pt"}</span></span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"9px",marginTop:"14px"}}>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"var(--mut)",marginBottom:"4px"}}>
                  <span>{"<$75K"}</span>
                  <span style={{fontVariantNumeric:"tabular-nums"}}>{"21%"}</span>
                </div>
                <div style={{height:"4px",background:"var(--bg2)",borderRadius:"2px"}}>
                  <div style={{width:"21%",height:"4px",background:"var(--ac)",opacity:".5",borderRadius:"2px"}} />
                </div>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"var(--mut)",marginBottom:"4px"}}>
                  <span>{"$75-150K"}</span>
                  <span style={{fontVariantNumeric:"tabular-nums"}}>{"46%"}</span>
                </div>
                <div style={{height:"4px",background:"var(--bg2)",borderRadius:"2px"}}>
                  <div style={{width:"46%",height:"4px",background:"var(--ac)",borderRadius:"2px"}} />
                </div>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"var(--mut)",marginBottom:"4px"}}>
                  <span>{"$150K+"}</span>
                  <span style={{fontVariantNumeric:"tabular-nums"}}>{"33%"}</span>
                </div>
                <div style={{height:"4px",background:"var(--bg2)",borderRadius:"2px"}}>
                  <div style={{width:"33%",height:"4px",background:"var(--ac)",opacity:".75",borderRadius:"2px"}} />
                </div>
              </div>
            </div>
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"15px 17px"}}>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between"}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"12.5px",fontWeight:"600"}}>{"Gender"}<Hint text="Gender split of people asking" /></span>
              <span style={{fontSize:"10px",color:"var(--fnt)"}}>{"vs prev · stable"}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"16px",marginTop:"12px"}}>
              <svg width="84" height="84" viewBox="0 0 84 84">
                <circle cx="42" cy="42" r="34" fill="none" stroke="var(--bg2)" strokeWidth="10" />
                <circle cx="42" cy="42" r="34" fill="none" stroke="var(--ac)" strokeWidth="10" strokeDasharray="124 214" transform="rotate(-90 42 42)" />
                <circle cx="42" cy="42" r="34" fill="none" stroke="#7fa7d9" strokeWidth="10" strokeDasharray="83 214" strokeDashoffset="-124" transform="rotate(-90 42 42)" />
              </svg>
              <div style={{display:"flex",flexDirection:"column",gap:"7px",fontSize:"11.5px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                  <span style={{width:"7px",height:"7px",borderRadius:"2px",background:"var(--ac)"}} />{"Male"}<span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"58%"}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                  <span style={{width:"7px",height:"7px",borderRadius:"2px",background:"#7fa7d9"}} />{"Female"}<span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"39%"}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                  <span style={{width:"7px",height:"7px",borderRadius:"2px",background:"var(--bg2)"}} />{"Other"}<span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"3%"}</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"15px 17px"}}>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between"}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"12.5px",fontWeight:"600"}}>{"Top regions"}<Hint text="Countries where people ask this" /></span>
              <span style={{fontSize:"10px",color:"var(--fnt)"}}>{"vs prev · "}<span style={{color:"#4cb782"}}>{"US ↑3pt"}</span></span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"14px",fontSize:"11.5px"}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span>{"United States"}</span>
                <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"44%"}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",color:"var(--mut)"}}>
                <span>{"United Kingdom"}</span>
                <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"14%"}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",color:"var(--mut)"}}>
                <span>{"Germany"}</span>
                <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"9%"}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",color:"var(--mut)"}}>
                <span>{"India"}</span>
                <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"8%"}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",color:"var(--mut)"}}>
                <span>{"Canada"}</span>
                <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"6%"}</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"16px 19px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13.5px",fontWeight:"600"}}>{"Keyword tree"}<Hint text="Narrower questions branching off this one" /></div>
            <div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"3px"}}>{"parent → long-tail, by prompt volume"}</div>
            <div style={{fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums",marginTop:"8px"}}>{"All keywords / running shoes / "}<span style={{color:"var(--tx)"}}>{"best running shoes"}</span></div>
            <KeywordTree />
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"16px 19px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"13.5px",fontWeight:"600"}}>{"Asked recently"}<Hint text="Real questions people asked lately" /></span>
              <span style={{fontSize:"11px",color:"var(--fnt)"}}>{"rephrased for privacy"}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"12px",fontSize:"12.5px"}}>
              <div style={{padding:"10px 12px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",lineHeight:"1.5",color:"var(--mut)"}}>{"\"best running shoes for a first marathon under $150\" "}<span style={{display:"block",fontSize:"10.5px",color:"var(--fnt)",marginTop:"4px",fontVariantNumeric:"tabular-nums"}}>{"ChatGPT · Aug 2"}</span></div>
              <div style={{padding:"10px 12px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",lineHeight:"1.5",color:"var(--mut)"}}>{"\"running shoes that work for both road and treadmill\" "}<span style={{display:"block",fontSize:"10.5px",color:"var(--fnt)",marginTop:"4px",fontVariantNumeric:"tabular-nums"}}>{"Gemini · Aug 1"}</span></div>
              <div style={{padding:"10px 12px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",lineHeight:"1.5",color:"var(--mut)"}}>{"\"are carbon plate running shoes worth it for a casual runner\" "}<span style={{display:"block",fontSize:"10.5px",color:"var(--fnt)",marginTop:"4px",fontVariantNumeric:"tabular-nums"}}>{"Perplexity · Jul 30"}</span></div>
            </div>
            <ToastButton message="Creating tracked prompts needs a live workspace — this demo is read-only." style={{marginTop:"12px",fontSize:"12px",color:"var(--ac)",fontWeight:500,background:"none",border:"none",padding:"0",fontFamily:"inherit",cursor:"pointer",display:"block",textAlign:"left"}}>{"Send 3 prompts to tracking →"}</ToastButton>
          </div>
        </div>
      </div>
    </div>
  );
}
