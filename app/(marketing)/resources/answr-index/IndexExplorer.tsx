"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

/* The Answr Index — hero platform chips + the ranked table (client).

   INTERACTIVITY_CONVENTIONS: this is a real public index page, not a depicted
   product screenshot, so the platform chips are a working single-select — they
   re-rank the table by that platform's share of the domain's citations. The
   "⌕ Find a domain…" field really filters. Marketing tone: no demo toasts —
   "View the full index" navigates to /demo (the page's own conversion path).

   Per-platform splits are fixed weights per domain; the "All platforms" column
   is their sum, so it renders the frame's exact numbers. */

const platforms = ["All platforms", "ChatGPT", "Perplexity", "AI Overviews", "Claude", "Gemini"] as const;
type Platform = (typeof platforms)[number];

type Row = {
  domain: string;
  category: string;
  citations: number; // thousands, all platforms
  delta: number; // thousands, all platforms, signed
  /* share of this domain's citations by platform: ChatGPT, Perplexity, AI Overviews, Claude, Gemini */
  weights: [number, number, number, number, number];
  spark: string;
  stroke: string;
  sparkOpacity?: string;
  badge?: string;
  highlight?: boolean;
};

const rows: Row[] = [
  {
    domain: "wikipedia.org",
    category: "Reference",
    citations: 84.2,
    delta: 2.1,
    weights: [0.3, 0.2, 0.26, 0.12, 0.12],
    spark: "M0 11L12 10L24 11L36 9L48 9L58 8L70 7",
    stroke: "var(--ac)",
  },
  {
    domain: "reddit.com",
    category: "Community",
    citations: 61.8,
    delta: 4.4,
    weights: [0.34, 0.2, 0.28, 0.08, 0.1],
    spark: "M0 15L12 13L24 12L36 10L48 8L58 6L70 4",
    stroke: "var(--ac)",
  },
  {
    domain: "youtube.com",
    category: "Video",
    citations: 47.3,
    delta: -1.2,
    weights: [0.24, 0.14, 0.34, 0.08, 0.2],
    spark: "M0 8L12 9L24 9L36 10L48 11L58 11L70 12",
    stroke: "#7fa7d9",
  },
  {
    domain: "github.com",
    category: "Developer",
    citations: 33.9,
    delta: 0.8,
    weights: [0.32, 0.2, 0.16, 0.22, 0.1],
    spark: "M0 12L12 11L24 12L36 10L48 10L58 9L70 8",
    stroke: "var(--ac)",
    sparkOpacity: ".7",
  },
  {
    domain: "g2.com",
    category: "Reviews",
    citations: 29.4,
    delta: 2.6,
    weights: [0.28, 0.34, 0.18, 0.12, 0.08],
    spark: "M0 14L12 13L24 11L36 10L48 8L58 7L70 5",
    stroke: "var(--ac)",
    badge: "B2B DECIDER",
    highlight: true,
  },
  {
    domain: "nih.gov",
    category: "Health",
    citations: 27.1,
    delta: 0.4,
    weights: [0.28, 0.18, 0.3, 0.12, 0.12],
    spark: "M0 11L12 11L24 10L36 10L48 9L58 9L70 9",
    stroke: "var(--ac)",
    sparkOpacity: ".7",
  },
  {
    domain: "stackoverflow.com",
    category: "Developer",
    citations: 24.8,
    delta: -2.0,
    weights: [0.3, 0.18, 0.18, 0.24, 0.1],
    spark: "M0 6L12 7L24 8L36 9L48 10L58 12L70 13",
    stroke: "#b98ed9",
  },
  {
    domain: "booking.com",
    category: "Travel",
    citations: 21.5,
    delta: 1.1,
    weights: [0.22, 0.2, 0.32, 0.08, 0.18],
    spark: "M0 13L12 12L24 12L36 11L48 10L58 9L70 9",
    stroke: "var(--ac)",
    sparkOpacity: ".7",
  },
];

const grid = "52px 1.5fr .9fr .8fr .6fr 90px";

const chipOn: React.CSSProperties = {
  fontSize: "11.5px",
  fontWeight: "600",
  color: "#fff",
  background: "var(--ac)",
  borderRadius: "6px",
  padding: "6px 14px",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};

const chipOff: React.CSSProperties = {
  fontSize: "11.5px",
  color: "var(--mut)",
  border: "1px solid var(--brd)",
  borderRadius: "6px",
  padding: "6px 14px",
  background: "transparent",
  cursor: "pointer",
  fontFamily: "inherit",
};

function weightFor(row: Row, platform: Platform) {
  if (platform === "All platforms") return 1;
  return row.weights[platforms.indexOf(platform) - 1];
}

function fmt(n: number) {
  return `${n.toFixed(1)}K`;
}

