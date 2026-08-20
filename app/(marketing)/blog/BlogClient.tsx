"use client";

import Link from "next/link";
import { useState } from "react";

/* Blog index — interactive layer (marketing tone, no demo toasts):
   - Category pills really filter: every post in the fixture carries a
     category badge (AEO RESEARCH / GUIDE / PRODUCT), incl. the featured post.
   - "Load 12 more" hides after click and swaps to an inline caught-up caption.
   - Newsletter subscribe validates a non-empty email, then swaps to an
     inline success line in the page's voice. Markup and copy verbatim. */

type Cat = "AEO research" | "Guides" | "Product";

const badgeBase: React.CSSProperties = {fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",borderRadius:"4px",padding:"3px 8px"};
const badgeStyles: Record<Cat, React.CSSProperties> = {
  "AEO research": {...badgeBase,color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 40%,transparent)"},
  "Guides": {...badgeBase,color:"#7fa7d9",border:"1px solid rgba(127,167,217,.35)"},
  "Product": {...badgeBase,color:"#b98ed9",border:"1px solid rgba(185,142,217,.35)"},
};
const badgeLabels: Record<Cat, string> = {
  "AEO research": "AEO RESEARCH",
  "Guides": "GUIDE",
  "Product": "PRODUCT",
};

const cards: { cat: Cat; meta: string; title: string; desc: string; hv: string }[] = [
  { cat: "Guides", meta: "Jul 22 · 9 min", title: "llms.txt, explained: what it is and whether you need one", desc: "A practical walkthrough of the emerging standard, with examples from 40 sites already using it.", hv: "hv9" },
  { cat: "Product", meta: "Jul 15 · 4 min", title: "Conversation Explorer now covers multi-turn threads", desc: "Follow-up questions change which brands get recommended. Now you can see exactly where.", hv: "hv10" },
  { cat: "AEO research", meta: "Jul 8 · 11 min", title: "How AI Overviews picks its sources, measured across 8,000 queries", desc: "Google's answer engine behaves differently from chat assistants. The overlap is smaller than you think.", hv: "hv11" },
  { cat: "Guides", meta: "Jun 30 · 7 min", title: "Building a prompt set that actually reflects your buyers", desc: "Bad prompt sets produce comforting dashboards. Here's how to write ones that hurt — usefully.", hv: "hv12" },
  { cat: "Product", meta: "Jun 24 · 3 min", title: "Agent Analytics adds llms.txt validation", desc: "Catch syntax errors and unreachable paths before crawlers do.", hv: "hv13" },
  { cat: "AEO research", meta: "Jun 17 · 12 min", title: "The sentiment gap: when AI mentions you but shouldn't", desc: "A mention with stale pricing or a wrong feature list costs more than absence. Measuring the difference.", hv: "hv14" },
];

const pillOn: React.CSSProperties = {color:"#fff",background:"var(--ac)",borderRadius:"5px",padding:"5px 11px",fontWeight:"600",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:"11.5px",fontVariantNumeric:"tabular-nums"};
const pillOff: React.CSSProperties = {color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"5px",padding:"5px 11px",background:"transparent",cursor:"pointer",fontFamily:"inherit",fontSize:"11.5px",fontWeight:"400",fontVariantNumeric:"tabular-nums"};

export default function BlogClient() {
  const [filter, setFilter] = useState<"All" | Cat>("All");
  const [caughtUp, setCaughtUp] = useState(false);
  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const visible = filter === "All" ? cards : cards.filter((c) => c.cat === filter);
  const showFeatured = filter === "All" || filter === "AEO research";

  function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setInvalid(true);
      return;
    }
    setSubscribed(true);
  }

  return (
    <>
      <div style={{padding:"64px 48px 24px",maxWidth:"1280px",margin:"0 auto",display:"flex",alignItems:"baseline",justifyContent:"space-between"}}>
        <div style={{fontSize:"44px",fontWeight:"600",letterSpacing:"-0.025em"}}>{"Blog"}</div>
        <div style={{display:"flex",gap:"8px",fontSize:"11.5px",fontWeight:"400",fontVariantNumeric:"tabular-nums"}}>
          {(["All", "AEO research", "Guides", "Product"] as const).map((p) => (
            <button key={p} type="button" aria-pressed={filter === p} onClick={() => setFilter(p)} style={filter === p ? pillOn : pillOff}>{p}</button>
          ))}
        </div>
      </div>
      <div style={{padding:"24px 48px 64px",maxWidth:"1280px",margin:"0 auto"}}>
        {showFeatured && (
        <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"14px",padding:"40px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"48px",alignItems:"center"}}>
          <div>
            <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
              <span style={{fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 40%,transparent)",borderRadius:"4px",padding:"3px 8px"}}>{"AEO RESEARCH"}</span>
              <span style={{fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>{"Jul 29, 2026 · 14 min"}</span>
            </div>
            <div style={{fontSize:"30px",fontWeight:"600",letterSpacing:"-0.015em",lineHeight:"1.2",marginTop:"14px",textWrap:"balance"}}>{"We ran 50,000 prompts through five AI platforms. Here's what gets a brand cited."}</div>
            <div style={{fontSize:"14px",color:"var(--mut)",lineHeight:"1.65",marginTop:"12px"}}>{"Comparison pages beat feature pages 3.2×. Community threads punch far above their traffic. And schema markup matters more than anyone admits."}</div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginTop:"18px"}}>
              <div style={{width:"28px",height:"28px",borderRadius:"50%",background:"var(--bg2)",border:"1px solid var(--brd)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--ac)"}}>{"RK"}</div>
              <span style={{fontSize:"12.5px",color:"var(--mut)"}}>{"Rui Kimura, Research"}</span>
            </div>
          </div>
          <div style={{background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"24px",backgroundImage:"repeating-linear-gradient(-45deg,rgba(255,255,255,0.02) 0 10px,transparent 10px 20px)"}}>
            <div style={{fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",letterSpacing:".13em",color:"var(--fnt)"}}>{"CITATION RATE BY PAGE TYPE"}</div>
            <div style={{display:"flex",flexDirection:"column",gap:"12px",marginTop:"16px"}}>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"5px"}}>
                  <span>{"Comparison pages"}</span>
                  <span style={{fontSize:"11.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"38%"}</span>
                </div>
                <div style={{height:"8px",background:"var(--bg2)",borderRadius:"4px"}}>
                  <div style={{width:"84%",height:"8px",background:"var(--ac)",borderRadius:"4px"}} />
                </div>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"5px"}}>
                  <span>{"Reviews & roundups"}</span>
                  <span style={{fontSize:"11.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"31%"}</span>
                </div>
                <div style={{height:"8px",background:"var(--bg2)",borderRadius:"4px"}}>
                  <div style={{width:"69%",height:"8px",background:"var(--ac)",borderRadius:"4px",opacity:".8"}} />
                </div>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"5px"}}>
                  <span>{"Documentation"}</span>
                  <span style={{fontSize:"11.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"14%"}</span>
                </div>
                <div style={{height:"8px",background:"var(--bg2)",borderRadius:"4px"}}>
                  <div style={{width:"31%",height:"8px",background:"var(--ac)",borderRadius:"4px",opacity:".6"}} />
                </div>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"5px"}}>
                  <span>{"Feature pages"}</span>
                  <span style={{fontSize:"11.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"12%"}</span>
                </div>
                <div style={{height:"8px",background:"var(--bg2)",borderRadius:"4px"}}>
                  <div style={{width:"27%",height:"8px",background:"var(--ac)",borderRadius:"4px",opacity:".4"}} />
                </div>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"5px"}}>
                  <span>{"Pricing pages"}</span>
                  <span style={{fontSize:"11.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{"5%"}</span>
                </div>
                <div style={{height:"8px",background:"var(--bg2)",borderRadius:"4px"}}>
                  <div style={{width:"11%",height:"8px",background:"var(--ac)",borderRadius:"4px",opacity:".2"}} />
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"20px",marginTop:"20px"}}>
          {visible.map((c) => (
            <div key={c.title} style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"26px",display:"flex",flexDirection:"column",gap:"12px"}}>
              <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
                <span style={badgeStyles[c.cat]}>{badgeLabels[c.cat]}</span>
                <span style={{fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>{c.meta}</span>
              </div>
              <div style={{fontSize:"18px",fontWeight:"600",lineHeight:"1.35",textWrap:"balance"}}>{c.title}</div>
              <div style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.6"}}>{c.desc}</div>
              <div style={{marginTop:"auto"}}>
                <Link href="/blog/what-50k-prompts-taught-us" style={{display:"inline-flex",alignItems:"center",gap:"8px",fontSize:"12px",fontWeight:"500",color:"var(--tx)",background:"rgba(142,124,242,0.10)",borderRadius:"999px",padding:"5px 6px 5px 14px"}} className={c.hv}>{"Read"}<span style={{display:"inline-flex",width:"18px",height:"18px",borderRadius:"50%",background:"var(--ac)",color:"#fff",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:"700"}}>{"→"}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:"20px",background:"color-mix(in oklab,var(--ac) 7%,var(--bg1))",border:"1px solid color-mix(in oklab,var(--ac) 28%,transparent)",borderRadius:"12px",padding:"26px 32px",display:"flex",alignItems:"center",gap:"28px"}}>
          <div style={{flex:"1"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <span style={{fontSize:"17px",fontWeight:"600"}}>{"The Answr Index"}</span>
              <span style={{fontSize:"9px",fontWeight:"600",color:"var(--ac)",background:"rgba(142,124,242,0.16)",borderRadius:"4px",padding:"2px 7px",fontVariantNumeric:"tabular-nums"}}>{"JULY 2026"}</span>
            </div>
            <div style={{fontSize:"13px",color:"var(--mut)",marginTop:"6px",lineHeight:"1.55"}}>{"The 500 domains AI cites most, ranked monthly across five platforms. The category's public benchmark — free, no email wall."}</div>
          </div>
          <div style={{display:"flex",gap:"28px",fontVariantNumeric:"tabular-nums"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"20px",fontWeight:"600",color:"var(--ac)"}}>{"500"}</div>
              <div style={{fontSize:"10px",color:"var(--fnt)",marginTop:"2px"}}>{"DOMAINS"}</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"20px",fontWeight:"600",color:"var(--ac)"}}>{"1.2M"}</div>
              <div style={{fontSize:"10px",color:"var(--fnt)",marginTop:"2px"}}>{"CITATIONS"}</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"20px",fontWeight:"600",color:"var(--ac)"}}>{"5"}</div>
              <div style={{fontSize:"10px",color:"var(--fnt)",marginTop:"2px"}}>{"PLATFORMS"}</div>
            </div>
          </div>
          <Link href="/resources/answr-index" style={{display:"inline-flex",alignItems:"center",gap:"8px",fontSize:"13px",fontWeight:"600",borderRadius:"8px",padding:"10px 20px",whiteSpace:"nowrap"}} className="btn-ac">{"Browse the index"}<span style={{display:"inline-block"}}>{"→"}</span>
          </Link>
        </div>
        <div style={{display:"flex",justifyContent:"center",marginTop:"28px"}}>
          {caughtUp ? (
            <div style={{fontSize:"13px",color:"var(--mut)",padding:"10px 0"}}>{"You're all caught up — 12 posts shown."}</div>
          ) : (
            <button type="button" onClick={() => setCaughtUp(true)} style={{fontSize:"13px",fontWeight:"500",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"10px 28px",background:"var(--bg1)",cursor:"pointer",fontFamily:"inherit"}}>{"Load 12 more"}</button>
          )}
        </div>
        <div style={{marginTop:"32px",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"28px 32px",display:"flex",alignItems:"center",gap:"24px"}}>
          <div style={{flex:"1"}}>
            <div style={{fontSize:"17px",fontWeight:"600"}}>{"The Answer Layer — monthly research digest"}</div>
            <div style={{fontSize:"13px",color:"var(--mut)",marginTop:"5px"}}>{"One email a month. Data, not takes."}</div>
          </div>
          {subscribed ? (
            <div role="status" style={{fontSize:"13px",color:"var(--tx)",display:"flex",alignItems:"center",gap:"10px"}}>
              <span style={{color:"var(--good)",fontWeight:"700"}}>{"✓"}</span>
              {"Subscribed — the next issue lands in your inbox early next month."}
            </div>
          ) : (
            <form onSubmit={subscribe} noValidate style={{display:"flex",alignItems:"center",gap:"24px"}}>
              <input
                type="email"
                name="email"
                aria-label="Work email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setInvalid(false); }}
                style={{border:`1px solid ${invalid ? "var(--bad)" : "var(--brd)"}`,borderRadius:"8px",background:"var(--bg0)",padding:"10px 14px",fontSize:"13px",color:"var(--tx)",width:"260px",fontFamily:"inherit"}}
              />
              <button type="submit" className="btn-ac" style={{display:"inline-flex",alignItems:"center",gap:"7px",fontSize:"13px",fontWeight:"600",borderRadius:"8px",padding:"10px 20px",cursor:"pointer",fontFamily:"inherit"}}>{"Subscribe"}<span style={{display:"inline-block"}}>{"→"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
