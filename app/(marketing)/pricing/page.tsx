import Link from "next/link";
import type { Metadata } from "next";
import PricingTiers from "./PricingTiers";
import PricingFaq from "./PricingFaq";

/* Pricing — converted from canvas frame #pricing.
   Interactivity pass: hero toggle + tier cards + compare table live in
   PricingTiers (client — the Annual/Monthly toggle swaps real prices);
   FAQ accordions live in PricingFaq (client). Markup and copy verbatim. */

export const metadata: Metadata = {
  title: "Pricing — Answr",
};

export default function PricingPage() {
  return (
    <div className="frame-pricing">
      <PricingTiers />
      <div style={{maxWidth:"1112px",margin:"0 auto",padding:"16px 64px 64px"}}><div style={{marginTop:"20px",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px 26px",display:"flex",alignItems:"center",gap:"20px"}}><div style={{flex:"1"}}><div style={{fontSize:"14.5px",fontWeight:"600"}}>{"Running AEO for clients?"}</div><div style={{fontSize:"12.5px",color:"var(--mut)",marginTop:"4px"}}>{"Agency plans pool prompt quota across client workspaces and add white-label reporting and pitch mode."}</div></div><Link href="/solutions/agencies" style={{fontSize:"13px",fontWeight:"500",border:"1px solid var(--brd)",borderRadius:"8px",padding:"10px 18px",background:"var(--bg2)",color:"var(--tx)",whiteSpace:"nowrap"}}>{"Agency plans →"}</Link></div></div>
      <PricingFaq />
      <div style={{borderTop:"1px solid var(--brd)",padding:"80px 48px",textAlign:"center",backgroundImage:"radial-gradient(rgba(255,255,255,0.045) 1px,transparent 1px)",backgroundSize:"26px 26px"}}><div style={{fontSize:"34px",fontWeight:"600",letterSpacing:"-0.02em",textWrap:"balance"}}>{"Start with your real prompts."}</div><div style={{fontSize:"15px",color:"var(--mut)",marginTop:"10px"}}>{"Fourteen days, all five platforms, your competitor set."}</div><div style={{display:"flex",gap:"12px",justifyContent:"center",marginTop:"26px"}}><Link href="/demo" className="btn-ac" style={{display:"inline-flex",alignItems:"center",gap:"9px",fontSize:"14px",fontWeight:"600",borderRadius:"8px",padding:"11px 24px"}}>{"Get a demo"}<span style={{display:"inline-block"}}>{"→"}</span></Link><Link href="/signup" style={{fontSize:"14px",fontWeight:"500",color:"var(--tx)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"11px 24px",background:"var(--bg1)"}}>{"Start free trial"}</Link></div></div>
    </div>
  );
}
