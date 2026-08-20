"use client";

import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import { ACTION_DRAFT, SELECTED_PROMPT, type PlatformAnswer } from "@/lib/data/prompts";

/* "Create action" → an action drafted FROM the prompt, not an empty form.
   Title, category, estimated impact, effort, prompts affected and the rationale
   all arrive prefilled from this prompt's gap (see ACTION_DRAFT in
   lib/data/prompts.ts), every field is editable, and "Add to queue" confirms
   with the id it would take on the Actions board (#93, next after #92) and
   closes. Esc / ✕ / overlay-click cancel. */

const CATEGORY_STYLE: Record<string, { color: string; border: string }> = {
  CONTENT: { color: "#7fa7d9", border: "1px solid rgba(127,167,217,.35)" },
  TECHNICAL: { color: "#d9b679", border: "1px solid rgba(217,182,121,.35)" },
  AUTHORITY: { color: "#b98ed9", border: "1px solid rgba(185,142,217,.35)" },
};

const FIELD = { width:"100%",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",padding:"8px 10px",fontSize:"12.5px",color:"var(--tx)",fontFamily:"inherit" } as const;
const LABEL = { fontSize:"10px",fontWeight:500,letterSpacing:".08em",textTransform:"uppercase",color:"var(--fnt)",display:"block",marginBottom:"5px" } as const;

export default function CreateActionModal({ platform, onClose }: { platform: PlatformAnswer; onClose: () => void }) {
  const [title, setTitle] = useState(ACTION_DRAFT.title);
  const [category, setCategory] = useState<string>(ACTION_DRAFT.category);
  const [impact, setImpact] = useState(ACTION_DRAFT.impact);
  const [effort, setEffort] = useState<string>(ACTION_DRAFT.effort);
  const [affected, setAffected] = useState(ACTION_DRAFT.promptsAffected);
  const [owner, setOwner] = useState(ACTION_DRAFT.owner);
  const [rationale, setRationale] = useState(ACTION_DRAFT.rationale);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const cat = CATEGORY_STYLE[category] ?? CATEGORY_STYLE.CONTENT;
  const canSubmit = title.trim().length > 0;

  function addToQueue() {
    if (!canSubmit) {
      toast("Give the action a title first.");
      return;
    }
    toast(`Action #${ACTION_DRAFT.queueId} “${title.trim()}” added to the queue — est. ${impact}, effort ${effort}. Drafts persist on live workspaces.`);
    onClose();
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
            <div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"4px",lineHeight:"1.5"}}>{`Drafted from “${SELECTED_PROMPT.text}” · ${platform.label} ${platform.mentionRate} mention rate`}</div>
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
              {ACTION_DRAFT.categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL} htmlFor="action-impact">{"Est. impact"}</label>
            <input id="action-impact" value={impact} onChange={(e) => setImpact(e.target.value)} style={{...FIELD,fontVariantNumeric:"tabular-nums",color:"var(--ac)"}} />
          </div>
          <div>
            <label style={LABEL} htmlFor="action-effort">{"Effort"}</label>
            <select id="action-effort" value={effort} onChange={(e) => setEffort(e.target.value)} style={FIELD}>
              {ACTION_DRAFT.efforts.map((e2) => <option key={e2} value={e2}>{e2}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL} htmlFor="action-affected">{"Prompts affected"}</label>
            <input id="action-affected" value={affected} onChange={(e) => setAffected(e.target.value)} inputMode="numeric" style={{...FIELD,fontVariantNumeric:"tabular-nums"}} />
          </div>
        </div>

        <div style={{marginTop:"12px"}}>
          <label style={LABEL} htmlFor="action-why">{"Why this action"}</label>
          <textarea id="action-why" value={rationale} onChange={(e) => setRationale(e.target.value)} rows={4} style={{...FIELD,lineHeight:"1.55",resize:"vertical"}} />
        </div>

        <div style={{display:"grid",gridTemplateColumns:"180px 1fr",gap:"10px",marginTop:"12px",alignItems:"end"}}>
          <div>
            <label style={LABEL} htmlFor="action-owner">{"Owner"}</label>
            <select id="action-owner" value={owner} onChange={(e) => setOwner(e.target.value)} style={FIELD}>
              {ACTION_DRAFT.owners.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <span style={LABEL}>{"Preview on the board"}</span>
            <div style={{border:"1px solid var(--brd)",borderRadius:"7px",background:"var(--bg0)",padding:"8px 10px",display:"flex",alignItems:"center",gap:"8px",whiteSpace:"nowrap",overflow:"hidden",fontSize:"11px",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>
              <span style={{width:"22px",height:"22px",flex:"none",borderRadius:"6px",background:"color-mix(in oklab,var(--ac) 14%,transparent)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9.5px",fontWeight:600,color:"var(--ac)"}}>{ACTION_DRAFT.queueId}</span>
              <span style={{fontSize:"10px",fontWeight:500,color:cat.color,border:cat.border,borderRadius:"4px",padding:"2px 6px"}}>{category}</span>
              <span style={{color:"var(--ac)"}}>{impact}</span>
              <span>{`Effort ${effort}`}</span>
              <span>{`${affected} prompts`}</span>
            </div>
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
