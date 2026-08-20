"use client";

import { useState } from "react";

/* Changelog "Older releases" control (INTERACTIVITY_CONVENTIONS playbook 6 +
   the marketing rule that marketing controls navigate/expand/submit and never
   toast). The button expands the pre-April-2026 archive in place; entry markup
   is byte-identical to the entries the page renders above it, so the expanded
   list is visually continuous with the frame.

   The frame's button also shipped without `fontFamily`/`cursor`, so it rendered
   in the browser's default UI font with an arrow cursor — both restored here
   without changing any other declared value. */

type Entry = { date: string; title: string; tag: string; tagColor: string; tagBg: string; body: string };

const ACCENT = { tagColor: "var(--ac)", tagBg: "rgba(142,124,242,0.14)" };

const OLDER: Entry[] = [
  {
    date: "Mar 25, 2026",
    title: "Answr Index",
    tag: "NEW",
    ...ACCENT,
    body: "A public benchmark of answer visibility by category, refreshed monthly from the same sampling that powers your workspace.",
  },
  {
    date: "Mar 11, 2026",
    title: "Competitor overlay everywhere",
    tag: "IMPROVED",
    ...ACCENT,
    body: "Any trend line can carry up to four competitors, and the overlay now persists across Overview, topics and regions.",
  },
  {
    date: "Feb 25, 2026",
    title: "Scheduled exec summaries",
    tag: "NEW",
    ...ACCENT,
    body: "Monday digests and monthly board packs assemble themselves, with the receipts behind every number attached.",
  },
  {
    date: "Feb 11, 2026",
    title: "Content score",
    tag: "NEW",
    ...ACCENT,
    body: "Paste a draft or point at a URL and see how likely it is to be cited, with the subscores that explain the number.",
  },
];

export default function OlderReleases() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open &&
        OLDER.map((e) => (
          <div key={e.date} style={{display:"grid",gridTemplateColumns:"110px 1fr",gap:"24px",padding:"24px 0",borderTop:"1px solid var(--brd)"}}>
            <div style={{fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{e.date}</div>
            <div>
              <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                <span style={{fontSize:"15px",fontWeight:"600"}}>{e.title}</span>
                <span style={{fontSize:"9px",fontWeight:"600",color:e.tagColor,background:e.tagBg,borderRadius:"4px",padding:"2px 6px"}}>{e.tag}</span>
              </div>
              <div style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.65",marginTop:"6px"}}>{e.body}</div>
            </div>
          </div>
        ))}
      <div style={{display:"flex",justifyContent:"center",padding:"28px 0 4px",borderTop:"1px solid var(--brd)"}}>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{fontSize:"13px",fontWeight:"500",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"10px 28px",background:"var(--bg1)",fontFamily:"inherit",cursor:"pointer"}}
        >
          {open ? "Hide older releases" : "Older releases"}
        </button>
      </div>
    </>
  );
}
