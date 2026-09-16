import type { Metadata } from "next";
import Link from "next/link";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { PIPELINE } from "@/lib/telemetry/pipeline";
import AgentsTabs from "../AgentsTabs";
import { CaptureBanner, EmptyNote, SetupState } from "../TelemetryStates";
import { logsReport } from "../reports";
import { clockTime, dateTime, fmtInt, getAgentsView } from "../telemetryView";

/* Agent Analytics — Live logs.

   The captured request stream itself: every row is a real AI-bot request this
   deployment answered, newest first, read from the telemetry store on each
   load. The fixed Nike snapshot (and its "48 req/min" rate, its /help path
   filter and its bot-type filter, none of which the store can honour) is gone.
   With nothing captured the table is empty and says so — it never replays a
   scripted log. */

export const metadata: Metadata = {
  title: "Live logs — Agent Analytics",
};

export const dynamic = "force-dynamic";

const GRID = ".9fr .8fr 1.3fr 1.6fr .6fr";

const RANGE_NOTE =
  "The stream shows the most recent captured requests as they arrive, not a date window — this screen is not sliced by the date range.";

export default async function LiveLogsPage() {
  const view = await getAgentsView();
  const { metrics } = view;
  const rows = view.crawlerEvents.slice(0, 30);

  return (
    <>
      <Topbar
        crumb={["Agent Analytics", "Live logs"]}
        rangeNote={RANGE_NOTE}
        platformNote="Requests are attributed by crawler user agent, not by answer platform — this stream isn't split by the platform filter."
        exportLabel={metrics.configured && metrics.crawlerEvents > 0 ? "Export" : null}
        exportFilename="agents-logs.csv"
        exportReport={logsReport(view)}
      />
      <AgentsTabs />
      <div className="frame-m-logs">
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {!metrics.configured ? (
            <SetupState note="The log stream captures AI-bot requests to this deployment. Set your brand up to attribute them to a workspace — capture itself is already running." />
          ) : (
            <>
              <CaptureBanner view={view} events={metrics.crawlerEvents} subject="AI-crawler requests" />
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#4cb782",
                    border: "1px solid rgba(76,183,130,.4)",
                    borderRadius: "7px",
                    padding: "6px 12px",
                  }}
                >
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4cb782" }} />
                  {"LIVE"}
                </span>
                <Hint text="Read from the capture store each time this page loads" />
                <span style={{ fontSize: "12px", color: "var(--fnt)", background: "rgba(255,255,255,0.045)", borderRadius: "7px", padding: "6px 12px", fontVariantNumeric: "tabular-nums" }}>
                  {`all paths · all agents`}
                </span>
                <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>
                  {`${fmtInt(metrics.crawlerEvents)} captured · last ${PIPELINE.retention} retained`}
                  <Hint text="Bot visits captured on this deployment" align="right" />
                </span>
              </div>
              <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden", fontVariantNumeric: "tabular-nums" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: GRID,
                    padding: "8px 16px",
                    fontSize: "10.5px",
                    fontWeight: "500",
                    color: "var(--fnt)",
                    borderBottom: "1px solid var(--brd)",
                  }}
                >
                  <span>{"Time"}</span>
                  <span>{"Platform"}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    {"User agent"}
                    <Hint text="The name a bot calls itself" size={12} />
                  </span>
                  <span>{"Path"}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    {"Status"}
                    <Hint text="200 means let in, 403 means blocked" size={12} align="right" />
                  </span>
                </div>
                {rows.length === 0 ? (
                  <EmptyNote>
                    {`No AI-bot request has been captured on this deployment yet. proxy.ts matches every incoming request against ${PIPELINE.uaPatterns} published user-agent patterns and posts matches to /api/ingest — the first one that arrives appears here. You can prove the path end to end from `}
                    <Link href="/app/live" style={{ color: "var(--ac)" }}>
                      {"Live telemetry"}
                    </Link>
                    {"."}
                  </EmptyNote>
                ) : (
                  rows.map((e, i) => (
                    <div
                      key={`${e.ts}-${e.botId}-${i}`}
                      className="row-hover"
                      style={{
                        display: "grid",
                        gridTemplateColumns: GRID,
                        padding: "8px 16px",
                        fontSize: "12px",
                        alignItems: "center",
                        ...(i > 0 ? { borderTop: "1px solid var(--brd)" } : {}),
                      }}
                    >
                      <span style={{ color: "var(--mut)" }} title={dateTime(e.ts)}>
                        {clockTime(e.ts)}
                      </span>
                      <span>{e.operator}</span>
                      <span style={{ color: "var(--mut)" }}>{e.botLabel}</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.path}</span>
                      <span style={{ color: e.status >= 400 ? "#e5636e" : "#4cb782", fontWeight: "600" }}>{e.status}</span>
                    </div>
                  ))
                )}
              </div>
              {rows.length > 0 && (
                <div style={{ fontSize: "12px", color: "var(--mut)", background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "8px", padding: "11px 14px", lineHeight: "1.55" }}>
                  {`Showing the ${fmtInt(rows.length)} most recent of ${fmtInt(metrics.crawlerEvents)} captured requests — newest ${dateTime(rows[0].ts)}. `}
                  {view.blockedRequests > 0
                    ? `${fmtInt(view.blockedRequests)} captured requests were answered 4xx/5xx.`
                    : "None of the captured requests was turned away."}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
