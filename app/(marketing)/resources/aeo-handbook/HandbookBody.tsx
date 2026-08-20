"use client";

import { useRef, useState } from "react";

/* AEO handbook — chapter list + "Get chapters 4–6" capture (client).

   INTERACTIVITY_CONVENTIONS playbook 6 + 9, marketing tone (no demo toasts):
   - Chapter rows were <Link>s pointing back at this same page. They are now real
     accordions. 1–3 are free ("No email wall for the first three") and open a
     teaser; 4–6 are gated, so opening one explains the email course and focuses
     the capture field below.
   - "Send it" validates a non-empty email, then the capture card swaps to an
     inline confirmation. Row styles are the frame's, verbatim. */

type Chapter = {
  num: string;
  title: string;
  sub: string;
  mins: string;
  hv: string;
  teaser?: string;
};

const chapters: Chapter[] = [
  {
    num: "01",
    title: "What is AEO, actually",
    sub: "Why answer engines behave nothing like search rankings",
    mins: "12 min",
    hv: "hv9",
    teaser:
      "A ranking is a list; an answer is a verdict. We separate the two — why a page can sit third on the results page and still never be quoted, and what makes a model reach for your sentence instead of someone else's.",
  },
  {
    num: "02",
    title: "Building a prompt set that hurts",
    sub: "Buyer-shaped prompts, not comforting ones",
    mins: "9 min",
    hv: "hv10",
    teaser:
      "The prompts a team writes for itself are the ones it already wins. This is the sampling method behind the 50,000-prompt set: buyer-shaped questions, competitor-named comparisons, and the objection prompts nobody volunteers to track.",
  },
  {
    num: "03",
    title: "The citation economy",
    sub: "Which page types get cited, measured across 50K prompts",
    mins: "14 min",
    hv: "hv11",
    teaser:
      "Four page types take most of the citations, and the product page is not one of them. The full distribution, broken out by platform, plus what survives deduplication once the same source gets quoted twice in one answer.",
  },
  { num: "04", title: "Crawler access & llms.txt", sub: "The infrastructure layer most teams never check", mins: "8 min", hv: "hv12" },
  { num: "05", title: "Sentiment and the stale-fact problem", sub: "When being mentioned costs more than being absent", mins: "10 min", hv: "hv13" },
  { num: "06", title: "Measuring lift, defensibly", sub: "Attribution models your CFO will accept", mins: "11 min", hv: "hv14" },
];

const rowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "56px 1fr auto",
  gap: "20px",
  alignItems: "center",
  padding: "20px 8px",
  color: "var(--tx)",
  width: "100%",
  boxSizing: "border-box",
  background: "transparent",
  border: "none",
  textAlign: "left",
  fontFamily: "inherit",
  cursor: "pointer",
};

const panelStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "56px 1fr",
  gap: "20px",
  padding: "0 8px 22px",
};

export default function HandbookBody() {
  const [open, setOpen] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  function toggle(ch: Chapter) {
    setOpen((cur) => (cur === ch.num ? null : ch.num));
    if (!ch.teaser && open !== ch.num && !sent) {
      emailRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      emailRef.current?.focus({ preventScroll: true });
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setInvalid(true);
      emailRef.current?.focus();
      return;
    }
    setSent(email.trim());
  }

  return (
    <div style={{padding:"0 48px 64px",maxWidth:"880px",margin:"0 auto",display:"flex",flexDirection:"column"}}>
      {chapters.map((ch, i) => (
        <div
          key={ch.num}
          style={{borderTop:"1px solid var(--brd)",...(i === chapters.length - 1 ? {borderBottom:"1px solid var(--brd)"} : null)}}
        >
          <button
            type="button"
            className={ch.hv}
            style={rowStyle}
            aria-expanded={open === ch.num}
            onClick={() => toggle(ch)}
          >
            <span style={{fontSize:"22px",fontWeight:"600",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{ch.num}</span>
            <span>
              <span style={{display:"block",fontSize:"16px",fontWeight:"600"}}>{ch.title}</span>
              <span style={{display:"block",fontSize:"12.5px",color:"var(--mut)",marginTop:"3px"}}>{ch.sub}</span>
            </span>
            <span style={{fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{ch.mins}</span>
          </button>
          {open === ch.num && (
            <div style={panelStyle}>
              <span />
              <span style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.7"}}>
                {ch.teaser
                  ? ch.teaser
                  : sent
                    ? `On its way — chapter ${Number(ch.num)} is queued in the email course going to ${sent}.`
                    : "This one travels with the email course. Add your work email below and chapters 4–6 arrive over three weeks."}
              </span>
            </div>
          )}
        </div>
      ))}
      {sent ? (
        <div style={{marginTop:"28px",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"24px 28px",display:"flex",alignItems:"center",gap:"24px"}}>
          <div style={{flex:"1"}} role="status">
            <div style={{fontSize:"15px",fontWeight:"600"}}>{"Chapter 4 is on its way."}</div>
            <div style={{fontSize:"12.5px",color:"var(--mut)",marginTop:"4px"}}>{`Sent to ${sent} — chapters 5 and 6 follow one a week.`}</div>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate style={{marginTop:"28px",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"24px 28px",display:"flex",alignItems:"center",gap:"24px"}}>
          <div style={{flex:"1"}}>
            <div style={{fontSize:"15px",fontWeight:"600"}}>{"Get chapters 4–6"}</div>
            {invalid ? (
              <div role="alert" style={{fontSize:"12.5px",color:"var(--bad)",marginTop:"4px"}}>{"Add your work email and chapter 4 goes out today."}</div>
            ) : (
              <div style={{fontSize:"12.5px",color:"var(--mut)",marginTop:"4px"}}>{"Sent as a three-week email course."}</div>
            )}
          </div>
          <input
            ref={emailRef}
            type="email"
            name="email"
            aria-label="Work email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setInvalid(false); }}
            style={{border:`1px solid ${invalid ? "var(--bad)" : "var(--brd)"}`,borderRadius:"8px",background:"var(--bg0)",padding:"10px 14px",fontSize:"13px",color:"var(--tx)",width:"240px",fontFamily:"inherit",boxSizing:"border-box"}}
          />
          <button type="submit" className="btn-ac" style={{display:"inline-flex",alignItems:"center",gap:"7px",fontSize:"13px",fontWeight:"600",borderRadius:"8px",padding:"10px 20px",border:"none",cursor:"pointer",fontFamily:"inherit"}}>{"Send it"}<span style={{display:"inline-block"}}>{"→"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
