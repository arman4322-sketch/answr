"use client";

import { useState } from "react";

/* "To raise the score" recommendation rows — real accordions (playbook 6/8):
   each row's → marker rotates and the row expands to the reasoning behind the
   estimate, drawn from the subscores shown on this page. Closed state is the
   frame's row, pixel for pixel (the div became a button with the same box). */

export default function RaiseScoreRow({
  text,
  lift,
  detail,
}: {
  text: string;
  /** e.g. "+9 est." */
  lift: string;
  detail: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{display:"flex",gap:"10px",alignItems:"center",padding:"8px 12px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:open ? "7px 7px 0 0" : "7px",width:"100%",boxSizing:"border-box",textAlign:"left",fontFamily:"inherit",fontSize:"12.5px",fontWeight:"400",color:"var(--tx)",cursor:"pointer"}}
      >
        <span style={{color:"var(--ac)",fontWeight:"700",display:"inline-block",transform:open ? "rotate(90deg)" : "none",transition:"transform .15s ease"}}>{"→"}</span>
        <span>{text}</span>
        <span style={{marginLeft:"auto",fontSize:"10.5px",fontWeight:"600",color:"#4cb782"}}>{lift}</span>
      </button>
      {open && (
        <div style={{padding:"9px 12px 10px 34px",background:"var(--bg0)",border:"1px solid var(--brd)",borderTop:"none",borderRadius:"0 0 7px 7px",fontSize:"11.5px",color:"var(--fnt)",lineHeight:"1.55"}}>
          {detail}
        </div>
      )}
    </div>
  );
}
