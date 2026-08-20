import Link from "next/link";
import LogoWall from "@/components/marketing/LogoWall";
import SnapshotForm from "./SnapshotForm";
import "./page.css";

export const metadata = {
  title: "Answr — Know what AI says about your brand",
};

/* Homepage — converted from canvas frame #home. */
export default function HomePage() {
  return (
    <div className="frame-home">
<div style={{padding:"96px 48px 72px",textAlign:"center",backgroundImage:"radial-gradient(rgba(255,255,255,0.045) 1px,transparent 1px)",backgroundSize:"26px 26px"}}>
<div style={{display:"inline-block",fontSize:"10.5px",fontWeight:"600",letterSpacing:".14em",textTransform:"uppercase",color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 32%,transparent)",background:"rgba(142,124,242,0.08)",borderRadius:"999px",padding:"6px 14px"}}>{"Answer engine optimization"}
</div>
<div style={{fontSize:"64px",fontWeight:"600",letterSpacing:"-0.025em",lineHeight:"1.05",margin:"22px auto 0",maxWidth:"900px",textWrap:"balance"}}>{"Know what AI says about your brand."}
</div>
<div style={{fontSize:"18px",color:"var(--mut)",lineHeight:"1.6",margin:"22px auto 0",maxWidth:"640px",textWrap:"pretty"}}>{"Answr monitors ChatGPT, Perplexity, Claude, Gemini and Google AI Overviews — and shows you exactly how to win the answers your buyers see."}
</div>
<div style={{display:"flex",gap:"12px",justifyContent:"center",marginTop:"34px"}}>
<Link href="/demo" style={{display:"inline-flex",alignItems:"center",gap:"9px",fontSize:"14.5px",fontWeight:"600",borderRadius:"8px",padding:"12px 26px"}} className="btn-ac">{"Get a demo"}
<span style={{display:"inline-block"}}>{"→"}
</span>
</Link>
<Link href="/product/answer-engine-insights" style={{fontSize:"14.5px",fontWeight:"500",color:"var(--tx)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"12px 26px",background:"var(--bg1)"}}>{"Explore the product"}
</Link>
</div>
<div style={{margin:"64px auto 0",maxWidth:"1120px",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"14px",padding:"10px",boxShadow:"0 40px 120px rgba(0,0,0,.5)"}}>
<div style={{background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"9px",overflow:"hidden",textAlign:"left"}}>
<div style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 16px",borderBottom:"1px solid var(--brd)"}}>
<div style={{display:"flex",gap:"5px"}}>
<div style={{width:"8px",height:"8px",borderRadius:"50%",background:"var(--bg2)",border:"1px solid var(--brd)"}} />
<div style={{width:"8px",height:"8px",borderRadius:"50%",background:"var(--bg2)",border:"1px solid var(--brd)"}} />
<div style={{width:"8px",height:"8px",borderRadius:"50%",background:"var(--bg2)",border:"1px solid var(--brd)"}} />
</div>
<div style={{fontSize:"10.5px",fontVariantNumeric:"tabular-nums",color:"var(--fnt)",marginLeft:"8px"}}>{"app.answr.io — Nike"}
</div>
<div style={{marginLeft:"auto",display:"flex",gap:"4px",fontSize:"11px",fontWeight:"500"}}>
<Link href="/product/answer-engine-insights" style={{padding:"5px 12px",borderRadius:"6px",background:"rgba(142,124,242,0.14)",color:"var(--ac)"}}>{"Overview"}
</Link>
<Link href="/product/citations" style={{padding:"5px 12px",borderRadius:"6px",color:"var(--mut)"}} className="hv10">{"Citations"}
</Link>
<Link href="/product/agent-analytics" style={{padding:"5px 12px",borderRadius:"6px",color:"var(--mut)"}} className="hv11">{"Agent Analytics"}
</Link>
</div>
</div>
<div style={{display:"flex"}}>
<div style={{width:"172px",flex:"none",borderRight:"1px solid var(--brd)",padding:"12px 10px",display:"flex",flexDirection:"column",gap:"1px",fontSize:"11.5px"}}>
<div style={{display:"flex",alignItems:"center",gap:"7px",padding:"4px 7px",marginBottom:"10px"}}>
<div style={{width:"16px",height:"16px",borderRadius:"5px",background:"linear-gradient(135deg,#a394ff,#6d5ce6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:"700",color:"#fff"}}>{"A"}
</div>
<span style={{fontSize:"11.5px",fontWeight:"600"}}>{"Answr "}
<span style={{color:"var(--fnt)",fontWeight:"500"}}>{"· Nike"}
</span>
</span>
</div>
<div style={{fontSize:"9.5px",fontWeight:"500",color:"var(--fnt)",padding:"0 7px 4px"}}>{"Monitor"}
</div>
<div style={{padding:"4px 7px",borderRadius:"5px",background:"rgba(255,255,255,0.055)",color:"var(--tx)",fontWeight:"500"}}>{"Overview"}
</div>
<div style={{padding:"4px 7px",borderRadius:"5px",color:"var(--mut)"}}>{"Answer Engine Insights"}
</div>
<div style={{padding:"4px 7px",borderRadius:"5px",color:"var(--mut)"}}>{"Citations"}
</div>
<div style={{padding:"4px 7px",borderRadius:"5px",color:"var(--mut)"}}>{"Prompts"}
</div>
<div style={{padding:"4px 7px",borderRadius:"5px",color:"var(--mut)"}}>{"Conversations"}
</div>
<div style={{fontSize:"9.5px",fontWeight:"500",color:"var(--fnt)",padding:"10px 7px 4px"}}>{"Optimize"}
</div>
<div style={{padding:"4px 7px",borderRadius:"5px",color:"var(--mut)"}}>{"Actions"}
</div>
<div style={{padding:"4px 7px",borderRadius:"5px",color:"var(--mut)"}}>{"Reports"}
</div>
<div style={{fontSize:"9.5px",fontWeight:"500",color:"var(--fnt)",padding:"10px 7px 4px"}}>{"Infrastructure"}
</div>
<div style={{padding:"4px 7px",borderRadius:"5px",color:"var(--mut)"}}>{"Agent Analytics"}
</div>
</div>
<div style={{flex:"1",minWidth:"0"}}>
<div style={{display:"flex",alignItems:"center",gap:"8px",padding:"9px 16px",borderBottom:"1px solid var(--brd)"}}>
<span style={{fontSize:"10.5px",color:"var(--fnt)"}}>{"Nike "}
<span style={{color:"#3a3b40"}}>{"/"}
</span>{" "}
<span style={{color:"var(--tx)",fontWeight:"500"}}>{"Overview"}
</span>
</span>
<span style={{marginLeft:"auto",fontSize:"10px",color:"var(--mut)",background:"rgba(255,255,255,0.045)",borderRadius:"5px",padding:"4px 9px"}}>{"Last 30 days ▾"}
</span>
<span style={{fontSize:"10px",fontWeight:"500",color:"#fff",background:"var(--ac)",borderRadius:"5px",padding:"4px 10px"}}>{"Export"}
</span>
</div>
<div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:"12px"}}>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px"}}>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"11px 13px"}}>
<div style={{fontSize:"10px",fontWeight:"500",color:"var(--mut)"}}>{"Visibility score"}
</div>
<div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginTop:"7px"}}>
<span style={{fontSize:"17px",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"34.2% "}
<span style={{fontSize:"9.5px",fontWeight:"500",color:"#4cb782"}}>{"↑2.8"}
</span>
</span>
<svg width="46" height="16" viewBox="0 0 46 16">
<path d="M0 13L7 12L14 12L21 9L28 8L35 8L46 3" fill="none" stroke="#4cb782" strokeWidth="1" />
</svg>
</div>
</div>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"11px 13px"}}>
<div style={{fontSize:"10px",fontWeight:"500",color:"var(--mut)"}}>{"Share of voice"}
</div>
<div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginTop:"7px"}}>
<span style={{fontSize:"17px",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"28.6% "}
<span style={{fontSize:"9.5px",fontWeight:"500",color:"#4cb782"}}>{"↑1.1"}
</span>
</span>
<svg width="46" height="16" viewBox="0 0 46 16">
<path d="M0 11L7 10L14 11L21 8L28 8L35 6L46 5" fill="none" stroke="#4cb782" strokeWidth="1" />
</svg>
</div>
</div>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"11px 13px"}}>
<div style={{fontSize:"10px",fontWeight:"500",color:"var(--mut)"}}>{"Citations · 30d"}
</div>
<div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginTop:"7px"}}>
<span style={{fontSize:"17px",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"1,284 "}
<span style={{fontSize:"9.5px",fontWeight:"500",color:"#4cb782"}}>{"↑212"}
</span>
</span>
<svg width="46" height="16" viewBox="0 0 46 16">
<path d="M0 13L7 12L14 12L21 9L28 7L35 6L46 5" fill="none" stroke="#4cb782" strokeWidth="1" />
</svg>
</div>
</div>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"11px 13px"}}>
<div style={{fontSize:"10px",fontWeight:"500",color:"var(--mut)"}}>{"Avg. answer position"}
</div>
<div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginTop:"7px"}}>
<span style={{fontSize:"17px",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"2.4 "}
<span style={{fontSize:"9.5px",fontWeight:"500",color:"#e5636e"}}>{"↓0.2"}
</span>
</span>
<svg width="46" height="16" viewBox="0 0 46 16">
<path d="M0 6L7 7L14 7L21 9L28 8L35 10L46 11" fill="none" stroke="#e5636e" strokeWidth="1" />
</svg>
</div>
</div>
</div>
<div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:"10px"}}>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"12px 14px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontSize:"11px",fontWeight:"600"}}>{"Answer visibility over time"}
</span>
<span style={{display:"flex",gap:"10px",fontSize:"9px",color:"var(--mut)"}}>
<span style={{color:"var(--ac)"}}>{"— Nike"}
</span>
<span>{"— Adidas"}
</span>
<span>{"— Puma"}
</span>
</span>
</div>
<svg width="100%" height="118" viewBox="0 0 560 118" preserveAspectRatio="none" style={{marginTop:"8px",display:"block"}}>
<defs>
<linearGradient id="ghm1" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stopColor="#8E7CF2" stopOpacity="0.16" />
<stop offset="1" stopColor="#8E7CF2" stopOpacity="0" />
</linearGradient>
</defs>
<line x1="0" y1="6" x2="560" y2="6" stroke="rgba(255,255,255,0.05)" />
<line x1="0" y1="41" x2="560" y2="41" stroke="rgba(255,255,255,0.05)" />
<line x1="0" y1="76" x2="560" y2="76" stroke="rgba(255,255,255,0.05)" />
<line x1="0" y1="111" x2="560" y2="111" stroke="rgba(255,255,255,0.05)" />
<path d="M0 86L40 81L80 83L120 75L160 77L200 69L240 63L280 65L320 57L360 51L400 53L440 45L480 41L520 36L560 33L560 111L0 111Z" fill="url(#ghm1)" />
<path d="M0 86L40 81L80 83L120 75L160 77L200 69L240 63L280 65L320 57L360 51L400 53L440 45L480 41L520 36L560 33" fill="none" stroke="var(--ac)" strokeWidth="1.5" />
<path d="M0 64L40 66L80 62L120 64L160 60L200 62L240 58L280 60L320 62L360 58L400 60L440 56L480 58L520 54L560 55" fill="none" stroke="#7fa7d9" strokeWidth="1" opacity=".8" />
<path d="M0 95L40 93L80 94L120 91L160 92L200 89L240 90L280 87L320 88L360 85L400 86L440 83L480 84L520 81L560 82" fill="none" stroke="#b98ed9" strokeWidth="1" opacity=".8" />
<circle cx="560" cy="33" r="2.5" fill="var(--ac)" />
</svg>
</div>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"8px",overflow:"hidden"}}>
<div style={{display:"flex",justifyContent:"space-between",padding:"11px 13px 7px"}}>
<span style={{fontSize:"11px",fontWeight:"600"}}>{"Share of voice"}
</span>
<span style={{fontSize:"9px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"412 PROMPTS"}
</span>
</div>
<div style={{display:"grid",gridTemplateColumns:"16px 1fr auto auto",gap:"8px",alignItems:"center",padding:"6px 13px",fontSize:"10.5px",background:"rgba(142,124,242,0.06)"}}>
<span style={{color:"var(--fnt)"}}>{"1"}
</span>
<span style={{fontWeight:"600"}}>{"Nike "}
<span style={{fontSize:"8px",fontWeight:"600",color:"#b3a7f8",background:"rgba(142,124,242,0.16)",borderRadius:"3px",padding:"1px 4px"}}>{"You"}
</span>
</span>
<span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"28.6%"}
</span>
<span style={{fontSize:"9.5px",color:"#4cb782"}}>{"↑1.1"}
</span>
</div>
<div style={{display:"grid",gridTemplateColumns:"16px 1fr auto auto",gap:"8px",alignItems:"center",padding:"6px 13px",fontSize:"10.5px",borderTop:"1px solid var(--brd)"}}>
<span style={{color:"var(--fnt)"}}>{"2"}
</span>
<span>{"Adidas"}
</span>
<span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"24.1%"}
</span>
<span style={{fontSize:"9.5px",color:"#e5636e"}}>{"↓0.6"}
</span>
</div>
<div style={{display:"grid",gridTemplateColumns:"16px 1fr auto auto",gap:"8px",alignItems:"center",padding:"6px 13px",fontSize:"10.5px",borderTop:"1px solid var(--brd)"}}>
<span style={{color:"var(--fnt)"}}>{"3"}
</span>
<span>{"Puma"}
</span>
<span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"18.9%"}
</span>
<span style={{fontSize:"9.5px",color:"#4cb782"}}>{"↑0.3"}
</span>
</div>
<div style={{display:"grid",gridTemplateColumns:"16px 1fr auto auto",gap:"8px",alignItems:"center",padding:"6px 13px",fontSize:"10.5px",borderTop:"1px solid var(--brd)"}}>
<span style={{color:"var(--fnt)"}}>{"4"}
</span>
<span>{"Under Armour"}
</span>
<span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"15.2%"}
</span>
<span style={{fontSize:"9.5px",color:"#e5636e"}}>{"↓1.4"}
</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
{/* Logo wall. Neither mark is in simple-icons (both companies are outside that
    set), so each slot stays a wordmark until its licensed press-kit file lands in
    /public/logos — icon:false makes that explicit and stops any future same-named
    glyph from being picked up by mistake. The note keeps the wall honest: these
    are the enterprise profile the product is built for, not signed references. */}