export default function IndexExplorer() {
  const [platform, setPlatform] = useState<Platform>("All platforms");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .map((row) => {
        const w = weightFor(row, platform);
        const citations = Math.round(row.citations * w * 10) / 10;
        const scaled = Math.round(row.delta * w * 10) / 10;
        // keep a movement visible even when a platform's slice rounds to zero
        const delta = scaled === 0 ? (row.delta > 0 ? 0.1 : -0.1) : scaled;
        return { ...row, citations, delta };
      })
      .sort((a, b) => b.citations - a.citations)
      .map((row, i) => ({ ...row, rank: i + 1 }))
      .filter((row) => !q || row.domain.toLowerCase().includes(q));
  }, [platform, query]);

  return (
    <>
      <div style={{padding:"72px 48px 40px",textAlign:"center"}}>
        <div style={{display:"inline-block",fontSize:"10.5px",fontWeight:"600",letterSpacing:".14em",textTransform:"uppercase",color:"var(--ac)",border:"1px solid color-mix(in oklab,var(--ac) 32%,transparent)",background:"rgba(142,124,242,0.08)",borderRadius:"999px",padding:"6px 14px"}}>{"The Answr Index · July 2026"}</div>
        <div style={{fontSize:"46px",fontWeight:"600",letterSpacing:"-0.025em",marginTop:"16px"}}>{"The 500 domains AI cites most"}</div>
        <div style={{fontSize:"15px",color:"var(--mut)",lineHeight:"1.65",marginTop:"12px",maxWidth:"560px",marginLeft:"auto",marginRight:"auto",textWrap:"pretty"}}>{"Ranked monthly from 1.2M citations across five platforms. Public and free — the category's benchmark for source authority."}</div>
        <div style={{display:"flex",justifyContent:"center",gap:"8px",marginTop:"26px",fontSize:"11.5px",flexWrap:"wrap"}}>
          {platforms.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={platform === p}
              onClick={() => setPlatform(p)}
              style={platform === p ? chipOn : chipOff}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:"0 48px 56px",maxWidth:"980px",margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
          <input
            type="search"
            aria-label="Find a domain"
            placeholder="⌕ Find a domain…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{border:"1px solid var(--brd)",borderRadius:"8px",background:"var(--bg1)",padding:"9px 14px",fontSize:"12.5px",color:"var(--tx)",width:"280px",fontFamily:"inherit",boxSizing:"border-box"}}
          />
          <span style={{fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"UPDATED AUG 1, 2026"}</span>
        </div>
        <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:grid,padding:"10px 20px",fontSize:"10px",fontWeight:"500",letterSpacing:".1em",color:"var(--fnt)",borderBottom:"1px solid var(--brd)"}}>
            <span>{"RANK"}</span>
            <span>{"DOMAIN"}</span>
            <span>{"CATEGORY"}</span>
            <span>{"CITATIONS / MO"}</span>
            <span>{"Δ 30D"}</span>
            <span>{"TREND"}</span>
          </div>
          {visible.length === 0 && (
            <div style={{padding:"22px 20px",fontSize:"13px",color:"var(--mut)"}}>{`No domain in the top 8 matches “${query.trim()}” — the published index runs 500 deep.`}</div>
          )}
          {visible.map((row, i) => (
            <div
              key={row.domain}
              style={{display:"grid",gridTemplateColumns:grid,alignItems:"center",padding:"11px 20px",fontSize:"13px",...(i > 0 ? {borderTop:"1px solid var(--brd)"} : null),...(row.highlight ? {background:"rgba(142,124,242,0.05)"} : null)}}
            >
              <span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{String(row.rank)}</span>
              <span style={{fontWeight:"600"}}>
                {row.badge ? `${row.domain} ` : row.domain}
                {row.badge && (
                  <span style={{fontSize:"9px",fontWeight:"600",color:"#b3a7f8",background:"rgba(142,124,242,0.16)",borderRadius:"3px",padding:"1px 5px"}}>{row.badge}</span>
                )}
              </span>
              <span style={{color:"var(--mut)",fontSize:"12px"}}>{row.category}</span>
              <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{fmt(row.citations)}</span>
              <span style={{fontSize:"11.5px",color:row.delta >= 0 ? "#4cb782" : "#e5636e"}}>{`${row.delta >= 0 ? "↑" : "↓"} ${fmt(Math.abs(row.delta))}`}</span>
              <svg width="70" height="20" viewBox="0 0 70 20">
                <path d={row.spark} fill="none" stroke={row.stroke} strokeWidth="1.25" opacity={row.sparkOpacity} />
              </svg>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px",fontSize:"12px",borderTop:"1px solid var(--brd)"}}>
            <span style={{color:"var(--fnt)"}}>{`Showing ${visible.length} of 500 · `}<Link href="/demo" style={{color:"var(--ac)",fontWeight:"500"}}>{"View the full index"}</Link>
            </span>
            <span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"Methodology: direct sampling, deduplicated per answer · "}<Link href="/security">{"read more"}</Link>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
