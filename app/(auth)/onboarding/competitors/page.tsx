import Link from "next/link";
import type { Metadata } from "next";
import CompetitorPicker from "./CompetitorPicker";
import "./page.css";

/* Onboarding — step 2 — converted from canvas frame #onboarding-2.
   Primary CTA uses .btn-ac (audit fix); Back/Continue chain steps 1 ↔ 3.
   The list itself is CompetitorPicker (client): real add/remove local state. */

export const metadata: Metadata = {
  title: "Onboarding — Competitors — Answr",
};

export default function OnboardingCompetitorsPage() {
  return (
    <div className="frame-onboarding-2">
      <div style={{width:"100%",maxWidth:"440px"}}>
        <div style={{display:"flex",gap:"6px",marginBottom:"24px"}}>
          <div style={{flex:"1",height:"3px",borderRadius:"2px",background:"var(--ac)"}} />
          <div style={{flex:"1",height:"3px",borderRadius:"2px",background:"var(--ac)"}} />
          <div style={{flex:"1",height:"3px",borderRadius:"2px",background:"var(--bg2)"}} />
        </div>
        <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"32px"}}>
          <div style={{fontSize:"10.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>{"Step 2 of 3"}</div>
          <div style={{fontSize:"20px",fontWeight:"600",marginTop:"10px"}}>{"Who do you compete with?"}</div>
          <div style={{fontSize:"13px",color:"var(--mut)",marginTop:"6px",lineHeight:"1.55"}}>{"Share of voice is measured against these brands. Add up to 10."}</div>
          <CompetitorPicker />
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"24px"}}>
            <Link href="/onboarding/brand" style={{fontSize:"13px",color:"var(--fnt)"}}>{"← Back"}</Link>
            <Link href="/onboarding/prompts" className="btn-ac" style={{display:"inline-block",fontSize:"13px",fontWeight:"600",borderRadius:"8px",padding:"10px 22px"}}>{"Continue →"}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
