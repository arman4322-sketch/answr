import type { Metadata } from "next";
import Link from "next/link";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import ReportCsvButton from "@/components/ui/ReportCsvButton";
import AgentsTabs from "./AgentsTabs";
import AgentKpis from "./AgentKpis";
import CrawlTrend from "./CrawlTrend";
import { CaptureBanner, EmptyNote, SetupState } from "./TelemetryStates";
import { agentsReport } from "./reports";
import { ago, fmtInt, getAgentsView } from "./telemetryView";

/* Agent Analytics — Crawlers.

   Live first-party telemetry: every request counted here was captured on this
   deployment (proxy.ts → /api/ingest). The old Nike crawl fixture is gone, and
   with it the date-range re-slicing it supported — telemetry has no modelled
   history to slice, so the range pill is inert and says what this screen really
   reports. Robots.txt posture is not observable from the capture path either,
   so the table reports the response statuses we did see instead of claiming an
   ALLOWED/BLOCKED verdict we cannot verify. */

export const metadata: Metadata = {
  title: "Agent Analytics",
};

export const dynamic = "force-dynamic";

const PILL: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--mut)",
  background: "rgba(255,255,255,0.045)",
  borderRadius: "7px",
  padding: "6px 12px",
};

const RANGE_NOTE =
  "Crawler telemetry counts every AI-bot request captured on this deployment since the store started collecting — it is not sliced by the date range.";

const TH: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.3fr 1fr .8fr .7fr .9fr",
  padding: "8px 20px",
  fontSize: "10px",
  fontWeight: "500",
  fontVariantNumeric: "tabular-nums",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--fnt)",
  borderBottom: "1px solid var(--brd)",
};

const TR: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.3fr 1fr .8fr .7fr .9fr",
  alignItems: "center",
  padding: "11px 20px",
  fontSize: "13px",
  color: "var(--tx)",
};

