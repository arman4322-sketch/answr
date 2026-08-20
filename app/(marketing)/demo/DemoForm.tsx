"use client";

import Link from "next/link";
import { useState } from "react";

/* Demo booking card (client). Marketing tone — no demo toasts:
   - "What are you hoping to learn?" chips toggle for real (multi-select).
   - "Pick a time" validates a non-empty work email, then the card swaps to an
     inline success state in the page's voice. Markup and copy verbatim. */

const chips = [
  "Where we stand vs competitors",
  "Fixing crawler access",
  "Agency / multi-brand",
];

const chipOn: React.CSSProperties = {fontSize:"11.5px",fontWeight:"500",color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 45%,transparent)",background:"rgba(142,124,242,0.10)",borderRadius:"6px",padding:"6px 11px",cursor:"pointer",fontFamily:"inherit"};
const chipOff: React.CSSProperties = {fontSize:"11.5px",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"6px",padding:"6px 11px",background:"transparent",cursor:"pointer",fontFamily:"inherit",fontWeight:"400"};

export default function DemoForm() {
  const [selected, setSelected] = useState<boolean[]>([true, false, false]);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("nike.com");
  const [invalid, setInvalid] = useState(false);
  const [booked, setBooked] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setInvalid(true);
      return;
    }
    setBooked(true);
  }

  if (booked) {
    return (
      <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"14px",padding:"28px"}}>
        <div role="status">
          <div style={{display:"flex",gap:"11px",alignItems:"baseline"}}>
            <span style={{color:"var(--ac)",fontWeight:"700"}}>{"✓"}</span>
            <span style={{fontSize:"15px",fontWeight:"600"}}>{"Thanks — we'll be in touch within one business day."}</span>
          </div>
          <div style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.6",marginTop:"12px"}}>{`Your pick-a-time link goes to ${email.trim()}. Overnight we'll run a starter prompt set for ${website.trim() || "your site"} — the demo starts from your live data, not slides.`}</div>
          {selected.some(Boolean) && (
            <div style={{fontSize:"12.5px",color:"var(--fnt)",lineHeight:"1.6",marginTop:"10px"}}>{`We'll lead with: ${chips.filter((_, i) => selected[i]).join(" · ")}.`}</div>
          )}
        </div>
        <div style={{fontSize:"11px",color:"var(--fnt)",marginTop:"18px",textAlign:"center",lineHeight:"1.5"}}>{"Or start a "}<Link href="/signup">{"14-day free trial"}</Link>{" — no card required."}</div>
      </div>
    );
  }

  return (
    <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"14px",padding:"28px"}}>
      <div style={{fontSize:"15px",fontWeight:"600"}}>{"Book your demo"}</div>
      <form onSubmit={submit} noValidate>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginTop:"18px"}}>
          <div>
            <label htmlFor="demo-first-name" style={{display:"block",fontSize:"10.5px",fontWeight:"500",color:"var(--fnt)"}}>{"First name"}</label>
            <input id="demo-first-name" name="firstName" type="text" placeholder="Dana" style={{display:"block",width:"100%",border:"1px solid var(--brd)",borderRadius:"8px",background:"var(--bg0)",padding:"10px 12px",fontSize:"13px",color:"var(--tx)",marginTop:"6px",fontFamily:"inherit",boxSizing:"border-box"}} />
          </div>
          <div>
            <label htmlFor="demo-last-name" style={{display:"block",fontSize:"10.5px",fontWeight:"500",color:"var(--fnt)"}}>{"Last name"}</label>
            <input id="demo-last-name" name="lastName" type="text" placeholder="Okafor" style={{display:"block",width:"100%",border:"1px solid var(--brd)",borderRadius:"8px",background:"var(--bg0)",padding:"10px 12px",fontSize:"13px",color:"var(--tx)",marginTop:"6px",fontFamily:"inherit",boxSizing:"border-box"}} />
          </div>
        </div>
        <label htmlFor="demo-email" style={{display:"block",fontSize:"10.5px",fontWeight:"500",color:"var(--fnt)",marginTop:"14px"}}>{"Work email"}</label>
        <input
          id="demo-email"
          name="email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setInvalid(false); }}
          style={{display:"block",width:"100%",border:`1px solid ${invalid ? "var(--bad)" : "var(--brd)"}`,borderRadius:"8px",background:"var(--bg0)",padding:"10px 12px",fontSize:"13px",color:"var(--tx)",marginTop:"6px",fontFamily:"inherit",boxSizing:"border-box"}}
        />
        {invalid && (
          <div role="alert" style={{fontSize:"11.5px",color:"var(--bad)",marginTop:"6px",lineHeight:"1.5"}}>{"Enter your work email — the pick-a-time link goes there."}</div>
        )}
        <label htmlFor="demo-website" style={{display:"block",fontSize:"10.5px",fontWeight:"500",color:"var(--fnt)",marginTop:"14px"}}>{"Company website"}</label>
        <div style={{display:"flex",alignItems:"center",border:"1px solid var(--ac)",borderRadius:"8px",background:"var(--bg0)",padding:"10px 12px",fontSize:"13px",marginTop:"6px"}}>
          <span style={{color:"var(--fnt)"}}>{"https://"}</span>
          <input id="demo-website" name="website" type="text" value={website} onChange={(e) => setWebsite(e.target.value)} style={{flex:"1",minWidth:"0",border:"none",outline:"none",background:"transparent",color:"var(--tx)",fontSize:"13px",padding:"0",fontFamily:"inherit"}} />
        </div>
        <div style={{fontSize:"10.5px",fontWeight:"500",color:"var(--fnt)",marginTop:"14px"}}>{"What are you hoping to learn?"}</div>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginTop:"8px"}}>
          {chips.map((label, i) => (
            <button
              key={label}
              type="button"
              aria-pressed={selected[i]}
              onClick={() => setSelected((s) => s.map((v, j) => (j === i ? !v : v)))}
              style={selected[i] ? chipOn : chipOff}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="submit" className="btn-ac" style={{display:"flex",width:"100%",alignItems:"center",justifyContent:"center",gap:"8px",fontSize:"13.5px",fontWeight:"600",borderRadius:"8px",padding:"12px 0",marginTop:"22px",border:"none",cursor:"pointer",fontFamily:"inherit"}}>{"Pick a time"}<span style={{display:"inline-block"}}>{"→"}</span>
        </button>
      </form>
      <div style={{fontSize:"11px",color:"var(--fnt)",marginTop:"12px",textAlign:"center",lineHeight:"1.5"}}>{"Or start a "}<Link href="/signup">{"14-day free trial"}</Link>{" — no card required."}</div>
    </div>
  );
}
