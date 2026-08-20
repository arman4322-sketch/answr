"use client";

import { useState } from "react";
import Hint from "@/components/ui/Hint";
import { METRICS } from "@/lib/metrics";
import { PLATFORM_ANSWERS, SELECTED_PROMPT, platformById, type PlatformId } from "@/lib/data/prompts";
import RunHistoryModal from "./RunHistoryModal";
import CreateActionModal from "./CreateActionModal";

/* Prompt detail panel — frame #prompts' right rail, now live.

   The four platform tabs are real: selecting one swaps the answer text, its
   citation chips, the sparkline and all four metrics (mention rate + delta,
   average position, sentiment, competitors mentioned). That variation IS the
   product — the same question gets a different answer, a different brand order
   and different sources on every engine. The ChatGPT tab is the frame's
   painted answer, untouched; the other three are authored in
   lib/data/prompts.ts, where the platform weighting that keeps the row's
   78% / 1.4 true is documented.

   "View all runs" opens the 14-run history sheet, "Create action" opens the
   prefilled action draft. */

const TAB_ACTIVE = { color:"#fff",background:"var(--ac)",borderRadius:"6px 6px 0 0",padding:"7px 12px",fontWeight:600,border:"none",fontSize:"11.5px",fontVariantNumeric:"tabular-nums",fontFamily:"inherit",cursor:"pointer"} as const;
const TAB_IDLE = { color:"var(--mut)",padding:"7px 12px",background:"none",border:"none",fontSize:"11.5px",fontWeight:500,fontVariantNumeric:"tabular-nums",fontFamily:"inherit",cursor:"pointer"} as const;

const ROW_LABEL = { color:"var(--fnt)",display:"inline-flex",alignItems:"center",gap:"6px" } as const;
const ROW_VALUE = { fontSize:"12px",fontWeight:"500",fontVariantNumeric:"tabular-nums" } as const;

export default function PromptDetail({ onClose }: { onClose: () => void }) {
  const [platformId, setPlatformId] = useState<PlatformId>("chatgpt");
  const [runsOpen, setRunsOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const p = platformById(platformId);

  return (
    <div style={{width:"420px",flex:"none",display:"flex",flexDirection:"column",background:"var(--bg1)"}}>
      <div style={{padding:"18px 20px",borderBottom:"1px solid var(--brd)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"12px"}}>
          <div style={{fontSize:"14.5px",fontWeight:"600",lineHeight:"1.4"}}>{SELECTED_PROMPT.text}</div>
          <button type="button" aria-label="Close detail panel" onClick={onClose} style={{color:"var(--fnt)",fontSize:"14px",cursor:"pointer",background:"none",border:"none",padding:0,fontFamily:"inherit",lineHeight:1}}>{"✕"}</button>
        </div>
        <div style={{display:"flex",gap:"6px",marginTop:"10px",alignItems:"center"}}>
          <span style={{fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"#7fa7d9",border:"1px solid rgba(127,167,217,.35)",borderRadius:"4px",padding:"2px 6px"}}>{SELECTED_PROMPT.intent}</span>
          <Hint text="Why someone asks: to buy, to learn, or to compare" size={12} />
          <span style={{fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)",background:"var(--bg2)",borderRadius:"4px",padding:"2px 6px"}}>{SELECTED_PROMPT.volume}</span>
          <Hint text={METRICS.demand_volume.plain} size={12} />
        </div>
      </div>

      <div style={{display:"flex",gap:"2px",padding:"12px 20px 0",fontSize:"11.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",alignItems:"center"}}>
        {PLATFORM_ANSWERS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={tab.id === platformId}
            onClick={() => setPlatformId(tab.id)}
            style={tab.id === platformId ? TAB_ACTIVE : TAB_IDLE}
          >
            {tab.label}
          </button>
        ))}
        <span style={{marginLeft:"auto",display:"inline-flex"}}><Hint text="Each engine answers the same question differently" align="right" size={12} /></span>
      </div>

      {/* the frame painted the first tab active, so the card's top-left corner is
          square where that tab sits on it; other tabs get an all-round radius. */}
      <div style={{margin:"0 20px",border:"1px solid var(--brd)",borderRadius:platformId === PLATFORM_ANSWERS[0].id ? "0 8px 8px 8px" : "8px",background:"var(--bg0)",padding:"16px",fontSize:"12.5px",lineHeight:"1.65",color:"var(--mut)"}}>
        {p.segments.map((seg, i) =>
          seg.highlight ? (
            <span key={i} style={{background:"color-mix(in oklab,var(--ac) 22%,transparent)",color:"var(--tx)",borderRadius:"3px",padding:"1px 3px"}}>{seg.text}</span>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
        <div style={{display:"flex",gap:"5px",marginTop:"12px",flexWrap:"wrap"}}>
          {p.citations.map((c) => (
            <span key={c} style={{fontSize:"10px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)",border:"1px solid var(--brd)",borderRadius:"4px",padding:"3px 7px"}}>{c}</span>
          ))}
        </div>
      </div>

      <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:"10px"}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"12.5px"}}>
          <span style={ROW_LABEL}>{"Mention rate · 30d"}<Hint text={METRICS.visibility_score.plain} size={12} /></span>
          <span style={ROW_VALUE}>{`${p.mentionRate} `}<span style={{color:p.mentionDeltaColor}}>{p.mentionDelta}</span></span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"12.5px"}}>
          <span style={ROW_LABEL}>{"Avg. position in answer"}<Hint text={METRICS.avg_answer_position.plain} size={12} /></span>
          <span style={ROW_VALUE}>{p.avgPosition}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"12.5px"}}>
          <span style={ROW_LABEL}>{"Sentiment"}<Hint text={METRICS.sentiment_mix.plain} size={12} /></span>
          <span style={{...ROW_VALUE,color:p.sentimentColor}}>{p.sentiment}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"12.5px"}}>
          <span style={ROW_LABEL}>{"Competitors mentioned"}<Hint text="Rival brands named in the same answer" size={12} /></span>
          <span style={ROW_VALUE}>{p.competitors}</span>
        </div>
        <svg width="100%" height="54" viewBox="0 0 380 54" preserveAspectRatio="none" style={{marginTop:"4px"}} aria-label={`${p.label} mention-rate trend`}><line stroke="rgba(255,255,255,0.065)" /><path d={p.sparkPath} fill="none" stroke="var(--ac)" strokeWidth="1.25" /></svg>
        <div style={{fontSize:"10px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)",display:"flex",justifyContent:"space-between"}}><span>{"Jul 5"}</span><span>{"Aug 2"}</span></div>
      </div>

      <div style={{marginTop:"auto",padding:"16px 20px",borderTop:"1px solid var(--brd)",display:"flex",gap:"8px"}}>
        <button type="button" className="btn-ac" aria-haspopup="dialog" onClick={() => setRunsOpen(true)} style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:600,borderRadius:"7px",padding:"8px 0",border:"none",cursor:"pointer",fontFamily:"inherit"}}>{"View all runs"}</button>
        <button type="button" aria-haspopup="dialog" onClick={() => setActionOpen(true)} style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:500,color:"var(--tx)",background:"transparent",border:"1px solid var(--brd)",borderRadius:"7px",padding:"8px 0",cursor:"pointer",fontFamily:"inherit"}}>{"Create action"}</button>
      </div>

      {runsOpen && <RunHistoryModal platform={p} onPlatformChange={setPlatformId} onClose={() => setRunsOpen(false)} />}
      {actionOpen && <CreateActionModal platform={p} onClose={() => setActionOpen(false)} />}
    </div>
  );
}
