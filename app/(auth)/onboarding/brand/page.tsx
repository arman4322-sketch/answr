import Link from "next/link";
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
          <div style={{marginTop:"16px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
              <div style={{width:"34px",height:"34px",borderRadius:"8px",background:"var(--bg2)",border:"1px solid var(--brd)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"700",fontSize:"15px",color:"var(--ac)"}}>{"N"}</div>
              <div>
                <div style={{fontSize:"14px",fontWeight:"600"}}>{"Nike"}</div>
                <div style={{fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>{"Athletic footwear & apparel · Sportswear"}</div>
              </div>
              <div style={{marginLeft:"auto",fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--ac)"}}>{"DETECTED ✓"}</div>
            </div>
            <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginTop:"14px"}}>
              <span style={{fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",background:"var(--bg2)",border:"1px solid var(--brd)",borderRadius:"5px",padding:"4px 9px"}}>{"Nike Running"}</span>
              <span style={{fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",background:"var(--bg2)",border:"1px solid var(--brd)",borderRadius:"5px",padding:"4px 9px"}}>{"help.nike.com"}</span>
              <span style={{fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",background:"var(--bg2)",border:"1px solid var(--brd)",borderRadius:"5px",padding:"4px 9px"}}>{"nikeinc"}</span>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:"24px"}}>
            <Link href="/onboarding/competitors" className="btn-ac" style={{display:"inline-block",fontSize:"13px",fontWeight:"600",borderRadius:"8px",padding:"10px 22px"}}>{"Continue →"}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
