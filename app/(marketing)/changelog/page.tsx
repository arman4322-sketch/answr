import Link from "next/link";
import type { Metadata } from "next";
import OlderReleases from "./OlderReleases";

export const metadata: Metadata = { title: "Changelog" };

/* Changelog — converted from canvas frame #changelog. */
export default function ChangelogPage() {
  return (
    <div className="frame-changelog">
      <div style={{padding:"64px 48px 24px",maxWidth:"880px",margin:"0 auto",display:"flex",alignItems:"baseline",justifyContent:"space-between"}}>
        <div style={{fontSize:"44px",fontWeight:"600",letterSpacing:"-0.025em"}}>{"Changelog"}</div>
        <div style={{fontSize:"12px",color:"var(--fnt)"}}>{"Ships every Tuesday · "}<Link href="/blog">{"Subscribe via the digest"}</Link>
        </div>
      </div>
      <div style={{padding:"24px 48px 64px",maxWidth:"880px",margin:"0 auto",display:"flex",flexDirection:"column"}}>
        <div style={{display:"grid",gridTemplateColumns:"110px 1fr",gap:"24px",padding:"24px 0",borderTop:"1px solid var(--brd)"}}>
          <div style={{fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"Aug 2, 2026"}</div>
          <div>
            <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
              <span style={{fontSize:"15px",fontWeight:"600"}}>{"Demand watchlists"}</span>
              <span style={{fontSize:"9px",fontWeight:"600",color:"var(--ac)",background:"rgba(142,124,242,0.14)",borderRadius:"4px",padding:"2px 6px"}}>{"NEW"}</span>
            </div>
            <div style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.65",marginTop:"6px"}}>{"Group keywords, track pooled prompt volume, and get a weekly digest per list. Detail pages now show exact and phrase match."}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"110px 1fr",gap:"24px",padding:"24px 0",borderTop:"1px solid var(--brd)"}}>
          <div style={{fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"Jul 15, 2026"}</div>
          <div>
            <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
              <span style={{fontSize:"15px",fontWeight:"600"}}>{"Multi-turn Conversation Explorer"}</span>
              <span style={{fontSize:"9px",fontWeight:"600",color:"var(--ac)",background:"rgba(142,124,242,0.14)",borderRadius:"4px",padding:"2px 6px"}}>{"IMPROVED"}</span>
            </div>
            <div style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.65",marginTop:"6px"}}>{"Follow-up questions change recommendations. Explorer now threads full conversations and marks where brands enter and exit."}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"110px 1fr",gap:"24px",padding:"24px 0",borderTop:"1px solid var(--brd)"}}>
          <div style={{fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"Jun 24, 2026"}</div>
          <div>
            <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
              <span style={{fontSize:"15px",fontWeight:"600"}}>{"llms.txt validation"}</span>
              <span style={{fontSize:"9px",fontWeight:"600",color:"var(--ac)",background:"rgba(142,124,242,0.14)",borderRadius:"4px",padding:"2px 6px"}}>{"NEW"}</span>
            </div>
            <div style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.65",marginTop:"6px"}}>{"Agent Analytics catches syntax errors and unreachable paths before crawlers do, with one-click fixes as actions."}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"110px 1fr",gap:"24px",padding:"24px 0",borderTop:"1px solid var(--brd)"}}>
          <div style={{fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"Jun 10, 2026"}</div>
          <div>
            <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
              <span style={{fontSize:"15px",fontWeight:"600"}}>{"Audiences"}</span>
              <span style={{fontSize:"9px",fontWeight:"600",color:"#e8b34b",background:"rgba(232,179,75,0.12)",borderRadius:"4px",padding:"2px 6px"}}>{"BETA"}</span>
            </div>
            <div style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.65",marginTop:"6px"}}>{"Visibility segmented by persona — see which buyer types hear about you, and which competitors own each audience."}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"110px 1fr",gap:"24px",padding:"24px 0",borderTop:"1px solid var(--brd)"}}>
          <div style={{fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"May 27, 2026"}</div>
          <div>
            <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
              <span style={{fontSize:"15px",fontWeight:"600"}}>{"MCP server"}</span>
              <span style={{fontSize:"9px",fontWeight:"600",color:"var(--ac)",background:"rgba(142,124,242,0.14)",borderRadius:"4px",padding:"2px 6px"}}>{"NEW"}</span>
            </div>
            <div style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.65",marginTop:"6px"}}>{"Query visibility data from Claude, Cursor or ChatGPT in plain language. Available on Scale and above."}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"110px 1fr",gap:"24px",padding:"24px 0",borderTop:"1px solid var(--brd)"}}>
          <div style={{fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"May 6, 2026"}</div>
          <div>
            <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
              <span style={{fontSize:"15px",fontWeight:"600"}}>{"Bulk prompt operations"}</span>
              <span style={{fontSize:"9px",fontWeight:"600",color:"var(--ac)",background:"rgba(142,124,242,0.14)",borderRadius:"4px",padding:"2px 6px"}}>{"IMPROVED"}</span>
            </div>
            <div style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.65",marginTop:"6px"}}>{"Tag, retire and re-topic hundreds of prompts at once; exports respect current filters."}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"110px 1fr",gap:"24px",padding:"24px 0",borderTop:"1px solid var(--brd)"}}>
          <div style={{fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"Apr 22, 2026"}</div>
          <div>
            <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
              <span style={{fontSize:"15px",fontWeight:"600"}}>{"Regional visibility"}</span>
              <span style={{fontSize:"9px",fontWeight:"600",color:"var(--ac)",background:"rgba(142,124,242,0.14)",borderRadius:"4px",padding:"2px 6px"}}>{"NEW"}</span>
            </div>
            <div style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.65",marginTop:"6px"}}>{"Score answers by market — 12 languages, per-locale competitor sets and regional panels on Enterprise."}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"110px 1fr",gap:"24px",padding:"24px 0",borderTop:"1px solid var(--brd)"}}>
          <div style={{fontSize:"11px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{"Apr 8, 2026"}</div>
          <div>
            <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
              <span style={{fontSize:"15px",fontWeight:"600"}}>{"Looker Studio connector"}</span>
              <span style={{fontSize:"9px",fontWeight:"600",color:"var(--ac)",background:"rgba(142,124,242,0.14)",borderRadius:"4px",padding:"2px 6px"}}>{"NEW"}</span>
            </div>
            <div style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.65",marginTop:"6px"}}>{"Blend visibility and citations with GA4 and Search Console in the dashboards you already report from."}</div>
          </div>
        </div>
        <OlderReleases />
      </div>
    </div>
  );
}
