"use client";

import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import { fmtDateTime, historyLabel, rankLabel, type PromptsScreen, type ScreenPromptRow } from "./rows";

/* "Create action" → an action drafted from THIS prompt's real latest run.

   The fixture draft is gone (it hard-coded a "+1.6pt" impact estimate, "26
   prompts affected" and queue id #93). Nothing in the live pipeline projects
   the impact of an action, so the impact field starts EMPTY for the user to
   fill — an estimate the product cannot compute is not one we prefill. The
   rationale is assembled only from facts in the run: mentioned or not, rank,
   which competitors were named, how many engines answered, and how many days
   this workspace has actually sampled. Every field stays editable, and
   "Add to queue" posts to /api/actions (the real write path). */

const CATEGORY_STYLE: Record<string, { color: string; border: string }> = {
  CONTENT: { color: "#7fa7d9", border: "1px solid rgba(127,167,217,.35)" },
  TECHNICAL: { color: "#d9b679", border: "1px solid rgba(217,182,121,.35)" },
  AUTHORITY: { color: "#b98ed9", border: "1px solid rgba(185,142,217,.35)" },
};
const CATEGORIES = ["CONTENT", "TECHNICAL", "AUTHORITY"];
const EFFORTS = ["S", "M", "L"];

const FIELD = { width:"100%",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",padding:"8px 10px",fontSize:"12.5px",color:"var(--tx)",fontFamily:"inherit" } as const;
const LABEL = { fontSize:"10px",fontWeight:500,letterSpacing:".08em",textTransform:"uppercase",color:"var(--fnt)",display:"block",marginBottom:"5px" } as const;

function draftTitle(row: ScreenPromptRow, brand: string): string {
  const b = brand || "the brand";
  if (!row.sampled) return `Prepare content for “${row.prompt}”`;
  if (!row.mentioned) return `Win a mention for ${b} on “${row.prompt}”`;
  if (row.rank != null && row.rank > 1) return `Move ${b} earlier in answers to “${row.prompt}”`;
  return `Defend ${b}'s lead on “${row.prompt}”`;
}

/** Rationale assembled from the run's real values — no projections. */
function draftRationale(row: ScreenPromptRow, screen: PromptsScreen): string {
  const b = screen.brand || "The brand";
  if (!row.sampled) {
    return `“${row.prompt}” is tracked but hasn’t been sampled yet, so there is no result to act on. This workspace has ${historyLabel(screen.days)}. Revisit once the prompt has run.`;
  }
  const rivals = row.competitorsMentioned.length ? row.competitorsMentioned.join(", ") : "no tracked competitor";
  const engines = `${row.providersAnswered} engine${row.providersAnswered === 1 ? "" : "s"} answered`;
  const when = fmtDateTime(row.ts);
  if (!row.mentioned) {
    return `In the latest run (${when}), ${engines} “${row.prompt}” and none named ${b}; ${rivals} appeared instead. Based on ${historyLabel(screen.days)} — no trend is implied.`;
  }
  const rank = rankLabel(row);
  return `In the latest run (${when}), ${engines} “${row.prompt}” and named ${b} at rank ${rank}; ${rivals} also appeared. Based on ${historyLabel(screen.days)} — no trend is implied.`;
}

export default function CreateActionModal({
  row,
  screen,
  onClose,
}: {
  row: ScreenPromptRow;
  screen: PromptsScreen;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(() => draftTitle(row, screen.brand));
  const [category, setCategory] = useState<string>("CONTENT");
  const [impact, setImpact] = useState("");
  const [effort, setEffort] = useState<string>("M");
  const [rationale, setRationale] = useState(() => draftRationale(row, screen));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const cat = CATEGORY_STYLE[category] ?? CATEGORY_STYLE.CONTENT;
  const canSubmit = title.trim().length > 0;

  async function addToQueue() {
    if (!canSubmit) {
      toast("Give the action a title first.");
      return;
    }
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: title.trim(), impact, effort }),
      });
      const data = (await res.json()) as { ok: boolean; total?: number; durable?: boolean; error?: string };
      if (data.ok) {
        toast(
          `“${title.trim()}” added to the queue — ${data.total} action${data.total === 1 ? "" : "s"} saved${impact.trim() ? ` (est. ${impact.trim()}, effort ${effort})` : ` (effort ${effort})`}.` +
            (data.durable ? "" : " Stored in memory until you add a KV key."),
        );
        onClose();
      } else {
        toast(data.error ?? "Could not save the action.");
      }
    } catch {
      toast("Could not reach the server to save the action.");
    }
  }

  return (
    <div style={{position:"fixed",inset:"0",zIndex:50,background:"rgba(5,5,8,0.55)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create action from prompt"
        onClick={(e) => e.stopPropagation()}
        style={{width:"600px",maxHeight:"88vh",overflowY:"auto",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"22px",boxShadow:"0 30px 80px rgba(0,0,0,.5)"}}
      >
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"12px"}}>
          <div>
            <div style={{fontSize:"15px",fontWeight:"600"}}>{"Create action"}</div>
            <div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"4px",lineHeight:"1.5"}}>
              {row.sampled
                ? `Drafted from “${row.prompt}” · latest run ${fmtDateTime(row.ts)} · ${row.mentioned ? `named at rank ${rankLabel(row)}` : "not mentioned"}`
                : `Drafted from “${row.prompt}” · not sampled yet`}
            </div>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} style={{color:"var(--fnt)",background:"none",border:"none",padding:0,cursor:"pointer",fontSize:"14px",fontFamily:"inherit",lineHeight:1}}>{"✕"}</button>
        </div>

        <div style={{marginTop:"16px"}}>
          <label style={LABEL} htmlFor="action-title">{"Title"}</label>
          <input id="action-title" value={title} onChange={(e) => setTitle(e.target.value)} style={FIELD} />
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"10px",marginTop:"12px"}}>
          <div>
            <label style={LABEL} htmlFor="action-category">{"Category"}</label>
            <select id="action-category" value={category} onChange={(e) => setCategory(e.target.value)} style={FIELD}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL} htmlFor="action-impact">{"Est. impact"}</label>
            <input id="action-impact" value={impact} placeholder="your estimate" onChange={(e) => setImpact(e.target.value)} style={{...FIELD,fontVariantNumeric:"tabular-nums",color:"var(--ac)"}} />
          </div>
          <div>
            <label style={LABEL} htmlFor="action-effort">{"Effort"}</label>
            <select id="action-effort" value={effort} onChange={(e) => setEffort(e.target.value)} style={FIELD}>
              {EFFORTS.map((e2) => <option key={e2} value={e2}>{e2}</option>)}
            </select>
          </div>
          <div>
            <span style={LABEL}>{"Prompts affected"}</span>
            <div style={{...FIELD,fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"1"}</div>
          </div>
        </div>

        <div style={{marginTop:"12px"}}>
          <label style={LABEL} htmlFor="action-why">{"Why this action"}</label>
          <textarea id="action-why" value={rationale} onChange={(e) => setRationale(e.target.value)} rows={4} style={{...FIELD,lineHeight:"1.55",resize:"vertical"}} />
          <div style={{fontSize:"10.5px",color:"var(--fnt)",marginTop:"6px",lineHeight:1.5}}>
            {"Impact is left for you to estimate — Answr doesn’t project the effect of an action."}
          </div>
        </div>

        <div style={{marginTop:"12px"}}>
          <span style={LABEL}>{"Preview on the board"}</span>
          <div style={{border:"1px solid var(--brd)",borderRadius:"7px",background:"var(--bg0)",padding:"8px 10px",display:"flex",alignItems:"center",gap:"8px",whiteSpace:"nowrap",overflow:"hidden",fontSize:"11px",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>
            <span style={{width:"32px",height:"22px",flex:"none",borderRadius:"6px",background:"color-mix(in oklab,var(--ac) 14%,transparent)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9.5px",fontWeight:600,color:"var(--ac)"}}>{"NEW"}</span>
            <span style={{fontSize:"10px",fontWeight:500,color:cat.color,border:cat.border,borderRadius:"4px",padding:"2px 6px"}}>{category}</span>
            {impact.trim() && <span style={{color:"var(--ac)"}}>{impact.trim()}</span>}
            <span>{`Effort ${effort}`}</span>
            <span>{"1 prompt"}</span>
          </div>
        </div>

        <div style={{display:"flex",gap:"8px",marginTop:"18px"}}>
          <button type="button" className="btn-ac" onClick={addToQueue} style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:500,borderRadius:"7px",padding:"9px 0",border:"none",cursor:"pointer",fontFamily:"inherit",opacity:canSubmit ? 1 : 0.5}}>{"Add to queue"}</button>
          <button type="button" onClick={onClose} style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:500,color:"var(--tx)",background:"transparent",border:"1px solid var(--brd)",borderRadius:"7px",padding:"9px 0",cursor:"pointer",fontFamily:"inherit"}}>{"Cancel"}</button>
        </div>
      </div>
    </div>
  );
}
