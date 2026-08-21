"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "@/lib/toast";

/* Onboarding step 3 — the generated prompt set (client), real local state:
   - every topic row is an include/exclude toggle ("You can edit these any time")
   - "+ 2 more topics" really expands the remaining two topics
   - the summary card recounts prompts and topics from what's included
   The five topics and their counts match the workspace fixture used by the
   dashboard (lib/data/insights.ts), and still total the frame's 412 / 5 topics.
   Row styles are the frame's, verbatim. */

type Topic = { name: string; prompts: number };

const topics: Topic[] = [
  { name: "Running shoes", prompts: 132 },
  { name: "Training apparel", prompts: 108 },
  { name: "Sneaker releases", prompts: 84 },
  { name: "Sustainability", prompts: 48 },
  { name: "Basketball gear", prompts: 40 },
];

const HIDDEN_FROM = 3; // rows 4–5 sit behind "+ 2 more topics"

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  background: "var(--bg0)",
  border: "1px solid var(--brd)",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "13px",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
  color: "var(--tx)",
  textAlign: "left",
  cursor: "pointer",
};

const countStyle: React.CSSProperties = {
  fontSize: "11.5px",
  fontWeight: "400",
  fontVariantNumeric: "tabular-nums",
  color: "var(--fnt)",
};

export default function PromptSet() {
  const [included, setIncluded] = useState<boolean[]>(topics.map(() => true));
  const [expanded, setExpanded] = useState(false);

  const chosen = topics.filter((_, i) => included[i]);
  const promptTotal = chosen.reduce((sum, t) => sum + t.prompts, 0);
  const hiddenTotal = topics
    .slice(HIDDEN_FROM)
    .reduce((sum, t, i) => (included[HIDDEN_FROM + i] ? sum + t.prompts : sum), 0);
  const shown = expanded ? topics.length : HIDDEN_FROM;

  function toggle(i: number) {
    setIncluded((list) => list.map((v, j) => (j === i ? !v : v)));
  }

  return (
    <>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"14px 16px",marginTop:"20px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:"2px"}}>
          <span style={{fontSize:"22px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{String(promptTotal)}</span>
          <span style={{fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>{`prompts across ${chosen.length} ${chosen.length === 1 ? "topic" : "topics"}`}</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"2px",textAlign:"right"}}>
          <span style={{fontSize:"22px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"5"}</span>
          <span style={{fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>{"platforms monitored"}</span>
        </div>
      </div>
      <div style={{fontSize:"11px",color:"var(--fnt)",marginTop:"10px",lineHeight:"1.55"}}>{"All 5 platforms on by default — ChatGPT, Perplexity, Google AI Overviews, Claude, Gemini. Change anytime in Settings."}</div>
      <div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"14px"}}>
        {topics.slice(0, shown).map((t, i) => (
          <button
            key={t.name}
            type="button"
            aria-pressed={included[i]}
            onClick={() => toggle(i)}
            style={included[i] ? rowStyle : {...rowStyle,opacity:"0.5"}}
          >
            <span style={included[i] ? undefined : {textDecoration:"line-through"}}>{t.name}</span>
            <span style={countStyle}>{`${t.prompts} prompts`}</span>
          </button>
        ))}
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          style={{...rowStyle,color:"var(--mut)"}}
        >
          <span>{expanded ? "− Hide 2 topics" : "+ 2 more topics"}</span>
          <span style={countStyle}>{`${hiddenTotal} prompts`}</span>
        </button>
        {chosen.length === 0 && (
          <div role="alert" style={{fontSize:"11.5px",color:"var(--bad)",lineHeight:"1.55",marginTop:"2px"}}>{"Keep at least one topic — monitoring needs prompts to run."}</div>
        )}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"24px"}}>
        <Link href="/onboarding/competitors" style={{fontSize:"13px",color:"var(--fnt)"}}>{"← Back"}</Link>
        {chosen.length === 0 ? (
          <button
            type="button"
            className="btn-ac"
            onClick={() => toast("Keep at least one topic — monitoring needs prompts to run.")}
            style={{display:"inline-block",fontSize:"13px",fontWeight:"600",borderRadius:"8px",padding:"10px 22px",border:"none",cursor:"pointer",fontFamily:"inherit"}}
          >{"Start monitoring"}</button>
        ) : (
          <Link href="/app/welcome" className="btn-ac" style={{display:"inline-block",fontSize:"13px",fontWeight:"600",borderRadius:"8px",padding:"10px 22px"}}>{"Start monitoring"}</Link>
        )}
      </div>
    </>
  );
}
