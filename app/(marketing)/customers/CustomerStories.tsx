"use client";

import Link from "next/link";
import { useState } from "react";

/* Customers — case studies for MTY Food Group (restaurants) and Bell Media
   (broadcast/streaming). Each covers the same arc: how Answr measured the brand's
   answer-engine visibility, what the diagnosis was, and the AEO strategy that
   followed.

   Layout is the frame's own: the featured-card structure (1.3fr / 1fr split with a
   2×2 stat grid) is reused for both stories so they carry equal weight, and the
   four summary stat cards below are untouched. Industry chips (playbook 2/13,
   marketing tone: filter, never a demo toast) are relabelled to the sectors that
   actually have a story — every chip returns a result. */

type Industry = "Restaurants" | "Media";
type Chip = "All industries" | Industry;

const CHIPS: Chip[] = ["All industries", "Restaurants", "Media"];

const chipOn: React.CSSProperties = {fontSize:"11.5px",fontWeight:"600",color:"#fff",background:"var(--ac)",borderRadius:"5px",padding:"5px 12px",border:"none",cursor:"pointer",fontFamily:"inherit"};
const chipOff: React.CSSProperties = {fontSize:"11.5px",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"5px",padding:"5px 12px",background:"transparent",cursor:"pointer",fontFamily:"inherit"};

type Stat = { label: string; value: string; sub: string; accent?: boolean };
type Story = {
  key: string;
  industry: Industry;
  brand: string;
  headline: string;
  body: string;
  href: string;
  stats: [Stat, Stat, Stat, Stat];
};

const STORIES: Story[] = [
  {
    key: "mty",
    industry: "Restaurants",
    brand: "MTY Food Group",
    headline: "From invisible to first-named across 90 banners",
    body: "Answr measured how ChatGPT, Perplexity and AI Overviews answered 310 quick-service queries across MTY's portfolio, and found its banners named in under 9% of them. The diagnosis was structural: menus, allergens, hours and locations lived on separate banner and franchisee sites in formats answer engines couldn't parse. Answr's action queue sequenced the fix — one consolidated menu graph across Thai Express, Sushi Shop and Cultures — then tracked answer coverage banner by banner as it shipped.",
    href: "/customers/mty-food-group",
    stats: [
      { label: "COVERAGE · 90 DAYS", value: "+16pt", sub: "9.2% → 25.4% of tracked prompts", accent: true },
      { label: "BANNERS STRUCTURED", value: "38", sub: "menus, hours and allergens" },
      { label: "ANSWER RANK", value: "#2", sub: "on “quick-service sushi near me”" },
      { label: "LOCAL PROMPTS WON", value: "310", sub: "city-level prompts naming a banner" },
    ],
  },
  {
    key: "bell",
    industry: "Media",
    brand: "Bell Media",
    headline: "“Where can I stream it in Canada”, answered correctly",
    body: "Answr tracked how assistants answered streaming-availability questions for Bell Media's catalogue and found them naming US-only services — or calling titles unavailable — in the majority of responses. Bell held the Canadian rights; the availability data simply wasn't machine-readable. Answr turned that into a prioritised plan: publish per-title, per-window availability for Crave and CTV, then measure the recovery prompt by prompt.",
    href: "/customers/bell-media",
    stats: [
      { label: "TITLE PROMPTS · 90 DAYS", value: "+21pt", sub: "12.8% → 33.6% name Crave or CTV", accent: true },
      { label: "TITLES STRUCTURED", value: "1,400", sub: "availability windows published" },
      { label: "WRONG-SERVICE ANSWERS", value: "−63%", sub: "answers naming a US-only service" },
      { label: "ANSWER RANK", value: "#1", sub: "on “watch CTV shows in Canada”" },
    ],
  },
];

