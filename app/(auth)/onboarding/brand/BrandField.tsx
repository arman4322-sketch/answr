"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* Onboarding step 1 — the website field (client).
   INTERACTIVITY_CONVENTIONS playbook 9: the field is now a real single-input
   form, so Enter advances the flow the same way "Continue →" does (that Link is
   left exactly as the frame drew it). Empty input shows an inline error instead
   of silently moving on. Field styles are the frame's, verbatim. */

export default function BrandField() {
  const router = useRouter();
  const [website, setWebsite] = useState("nike.com");
  const [invalid, setInvalid] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!website.trim()) {
      setInvalid(true);
      return;
    }
    router.push("/onboarding/competitors");
  }

  return (
    <form onSubmit={submit} noValidate style={{margin:0}}>
      <div style={{border:`1px solid ${invalid ? "var(--bad)" : "var(--ac)"}`,borderRadius:"8px",background:"var(--bg0)",padding:"11px 13px",fontSize:"14px",marginTop:"20px",display:"flex",alignItems:"center",gap:"8px"}}>
        <span style={{color:"var(--fnt)"}}>{"https://"}</span>
        <input
          aria-label="Website"
          name="website"
          type="text"
          value={website}
          onChange={(e) => { setWebsite(e.target.value); setInvalid(false); }}
          style={{flex:"1",minWidth:"0",border:"none",background:"transparent",padding:"0",fontSize:"14px",color:"var(--tx)",fontFamily:"inherit",outline:"none"}}
        />
      </div>
      {invalid && (
        <div role="alert" style={{fontSize:"11.5px",color:"var(--bad)",marginTop:"7px",lineHeight:"1.5"}}>{"Enter the website you want tracked."}</div>
      )}
    </form>
  );
}
