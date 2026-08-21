"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "@/lib/toast";
import Hint from "@/components/ui/Hint";
import { METRICS } from "@/lib/metrics";
import { PROMPT_ROWS, PROMPT_CSV_HEADER, promptRowToCsv, downloadCsv } from "./Controls";
import PromptDetail from "./PromptDetail";

/* Prompts body — table + bulk bar + detail panel from frame #prompts, made
   live: real bulk-select checkboxes (header checkbox toggles all, the count
   chip tracks the selection — the frame's "3 selected" is the initial state),
   pagination toasts (playbook 8), the depicted open detail stays (✕ closes it,
   the highlighted row reopens it, other rows toast), and Export selection
   downloads the selected fixture rows as a real CSV.

   Column headers carry plain-language hints (Intent / Volume / Visibility /
   Position); the panel itself lives in PromptDetail.tsx. */

const PAGE_NOTE = "The demo ships the first page of fixture rows — full history lives on live workspaces.";
const DETAIL_NOTE = "The demo ships one worked prompt detail — other prompts open on live workspaces.";

const INTENT_STYLE = {
  COMMERCIAL: { color: "#7fa7d9", border: "1px solid rgba(127,167,217,.35)" },
  INFORMATIONAL: { color: "#b98ed9", border: "1px solid rgba(185,142,217,.35)" },
  BRANDED: { color: "#d9b679", border: "1px solid rgba(217,182,121,.35)" },
} as const;

/* header cell that carries a hint dot — keeps the header's own type styles */
const HEAD = { display: "inline-flex", alignItems: "center", gap: "6px" } as const;

function Checkbox({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      style={
        checked
          ? {width:"14px",height:"14px",flex:"none",borderRadius:"4px",background:"var(--ac)",border:"none",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"9px",fontWeight:700,padding:0,cursor:"pointer",fontFamily:"inherit"}
          : {width:"14px",height:"14px",flex:"none",borderRadius:"4px",background:"transparent",border:"1px solid var(--brd)",display:"inline-block",padding:0,cursor:"pointer",fontFamily:"inherit"}
      }
    >
      {checked ? "✓" : ""}
    </button>
  );
}

function PagerButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => toast(PAGE_NOTE)}
      style={{background:"none",border:"none",padding:0,color:"inherit",fontSize:"11.5px",fontWeight:400,fontVariantNumeric:"tabular-nums",fontFamily:"inherit",cursor:"pointer"}}
    >
      {label}
    </button>
  );
}

