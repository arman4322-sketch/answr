"use client";

import Hint from "@/components/ui/Hint";
import { useFilters } from "@/lib/filters/context";
import { extendLevel, fmtDelta, levelStat, sliceWindow } from "@/lib/filters/windows";
import { platformVisibilityRows } from "@/lib/data/overview";

/* "Visibility by platform" — the one card on Overview with a genuine
   per-platform fixture, so both topbar filters are real here:

   - date range: each row's % is its series' endpoint and each row's delta is
     endpoint − start-of-window (30 days reproduces the frame: ChatGPT 41.8
     ↑3.2 · Perplexity 36.4 ↑1.9 · AI Overviews 31.0 ↑4.6 · Claude 27.7 ↓0.8 ·
     Gemini 22.1 ↑0.4). The bar width is round(value)%, which is exactly the
     width the frame painted.
   - platform: selecting one platform narrows the card to that row rather than
     inventing a split that does not exist elsewhere on the page.

   Markup and inline styles are the frame's, verbatim. */

export default function PlatformVisibilityCard() {
  const { platform, platformInfo, window } = useFilters();

  const rows = platformVisibilityRows
    .filter((r) => platform === "all" || r.id === platform)
    .map((r) => {
      const points = sliceWindow(extendLevel(r.points, `overview:platform:${r.id}`), window.days);
      const stat = levelStat(points);
      return { ...r, stat };
    });

  return (
    <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"17px 19px",position:"relative"}}>
      <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
        <div style={{fontSize:"13px",fontWeight:"600"}}>{"Visibility by platform"}</div>
        <Hint text="How often each AI mentions you" />
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"14px",marginTop:"16px"}}>
        {rows.map((r) => (
          <div className="row-hover" key={r.id}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"12.5px",marginBottom:"6px"}}>
              <span>{r.label}</span>
              <span style={{fontVariantNumeric:"tabular-nums",fontWeight:"600",fontSize:"12.5px"}}>
                {`${r.stat.value.toFixed(1)}% `}
                <span style={{color:r.stat.delta >= 0 ? "#4cb782" : "#e5636e",fontWeight:"500",fontSize:"11.5px"}}>
                  {fmtDelta(r.stat.delta).replace(" ", "")}
                </span>
              </span>
            </div>
            <div style={{height:"4px",background:"var(--bg2)",borderRadius:"2px"}}>
              <div style={{width:`${Math.round(r.stat.value)}%`,height:"4px",background:"var(--ac)",borderRadius:"2px",opacity:r.opacity === 1 ? undefined : String(r.opacity)}} />
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop:"16px",paddingTop:"13px",borderTop:"1px solid var(--brd)",fontSize:"12px",color:"var(--mut)",lineHeight:"1.55"}}>
        {platform === "all" ? (
          <>
            {"AI Overviews grew fastest this period — driven by 3 new citations from "}
            <span style={{color:"var(--tx)"}}>{"runnersworld.com"}</span>
            {" comparison pages."}
          </>
        ) : (
          `Filtered to ${platformInfo.label} — clear the platform filter to compare all five engines.`
        )}
      </div>
    </div>
  );
}
