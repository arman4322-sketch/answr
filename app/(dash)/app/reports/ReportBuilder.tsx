"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "@/lib/toast";
import Hint from "@/components/ui/Hint";
import ReportWizardModal from "./ReportWizardModal";

/* "Build a report" card — the frame's depicted form, made real
   (INTERACTIVITY_CONVENTIONS):
   - Name              → controlled input, feeds the submit confirmation
   - Section checkboxes→ playbook 4's trivial-toggle exception: real local state,
     checked/unchecked styling copied verbatim from the frame's two depicted states
   - Format / Schedule → playbook 2 select-styled dropdowns (FilterPill would
     restyle these boxed selects, so they use the frame's own box styling)
   - Recipients        → the ✕ on each chip really removes it; "+ add" swaps to an
     inline email field (Enter adds, Esc cancels)
   - Generate / Save   → playbook 9: validate, then an inline success confirmation
     plus a toast in the page's voice
   All styles are the frame's, verbatim; only interaction was added. */

const SECTION_LABELS = [
  "Executive summary",
  "Visibility & share-of-voice trends",
  "Competitor benchmark",
  "New citations",
  "Prompt-level detail",
  "Agent traffic",
];

const FORMAT_ITEMS = ["PDF", "CSV", "PDF + CSV attachment", "Google Slides"];

const SCHEDULE_ITEMS = [
  "Daily · 9:00",
  "Weekly · Mon 9:00",
  "Weekly · Fri 16:00",
  "Monthly · 1st 9:00",
  "Manual only",
];

const CHIP_STYLE: React.CSSProperties = {
  fontSize: "11.5px",
  fontWeight: "400",
  fontVariantNumeric: "tabular-nums",
  color: "var(--tx)",
  background: "var(--bg2)",
  border: "1px solid var(--brd)",
  borderRadius: "5px",
  padding: "4px 9px",
};

const ADD_STYLE: React.CSSProperties = {
  fontSize: "11.5px",
  fontWeight: "400",
  fontVariantNumeric: "tabular-nums",
  color: "var(--fnt)",
  border: "1px dashed var(--brd)",
  borderRadius: "5px",
  padding: "4px 9px",
  background: "none",
  fontFamily: "inherit",
  cursor: "pointer",
};

const FIELD_LABEL: React.CSSProperties = {
  fontSize: "10.5px",
  fontWeight: "500",
  fontVariantNumeric: "tabular-nums",
  color: "var(--fnt)",
};

