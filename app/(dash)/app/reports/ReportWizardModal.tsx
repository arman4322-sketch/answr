"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "@/lib/toast";
import { WIZARD_EVENT } from "./ReportsControls";

/* MISC — Report request wizard — converted from canvas frame #m-wizard.
   Renders the Reports page's "Request a concierge report →" trigger (the canvas
   anchor pointed at #m-wizard) plus the modal itself. Closes via ✕, Esc, or a
   click on the dimmed backdrop (the frame has no Cancel button).
   Deviation: the frame dims only the content region behind the dialog; here the
   overlay is fixed over the whole viewport, as the modal floats over the live
   Reports page rather than a mock.
   Button-activation pass (INTERACTIVITY_CONVENTIONS):
   - also opens on the topbar "+ New report" (WIZARD_EVENT), playbook 3's
     "open the designed modal instead of toasting"
   - "Include" chips are real toggles (playbook 4's trivial-toggle exception)
   - Cadence / Delivery are real select dropdowns (playbook 2)
   - "Request build" validates the goal, then submits with a success toast
     (playbook 9) and closes
   - the "self-serve builder" link closes the modal and focuses the builder's Name
     field — the self-serve builder is the card behind this dialog. */

const INCLUDE_ITEMS = ["Visibility", "Share of voice", "Citations", "AI referrals", "Sentiment", "Demand"];

const CADENCE_ITEMS = ["Weekly", "Monthly", "Quarterly", "One-off"];
const DELIVERY_ITEMS = ["Email + in-app", "Email only", "In-app only", "Shared link"];

