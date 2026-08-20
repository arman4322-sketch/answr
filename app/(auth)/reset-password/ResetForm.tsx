"use client";

import Link from "next/link";
import { useState } from "react";

/* Reset-password card (client).
   INTERACTIVITY_CONVENTIONS playbook 9: "Send reset link" validates a non-empty
   email, then the card swaps to an inline confirmation naming the address.
   Markup, copy and styles are the frame's, verbatim. */

export default function ResetForm() {
  const [email, setEmail] = useState("dana@nike.com");
  const [invalid, setInvalid] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setInvalid(true);
      return;
    }
    setSent(email.trim());
  }

  return (
    <div className="frame-reset-password">
      <div style={{width:"100%",maxWidth:"380px",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"32px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"9px"}}>
          <div style={{width:"22px",height:"22px",borderRadius:"6px",background:"linear-gradient(135deg,#a394ff,#6d5ce6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"700",color:"#fff"}}>{"A"}</div>
          <div style={{fontSize:"17px",fontWeight:"600"}}>{"Answr"}</div>
        </div>
        {sent ? (
          <div role="status">
            <div style={{fontSize:"19px",fontWeight:"600",marginTop:"24px"}}>{"Check your inbox"}</div>
            <div style={{fontSize:"13px",color:"var(--mut)",marginTop:"5px",lineHeight:"1.55"}}>{`We sent a reset link to ${sent}. It expires in 30 minutes — request another if it lapses.`}</div>
            <button
              type="button"
              onClick={() => setSent(null)}
              style={{display:"block",width:"100%",border:"1px solid var(--brd)",background:"var(--bg2)",color:"var(--tx)",cursor:"pointer",textAlign:"center",fontSize:"13px",fontWeight:"500",fontFamily:"inherit",borderRadius:"8px",padding:"11px 0",marginTop:"20px"}}
            >{"Use a different email"}</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div style={{fontSize:"19px",fontWeight:"600",marginTop:"24px"}}>{"Reset your password"}</div>
            <div style={{fontSize:"13px",color:"var(--mut)",marginTop:"5px",lineHeight:"1.55"}}>{"Enter your work email and we'll send a reset link. Links expire after 30 minutes."}</div>
            <label htmlFor="reset-email" style={{display:"block",fontSize:"11.5px",fontWeight:"500",color:"var(--fnt)",marginTop:"22px"}}>{"Email"}</label>
            <input
              id="reset-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setInvalid(false); }}
              autoComplete="email"
              style={{display:"block",width:"100%",boxSizing:"border-box",border:`1px solid ${invalid ? "var(--bad)" : "var(--ac)"}`,borderRadius:"8px",background:"var(--bg0)",padding:"10px 12px",fontSize:"13px",color:"var(--tx)",fontFamily:"inherit",marginTop:"7px"}}
            />
            {invalid && (
              <div role="alert" style={{fontSize:"11.5px",color:"var(--bad)",marginTop:"6px",lineHeight:"1.5"}}>{"Enter the email on your workspace."}</div>
            )}
            <button type="submit" className="btn-ac" style={{display:"block",width:"100%",border:"none",cursor:"pointer",textAlign:"center",fontSize:"13px",fontWeight:"500",fontFamily:"inherit",borderRadius:"8px",padding:"11px 0",marginTop:"20px"}}>{"Send reset link"}</button>
          </form>
        )}
        <div style={{marginTop:"16px",textAlign:"center",fontSize:"12px"}}><Link href="/login">{"← Back to log in"}</Link></div>
        <div style={{marginTop:"18px",padding:"10px 12px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",fontSize:"11.5px",color:"var(--fnt)",lineHeight:"1.55"}}>{"SSO workspaces don't use passwords — "}<Link href="/login">{"continue with SSO"}</Link>{" instead."}</div>
      </div>
    </div>
  );
}
