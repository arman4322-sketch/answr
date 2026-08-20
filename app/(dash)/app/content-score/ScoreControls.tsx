"use client";

import { useRef, useState } from "react";
import { toast } from "@/lib/toast";

/* Content-score input controls (INTERACTIVITY_CONVENTIONS):
   - mode tabs → playbook 4. "URL" is the depicted active mode and focuses the
     field; "Paste text" / "Upload file" have no designed panel in the frame, so
     they keep the active underline where it is and toast the honest line rather
     than flipping into an undesigned state.
   - URL field → controlled; Enter submits, same as "Score it".
   - "Score it" → playbook 9: validates non-empty, then reports a real result —
     re-scoring the fixture page returns its score, any other URL gets the honest
     live-workspace line. */

const FIXTURE_URL = "nike.com/running/draft-marathon-guide";
const FIXTURE_SCORE = "68 of 100";

const TAB_NOTE = "The demo scores by URL — paste-text and file uploads run on live workspaces.";

export default function ScoreControls() {
  const [url, setUrl] = useState(FIXTURE_URL);
  const inputRef = useRef<HTMLInputElement>(null);

  function score() {
    const value = url.trim();
    if (!value) {
      toast("Enter a page URL to score.");
      inputRef.current?.focus();
      return;
    }
    if (value === FIXTURE_URL) {
      toast(`Re-scored ${FIXTURE_URL} — ${FIXTURE_SCORE}, unchanged since the fixture run.`);
      return;
    }
    toast(`Scoring new pages runs on live workspaces — the demo ships the fixture for ${FIXTURE_URL}.`);
  }

  return (
    <>
      <div style={{display:"flex",gap:"2px",fontSize:"12.5px",borderBottom:"1px solid var(--brd)"}}>
        <button
          type="button"
          aria-current="page"
          onClick={() => inputRef.current?.focus()}
          style={{background:"none",border:"none",fontFamily:"inherit",fontSize:"12.5px",cursor:"pointer",padding:"8px 12px",color:"var(--tx)",fontWeight:"500",borderBottom:"2px solid var(--ac)"}}
        >
          {"URL"}
        </button>
        <button
          type="button"
          onClick={() => toast(TAB_NOTE)}
          style={{background:"none",border:"none",fontFamily:"inherit",fontSize:"12.5px",cursor:"pointer",padding:"8px 12px",color:"var(--mut)"}}
        >
          {"Paste text"}
        </button>
        <button
          type="button"
          onClick={() => toast(TAB_NOTE)}
          style={{background:"none",border:"none",fontFamily:"inherit",fontSize:"12.5px",cursor:"pointer",padding:"8px 12px",color:"var(--mut)"}}
        >
          {"Upload file"}
        </button>
      </div>
      <div style={{display:"flex",gap:"8px"}}>
        <input
          ref={inputRef}
          aria-label="Page URL to score"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              score();
            }
          }}
          style={{flex:"1",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"7px",padding:"9px 13px",fontSize:"12.5px",color:"var(--mut)",fontVariantNumeric:"tabular-nums",fontFamily:"inherit"}}
        />
        <button
          type="button"
          className="btn-ac"
          onClick={score}
          style={{fontSize:"12.5px",fontWeight:"500",borderRadius:"7px",padding:"9px 18px",border:"none",cursor:"pointer",fontFamily:"inherit"}}
        >
          {"Score it"}
        </button>
      </div>
    </>
  );
}
