import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import FilterPill from "@/components/ui/FilterPill";
import Hint from "@/components/ui/Hint";
import ToastButton from "../actions/ToastButton";

/* P2 — Workflows — converted from canvas frame #p2-workflows.
   Wiring pass: workflow-table and recent-runs rows get the global .row-hover class
   (the selected "New-citation alert" row keeps its inline selected tint instead).
   No KPI stat cards or primary charts exist on this frame.
   Activation pass (INTERACTIVITY_CONVENTIONS):
   - "All statuses ▾" → FilterPill (playbook 2).
   - "+ New workflow" moved out of the Topbar export slot (which renders a dead
     button when no exportRows are passed) into <Topbar extra> as a real
     ToastButton with the identical btn-ac styling and slot order.
   - Template chips + "+ add step" → honest-demo toasts (playbook 3).
   - "Save workflow" / "Run test" → status toasts (playbook 4).
   Table and recent-run rows keep .row-hover only, matching every other
   dashboard table in the app (hover tint, no click target). */

const DEMO_NOTE = "This filter needs a live workspace — the demo ships one fixture set for this list.";
const CREATE_NOTE = "Creating a workflow needs a live workspace — this demo is read-only.";

/* exact styling of the Topbar's own export-slot button, so moving the control
   into `extra` is pixel-identical */
const TOPBAR_BTN: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 500,
  borderRadius: "7px",
  padding: "6px 14px",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};

/* template chip = the frame's dashed span + the resets a <button> needs */
const CHIP: React.CSSProperties = {
  fontSize: "12px",
  color: "var(--mut)",
  border: "1px dashed var(--brd)",
  borderRadius: "6px",
  padding: "5px 11px",
  background: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};

export const metadata: Metadata = {
  title: "Workflows — Answr",
};