<LogoWall
  eyebrow="Built for leading Canadian brands — enterprise and publicly traded"
  logos={[
    /* Optical sizing, not equal heights: MTY is a delicate three-line stack
       (GROUPE / MTY / GROUP) and Bell is a heavy single wordmark, so matching
       their heights makes MTY disappear. MTY runs taller to balance the weight. */
    { name: "MTY Food Group", file: "mty-food-group.svg", height: 44, icon: false },
    { name: "Bell", file: "bell.svg", height: 26, icon: false, fallbackStyle: { fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em" } },
  ]}
/>
<div style={{padding:"0 48px 40px",textAlign:"center"}}>
<div style={{display:"flex",justifyContent:"center",gap:"14px",marginTop:"26px",flexWrap:"wrap"}}>
<span style={{display:"inline-flex",alignItems:"center",gap:"8px",border:"1px solid var(--brd)",borderRadius:"7px",padding:"7px 14px",background:"var(--bg1)",fontSize:"11.5px",color:"var(--mut)"}}>
<span style={{color:"var(--ac)"}}>{"◆"}
</span>
<span style={{color:"var(--tx)",fontWeight:"600"}}>{"5 engines"}
</span>{" — ChatGPT, Claude, Gemini, Perplexity, AI Overviews"}
</span>
<span style={{display:"inline-flex",alignItems:"center",gap:"8px",border:"1px solid var(--brd)",borderRadius:"7px",padding:"7px 14px",background:"var(--bg1)",fontSize:"11.5px",color:"var(--mut)"}}>
<span style={{width:"6px",height:"6px",borderRadius:"50%",background:"var(--ac)"}} />
<span style={{color:"var(--tx)",fontWeight:"600"}}>{"Answer Engine Optimization"}
</span>{" — visibility, citations & agents"}
</span>
<span style={{display:"inline-flex",alignItems:"center",gap:"8px",border:"1px solid var(--brd)",borderRadius:"7px",padding:"7px 14px",background:"var(--bg1)",fontSize:"11.5px",color:"var(--mut)"}}>
<span style={{color:"var(--ac)"}}>{"✓"}
</span>{" First-party data · no scraping"}
</span>
</div>
</div>
<div style={{borderTop:"1px solid var(--brd)",padding:"88px 48px",maxWidth:"1240px",margin:"0 auto"}}>
<div style={{textAlign:"center",maxWidth:"640px",margin:"0 auto"}}>
<div style={{display:"inline-block",fontSize:"10.5px",fontWeight:"600",letterSpacing:".14em",textTransform:"uppercase",color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 32%,transparent)",background:"rgba(142,124,242,0.08)",borderRadius:"999px",padding:"6px 14px"}}>{"How it works"}
</div>
<div style={{fontSize:"34px",fontWeight:"600",letterSpacing:"-0.02em",marginTop:"12px",textWrap:"balance"}}>{"From answer to action to proof"}
</div>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px",marginTop:"44px"}}>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
<div style={{fontSize:"10.5px",fontWeight:"600",color:"var(--ac)",letterSpacing:".1em"}}>{"01 · TRACK"}
</div>
<div style={{fontSize:"15px",fontWeight:"600"}}>{"Run your prompts daily"}
</div>
<div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.55"}}>{"Your prompt set runs on five platforms, every day."}
</div>
<div style={{marginTop:"auto",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"10px 12px"}}>
<div style={{fontSize:"11.5px",fontWeight:"500"}}>{"\"best running shoes\""}
</div>
<div style={{display:"flex",gap:"4px",marginTop:"8px",flexWrap:"wrap"}}>
<span style={{fontSize:"8.5px",fontWeight:"500",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"3px",padding:"2px 5px"}}>{"ChatGPT"}
</span>
<span style={{fontSize:"8.5px",fontWeight:"500",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"3px",padding:"2px 5px"}}>{"Perplexity"}
</span>
<span style={{fontSize:"8.5px",fontWeight:"500",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"3px",padding:"2px 5px"}}>{"AIO"}
</span>
<span style={{fontSize:"8.5px",fontWeight:"500",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"3px",padding:"2px 5px"}}>{"+2"}
</span>
</div>
<div style={{fontSize:"9.5px",color:"var(--fnt)",marginTop:"8px",fontVariantNumeric:"tabular-nums"}}>{"Mentioned · position 2 · daily"}
</div>
</div>
</div>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
<div style={{fontSize:"10.5px",fontWeight:"600",color:"var(--ac)",letterSpacing:".1em"}}>{"02 · TRACE"}
</div>
<div style={{fontSize:"15px",fontWeight:"600"}}>{"Trace every citation"}
</div>
<div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.55"}}>{"Each answer maps back to the exact pages it cites."}
</div>
<div style={{marginTop:"auto",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"10px 12px"}}>
<div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",marginBottom:"4px"}}>
<span>{"runnersworld.com"}
</span>
<span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"248"}
</span>
</div>
<div style={{height:"3px",background:"var(--bg2)",borderRadius:"2px"}}>
<div style={{width:"86%",height:"3px",background:"var(--ac)",borderRadius:"2px"}} />
</div>
<div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",margin:"8px 0 4px"}}>
<span>{"nike.com/running"}
</span>
<span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"201"}
</span>
</div>
<div style={{height:"3px",background:"var(--bg2)",borderRadius:"2px"}}>
<div style={{width:"70%",height:"3px",background:"var(--ac)",borderRadius:"2px",opacity:".8"}} />
</div>
<div style={{display:"flex",gap:"5px",marginTop:"9px"}}>
<span style={{fontSize:"8.5px",fontWeight:"500",color:"var(--ac)",background:"rgba(142,124,242,0.14)",borderRadius:"3px",padding:"2px 6px"}}>{"31% OWNED"}
</span>
<span style={{fontSize:"8.5px",fontWeight:"500",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"3px",padding:"2px 6px"}}>{"69% EARNED"}
</span>
</div>
</div>
</div>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
<div style={{fontSize:"10.5px",fontWeight:"600",color:"var(--ac)",letterSpacing:".1em"}}>{"03 · ACT"}
</div>
<div style={{fontSize:"15px",fontWeight:"600"}}>{"Ship the scored fix"}
</div>
<div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.55"}}>{"Gaps become a prioritized queue with briefs, not a backlog."}
</div>
<div style={{marginTop:"auto",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"10px 12px"}}>
<div style={{fontSize:"11.5px",fontWeight:"500",lineHeight:"1.4"}}>{"#87 · Unblock ClaudeBot on /help"}
</div>
<div style={{display:"flex",gap:"5px",marginTop:"8px"}}>
<span style={{fontSize:"8.5px",fontWeight:"600",color:"#4cb782",border:"1px solid rgba(76,183,130,.35)",borderRadius:"3px",padding:"2px 6px"}}>{"IMPACT 8.4"}
</span>
<span style={{fontSize:"8.5px",fontWeight:"500",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"3px",padding:"2px 6px"}}>{"EFFORT LOW"}
</span>
</div>
<div style={{fontSize:"9.5px",color:"var(--fnt)",marginTop:"8px"}}>{"robots.txt · 214 URLs affected · owner: Web"}
</div>
</div>
</div>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
<div style={{fontSize:"10.5px",fontWeight:"600",color:"var(--ac)",letterSpacing:".1em"}}>{"04 · PROVE"}
</div>
<div style={{fontSize:"15px",fontWeight:"600"}}>{"Measure the lift"}
</div>
<div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.55"}}>{"Every shipped action is tracked against the metric it targets."}
</div>
<div style={{marginTop:"auto",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"10px 12px"}}>
<div style={{fontSize:"10px",fontWeight:"500",color:"var(--mut)"}}>{"Visibility score"}
</div>
<div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginTop:"6px"}}>
<span style={{fontSize:"17px",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"34.2% "}
<span style={{fontSize:"9.5px",color:"#4cb782"}}>{"↑2.8"}
</span>
</span>
<svg width="52" height="18" viewBox="0 0 52 18">
<path d="M0 15L9 13L18 14L27 10L36 8L45 6L52 4" fill="none" stroke="#4cb782" strokeWidth="1" />
</svg>
</div>
<div style={{fontSize:"9.5px",color:"var(--fnt)",marginTop:"7px",fontVariantNumeric:"tabular-nums"}}>{"since action #87 shipped · Jul 18"}
</div>
</div>
</div>
</div>
</div>
<div style={{padding:"96px 48px",borderTop:"1px solid var(--brd)",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"64px",alignItems:"center",maxWidth:"1240px",margin:"0 auto"}}>
<div>
<div style={{display:"inline-block",fontSize:"10.5px",fontWeight:"600",letterSpacing:".14em",textTransform:"uppercase",color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 32%,transparent)",background:"rgba(142,124,242,0.08)",borderRadius:"999px",padding:"6px 14px"}}>{"Answer Engine Insights"}
</div>
<div style={{fontSize:"36px",fontWeight:"600",letterSpacing:"-0.02em",lineHeight:"1.15",marginTop:"14px",textWrap:"balance"}}>{"See every answer, on every platform"}
</div>
<div style={{fontSize:"15px",color:"var(--mut)",lineHeight:"1.65",marginTop:"14px",textWrap:"pretty"}}>{"Answr runs your prompt set across five AI platforms daily, then measures where you appear, how you're described, and who wins when you don't."}
</div>
<div style={{display:"flex",flexDirection:"column",gap:"10px",marginTop:"22px",fontSize:"13px"}}>
<div style={{display:"flex",gap:"10px",alignItems:"baseline"}}>
<span style={{color:"var(--ac)",fontWeight:"700"}}>{"→"}
</span>{"Share of voice against up to 10 competitors"}
</div>
<div style={{display:"flex",gap:"10px",alignItems:"baseline"}}>
<span style={{color:"var(--ac)",fontWeight:"700"}}>{"→"}
</span>{"Topic × platform heatmaps to find weak spots"}
</div>
<div style={{display:"flex",gap:"10px",alignItems:"baseline"}}>
<span style={{color:"var(--ac)",fontWeight:"700"}}>{"→"}
</span>{"Sentiment and position tracking per prompt"}
</div>
</div>
<Link href="/product/answer-engine-insights" style={{display:"inline-flex",alignItems:"center",gap:"9px",fontSize:"13px",fontWeight:"500",color:"var(--tx)",background:"rgba(142,124,242,0.10)",borderRadius:"999px",padding:"7px 8px 7px 16px",marginTop:"20px"}} className="hv12">{"Explore Answer Engine Insights"}
<span style={{display:"inline-flex",width:"20px",height:"20px",borderRadius:"50%",background:"var(--ac)",color:"#fff",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700"}}>{"→"}
</span>
</Link>
</div>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px"}}>
<div style={{display:"flex",gap:"2px",borderBottom:"1px solid var(--brd)",marginBottom:"14px",fontSize:"11.5px"}}>
<span style={{padding:"0 10px 8px",color:"var(--tx)",fontWeight:"500",borderBottom:"2px solid var(--ac)"}}>{"Overview"}
</span>
<span style={{padding:"0 10px 8px",color:"var(--mut)"}}>{"Topics"}
</span>
<span style={{padding:"0 10px 8px",color:"var(--mut)"}}>{"Regions"}
</span>
<span style={{padding:"0 10px 8px",color:"var(--mut)"}}>{"Audiences"}
</span>
<span style={{padding:"0 10px 8px",color:"var(--mut)"}}>{"Sentiment"}
</span>
</div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontSize:"13px",fontWeight:"600"}}>{"Share of voice"}
</span>
<span style={{fontSize:"10px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>{"LAST 30 DAYS · 412 PROMPTS"}
</span>
</div>
<svg width="100%" height="170" viewBox="0 0 520 170" preserveAspectRatio="none" style={{marginTop:"12px"}}>
<line x1="0" y1="8" x2="520" y2="8" stroke="rgba(255,255,255,0.06)" />
<line x1="0" y1="60" x2="520" y2="60" stroke="rgba(255,255,255,0.06)" />
<line x1="0" y1="112" x2="520" y2="112" stroke="rgba(255,255,255,0.06)" />
<line x1="0" y1="164" x2="520" y2="164" stroke="rgba(255,255,255,0.06)" />
<path d="M0 124L43 117L86 120L129 108L172 111L215 99L258 92L301 95L344 83L387 76L430 68L473 60L520 60" fill="none" stroke="var(--ac)" strokeWidth="1.75" />
<path d="M0 96L43 99L86 93L129 96L172 90L215 93L258 87L301 90L344 93L387 87L430 90L473 84L520 84" fill="none" stroke="#7fa7d9" strokeWidth="1.25" opacity=".8" />
<circle cx="520" cy="60" r="3" fill="var(--ac)" />
</svg>
<div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"14px"}}>
<div style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"12px"}}>
<span style={{width:"7px",height:"7px",borderRadius:"2px",background:"var(--ac)"}} />{"Nike"}
<span style={{marginLeft:"auto",fontSize:"11.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"28.6%"}
</span>
<span style={{fontSize:"10.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"#4cb782"}}>{"↑1.1"}
</span>
</div>
<div style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"12px",color:"var(--mut)"}}>
<span style={{width:"7px",height:"7px",borderRadius:"2px",background:"#7fa7d9"}} />{"Adidas"}
<span style={{marginLeft:"auto",fontSize:"11.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"24.1%"}
</span>
<span style={{fontSize:"10.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"#e5636e"}}>{"↓0.6"}
</span>
</div>
</div>
</div>
</div>
<div style={{padding:"96px 48px",borderTop:"1px solid var(--brd)",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"64px",alignItems:"center",maxWidth:"1240px",margin:"0 auto"}}>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px",order:"0"}}>
<div style={{display:"flex",gap:"2px",borderBottom:"1px solid var(--brd)",marginBottom:"14px",fontSize:"11.5px"}}>
<span style={{padding:"0 10px 8px",color:"var(--tx)",fontWeight:"500",borderBottom:"2px solid var(--ac)"}}>{"Cited domains"}
</span>
<span style={{padding:"0 10px 8px",color:"var(--mut)"}}>{"Cited pages"}
</span>
<span style={{padding:"0 10px 8px",color:"var(--mut)"}}>{"Watched URLs"}
</span>
</div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontSize:"13px",fontWeight:"600"}}>{"Cited domains"}
</span>
<span style={{fontSize:"10px",fontWeight:"500",color:"#fff",background:"var(--ac)",borderRadius:"5px",padding:"4px 10px"}}>{"Export 1,284 citations"}
</span>
</div>
<div style={{display:"flex",flexDirection:"column",gap:"12px",marginTop:"16px"}}>
<div>
<div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"5px"}}>
<span style={{fontSize:"11.5px",fontWeight:"400",fontVariantNumeric:"tabular-nums"}}>{"runnersworld.com"}
</span>
<span style={{fontSize:"11.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"248"}
</span>
</div>
<div style={{height:"5px",background:"var(--bg2)",borderRadius:"3px"}}>
<div style={{width:"86%",height:"5px",background:"var(--ac)",borderRadius:"3px"}} />
</div>
</div>
<div>
<div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"5px"}}>
<span style={{fontSize:"11.5px",fontWeight:"400",fontVariantNumeric:"tabular-nums"}}>{"nike.com/running"}
</span>
<span style={{fontSize:"11.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"201"}
</span>
</div>
<div style={{height:"5px",background:"var(--bg2)",borderRadius:"3px"}}>
<div style={{width:"70%",height:"5px",background:"var(--ac)",borderRadius:"3px",opacity:".85"}} />
</div>
</div>
<div>
<div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"5px"}}>
<span style={{fontSize:"11.5px",fontWeight:"400",fontVariantNumeric:"tabular-nums"}}>{"reddit.com"}
</span>
<span style={{fontSize:"11.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"164"}
</span>
</div>
<div style={{height:"5px",background:"var(--bg2)",borderRadius:"3px"}}>
<div style={{width:"57%",height:"5px",background:"var(--ac)",borderRadius:"3px",opacity:".7"}} />
</div>
</div>
<div>
<div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"5px"}}>
<span style={{fontSize:"11.5px",fontWeight:"400",fontVariantNumeric:"tabular-nums"}}>{"wirecutter.com"}
</span>
<span style={{fontSize:"11.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{"97"}
</span>
</div>
<div style={{height:"5px",background:"var(--bg2)",borderRadius:"3px"}}>
<div style={{width:"34%",height:"5px",background:"var(--ac)",borderRadius:"3px",opacity:".55"}} />
</div>
</div>
</div>
<div style={{marginTop:"16px",padding:"11px 13px",border:"1px solid var(--brd)",borderRadius:"8px",background:"var(--bg0)",fontSize:"11.5px",color:"var(--mut)",lineHeight:"1.5"}}>
<span style={{color:"var(--tx)",fontWeight:"500"}}>{"New:"}
</span>{" reddit.com/r/running cited in 12 ChatGPT answers this week."}
</div>
</div>
<div style={{order:"1"}}>
<div style={{display:"inline-block",fontSize:"10.5px",fontWeight:"600",letterSpacing:".14em",textTransform:"uppercase",color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 32%,transparent)",background:"rgba(142,124,242,0.08)",borderRadius:"999px",padding:"6px 14px"}}>{"Citations"}
</div>
<div style={{fontSize:"36px",fontWeight:"600",letterSpacing:"-0.02em",lineHeight:"1.15",marginTop:"14px",textWrap:"balance"}}>{"Know which sources AI trusts"}
</div>
<div style={{fontSize:"15px",color:"var(--mut)",lineHeight:"1.65",marginTop:"14px",textWrap:"pretty"}}>{"Every answer is traced back to the pages it cites. Grow the sources you own, and target the ones you don't — before your competitors do."}
</div>
<div style={{display:"flex",flexDirection:"column",gap:"10px",marginTop:"22px",fontSize:"13px"}}>
<div style={{display:"flex",gap:"10px",alignItems:"baseline"}}>
<span style={{color:"var(--ac)",fontWeight:"700"}}>{"→"}
</span>{"Owned vs. earned citation split over time"}
</div>
<div style={{display:"flex",gap:"10px",alignItems:"baseline"}}>
<span style={{color:"var(--ac)",fontWeight:"700"}}>{"→"}
</span>{"Page-level detail down to the exact URL"}
</div>
<div style={{display:"flex",gap:"10px",alignItems:"baseline"}}>
<span style={{color:"var(--ac)",fontWeight:"700"}}>{"→"}
</span>{"Alerts when a new domain starts influencing answers"}
</div>
</div>
<Link href="/product/citations" style={{display:"inline-flex",alignItems:"center",gap:"9px",fontSize:"13px",fontWeight:"500",color:"var(--tx)",background:"rgba(142,124,242,0.10)",borderRadius:"999px",padding:"7px 8px 7px 16px",marginTop:"20px"}} className="hv13">{"Explore Citations"}
<span style={{display:"inline-flex",width:"20px",height:"20px",borderRadius:"50%",background:"var(--ac)",color:"#fff",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700"}}>{"→"}
</span>
</Link>
</div>
</div>
<div style={{padding:"96px 48px",borderTop:"1px solid var(--brd)",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"64px",alignItems:"center",maxWidth:"1240px",margin:"0 auto"}}>
<div>
<div style={{display:"inline-block",fontSize:"10.5px",fontWeight:"600",letterSpacing:".14em",textTransform:"uppercase",color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 32%,transparent)",background:"rgba(142,124,242,0.08)",borderRadius:"999px",padding:"6px 14px"}}>{"Agent Analytics"}
</div>
<div style={{fontSize:"36px",fontWeight:"600",letterSpacing:"-0.02em",lineHeight:"1.15",marginTop:"14px",textWrap:"balance"}}>{"Watch AI crawlers work your site"}
</div>
<div style={{fontSize:"15px",color:"var(--mut)",lineHeight:"1.65",marginTop:"14px",textWrap:"pretty"}}>{"GPTBot, ClaudeBot, PerplexityBot and eleven more — see what they read, what they're blocked from, and what that costs you in answers."}
</div>
<div style={{display:"flex",flexDirection:"column",gap:"10px",marginTop:"22px",fontSize:"13px"}}>
<div style={{display:"flex",gap:"10px",alignItems:"baseline"}}>
<span style={{color:"var(--ac)",fontWeight:"700"}}>{"→"}
</span>{"Crawl volume by agent, path and day"}
</div>
<div style={{display:"flex",gap:"10px",alignItems:"baseline"}}>
<span style={{color:"var(--ac)",fontWeight:"700"}}>{"→"}
</span>{"robots.txt and llms.txt misconfiguration alerts"}
</div>
<div style={{display:"flex",gap:"10px",alignItems:"baseline"}}>
<span style={{color:"var(--ac)",fontWeight:"700"}}>{"→"}
</span>{"One-line edge snippet — no tag manager required"}
</div>
</div>
<Link href="/product/agent-analytics" style={{display:"inline-flex",alignItems:"center",gap:"9px",fontSize:"13px",fontWeight:"500",color:"var(--tx)",background:"rgba(142,124,242,0.10)",borderRadius:"999px",padding:"7px 8px 7px 16px",marginTop:"20px"}} className="hv14">{"Explore Agent Analytics"}
<span style={{display:"inline-flex",width:"20px",height:"20px",borderRadius:"50%",background:"var(--ac)",color:"#fff",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700"}}>{"→"}
</span>
</Link>
</div>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px"}}>
<div style={{display:"flex",gap:"2px",borderBottom:"1px solid var(--brd)",marginBottom:"14px",fontSize:"11.5px"}}>
<span style={{padding:"0 10px 8px",color:"var(--tx)",fontWeight:"500",borderBottom:"2px solid var(--ac)"}}>{"Crawlers"}
</span>
<span style={{padding:"0 10px 8px",color:"var(--mut)"}}>{"Referrals"}
</span>
<span style={{padding:"0 10px 8px",color:"var(--mut)"}}>{"Pages"}
</span>
<span style={{padding:"0 10px 8px",color:"var(--mut)"}}>{"Logs"}
</span>
</div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontSize:"13px",fontWeight:"600"}}>{"Agents · 30d"}
</span>
<span style={{fontSize:"10px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>{"48.2K REQUESTS"}
</span>
</div>
<div style={{display:"flex",flexDirection:"column",marginTop:"8px"}}>
<div style={{display:"flex",alignItems:"center",gap:"10px",padding:"11px 0",borderBottom:"1px solid var(--brd)",fontSize:"12.5px"}}>
<span style={{fontSize:"12px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"GPTBot"}
</span>
<span style={{fontSize:"10.5px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>{"OpenAI"}
</span>
<span style={{marginLeft:"auto",fontSize:"12px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"21,408"}
</span>
<span style={{fontSize:"9.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 40%,transparent)",borderRadius:"4px",padding:"2px 6px"}}>{"ALLOWED"}
</span>
</div>
<div style={{display:"flex",alignItems:"center",gap:"10px",padding:"11px 0",borderBottom:"1px solid var(--brd)",fontSize:"12.5px"}}>
<span style={{fontSize:"12px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"PerplexityBot"}
</span>
<span style={{fontSize:"10.5px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>{"Perplexity"}
</span>
<span style={{marginLeft:"auto",fontSize:"12px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"11,872"}
</span>
<span style={{fontSize:"9.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 40%,transparent)",borderRadius:"4px",padding:"2px 6px"}}>{"ALLOWED"}
</span>
</div>
<div style={{display:"flex",alignItems:"center",gap:"10px",padding:"11px 0",fontSize:"12.5px"}}>
<span style={{fontSize:"12px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"ClaudeBot"}
</span>
<span style={{fontSize:"10.5px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>{"Anthropic"}
</span>
<span style={{marginLeft:"auto",fontSize:"12px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"8,455"}
</span>
<span style={{fontSize:"9.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"#e5636e",border:"1px solid rgba(229,99,110,.4)",borderRadius:"4px",padding:"2px 6px"}}>{"PARTIAL"}
</span>
</div>
</div>
<div style={{marginTop:"12px",padding:"11px 13px",border:"1px solid var(--brd)",borderRadius:"8px",background:"var(--bg0)",fontSize:"11.5px",color:"var(--mut)",lineHeight:"1.5"}}>
<span style={{color:"#e5636e",fontWeight:"500"}}>{"Alert:"}
</span>{" ClaudeBot blocked on 214 /help URLs."}
</div>
</div>
</div>
<div style={{borderTop:"1px solid var(--brd)",padding:"64px 48px"}}>
<div style={{maxWidth:"1240px",margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px"}}>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"22px 24px"}}>
<div style={{display:"flex",alignItems:"center",gap:"9px"}}>
<span style={{display:"inline-flex",width:"24px",height:"24px",borderRadius:"7px",background:"rgba(142,124,242,0.12)",alignItems:"center",justifyContent:"center"}}>
<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="var(--ac)" strokeWidth="1.4">
<circle cx="8" cy="8" r="6.2" />
<ellipse cx="8" cy="8" rx="2.8" ry="6.2" />
<path d="M2 8h12" />
</svg>
</span>
<span style={{fontSize:"11.5px",fontWeight:"500",color:"var(--mut)"}}>{"Coverage"}
</span>
</div>
<div style={{display:"flex",alignItems:"baseline",gap:"8px",marginTop:"10px"}}>
<span style={{fontSize:"32px",fontWeight:"600",fontVariantNumeric:"tabular-nums",letterSpacing:"-0.02em"}}>{"5"}
</span>
<span style={{fontSize:"12.5px",color:"var(--mut)"}}>{"platforms, daily"}
</span>
</div>
<div style={{fontSize:"11px",color:"var(--fnt)",marginTop:"10px",lineHeight:"1.5"}}>{"ChatGPT · Perplexity · Google AI Overviews · Claude · Gemini"}
</div>
</div>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"22px 24px"}}>
<div style={{display:"flex",alignItems:"center",gap:"9px"}}>
<span style={{display:"inline-flex",width:"24px",height:"24px",borderRadius:"7px",background:"rgba(142,124,242,0.12)",alignItems:"center",justifyContent:"center"}}>
<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="var(--ac)" strokeWidth="1.4" strokeLinejoin="round">
<path d="M8 2 14 5 8 8 2 5z" />
<path d="M2 8.5 8 11.5 14 8.5" />
<path d="M2 11.5 8 14.5 14 11.5" />
</svg>
</span>
<span style={{fontSize:"11.5px",fontWeight:"500",color:"var(--mut)"}}>{"Sample"}
</span>
</div>
<div style={{display:"flex",alignItems:"baseline",gap:"8px",marginTop:"10px"}}>
<span style={{fontSize:"32px",fontWeight:"600",fontVariantNumeric:"tabular-nums",letterSpacing:"-0.02em"}}>{"12M"}
</span>
<span style={{fontSize:"12.5px",color:"var(--mut)"}}>{"answers a month"}
</span>
</div>
<div style={{fontSize:"11px",color:"var(--fnt)",marginTop:"10px",lineHeight:"1.5"}}>{"Direct sampling + 2.1M consented panel conversations"}
</div>
</div>
<div style={{background:"var(--bg1)",border:"1px solid color-mix(in oklab,var(--ac) 30%,var(--brd))",borderRadius:"12px",padding:"22px 24px"}}>
<div style={{display:"flex",alignItems:"center",gap:"9px"}}>
<span style={{display:"inline-flex",width:"24px",height:"24px",borderRadius:"7px",background:"rgba(142,124,242,0.12)",alignItems:"center",justifyContent:"center"}}>
<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="var(--ac)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
<path d="M2 12 6.5 7.5 9 10 14 4.5" />
<path d="M10.5 4.5H14V8" />
</svg>
</span>
<span style={{fontSize:"11.5px",fontWeight:"500",color:"var(--mut)"}}>{"Result"}
</span>
</div>
<div style={{display:"flex",alignItems:"baseline",gap:"8px",marginTop:"10px"}}>
<span style={{fontSize:"32px",fontWeight:"600",fontVariantNumeric:"tabular-nums",letterSpacing:"-0.02em",color:"var(--ac)"}}>{"+9.4pt"}
</span>
<span style={{fontSize:"12.5px",color:"var(--mut)"}}>{"median lift"}
</span>
</div>
<div style={{fontSize:"11px",color:"var(--fnt)",marginTop:"10px",lineHeight:"1.5"}}>{"Visibility score, first 6 months · cohort of 840 brands"}
</div>
</div>
</div>
</div>
<div style={{borderTop:"1px solid var(--brd)",padding:"88px 48px",maxWidth:"1240px",margin:"0 auto"}}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:"56px",alignItems:"start"}}>
<div>
<div style={{display:"inline-block",fontSize:"10.5px",fontWeight:"600",letterSpacing:".14em",textTransform:"uppercase",color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 32%,transparent)",background:"rgba(142,124,242,0.08)",borderRadius:"999px",padding:"6px 14px"}}>{"Trust"}
</div>
<div style={{fontSize:"32px",fontWeight:"600",letterSpacing:"-0.02em",lineHeight:"1.2",marginTop:"12px",textWrap:"balance"}}>{"Data your legal team can sign off on"}
</div>
<div style={{fontSize:"14.5px",color:"var(--mut)",lineHeight:"1.65",marginTop:"14px",textWrap:"pretty"}}>{"Visibility data is only useful if you can defend how it was collected. Answr samples answer engines through their official APIs and captures crawler and referral activity as first-party data on your own site — no scraped chats, no gray-market logs."}
</div>
<Link href="/security" style={{display:"inline-flex",alignItems:"center",gap:"9px",fontSize:"13px",fontWeight:"500",color:"var(--tx)",background:"rgba(142,124,242,0.10)",borderRadius:"999px",padding:"7px 8px 7px 16px",marginTop:"18px"}} className="hv15">{"Read the security & methodology page"}
<span style={{display:"inline-flex",width:"20px",height:"20px",borderRadius:"50%",background:"var(--ac)",color:"#fff",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700"}}>{"→"}
</span>
</Link>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"22px"}}>
<div style={{fontSize:"13.5px",fontWeight:"600"}}>{"First-party data model"}
</div>
<div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.6",marginTop:"7px"}}>{"Answers via official platform APIs and your own site telemetry — no scraped chats, no gray-market logs."}
</div>
</div>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"22px"}}>
<div style={{fontSize:"13.5px",fontWeight:"600"}}>{"You control the region"}
</div>
<div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.6",marginTop:"7px"}}>{"Deploy in the region you choose, encrypted in transit, with a full workspace purge within 30 days of a closed account."}
</div>
</div>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"22px"}}>
<div style={{fontSize:"13.5px",fontWeight:"600"}}>{"Consented panels only"}
</div>
<div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.6",marginTop:"7px"}}>{"Conversation data comes from opt-in panels. No scraping private sessions, ever."}
</div>
</div>
<div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"22px"}}>
<div style={{fontSize:"13.5px",fontWeight:"600"}}>{"SSO & audit log"}
</div>
<div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.6",marginTop:"7px"}}>{"SAML SSO, SCIM provisioning and a full audit trail on Enterprise."}
</div>
</div>
</div>
</div>
</div>
<div style={{borderTop:"1px solid var(--brd)",padding:"84px 48px",textAlign:"center",background:"color-mix(in oklab,var(--ac) 5%,transparent)"}}>
<div style={{display:"inline-block",fontSize:"10.5px",fontWeight:"600",letterSpacing:".14em",textTransform:"uppercase",color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 32%,transparent)",background:"rgba(142,124,242,0.08)",borderRadius:"999px",padding:"6px 14px"}}>{"Free snapshot"}
</div>
<div style={{fontSize:"34px",fontWeight:"600",letterSpacing:"-0.02em",marginTop:"14px",textWrap:"balance"}}>{"See what AI says about your brand — today"}
</div>
<div style={{fontSize:"15px",color:"var(--mut)",lineHeight:"1.6",margin:"12px auto 0",maxWidth:"540px",textWrap:"pretty"}}>{"Drop your domain. We run 25 starter prompts across five platforms and email your snapshot within the hour. No call, no card."}
</div>
<SnapshotForm />
</div>
    </div>
  );
}