function StoryCard({ s }: { s: Story }) {
  return (
    <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"14px",padding:"40px",display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:"48px",alignItems:"center"}}>
      <div>
        <div style={{display:"flex",alignItems:"center",gap:"8px",color:"var(--mut)"}}>
          <span style={{fontSize:"16.5px",fontWeight:"600",letterSpacing:"-0.01em"}}>{s.brand}</span>
        </div>
        <div style={{fontSize:"28px",fontWeight:"600",letterSpacing:"-0.015em",lineHeight:"1.25",marginTop:"12px",textWrap:"balance"}}>{s.headline}</div>
        <div style={{fontSize:"14px",color:"var(--mut)",lineHeight:"1.65",marginTop:"12px",textWrap:"pretty"}}>{s.body}</div>
        <Link href={s.href} style={{display:"inline-flex",alignItems:"center",gap:"9px",fontSize:"13px",fontWeight:"500",color:"var(--tx)",background:"rgba(142,124,242,0.10)",borderRadius:"999px",padding:"7px 8px 7px 16px",marginTop:"16px"}} className="hv9">{"Read the case study"}<span style={{display:"inline-flex",width:"20px",height:"20px",borderRadius:"50%",background:"var(--ac)",color:"#fff",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700"}}>{"→"}</span></Link>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1px",background:"var(--brd)",border:"1px solid var(--brd)",borderRadius:"14px",overflow:"hidden"}}>
        {s.stats.map((st) => (
          <div key={st.label} style={{background:"var(--bg0)",padding:"22px 24px"}}>
            <div style={{fontSize:"10px",fontWeight:"600",letterSpacing:".12em",color:"var(--fnt)"}}>{st.label}</div>
            <div style={{display:"flex",alignItems:"baseline",gap:"8px",marginTop:"12px"}}><span style={{fontSize:"30px",fontWeight:"600",fontVariantNumeric:"tabular-nums",letterSpacing:"-0.02em",...(st.accent ? {color:"var(--ac)"} : null)}}>{st.value}</span></div>
            <div style={{fontSize:"11px",color:"var(--mut)",marginTop:"7px",fontVariantNumeric:"tabular-nums"}}>{st.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CustomerStories() {
  const [filter, setFilter] = useState<Chip>("All industries");
  const visible = filter === "All industries" ? STORIES : STORIES.filter((s) => s.industry === filter);

  return (
    <>
      <div style={{padding:"72px 48px 48px",maxWidth:"1280px",margin:"0 auto"}}><div style={{fontSize:"46px",fontWeight:"600",letterSpacing:"-0.02em",maxWidth:"700px",textWrap:"balance"}}>{"Teams winning the answer layer"}</div><div style={{fontSize:"15px",color:"var(--mut)",marginTop:"12px"}}>{"How marketing and content teams turn AI visibility into pipeline."}</div><div style={{display:"flex",gap:"8px",marginTop:"24px",fontSize:"11.5px"}}>{CHIPS.map((c) => (<button key={c} type="button" aria-pressed={filter === c} onClick={() => setFilter(c)} style={filter === c ? chipOn : chipOff}>{c}</button>))}</div></div>
      <div style={{padding:"0 48px 64px",maxWidth:"1280px",margin:"0 auto",display:"flex",flexDirection:"column",gap:"20px"}}>
        {visible.map((s) => <StoryCard key={s.key} s={s} />)}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px"}}><div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px 22px"}}><div style={{fontSize:"11.5px",fontWeight:"500",color:"var(--mut)"}}>{"Adoption"}</div><div style={{display:"flex",alignItems:"baseline",gap:"7px",marginTop:"9px"}}><span style={{fontSize:"26px",fontWeight:"600",fontVariantNumeric:"tabular-nums",letterSpacing:"-0.02em"}}>{"2,400+"}</span><span style={{fontSize:"12px",color:"var(--mut)"}}>{"teams"}</span></div><div style={{fontSize:"11px",color:"var(--fnt)",marginTop:"9px",lineHeight:"1.5"}}>{"From single brands to agency portfolios"}</div></div><div style={{background:"var(--bg1)",border:"1px solid color-mix(in oklab,var(--ac) 30%,var(--brd))",borderRadius:"12px",padding:"20px 22px"}}><div style={{fontSize:"11.5px",fontWeight:"500",color:"var(--mut)"}}>{"Result"}</div><div style={{display:"flex",alignItems:"baseline",gap:"7px",marginTop:"9px"}}><span style={{fontSize:"26px",fontWeight:"600",fontVariantNumeric:"tabular-nums",letterSpacing:"-0.02em",color:"var(--ac)"}}>{"+9.4pt"}</span><span style={{fontSize:"12px",color:"var(--mut)"}}>{"median lift"}</span></div><div style={{fontSize:"11px",color:"var(--fnt)",marginTop:"9px",lineHeight:"1.5"}}>{"Visibility score, first 6 months"}</div></div><div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px 22px"}}><div style={{fontSize:"11.5px",fontWeight:"500",color:"var(--mut)"}}>{"Speed"}</div><div style={{display:"flex",alignItems:"baseline",gap:"7px",marginTop:"9px"}}><span style={{fontSize:"26px",fontWeight:"600",fontVariantNumeric:"tabular-nums",letterSpacing:"-0.02em"}}>{"41 days"}</span><span style={{fontSize:"12px",color:"var(--mut)"}}>{"to first win"}</span></div><div style={{fontSize:"11px",color:"var(--fnt)",marginTop:"9px",lineHeight:"1.5"}}>{"Median time to first won prompt, 2026 cohort"}</div></div><div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"20px 22px"}}><div style={{fontSize:"11.5px",fontWeight:"500",color:"var(--mut)"}}>{"Coverage"}</div><div style={{display:"flex",alignItems:"baseline",gap:"7px",marginTop:"9px"}}><span style={{fontSize:"26px",fontWeight:"600",fontVariantNumeric:"tabular-nums",letterSpacing:"-0.02em"}}>{"5"}</span><span style={{fontSize:"12px",color:"var(--mut)"}}>{"answer engines"}</span></div><div style={{fontSize:"11px",color:"var(--fnt)",marginTop:"9px",lineHeight:"1.5"}}>{"ChatGPT, Perplexity, AI Overviews, Claude, Gemini"}</div></div></div>
      </div>
    </>
  );
}
