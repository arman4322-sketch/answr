import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import ScoreInfo from "./ScoreInfo";
import ScoreControls from "./ScoreControls";
import RaiseScoreRow from "./RaiseScoreRow";

/* MISC — Content score — converted from canvas frame #m-score.
   Embedded sidebar + topbar stripped (shared shell from the (dash) layout);
   topbar replaced with <Topbar crumb={["Optimize","Content score"]}>.
   Fixes applied:
   - "Score it" primary button uses .btn-ac (dark label on accent).
   - URL field is a real labeled <input> (frame's shown value as defaultValue).
   - Mode tabs (URL / Paste text / Upload file) are real <button>s.
   Wiring pass: the 0–100 hero is a gauge, not a stat card, so it keeps its gauge
   markup; <ScoreInfo> applies the KpiCard ⓘ provenance popover pattern manually
   with the `content_score` dictionary entry (local exception, noted in report).
   Button-activation pass: tabs / URL field / "Score it" moved into <ScoreControls>
   (playbook 4 + 9), the three "To raise the score" rows became real accordions,
   and the topbar Export now downloads this page's score fixture as CSV. */

export const metadata: Metadata = {
  title: "Content score — Answr",
};

const RECOMMENDATIONS = [
  {
    text: "Add an FAQ section with schema — 6 of your tracked prompts map to it",
    lift: "+9 est.",
    detail:
      "Answerability is already your strongest subscore at 74, so the gap here is coverage, not phrasing: six tracked prompts have no direct answer on the page. An FAQPage block gives each one a short, quotable answer and lifts Structure (61) at the same time.",
  },
  {
    text: 'Cite primary data — replace "studies show" with named sources',
    lift: "+6 est.",
    detail:
      "Evidence density is the weakest subscore at 58. Answer engines quote named, dated sources far more often than unattributed claims, and a cited figure is what gets lifted verbatim into an answer.",
  },
  {
    text: "Add a comparison table — the answer format engines quote most",
    lift: "+5 est.",
    detail:
      "Structure sits at 61. Comparison tables are the format most often lifted whole when a prompt asks for a head-to-head, and they parse cleanly on every platform you track.",
  },
];

const EXPORT_ROWS: string[][] = [
  ["Section", "Item", "Value"],
  ["Page", "URL", "nike.com/running/draft-marathon-guide"],
  ["Score", "Likely to be cited", "68"],
  ["Score", "Median for pages on this topic", "54"],
  ["Subscore", "Answerability — direct answers to real prompts", "74"],
  ["Subscore", "Structure — headings, tables, schema", "61"],
  ["Subscore", "Evidence density — data, sources, specifics", "58"],
  ["Subscore", "Freshness — dates, current numbers", "81"],
  ...RECOMMENDATIONS.map((r) => ["To raise the score", r.text, r.lift]),
];

export default function ContentScorePage() {
  return (
    <div className="frame-m-score">
      <Topbar
        crumb={["Optimize", "Content score"]}
        rangeNote="Content score grades one draft as it stands right now — it isn't a reported time window. The date range re-slices Overview, Insights, Citations and Agent Analytics."
        platformNote="The score is a single grade for the draft across every engine — it isn't split by platform."
        exportFilename="nike-content-score.csv"
        exportRows={EXPORT_ROWS}
        exportWindow="Single draft scored on Aug 5, 2026 — a point-in-time grade, not a date window"
      />
      <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:"14px"}}>
        <ScoreControls />
        <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:"12px"}}><div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"18px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><svg width="132" height="132" viewBox="0 0 132 132"><circle cx="66" cy="66" r="54" fill="none" stroke="var(--bg2)" strokeWidth="12" /><circle cx="66" cy="66" r="54" fill="none" stroke="var(--ac)" strokeWidth="12" strokeDasharray="231 339" strokeLinecap="round" transform="rotate(-90 66 66)" /><text x="66" y="63" textAnchor="middle" fill="var(--tx)" style={{fontSize:"28px",fontWeight:"600"}}>{"68"}</text><text x="66" y="82" textAnchor="middle" fill="var(--fnt)" style={{fontSize:"10px"}}>{"OF 100"}</text></svg><div style={{fontSize:"12.5px",fontWeight:"600",marginTop:"10px",display:"flex",alignItems:"center",gap:"6px"}}>{"Likely to be cited"}<Hint text="How likely AI is to quote this draft" /><ScoreInfo /></div><div style={{fontSize:"11.5px",color:"var(--fnt)",marginTop:"3px",textAlign:"center"}}>{"vs. 54 median for pages on this topic"}</div></div><div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"16px"}}><div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"12.5px",fontWeight:"600"}}>{"Subscores"}<Hint text="The parts that make up this grade" /></div><div style={{display:"flex",flexDirection:"column",gap:"11px",marginTop:"12px"}}><div><div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"4px"}}><span>{"Answerability — direct answers to real prompts"}</span><span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"74"}</span></div><div style={{height:"4px",background:"var(--bg2)",borderRadius:"2px"}}><div style={{width:"74%",height:"4px",background:"var(--ac)",borderRadius:"2px"}} /></div></div><div><div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"4px"}}><span>{"Structure — headings, tables, schema"}</span><span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"61"}</span></div><div style={{height:"4px",background:"var(--bg2)",borderRadius:"2px"}}><div style={{width:"61%",height:"4px",background:"var(--ac)",opacity:".8",borderRadius:"2px"}} /></div></div><div><div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"4px"}}><span>{"Evidence density — data, sources, specifics"}</span><span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"58"}</span></div><div style={{height:"4px",background:"var(--bg2)",borderRadius:"2px"}}><div style={{width:"58%",height:"4px",background:"var(--ac)",opacity:".6",borderRadius:"2px"}} /></div></div><div><div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"4px"}}><span>{"Freshness — dates, current numbers"}</span><span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{"81"}</span></div><div style={{height:"4px",background:"var(--bg2)",borderRadius:"2px"}}><div style={{width:"81%",height:"4px",background:"var(--ac)",borderRadius:"2px"}} /></div></div></div></div></div>
        <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"16px"}}><div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"12.5px",fontWeight:"600"}}>{"To raise the score"}<Hint text="Changes that would lift this grade" /></div><div style={{display:"flex",flexDirection:"column",gap:"7px",marginTop:"10px",fontSize:"12.5px"}}>{RECOMMENDATIONS.map((r) => (<RaiseScoreRow key={r.text} text={r.text} lift={r.lift} detail={r.detail} />))}</div></div>
      </div>
    </div>
  );
}
