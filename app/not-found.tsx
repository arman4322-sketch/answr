import Link from "next/link";
import type { Metadata } from "next";
import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import "./not-found.css";

export const metadata: Metadata = { title: "Page not found" };

/* Global 404 — converted from canvas frame #notfound; sits outside the
   (marketing) route group, so it renders Nav/Footer in the same shell the
   marketing layout uses. */
export default function NotFound() {
  return (
    <div style={{ background: "var(--bg0)", minHeight: "100vh" }}>
      <div className="mkt" style={{ maxWidth: "1440px", margin: "0 auto" }}>
        <Nav />
        <div className="frame-notfound">
        <div style={{padding:"110px 48px 120px",textAlign:"center",backgroundImage:"radial-gradient(rgba(255,255,255,0.045) 1px,transparent 1px)",backgroundSize:"26px 26px"}}>
          <div style={{display:"inline-block",fontSize:"10.5px",fontWeight:"600",letterSpacing:".14em",textTransform:"uppercase",color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 32%,transparent)",background:"rgba(142,124,242,0.08)",borderRadius:"999px",padding:"6px 14px"}}>{"Error 404"}</div>
          <div style={{fontSize:"96px",fontWeight:"600",letterSpacing:"-0.04em",lineHeight:"1",marginTop:"22px",background:"linear-gradient(180deg,var(--tx),color-mix(in oklab,var(--ac) 55%,var(--tx)))",WebkitBackgroundClip:"text",backgroundClip:"text",WebkitTextFillColor:"transparent"}}>{"404"}</div>
          <div style={{fontSize:"22px",fontWeight:"600",letterSpacing:"-0.015em",marginTop:"18px"}}>{"This answer doesn't exist."}</div>
          <div style={{fontSize:"14px",color:"var(--mut)",lineHeight:"1.65",marginTop:"10px",maxWidth:"440px",marginLeft:"auto",marginRight:"auto",textWrap:"pretty"}}>{"We sampled all five platforms and none of them could find this page. It may have moved — these routes still resolve."}</div>
          <div style={{display:"flex",gap:"12px",justifyContent:"center",marginTop:"30px"}}>
            <Link href="/" style={{display:"inline-flex",alignItems:"center",gap:"9px",fontSize:"14px",fontWeight:"600",borderRadius:"8px",padding:"11px 24px"}} className="btn-ac">{"Back to the homepage"}<span style={{display:"inline-block"}}>{"→"}</span>
            </Link>
            <Link href="/product/answer-engine-insights" style={{fontSize:"14px",fontWeight:"500",color:"var(--tx)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"11px 24px",background:"var(--bg1)"}}>{"Explore the product"}</Link>
          </div>
          <div style={{display:"flex",gap:"8px",justifyContent:"center",marginTop:"26px",fontSize:"11.5px",flexWrap:"wrap"}}>
            <Link href="/pricing" style={{color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"6px",padding:"6px 13px"}} className="hv11">{"Pricing"}</Link>
            <Link href="/customers" style={{color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"6px",padding:"6px 13px"}} className="hv12">{"Customers"}</Link>
            <Link href="/blog" style={{color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"6px",padding:"6px 13px"}} className="hv13">{"Blog"}</Link>
            <Link href="/demo" style={{color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"6px",padding:"6px 13px"}} className="hv14">{"Get a demo"}</Link>
          </div>
          <div style={{fontSize:"11px",color:"var(--fnt)",marginTop:"28px"}}>{"Think a link is broken? "}<a href="mailto:support@answr.io?subject=Broken%20link%20on%20answr.io" style={{color:"var(--mut)",cursor:"pointer"}}>{"support@answr.io"}</a>
          </div>
        </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
