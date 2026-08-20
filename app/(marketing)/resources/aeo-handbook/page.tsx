import type { Metadata } from "next";
import HandbookBody from "./HandbookBody";
import "./page.css";

export const metadata: Metadata = { title: "The AEO handbook" };

/* AEO handbook — converted from canvas frame #guide.
   Chapter list + email capture live in HandbookBody (client): chapters are real
   accordions and "Send it" swaps the card for an inline confirmation. */
export default function GuidePage() {
  return (
    <div className="frame-guide">
      <div style={{padding:"72px 48px 48px",maxWidth:"880px",margin:"0 auto",textAlign:"center"}}>
        <div style={{display:"inline-block",fontSize:"10.5px",fontWeight:"600",letterSpacing:".14em",textTransform:"uppercase",color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 32%,transparent)",background:"rgba(142,124,242,0.08)",borderRadius:"999px",padding:"6px 14px"}}>{"Free resource"}</div>
        <div style={{fontSize:"44px",fontWeight:"600",letterSpacing:"-0.02em",marginTop:"14px"}}>{"The AEO handbook"}</div>
        <div style={{fontSize:"15px",color:"var(--mut)",lineHeight:"1.65",marginTop:"12px",maxWidth:"560px",marginLeft:"auto",marginRight:"auto",textWrap:"pretty"}}>{"Six chapters on winning AI answers, built from 50,000 sampled prompts. No email wall for the first three."}</div>
        <div style={{display:"flex",justifyContent:"center",gap:"36px",marginTop:"26px",fontVariantNumeric:"tabular-nums"}}>
          <div>
            <div style={{fontSize:"22px",fontWeight:"600",color:"var(--ac)"}}>{"50K"}</div>
            <div style={{fontSize:"10.5px",color:"var(--fnt)",marginTop:"3px"}}>{"PROMPTS SAMPLED"}</div>
          </div>
          <div>
            <div style={{fontSize:"22px",fontWeight:"600",color:"var(--ac)"}}>{"5"}</div>
            <div style={{fontSize:"10.5px",color:"var(--fnt)",marginTop:"3px"}}>{"PLATFORMS"}</div>
          </div>
          <div>
            <div style={{fontSize:"22px",fontWeight:"600",color:"var(--ac)"}}>{"14"}</div>
            <div style={{fontSize:"10.5px",color:"var(--fnt)",marginTop:"3px"}}>{"ORIGINAL CHARTS"}</div>
          </div>
          <div>
            <div style={{fontSize:"22px",fontWeight:"600",color:"var(--ac)"}}>{"64 pp"}</div>
            <div style={{fontSize:"10.5px",color:"var(--fnt)",marginTop:"3px"}}>{"PDF EDITION"}</div>
          </div>
        </div>
        <div style={{display:"inline-flex",alignItems:"center",gap:"10px",marginTop:"24px",border:"1px solid var(--brd)",borderRadius:"9px",padding:"9px 16px",background:"var(--bg1)"}}>
          <div style={{width:"26px",height:"26px",borderRadius:"50%",background:"var(--bg2)",border:"1px solid var(--brd)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:"500",color:"var(--ac)"}}>{"RK"}</div>
          <span style={{fontSize:"12px",color:"var(--mut)"}}>{"Written by "}<span style={{color:"var(--tx)",fontWeight:"500"}}>{"Rui Kimura"}</span>{", Head of Research · updated quarterly"}</span>
        </div>
      </div>
      <HandbookBody />
    </div>
  );
}
