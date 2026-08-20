import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import ReportBuilder from "./ReportBuilder";
import { DownloadButton, NewReportButton, ScheduleToggle } from "./ReportsControls";
import "./page.css";

/* Reports — converted from canvas frame #reports.
   The "Request a concierge report →" link (canvas anchor to #m-wizard) opens the
   ReportWizardModal client component. The staged reports.css only contained hover
   rules for the embedded sidebar (now owned by the shared layout); page.css keeps
   just the concierge-trigger hover to match global link hover.
   Wiring pass: recent-reports and scheduled rows get the global .row-hover class.
   No KPI stat cards (incl. no lift stats) or primary charts exist on this frame.
   Button-activation pass:
   - the "Build a report" card moved into <ReportBuilder> (real form state)
   - topbar "+ New report" moved from the Topbar export slot into `extra` so it can
     open the existing ReportWizardModal (Topbar's own export button has no click
     target); the slot renders in the same position, so the frame is unchanged
   - each recent report's "Download ↓" downloads a real CSV manifest built from that
     report's own fixture (metadata + the sections it ships)
   - scheduled rows' pills are real toggles (playbook 5). */

export const metadata: Metadata = {
  title: "Reports — Answr",
};

/* Fixture manifests behind the recent-report downloads: each row's own depicted
   metadata plus the sections that report ships (drawn from the builder's section
   vocabulary on this page). */
const RECENT = [
  {
    name: "Weekly AEO summary — exec team",
    range: "Jul 27 – Aug 2",
    created: "Aug 3",
    format: "PDF",
    filename: "nike-report-weekly-aeo-summary-jul27-aug2.csv",
    sections: ["Executive summary", "Visibility & share-of-voice trends", "Competitor benchmark", "New citations"],
  },
  {
    name: "Citations deep-dive — content team",
    range: "Jul 1 – Jul 31",
    created: "Aug 1",
    format: "CSV",
    filename: "nike-report-citations-deep-dive-jul.csv",
    sections: ["Executive summary", "New citations", "Prompt-level detail"],
  },
  {
    name: "Weekly AEO summary — exec team",
    range: "Jul 20 – Jul 26",
    created: "Jul 27",
    format: "PDF",
    filename: "nike-report-weekly-aeo-summary-jul20-jul26.csv",
    sections: ["Executive summary", "Visibility & share-of-voice trends", "Competitor benchmark", "New citations"],
  },
  {
    name: "Board pack — AI visibility appendix",
    range: "Q2 2026",
    created: "Jul 8",
    format: "PDF",
    filename: "nike-report-board-pack-q2-2026.csv",
    sections: ["Executive summary", "Visibility & share-of-voice trends", "Competitor benchmark", "Agent traffic"],
  },
];

function manifest(r: (typeof RECENT)[number]): string[][] {
  return [
    ["Report", "Range", "Created", "Format", "Section"],
    ...r.sections.map((s) => [r.name, r.range, r.created, r.format, s]),
  ];
}

export default function ReportsPage() {
  return (
    <div className="frame-reports">
      <Topbar
        crumb="Reports"
        exportLabel={null}
        extra={<NewReportButton />}
        rangeNote="The reports list isn't windowed — each report carries its own window and schedule. The date range re-slices Overview, Insights, Citations and Agent Analytics."
        platformNote="The reports list isn't split by platform — each report names its own platforms. The platform filter re-slices Overview."
      />
      <div style={{padding:"24px",display:"grid",gridTemplateColumns:"420px 1fr",gap:"16px",alignItems:"start"}}>
        <ReportBuilder />
        <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",overflow:"hidden"}}>
            <div style={{padding:"16px 20px 12px",display:"flex",alignItems:"center",gap:"6px",fontSize:"14.5px",fontWeight:"600"}}>{"Recent reports"}<Hint text="Summaries already made for your team" /></div>
            <div style={{display:"grid",gridTemplateColumns:"1.8fr 1fr .7fr .6fr .8fr",padding:"8px 20px",fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",letterSpacing:".12em",textTransform:"uppercase",color:"var(--fnt)",borderBottom:"1px solid var(--brd)"}}>
              <span>{"Report"}</span>
              <span>{"Range"}</span>
              <span>{"Created"}</span>
              <span>{"Format"}</span>
              <span />
            </div>
            {RECENT.map((r, i) => (
              <div
                key={r.filename}
                className="row-hover"
                style={
                  i === 0
                    ? {display:"grid",gridTemplateColumns:"1.8fr 1fr .7fr .6fr .8fr",alignItems:"center",padding:"12px 20px",fontSize:"13px"}
                    : {display:"grid",gridTemplateColumns:"1.8fr 1fr .7fr .6fr .8fr",alignItems:"center",padding:"12px 20px",fontSize:"13px",borderTop:"1px solid var(--brd)"}
                }
              >
                <span style={{fontWeight:"500"}}>{r.name}</span>
                <span style={{fontSize:"12px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{r.range}</span>
                <span style={{fontSize:"12px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{r.created}</span>
                <span style={{fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{r.format}</span>
                <DownloadButton name={`${r.name} (${r.range})`} filename={r.filename} format={r.format} rows={manifest(r)} />
              </div>
            ))}
          </div>
          <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",overflow:"hidden"}}>
            <div style={{padding:"16px 20px 12px",display:"flex",alignItems:"center",gap:"6px",fontSize:"14.5px",fontWeight:"600"}}>{"Scheduled"}<Hint text="Reports that send themselves on repeat" /></div>
            <div className="row-hover" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",borderTop:"1px solid var(--brd)",fontSize:"13px"}}>
              <div>
                <div style={{fontWeight:"500"}}>{"Weekly AEO summary — exec team"}</div>
                <div style={{fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)",marginTop:"3px"}}>{"Weekly · Mondays 9:00 · 2 recipients"}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <ScheduleToggle label="Weekly AEO summary — exec team" defaultOn />
              </div>
            </div>
            <div className="row-hover" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",borderTop:"1px solid var(--brd)",fontSize:"13px"}}>
              <div>
                <div style={{fontWeight:"500"}}>{"Monthly competitor benchmark"}</div>
                <div style={{fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)",marginTop:"3px"}}>{"Monthly · 1st · 5 recipients"}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <ScheduleToggle label="Monthly competitor benchmark" defaultOn={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
