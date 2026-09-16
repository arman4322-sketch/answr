"use client";

import { useState } from "react";
import Hint from "@/components/ui/Hint";
import { METRICS } from "@/lib/metrics";
import RunHistoryModal from "./RunHistoryModal";
import CreateActionModal from "./CreateActionModal";
import { fmtDateTime, highlightBrand, historyLabel, rankLabel, statusLabel, type PromptsScreen, type ScreenPromptRow } from "./rows";

/* Prompt detail panel — the right rail, now showing the prompt's real latest
   run: the excerpt the engines actually returned (with real occurrences of the
   tracked brand highlighted), which competitors were named in it, how many
   engines answered, and how early the brand appeared.

   What is deliberately NOT here any more:
   - The four platform tabs. They swapped four authored answers from
     lib/data/prompts; the live API reports one excerpt per prompt (the first
     engine that answered), not an answer per engine, so tabs would have been
     four views of invented text.
   - The mention-rate sparkline and its "↑ 6pt" delta. There is no per-prompt
     time series in the live data, and on a young workspace there is barely any
     history at all — the panel prints the real number of sampled days instead.
   - Sentiment. Nothing in the live pipeline scores sentiment. */

const ROW_LABEL = { color:"var(--fnt)",display:"inline-flex",alignItems:"center",gap:"6px" } as const;
const ROW_VALUE = { fontSize:"12px",fontWeight:"500",fontVariantNumeric:"tabular-nums" } as const;

const STATUS_STYLE = {
  Mentioned: { color: "#4cb782", border: "1px solid rgba(76,183,130,.35)" },
  "Not mentioned": { color: "#e5636e", border: "1px solid rgba(229,99,110,.35)" },
  "Awaiting run": { color: "var(--fnt)", border: "1px dashed var(--brd)" },
} as const;

export default function PromptDetail({
  row,
  screen,
  onClose,
}: {
  row: ScreenPromptRow;
  screen: PromptsScreen;
  onClose: () => void;
}) {
  const [runsOpen, setRunsOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const status = statusLabel(row);
  const segments = highlightBrand(row.excerpt, screen.brand);

  return (
    <div style={{width:"420px",flex:"none",display:"flex",flexDirection:"column",background:"var(--bg1)"}}>
      <div style={{padding:"18px 20px",borderBottom:"1px solid var(--brd)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"12px"}}>
          <div style={{fontSize:"14.5px",fontWeight:"600",lineHeight:"1.4"}}>{row.prompt}</div>
          <button type="button" aria-label="Close detail panel" onClick={onClose} style={{color:"var(--fnt)",fontSize:"14px",cursor:"pointer",background:"none",border:"none",padding:0,fontFamily:"inherit",lineHeight:1}}>{"✕"}</button>
        </div>
        <div style={{display:"flex",gap:"6px",marginTop:"10px",alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:STATUS_STYLE[status].color,border:STATUS_STYLE[status].border,borderRadius:"4px",padding:"2px 6px"}}>{status.toUpperCase()}</span>
          <Hint text={METRICS.visibility_score.plain} size={12} />
          <span style={{fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)",background:"var(--bg2)",borderRadius:"4px",padding:"2px 6px"}}>
            {row.sampled ? `LAST RUN ${fmtDateTime(row.ts)}` : "NOT SAMPLED YET"}
          </span>
        </div>
      </div>

      <div style={{padding:"14px 20px 0",fontSize:"10px",fontWeight:500,letterSpacing:".1em",textTransform:"uppercase",color:"var(--fnt)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"8px"}}>
        <span>{row.sampled ? "Latest answer · excerpt" : "Latest answer"}</span>
        <Hint text="The stored answer text from the first engine that answered this prompt in the latest run" align="right" size={12} />
      </div>

      <div style={{margin:"8px 20px 0",border:"1px solid var(--brd)",borderRadius:"8px",background:"var(--bg0)",padding:"16px",fontSize:"12.5px",lineHeight:"1.65",color:"var(--mut)"}}>
        {row.sampled && segments.length > 0 ? (
          segments.map((seg, i) =>
            seg.hit ? (
              <span key={i} style={{background:"color-mix(in oklab,var(--ac) 22%,transparent)",color:"var(--tx)",borderRadius:"3px",padding:"1px 3px"}}>{seg.text}</span>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )
        ) : (
          <span style={{color:"var(--fnt)"}}>
            {row.sampled
              ? "The stored run for this prompt has no answer text — every engine errored or returned an empty answer."
              : "This prompt hasn’t been sampled yet. Its first answers arrive with the next scheduled run."}
          </span>
        )}
      </div>

      <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:"10px"}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"12.5px"}}>
          <span style={ROW_LABEL}>{"Named in the latest answers"}<Hint text={METRICS.visibility_score.plain} size={12} /></span>
          <span style={ROW_VALUE}>{row.sampled ? (row.mentioned ? `Yes — ${screen.brand}` : "No") : "—"}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"12.5px"}}>
          <span style={ROW_LABEL}>{"Rank in answer"}<Hint text={METRICS.avg_answer_position.plain} size={12} /></span>
          <span style={ROW_VALUE}>{rankLabel(row)}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"12.5px"}}>
          <span style={ROW_LABEL}>{"Engines answered"}<Hint text="How many AI engines returned an answer for this prompt in its latest run" size={12} /></span>
          <span style={ROW_VALUE}>{row.sampled ? row.providersAnswered : "—"}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",gap:"12px",fontSize:"12.5px"}}>
          <span style={ROW_LABEL}>{"Competitors named"}<Hint text="Tracked rival brands found in the same answers" size={12} /></span>
          <span style={{...ROW_VALUE,textAlign:"right"}}>
            {row.sampled ? (row.competitorsMentioned.length ? row.competitorsMentioned.join(", ") : "None") : "—"}
          </span>
        </div>
        <div style={{fontSize:"11px",lineHeight:"1.55",color:"var(--fnt)",marginTop:"2px"}}>
          {row.sampled
            ? `Latest run only — this workspace has ${historyLabel(screen.days)}, so no per-prompt trend is shown.`
            : `This workspace has ${historyLabel(screen.days)}. This prompt joins the next scheduled run.`}
        </div>
      </div>

      <div style={{marginTop:"auto",padding:"16px 20px",borderTop:"1px solid var(--brd)",display:"flex",gap:"8px"}}>
        <button type="button" className="btn-ac" aria-haspopup="dialog" aria-disabled={!row.sampled} onClick={() => (row.sampled ? setRunsOpen(true) : undefined)} style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:600,borderRadius:"7px",padding:"8px 0",border:"none",cursor:row.sampled ? "pointer" : "default",fontFamily:"inherit",opacity:row.sampled ? 1 : 0.5}}>{"View latest run"}</button>
        <button type="button" aria-haspopup="dialog" onClick={() => setActionOpen(true)} style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:500,color:"var(--tx)",background:"transparent",border:"1px solid var(--brd)",borderRadius:"7px",padding:"8px 0",cursor:"pointer",fontFamily:"inherit"}}>{"Create action"}</button>
      </div>

      {runsOpen && <RunHistoryModal row={row} screen={screen} onClose={() => setRunsOpen(false)} />}
      {actionOpen && <CreateActionModal row={row} screen={screen} onClose={() => setActionOpen(false)} />}
    </div>
  );
}
