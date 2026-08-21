import Link from "next/link";
import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import FilterPill from "@/components/ui/FilterPill";
import Hint from "@/components/ui/Hint";
import { METRICS } from "@/lib/metrics";
import ReportCsvButton from "@/components/ui/ReportCsvButton";
import ToastButton from "../actions/ToastButton";
import KeywordSearch from "./KeywordSearch";
import { demandSpec } from "./reports";
import "./page.css";

/* Demand — watchlists — converted from canvas frame #demand.
   Audit fix applied: quota copy "on the Growth plan" → "on the Scale plan".
   Keyword rows link to the keyword detail (frame 15a → /app/demand/keyword).
   Wiring pass (row-hover sweep): row 1's painted static hover state (the
   frame's depicted rgba(255,255,255,0.03) example row) → real `row-hover`
   like its siblings; the "Open →" affordance copy is kept. Row sparklines are
   72px (≤80px) — decorative, left static per conventions.
   Activation pass: "vs previous 30 days ▾" → FilterPill (playbook 2); both
   "+ New watchlist" buttons → honest-demo toast (playbook 3); "View all" →
   fixture-rows toast (playbook 8); keyword search input answers Enter with the
   quota-honest line (KeywordSearch). The "18 searches left" chip is an
   informational badge, left static.
   Export pass: the screen had no export control, so it gains the quiet pill
   treatment Agent Analytics already uses (the accent slot belongs to "+ New
   watchlist"). It downloads the executive report in ./reports.ts: both
   watchlists' combined volume with plain-English reads, the largest keyword,
   the biggest brand gap, and the keyword table. */

export const metadata: Metadata = {
  title: "Demand — Answr",
};

const ROW_GRID = "1.6fr .9fr .8fr .7fr 1fr 92px";

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

