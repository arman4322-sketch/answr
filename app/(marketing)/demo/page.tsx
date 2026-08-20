import type { Metadata } from "next";
import DemoForm from "./DemoForm";
import "./page.css";

export const metadata: Metadata = { title: "Get a demo" };

/* Demo request — converted from canvas frame #demo. */
export default function DemoPage() {
  return (
    <div className="frame-demo">
      <div style={{padding:"80px 48px",display:"grid",gridTemplateColumns:"1fr 460px",gap:"72px",maxWidth:"1180px",margin:"0 auto",alignItems:"start"}}>
        <div>
          <div style={{fontSize:"44px",fontWeight:"600",letterSpacing:"-0.02em",lineHeight:"1.1",textWrap:"balance"}}>{"See your brand through AI's eyes"}</div>
          <div style={{fontSize:"15.5px",color:"var(--mut)",lineHeight:"1.65",marginTop:"14px",textWrap:"pretty"}}>{"Thirty minutes, on your data. We run a starter prompt set for your brand before the call."}</div>
          <div style={{display:"flex",flexDirection:"column",gap:"12px",marginTop:"28px",fontSize:"13.5px"}}>
            <div style={{display:"flex",gap:"11px",alignItems:"baseline"}}>
              <span style={{color:"var(--ac)",fontWeight:"700"}}>{"✓"}</span>{"Your live visibility score across five platforms"}</div>
            <div style={{display:"flex",gap:"11px",alignItems:"baseline"}}>
              <span style={{color:"var(--ac)",fontWeight:"700"}}>{"✓"}</span>{"The three prompts you're losing — and to whom"}</div>
            <div style={{display:"flex",gap:"11px",alignItems:"baseline"}}>
              <span style={{color:"var(--ac)",fontWeight:"700"}}>{"✓"}</span>{"What AI crawlers can and can't read on your site"}</div>
            <div style={{display:"flex",gap:"11px",alignItems:"baseline"}}>
              <span style={{color:"var(--ac)",fontWeight:"700"}}>{"✓"}</span>{"Pricing that fits your prompt volume"}</div>
          </div>
          <div style={{marginTop:"32px",padding:"16px 20px",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",display:"flex",gap:"14px",alignItems:"center"}}>
            <div style={{width:"34px",height:"34px",borderRadius:"50%",background:"var(--bg2)",border:"1px solid var(--brd)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"500",color:"var(--ac)"}}>{"JD"}</div>
            <div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.5"}}>{"Demos run by the GTM team — no SDR relay, no discovery-call purgatory."}</div>
          </div>
        </div>
        <DemoForm />
      </div>
      <div style={{borderTop:"1px solid var(--brd)",padding:"48px",display:"flex",alignItems:"center",justifyContent:"center",gap:"44px",background:"var(--bg1)",flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:"10px",alignItems:"center",fontSize:"12.5px",color:"var(--mut)"}}>
          <span style={{width:"22px",height:"22px",borderRadius:"6px",background:"color-mix(in oklab,var(--ac) 14%,transparent)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"var(--ac)",fontWeight:"700",fontSize:"11px"}}>{"1"}</span>{"Book — we run your starter prompt set overnight"}</div>
        <div style={{display:"flex",gap:"10px",alignItems:"center",fontSize:"12.5px",color:"var(--mut)"}}>
          <span style={{width:"22px",height:"22px",borderRadius:"6px",background:"color-mix(in oklab,var(--ac) 14%,transparent)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"var(--ac)",fontWeight:"700",fontSize:"11px"}}>{"2"}</span>{"30 minutes on your live data, not slides"}</div>
        <div style={{display:"flex",gap:"10px",alignItems:"center",fontSize:"12.5px",color:"var(--mut)"}}>
          <span style={{width:"22px",height:"22px",borderRadius:"6px",background:"color-mix(in oklab,var(--ac) 14%,transparent)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"var(--ac)",fontWeight:"700",fontSize:"11px"}}>{"3"}</span>{"Keep the workspace — trial starts if you want it"}</div>
      </div>
    </div>
  );
}
