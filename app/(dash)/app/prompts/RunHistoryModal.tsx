"use client";

import { useEffect } from "react";
import { toast } from "@/lib/toast";
import { buildExecutiveCsv, csvBlob } from "@/lib/export/report";
import { fmtDateTime, highlightBrand, historyLabel, rankLabel, slugify, statusLabel, type PromptsScreen, type ScreenPromptRow } from "./rows";

/* "View latest run" — the full stored result for one prompt.

   This sheet used to be a 14-row daily run history. Those 14 runs were fixture
   rows (lib/data/prompts): invented dates, invented positions, an invented
   sentiment per run. The live metrics API exposes the LATEST run per prompt,
   not a per-prompt time series, so the sheet now shows what actually exists —
   the full stored excerpt, the engines that answered, the brand's rank, the
   competitors named, and the run's real timestamp — and says plainly how many
   days the workspace has sampled instead of drawing a fortnight that is not
   there. Export writes the same executive envelope every other export uses. */

const OVERLAY = { position: "fixed", inset: "0", zIndex: 50, background: "rgba(5,5,8,0.55)", display: "flex", alignItems: "center", justifyContent: "center" } as const;

const STAT_BOX = { border:"1px solid var(--brd)",borderRadius:"8px",background:"var(--bg0)",padding:"10px 12px" } as const;

export default function RunHistoryModal({
  row,
  screen,
  onClose,
}: {
  row: ScreenPromptRow;
  screen: PromptsScreen;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const status = statusLabel(row);
  const segments = highlightBrand(row.excerpt, screen.brand);

  const stats = [
    { label: "Mentioned", value: row.mentioned ? "Yes" : "No", sub: `${screen.brand || "Brand"} in the latest answers`, valueColor: row.mentioned ? "#4cb782" : "#e5636e" },
    { label: "Rank in answer", value: rankLabel(row), sub: row.rank == null ? "not named" : "1 = named before every rival" },
    { label: "Engines answered", value: String(row.providersAnswered), sub: "returned an answer" },
    { label: "Competitors named", value: String(row.competitorsMentioned.length), sub: row.competitorsMentioned.join(", ") || "none in this answer" },
  ];

  function exportRun() {
    const filename = `${slugify(screen.brand)}-prompt-latest-run.csv`;
    const csv = buildExecutiveCsv({
      module: "Prompt run",
      brand: screen.brand || "Not configured",
      window: `Latest run of one prompt · ${fmtDateTime(row.ts)}`,
      windowNote: `The workspace has ${historyLabel(screen.days)}; the live metrics API reports the latest run per prompt, not a per-prompt series.`,
      summary: [
        { label: "Prompt", value: row.prompt },
        { label: "Mentioned", value: row.mentioned ? "yes" : "no", note: `Did the latest answers name ${screen.brand || "the brand"}?` },
        { label: "Rank in answer", value: rankLabel(row), note: "Average rank of the brand's first mention across the engines that answered." },
        { label: "Engines answered", value: String(row.providersAnswered) },
        { label: "Competitors named", value: row.competitorsMentioned.join(" · ") || "none" },
        { label: "Run timestamp", value: fmtDateTime(row.ts) },
      ],
      sections: [
        {
          title: "Answer excerpt",
          note: "Stored answer text from the first engine that answered this prompt in this run.",
          columns: ["Excerpt"],
          rows: [[row.excerpt || "(no answer text stored)"]],
        },
      ],
      footnotes: [
        `Sampled history for this workspace: ${historyLabel(screen.days)}.`,
        "Metric definitions: METRICS.md, or the ? beside each figure in-app.",
      ],
    });
    const url = URL.createObjectURL(csvBlob(csv));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast(`${filename} downloaded — one run, ${fmtDateTime(row.ts)}.`);
  }

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Latest run for ${row.prompt}`}
        onClick={(e) => e.stopPropagation()}
        style={{width:"640px",maxHeight:"88vh",overflowY:"auto",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"22px",boxShadow:"0 30px 80px rgba(0,0,0,.5)"}}
      >
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"12px"}}>
          <div>
            <div style={{fontSize:"15px",fontWeight:"600"}}>{"Latest run"}</div>
            <div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"4px",lineHeight:"1.5"}}>{`“${row.prompt}” · ${fmtDateTime(row.ts)} · ${status.toLowerCase()}`}</div>
          </div>
          <button type="button" aria-label="Close" autoFocus onClick={onClose} style={{color:"var(--fnt)",background:"none",border:"none",padding:0,cursor:"pointer",fontSize:"14px",fontFamily:"inherit",lineHeight:1}}>{"✕"}</button>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginTop:"14px"}}>
          {stats.map((s) => (
            <div key={s.label} style={STAT_BOX}>
              <div style={{fontSize:"10px",fontWeight:"500",letterSpacing:".08em",textTransform:"uppercase",color:"var(--fnt)"}}>{s.label}</div>
              <div style={{fontSize:"15px",fontWeight:"600",fontVariantNumeric:"tabular-nums",marginTop:"5px",color:s.valueColor ?? "var(--tx)"}}>{s.value}</div>
              <div style={{fontSize:"10.5px",fontVariantNumeric:"tabular-nums",color:"var(--fnt)",marginTop:"2px",lineHeight:1.4}}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{border:"1px solid var(--brd)",borderRadius:"8px",background:"var(--bg0)",padding:"14px",marginTop:"12px",fontSize:"12.5px",lineHeight:"1.65",color:"var(--mut)"}}>
          {segments.length > 0 ? (
            segments.map((seg, i) =>
              seg.hit ? (
                <span key={i} style={{background:"color-mix(in oklab,var(--ac) 22%,transparent)",color:"var(--tx)",borderRadius:"3px",padding:"1px 3px"}}>{seg.text}</span>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )
          ) : (
            <span style={{color:"var(--fnt)"}}>{"No answer text was stored for this run."}</span>
          )}
        </div>

        <div style={{marginTop:"12px",fontSize:"11px",lineHeight:"1.55",color:"var(--fnt)"}}>
          {`This workspace has ${historyLabel(screen.days)} across ${screen.answersSampled} sampled answer${screen.answersSampled === 1 ? "" : "s"}. Day-by-day history for a single prompt isn’t available — the live metrics API reports each prompt’s latest run.`}
        </div>

        <div style={{display:"flex",gap:"8px",marginTop:"16px"}}>
          <button type="button" className="btn-ac" onClick={exportRun} style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:500,borderRadius:"7px",padding:"9px 0",border:"none",cursor:"pointer",fontFamily:"inherit"}}>{"Export this run"}</button>
          <button type="button" onClick={onClose} style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:500,color:"var(--tx)",background:"transparent",border:"1px solid var(--brd)",borderRadius:"7px",padding:"9px 0",cursor:"pointer",fontFamily:"inherit"}}>{"Close"}</button>
        </div>
      </div>
    </div>
  );
}
