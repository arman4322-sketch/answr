"use client";

import { useState } from "react";

/* Pricing FAQ — real expand/collapse accordions (interactivity playbook 6).
   The frame drew item 2 open (－) and the rest closed (＋); that stays the
   default state. Answers stay consistent with the tier bullets / compare table. */

const faqs: { q: string; a: string }[] = [
  {
    q: "How do you sample AI answers?",
    a: "We run every tracked prompt against all five platforms on a fixed cadence — weekly on Growth, daily on Scale and Enterprise — then score each answer for mentions, sentiment and citations. Sampling is direct: real prompts, real answers, deduplicated per run.",
  },
  {
    q: "Do you support languages other than English?",
    a: "Yes — prompts can run in 12 languages, with per-locale visibility scoring. Regional panels are available on Enterprise.",
  },
  {
    q: "Can I change plans mid-cycle?",
    a: "Yes. Upgrades take effect immediately and are prorated; downgrades apply at your next renewal. Switching between annual and monthly billing also happens at renewal.",
  },
  {
    q: "What counts as a tracked prompt?",
    a: "One prompt monitored across every platform you've enabled. A prompt sampled on all five platforms still counts once — Growth includes 250, Scale 1,000.",
  },
  {
    q: "How is this different from our SEO stack?",
    a: "SEO tools measure where you rank on results pages. Answr measures whether AI assistants mention, recommend and cite you when buyers ask — a different surface with different levers, tracked prompt by prompt.",
  },
  {
    q: "What happens when the trial ends?",
    a: "Your workspace pauses. Nothing is deleted and no card is charged — pick a plan any time and monitoring resumes right where you left off.",
  },
];

export default function PricingFaq() {
  const [open, setOpen] = useState<number | null>(1);

  return (
    <div style={{maxWidth:"840px",margin:"0 auto",padding:"0 64px 80px"}}>
      <div style={{fontSize:"22px",fontWeight:"600",textAlign:"center",marginBottom:"24px"}}>{"Questions"}</div>
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.q}
            style={{border:"1px solid var(--brd)",borderRadius:"10px",background:"var(--bg1)",padding:"18px 22px",display:"flex",flexDirection:"column",gap:isOpen ? "10px" : undefined,marginTop:i === 0 ? undefined : "10px"}}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:"transparent",border:"none",padding:"0",cursor:"pointer",fontFamily:"inherit",textAlign:"left",color:"var(--tx)"}}
            >
              <span style={{fontSize:"14px",fontWeight:"500"}}>{f.q}</span>
              <span style={{color:"var(--fnt)"}}>{isOpen ? "－" : "＋"}</span>
            </button>
            {isOpen && <div style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.6"}}>{f.a}</div>}
          </div>
        );
      })}
    </div>
  );
}
