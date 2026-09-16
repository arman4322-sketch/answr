import type { Metadata } from "next";
import Link from "next/link";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import AgentsTabs from "../../AgentsTabs";
import { EmptyNote, SetupState } from "../../TelemetryStates";
import { botReport } from "../../reports";
import { ago, dateTime, fmtInt, getAgentsView } from "../../telemetryView";

/* Agent Analytics — bot detail (GPTBot).

   Scoped to the requests this deployment actually captured from OpenAI's
   crawlers. The fixture's 21,408 requests, its 65/24/11 purpose split, its
   "↑ 18% vs 30d" and its robots.txt verdict are all gone: the capture path
   records a user agent, a path, a status and a timestamp, so that is exactly
   what this screen reports. Before GPTBot's first visit the page says so
   rather than showing a shape of a crawler that was never here. */

export const metadata: Metadata = {
  title: "GPTBot — Agent Analytics",
};

export const dynamic = "force-dynamic";

const BOT_ID = "gptbot";
const BOT_LABEL = "GPTBot";
const OPERATOR = "OpenAI";

const R = 37;
const CIRC = 2 * Math.PI * R;
const SEG_COLORS = ["var(--ac)", "#7fa7d9", "#b98ed9"];

const STAT_LABEL: React.CSSProperties = { display: "flex", alignItems: "center", gap: "5px", fontSize: "10.5px", color: "var(--fnt)" };
const STAT_VALUE: React.CSSProperties = { fontSize: "15px", fontWeight: "600", marginTop: "2px" };

