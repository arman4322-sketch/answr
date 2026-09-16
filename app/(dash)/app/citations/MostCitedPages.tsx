import Hint from "@/components/ui/Hint";
import { CardEmpty } from "./StateNotice";
import type { ScreenState } from "./live";

/* "Most cited pages" — the fixture table is gone.

   The live metrics layer aggregates citations by DOMAIN (`citedDomains`); it
   exposes no per-URL breakdown, so there is no honest way to fill this table
   from real data. Rather than print URLs and counts that were never measured,
   the card keeps its place in the layout and says what is and isn't available,
   pointing at the domain league table that IS live. */

const GRID = "2.2fr .7fr .7fr 1.4fr";

export default function MostCitedPages({ state }: { state: ScreenState }) {
  const line =
    state === "setup"
      ? "No workspace yet — nothing has been sampled."
      : state === "collecting"
        ? "No citations collected yet."
        : "Page-level citations aren't broken out yet.";

  const note =
    state === "live"
      ? "Sampled citations are aggregated by domain — see Cited domains for the real counts and shares. Per-URL aggregation isn't part of the live metrics layer, so no page table is shown rather than an invented one."
      : "Individual pages appear here once sampled answers start quoting sources.";

  return (
    <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px 12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
          <div style={{fontSize:"14.5px",fontWeight:"600"}}>{"Most cited pages"}</div>
          <Hint text="Pages AI links to most often" />
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:GRID,padding:"8px 20px",fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",letterSpacing:".12em",textTransform:"uppercase",color:"var(--fnt)",borderBottom:"1px solid var(--brd)"}}>
        <span>{"URL"}</span>
        <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Citations"}<Hint text="Times AI linked to this page" size={12} /></span>
        <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Prompts"}<Hint text="Questions this page turns up for" size={12} /></span>
        <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Cited on"}<Hint text="Which AI tools quoted it" size={12} align="right" /></span>
      </div>
      <CardEmpty line={line} note={note} />
    </div>
  );
}
