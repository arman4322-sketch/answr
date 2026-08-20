"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/lib/toast";

/* Sign-up card (client).
   INTERACTIVITY_CONVENTIONS:
   - playbook 9: "Create account" was a bare <Link>. It is now a real form
     submit — validates a non-empty work email, then keeps the original nav
     intent by pushing /onboarding/brand.
   - playbook 10: the OAuth-style buttons toast the credential-login line.
   Toasts render via the Toaster mounted in the (auth) layout.
   Markup, copy and styles are the frame's, verbatim. */

const OAUTH_TOAST = "This demo uses the credential login below — dana@nike.com / answr-demo.";

const oauthBtn: React.CSSProperties = {
  border: "1px solid var(--brd)",
  borderRadius: "8px",
  padding: "10px 0",
  textAlign: "center",
  fontSize: "13px",
  fontWeight: "500",
  background: "var(--bg2)",
  color: "var(--tx)",
  fontFamily: "inherit",
  cursor: "pointer",
  width: "100%",
};

const fieldLabel: React.CSSProperties = {
  display: "block",
  fontSize: "10.5px",
  fontWeight: "500",
  fontVariantNumeric: "tabular-nums",
  color: "var(--fnt)",
};

const fieldInput: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid var(--brd)",
  borderRadius: "8px",
  background: "var(--bg0)",
  padding: "10px 12px",
  fontSize: "13px",
  color: "var(--tx)",
  fontFamily: "inherit",
  marginTop: "7px",
};

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setInvalid(true);
      return;
    }
    router.push("/onboarding/brand");
  }

  return (
    <div className="frame-signup">
      <div style={{width:"100%",maxWidth:"380px",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"32px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"9px"}}>
          <div style={{width:"22px",height:"22px",borderRadius:"6px",background:"linear-gradient(135deg,#a394ff,#6d5ce6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"700",color:"#fff"}}>{"A"}</div>
          <div style={{fontSize:"17px",fontWeight:"600"}}>{"Answr"}</div>
        </div>
        <div style={{fontSize:"19px",fontWeight:"600",marginTop:"24px"}}>{"Start monitoring your brand"}</div>
        <div style={{fontSize:"13px",color:"var(--mut)",marginTop:"5px"}}>{"Free 14-day trial. No card required."}</div>
        <div style={{display:"flex",flexDirection:"column",gap:"10px",marginTop:"22px"}}>
          <button type="button" style={oauthBtn} onClick={() => toast(OAUTH_TOAST)}>{"Continue with Google"}</button>
          <button type="button" style={oauthBtn} onClick={() => toast(OAUTH_TOAST)}>{"Continue with SSO / SAML"}</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"12px",margin:"20px 0"}}>
          <div style={{flex:"1",height:"1px",background:"var(--brd)"}} />
          <span style={{fontSize:"10.5px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>{"OR"}</span>
          <div style={{flex:"1",height:"1px",background:"var(--brd)"}} />
        </div>
        <form onSubmit={submit} noValidate>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
            <div>
              <label htmlFor="signup-first" style={fieldLabel}>{"First name"}</label>
              <input id="signup-first" name="firstName" type="text" placeholder="Dana" autoComplete="given-name" style={fieldInput} />
            </div>
            <div>
              <label htmlFor="signup-last" style={fieldLabel}>{"Last name"}</label>
              <input id="signup-last" name="lastName" type="text" placeholder="Okafor" autoComplete="family-name" style={fieldInput} />
            </div>
          </div>
          <label htmlFor="signup-email" style={{...fieldLabel,marginTop:"14px"}}>{"Work email"}</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setInvalid(false); }}
            style={{...fieldInput,border:`1px solid ${invalid ? "var(--bad)" : "var(--brd)"}`}}
          />
          {invalid && (
            <div role="alert" style={{fontSize:"11.5px",color:"var(--bad)",marginTop:"6px",lineHeight:"1.5"}}>{"Enter your work email to start the trial."}</div>
          )}
          <label htmlFor="signup-password" style={{...fieldLabel,marginTop:"14px"}}>{"Password"}</label>
          <input id="signup-password" name="password" type="password" placeholder="8+ characters" autoComplete="new-password" style={fieldInput} />
          <button type="submit" className="btn-ac" style={{display:"block",width:"100%",textAlign:"center",fontSize:"13px",fontWeight:"600",borderRadius:"8px",padding:"11px 0",marginTop:"20px",border:"none",cursor:"pointer",fontFamily:"inherit"}}>{"Create account"}</button>
        </form>
        <div style={{fontSize:"11.5px",color:"var(--fnt)",marginTop:"14px",textAlign:"center",lineHeight:"1.5"}}>{"By signing up you agree to the "}<Link href="/security">{"Terms"}</Link>{" and "}<Link href="/security">{"Privacy Policy"}</Link>{"."}</div>
      </div>
    </div>
  );
}
