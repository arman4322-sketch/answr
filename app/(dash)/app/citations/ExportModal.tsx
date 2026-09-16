"use client";

import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import { buildExecutiveCsv, csvBlob } from "@/lib/export/report";
import { windowNote, windowToastSuffix } from "@/lib/export/active-window";
import { useFilters } from "@/lib/filters/context";
import { fmtInt } from "@/lib/filters/windows";
import type { LiveMetrics } from "@/lib/live/metrics";
import { citationsReport } from "./reports";
import { exportStem, historyLabel } from "./live";

/* Answers export modal — dialog from canvas frame #m-export, now over live data.

   The preview table shows the real latest sampled answer for each tracked
   prompt (lib/live/metrics → prompts[]), and Export CSV downloads the Citations
   executive report built from the same live metrics (./reports.ts). The
   include-checkboxes really change the payload; Export JSON ships the raw
   sampled rows. With nothing sampled yet the dialog says so and the download
   buttons are disabled rather than producing an empty file that looks real. */

const PREVIEW_ROWS = 3;

/* A tab that exists in the layout but has no implementation behind it: dimmed,
   not focusable, not clickable, and marked disabled to assistive tech. */
const DEAD_TAB: React.CSSProperties = {
  padding: "7px 12px",
  color: "var(--mut)",
  opacity: 0.45,
  cursor: "not-allowed",
  userSelect: "none",
};

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* The two other export formats are not implemented: the sampler stores whole
   answer rows, and no summariser or citations-only projection exists over them.
   Their tabs stay in the row so the shape of the dialog is honest about what is
   planned, but they are inert, dimmed and aria-disabled, and the reason is
   printed under the row rather than hidden in a toast. */
const TAB_NOTE = "Raw answers is the only format the sampler can export — summaries and citations-only views aren't built.";

