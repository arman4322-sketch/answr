"use client";

import { useState } from "react";

/* Exact / Phrase match-scope segmented control — a real local toggle (playbook
   5 spirit: pure client UI state, no toast — the fixture depicts the Exact
   scope and nothing else on the page keys off it). Active/inactive styles are
   verbatim from the frame's depicted segments. */

export default function ExactPhraseToggle() {
  const [mode, setMode] = useState<"Exact" | "Phrase">("Exact");

  const segStyle = (m: "Exact" | "Phrase"): React.CSSProperties =>
    mode === m
      ? {fontSize:"11.5px",fontWeight:600,background:"var(--ac)",color:"#fff",borderRadius:"5px",padding:"4px 12px",border:"none",cursor:"pointer",fontFamily:"inherit"}
      : {fontSize:"11.5px",color:"var(--mut)",padding:"4px 12px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"};

  return (
    <div role="group" aria-label="Match scope" style={{display:"inline-flex",border:"1px solid var(--brd)",borderRadius:"7px",padding:"2px",background:"var(--bg1)",fontSize:"11.5px"}}>
      <button type="button" aria-pressed={mode === "Exact"} onClick={() => setMode("Exact")} style={segStyle("Exact")}>{"Exact"}</button>
      <button type="button" aria-pressed={mode === "Phrase"} onClick={() => setMode("Phrase")} style={segStyle("Phrase")}>{"Phrase"}</button>
    </div>
  );
}
