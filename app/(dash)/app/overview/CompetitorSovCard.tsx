import Hint from "@/components/ui/Hint";
import type { LiveMetrics } from "@/lib/live/metrics";
import CardNote from "./CardNote";
import { int, pct, s } from "./format";

/* "Competitor share of voice" — the brand table, from LiveMetrics.brands.

   Each row is a tracked brand (yours plus the competitors in the workspace),
   its share of all brand mentions, and the number of prompts whose latest
   answer names it. Ranking is by mentions, as the metrics layer sorts it.

   Two fixture columns are gone rather than faked: "Δ 30d" (there is no
   per-brand daily history to difference — the sampled series carries the
   workspace's own visibility and share of voice, not each competitor's) and
   "Top platform" (mentions are not broken down per provider per brand). The
   sparkline column went with them. What replaces them is a real count, so the
   table still reads left-to-right as rank → brand → share → evidence. */

const GRID = "40px 1.7fr 1fr 1.1fr";
const SEL_BG = "rgba(142,124,242,0.06)";

export default function CompetitorSovCard({ m }: { m: LiveMetrics }) {
  const rows = m.brands;

  return (
    <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"15px 19px 11px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
          <div style={{fontSize:"13px",fontWeight:"600"}}>{"Competitor share of voice"}</div>
          <Hint text="Your slice of brand mentions versus rivals" />
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11.5px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>
          {`${int(m.promptsTracked)} prompt${s(m.promptsTracked)} tracked`}
          <Hint text="Questions we ask AI for you daily" align="right" />
        </div>
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: "0 19px 19px" }}>
          <CardNote
            title={m.configured ? "Collecting — first sample runs tonight" : "Not set up yet"}
            body={
              m.configured
                ? "Share of voice is measured from sampled answers. Your brand and its competitors appear here after the first run."
                : "Set up your brand and competitors to start measuring share of voice."
            }
          />
        </div>
      ) : (
        <>
          <div style={{display:"grid",gridTemplateColumns:GRID,padding:"7px 19px",fontSize:"11px",fontWeight:"500",color:"var(--fnt)",borderBottom:"1px solid var(--brd)"}}>
            <span>{"#"}</span>
            <span>{"Brand"}</span>
            <span>{"Share of voice"}</span>
            <span>{"Prompts naming it"}</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.name}
              className={r.isBrand ? undefined : `hv1${i + 1}`}
              style={{
                display:"grid",
                gridTemplateColumns:GRID,
                alignItems:"center",
                padding:"10px 19px",
                fontSize:"13px",
                ...(r.isBrand ? { background: SEL_BG } : { borderTop: "1px solid var(--brd)" }),
              }}
            >
              <span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums"}}>{String(i + 1)}</span>
              {r.isBrand ? (
                <span style={{display:"flex",alignItems:"center",gap:"8px",fontWeight:"600"}}>
                  {r.name}
                  <span style={{fontSize:"10px",fontWeight:"600",color:"#b3a7f8",background:"rgba(142,124,242,0.16)",borderRadius:"4px",padding:"2px 6px"}}>{"You"}</span>
                </span>
              ) : (
                <span style={{color:"var(--tx)"}}>{r.name}</span>
              )}
              <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{pct(r.share)}</span>
              <span style={{color:"var(--mut)",fontVariantNumeric:"tabular-nums"}}>{int(r.mentions)}</span>
            </div>
          ))}
          <div style={{padding:"11px 19px 15px",borderTop:"1px solid var(--brd)",fontSize:"11px",color:"var(--fnt)",lineHeight:"1.55"}}>
            {`Counted once per prompt, from the latest answer for each — so these shares can differ from the answer-weighted Share of voice KPI above, which counts every sampled answer. Per-brand change over time needs more sampled days than this workspace has (${m.days} so far).`}
          </div>
        </>
      )}
    </div>
  );
}
