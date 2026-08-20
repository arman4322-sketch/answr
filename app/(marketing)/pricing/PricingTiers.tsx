"use client";

import Link from "next/link";
import { useState } from "react";

/* Pricing hero (Annual/Monthly toggle), tier cards and compare table.
   The toggle really swaps displayed prices (interactivity playbook 7):
   Annual $490/$1,290 (current values are the annual rate) ↔ Monthly
   $612/$1,612. The SAVE 20% badge stays anchored on the Annual side. */

const check = (
  <span style={{color:"var(--good)",fontWeight:600}}>{"✓"}</span>
);
const dash = <span style={{color:"var(--fnt)"}}>{"—"}</span>;

const segOn: React.CSSProperties = {fontSize:"12.5px",fontWeight:"600",background:"var(--ac)",color:"#fff",borderRadius:"6px",padding:"7px 18px",border:"none",cursor:"pointer",fontFamily:"inherit"};
const segOff: React.CSSProperties = {fontSize:"12.5px",color:"var(--mut)",padding:"7px 18px",background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit"};

export default function PricingTiers() {
  const [monthly, setMonthly] = useState(false);
  const growth = monthly ? "$612" : "$490";
  const scale = monthly ? "$1,612" : "$1,290";
  const billed = monthly ? "billed monthly" : "billed annually";

  return (
    <>
      <div style={{padding:"72px 48px 40px",textAlign:"center"}}><div style={{fontSize:"46px",fontWeight:"600",letterSpacing:"-0.02em"}}>{"Pricing"}</div><div style={{fontSize:"15px",color:"var(--mut)",marginTop:"10px"}}>{"Every plan monitors all five platforms. Scale by prompts and brands."}</div><div style={{position:"relative",display:"inline-flex",marginTop:"30px"}}><div style={{display:"inline-flex",border:"1px solid var(--brd)",borderRadius:"8px",padding:"3px",background:"var(--bg1)"}}><button type="button" aria-pressed={!monthly} onClick={() => setMonthly(false)} style={monthly ? segOff : segOn}>{"Annual"}</button><button type="button" aria-pressed={monthly} onClick={() => setMonthly(true)} style={monthly ? segOn : segOff}>{"Monthly"}</button></div><div style={{position:"absolute",top:"-17px",left:"-46px",transform:"rotate(-6deg)"}}><div style={{position:"relative",background:"#4cb782",color:"#0b0d0c",fontSize:"10.5px",fontWeight:"700",letterSpacing:".04em",borderRadius:"999px",padding:"5px 11px",boxShadow:"0 6px 18px rgba(76,183,130,.25)"}}>{"SAVE 20%"}<div style={{position:"absolute",bottom:"-3px",right:"9px",width:"8px",height:"8px",background:"#4cb782",transform:"rotate(45deg)",borderRadius:"1.5px"}} /></div></div></div><div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"16px"}}>{"Every plan: unlimited seats · 14-day free trial · no card required"}</div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"20px",padding:"28px 64px 56px",maxWidth:"1240px",margin:"0 auto",alignItems:"start"}}><div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"14px",padding:"26px",marginTop:"14px"}}><div style={{fontSize:"14px",fontWeight:"600"}}>{"Growth"}</div><div style={{display:"flex",alignItems:"baseline",gap:"5px",marginTop:"10px"}}><span style={{fontSize:"30px",fontWeight:"600",fontVariantNumeric:"tabular-nums",letterSpacing:"-0.02em"}}>{growth}</span><span style={{fontSize:"11px",color:"var(--fnt)"}}>{"/mo"}</span></div><div style={{fontSize:"11.5px",color:"var(--fnt)",marginTop:"3px"}}>{"The measurement core · " + billed}</div><div style={{height:"1px",background:"var(--brd)",margin:"18px 0"}} /><div style={{display:"flex",flexDirection:"column",gap:"11px",fontSize:"12.5px",color:"var(--mut)"}}><div style={{display:"flex",gap:"9px"}}><span style={{color:"var(--ac)"}}>{"✓"}</span>{"250 prompts · weekly refresh"}</div><div style={{display:"flex",gap:"9px"}}><span style={{color:"var(--ac)"}}>{"✓"}</span>{"All 5 platforms, 3 competitors"}</div><div style={{display:"flex",gap:"9px"}}><span style={{color:"var(--ac)"}}>{"✓"}</span>{"Citations & prompt analytics"}</div><div style={{display:"flex",gap:"9px"}}><span style={{color:"var(--ac)"}}>{"✓"}</span>{"Unlimited seats"}</div></div><Link href="/signup" style={{display:"block",textAlign:"center",fontSize:"12.5px",fontWeight:"500",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"10px 0",marginTop:"22px",background:"var(--bg2)"}}>{"Start free trial"}</Link></div><div style={{background:"var(--bg1)",border:"1px solid color-mix(in oklab,var(--ac) 55%,transparent)",borderRadius:"14px",padding:"26px",boxShadow:"0 28px 90px color-mix(in oklab,var(--ac) 12%,transparent)",position:"relative"}}><div style={{position:"absolute",top:"-11px",left:"50%",transform:"translateX(-50%)",fontSize:"9.5px",fontWeight:"700",letterSpacing:".1em",background:"var(--ac)",color:"#fff",borderRadius:"999px",padding:"4px 12px"}}>{"MOST POPULAR"}</div><div style={{fontSize:"14px",fontWeight:"600",color:"var(--ac)"}}>{"Scale"}</div><div style={{display:"flex",alignItems:"baseline",gap:"5px",marginTop:"10px"}}><span style={{fontSize:"30px",fontWeight:"600",fontVariantNumeric:"tabular-nums",letterSpacing:"-0.02em"}}>{scale}</span><span style={{fontSize:"11px",color:"var(--fnt)"}}>{"/mo"}</span></div><div style={{fontSize:"11.5px",color:"var(--fnt)",marginTop:"3px"}}>{"Everything in Growth, plus"}</div><div style={{height:"1px",background:"color-mix(in oklab,var(--ac) 25%,var(--brd))",margin:"18px 0"}} /><div style={{display:"flex",flexDirection:"column",gap:"11px",fontSize:"12.5px",color:"var(--tx)"}}><div style={{display:"flex",gap:"9px"}}><span style={{color:"var(--ac)",fontWeight:"700"}}>{"+"}</span>{"1,000 prompts · daily refresh · 3 brands"}</div><div style={{display:"flex",gap:"9px"}}><span style={{color:"var(--ac)",fontWeight:"700"}}>{"+"}</span>{"Conversations & Demand"}</div><div style={{display:"flex",gap:"9px"}}><span style={{color:"var(--ac)",fontWeight:"700"}}>{"+"}</span>{"Agent Analytics with alerts"}</div><div style={{display:"flex",gap:"9px"}}><span style={{color:"var(--ac)",fontWeight:"700"}}>{"+"}</span>{"Workflows, API & MCP access"}</div></div><Link href="/signup" className="btn-ac" style={{display:"block",textAlign:"center",fontSize:"12.5px",fontWeight:"600",borderRadius:"8px",padding:"10px 0",marginTop:"22px"}}>{"Start free trial "}<span style={{display:"inline-block",marginLeft:"2px"}}>{"→"}</span></Link></div><div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"14px",padding:"26px",marginTop:"14px"}}><div style={{fontSize:"14px",fontWeight:"600"}}>{"Enterprise"}</div><div style={{display:"flex",alignItems:"baseline",gap:"5px",marginTop:"10px"}}><span style={{fontSize:"30px",fontWeight:"600",letterSpacing:"-0.02em"}}>{"Custom"}</span></div><div style={{fontSize:"11.5px",color:"var(--fnt)",marginTop:"3px"}}>{"Everything in Scale, plus"}</div><div style={{height:"1px",background:"var(--brd)",margin:"18px 0"}} /><div style={{display:"flex",flexDirection:"column",gap:"11px",fontSize:"12.5px",color:"var(--mut)"}}><div style={{display:"flex",gap:"9px"}}><span style={{color:"var(--ac)",fontWeight:"700"}}>{"+"}</span>{"Unlimited workspaces & prompts"}</div><div style={{display:"flex",gap:"9px"}}><span style={{color:"var(--ac)",fontWeight:"700"}}>{"+"}</span>{"SSO / SAML, SCIM & audit log"}</div><div style={{display:"flex",gap:"9px"}}><span style={{color:"var(--ac)",fontWeight:"700"}}>{"+"}</span>{"White-label & data residency"}</div><div style={{display:"flex",gap:"9px"}}><span style={{color:"var(--ac)",fontWeight:"700"}}>{"+"}</span>{"Named success engineer · priority support"}</div></div><Link href="/demo" style={{display:"block",textAlign:"center",fontSize:"12.5px",fontWeight:"500",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"10px 0",marginTop:"22px",background:"var(--bg2)"}}>{"Talk to sales"}</Link></div></div>
      {/* Plan comparison — audit fix: s-agencies links here promising "Compare plans".
          Rows are built only from facts stated in the tier bullets / hero note / FAQ. */}
      <div id="compare" style={{maxWidth:"1112px",margin:"0 auto",padding:"8px 64px 16px"}}>
        <div style={{fontSize:"22px",fontWeight:"600",textAlign:"center",marginBottom:"24px"}}>{"Compare plans"}</div>
        <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12.5px"}}>
              <thead>
                <tr>
                  <th scope="col" style={{textAlign:"left",padding:"16px 22px",width:"34%"}}><span style={{fontSize:"10px",fontWeight:"500",letterSpacing:".08em",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"PLANS"}</span></th>
                  <th scope="col" style={{textAlign:"center",padding:"16px 14px"}}><div style={{fontSize:"13px",fontWeight:"600"}}>{"Growth"}</div><div style={{fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums",marginTop:"3px",fontWeight:"400"}}>{growth + "/mo"}</div></th>
                  <th scope="col" style={{textAlign:"center",padding:"16px 14px"}}><div style={{fontSize:"13px",fontWeight:"600",color:"var(--ac)"}}>{"Scale"}</div><div style={{fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums",marginTop:"3px",fontWeight:"400"}}>{scale + "/mo"}</div></th>
                  <th scope="col" style={{textAlign:"center",padding:"16px 14px"}}><div style={{fontSize:"13px",fontWeight:"600"}}>{"Enterprise"}</div><div style={{fontSize:"11px",color:"var(--fnt)",marginTop:"3px",fontWeight:"400"}}>{"Custom"}</div></th>
                </tr>
              </thead>
              <tbody style={{fontVariantNumeric:"tabular-nums"}}>
                {[
                  ["Tracked prompts", "250", "1,000", "Unlimited"],
                  ["Answer refresh", "Weekly", "Daily", "Daily"],
                  ["AI platforms", "All 5", "All 5", "All 5"],
                  ["Competitors tracked", "3", "3", "3"],
                  ["Multi-brand workspaces", dash, "3 brands", "Unlimited"],
                  ["Seats", "Unlimited", "Unlimited", "Unlimited"],
                  ["Citations & prompt analytics", check, check, check],
                  ["Conversations & Demand", dash, check, check],
                  ["Agent Analytics with alerts", dash, check, check],
                  ["Workflows, API & MCP access", dash, check, check],
                  ["SSO / SAML, SCIM & audit log", dash, dash, check],
                  ["White-label & data residency", dash, dash, check],
                  ["Named success engineer · priority support", dash, dash, check],
                ].map(([label, g, s, e], i) => (
                  <tr key={i}>
                    <th scope="row" style={{textAlign:"left",fontWeight:"400",color:"var(--mut)",padding:"11px 22px",borderTop:"1px solid var(--brd)"}}>{label}</th>
                    <td style={{textAlign:"center",padding:"11px 14px",borderTop:"1px solid var(--brd)"}}>{g}</td>
                    <td style={{textAlign:"center",padding:"11px 14px",borderTop:"1px solid var(--brd)"}}>{s}</td>
                    <td style={{textAlign:"center",padding:"11px 14px",borderTop:"1px solid var(--brd)"}}>{e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
