import Link from "next/link";
import type { Metadata } from "next";
import IndexExplorer from "./IndexExplorer";
import "./page.css";

export const metadata: Metadata = { title: "The Answr Index" };

/* Answr Index — converted from canvas frame #index.
   The hero platform chips + ranked table live in IndexExplorer (client) so the
   chips filter and the search field works. */
export default function IndexPage() {
  return (
    <div className="frame-index">
      <IndexExplorer />
      <div style={{borderTop:"1px solid var(--brd)",padding:"72px 48px",textAlign:"center",backgroundImage:"radial-gradient(rgba(255,255,255,0.045) 1px,transparent 1px)",backgroundSize:"26px 26px"}}>
        <div style={{fontSize:"30px",fontWeight:"600",letterSpacing:"-0.02em"}}>{"Where does your domain rank?"}</div>
        <div style={{display:"flex",gap:"12px",justifyContent:"center",marginTop:"24px"}}>
          <Link href="/demo" style={{display:"inline-flex",alignItems:"center",gap:"9px",fontSize:"14px",fontWeight:"600",borderRadius:"8px",padding:"11px 24px"}} className="btn-ac">{"Get a demo"}<span style={{display:"inline-block"}}>{"→"}</span>
          </Link>
          <Link href="/resources/aeo-handbook" style={{fontSize:"14px",fontWeight:"500",color:"var(--tx)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"11px 24px",background:"var(--bg1)"}}>{"Read the AEO handbook"}</Link>
        </div>
      </div>
    </div>
  );
}
