import type { Metadata } from "next";
import { configuredProviders } from "@/lib/providers/registry";
import PromptSet from "./PromptSet";

/* Onboarding — step 3 — converted from canvas frame #onboarding-3.
   Primary CTA uses .btn-ac (audit fix); Start monitoring → /app/welcome.

   The lane names come from the provider registry read against this
   deployment's environment, so the summary states the answer engines that are
   really connected instead of the flat "5 platforms" the frame printed. Read
   here (server) because provider keys must never reach the client. */

export const metadata: Metadata = {
  title: "Onboarding — Prompts — Answr",
};

export const dynamic = "force-dynamic";

export default function OnboardingPromptsPage() {
  const lanes = configuredProviders().map((p) => p.label);

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
          <div style={{fontSize:"20px",fontWeight:"600",marginTop:"10px"}}>{"What we'll monitor"}</div>
          <div style={{fontSize:"13px",color:"var(--mut)",marginTop:"6px",lineHeight:"1.55"}}>{"Topic areas generated from your category and competitors. You can edit what's tracked any time."}</div>
          <PromptSet lanes={lanes} />
        </div>
      </div>
    </div>
  );
}