export default function WorkflowsPage() {
  return (
    <div className="frame-p2-workflows" style={{flex:"1",display:"flex",flexDirection:"column"}}>
      <Topbar
        crumb="Workflows"
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
        extra={
          <>
            <FilterPill label="All statuses" items={["All statuses", "Active", "Paused"]} note={DEMO_NOTE} />
            <ToastButton message={CREATE_NOTE} className="btn-ac" style={TOPBAR_BTN}>{"+ New workflow"}</ToastButton>
          </>
        }
      />
      <div style={{flex:"1",display:"grid",gridTemplateColumns:"1fr 420px"}}>
        <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:"16px",borderRight:"1px solid var(--brd)"}}>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"11px",fontWeight:"500",color:"var(--fnt)"}}>{"Templates"}<Hint text="Ready-made setups you can copy" size={12} /></span>
            <ToastButton message={CREATE_NOTE} style={CHIP}>{"Weekly content audit"}</ToastButton>
            <ToastButton message={CREATE_NOTE} style={CHIP}>{"New-citation alert"}</ToastButton>
            <ToastButton message={CREATE_NOTE} style={CHIP}>{"Low-visibility topic sweep"}</ToastButton>
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"1.6fr 1.4fr .8fr .8fr .5fr",padding:"9px 19px",fontSize:"11px",fontWeight:"500",color:"var(--fnt)",borderBottom:"1px solid var(--brd)"}}>
              <span>{"Name"}</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Trigger"}<Hint text="What sets this off" size={12} /></span>
              <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Status"}<Hint text="Running or switched off" size={12} /></span>
              <span>{"Last run"}</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Runs"}<Hint text="Times this has fired" size={12} align="right" /></span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1.6fr 1.4fr .8fr .8fr .5fr",alignItems:"center",padding:"12px 19px",fontSize:"13px",background:"rgba(142,124,242,0.06)"}}>
              <span style={{fontWeight:"600"}}>{"New-citation alert"}</span>
              <span style={{color:"var(--mut)",fontSize:"12.5px"}}>{"New domain cites Nike"}</span>
              <span>
                <span style={{fontSize:"10px",fontWeight:"600",color:"#4cb782",border:"1px solid rgba(76,183,130,.4)",borderRadius:"4px",padding:"2px 7px"}}>{"ACTIVE"}</span>
              </span>
              <span style={{color:"var(--mut)",fontVariantNumeric:"tabular-nums",fontSize:"12.5px"}}>{"2h ago"}</span>
              <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"148"}</span>
            </div>
            <div className="row-hover" style={{display:"grid",gridTemplateColumns:"1.6fr 1.4fr .8fr .8fr .5fr",alignItems:"center",padding:"12px 19px",fontSize:"13px",borderTop:"1px solid var(--brd)"}}>
              <span style={{fontWeight:"500"}}>{"Weekly content audit"}</span>
              <span style={{color:"var(--mut)",fontSize:"12.5px"}}>{"Mondays 09:00"}</span>
              <span>
                <span style={{fontSize:"10px",fontWeight:"600",color:"#4cb782",border:"1px solid rgba(76,183,130,.4)",borderRadius:"4px",padding:"2px 7px"}}>{"ACTIVE"}</span>
              </span>
              <span style={{color:"var(--mut)",fontVariantNumeric:"tabular-nums",fontSize:"12.5px"}}>{"Aug 3"}</span>
              <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"12"}</span>
            </div>
            <div className="row-hover" style={{display:"grid",gridTemplateColumns:"1.6fr 1.4fr .8fr .8fr .5fr",alignItems:"center",padding:"12px 19px",fontSize:"13px",borderTop:"1px solid var(--brd)"}}>
              <span style={{fontWeight:"500",color:"var(--mut)"}}>{"Low-visibility topic sweep"}</span>
              <span style={{color:"var(--mut)",fontSize:"12.5px"}}>{"Topic drops below 15%"}</span>
              <span>
                <span style={{fontSize:"10px",fontWeight:"600",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"4px",padding:"2px 7px"}}>{"PAUSED"}</span>
              </span>
              <span style={{color:"var(--mut)",fontVariantNumeric:"tabular-nums",fontSize:"12.5px"}}>{"Jul 12"}</span>
              <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"3"}</span>
            </div>
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",overflow:"hidden"}}>
            <div style={{padding:"14px 19px 10px",display:"flex",alignItems:"center",gap:"6px",fontSize:"13.5px",fontWeight:"600"}}>{"Recent runs"}<Hint text="What these setups did lately" /></div>
            <div className="row-hover" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 19px",borderTop:"1px solid var(--brd)",fontSize:"12.5px"}}>
              <span style={{color:"var(--mut)"}}>
                <span style={{color:"var(--tx)",fontWeight:"500"}}>{"New-citation alert"}</span>{" — letsrun.com cited Nike for the first time → drafted outreach note"}</span>
              <span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"2h ago"}</span>
            </div>
            <div className="row-hover" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 19px",borderTop:"1px solid var(--brd)",fontSize:"12.5px"}}>
              <span style={{color:"var(--mut)"}}>
                <span style={{color:"var(--tx)",fontWeight:"500"}}>{"Weekly content audit"}</span>{" — 2 pages lost citations week-over-week → created action #94"}</span>
              <span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"Aug 3"}</span>
            </div>
            <div className="row-hover" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 19px",borderTop:"1px solid var(--brd)",fontSize:"12.5px"}}>
              <span style={{color:"var(--mut)"}}>
                <span style={{color:"var(--tx)",fontWeight:"500"}}>{"New-citation alert"}</span>{" — highsnobiety.com cited Adidas (competitor watch) → notified #aeo-alerts"}</span>
              <span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"Aug 2"}</span>
            </div>
          </div>
        </div>
        <div style={{padding:"22px 24px",background:"var(--bg1)",display:"flex",flexDirection:"column",gap:"12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:"13.5px",fontWeight:"600"}}>{"New-citation alert"}</span>
            <span style={{fontSize:"11px",color:"var(--fnt)"}}>{"editing"}</span>
          </div>
          <div style={{background:"var(--bg0)",border:"1px solid var(--ac)",borderRadius:"9px",padding:"13px 15px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"10px",fontWeight:"600",color:"var(--ac)",letterSpacing:".08em"}}>{"TRIGGER"}<Hint text="The event that starts this workflow" size={12} /></div>
            <div style={{fontSize:"13px",fontWeight:"500",marginTop:"5px"}}>{"When a new domain cites Nike"}</div>
            <div style={{fontSize:"11.5px",color:"var(--fnt)",marginTop:"3px"}}>{"checked hourly against the citation index"}</div>
          </div>
          <div style={{display:"flex",justifyContent:"center"}}>
            <div style={{width:"1px",height:"14px",background:"var(--brd)"}} />
          </div>
          <div style={{background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"9px",padding:"13px 15px"}}>
            <div style={{fontSize:"10px",fontWeight:"600",color:"var(--fnt)",letterSpacing:".08em"}}>{"STEP 1"}</div>
            <div style={{fontSize:"13px",fontWeight:"500",marginTop:"5px"}}>{"Classify the source"}</div>
            <div style={{fontSize:"11.5px",color:"var(--fnt)",marginTop:"3px"}}>{"owned / earned / community / reference"}</div>
          </div>
          <div style={{display:"flex",justifyContent:"center"}}>
            <div style={{width:"1px",height:"14px",background:"var(--brd)"}} />
          </div>
          <div style={{background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"9px",padding:"13px 15px"}}>
            <div style={{fontSize:"10px",fontWeight:"600",color:"var(--fnt)",letterSpacing:".08em"}}>{"STEP 2"}</div>
            <div style={{fontSize:"13px",fontWeight:"500",marginTop:"5px"}}>{"Score the opportunity"}</div>
            <div style={{fontSize:"11.5px",color:"var(--fnt)",marginTop:"3px"}}>{"domain authority × prompt overlap"}</div>
          </div>
          <div style={{display:"flex",justifyContent:"center"}}>
            <div style={{width:"1px",height:"14px",background:"var(--brd)"}} />
          </div>
          <div style={{background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"9px",padding:"13px 15px"}}>
            <div style={{fontSize:"10px",fontWeight:"600",color:"var(--fnt)",letterSpacing:".08em"}}>{"STEP 3"}</div>
            <div style={{fontSize:"13px",fontWeight:"500",marginTop:"5px"}}>{"Draft an action, notify the channel"}</div>
            <div style={{fontSize:"11.5px",color:"var(--fnt)",marginTop:"3px"}}>{"action queue + #aeo-alerts (Slack)"}</div>
          </div>
          <ToastButton message="Adding a step needs a live workspace — this demo is read-only." style={{display:"flex",justifyContent:"center",color:"var(--fnt)",fontSize:"11.5px",padding:"2px 0",background:"none",border:"none",fontFamily:"inherit",cursor:"pointer"}}>{"+ add step"}</ToastButton>
          <div style={{marginTop:"auto",display:"flex",gap:"8px"}}>
            <ToastButton message="Workflow edits save on live workspaces — this demo is read-only." className="btn-ac" style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:"500",borderRadius:"7px",padding:"9px 0",border:"none",fontFamily:"inherit",cursor:"pointer"}}>{"Save workflow"}</ToastButton>
            <ToastButton message="Test runs execute on live workspaces — this demo is read-only." style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:"500",border:"1px solid var(--brd)",borderRadius:"7px",padding:"9px 0",background:"none",color:"var(--tx)",fontFamily:"inherit",cursor:"pointer"}}>{"Run test"}</ToastButton>
          </div>
        </div>
      </div>
    </div>
  );
}
