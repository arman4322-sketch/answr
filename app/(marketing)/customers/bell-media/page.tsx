import Link from "next/link";
import type { Metadata } from "next";
import "./page.css";

export const metadata: Metadata = { title: "Bell Media — case study" };

/* Bell Media — case study. Answr measured how assistants answered
   streaming-availability questions for the catalogue, diagnosed the cause
   (Canadian rights not exposed as machine-readable availability data, so
   assistants named US services or said "unavailable"), and sequenced the
   per-title availability work that corrected it. */
export default function BellMediaCaseStudyPage() {
  return (
    <div className="frame-casestudy">
      <div style={{padding:"64px 48px 48px",maxWidth:"880px",margin:"0 auto"}}>
        <div style={{fontSize:"11.5px",color:"var(--fnt)"}}>
          <Link href="/customers" style={{color:"var(--fnt)"}} className="hv9">{"Customers"}</Link>{" "}<span style={{color:"#3a3b40"}}>{"/"}</span>{" "}<span style={{color:"var(--ac)"}}>{"Bell Media"}</span>
        </div>
        
        <div style={{fontSize:"44px",fontWeight:"600",letterSpacing:"-0.025em",lineHeight:"1.15",marginTop:"10px",textWrap:"balance"}}>{"“Where can I stream it in Canada”, answered correctly"}</div>
        <div style={{display:"flex",gap:"20px",marginTop:"16px",fontSize:"12px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>
          <span>{"Broadcaster · CTV, TSN, Crave"}</span>
          <span>{"On the Enterprise plan"}</span>
          <span>{"90-day program"}</span>
        </div>
      </div>
      <div style={{padding:"0 48px 48px",maxWidth:"1180px",margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"14px"}}>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"20px"}}>
            <div style={{fontSize:"30px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--ac)"}}>{"+21pt"}</div>
            <div style={{fontSize:"12px",color:"var(--mut)",marginTop:"6px"}}>{"title prompts naming Crave or CTV"}</div>
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"20px"}}>
            <div style={{fontSize:"30px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--ac)"}}>{"1,400"}</div>
            <div style={{fontSize:"12px",color:"var(--mut)",marginTop:"6px"}}>{"titles with availability windows"}</div>
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"20px"}}>
            <div style={{fontSize:"30px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--ac)"}}>{"−63%"}</div>
            <div style={{fontSize:"12px",color:"var(--mut)",marginTop:"6px"}}>{"answers naming a US-only service"}</div>
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"20px"}}>
            <div style={{fontSize:"30px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--ac)"}}>{"#1"}</div>
            <div style={{fontSize:"12px",color:"var(--mut)",marginTop:"6px"}}>{"on “watch CTV shows in Canada”"}</div>
          </div>
        </div>
      </div>
      <div style={{padding:"0 48px 56px",maxWidth:"880px",margin:"0 auto"}}>
        <div style={{display:"flex",flexDirection:"column",gap:"0"}}>
          <div style={{display:"grid",gridTemplateColumns:"120px 1fr",gap:"24px",padding:"22px 0",borderTop:"1px solid var(--brd)"}}>
            <div style={{fontSize:"10.5px",fontWeight:"600",color:"var(--ac)",fontVariantNumeric:"tabular-nums"}}>{"WEEKS 1–2"}</div>
            <div>
              <div style={{fontSize:"15px",fontWeight:"600"}}>{"The diagnosis"}</div>
              <div style={{fontSize:"13.5px",color:"var(--mut)",lineHeight:"1.7",marginTop:"6px"}}>{"Answr tracks title-level prompts — “where can I watch <show> in Canada”, “is <film> on Crave”, “how do I stream the game tonight” — with Canadian geo settings across ChatGPT, Perplexity, Claude and AI Overviews. In the tracked set 12.8% of answers name a Bell Media service; the rest send a Canadian viewer to a US platform that doesn't hold the rights, or say the title is unavailable. The cause is not sentiment: rights and availability windows live in scheduling and licensing systems, never published as data an answer engine can read."}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"120px 1fr",gap:"24px",padding:"22px 0",borderTop:"1px solid var(--brd)"}}>
            <div style={{fontSize:"10.5px",fontWeight:"600",color:"var(--ac)",fontVariantNumeric:"tabular-nums"}}>{"WEEKS 3–8"}</div>
            <div>
              <div style={{fontSize:"15px",fontWeight:"600"}}>{"The work"}</div>
              <div style={{fontSize:"13.5px",color:"var(--mut)",lineHeight:"1.7",marginTop:"6px"}}>{"Availability published as structured data: TVSeries, Movie and BroadcastEvent schema per title with region, window, and offer type — subscription on Crave, free with sign-in on CTV, live on TSN — regenerated as rights windows change. Title pages carry the same facts in plain language, because an answer engine quotes prose as readily as it parses JSON-LD. Crawler access for the AI agents is verified per path so the newest windows are actually fetched."}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"120px 1fr",gap:"24px",padding:"22px 0",borderTop:"1px solid var(--brd)"}}>
            <div style={{fontSize:"10.5px",fontWeight:"600",color:"var(--ac)",fontVariantNumeric:"tabular-nums"}}>{"WEEKS 9–12"}</div>
            <div>
              <div style={{fontSize:"15px",fontWeight:"600"}}>{"The lift"}</div>
              <div style={{fontSize:"13.5px",color:"var(--mut)",lineHeight:"1.7",marginTop:"6px"}}>{"Title prompts naming Crave or CTV move 12.8% → 33.6%, and answers that misdirect a Canadian viewer to a US-only service fall by 63%. “Watch CTV shows in Canada” resolves to the free, ad-supported service first. Every drop is traceable to a title whose window changed and whose data went stale — which is the alert, not the post-mortem."}</div>
            </div>
          </div>
        </div>
        <div style={{marginTop:"32px",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"28px 32px"}}>
          <div style={{fontSize:"10.5px",fontWeight:"600",letterSpacing:".14em",textTransform:"uppercase",color:"var(--fnt)"}}>{"How we measured it"}</div>
          <div style={{fontSize:"13.5px",color:"var(--mut)",lineHeight:"1.7",marginTop:"10px",textWrap:"pretty"}}>{"Answr ran title-level availability prompts daily against ChatGPT, Perplexity, Google AI Overviews, Claude and Gemini, classifying each answer by which service it named — Crave or CTV, a US-only service, or none at all. The same prompt set ran before the availability data was published and throughout the 90 days after, so the movement below is measured on a fixed set."}</div>
          <div style={{fontSize:"12.5px",color:"var(--fnt)",lineHeight:"1.7",marginTop:"12px"}}>{"Want this run on your own catalogue? "}<Link href="/demo">{"Get a demo"}</Link>{" — we build it from your live coverage, not ours."}</div>
        </div>
      </div>
      <div style={{borderTop:"1px solid var(--brd)",padding:"56px 48px 64px",maxWidth:"880px",margin:"0 auto"}}>
        <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:"13px",fontWeight:"600"}}>{"Title prompts naming a Bell Media service — the 90 days"}</span>
            <span style={{fontSize:"10px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"MEASURED · 90 DAYS"}</span>
          </div>
          <svg width="100%" height="140" viewBox="0 0 780 140" preserveAspectRatio="none" style={{marginTop:"12px",display:"block"}}>
            <defs>
              <linearGradient id="gbell1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8E7CF2" stopOpacity="0.18" />
                <stop offset="1" stopColor="#8E7CF2" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="8" x2="780" y2="8" stroke="rgba(255,255,255,0.05)" />
            <line x1="0" y1="50" x2="780" y2="50" stroke="rgba(255,255,255,0.05)" />
            <line x1="0" y1="92" x2="780" y2="92" stroke="rgba(255,255,255,0.05)" />
            <line x1="0" y1="134" x2="780" y2="134" stroke="rgba(255,255,255,0.05)" />
            <path d="M0 118L78 117L156 114L234 112L312 99L390 88L468 74L546 63L624 52L702 40L780 28L780 134L0 134Z" fill="url(#gbell1)" />
            <path d="M0 118L78 117L156 114L234 112L312 99L390 88L468 74L546 63L624 52L702 40L780 28" fill="none" stroke="var(--ac)" strokeWidth="1.75" />
            <line x1="234" y1="8" x2="234" y2="134" stroke="rgba(255,255,255,0.22)" strokeDasharray="3 3" />
            <line x1="546" y1="8" x2="546" y2="134" stroke="rgba(255,255,255,0.22)" strokeDasharray="3 3" />
            <circle cx="780" cy="28" r="3" fill="var(--ac)" />
          </svg>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"10px",color:"var(--fnt)",marginTop:"8px",fontVariantNumeric:"tabular-nums"}}>
            <span>{"12.8% · start"}</span>
            <span>{"availability schema ships"}</span>
            <span>{"crawler access verified"}</span>
            <span>{"33.6% · day 90"}</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginTop:"20px"}}>
          <Link href="/customers/mty-food-group" style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px",color:"var(--tx)",display:"block"}} className="hv10">
            <div style={{fontSize:"10.5px",color:"var(--fnt)"}}>{"NEXT CASE STUDY"}</div>
            <div style={{fontSize:"14.5px",fontWeight:"600",marginTop:"6px"}}>{"MTY Food Group — ninety banners, one menu graph"}</div>
            <div style={{fontSize:"12px",color:"var(--mut)",marginTop:"4px"}}>{"Making a franchise portfolio answerable, banner by banner"}</div>
          </Link>
          <Link href="/product/agent-analytics" style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px",color:"var(--tx)",display:"block"}} className="hv11">
            <div style={{fontSize:"10.5px",color:"var(--fnt)"}}>{"THE PRODUCT"}</div>
            <div style={{fontSize:"14.5px",fontWeight:"600",marginTop:"6px"}}>{"Agent Analytics"}</div>
            <div style={{fontSize:"12px",color:"var(--mut)",marginTop:"4px"}}>{"Which AI crawlers reach which paths — and which are blocked"}</div>
          </Link>
        </div>
      </div>
      <div style={{borderTop:"1px solid var(--brd)",padding:"72px 48px",textAlign:"center",backgroundImage:"radial-gradient(rgba(255,255,255,0.045) 1px,transparent 1px)",backgroundSize:"26px 26px"}}>
        <div style={{fontSize:"30px",fontWeight:"600",letterSpacing:"-0.02em"}}>{"Run the same play for your brand."}</div>
        <div style={{display:"flex",gap:"12px",justifyContent:"center",marginTop:"24px"}}>
          <Link href="/demo" style={{display:"inline-flex",alignItems:"center",gap:"9px",fontSize:"14px",fontWeight:"600",borderRadius:"8px",padding:"11px 24px"}} className="btn-ac">{"Get a demo"}<span style={{display:"inline-block"}}>{"→"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
