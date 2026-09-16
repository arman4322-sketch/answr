import Hint from "@/components/ui/Hint";
import type { LiveMetrics } from "@/lib/live/metrics";
import CardNote from "./CardNote";
import { int, pct, s } from "./format";

/* "Visibility by platform" — one row per platform that actually answered.

   Rows come from LiveMetrics.platforms: `appearances ÷ answers` for each
   provider that returned a usable answer in the latest run of each prompt. A
   platform that has never answered simply isn't listed — the card no longer
   prints a fixed five-engine roster.

   No deltas: per-platform history is not part of the live metrics, so each row
   shows the measurement it has (the appearances / answers it came from) instead
   of a change it cannot compute. Bar width is round(visibility)%, exactly as
   the frame painted it. */

export default function PlatformVisibilityCard({ m }: { m: LiveMetrics }) {
  const rows = m.platforms;
  const answers = rows.reduce((t, r) => t + r.answers, 0);
  const brand = m.workspace?.brand ?? "your brand";

  return (
    <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"17px 19px",position:"relative"}}>
      <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
        <div style={{fontSize:"13px",fontWeight:"600"}}>{"Visibility by platform"}</div>
        <Hint text="How often each AI mentions you" />
      </div>

      {rows.length === 0 ? (
        <div style={{ marginTop: "16px" }}>
          <CardNote
            title={m.configured ? "No sample has run yet" : "Not set up yet"}
            body={
              m.configured
                ? "No platform has returned an answer yet. Each engine appears here as soon as it answers one of your tracked prompts."
                : "Set up your brand to start collecting data — platforms appear here once they answer your prompts."
            }
          />
        </div>
      ) : (
        <>
          <div style={{display:"flex",flexDirection:"column",gap:"14px",marginTop:"16px"}}>
            {rows.map((r) => (
              <div className="row-hover" key={r.provider}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"12.5px",marginBottom:"6px"}}>
                  <span>{r.label}</span>
                  <span style={{fontVariantNumeric:"tabular-nums",fontWeight:"600",fontSize:"12.5px"}}>
                    {`${pct(r.visibility)} `}
                    <span style={{color:"var(--fnt)",fontWeight:"500",fontSize:"11.5px"}}>
                      {`${int(r.appearances)}/${int(r.answers)}`}
                    </span>
                  </span>
                </div>
                <div style={{height:"4px",background:"var(--bg2)",borderRadius:"2px"}}>
                  <div style={{width:`${Math.round(r.visibility)}%`,height:"4px",background:"var(--ac)",borderRadius:"2px"}} />
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:"16px",paddingTop:"13px",borderTop:"1px solid var(--brd)",fontSize:"12px",color:"var(--mut)",lineHeight:"1.55"}}>
            {`${int(answers)} answer${s(answers)} from ${int(rows.length)} platform${s(rows.length)} in the latest run of each prompt. The figure beside each bar is the answers naming ${brand} out of the answers that platform returned; per-platform trends need more sampled days.`}
          </div>
        </>
      )}
    </div>
  );
}
