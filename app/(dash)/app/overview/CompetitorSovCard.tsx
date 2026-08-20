"use client";

import Hint from "@/components/ui/Hint";
import Sparkline from "@/components/ui/Sparkline";
import { useFilters } from "@/lib/filters/context";
import { extendLevel, fmtDelta, levelStat, sliceWindow } from "@/lib/filters/windows";
import { competitorSovRows } from "@/lib/data/overview";

/* "Competitor share of voice" — the table restates the Share-of-voice KPI, so
   it has to move with the same window or the screen would contradict itself.
   Each brand's % is its series' endpoint, each Δ is endpoint − start-of-window,
   the column header names the active window, and the row sparkline draws the
   same points. At 30 days it renders the shipped table exactly (Nike 28.6%
   ↑1.1 · Adidas 24.1% ↓0.6 · Puma 18.9% ↑0.3 · Under Armour 15.2% ↓1.4 ·
   New Balance 13.2% ↑0.9). Markup and inline styles are the frame's. */

const GRID = "40px 1.4fr 1fr .8fr 1fr 92px";
const SEL_BG = "rgba(142,124,242,0.06)";

export default function CompetitorSovCard() {
  const { window } = useFilters();

  const rows = competitorSovRows.map((r) => {
    const points = sliceWindow(extendLevel(r.points, `overview:sov:${r.brand}`), window.days);
    return { ...r, points, stat: levelStat(points) };
  });

  return (
    <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"15px 19px 11px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
          <div style={{fontSize:"13px",fontWeight:"600"}}>{"Competitor share of voice"}</div>
          <Hint text="Your slice of brand mentions versus rivals" />
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11.5px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>
          {"412 prompts tracked"}
          <Hint text="Questions we ask AI for you daily" align="right" />
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:GRID,padding:"7px 19px",fontSize:"11px",fontWeight:"500",color:"var(--fnt)",borderBottom:"1px solid var(--brd)"}}>
        <span>{"#"}</span>
        <span>{"Brand"}</span>
        <span>{"Share of voice"}</span>
        <span>{`Δ ${window.short}`}</span>
        <span>{"Top platform"}</span>
        <span>{"Trend"}</span>
      </div>
      {rows.map((r, i) => (
        <div
          key={r.brand}
          className={r.you ? undefined : `hv1${i + 1}`}
          style={{
            display:"grid",
            gridTemplateColumns:GRID,
            alignItems:"center",
            padding:"10px 19px",
            fontSize:"13px",
            ...(r.you ? { background: SEL_BG } : { borderTop: "1px solid var(--brd)" }),
          }}
        >
          <span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{String(i + 1)}</span>
          {r.you ? (
            <span style={{display:"flex",alignItems:"center",gap:"8px",fontWeight:"600"}}>
              {"Nike"}
              <span style={{fontSize:"10px",fontWeight:"600",color:"#b3a7f8",background:"rgba(142,124,242,0.16)",borderRadius:"4px",padding:"2px 6px"}}>{"You"}</span>
            </span>
          ) : (
            <span style={{color:"var(--tx)"}}>{r.brand}</span>
          )}
          <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{`${r.stat.value.toFixed(1)}%`}</span>
          <span style={{fontSize:"12px",fontWeight:"500",color:r.stat.delta >= 0 ? "#4cb782" : "#e5636e"}}>{fmtDelta(r.stat.delta)}</span>
          <span style={{color:"var(--mut)"}}>{r.topPlatform}</span>
          <Sparkline points={r.points} good color={r.color} width={72} height={22} />
        </div>
      ))}
    </div>
  );
}