export default function DemandPage() {
  return (
    <div className="frame-demand">
      <Topbar
        crumb="Demand"
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
        extra={
          <>
            <span style={{fontSize:"11px",fontWeight:"500",color:"var(--mut)",border:"1px dashed var(--brd)",borderRadius:"6px",padding:"5px 10px",fontVariantNumeric:"tabular-nums"}}>{"18 searches left this month"}</span>
            <FilterPill label="vs previous 30 days" items={["vs previous 30 days", "vs previous 90 days", "vs same period last year"]} note="This filter needs a live workspace — the demo ships one fixture set for this list." />
            <ReportCsvButton filename="nike-demand-30d.csv" report={demandSpec} style={EXPORT_PILL}>
              {"Export watchlists"}
            </ReportCsvButton>
            <ToastButton
              message="Creating a watchlist needs a live workspace — this demo is read-only."
              className="btn-ac"
              style={{fontSize:"12.5px",fontWeight:500,borderRadius:"7px",padding:"6px 14px",border:"none",cursor:"pointer",fontFamily:"inherit"}}
            >
              {"+ New watchlist"}
            </ToastButton>
          </>
        }
      />
      <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:"16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px"}}>
          <div>
            <div style={{fontSize:"20px",fontWeight:"600",letterSpacing:"-0.01em"}}>{"Demand"}</div>
            <div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"3px"}}>{"What buyers ask AI — keyword volume from consented conversation panels, refreshed monthly"}</div>
          </div>
          <KeywordSearch />
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"12px"}}>
          <div style={{background:"var(--bg1)",border:"1px solid var(--ac)",borderRadius:"10px",padding:"15px 17px",boxShadow:"0 0 0 1px rgba(142,124,242,0.2)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"13px",fontWeight:"600"}}>{"Core category"}<Hint text="Your main group of watched keywords" /></span>
              <span style={{fontSize:"10px",fontWeight:"600",color:"#b3a7f8",background:"rgba(142,124,242,0.16)",borderRadius:"4px",padding:"2px 6px"}}>{"Open"}</span>
            </div>
            <div style={{display:"flex",gap:"20px",marginTop:"12px"}}>
              <div>
                <div style={{fontSize:"11px",color:"var(--fnt)"}}>{"Keywords"}</div>
                <div style={{fontSize:"17px",fontWeight:"600",fontVariantNumeric:"tabular-nums",marginTop:"3px"}}>{"12"}</div>
              </div>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"11px",color:"var(--fnt)"}}>{"Combined volume"}<Hint text="How many people ask AI this monthly" size={12} /></div>
                <div style={{fontSize:"17px",fontWeight:"600",fontVariantNumeric:"tabular-nums",marginTop:"3px"}}><span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><span>{"486K "}<span style={{fontSize:"11px",color:"#4cb782"}}>{"↑8%"}</span></span><Hint text={METRICS.demand_volume.plain} /></span></div>
              </div>
            </div>
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"15px 17px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",fontWeight:"600"}}>{"Competitor terms"}<Hint text="Keywords that name rival brands" /></div>
            <div style={{display:"flex",gap:"20px",marginTop:"12px"}}>
              <div>
                <div style={{fontSize:"11px",color:"var(--fnt)"}}>{"Keywords"}</div>
                <div style={{fontSize:"17px",fontWeight:"600",fontVariantNumeric:"tabular-nums",marginTop:"3px"}}>{"8"}</div>
              </div>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"11px",color:"var(--fnt)"}}>{"Combined volume"}<Hint text="How many people ask AI this monthly" size={12} /></div>
                <div style={{fontSize:"17px",fontWeight:"600",fontVariantNumeric:"tabular-nums",marginTop:"3px"}}><span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><span>{"214K "}<span style={{fontSize:"11px",color:"#4cb782"}}>{"↑21%"}</span></span><Hint text={METRICS.demand_volume.plain} /></span></div>
              </div>
            </div>
          </div>
          <ToastButton message="Creating a watchlist needs a live workspace — this demo is read-only." style={{border:"1px dashed var(--brd)",borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--fnt)",fontSize:"12.5px",minHeight:"90px",background:"none",fontFamily:"inherit",cursor:"pointer"}}>{"+ New watchlist — group keywords, get a weekly digest"}</ToastButton>
        </div>
        <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"15px 19px 11px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",fontWeight:"600"}}>{"Core category · 12 keywords"}<Hint text="What people ask AI about this subject" /></div>
            <div style={{fontSize:"11.5px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"sorted by prompt volume"}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:ROW_GRID,padding:"7px 19px",fontSize:"11px",fontWeight:"500",color:"var(--fnt)",borderBottom:"1px solid var(--brd)"}}>
            <span>{"Keyword"}</span>
            <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Intent"}<Hint text="Why people ask: buying, learning, comparing" size={12} /></span>
            <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Prompt volume"}<Hint text="How many people ask AI this monthly" size={12} /></span>
            <span>{"Δ 30d"}</span>
            <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Top brand in answers"}<Hint text="Brand AI names most for this" size={12} /></span>
            <span>{"Trend"}</span>
          </div>
          <Link href="/app/demand/keyword" className="row-hover" style={{display:"grid",gridTemplateColumns:ROW_GRID,alignItems:"center",padding:"11px 19px",fontSize:"13px",color:"var(--tx)"}}>
            <span style={{display:"flex",alignItems:"center",gap:"8px",fontWeight:"500"}}>{"best running shoes"}<span style={{fontSize:"10px",color:"var(--fnt)",border:"1px solid var(--brd)",borderRadius:"4px",padding:"1px 5px"}}>{"2 lists"}</span>
              <span style={{fontSize:"11px",fontWeight:"500",color:"var(--ac)"}}>{"Open →"}</span>
            </span>
            <span>
              <span style={{fontSize:"9.5px",fontWeight:"600",color:"#7fa7d9",border:"1px solid rgba(127,167,217,.35)",borderRadius:"4px",padding:"2px 7px"}}>{"COMMERCIAL"}</span>
            </span>
            <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"128K"}</span>
            <span style={{fontSize:"12px",fontWeight:"500",color:"#4cb782"}}>{"↑ 12K"}</span>
            <span style={{color:"var(--mut)"}}>{"Nike · 34%"}</span>
            <svg width="72" height="22" viewBox="0 0 72 22">
              <path d="M0 16L12 15L24 15L36 12L48 11L60 9L72 6" fill="none" stroke="var(--ac)" strokeWidth="1.25" />
            </svg>
          </Link>
          <Link href="/app/demand/keyword" className="hv1" style={{display:"grid",gridTemplateColumns:ROW_GRID,alignItems:"center",padding:"11px 19px",fontSize:"13px",borderTop:"1px solid var(--brd)",color:"var(--tx)"}}>
            <span>{"best training shoes"}</span>
            <span>
              <span style={{fontSize:"9.5px",fontWeight:"600",color:"#7fa7d9",border:"1px solid rgba(127,167,217,.35)",borderRadius:"4px",padding:"2px 7px"}}>{"COMMERCIAL"}</span>
            </span>
            <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"94K"}</span>
            <span style={{fontSize:"12px",fontWeight:"500",color:"#4cb782"}}>{"↑ 6K"}</span>
            <span style={{color:"var(--mut)"}}>{"Adidas · 31%"}</span>
            <svg width="72" height="22" viewBox="0 0 72 22">
              <path d="M0 14L12 13L24 14L36 12L48 11L60 10L72 9" fill="none" stroke="#7fa7d9" strokeWidth="1.25" />
            </svg>
          </Link>
          <Link href="/app/demand/keyword" className="hv2" style={{display:"grid",gridTemplateColumns:ROW_GRID,alignItems:"center",padding:"11px 19px",fontSize:"13px",borderTop:"1px solid var(--brd)",color:"var(--tx)"}}>
            <span>{"marathon training shoes"}</span>
            <span>
              <span style={{fontSize:"9.5px",fontWeight:"600",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"4px",padding:"2px 7px"}}>{"INFORMATIONAL"}</span>
            </span>
            <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"76K"}</span>
            <span style={{fontSize:"12px",fontWeight:"500",color:"#4cb782"}}>{"↑ 3K"}</span>
            <span style={{color:"var(--mut)"}}>{"Nike · 29%"}</span>
            <svg width="72" height="22" viewBox="0 0 72 22">
              <path d="M0 13L12 13L24 12L36 12L48 11L60 11L72 10" fill="none" stroke="var(--ac)" strokeWidth="1.25" opacity=".7" />
            </svg>
          </Link>
          <Link href="/app/demand/keyword" className="hv3" style={{display:"grid",gridTemplateColumns:ROW_GRID,alignItems:"center",padding:"11px 19px",fontSize:"13px",borderTop:"1px solid var(--brd)",color:"var(--tx)"}}>
            <span>{"nike vs adidas"}</span>
            <span>
              <span style={{fontSize:"9.5px",fontWeight:"600",color:"#d9b679",border:"1px solid rgba(217,182,121,.35)",borderRadius:"4px",padding:"2px 7px"}}>{"COMPARISON"}</span>
            </span>
            <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"41K"}</span>
            <span style={{fontSize:"12px",fontWeight:"500",color:"#4cb782"}}>{"↑ 9K"}</span>
            <span style={{color:"var(--mut)"}}>{"Adidas · 38%"}</span>
            <svg width="72" height="22" viewBox="0 0 72 22">
              <path d="M0 17L12 16L24 14L36 13L48 10L60 8L72 5" fill="none" stroke="#d9b679" strokeWidth="1.25" />
            </svg>
          </Link>
          <Link href="/app/demand/keyword" className="hv4" style={{display:"grid",gridTemplateColumns:ROW_GRID,alignItems:"center",padding:"11px 19px",fontSize:"13px",borderTop:"1px solid var(--brd)",color:"var(--tx)"}}>
            <span>{"carbon plate shoe benefits"}</span>
            <span>
              <span style={{fontSize:"9.5px",fontWeight:"600",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"4px",padding:"2px 7px"}}>{"INFORMATIONAL"}</span>
            </span>
            <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"38K"}</span>
            <span style={{fontSize:"12px",fontWeight:"500",color:"#e5636e"}}>{"↓ 2K"}</span>
            <span style={{color:"var(--mut)"}}>{"Brooks · 26%"}</span>
            <svg width="72" height="22" viewBox="0 0 72 22">
              <path d="M0 9L12 10L24 10L36 12L48 12L60 13L72 14" fill="none" stroke="#b98ed9" strokeWidth="1.25" />
            </svg>
          </Link>
          <Link href="/app/demand/keyword" className="hv5" style={{display:"grid",gridTemplateColumns:ROW_GRID,alignItems:"center",padding:"11px 19px",fontSize:"13px",borderTop:"1px solid var(--brd)",color:"var(--tx)"}}>
            <span>{"running shoe size guide"}</span>
            <span>
              <span style={{fontSize:"9.5px",fontWeight:"600",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"4px",padding:"2px 7px"}}>{"INFORMATIONAL"}</span>
            </span>
            <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"29K"}</span>
            <span style={{fontSize:"12px",fontWeight:"500",color:"#4cb782"}}>{"↑ 1K"}</span>
            <span style={{color:"var(--mut)"}}>{"Nike · 22%"}</span>
            <svg width="72" height="22" viewBox="0 0 72 22">
              <path d="M0 12L12 12L24 11L36 11L48 10L60 10L72 9" fill="none" stroke="var(--ac)" strokeWidth="1.25" opacity=".7" />
            </svg>
          </Link>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 19px",fontSize:"12px",borderTop:"1px solid var(--brd)"}}>
            <span style={{color:"var(--fnt)"}}>{"Showing 6 of 12 · "}<ToastButton message="The demo ships the first page of fixture rows — full history lives on live workspaces." style={{background:"none",border:"none",padding:"0",font:"inherit",color:"var(--ac)",fontWeight:500,cursor:"pointer"}}>{"View all"}</ToastButton></span>
            <span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"volumes rounded · panel n=2.1M conversations"}</span>
          </div>
        </div>
        <div style={{fontSize:"12px",color:"var(--mut)",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"11px 14px",lineHeight:"1.55"}}>{"A row opens the keyword detail. Searches outside your watchlists draw from the monthly quota — 18 left on the Scale plan."}</div>
      </div>
    </div>
  );
}
