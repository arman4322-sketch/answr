"use client";

import Hint from "@/components/ui/Hint";
import ViewAllButton from "./ViewAllButton";
import { useFilters } from "@/lib/filters/context";
import { accrued, fmtInt } from "@/lib/filters/windows";
import { citationWindow } from "./citationWindow";

/* "Most cited pages" — the citation counts are a slice of the same pile the
   KPI reports, so they scale with the window (see citationWindow.ts). The
   "Prompts" column is a distinct count of prompts the page turns up for, so it
   accrues on the saturating curve instead. At 30 days the table prints the
   shipped rows exactly. Markup and inline styles are the frame's. */

const GRID = "2.2fr .7fr .7fr 1.4fr";

const TAG: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: "400",
  fontVariantNumeric: "tabular-nums",
  color: "var(--mut)",
  background: "var(--bg2)",
  borderRadius: "4px",
  padding: "3px 7px",
};

const ROWS: { url: string; citations30d: number; prompts30d: number; platforms: string[] }[] = [
  { url: "nike.com/running/marathon-training-guide", citations30d: 84, prompts30d: 31, platforms: ["ChatGPT", "Perplexity", "AIO"] },
  { url: "runnersworld.com/gear/best-running-shoes", citations30d: 71, prompts30d: 28, platforms: ["ChatGPT", "AIO"] },
  { url: "help.nike.com/running-shoe-fit-guide", citations30d: 56, prompts30d: 19, platforms: ["Claude", "Perplexity"] },
  { url: "reddit.com/r/running/best_running_shoes_2026", citations30d: 49, prompts30d: 12, platforms: ["ChatGPT", "Gemini"] },
];

export default function MostCitedPages() {
  const { window } = useFilters();
  const { scale } = citationWindow(window.days);

  return (
    <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px 12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
          <div style={{fontSize:"14.5px",fontWeight:"600"}}>{"Most cited pages"}</div>
          <Hint text="Pages AI links to most often" />
        </div>
        <ViewAllButton />
      </div>
      <div style={{display:"grid",gridTemplateColumns:GRID,padding:"8px 20px",fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",letterSpacing:".12em",textTransform:"uppercase",color:"var(--fnt)",borderBottom:"1px solid var(--brd)"}}>
        <span>{"URL"}</span>
        <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Citations"}<Hint text="Times AI linked to this page" size={12} /></span>
        <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Prompts"}<Hint text="Questions this page turns up for" size={12} /></span>
        <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Cited on"}<Hint text="Which AI tools quoted it" size={12} align="right" /></span>
      </div>
      {ROWS.map((r, i) => (
        <div
          key={r.url}
          className="row-hover"
          style={{display:"grid",gridTemplateColumns:GRID,alignItems:"center",padding:"11px 20px",fontSize:"13px",...(i > 0 ? {borderTop:"1px solid var(--brd)"} : {})}}
        >
          <span style={{fontSize:"12.5px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--tx)"}}>{r.url}</span>
          <span style={{fontSize:"12.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{fmtInt(r.citations30d * scale)}</span>
          <span style={{fontSize:"12.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{fmtInt(accrued(r.prompts30d, window.days, 0.5))}</span>
          <span style={{display:"flex",gap:"5px"}}>
            {r.platforms.map((p) => (
              <span key={p} style={TAG}>{p}</span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}
