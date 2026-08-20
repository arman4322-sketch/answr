import Link from "next/link";
import type { Metadata } from "next";
import "./page.css";

export const metadata: Metadata = { title: "MTY Food Group — case study" };

/* MTY Food Group — case study. Answr measured answer-engine coverage across the
   portfolio's ~90 banners, diagnosed the cause (menu, allergen and hours data
   fragmented across banner and franchisee sites in formats answer engines cannot
   parse), and sequenced the schema work that closed the gap. */
export default function MtyFoodGroupCaseStudyPage() {
  return (
    <div className="frame-casestudy">
      <div style={{padding:"64px 48px 48px",maxWidth:"880px",margin:"0 auto"}}>
        <div style={{fontSize:"11.5px",color:"var(--fnt)"}}>
          <Link href="/customers" style={{color:"var(--fnt)"}} className="hv9">{"Customers"}</Link>{" "}<span style={{color:"#3a3b40"}}>{"/"}</span>{" "}<span style={{color:"var(--ac)"}}>{"MTY Food Group"}</span>
        </div>
        
        <div style={{fontSize:"44px",fontWeight:"600",letterSpacing:"-0.025em",lineHeight:"1.15",marginTop:"10px",textWrap:"balance"}}>{"Ninety banners, one machine-readable menu"}</div>
        <div style={{display:"flex",gap:"20px",marginTop:"16px",fontSize:"12px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>
          <span>{"Restaurant franchisor · ~90 banners"}</span>
          <span>{"On the Scale plan"}</span>
          <span>{"90-day program"}</span>
        </div>
      </div>
      <div style={{padding:"0 48px 48px",maxWidth:"1180px",margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"14px"}}>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"20px"}}>
            <div style={{fontSize:"30px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--ac)"}}>{"+16pt"}</div>
            <div style={{fontSize:"12px",color:"var(--mut)",marginTop:"6px"}}>{"banner answer coverage in 90 days"}</div>
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"20px"}}>
            <div style={{fontSize:"30px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--ac)"}}>{"38"}</div>
            <div style={{fontSize:"12px",color:"var(--mut)",marginTop:"6px"}}>{"banners with structured menu data"}</div>
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"20px"}}>
            <div style={{fontSize:"30px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--ac)"}}>{"#2"}</div>
            <div style={{fontSize:"12px",color:"var(--mut)",marginTop:"6px"}}>{"on “quick-service sushi near me”"}</div>
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"20px"}}>
            <div style={{fontSize:"30px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--ac)"}}>{"310"}</div>
            <div style={{fontSize:"12px",color:"var(--mut)",marginTop:"6px"}}>{"city-level prompts naming a banner"}</div>
          </div>
        </div>
      </div>
      <div style={{padding:"0 48px 56px",maxWidth:"880px",margin:"0 auto"}}>
        <div style={{display:"flex",flexDirection:"column",gap:"0"}}>
          <div style={{display:"grid",gridTemplateColumns:"120px 1fr",gap:"24px",padding:"22px 0",borderTop:"1px solid var(--brd)"}}>
            <div style={{fontSize:"10.5px",fontWeight:"600",color:"var(--ac)",fontVariantNumeric:"tabular-nums"}}>{"WEEKS 1–2"}</div>
            <div>
              <div style={{fontSize:"15px",fontWeight:"600"}}>{"The diagnosis"}</div>
              <div style={{fontSize:"13.5px",color:"var(--mut)",lineHeight:"1.7",marginTop:"6px"}}>{"Answr tracks the prompts a hungry customer actually types — “best quick-service sushi near me”, “healthy fast food in Canada”, “gluten-free options in the food court” — and scores coverage per banner rather than per domain. Across the tracked set the portfolio is named in 9.2% of answers; independents and US chains take the rest. Two causes: menus, allergens and hours live in PDFs and images spread across banner and franchisee sites, and half the banner domains carry no Restaurant or Menu schema at all."}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"120px 1fr",gap:"24px",padding:"22px 0",borderTop:"1px solid var(--brd)"}}>
            <div style={{fontSize:"10.5px",fontWeight:"600",color:"var(--ac)",fontVariantNumeric:"tabular-nums"}}>{"WEEKS 3–8"}</div>
            <div>
              <div style={{fontSize:"15px",fontWeight:"600"}}>{"The work"}</div>
              <div style={{fontSize:"13.5px",color:"var(--mut)",lineHeight:"1.7",marginTop:"6px"}}>{"One structured menu graph, published from the franchise system of record: Restaurant, Menu and MenuItem schema per banner with allergen and nutrition fields, plus hours and per-location details syndicated to every franchisee page. Thirty-eight banners land in the first wave — Thai Express, Sushi Shop and Cultures among them — each shipped as an Answr action with the prompts it targets attached, so the queue shows which banner still has no answer."}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"120px 1fr",gap:"24px",padding:"22px 0",borderTop:"1px solid var(--brd)"}}>
            <div style={{fontSize:"10.5px",fontWeight:"600",color:"var(--ac)",fontVariantNumeric:"tabular-nums"}}>{"WEEKS 9–12"}</div>
            <div>
              <div style={{fontSize:"15px",fontWeight:"600"}}>{"The lift"}</div>
              <div style={{fontSize:"13.5px",color:"var(--mut)",lineHeight:"1.7",marginTop:"6px"}}>{"Coverage moves 9.2% → 25.4% across the tracked prompt set, and assistants name a banner on 310 city-level prompts that previously returned only independents. The sushi banner sits second on “quick-service sushi near me”; nutrition and allergen questions resolve against first-party data instead of a third-party aggregator's stale copy."}</div>
            </div>
          </div>
        </div>
        <div style={{marginTop:"32px",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"28px 32px"}}>
          <div style={{fontSize:"10.5px",fontWeight:"600",letterSpacing:".14em",textTransform:"uppercase",color:"var(--fnt)"}}>{"How we measured it"}</div>
          <div style={{fontSize:"13.5px",color:"var(--mut)",lineHeight:"1.7",marginTop:"10px",textWrap:"pretty"}}>{"Answr ran 310 quick-service and category prompts daily against ChatGPT, Perplexity, Google AI Overviews, Claude and Gemini, matching every answer against MTY's banner list to score coverage banner by banner. The same prompt set ran before the schema work began and throughout the 90 days after, so the movement below is measured on a fixed set — not a re-picked one."}</div>
          <div style={{fontSize:"12.5px",color:"var(--fnt)",lineHeight:"1.7",marginTop:"12px"}}>{"Want this run on your own prompt set? "}<Link href="/demo">{"Get a demo"}</Link>{" — we build it from your live coverage, not ours."}</div>
        </div>
      </div>
      <div style={{borderTop:"1px solid var(--brd)",padding:"56px 48px 64px",maxWidth:"880px",margin:"0 auto"}}>
        <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:"13px",fontWeight:"600"}}>{"Banner answer coverage — the 90 days"}</span>
            <span style={{fontSize:"10px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"MEASURED · 90 DAYS"}</span>
          </div>
          <svg width="100%" height="140" viewBox="0 0 780 140" preserveAspectRatio="none" style={{marginTop:"12px",display:"block"}}>
            <defs>
              <linearGradient id="gmty1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8E7CF2" stopOpacity="0.18" />
                <stop offset="1" stopColor="#8E7CF2" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="8" x2="780" y2="8" stroke="rgba(255,255,255,0.05)" />
            <line x1="0" y1="50" x2="780" y2="50" stroke="rgba(255,255,255,0.05)" />
            <line x1="0" y1="92" x2="780" y2="92" stroke="rgba(255,255,255,0.05)" />
            <line x1="0" y1="134" x2="780" y2="134" stroke="rgba(255,255,255,0.05)" />
            <path d="M0 122L78 120L156 121L234 116L312 106L390 96L468 84L546 72L624 58L702 44L780 34L780 134L0 134Z" fill="url(#gmty1)" />
            <path d="M0 122L78 120L156 121L234 116L312 106L390 96L468 84L546 72L624 58L702 44L780 34" fill="none" stroke="var(--ac)" strokeWidth="1.75" />
            <line x1="234" y1="8" x2="234" y2="134" stroke="rgba(255,255,255,0.22)" strokeDasharray="3 3" />
            <line x1="546" y1="8" x2="546" y2="134" stroke="rgba(255,255,255,0.22)" strokeDasharray="3 3" />
            <circle cx="780" cy="34" r="3" fill="var(--ac)" />
          </svg>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"10px",color:"var(--fnt)",marginTop:"8px",fontVariantNumeric:"tabular-nums"}}>
            <span>{"9.2% · start"}</span>
            <span>{"menu schema ships"}</span>
            <span>{"hours + locations sync"}</span>
            <span>{"25.4% · day 90"}</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginTop:"20px"}}>
          <Link href="/customers/bell-media" style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px",color:"var(--tx)",display:"block"}} className="hv10">
            <div style={{fontSize:"10.5px",color:"var(--fnt)"}}>{"NEXT CASE STUDY"}</div>
            <div style={{fontSize:"14.5px",fontWeight:"600",marginTop:"6px"}}>{"Bell Media — the streaming-rights answer"}</div>
            <div style={{fontSize:"12px",color:"var(--mut)",marginTop:"4px"}}>{"“Where can I stream it in Canada”, answered correctly"}</div>
          </Link>
          <Link href="/product/answer-engine-insights" style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px",color:"var(--tx)",display:"block"}} className="hv11">
            <div style={{fontSize:"10.5px",color:"var(--fnt)"}}>{"THE PRODUCT"}</div>
            <div style={{fontSize:"14.5px",fontWeight:"600",marginTop:"6px"}}>{"Answer Engine Insights"}</div>
            <div style={{fontSize:"12px",color:"var(--mut)",marginTop:"4px"}}>{"Topic × platform coverage, scored per brand"}</div>
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
