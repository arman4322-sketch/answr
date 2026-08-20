"use client";

import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import { buildExecutiveCsv, csvBlob } from "@/lib/export/report";
import { withWindowNote, windowToastSuffix } from "@/lib/export/active-window";
import { useFilters } from "@/lib/filters/context";
import { citationsReport } from "./reports";

/* Answers export modal — dialog from canvas frame #m-export (the frame's page
   ground is the real Citations route behind it). Renders the Topbar Export
   control (same look as the shared Topbar button) + the fixed overlay dialog.
   Closed by ✕ / Esc.

   Export CSV downloads the Citations module's full executive report (see
   ./reports.ts): the four KPIs with plain-English reads, the source mix, the
   cited-domain league table, the most-cited pages and this dialog's raw-answer
   preview. The include-checkboxes really change the payload. Export JSON stays
   the raw answer rows (that is what JSON is for here), Copy puts the same
   executive CSV on the clipboard, and the format tabs toast the honest demo
   line. */

const PREVIEW_ROWS: { date: string; prompt: string; mentioned: string; position: string }[] = [
  { date: "Aug 2", prompt: "best running shoes for…", mentioned: "yes", position: "1" },
  { date: "Aug 2", prompt: "alternatives to carbon-plate…", mentioned: "no", position: "—" },
  { date: "Aug 1", prompt: "nike vs adidas running shoes", mentioned: "yes", position: "1" },
];

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const CSV_FILENAME = "nike-citations-30d.csv";
const JSON_FILENAME = "nike-answers-30d.json";

const TAB_NOTE = "The demo previews the raw-answers format — other formats export on live workspaces.";

