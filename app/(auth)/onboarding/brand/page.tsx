import type { Metadata } from "next";
import BrandField from "./BrandField";

/* Onboarding — step 1 — converted from canvas frame #onboarding-1.
   Primary CTA uses .btn-ac (audit fix); Continue chains to step 2.
   The website field is a client form (BrandField) so Enter advances too. */

export const metadata: Metadata = {
  title: "Onboarding — Brand — Answr",
};

export default function OnboardingBrandPage() {
  return (
    <div className="frame-onboarding-1">
      <div style={{width:"100%",maxWidth:"440px"}}>
        <div style={{display:"flex",gap:"6px",marginBottom:"24px"}}>
          <div style={{flex:"1",height:"3px",borderRadius:"2px",background:"var(--ac)"}} />
          <div style={{flex:"1",height:"3px",borderRadius:"2px",background:"var(--bg2)"}} />
          <div style={{flex:"1",height:"3px",borderRadius:"2px",background:"var(--bg2)"}} />
        </div>
        <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"32px"}}>
          <div style={{fontSize:"10.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>{"Step 1 of 3"}</div>
          <div style={{fontSize:"20px",fontWeight:"600",marginTop:"10px"}}>{"Which brand are we tracking?"}</div>
          <div style={{fontSize:"13px",color:"var(--mut)",marginTop:"6px",lineHeight:"1.55"}}>{"Enter your website. We'll detect your brand name, aliases and owned domains."}</div>
          <BrandField />
        </div>
      </div>
    </div>
  );
}
