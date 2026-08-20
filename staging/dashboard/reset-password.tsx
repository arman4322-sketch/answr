import Link from "next/link";
import "./reset-password.css";

/* Reset password — auto-converted from canvas frame #reset-password. */
export default function Frame() {
  return (
    <div className="frame-reset-password">
      <div style={{background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"12px",minHeight:"700px",display:"flex",alignItems:"center",justifyContent:"center",backgroundImage:"radial-gradient(rgba(255,255,255,0.045) 1px,transparent 1px)",backgroundSize:"24px 24px"}}><div style={{width:"380px",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"32px"}}><div style={{display:"flex",alignItems:"center",gap:"9px"}}><div style={{width:"22px",height:"22px",borderRadius:"6px",background:"linear-gradient(135deg,#a394ff,#6d5ce6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"700",color:"#fff"}}>{"A"}</div><div style={{fontSize:"17px",fontWeight:"600"}}>{"Answr"}</div></div><div style={{fontSize:"19px",fontWeight:"600",marginTop:"24px"}}>{"Reset your password"}</div><div style={{fontSize:"13px",color:"var(--mut)",marginTop:"5px",lineHeight:"1.55"}}>{"Enter your work email and we'll send a reset link. Links expire after 30 minutes."}</div><div style={{fontSize:"11.5px",fontWeight:"500",color:"var(--fnt)",marginTop:"22px"}}>{"Email"}</div><div style={{border:"1px solid var(--ac)",borderRadius:"8px",background:"var(--bg0)",padding:"10px 12px",fontSize:"13px",marginTop:"7px"}}>{"dana@solara.io"}</div><div style={{textAlign:"center",fontSize:"13px",fontWeight:"500",color:"#fff",background:"var(--ac)",borderRadius:"8px",padding:"11px 0",marginTop:"20px"}}>{"Send reset link"}</div><div style={{marginTop:"16px",textAlign:"center",fontSize:"12px"}}><Link href="/login">{"← Back to log in"}</Link></div><div style={{marginTop:"18px",padding:"10px 12px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",fontSize:"11.5px",color:"var(--fnt)",lineHeight:"1.55"}}>{"SSO workspaces don't use passwords — "}<Link href="/login">{"continue with SSO"}</Link>{" instead."}</div></div></div>
    </div>
  );
}
