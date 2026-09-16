"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "@/lib/toast";
import { normPrompt, type PromptsScreen } from "./rows";

/* "+ Add prompts" — the real add flow, now counted against the live workspace.

   Gone with the fixtures: the "412 of 1,000 on the Scale plan" quota bar (the
   plan limit was a fixture constant, and nothing in the live data reports one)
   and the hand-written Nike suggestion list. The count shown is the workspace's
   real tracked-prompt count; the suggestions are generated from the real brand
   and category by the same generator onboarding uses (passed in from the
   server). Duplicates — blank lines, repeats in the box, prompts already
   tracked — are still discounted before the confirm button counts anything. */

const SUGGEST_BATCH = 6;

export default function AddPromptsModal({ data }: { data: PromptsScreen }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const close = () => setOpen(false);

  const tracked = useMemo(() => new Set(data.rows.map((r) => normPrompt(r.prompt))), [data.rows]);

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
    let already = 0;
    for (const raw of text.split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      const key = normPrompt(line);
      if (tracked.has(key)) {
        already++;
        continue;
      }
      if (seen.has(key)) {
        duplicates++;
        continue;
      }
      seen.add(key);
      fresh.push(line);
    }
    return { fresh, duplicates, already };
  }, [text, tracked]);

  const adding = parsed.fresh.length;
  const after = data.rows.length + adding;
  const canAdd = adding > 0;

  function suggest() {
    const present = new Set([...parsed.fresh.map(normPrompt), ...tracked]);
    const picks = data.suggestions.filter((p) => !present.has(normPrompt(p))).slice(0, SUGGEST_BATCH);
    if (data.suggestions.length === 0) {
      toast("Suggestions need a configured brand — set one up in Settings › Brand.");
      return;
    }
    if (picks.length === 0) {
      toast("Every generated suggestion for this workspace is already in the list.");
      return;
    }
    setText((t) => (t.trim() ? `${t.replace(/\s+$/, "")}\n${picks.join("\n")}` : picks.join("\n")));
    toast(`Drafted ${picks.length} prompts for ${data.brand}${data.category ? ` · ${data.category}` : ""} — edit before adding.`);
  }

  async function confirm() {
    if (adding === 0) {
      toast("Nothing to add — paste prompts one per line, or use Suggest prompts.");
      return;
    }
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompts: parsed.fresh }),
      });
      const body = (await res.json()) as { ok: boolean; added?: number; total?: number; durable?: boolean; error?: string };
      if (body.ok) {
        toast(
          `${body.added} prompt${body.added === 1 ? "" : "s"} saved — ${body.total} in the prompt store.` +
            (data.workspacePrompts > 0
              ? " Add them to the workspace prompt set in Settings › Brand to include them in the next run."
              : " They run on the next scheduled sample.") +
            (body.durable ? "" : " Stored in memory until you add a KV key."),
        );
        setText("");
        close();
      } else {
        toast(body.error ?? "Could not save prompts.");
      }
    } catch {
      toast("Could not reach the server to save prompts.");
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
                <div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"4px",lineHeight:1.5}}>
                  {data.configured
                    ? `${data.brand}${data.category ? ` · ${data.category}` : ""} · every prompt runs on the next scheduled sample`
                    : "No workspace configured yet — set up your brand in Settings › Brand so sampled prompts can be scored."}
                </div>
              </div>
              <button type="button" aria-label="Close" onClick={close} style={{color:"var(--fnt)",background:"none",border:"none",padding:0,cursor:"pointer",fontSize:"14px",fontFamily:"inherit",lineHeight:1}}>{"✕"}</button>
            </div>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"16px"}}>
              <label htmlFor="new-prompts" style={{fontSize:"10px",fontWeight:500,letterSpacing:".08em",textTransform:"uppercase",color:"var(--fnt)"}}>{"One prompt per line"}</label>
              <button type="button" onClick={suggest} aria-disabled={data.suggestions.length === 0} style={{fontSize:"11.5px",fontWeight:500,color:"var(--ac)",background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:"inherit",opacity:data.suggestions.length === 0 ? 0.5 : 1}}>{"Suggest prompts"}</button>
            </div>
            <textarea
              id="new-prompts"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={"What are the best options in this category?\nWhich one would you recommend, and why?\nWhat are the top alternatives?"}
              style={{width:"100%",marginTop:"6px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"10px 12px",fontSize:"12.5px",lineHeight:"1.7",color:"var(--tx)",fontFamily:"inherit",resize:"vertical"}}
            />

            <div style={{marginTop:"14px",border:"1px solid var(--brd)",borderRadius:"8px",background:"var(--bg0)",padding:"12px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",fontVariantNumeric:"tabular-nums"}}>
                <span style={{color:"var(--fnt)"}}>{"Tracked prompts"}</span>
                <span style={{fontWeight:500}}>
                  {data.rows.length.toLocaleString()}
                  {adding > 0 && <span style={{color:"var(--ac)"}}>{` → ${after.toLocaleString()}`}</span>}
                </span>
              </div>
              <div style={{marginTop:"8px",fontSize:"11px",lineHeight:"1.55",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>
                {adding > 0
                  ? `${adding} new prompt${adding === 1 ? "" : "s"} to add.`
                  : "Paste the questions you want asked — one per line."}
                {parsed.already > 0 && ` ${parsed.already} already tracked — skipped.`}
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