export default function ExportModal() {
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

  /* The dialog's scope line says "Last 30 days · all platforms" and the report
     is that fixed sample — so when the workspace filter is elsewhere, the CSV
     header carries the "not applied" note rather than shipping mislabeled. */
  function spec() {
    return withWindowNote(
      citationsReport({ includeCitations: incCitations, includeCompetitors: incCompetitors }),
      range,
      platform
    );
  }

  function buildCsv() {
    return buildExecutiveCsv(spec());
  }

  function exportCsv() {
    const s = spec();
    downloadBlob(CSV_FILENAME, csvBlob(buildExecutiveCsv(s)));
    const dataRows = s.sections.reduce((n, sec) => n + sec.rows.length, 0);
    toast(
      `${CSV_FILENAME} downloaded — ${s.summary?.length ?? 0} summary metrics, ${dataRows} rows across ${s.sections.length} sections.${windowToastSuffix(range, platform)}`
    );
    close();
  }

  function exportJson() {
    downloadBlob(JSON_FILENAME, new Blob([JSON.stringify(PREVIEW_ROWS, null, 2)], { type: "application/json" }));
    toast(`Downloaded ${JSON_FILENAME} — ${PREVIEW_ROWS.length} answers.`);
    close();
  }

  async function copyCsv() {
    try {
      await navigator.clipboard.writeText(buildCsv());
      toast("Copied the Citations report to the clipboard.");
    } catch {
      toast("Couldn't copy — the browser blocked clipboard access.");
    }
  }

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
          <div role="dialog" aria-modal="true" aria-label="Export answers" style={{width:"560px",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"22px",boxShadow:"0 30px 80px rgba(0,0,0,.5)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:"15px",fontWeight:"600"}}>{"Export answers"}</span><button type="button" aria-label="Close" autoFocus onClick={close} style={{color:"var(--fnt)",background:"none",border:"none",padding:0,cursor:"pointer",fontSize:"inherit",fontFamily:"inherit",lineHeight:1}}>{"✕"}</button></div><div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"4px",fontVariantNumeric:"tabular-nums"}}>{"1,306 answers in scope · Last 30 days · all platforms"}</div><div style={{display:"flex",gap:"2px",marginTop:"14px",borderBottom:"1px solid var(--brd)",fontSize:"12.5px"}}><div style={{padding:"7px 12px",color:"var(--tx)",fontWeight:"500",borderBottom:"2px solid var(--ac)"}}>{"Raw answers"}</div><button type="button" onClick={() => toast(TAB_NOTE)} style={{padding:"7px 12px",color:"var(--mut)",background:"none",border:"none",fontSize:"12.5px",fontFamily:"inherit",cursor:"pointer"}}>{"Summaries"}</button><button type="button" onClick={() => toast(TAB_NOTE)} style={{padding:"7px 12px",color:"var(--mut)",background:"none",border:"none",fontSize:"12.5px",fontFamily:"inherit",cursor:"pointer"}}>{"Citations only"}</button></div><div style={{border:"1px solid var(--brd)",borderRadius:"8px",overflow:"hidden",marginTop:"12px"}}><div style={{display:"grid",gridTemplateColumns:".8fr 2fr .7fr .6fr",padding:"7px 12px",fontSize:"10px",fontWeight:"500",color:"var(--fnt)",background:"var(--bg2)"}}><span>{"DATE"}</span><span>{"PROMPT"}</span><span>{"MENTIONED"}</span><span>{"POSITION"}</span></div><div style={{display:"grid",gridTemplateColumns:".8fr 2fr .7fr .6fr",padding:"8px 12px",fontSize:"11.5px",alignItems:"center",fontVariantNumeric:"tabular-nums"}}><span style={{color:"var(--mut)"}}>{"Aug 2"}</span><span>{"best running shoes for…"}</span><span style={{color:"#4cb782"}}>{"✓ yes"}</span><span>{"1"}</span></div><div style={{display:"grid",gridTemplateColumns:".8fr 2fr .7fr .6fr",padding:"8px 12px",fontSize:"11.5px",alignItems:"center",borderTop:"1px solid var(--brd)",fontVariantNumeric:"tabular-nums"}}><span style={{color:"var(--mut)"}}>{"Aug 2"}</span><span>{"alternatives to carbon-plate…"}</span><span style={{color:"#e5636e"}}>{"✗ no"}</span><span>{"—"}</span></div><div style={{display:"grid",gridTemplateColumns:".8fr 2fr .7fr .6fr",padding:"8px 12px",fontSize:"11.5px",alignItems:"center",borderTop:"1px solid var(--brd)",fontVariantNumeric:"tabular-nums"}}><span style={{color:"var(--mut)"}}>{"Aug 1"}</span><span>{"nike vs adidas running shoes"}</span><span style={{color:"#4cb782"}}>{"✓ yes"}</span><span>{"1"}</span></div></div><div style={{display:"flex",gap:"16px",marginTop:"14px",fontSize:"12.5px",alignItems:"center"}}><button type="button" role="checkbox" aria-checked={incCitations} onClick={() => setIncCitations((v) => !v)} style={{display:"flex",alignItems:"center",gap:"7px",background:"none",border:"none",padding:0,fontSize:"12.5px",fontFamily:"inherit",cursor:"pointer",color:incCitations ? "var(--tx)" : "var(--mut)"}}>{incCitations ? <span style={{width:"14px",height:"14px",borderRadius:"4px",background:"var(--ac)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"9px",fontWeight:"700"}}>{"✓"}</span> : <span style={{width:"14px",height:"14px",borderRadius:"4px",border:"1px solid var(--brd)",display:"inline-block"}} />}{"Include citations"}</button><button type="button" role="checkbox" aria-checked={incCompetitors} onClick={() => setIncCompetitors((v) => !v)} style={{display:"flex",alignItems:"center",gap:"7px",background:"none",border:"none",padding:0,fontSize:"12.5px",fontFamily:"inherit",cursor:"pointer",color:incCompetitors ? "var(--tx)" : "var(--mut)"}}>{incCompetitors ? <span style={{width:"14px",height:"14px",borderRadius:"4px",background:"var(--ac)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"9px",fontWeight:"700"}}>{"✓"}</span> : <span style={{width:"14px",height:"14px",borderRadius:"4px",border:"1px solid var(--brd)",display:"inline-block"}} />}{"Include competitor mentions"}</button></div><div style={{display:"flex",gap:"8px",marginTop:"18px"}}><button type="button" className="btn-ac" onClick={exportCsv} style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:500,borderRadius:"7px",padding:"9px 0",border:"none",cursor:"pointer",fontFamily:"inherit"}}>{"Export CSV"}</button><button type="button" onClick={exportJson} style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:500,color:"var(--tx)",background:"transparent",border:"1px solid var(--brd)",borderRadius:"7px",padding:"9px 0",cursor:"pointer",fontFamily:"inherit"}}>{"Export JSON"}</button><button type="button" onClick={copyCsv} style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:500,color:"var(--mut)",background:"transparent",border:"1px solid var(--brd)",borderRadius:"7px",padding:"9px 0",cursor:"pointer",fontFamily:"inherit"}}>{"Copy"}</button></div><div style={{marginTop:"12px",display:"flex",alignItems:"center",gap:"8px",background:"rgba(76,183,130,0.08)",border:"1px solid rgba(76,183,130,.3)",borderRadius:"7px",padding:"8px 12px",fontSize:"11.5px",color:"var(--mut)"}}><span style={{color:"#4cb782"}}>{"✓"}</span>{"Last export ready — answers-jul-2026.csv (1.2 MB)"}</div></div>
        </div>
      )}
    </>
  );
}
