import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import CitationKpis from "./CitationKpis";
import MostCitedPages from "./MostCitedPages";
import Hint from "@/components/ui/Hint";
import ExportModal from "./ExportModal";
import SourceMixDonut from "./SourceMixDonut";
import CitedDomainsCard from "./CitedDomainsCard";
import { CollectingNotice, SetupNotice } from "./StateNotice";
import { getLiveMetrics } from "@/lib/live/metrics";
import { historyLabel, screenState, sourceSegments } from "./live";
import { fmtInt } from "@/lib/filters/windows";

/* Citations — layout from canvas frame #citations, data from lib/live/metrics.

   Every figure on this screen is computed from real sampled answers: the KPI
   row (citationsCount / uniqueCitedDomains / ownedCitationShare /
   answersWithCitationRate), the source-mix donut and the cited-domains league
   table (citedDomains, split by the `owned` flag).

   Three states, all explicit: no workspace → set-up notice; configured with no
   runs → "collecting" with zeros; sampled → the real numbers.

   The date-range pill is inert here (rangeLive={false}): the live engine keeps
   a daily series for visibility and share of voice only, so citations cannot be
   re-sliced by window and no delta is shown anywhere on the screen — there is
   no previous-window citation total to compare against. */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Citations",
};

export default async function CitationsPage() {
  const m = await getLiveMetrics();
  const state = screenState(m);
  const { segments, total } = sourceSegments(m.citedDomains);
  const brand = m.workspace?.brand ?? "Your brand";

  const rangeNote = m.hasData
    ? `Citations cover every sampled run collected so far — ${historyLabel(m.days)}. The date range does not re-slice this screen: the live engine keeps no per-day citation history.`
    : "No sampled runs yet, so there is no window to slice.";

  const mixNote =
    total > 0
      ? `${fmtInt(total)} citation${total === 1 ? "" : "s"} across ${fmtInt(m.citedDomains.length)} domain${m.citedDomains.length === 1 ? "" : "s"}, from the latest run of each tracked prompt. Owned = ${m.workspace?.domain || "your domain"}; earned is every other source.`
      : m.hasData
        ? "No sampled answer has carried a parseable citation yet — some assistants only expose sources when they browse."
        : "Nothing sampled yet, so no source mix exists to show.";

  return (
    <div className="frame-citations" style={{flex:"1",display:"flex",flexDirection:"column"}}>
      <Topbar
        crumb="Citations"
        brand={brand}
        exportLabel={null}
        extra={<ExportModal m={m} />}
        rangeNote={rangeNote}
        platformNote="Citations are counted across every platform the sampler reached — the platform filter does not re-slice this screen."
      />
      <div style={{padding:"24px",display:"flex",flexDirection:"column",gap:"20px"}}>
        {state === "setup" ? (
          <SetupNotice />
        ) : (
          <>
            {state === "collecting" && <CollectingNotice prompts={m.promptsTracked} />}
            <CitationKpis m={m} />
            <div style={{display:"grid",gridTemplateColumns:"380px 1fr",gap:"16px"}}>
              <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"18px 20px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  <div style={{fontSize:"14.5px",fontWeight:"600"}}>{"Source mix"}</div>
                  <Hint text="Who AI quotes: you or someone else" />
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"24px",marginTop:"18px"}}>
                  <SourceMixDonut segments={segments} total={total} />
                  <div style={{display:"flex",flexDirection:"column",gap:"11px",fontSize:"12.5px",flex:"1"}}>
                    {segments.length === 0 ? (
                      <span style={{color:"var(--fnt)",fontSize:"12px"}}>{"No citations to split yet."}</span>
                    ) : (
                      segments.map((s) => (
                        <div key={s.key} style={{display:"flex",alignItems:"center",gap:"8px"}}>
                          <span style={{width:"8px",height:"8px",borderRadius:"2px",background:s.color}} />
                          {s.label}
                          <span style={{marginLeft:"auto",fontSize:"12px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{`${s.pct}%`}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div style={{marginTop:"18px",paddingTop:"14px",borderTop:"1px solid var(--brd)",fontSize:"12px",color:"var(--mut)",lineHeight:"1.5"}}>{mixNote}</div>
              </div>
              <CitedDomainsCard domains={m.citedDomains} collecting={state === "collecting"} />
            </div>
            <MostCitedPages state={state} />
          </>
        )}
      </div>
    </div>
  );
}
