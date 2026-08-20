import type { Metadata } from "next";
import PromptSet from "./PromptSet";

/* Onboarding — step 3 — converted from canvas frame #onboarding-3.
   Primary CTA uses .btn-ac (audit fix); Start monitoring → /app/welcome.
   The summary card, topic rows and step CTAs live in PromptSet (client): topic
   rows are real include/exclude toggles and "+ 2 more topics" expands. */

export const metadata: Metadata = {
  title: "Onboarding — Prompts — Answr",
};

export default function OnboardingPromptsPage() {
  return (
    <div className="frame-onboarding-3">
      <div style={{width:"100%",maxWidth:"440px"}}>
        <div style={{display:"flex",gap:"6px",marginBottom:"24px"}}>
          <div style={{flex:"1",height:"3px",borderRadius:"2px",background:"var(--ac)"}} />
          <div style={{flex:"1",height:"3px",borderRadius:"2px",background:"var(--ac)"}} />
          <div style={{flex:"1",height:"3px",borderRadius:"2px",background:"var(--ac)"}} />
        </div>
        <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"32px"}}>
          <div style={{fontSize:"10.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>{"Step 3 of 3"}</div>
          <div style={{fontSize:"20px",fontWeight:"600",marginTop:"10px"}}>{"Your starting prompt set"}</div>
          <div style={{fontSize:"13px",color:"var(--mut)",marginTop:"6px",lineHeight:"1.55"}}>{"Generated from your category and competitors. You can edit these any time."}</div>
          <PromptSet />
        </div>
      </div>
    </div>
  );
}
