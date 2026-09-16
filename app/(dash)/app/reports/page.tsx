import type { Metadata } from "next";
import Link from "next/link";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import ReportCsvButton from "@/components/ui/ReportCsvButton";
import { reportCatalog } from "./catalog";

/* Reports.

   The fixture is gone: four "recent reports" with invented names, ranges,
   created dates and formats; two schedules with cadences and recipient counts;
   a builder pre-filled with a report name and two @nike.com recipients; and a
   concierge wizard whose goal text named a competitor and promised a two-day
   turnaround for a request that was never sent anywhere.

   Nothing in this product stores a report, runs a schedule or sends mail — so
   none of those rows could be made live, and they are not replaced with empty
   chrome either. What the product really has is the export pipeline: every
   wired screen builds a ReportSpec from live metrics and lib/export/report.ts
   renders it as an executive CSV. This screen now lists exactly those reports
   (./catalog.ts), with the window each one covers and the size of the file it
   writes read off the built spec, and each row downloads the real thing.

   Saved copies and scheduled delivery get an honest panel naming what they
   would need, so an empty section can never read as "you have no reports yet"
   when the truth is that reports are never kept. */

export const metadata: Metadata = {
  title: "Reports — Answr",
};

export const dynamic = "force-dynamic";

const GRID = "1.7fr 1.1fr .5fr .5fr .8fr";

const panel: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  overflow: "hidden",
};
const cardTitle: React.CSSProperties = {
  padding: "16px 20px 12px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "14.5px",
  fontWeight: 600,
};
const head: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: GRID,
  padding: "8px 20px",
  fontSize: "10px",
  fontWeight: 500,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--fnt)",
  borderBottom: "1px solid var(--brd)",
};
const cell: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 400,
  fontVariantNumeric: "tabular-nums",
  color: "var(--mut)",
};
const body: React.CSSProperties = {
  fontSize: "12.5px",
  color: "var(--mut)",
  lineHeight: 1.6,
  marginTop: "6px",
  maxWidth: "72ch",
};
const label: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color: "var(--fnt)",
};
const link: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 500,
  color: "var(--ac)",
  textDecoration: "none",
};
const downloadStyle: React.CSSProperties = {
  textAlign: "right",
  color: "var(--ac)",
  fontSize: "12px",
  fontWeight: 500,
  fontVariantNumeric: "tabular-nums",
  background: "none",
  border: "none",
  padding: 0,
  fontFamily: "inherit",
  cursor: "pointer",
};

function historyLabel(days: number): string {
  if (days <= 0) return "no history yet";
  return `${days} day${days === 1 ? "" : "s"} of history`;
}

function utc(ts: number | null): string {
  if (!ts) return "no run yet";
  return `${new Date(ts).toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

export default async function ReportsPage() {
  const { metrics: m, reports } = await reportCatalog();
  const brand = m.workspace?.brand ?? "Your brand";

  const facts: [string, string][] = m.configured
    ? [
        ["Workspace", m.workspace?.brand ?? ""],
        ["Tracked prompts", `${m.promptsTracked}`],
        ["Answers sampled", `${m.answersSampled}`],
        ["Sampled history", historyLabel(m.days)],
        ["Last run", utc(m.lastRunAt)],
      ]
    : [];

  return (
    <div className="frame-reports">
      <Topbar
        crumb="Reports"
        brand={brand}
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
      />
      <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "420px 1fr", gap: "16px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {m.configured ? (
            <div style={{ ...panel, padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14.5px", fontWeight: 600 }}>
                {"What a report contains"}
                <Hint text="What lands in the file when you download one" />
              </div>
              <div style={body}>
                Every report on the right downloads as one executive CSV: a header block naming this workspace and the
                window the rows really cover, an executive summary of the headline metrics with a plain-English read on
                each, the supporting tables, then footnotes naming the source of every figure.
              </div>
              <div style={{ ...label, marginTop: "18px" }}>{"Built from"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                {facts.map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "12.5px" }}>
                    <span style={{ color: "var(--fnt)" }}>{k}</span>
                    <span style={{ fontWeight: 500, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--fnt)", lineHeight: 1.6, marginTop: "16px" }}>
                {m.hasData
                  ? "Reports carry only the days the sampler actually ran, so there is no change-vs-previous column until there is a previous window to compare against."
                  : "No answers have been sampled yet. The reports still download, and each one says plainly that it has no figures rather than filling in estimates."}
              </div>
            </div>
          ) : (
            <div style={{ ...panel, padding: "20px" }}>
              <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Set up your brand to start collecting data"}</div>
              <div style={body}>
                Reports are rendered from the answers sampled for your tracked prompts. No workspace exists yet — no
                brand, domain or prompt set is configured — so the files below would carry no figures. Nothing is
                estimated to fill them.
              </div>
              <Link href="/onboarding/brand" style={{ ...link, marginTop: "12px", display: "inline-block" }}>
                Set up your brand →
              </Link>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={panel}>
            <div style={cardTitle}>
              {"Reports you can export"}
              <Hint text="Downloads built from your live data, right now" />
            </div>
            <div style={head}>
              <span>{"Report"}</span>
              <span>{"Covers"}</span>
              <span>{"Sections"}</span>
              <span>{"Rows"}</span>
              <span />
            </div>
            {reports.map((r, i) => (
              <div
                key={r.id}
                className="row-hover"
                style={{
                  display: "grid",
                  gridTemplateColumns: GRID,
                  alignItems: "center",
                  padding: "12px 20px",
                  fontSize: "13px",
                  ...(i === 0 ? {} : { borderTop: "1px solid var(--brd)" }),
                }}
              >
                <span>
                  <Link href={r.href} style={{ fontWeight: 500, color: "var(--tx)", textDecoration: "none" }}>
                    {r.name}
                  </Link>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--fnt)", lineHeight: 1.5, marginTop: "3px", paddingRight: "12px" }}>
                    {r.detail}
                  </span>
                </span>
                <span style={{ ...cell, paddingRight: "12px" }}>{r.spec.window}</span>
                <span style={cell}>{r.sectionCount}</span>
                <span style={cell}>{r.rowCount}</span>
                <ReportCsvButton filename={r.filename} report={r.spec} style={downloadStyle}>
                  {"Download ↓"}
                </ReportCsvButton>
              </div>
            ))}
          </div>

          <div style={{ ...panel, padding: "22px 24px" }}>
            <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Saved and scheduled reports aren't stored yet"}</div>
            <div style={body}>
              This needs somewhere to keep a generated file and a delivery job that can mail it on a cadence — neither
              exists in this deployment, so nothing has ever been saved or sent. No estimated figures are shown.
            </div>
            <div style={{ ...label, marginTop: "18px" }}>{"What this section would require"}</div>
            <div style={{ ...body, marginTop: "6px" }}>
              A report store that keeps each generated file with the window it covered, plus a scheduler and a mail
              sender with a recipient list per report.
            </div>
            <div style={{ ...body, marginTop: "6px" }}>
              Until those exist, a report is produced the moment you download it, from the data as it stands — nothing
              is kept, queued or delivered, and no past run, schedule or recipient is listed here.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
