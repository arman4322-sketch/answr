import type { Metadata } from "next";
import Link from "next/link";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { WatchUrlButton, GapViewToggle } from "./Controls";
import { watchedUrlsReport } from "../reports";
import { CardEmpty, CollectingNotice, SetupNotice } from "../StateNotice";
import { exportStem, historyLabel, screenState } from "../live";
import { getLiveMetrics } from "@/lib/live/metrics";
import { fmtInt } from "@/lib/filters/windows";

/* Watched URLs & source gap — layout from canvas frame #m-watched, fixture rows
   removed.

   Neither table can be filled from the live engine, and both say so:
   - Watched URLs: lib/live/metrics aggregates citations by DOMAIN and keeps no
     per-URL history, so there is no page-level citation count or change to
     print — and no watched-URL records exist to list.
   - Source gap: naming domains that cite the category but never this brand
     needs per-citation brand attribution, which the engine does not compute.
   What IS live — the domains actually cited and the owned/earned split — is on
   the Citations screen, and the export carries that real table. */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Watched URLs",
};

const card: React.CSSProperties = { background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" };
const head: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 10px" };
const colHead: React.CSSProperties = { padding: "7px 16px", fontSize: "10.5px", fontWeight: 500, color: "var(--fnt)", borderBottom: "1px solid var(--brd)" };

export default async function WatchedUrlsPage() {
  const m = await getLiveMetrics();
  const state = screenState(m);
  const brand = m.workspace?.brand ?? "Your brand";
  const earned = m.citedDomains.filter((d) => !d.owned);

  return (
    <div className="frame-m-watched" style={{flex:"1",display:"flex",flexDirection:"column"}}>
      <Topbar
        crumb={["Citations", "Watched URLs"]}
        brand={brand}
        rangeNote={
          m.hasData
            ? `This screen reports the sampled citation history — ${historyLabel(m.days)}. The date range does not re-slice it.`
            : "No sampled runs yet, so there is no window to slice."
        }
        platformNote="Citations are counted across every platform the sampler reached — the platform filter does not re-slice this screen."
        exportFilename={`${exportStem(m, "watched-urls")}.csv`}
        exportReport={watchedUrlsReport(m)}
      />
      <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:"14px"}}>
        {state === "setup" ? (
          <SetupNotice />
        ) : (
          <>
            {state === "collecting" && <CollectingNotice prompts={m.promptsTracked} />}
            <div style={card}>
              <div style={head}>
                <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  <span style={{fontSize:"13.5px",fontWeight:"600"}}>{"Watched URLs"}</span>
                  <Hint text="Pages we watch and warn you about" />
                  <span style={{fontSize:"11.5px",color:"var(--fnt)",marginLeft:"2px"}}>{"alerts when citation performance shifts"}</span>
                </div>
                <WatchUrlButton />
              </div>
              <div style={{...colHead,display:"grid",gridTemplateColumns:"2.2fr .8fr .6fr 1fr"}}>
                <span>{"URL"}</span>
                <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Citations"}<Hint text="Times AI linked to this page" size={12} /></span>
                <span>{"Δ"}</span>
                <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Cited on"}<Hint text="Which AI tools quoted it" size={12} align="right" /></span>
              </div>
              <CardEmpty
                line="No watched URLs."
                note="Sampled citations are aggregated by domain, so there is no per-page count or change to report — and no URL is being watched yet."
              />
            </div>
            <div style={card}>
              <div style={head}>
                <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  <span style={{fontSize:"13.5px",fontWeight:"600"}}>{"Source gap"}</span>
                  <Hint text="Sites that quote rivals, never you" />
                  <span style={{fontSize:"11.5px",color:"var(--fnt)",marginLeft:"2px"}}>{`domains that cite the category but never ${brand}`}</span>
                </div>
                <GapViewToggle />
              </div>
              <div style={{...colHead,display:"grid",gridTemplateColumns:"1.6fr .9fr 1fr 1fr"}}>
                <span>{"Domain"}</span>
                <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Category citations"}<Hint text="Times AI quoted it about your category" size={12} /></span>
                <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Cites most"}<Hint text="The brand this site names most" size={12} /></span>
                <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Suggested play"}<Hint text="What to try to get quoted" size={12} align="right" /></span>
              </div>
              <CardEmpty
                line="Source-gap analysis isn't available from the sampled data."
                note={`Ranking domains by who they cite needs per-citation brand attribution, which isn't computed — so nothing is estimated here.${
                  m.hasData ? ` What is measured: ${fmtInt(earned.length)} earned domain${earned.length === 1 ? "" : "s"} cited in the current sample.` : ""
                }`}
              />
              {m.hasData && earned.length > 0 && (
                <div style={{padding:"9px 16px",borderTop:"1px solid var(--brd)",fontSize:"11.5px"}}>
                  <Link href="/app/citations" style={{color:"var(--ac)",textDecoration:"none",fontWeight:500}}>{"See the cited domains →"}</Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
