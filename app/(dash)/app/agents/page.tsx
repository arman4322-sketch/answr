import type { Metadata } from "next";
import Link from "next/link";
import Topbar from "@/components/app/Topbar";
import FilterPill from "@/components/ui/FilterPill";
import Hint from "@/components/ui/Hint";
import { ToastButton } from "../settings/DemoControls";
import AgentsTabs from "./AgentsTabs";
import AgentKpis from "./AgentKpis";
import CrawlTrend from "./CrawlTrend";
import CrawlScaled from "./CrawlScaled";
import ReportCsvButton from "@/components/ui/ReportCsvButton";
import { agentsSpec } from "./reports";

/* Agent Analytics — Crawlers (frame #agents).
   "Export 48,231 events" downloads the executive report (./reports.ts): the
   four KPIs with plain-English reads, the daily crawl-activity series per
   agent as a dated table, the agents table with robots status, and the most
   crawled paths — plus the blocked-/help alert as a footnote.
   Live filters (F9): this screen's own date-range pill is bound to the
   workspace filter and re-slices the KPI row (<AgentKpis>), the crawl-activity
   chart (<CrawlTrend>) and every request/page count in the tables
   (<CrawlScaled>). The KPI sums exactly the days the chart plots. */

export const metadata: Metadata = {
  title: "Agent Analytics",
};

const PILL: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--mut)",
  background: "rgba(255,255,255,0.045)",
  borderRadius: "7px",
  padding: "6px 12px",
};

const PROPERTY_NOTE = "The demo ships one property\u2019s logs — the date range re-slices this screen.";