function BoxSelect({
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
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", marginTop: "7px" }}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "block",
          width: "100%",
          boxSizing: "border-box",
          textAlign: "left",
          border: "1px solid var(--brd)",
          borderRadius: "7px",
          background: "var(--bg0)",
          padding: "9px 12px",
          fontSize: "12px",
          fontWeight: "400",
          fontVariantNumeric: "tabular-nums",
          color: "var(--mut)",
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        {value + " ▾"}
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            minWidth: "100%",
            whiteSpace: "nowrap",
            background: "var(--bg2)",
            border: "1px solid var(--brd)",
            borderRadius: "9px",
            boxShadow: "0 18px 48px rgba(0,0,0,.55)",
            padding: "5px",
            zIndex: 50,
          }}
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
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                padding: "7px 10px",
                borderRadius: "6px",
                border: "none",
                background: "transparent",
                color: value === it ? "var(--tx)" : "var(--mut)",
                fontSize: "12.5px",
                fontFamily: "inherit",
                cursor: "pointer",
                textAlign: "left",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {it}
              {value === it && <span style={{ color: "var(--ac)", fontSize: "11px" }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReportBuilder() {
  const [name, setName] = useState("Weekly AEO summary — exec team");
  const [sections, setSections] = useState<boolean[]>([true, true, true, true, false, false]);
  const [format, setFormat] = useState("PDF");
  const [schedule, setSchedule] = useState("Weekly · Mon 9:00");
  const [recipients, setRecipients] = useState(["dana@nike.com", "exec@nike.com"]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const chosen = sections.filter(Boolean).length;

  function addRecipient() {
    const value = draft.trim();
    if (!value) {
      setAdding(false);
      setDraft("");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast("That does not look like an email address — try name@company.com.");
      return;
    }
    if (recipients.includes(value)) {
      toast(`${value} is already on this report.`);
      return;
    }
    setRecipients((r) => [...r, value]);
    setDraft("");
    setAdding(false);
  }

  function generate() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast("Give the report a name first.");
      return;
    }
    if (chosen === 0) {
      toast("Pick at least one section to include.");
      return;
    }
    setConfirmation(
      `✓ ${trimmed} generated — ${chosen} section${chosen === 1 ? "" : "s"} · ${format} · ${recipients.length} recipient${
        recipients.length === 1 ? "" : "s"
      }. The demo workspace builds it from the fixed 30-day fixture.`
    );
    toast(`Generating ${trimmed} — ${chosen} section${chosen === 1 ? "" : "s"} · ${format}.`);
  }

  function saveSchedule() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast("Give the report a name first.");
      return;
    }
    setConfirmation(
      `✓ Schedule saved — ${trimmed}, ${schedule}, to ${recipients.length} recipient${recipients.length === 1 ? "" : "s"}.`
    );
    toast("Saved here only — scheduled delivery runs on live workspaces.");
  }

  return (
    <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"14.5px",fontWeight:"600"}}>{"Build a report"}<Hint text="Pick what goes in and who gets it" /></div>
      <label htmlFor="report-name" style={{display:"block",...FIELD_LABEL,marginTop:"18px"}}>{"Name"}</label>
      <input
        id="report-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{display:"block",width:"100%",boxSizing:"border-box",border:"1px solid var(--brd)",borderRadius:"7px",background:"var(--bg0)",padding:"9px 12px",fontSize:"13px",marginTop:"7px",color:"var(--tx)",fontFamily:"inherit"}}
      />
      <div style={{...FIELD_LABEL,marginTop:"18px"}}>{"Sections"}</div>
      <div style={{display:"flex",flexDirection:"column",gap:"9px",marginTop:"10px",fontSize:"13px"}}>
        {SECTION_LABELS.map((label, i) => {
          const on = sections[i];
          return (
            <div key={label} style={on ? {display:"flex",alignItems:"center",gap:"10px"} : {display:"flex",alignItems:"center",gap:"10px",color:"var(--mut)"}}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                aria-label={on ? `Remove section: ${label}` : `Include section: ${label}`}
                onClick={() => setSections((s) => s.map((v, j) => (j === i ? !v : v)))}
                style={
                  on
                    ? {width:"16px",height:"16px",flex:"none",borderRadius:"4px",background:"var(--ac)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"11px",fontWeight:"700",border:"none",padding:"0",cursor:"pointer",fontFamily:"inherit"}
                    : {width:"16px",height:"16px",flex:"none",borderRadius:"4px",border:"1px solid var(--brd)",background:"var(--bg0)",padding:"0",cursor:"pointer"}
                }
              >
                {on ? "✓" : ""}
              </button>
              {label}
            </div>
          );
        })}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginTop:"18px"}}>
        <div>
          <div style={FIELD_LABEL}>{"Format"}</div>
          <BoxSelect label="Report format" value={format} items={FORMAT_ITEMS} onChange={setFormat} />
        </div>
        <div>
          <div style={FIELD_LABEL}>{"Schedule"}</div>
          <BoxSelect label="Report schedule" value={schedule} items={SCHEDULE_ITEMS} onChange={setSchedule} />
        </div>
      </div>
      <div style={{...FIELD_LABEL,marginTop:"18px"}}>{"Recipients"}</div>
      <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginTop:"8px"}}>
        {recipients.map((r) => (
          <span key={r} style={CHIP_STYLE}>
            {r + " "}
            <button
              type="button"
              aria-label={`Remove ${r}`}
              onClick={() => setRecipients((list) => list.filter((x) => x !== r))}
              style={{background:"none",border:"none",padding:"0",font:"inherit",color:"inherit",cursor:"pointer"}}
            >
              {"✕"}
            </button>
          </span>
        ))}
        {adding ? (
          <input
            autoFocus
            type="email"
            aria-label="New recipient email"
            placeholder="name@company.com"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={addRecipient}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addRecipient();
              }
              if (e.key === "Escape") {
                setDraft("");
                setAdding(false);
              }
            }}
            style={{...ADD_STYLE,color:"var(--tx)",background:"var(--bg0)",cursor:"text",width:"120px",boxSizing:"border-box"}}
          />
        ) : (
          <button type="button" onClick={() => setAdding(true)} style={ADD_STYLE}>{"+ add"}</button>
        )}
      </div>
      <div style={{display:"flex",gap:"10px",marginTop:"22px"}}>
        <button type="button" className="btn-ac" onClick={generate} style={{flex:"1",textAlign:"center",fontSize:"13px",fontWeight:"600",borderRadius:"7px",padding:"10px 0",border:"none",fontFamily:"inherit",cursor:"pointer"}}>{"Generate now"}</button>
        <button type="button" onClick={saveSchedule} style={{flex:"1",textAlign:"center",fontSize:"13px",fontWeight:"500",border:"1px solid var(--brd)",borderRadius:"7px",padding:"10px 0",background:"none",color:"var(--tx)",fontFamily:"inherit",cursor:"pointer"}}>{"Save schedule"}</button>
      </div>
      {confirmation && (
        <div role="status" style={{fontSize:"11.5px",color:"#4cb782",marginTop:"12px",lineHeight:"1.5"}}>{confirmation}</div>
      )}
      <div style={{fontSize:"11.5px",color:"var(--fnt)",marginTop:"12px",textAlign:"center"}}>{"Need something bespoke? "}<ReportWizardModal /></div>
    </div>
  );
}