export default function PromptsBody() {
  const [selected, setSelected] = useState<boolean[]>([true, true, true, false, false, false, false, false]);
  const [panelOpen, setPanelOpen] = useState(true);

  const query = (useSearchParams().get("q") ?? "").trim().toLowerCase();
  // Keep the original index so selection/detail logic stays stable while filtering.
  const visible = PROMPT_ROWS.map((r, i) => ({ r, i })).filter(
    ({ r }) => !query || r.prompt.toLowerCase().includes(query),
  );

  const count = selected.filter(Boolean).length;
  const allSelected = selected.every(Boolean);
  const toggleAll = () => setSelected(PROMPT_ROWS.map(() => !allSelected));
  const toggleAny = () => setSelected(PROMPT_ROWS.map(() => count === 0));
  const toggleRow = (i: number) => setSelected((s) => s.map((v, j) => (j === i ? !v : v)));

  function exportSelection() {
    if (count === 0) {
      toast("Select prompts first — nothing to export.");
      return;
    }
    downloadCsv(
      "nike-prompts-selection-30d.csv",
      [PROMPT_CSV_HEADER, ...PROMPT_ROWS.filter((_, i) => selected[i]).map(promptRowToCsv)],
      "Selected prompts"
    );
  }

  return (
    <div style={{flex:"1",display:"flex",minHeight:"0"}}>
      <div style={{flex:"1",minWidth:"0",borderRight:"1px solid var(--brd)"}}>
        <div style={{display:"grid",gridTemplateColumns:"2.4fr .8fr .7fr .8fr .7fr",padding:"10px 20px",fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",letterSpacing:".12em",textTransform:"uppercase",color:"var(--fnt)",borderBottom:"1px solid var(--brd)"}}>
          <span style={{display:"flex",alignItems:"center",gap:"8px"}}><Checkbox checked={allSelected} onToggle={toggleAll} label="Select all prompts" />{"Prompt"}</span>
          <span style={HEAD}>{"Intent"}<Hint text="Why someone asks: to buy, to learn, or to compare" size={11} /></span>
          <span style={HEAD}>{"Volume"}<Hint text={METRICS.demand_volume.plain} size={11} /></span>
          <span style={HEAD}>{"Visibility"}<Hint text={METRICS.visibility_score.plain} size={11} /></span>
          <span style={HEAD}>{"Position"}<Hint text={METRICS.avg_answer_position.plain} align="right" size={11} /></span>
        </div>
        {visible.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--mut)", fontSize: "13px" }}>
            {`No prompts match “${query}”. Clear the search to see all ${PROMPT_ROWS.length} loaded.`}
          </div>
        )}
        {visible.map(({ r, i }) => (
          <div
            key={r.prompt}
            className="row-hover"
            onClick={() => (i === 0 ? setPanelOpen(true) : toast(DETAIL_NOTE))}
            style={{display:"grid",gridTemplateColumns:"2.4fr .8fr .7fr .8fr .7fr",alignItems:"center",padding:"13px 20px",fontSize:"13px",cursor:"pointer",...(i === 0 ? {background:"color-mix(in oklab,var(--ac) 6%,transparent)",borderLeft:"2px solid var(--ac)"} : {borderTop:"1px solid var(--brd)"})}}
          >
            <span style={{display:"flex",alignItems:"center",gap:"8px",...(i === 0 ? {fontWeight:"500"} : {color:"var(--mut)"})}}>
              <Checkbox checked={selected[i]} onToggle={() => toggleRow(i)} label={`Select "${r.prompt}"`} />
              <span style={{lineHeight:"1.4"}}>{r.prompt}</span>
            </span>
            <span><span style={{fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:INTENT_STYLE[r.intent].color,border:INTENT_STYLE[r.intent].border,borderRadius:"4px",padding:"2px 6px"}}>{r.intent}</span></span>
            <span style={{fontSize:"12.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{r.volume}</span>
            <span style={{fontSize:"12.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{r.visibility}</span>
            <span style={{fontSize:"12.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{r.position}</span>
          </div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderTop:"1px solid var(--brd)",fontSize:"12px",background:"var(--bg1)"}}>
          <Checkbox checked={count > 0} onToggle={toggleAny} label="Toggle selection" />
          <span style={{color:"var(--mut)",fontVariantNumeric:"tabular-nums"}}>{`${count} selected`}</span>
          <button type="button" onClick={() => toast("Topic assignments update on live workspaces.")} style={{marginLeft:"8px",border:"1px solid var(--brd)",borderRadius:"6px",padding:"4px 10px",fontWeight:500,background:"transparent",color:"var(--tx)",fontSize:"12px",fontFamily:"inherit",cursor:"pointer"}}>{"Assign topic"}</button>
          <button type="button" onClick={() => toast("Tag assignments update on live workspaces.")} style={{border:"1px solid var(--brd)",borderRadius:"6px",padding:"4px 10px",fontWeight:500,background:"transparent",color:"var(--tx)",fontSize:"12px",fontFamily:"inherit",cursor:"pointer"}}>{"Assign tag"}</button>
          <button type="button" onClick={() => toast("Archiving prompts applies on live workspaces.")} style={{color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"6px",padding:"4px 10px",background:"transparent",fontSize:"12px",fontWeight:400,fontFamily:"inherit",cursor:"pointer"}}>{"Archive"}</button>
          <button type="button" onClick={exportSelection} style={{marginLeft:"auto",color:"var(--ac)",fontWeight:500,background:"none",border:"none",padding:0,fontSize:"12px",fontFamily:"inherit",cursor:"pointer"}}>{"Export selection"}</button>
        </div>
        <div style={{padding:"14px 20px",borderTop:"1px solid var(--brd)",fontSize:"11.5px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)",display:"flex",justifyContent:"space-between"}}>
          <span>{query ? `Showing ${visible.length} of ${PROMPT_ROWS.length} loaded` : "Showing 8 of 412"}</span>
          <span><PagerButton label="‹" />{" "}<span style={{color:"var(--tx)"}}>{"1"}</span>{" "}<PagerButton label="2" />{" "}<PagerButton label="3" />{" … "}<PagerButton label="52" />{" "}<PagerButton label="›" /></span>
        </div>
      </div>
      {panelOpen && <PromptDetail onClose={() => setPanelOpen(false)} />}
    </div>
  );
}