export default function AgentsPage() {
  return (
    <>
      <Topbar
        crumb="Agent Analytics"
        rangeLive
        showPlatforms={false}
        exportLabel={null}
        extra={
          <>
            <FilterPill label="nike.com" items={["nike.com", "help.nike.com", "All properties"]} note={PROPERTY_NOTE} />
            <ReportCsvButton filename="nike-agents-30d.csv" report={agentsSpec} style={{ ...PILL, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              Export 48,231 events
            </ReportCsvButton>
            <ToastButton
              className="btn-ac"
              note="Configuring tracking needs a live workspace — this demo is read-only."
              style={{ fontSize: "12.5px", fontWeight: 500, borderRadius: "7px", padding: "6px 14px", border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              Configure tracking
            </ToastButton>
          </>
        }
      />
      <AgentsTabs />
      <div className="frame-agents">
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <AgentKpis />
          <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ fontSize: "14.5px", fontWeight: "600" }}>{"Crawl activity by agent"}</div>
                <Hint text="Which AI bots visited, day by day" />
              </div>
              <div style={{ display: "flex", gap: "14px", fontSize: "11px", fontWeight: "400", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "2px", background: "var(--ac)" }} />
                  {"GPTBot"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "2px", background: "#7fa7d9" }} />
                  {"PerplexityBot"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "2px", background: "#b98ed9" }} />
                  {"ClaudeBot"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "2px", background: "#d9b679" }} />
                  {"Google-Extended"}
                </div>
              </div>
            </div>
            <CrawlTrend />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "16px" }}>
            <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "14.5px", fontWeight: "600" }}>{"Agents"}<Hint text="AI bots that read your website" /></div>
              <div
                style={{
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
                }}
              >
                <span>{"Agent"}</span>
                <span>{"Operator"}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>{"Requests"}<Hint text="Times this bot visited your site" size={12} /></span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>{"Pages"}<Hint text="How many of your pages it read" size={12} /></span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>{"Robots"}<Hint text="Whether your site lets this bot in" size={12} align="right" /></span>
              </div>
              <Link
                href="/app/agents/bots/gptbot"
                className="row-hover"
                style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr .8fr .7fr .9fr", alignItems: "center", padding: "11px 20px", fontSize: "13px", color: "var(--tx)" }}
              >
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{"GPTBot"}</span>
                <span style={{ color: "var(--mut)" }}>{"OpenAI"}</span>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}><CrawlScaled n={21408} bot="gptbot" /></span>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}><CrawlScaled n={1412} kind="distinct" /></span>
                <span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "500",
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--ac)",
                      border: "1px solid color-mix(in oklab,var(--ac) 40%,transparent)",
                      borderRadius: "4px",
                      padding: "2px 7px",
                    }}
                  >
                    {"ALLOWED"}
                  </span>
                </span>
              </Link>
              <div className="row-hover" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr .8fr .7fr .9fr", alignItems: "center", padding: "11px 20px", fontSize: "13px", borderTop: "1px solid var(--brd)" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{"PerplexityBot"}</span>
                <span style={{ color: "var(--mut)" }}>{"Perplexity"}</span>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}><CrawlScaled n={11872} bot="perplexitybot" /></span>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}><CrawlScaled n={986} kind="distinct" /></span>
                <span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "500",
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--ac)",
                      border: "1px solid color-mix(in oklab,var(--ac) 40%,transparent)",
                      borderRadius: "4px",
                      padding: "2px 7px",
                    }}
                  >
                    {"ALLOWED"}
                  </span>
                </span>
              </div>
              <div className="row-hover" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr .8fr .7fr .9fr", alignItems: "center", padding: "11px 20px", fontSize: "13px", borderTop: "1px solid var(--brd)" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{"ClaudeBot"}</span>
                <span style={{ color: "var(--mut)" }}>{"Anthropic"}</span>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}><CrawlScaled n={8455} bot="claudebot" /></span>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}>{"743"}</span>
                <span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "500",
                      fontVariantNumeric: "tabular-nums",
                      color: "#e5636e",
                      border: "1px solid rgba(229,99,110,.4)",
                      borderRadius: "4px",
                      padding: "2px 7px",
                    }}
                  >
                    {"PARTIAL"}
                  </span>
                </span>
              </div>
              <div className="row-hover" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr .8fr .7fr .9fr", alignItems: "center", padding: "11px 20px", fontSize: "13px", borderTop: "1px solid var(--brd)" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{"Google-Extended"}</span>
                <span style={{ color: "var(--mut)" }}>{"Google"}</span>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}><CrawlScaled n={4206} bot="google-extended" /></span>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}><CrawlScaled n={612} kind="distinct" /></span>
                <span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "500",
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--ac)",
                      border: "1px solid color-mix(in oklab,var(--ac) 40%,transparent)",
                      borderRadius: "4px",
                      padding: "2px 7px",
                    }}
                  >
                    {"ALLOWED"}
                  </span>
                </span>
              </div>
              <div className="row-hover" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr .8fr .7fr .9fr", alignItems: "center", padding: "11px 20px", fontSize: "13px", borderTop: "1px solid var(--brd)" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{"Bytespider"}</span>
                <span style={{ color: "var(--mut)" }}>{"ByteDance"}</span>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}><CrawlScaled n={1914} /></span>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}><CrawlScaled n={388} kind="distinct" /></span>
                <span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "500",
                      fontVariantNumeric: "tabular-nums",
                      color: "#e5636e",
                      border: "1px solid rgba(229,99,110,.4)",
                      borderRadius: "4px",
                      padding: "2px 7px",
                    }}
                  >
                    {"BLOCKED"}
                  </span>
                </span>
              </div>
              <div className="row-hover" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr .8fr .7fr .9fr", alignItems: "center", padding: "11px 20px", fontSize: "13px", borderTop: "1px solid var(--brd)" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{"Applebot-Extended"}</span>
                <span style={{ color: "var(--mut)" }}>{"Apple"}</span>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}><CrawlScaled n={347} /></span>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}><CrawlScaled n={129} kind="distinct" /></span>
                <span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "500",
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--ac)",
                      border: "1px solid color-mix(in oklab,var(--ac) 40%,transparent)",
                      borderRadius: "4px",
                      padding: "2px 7px",
                    }}
                  >
                    {"ALLOWED"}
                  </span>
                </span>
              </div>
            </div>
            <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14.5px", fontWeight: "600" }}>{"Most crawled paths"}<Hint text="Pages AI bots read the most" /></span>
                <Link href="/app/page-health" style={{ fontSize: "11px", fontWeight: "400", fontVariantNumeric: "tabular-nums", color: "var(--ac)" }}>
                  {"View all →"}
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div className="row-hover" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 20px", fontSize: "12.5px", borderTop: "1px solid var(--brd)" }}>
                  <span style={{ fontSize: "12px", fontWeight: "400", fontVariantNumeric: "tabular-nums" }}>{"/running/marathon-training-guide"}</span>
                  <span style={{ fontSize: "12px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}><CrawlScaled n={2214} /></span>
                </div>
                <div className="row-hover" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 20px", fontSize: "12.5px", borderTop: "1px solid var(--brd)" }}>
                  <span style={{ fontSize: "12px", fontWeight: "400", fontVariantNumeric: "tabular-nums" }}>{"/pricing"}</span>
                  <span style={{ fontSize: "12px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}><CrawlScaled n={1876} /></span>
                </div>
                <div className="row-hover" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 20px", fontSize: "12.5px", borderTop: "1px solid var(--brd)" }}>
                  <span style={{ fontSize: "12px", fontWeight: "400", fontVariantNumeric: "tabular-nums" }}>{"/w/mens-running-shoes"}</span>
                  <span style={{ fontSize: "12px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}><CrawlScaled n={1433} /></span>
                </div>
                <div className="row-hover" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 20px", fontSize: "12.5px", borderTop: "1px solid var(--brd)" }}>
                  <span style={{ fontSize: "12px", fontWeight: "400", fontVariantNumeric: "tabular-nums" }}>{"/running/shoe-fitting-101"}</span>
                  <span style={{ fontSize: "12px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}><CrawlScaled n={1187} /></span>
                </div>
                <div className="row-hover" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 20px", fontSize: "12.5px", borderTop: "1px solid var(--brd)" }}>
                  <span style={{ fontSize: "12px", fontWeight: "400", fontVariantNumeric: "tabular-nums" }}>{"/w/womens-running-shoes"}</span>
                  <span style={{ fontSize: "12px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}><CrawlScaled n={904} /></span>
                </div>
              </div>
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
                <span style={{ color: "#e5636e", fontWeight: "500" }}>{"Alert:"}</span>
                {" ClaudeBot hit 214 blocked /help URLs — see Action #87 to unblock. "}
                <Link href="/app/agents/logs">{"Live logs →"}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