export default function ExportModal({ m }: { m: LiveMetrics }) {
  const [open, setOpen] = useState(false);
  const [incCitations, setIncCitations] = useState(true);
  const [incCompetitors, setIncCompetitors] = useState(false);
  const { range, platform } = useFilters();
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const csvName = `${exportStem(m, "citations")}.csv`;
  const jsonName = `${exportStem(m, "sampled-answers")}.json`;
  const preview = m.prompts.slice(0, PREVIEW_ROWS);
  const scope = m.hasData
    ? `${fmtInt(m.answersSampled)} answers sampled · ${historyLabel(m.days)} · all platforms`
    : m.configured
      ? "No sample has run yet — start one from Settings › Platforms"
      : "No workspace configured — nothing has been sampled";

  /* The report states the window its rows actually cover; when the topbar
     filter is off-default we append the "not applied" note rather than let the
     file imply a window the live sample does not have. */
  function spec() {
    const base = citationsReport(m, { includeCitations: incCitations, includeCompetitors: incCompetitors });
    const note = windowNote(range, platform);
    return note ? { ...base, windowNote: base.windowNote ? `${base.windowNote} ${note}` : note } : base;
  }

  function exportCsv() {
    const s = spec();
    downloadBlob(csvName, csvBlob(buildExecutiveCsv(s)));
    const dataRows = s.sections.reduce((n, sec) => n + sec.rows.length, 0);
    toast(
      `${csvName} downloaded — ${s.summary?.length ?? 0} summary metrics, ${dataRows} rows across ${s.sections.length} sections.${windowToastSuffix(range, platform)}`
    );
    close();
  }

  function exportJson() {
    downloadBlob(jsonName, new Blob([JSON.stringify(m.prompts, null, 2)], { type: "application/json" }));
    toast(`Downloaded ${jsonName} — ${m.prompts.length} sampled prompt${m.prompts.length === 1 ? "" : "s"}.`);
    close();
  }

  async function copyCsv() {
    try {
      await navigator.clipboard.writeText(buildExecutiveCsv(spec()));
      toast("Copied the Citations report to the clipboard.");
    } catch {
      toast("Couldn't copy — the browser blocked clipboard access.");
    }
  }

  const btnPrimary: React.CSSProperties = {flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:500,borderRadius:"7px",padding:"9px 0",border:"none",cursor:m.hasData?"pointer":"not-allowed",fontFamily:"inherit",opacity:m.hasData?1:.5};
  const btnGhost = (color: string): React.CSSProperties => ({flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:500,color,background:"transparent",border:"1px solid var(--brd)",borderRadius:"7px",padding:"9px 0",cursor:m.hasData?"pointer":"not-allowed",fontFamily:"inherit",opacity:m.hasData?1:.5});

  return (
    <>
      <button
        type="button"
        className="btn-ac"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        style={{fontSize:"12.5px",fontWeight:500,borderRadius:"7px",padding:"6px 14px",border:"none",cursor:"pointer",fontFamily:"inherit"}}
      >
        {"Export"}
      </button>
      {open && (
        <div style={{position:"fixed",inset:"0",zIndex:50,background:"rgba(5,5,8,0.55)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div role="dialog" aria-modal="true" aria-label="Export answers" style={{width:"560px",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"22px",boxShadow:"0 30px 80px rgba(0,0,0,.5)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:"15px",fontWeight:"600"}}>{"Export answers"}</span><button type="button" aria-label="Close" autoFocus onClick={close} style={{color:"var(--fnt)",background:"none",border:"none",padding:0,cursor:"pointer",fontSize:"inherit",fontFamily:"inherit",lineHeight:1}}>{"✕"}</button></div>
            <div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"4px",fontVariantNumeric:"tabular-nums"}}>{scope}</div>
            <div style={{display:"flex",gap:"2px",marginTop:"14px",borderBottom:"1px solid var(--brd)",fontSize:"12.5px"}}>
              <div style={{padding:"7px 12px",color:"var(--tx)",fontWeight:"500",borderBottom:"2px solid var(--ac)"}}>{"Raw answers"}</div>
              <span aria-disabled="true" title={TAB_NOTE} style={DEAD_TAB}>{"Summaries"}</span>
              <span aria-disabled="true" title={TAB_NOTE} style={DEAD_TAB}>{"Citations only"}</span>
            </div>
            <div style={{fontSize:"11px",color:"var(--fnt)",marginTop:"6px",lineHeight:1.5}}>{TAB_NOTE}</div>
            <div style={{border:"1px solid var(--brd)",borderRadius:"8px",overflow:"hidden",marginTop:"12px"}}>
              <div style={{display:"grid",gridTemplateColumns:".8fr 2fr .7fr .6fr",padding:"7px 12px",fontSize:"10px",fontWeight:"500",color:"var(--fnt)",background:"var(--bg2)"}}><span>{"DATE"}</span><span>{"PROMPT"}</span><span>{"MENTIONED"}</span><span>{"POSITION"}</span></div>
              {preview.length === 0 ? (
                <div style={{padding:"14px 12px",fontSize:"11.5px",color:"var(--mut)"}}>{m.configured ? "No sample has run yet — start one from Settings › Platforms." : "No workspace configured yet."}</div>
              ) : (
                preview.map((p, i) => (
                  <div key={`${p.prompt}-${p.ts}`} style={{display:"grid",gridTemplateColumns:".8fr 2fr .7fr .6fr",padding:"8px 12px",fontSize:"11.5px",alignItems:"center",fontVariantNumeric:"tabular-nums",...(i > 0 ? {borderTop:"1px solid var(--brd)"} : {})}}>
                    <span style={{color:"var(--mut)"}}>{new Date(p.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:"8px"}}>{p.prompt}</span>
                    <span style={{color:p.mentioned ? "#4cb782" : "#e5636e"}}>{p.mentioned ? "✓ yes" : "✗ no"}</span>
                    <span>{p.rank == null ? "—" : p.rank}</span>
                  </div>
                ))
              )}
            </div>
            <div style={{display:"flex",gap:"16px",marginTop:"14px",fontSize:"12.5px",alignItems:"center"}}><button type="button" role="checkbox" aria-checked={incCitations} onClick={() => setIncCitations((v) => !v)} style={{display:"flex",alignItems:"center",gap:"7px",background:"none",border:"none",padding:0,fontSize:"12.5px",fontFamily:"inherit",cursor:"pointer",color:incCitations ? "var(--tx)" : "var(--mut)"}}>{incCitations ? <span style={{width:"14px",height:"14px",borderRadius:"4px",background:"var(--ac)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"9px",fontWeight:"700"}}>{"✓"}</span> : <span style={{width:"14px",height:"14px",borderRadius:"4px",border:"1px solid var(--brd)",display:"inline-block"}} />}{"Include citations"}</button><button type="button" role="checkbox" aria-checked={incCompetitors} onClick={() => setIncCompetitors((v) => !v)} style={{display:"flex",alignItems:"center",gap:"7px",background:"none",border:"none",padding:0,fontSize:"12.5px",fontFamily:"inherit",cursor:"pointer",color:incCompetitors ? "var(--tx)" : "var(--mut)"}}>{incCompetitors ? <span style={{width:"14px",height:"14px",borderRadius:"4px",background:"var(--ac)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"9px",fontWeight:"700"}}>{"✓"}</span> : <span style={{width:"14px",height:"14px",borderRadius:"4px",border:"1px solid var(--brd)",display:"inline-block"}} />}{"Include competitor mentions"}</button></div>
            <div style={{display:"flex",gap:"8px",marginTop:"18px"}}>
              <button type="button" className="btn-ac" onClick={exportCsv} disabled={!m.hasData} style={btnPrimary}>{"Export CSV"}</button>
              <button type="button" onClick={exportJson} disabled={!m.hasData} style={btnGhost("var(--tx)")}>{"Export JSON"}</button>
              <button type="button" onClick={copyCsv} disabled={!m.hasData} style={btnGhost("var(--mut)")}>{"Copy"}</button>
            </div>
            {!m.hasData && (
              <div style={{marginTop:"12px",fontSize:"11.5px",color:"var(--fnt)",lineHeight:1.5}}>
                {"Nothing to export yet — downloads unlock once the sampler has collected its first answers."}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