export default async function BotDetailPage() {
  const view = await getAgentsView();
  const { metrics } = view;

  const row = view.agents.find((a) => a.botId === BOT_ID);
  const events = view.crawlerEvents.filter((e) => e.botId === BOT_ID);
  const seen = events.length > 0;

  /* every OpenAI agent captured — the donut's real segments */
  const openAi = view.agents.filter((a) => a.operator === OPERATOR);
  const openAiTotal = openAi.reduce((t, a) => t + a.requests, 0);
  let offset = 0;
  const segments = openAi.slice(0, 3).map((a, i) => {
    const len = openAiTotal ? (a.requests / openAiTotal) * CIRC : 0;
    const seg = { label: a.label, requests: a.requests, color: SEG_COLORS[i % SEG_COLORS.length], len, offset };
    offset -= len;
    return seg;
  });

  const paths = new Map<string, { count: number; lastSeen: number }>();
  for (const e of events) {
    const cur = paths.get(e.path) ?? { count: 0, lastSeen: 0 };
    cur.count += 1;
    cur.lastSeen = Math.max(cur.lastSeen, e.ts);
    paths.set(e.path, cur);
  }
  const pathRows = [...paths.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 8);
  const daysSeen = new Set(events.map((e) => new Date(e.ts).toISOString().slice(0, 10))).size;

  return (
    <>
      <Topbar
        crumb={["Agent Analytics", BOT_LABEL]}
        rangeNote="This detail counts every GPTBot request captured on this deployment since the store started collecting — it is not sliced by the date range."
        platformNote="Crawlers are identified by user agent, not by answer platform — this screen isn't split by the platform filter."
        exportLabel={metrics.configured && seen ? "Export" : null}
        exportFilename="agents-gptbot.csv"
        exportReport={botReport(view, BOT_LABEL, OPERATOR)}
      />
      <AgentsTabs />
      <div className="frame-m-bot">
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {!metrics.configured ? (
            <SetupState note="Set up your brand to attribute captured crawler traffic to a workspace. GPTBot's requests are being recorded either way." />
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "11.5px", color: "var(--fnt)" }}>
                    {"Agent Analytics / Crawlers / "}
                    <span style={{ color: "var(--tx)" }}>{BOT_LABEL}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "5px" }}>
                    <span style={{ fontSize: "16px", fontWeight: "600" }}>{BOT_LABEL}</span>
                    <span style={{ fontSize: "11px", color: "var(--fnt)" }}>{OPERATOR}</span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "600",
                        color: seen ? "#4cb782" : "var(--fnt)",
                        border: `1px solid ${seen ? "rgba(76,183,130,.4)" : "var(--brd)"}`,
                        borderRadius: "4px",
                        padding: "2px 7px",
                      }}
                    >
                      {seen ? "SEEN" : "NOT SEEN YET"}
                    </span>
                    <Hint text={seen ? "This bot has requested pages on this deployment" : "This bot has not requested a page here yet"} size={12} />
                  </div>
                </div>
                <Link href="/app/agents/logs" style={{ fontSize: "12px", fontWeight: "500", color: "var(--mut)", background: "rgba(255,255,255,0.045)", borderRadius: "7px", padding: "6px 12px" }}>
                  {"View in logs →"}
                </Link>
              </div>

              {openAi.length > 0 && (
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {openAi.map((a) => (
                    <span
                      key={a.botId}
                      style={{ fontSize: "11px", background: "var(--bg2)", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 9px", fontVariantNumeric: "tabular-nums" }}
                    >
                      {`${a.label} · ${fmtInt(a.requests)}`}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "12px" }}>
                <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600" }}>
                    {"Requests by OpenAI agent"}
                    <Hint text="Which OpenAI fetcher did the requesting" />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
                    <svg width="92" height="92" viewBox="0 0 92 92">
                      <circle cx="46" cy="46" r={R} fill="none" stroke="var(--bg2)" strokeWidth="11" />
                      {segments.map((s) => (
                        <circle
                          key={s.label}
                          cx="46"
                          cy="46"
                          r={R}
                          fill="none"
                          stroke={s.color}
                          strokeWidth="11"
                          strokeDasharray={`${s.len} ${CIRC}`}
                          strokeDashoffset={s.offset}
                          transform="rotate(-90 46 46)"
                        />
                      ))}
                      <text x="46" y="50" textAnchor="middle" fill={openAiTotal ? "var(--tx)" : "var(--fnt)"} style={{ fontSize: "14px", fontWeight: "600" }}>
                        {openAiTotal ? fmtInt(openAiTotal) : "0"}
                      </text>
                    </svg>
                    <div style={{ display: "flex", flexDirection: "column", gap: "7px", fontSize: "11.5px", flex: 1 }}>
                      {segments.length === 0 ? (
                        <span style={{ color: "var(--fnt)", lineHeight: 1.6 }}>
                          {"No OpenAI crawler request captured yet — the split appears with the first one."}
                        </span>
                      ) : (
                        segments.map((s) => (
                          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <span style={{ width: "7px", height: "7px", borderRadius: "2px", background: s.color }} />
                            {s.label}
                            <span style={{ marginLeft: "auto", fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>
                              {`${Math.round((s.requests / openAiTotal) * 100)}%`}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "18px", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--brd)", fontVariantNumeric: "tabular-nums" }}>
                    <div>
                      <div style={STAT_LABEL}>
                        {"PAGES"}
                        <Hint text="How many of your pages it read" size={12} />
                      </div>
                      <div style={STAT_VALUE}>{fmtInt(row?.pages ?? 0)}</div>
                    </div>
                    <div>
                      <div style={STAT_LABEL}>
                        {"LAST SEEN"}
                        <Hint text="When this bot last visited" size={12} />
                      </div>
                      <div style={{ ...STAT_VALUE, color: row?.lastSeen ? "var(--tx)" : "var(--fnt)" }}>{row?.lastSeen ? ago(row.lastSeen) : "never"}</div>
                    </div>
                    <div>
                      <div style={STAT_LABEL}>
                        {"DAYS SEEN"}
                        <Hint text="Days with at least one visit from this bot" size={12} />
                      </div>
                      <div style={STAT_VALUE}>{fmtInt(daysSeen)}</div>
                    </div>
                    <div>
                      <div style={STAT_LABEL}>
                        {"BLOCKED"}
                        <Hint text="Requests this site answered 4xx/5xx" size={12} />
                      </div>
                      <div style={{ ...STAT_VALUE, color: row?.blocked ? "#e5636e" : "var(--tx)" }}>{fmtInt(row?.blocked ?? 0)}</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ padding: "13px 16px 9px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600" }}>
                    {"Pages fetched"}
                    <Hint text="Your pages this bot has read" />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr .7fr .8fr",
                      padding: "6px 16px",
                      fontSize: "10.5px",
                      fontWeight: "500",
                      color: "var(--fnt)",
                      borderBottom: "1px solid var(--brd)",
                    }}
                  >
                    <span>{"Path"}</span>
                    <span>{"Visits"}</span>
                    <span>{"Last visit"}</span>
                  </div>
                  {pathRows.length === 0 ? (
                    <EmptyNote>
                      {`${BOT_LABEL} has not fetched a page on this deployment yet. Its user agent is in the catalog the capture path matches, so the first request it makes is recorded here.`}
                    </EmptyNote>
                  ) : (
                    pathRows.map(([path, v], i) => (
                      <div
                        key={path}
                        className="row-hover"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2fr .7fr .8fr",
                          padding: "9px 16px",
                          fontSize: "12px",
                          alignItems: "center",
                          fontVariantNumeric: "tabular-nums",
                          ...(i > 0 ? { borderTop: "1px solid var(--brd)" } : {}),
                        }}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{path}</span>
                        <span style={{ fontWeight: "600" }}>{fmtInt(v.count)}</span>
                        <span style={{ color: "var(--mut)" }} title={dateTime(v.lastSeen)}>
                          {ago(v.lastSeen)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ fontSize: "12px", color: "var(--mut)", background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "8px", padding: "11px 14px", lineHeight: "1.55" }}>
                <span style={{ color: "var(--tx)", fontWeight: "500" }}>{"What this is:"}</span>
                {seen
                  ? ` ${fmtInt(row?.requests ?? 0)} captured GPTBot ${row?.requests === 1 ? "request" : "requests"} across ${fmtInt(row?.pages ?? 0)} ${row?.pages === 1 ? "path" : "paths"}${
                      metrics.crawlerEvents ? `, ${Math.round(((row?.requests ?? 0) / metrics.crawlerEvents) * 100)}% of all AI-crawler traffic captured here` : ""
                    }. Blocked counts read the status this site returned; robots.txt posture is not observed by the capture path, so no ALLOWED/BLOCKED verdict is claimed.`
                  : " no GPTBot request has reached this deployment yet. Nothing on this page is estimated — the figures stay at zero until OpenAI's crawler actually arrives."}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
