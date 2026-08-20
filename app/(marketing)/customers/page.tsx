import Link from "next/link";
import type { Metadata } from "next";
import CustomerStories from "./CustomerStories";
import "./page.css";

/* Customers — case studies for MTY Food Group and Bell Media. */

export const metadata: Metadata = {
  title: "Customers — Answr",
};

export default function CustomersPage() {
  return (
    <div className="frame-customers">
      <CustomerStories />
      <div style={{borderTop:"1px solid var(--brd)",padding:"72px 48px",textAlign:"center",backgroundImage:"radial-gradient(rgba(255,255,255,0.045) 1px,transparent 1px)",backgroundSize:"26px 26px"}}><div style={{fontSize:"32px",fontWeight:"600",letterSpacing:"-0.02em"}}>{"Run the model on your brand."}</div><div style={{display:"flex",gap:"12px",justifyContent:"center",marginTop:"24px"}}><Link href="/demo" className="btn-ac" style={{fontSize:"14px",fontWeight:"600",borderRadius:"8px",padding:"11px 24px"}}>{"Get a demo"}</Link></div></div>
    </div>
  );
}
