import Link from "next/link";
import type { Metadata } from "next";
import "./page.css";

export const metadata: Metadata = { title: "About" };

/* About — converted from canvas frame #about. */
export default function AboutPage() {
  return (
    <div className="frame-about">
      <div style={{padding:"88px 48px",maxWidth:"900px",margin:"0 auto"}}>
        <div style={{display:"inline-block",fontSize:"10.5px",fontWeight:"600",letterSpacing:".14em",textTransform:"uppercase",color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 32%,transparent)",background:"rgba(142,124,242,0.08)",borderRadius:"999px",padding:"6px 14px"}}>{"About"}</div>
        <div style={{fontSize:"44px",fontWeight:"600",letterSpacing:"-0.025em",lineHeight:"1.25",marginTop:"18px",textWrap:"balance"}}>{"Search told you what people typed. AI answers decide what they believe. We measure the layer in between."}</div>
        <div style={{fontSize:"15.5px",color:"var(--mut)",lineHeight:"1.75",marginTop:"24px",maxWidth:"680px",textWrap:"pretty"}}>{"Answr started in 2024, when our founders watched a product with the best docs in its category lose every AI recommendation to a competitor with better citations. The tooling to even notice didn't exist. So we built it: consented sampling across the major answer engines, citation tracing, and a workflow that turns visibility gaps into shippable fixes."}</div>
      </div>
      <div style={{borderTop:"1px solid var(--brd)",padding:"56px 48px",maxWidth:"900px",margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"100px 1fr",gap:"24px",padding:"18px 0"}}>
          <div style={{fontSize:"12px",fontWeight:"600",color:"var(--ac)",fontVariantNumeric:"tabular-nums"}}>{"2024"}</div>
          <div style={{fontSize:"14px",color:"var(--mut)",lineHeight:"1.6"}}>
            <span style={{color:"var(--tx)",fontWeight:"500"}}>{"Founded."}</span>{" First prototype samples 3 platforms for 12 design partners."}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"100px 1fr",gap:"24px",padding:"18px 0",borderTop:"1px solid var(--brd)"}}>
          <div style={{fontSize:"12px",fontWeight:"600",color:"var(--ac)",fontVariantNumeric:"tabular-nums"}}>{"2025"}</div>
          <div style={{fontSize:"14px",color:"var(--mut)",lineHeight:"1.6"}}>
            <span style={{color:"var(--tx)",fontWeight:"500"}}>{"The consented panel network launches"}</span>{" — 2.1M conversations a month — alongside Agent Analytics and the Actions queue."}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"100px 1fr",gap:"24px",padding:"18px 0",borderTop:"1px solid var(--brd)"}}>
          <div style={{fontSize:"12px",fontWeight:"600",color:"var(--ac)",fontVariantNumeric:"tabular-nums"}}>{"2026"}</div>
          <div style={{fontSize:"14px",color:"var(--mut)",lineHeight:"1.6"}}>
            <span style={{color:"var(--tx)",fontWeight:"500"}}>{"2,400 teams, the Answr Index, G2 category leader."}</span>{" Demand tracking and Workflows ship; SOC 2 Type II renewed."}</div>
        </div>
      </div>
      <div style={{borderTop:"1px solid var(--brd)",padding:"64px 48px",maxWidth:"1280px",margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"20px"}}>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"26px"}}>
            <div style={{fontSize:"10.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",letterSpacing:".14em",color:"var(--ac)"}}>{"PRINCIPLE 01"}</div>
            <div style={{fontSize:"16px",fontWeight:"600",marginTop:"12px"}}>{"Measure, don't guess"}</div>
            <div style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.6",marginTop:"7px"}}>{"Every recommendation in the product traces to sampled answers you can open and read."}</div>
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"26px"}}>
            <div style={{fontSize:"10.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",letterSpacing:".14em",color:"var(--ac)"}}>{"PRINCIPLE 02"}</div>
            <div style={{fontSize:"16px",fontWeight:"600",marginTop:"12px"}}>{"Consent everywhere"}</div>
            <div style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.6",marginTop:"7px"}}>{"Conversation data comes from opt-in panels. No scraping private sessions, ever."}</div>
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"26px"}}>
            <div style={{fontSize:"10.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",letterSpacing:".14em",color:"var(--ac)"}}>{"PRINCIPLE 03"}</div>
            <div style={{fontSize:"16px",fontWeight:"600",marginTop:"12px"}}>{"Ship the fix"}</div>
            <div style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.6",marginTop:"7px"}}>{"Dashboards are the start. The product isn't done until an action ships and the lift is measured."}</div>
          </div>
        </div>
      </div>
      <div id="open-roles" style={{borderTop:"1px solid var(--brd)",padding:"64px 48px",maxWidth:"900px",margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between"}}>
          <div style={{fontSize:"24px",fontWeight:"600"}}>{"Open roles"}</div>
          <div style={{fontSize:"12px",color:"var(--fnt)"}}>{"Remote-first · async by default"}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",marginTop:"20px"}}>
          <a href="mailto:careers@answr.io?subject=Application%3A%20Research%20engineer%2C%20answer%20sampling" style={{display:"flex",alignItems:"center",gap:"16px",padding:"16px 4px",borderTop:"1px solid var(--brd)",color:"inherit",cursor:"pointer"}} className="hv9">
            <div style={{flex:"1"}}>
              <div style={{fontSize:"14.5px",fontWeight:"600"}}>{"Research engineer, answer sampling"}</div>
              <div style={{fontSize:"11.5px",color:"var(--fnt)",marginTop:"3px"}}>{"Research · Remote (EU or US)"}</div>
            </div>
            <span style={{fontSize:"12px",color:"var(--ac)",fontWeight:"500"}}>{"Apply →"}</span>
          </a>
          <a href="mailto:careers@answr.io?subject=Application%3A%20Senior%20product%20designer" style={{display:"flex",alignItems:"center",gap:"16px",padding:"16px 4px",borderTop:"1px solid var(--brd)",color:"inherit",cursor:"pointer"}} className="hv10">
            <div style={{flex:"1"}}>
              <div style={{fontSize:"14.5px",fontWeight:"600"}}>{"Senior product designer"}</div>
              <div style={{fontSize:"11.5px",color:"var(--fnt)",marginTop:"3px"}}>{"Design · Remote (US time zones)"}</div>
            </div>
            <span style={{fontSize:"12px",color:"var(--ac)",fontWeight:"500"}}>{"Apply →"}</span>
          </a>
          <a href="mailto:careers@answr.io?subject=Application%3A%20Founding%20account%20executive" style={{display:"flex",alignItems:"center",gap:"16px",padding:"16px 4px",borderTop:"1px solid var(--brd)",borderBottom:"1px solid var(--brd)",color:"inherit",cursor:"pointer"}} className="hv11">
            <div style={{flex:"1"}}>
              <div style={{fontSize:"14.5px",fontWeight:"600"}}>{"Founding account executive"}</div>
              <div style={{fontSize:"11.5px",color:"var(--fnt)",marginTop:"3px"}}>{"GTM · New York or remote"}</div>
            </div>
            <span style={{fontSize:"12px",color:"var(--ac)",fontWeight:"500"}}>{"Apply →"}</span>
          </a>
        </div>
      </div>
      <div style={{borderTop:"1px solid var(--brd)",padding:"72px 48px",textAlign:"center",backgroundImage:"radial-gradient(rgba(255,255,255,0.045) 1px,transparent 1px)",backgroundSize:"26px 26px"}}>
        <div style={{fontSize:"30px",fontWeight:"600",letterSpacing:"-0.02em"}}>{"Help us measure the answer layer."}</div>
        <div style={{display:"flex",gap:"12px",justifyContent:"center",marginTop:"24px"}}>
          <a href="#open-roles" className="btn-ac" style={{display:"inline-block",fontSize:"14px",fontWeight:"600",borderRadius:"8px",padding:"11px 24px"}}>{"See open roles"}</a>
          <Link href="/demo" style={{fontSize:"14px",fontWeight:"500",color:"var(--tx)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"11px 24px",background:"var(--bg1)"}}>{"Get in touch"}</Link>
        </div>
      </div>
    </div>
  );
}