const NUM: React.CSSProperties = { fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" };

export default async function AgentsPage() {
  const view = await getAgentsView();
  const { metrics } = view;
  const domain = metrics.workspace?.domain;

  return (
    <>
      <Topbar
        crumb="Agent Analytics"
        rangeNote={RANGE_NOTE}
        showPlatforms={false}
        exportLabel={null}
        extra={
          <>
            {domain && <span style={PILL}>{domain}</span>}
            {metrics.configured && metrics.crawlerEvents > 0 && (
              <ReportCsvButton
                filename="agents-crawlers.csv"
                report={agentsReport(view)}
                style={{ ...PILL, border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                {`Export ${fmtInt(metrics.crawlerEvents)} events`}
              </ReportCsvButton>
            )}
            <Link
              href="/app/settings/integrations"
              className="btn-ac"
              style={{ fontSize: "12.5px", fontWeight: 500, borderRadius: "7px", padding: "6px 14px" }}
            >
              Tracking setup
            </Link>
          </>
        }
      />
      <AgentsTabs />
      <div className="frame-agents">
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {!metrics.configured ? (
            <SetupState note="Agent Analytics attributes AI-crawler traffic to your site. Set up your brand and domain first — capture is already running, and the requests it records will appear here as soon as the workspace exists." />
          ) : (
            <>
              <CaptureBanner view={view} events={metrics.crawlerEvents} subject="AI-crawler requests" />
              <AgentKpis view={view} />

              <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ fontSize: "14.5px", fontWeight: "600" }}>{"Crawl activity by agent"}</div>
                    <Hint text="Which AI bots visited, day by day" />
                  </div>
                  <div style={{ display: "flex", gap: "14px", fontSize: "11px", fontWeight: "400", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}>
                    {view.botSeries.map((s) => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "8px", height: "2px", background: s.color }} />
                        {s.label}
                      </div>
                    ))}
                  </div>
                </div>
                {view.dayKeys.length >= 2 ? (
                  <CrawlTrend series={view.botSeries} labels={view.dayLabels} />
                ) : (
                  <EmptyNote>
                    {view.dayKeys.length === 1
                      ? `One day of captured traffic so far (${view.dayLabels[0]}, ${fmtInt(metrics.crawlerEvents)} ${metrics.crawlerEvents === 1 ? "request" : "requests"}). A daily trend needs at least two days — it draws itself once tomorrow's requests land.`
                      : "No crawler requests captured yet, so there is no daily trend to draw. The capture path is live and this chart fills in on its own."}
                  </EmptyNote>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "16px" }}>
                <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "14.5px", fontWeight: "600" }}>
                    {"Agents"}
                    <Hint text="AI bots that read your website" />
                  </div>
                  <div style={TH}>
                    <span>{"Agent"}</span>
                    <span>{"Operator"}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      {"Requests"}
                      <Hint text="Times this bot visited your site" size={12} />
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      {"Pages"}
                      <Hint text="How many of your pages it read" size={12} />
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      {"Last seen"}
                      <Hint text="When this bot last visited" size={12} align="right" />
                    </span>
                  </div>
                  {view.agents.length === 0 ? (
                    <EmptyNote>
                      {"No AI crawler has reached this site yet. Every agent that does — GPTBot, ClaudeBot, PerplexityBot, Google-Extended and the rest of the catalog — lands in this table on its first request."}
                    </EmptyNote>
                  ) : (
                    view.agents.map((a, i) => {
                      const cells = (
                        <>
                          <span style={NUM}>{a.label}</span>
                          <span style={{ color: "var(--mut)" }}>{a.operator}</span>
                          <span style={NUM}>{fmtInt(a.requests)}</span>
                          <span style={{ ...NUM, color: "var(--mut)" }}>{fmtInt(a.pages)}</span>
                          <span style={{ ...NUM, color: "var(--mut)" }}>
                            {ago(a.lastSeen)}
                            {a.blocked > 0 && (
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: "500",
                                  color: "#e5636e",
                                  border: "1px solid rgba(229,99,110,.4)",
                                  borderRadius: "4px",
                                  padding: "2px 7px",
                                  marginLeft: "6px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {`${fmtInt(a.blocked)} BLOCKED`}
                              </span>
                            )}
                          </span>
                        </>
                      );
                      const style = { ...TR, ...(i > 0 ? { borderTop: "1px solid var(--brd)" } : {}) };
                      return a.botId === "gptbot" ? (
                        <Link key={a.botId} href="/app/agents/bots/gptbot" className="row-hover" style={style}>
                          {cells}
                        </Link>
                      ) : (
                        <div key={a.botId} className="row-hover" style={style}>
                          {cells}
                        </div>
                      );
                    })
                  )}
                </div>

                <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14.5px", fontWeight: "600" }}>
                      {"Most crawled paths"}
                      <Hint text="Pages AI bots read the most" />
                    </span>
                    <Link href="/app/page-health" style={{ fontSize: "11px", fontWeight: "400", fontVariantNumeric: "tabular-nums", color: "var(--ac)" }}>
                      {"View all →"}
                    </Link>
                  </div>
                  {view.crawledPaths.length === 0 ? (
                    <EmptyNote>{"No page of this site has been fetched by an AI crawler yet."}</EmptyNote>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {view.crawledPaths.slice(0, 5).map((p) => (
                        <div
                          key={p.key}
                          className="row-hover"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                            padding: "11px 20px",
                            fontSize: "12.5px",
                            borderTop: "1px solid var(--brd)",
                          }}
                        >
                          <span style={{ fontSize: "12px", fontWeight: "400", fontVariantNumeric: "tabular-nums", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.key}
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "var(--mut)", flex: "none" }}>{fmtInt(p.count)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    style={{
                      margin: "14px 20px 18px",
                      padding: "12px 14px",
                      border: "1px solid var(--brd)",
                      borderRadius: "8px",
                      background: "var(--bg0)",
                      fontSize: "12px",
                      color: "var(--mut)",
                      lineHeight: "1.5",
                    }}
                  >
                    {view.blockedRequests > 0 ? (
                      <>
                        <span style={{ color: "#e5636e", fontWeight: "500" }}>{"Blocked:"}</span>
                        {` this site answered ${fmtInt(view.blockedRequests)} of ${fmtInt(metrics.crawlerEvents)} captured AI-crawler requests with 4xx/5xx. `}
                        <Link href="/app/agents/logs">{"Live logs →"}</Link>
                      </>
                    ) : (
                      <>
                        {metrics.crawlerEvents > 0
                          ? `No captured AI-crawler request has been turned away — all ${fmtInt(metrics.crawlerEvents)} were answered 2xx/3xx. `
                          : "Blocked requests are read from the status this site returns to each bot. Nothing to report until a bot arrives. "}
                        <Link href="/app/agents/logs">{"Live logs →"}</Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