function WizardSelect({
  label,
  value,
  items,
  onChange,
}: {
  label: string;
  value: string;
  items: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} style={{position:"relative",marginTop:"6px"}}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{display:"block",width:"100%",boxSizing:"border-box",textAlign:"left",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",padding:"8px 12px",fontSize:"12px",color:"var(--mut)",fontFamily:"inherit",cursor:"pointer"}}
      >
        {value + " ▾"}
      </button>
      {open && (
        <div
          role="menu"
          style={{position:"absolute",top:"calc(100% + 6px)",left:0,minWidth:"100%",whiteSpace:"nowrap",background:"var(--bg2)",border:"1px solid var(--brd)",borderRadius:"9px",boxShadow:"0 18px 48px rgba(0,0,0,.55)",padding:"5px",zIndex:60}}
        >
          {items.map((it) => (
            <button
              key={it}
              type="button"
              role="menuitemradio"
              aria-checked={value === it}
              className="dd-item"
              onClick={() => {
                onChange(it);
                setOpen(false);
              }}
              style={{display:"flex",width:"100%",alignItems:"center",justifyContent:"space-between",gap:"10px",padding:"7px 10px",borderRadius:"6px",border:"none",background:"transparent",color:value === it ? "var(--tx)" : "var(--mut)",fontSize:"12.5px",fontFamily:"inherit",cursor:"pointer",textAlign:"left"}}
            >
              {it}
              {value === it && <span style={{color:"var(--ac)",fontSize:"11px"}}>{"✓"}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReportWizardModal() {
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState(
    "Board-ready quarterly summary: are we winning AI answers vs Adidas, and is it turning into sales?"
  );
  const [include, setInclude] = useState<boolean[]>([true, true, true, true, false, false]);
  const [cadence, setCadence] = useState("Quarterly");
  const [delivery, setDelivery] = useState("Email + in-app");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const onAsk = () => setOpen(true);
    window.addEventListener(WIZARD_EVENT, onAsk);
    return () => window.removeEventListener(WIZARD_EVENT, onAsk);
  }, []);

  function requestBuild() {
    if (!goal.trim()) {
      toast("Tell us what the report should answer first.");
      return;
    }
    const chosen = INCLUDE_ITEMS.filter((_, i) => include[i]);
    if (chosen.length === 0) {
      toast("Pick at least one metric to include.");
      return;
    }
    setOpen(false);
    toast(`Demo only — nothing was sent. On a live workspace this requests a ${cadence.toLowerCase()} report (${chosen.length} metrics) from the Answr team.`);
  }

  return (
    <>
      <button
        type="button"
        className="wiz-trigger"
        onClick={() => setOpen(true)}
        style={{background:"none",border:"none",padding:"0",font:"inherit",color:"var(--ac)",cursor:"pointer"}}
      >
        {"Request a concierge report →"}
      </button>
      {open && (
        <div
          className="frame-m-wizard"
          role="dialog"
          aria-modal="true"
          aria-label="Request a custom report"
          onClick={() => setOpen(false)}
          style={{position:"fixed",inset:"0",zIndex:"50",background:"rgba(5,5,8,0.55)",display:"flex",alignItems:"center",justifyContent:"center"}}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{width:"540px",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"22px",boxShadow:"0 30px 80px rgba(0,0,0,.5)",textAlign:"left"}}
          >
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:"15px",fontWeight:"600"}}>{"Request a custom report"}</span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                style={{color:"var(--fnt)",background:"none",border:"none",padding:"0",font:"inherit",cursor:"pointer"}}
              >
                {"✕"}
              </button>
            </div>
            <div style={{display:"flex",gap:"6px",marginTop:"12px",fontSize:"11px",fontWeight:"500"}}>
              <span style={{color:"#fff",background:"var(--ac)",borderRadius:"5px",padding:"4px 10px"}}>{"1 · Goal"}</span>
              <span style={{color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"5px",padding:"4px 10px"}}>{"2 · Metrics"}</span>
              <span style={{color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"5px",padding:"4px 10px"}}>{"3 · Delivery"}</span>
            </div>
            <label htmlFor="wizard-goal" style={{display:"block",fontSize:"12px",fontWeight:"500",marginTop:"16px"}}>{"What should this report answer?"}</label>
            <textarea
              id="wizard-goal"
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              style={{display:"block",width:"100%",boxSizing:"border-box",resize:"vertical",marginTop:"7px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",padding:"11px 13px",fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.6",fontFamily:"inherit"}}
            />
            <div style={{fontSize:"12px",fontWeight:"500",marginTop:"14px"}}>{"Include"}</div>
            <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginTop:"8px"}}>
              {INCLUDE_ITEMS.map((item, i) => {
                const on = include[i];
                return (
                  <button
                    key={item}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    aria-label={on ? `Remove ${item}` : `Include ${item}`}
                    onClick={() => setInclude((s) => s.map((v, j) => (j === i ? !v : v)))}
                    style={
                      on
                        ? {fontSize:"11.5px",fontWeight:"500",color:"#b3a7f8",background:"rgba(142,124,242,0.16)",border:"none",borderRadius:"5px",padding:"4px 10px",fontFamily:"inherit",cursor:"pointer"}
                        : {fontSize:"11.5px",fontWeight:"400",color:"var(--mut)",background:"none",border:"1px solid var(--brd)",borderRadius:"5px",padding:"4px 10px",fontFamily:"inherit",cursor:"pointer"}
                    }
                  >
                    {on ? `${item} ✓` : item}
                  </button>
                );
              })}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginTop:"14px"}}>
              <div>
                <div style={{fontSize:"12px",fontWeight:"500"}}>{"Cadence"}</div>
                <WizardSelect label="Report cadence" value={cadence} items={CADENCE_ITEMS} onChange={setCadence} />
              </div>
              <div>
                <div style={{fontSize:"12px",fontWeight:"500"}}>{"Delivery"}</div>
                <WizardSelect label="Report delivery" value={delivery} items={DELIVERY_ITEMS} onChange={setDelivery} />
              </div>
            </div>
            <button type="button" className="btn-ac" onClick={requestBuild} style={{display:"block",width:"100%",textAlign:"center",fontSize:"13px",fontWeight:"500",borderRadius:"7px",padding:"10px 0",marginTop:"18px",border:"none",fontFamily:"inherit",cursor:"pointer"}}>{"Request build"}</button>
            <div style={{fontSize:"11px",color:"var(--fnt)",marginTop:"10px",textAlign:"center",lineHeight:"1.5"}}>{"On a live workspace, a designer scopes this within 2 business days · or use the "}<button type="button" className="wiz-trigger" onClick={() => { setOpen(false); document.getElementById("report-name")?.focus(); }} style={{color:"var(--ac)",background:"none",border:"none",padding:"0",font:"inherit",cursor:"pointer"}}>{"self-serve builder"}</button></div>
          </div>
        </div>
      )}
    </>
  );
}
