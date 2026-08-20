"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "@/lib/toast";
import { PROMPT_QUOTA, SUGGESTED_PROMPTS } from "@/lib/data/prompts";
import { PROMPT_ROWS } from "./Controls";

/* "+ Add prompts" → the real add flow (playbook 3: a designed modal exists, so
   open it instead of toasting). Paste prompts one per line, or let "Suggest
   prompts" draft category-appropriate ones for the workspace (running shoes /
   training apparel). Quota is live against the plan's 1,000-prompt limit —
   412 tracked today (the same 412 the topbar counts) — and the confirm button
   counts what will actually be added: blank lines, duplicates inside the box
   and prompts already tracked are all discounted, and the button disables if
   the additions would break the plan limit. */

const SUGGEST_BATCH = 6;

function norm(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

const TRACKED = new Set(PROMPT_ROWS.map((r) => norm(r.prompt)));

export default function AddPromptsModal() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const parsed = useMemo(() => {
    const seen = new Set<string>();
    const fresh: string[] = [];
    let duplicates = 0;
    let tracked = 0;
    for (const raw of text.split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      const key = norm(line);
      if (TRACKED.has(key)) {
        tracked++;
        continue;
      }
      if (seen.has(key)) {
        duplicates++;
        continue;
      }
      seen.add(key);
      fresh.push(line);
    }
    return { fresh, duplicates, tracked };
  }, [text]);

  const adding = parsed.fresh.length;
  const after = PROMPT_QUOTA.used + adding;
  const overBy = Math.max(0, after - PROMPT_QUOTA.limit);
  const canAdd = adding > 0 && overBy === 0;
  const usedPct = (PROMPT_QUOTA.used / PROMPT_QUOTA.limit) * 100;
  const addPct = Math.min(100 - usedPct, (adding / PROMPT_QUOTA.limit) * 100);

  function suggest() {
    const present = new Set([...parsed.fresh.map(norm), ...TRACKED]);
    const picks = SUGGESTED_PROMPTS.filter((p) => !present.has(norm(p))).slice(0, SUGGEST_BATCH);
    if (picks.length === 0) {
      toast("Every suggestion for this category is already in the list.");
      return;
    }
    setText((t) => (t.trim() ? `${t.replace(/\s+$/, "")}\n${picks.join("\n")}` : picks.join("\n")));
    toast(`Drafted ${picks.length} prompts for running shoes & training apparel — edit before adding.`);
  }

  function confirm() {
    if (overBy > 0) {
      toast(`That's ${overBy} over the plan's ${PROMPT_QUOTA.limit.toLocaleString()}-prompt limit — remove a few or archive tracked prompts.`);
      return;
    }
    if (adding === 0) {
      toast("Nothing to add — paste prompts one per line, or use Suggest prompts.");
      return;
    }
    toast(`${adding} prompt${adding === 1 ? "" : "s"} added to this demo list — ${after.toLocaleString()} of ${PROMPT_QUOTA.limit.toLocaleString()} in the sample quota. On a live workspace, tracked prompts run on tomorrow's sample; nothing is saved in the demo.`);
    setText("");
    close();
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
        {"+ Add prompts"}
      </button>
      {open && (
        <div style={{position:"fixed",inset:"0",zIndex:50,background:"rgba(5,5,8,0.55)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Add prompts"
            onClick={(e) => e.stopPropagation()}
            style={{width:"600px",maxHeight:"88vh",overflowY:"auto",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"22px",boxShadow:"0 30px 80px rgba(0,0,0,.5)"}}
          >
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"12px"}}>
              <div>
                <div style={{fontSize:"15px",fontWeight:"600"}}>{"Add prompts"}</div>
                <div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"4px"}}>{"Nike · running shoes & training apparel · every prompt runs daily on all enabled platforms"}</div>
              </div>
              <button type="button" aria-label="Close" onClick={close} style={{color:"var(--fnt)",background:"none",border:"none",padding:0,cursor:"pointer",fontSize:"14px",fontFamily:"inherit",lineHeight:1}}>{"✕"}</button>
            </div>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"16px"}}>
              <label htmlFor="new-prompts" style={{fontSize:"10px",fontWeight:500,letterSpacing:".08em",textTransform:"uppercase",color:"var(--fnt)"}}>{"One prompt per line"}</label>
              <button type="button" onClick={suggest} style={{fontSize:"11.5px",fontWeight:500,color:"var(--ac)",background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:"inherit"}}>{"Suggest prompts"}</button>
            </div>
            <textarea
              id="new-prompts"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={"best running shoes for beginners\nhow to choose training tights\nNike vs New Balance for wide feet"}
              style={{width:"100%",marginTop:"6px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"10px 12px",fontSize:"12.5px",lineHeight:"1.7",color:"var(--tx)",fontFamily:"inherit",resize:"vertical"}}
            />

            <div style={{marginTop:"14px",border:"1px solid var(--brd)",borderRadius:"8px",background:"var(--bg0)",padding:"12px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",fontVariantNumeric:"tabular-nums"}}>
                <span style={{color:"var(--fnt)"}}>{"Tracked prompts"}</span>
                <span style={{fontWeight:500}}>
                  {`${PROMPT_QUOTA.used.toLocaleString()} of ${PROMPT_QUOTA.limit.toLocaleString()}`}
                  {adding > 0 && <span style={{color:overBy > 0 ? "#e5636e" : "var(--ac)"}}>{` → ${after.toLocaleString()}`}</span>}
                </span>
              </div>
              <div style={{height:"6px",borderRadius:"3px",background:"var(--bg2)",marginTop:"8px",display:"flex",overflow:"hidden"}}>
                <div style={{width:`${usedPct}%`,background:"color-mix(in oklab,var(--ac) 45%,transparent)"}} />
                <div style={{width:`${addPct}%`,background:overBy > 0 ? "#e5636e" : "var(--ac)"}} />
              </div>
              <div style={{marginTop:"8px",fontSize:"11px",lineHeight:"1.55",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>
                {overBy > 0
                  ? `${overBy} over the plan limit — remove ${overBy} line${overBy === 1 ? "" : "s"} or archive tracked prompts first.`
                  : adding > 0
                    ? `${adding} new prompt${adding === 1 ? "" : "s"} · ${(PROMPT_QUOTA.limit - after).toLocaleString()} of the plan's quota left after adding.`
                    : `${(PROMPT_QUOTA.limit - PROMPT_QUOTA.used).toLocaleString()} prompts left on the Scale plan.`}
                {parsed.tracked > 0 && ` ${parsed.tracked} already tracked — skipped.`}
                {parsed.duplicates > 0 && ` ${parsed.duplicates} repeated line${parsed.duplicates === 1 ? "" : "s"} — skipped.`}
              </div>
            </div>

            <div style={{display:"flex",gap:"8px",marginTop:"18px"}}>
              <button
                type="button"
                className="btn-ac"
                onClick={confirm}
                aria-disabled={!canAdd}
                style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:500,borderRadius:"7px",padding:"9px 0",border:"none",cursor:"pointer",fontFamily:"inherit",opacity:canAdd ? 1 : 0.5}}
              >
                {adding > 0 ? `Add ${adding} prompt${adding === 1 ? "" : "s"}` : "Add prompts"}
              </button>
              <button type="button" onClick={close} style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:500,color:"var(--tx)",background:"transparent",border:"1px solid var(--brd)",borderRadius:"7px",padding:"9px 0",cursor:"pointer",fontFamily:"inherit"}}>{"Cancel"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
