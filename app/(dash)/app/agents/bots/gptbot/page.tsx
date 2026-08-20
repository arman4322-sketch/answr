import type { Metadata } from "next";
import Link from "next/link";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import AgentsTabs from "../../AgentsTabs";
import { gptbotSpec } from "../../reports";

/* Agent Analytics — bot detail (frame #m-bot; the frame depicts GPTBot, so the
   crumb/copy stay GPTBot even though the assigned route slug is "claudebot").
   Topbar Export downloads the executive report (../../reports.ts): the request
   /pages/robots headline with plain-English reads, GPTBot's own daily request
   series as a dated table, the visit-purpose split, the user agents seen and
   the pages-indexed table. */

export const metadata: Metadata = {
  title: "GPTBot — Agent Analytics",
};

export default function BotDetailPage() {
  return (
    <>
      <Topbar
        crumb={["Agent Analytics", "GPTBot"]}
        rangeNote="This bot detail reports the fixed 30-day crawl sample (Jul 7 – Aug 5). The date range re-slices Agent Analytics, Overview, Insights and Citations."
        platformNote="Crawlers are identified by user agent, not by answer platform — this screen isn't split by the platform filter."
        exportFilename="nike-gptbot-30d.csv"
        exportReport={gptbotSpec}
      />
      <AgentsTabs />
      <div className="frame-m-bot">
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "11.5px", color: "var(--fnt)" }}>
                {"Agent Analytics / Crawlers / "}
                <span style={{ color: "var(--tx)" }}>{"GPTBot"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "5px" }}>
                <span style={{ fontSize: "16px", fontWeight: "600" }}>{"GPTBot"}</span>
                <span style={{ fontSize: "11px", color: "var(--fnt)" }}>{"OpenAI"}</span>
                <span style={{ fontSize: "10px", fontWeight: "600", color: "#4cb782", border: "1px solid rgba(76,183,130,.4)", borderRadius: "4px", padding: "2px 7px" }}>{"ALLOWED"}</span>
                <Hint text="Your site lets this bot in" size={12} />
              </div>
            </div>
            <Link href="/app/agents/logs" style={{ fontSize: "12px", fontWeight: "500", color: "var(--mut)", background: "rgba(255,255,255,0.045)", borderRadius: "7px", padding: "6px 12px" }}>
              {"View in logs →"}
            </Link>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", background: "var(--bg2)", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 9px", fontVariantNumeric: "tabular-nums" }}>
              {"GPTBot/1.2"}
            </span>
            <span style={{ fontSize: "11px", background: "var(--bg2)", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 9px", fontVariantNumeric: "tabular-nums" }}>
              {"OAI-SearchBot/1.0"}
            </span>
            <span style={{ fontSize: "11px", background: "var(--bg2)", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 9px", fontVariantNumeric: "tabular-nums" }}>
              {"ChatGPT-User/2.0"}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "12px" }}>
            <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600" }}>{"Visits by user agent · 30d"}<Hint text="Why this bot came: reading, searching, browsing" /></div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
                <svg width="92" height="92" viewBox="0 0 92 92">
                  <circle cx="46" cy="46" r="37" fill="none" stroke="var(--bg2)" strokeWidth="11" />
                  <circle cx="46" cy="46" r="37" fill="none" stroke="var(--ac)" strokeWidth="11" strokeDasharray="151 233" transform="rotate(-90 46 46)" />
                  <circle cx="46" cy="46" r="37" fill="none" stroke="#7fa7d9" strokeWidth="11" strokeDasharray="56 233" strokeDashoffset="-151" transform="rotate(-90 46 46)" />
                  <text x="46" y="50" textAnchor="middle" fill="var(--tx)" style={{ fontSize: "14px", fontWeight: "600" }}>
                    {"21,408"}
                  </text>
                </svg>
                <div style={{ display: "flex", flexDirection: "column", gap: "7px", fontSize: "11.5px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "2px", background: "var(--ac)" }} />
                    {"Crawling"}
                    <span style={{ marginLeft: "auto", fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>{"65%"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "2px", background: "#7fa7d9" }} />
                    {"Search fetch"}
                    <span style={{ marginLeft: "auto", fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>{"24%"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "2px", background: "var(--bg2)" }} />
                    {"Live browse"}
                    <span style={{ marginLeft: "auto", fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>{"11%"}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "18px", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--brd)", fontVariantNumeric: "tabular-nums" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10.5px", color: "var(--fnt)" }}>{"PAGES"}<Hint text="How many of your pages it read" size={12} /></div>
                  <div style={{ fontSize: "15px", fontWeight: "600", marginTop: "2px" }}>{"1,412"}</div>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10.5px", color: "var(--fnt)" }}>{"LAST SEEN"}<Hint text="When this bot last visited" size={12} /></div>
                  <div style={{ fontSize: "15px", fontWeight: "600", marginTop: "2px" }}>{"2 min"}</div>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10.5px", color: "var(--fnt)" }}>{"Δ 30D"}<Hint text="Change since the previous thirty days" size={12} /></div>
                  <div style={{ fontSize: "15px", fontWeight: "600", marginTop: "2px", color: "#4cb782" }}>{"↑ 18%"}</div>
                </div>
              </div>
            </div>
            <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "13px 16px 9px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600" }}>{"Pages indexed"}<Hint text="Your pages this bot has read" /></div>
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
              <div className="row-hover" style={{ display: "grid", gridTemplateColumns: "2fr .7fr .8fr", padding: "9px 16px", fontSize: "12px", alignItems: "center", fontVariantNumeric: "tabular-nums" }}>
                <span>{"/running/marathon-training-guide"}</span>
                <span style={{ fontWeight: "600" }}>{"486"}</span>
                <span style={{ color: "var(--mut)" }}>{"2 min ago"}</span>
              </div>
              <div
                className="row-hover"
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr .7fr .8fr",
                  padding: "9px 16px",
                  fontSize: "12px",
                  alignItems: "center",
                  borderTop: "1px solid var(--brd)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span>{"/pricing"}</span>
                <span style={{ fontWeight: "600" }}>{"402"}</span>
                <span style={{ color: "var(--mut)" }}>{"18 min ago"}</span>
              </div>
              <div
                className="row-hover"
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr .7fr .8fr",
                  padding: "9px 16px",
                  fontSize: "12px",
                  alignItems: "center",
                  borderTop: "1px solid var(--brd)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span>{"/w/mens-running-shoes"}</span>
                <span style={{ fontWeight: "600" }}>{"311"}</span>
                <span style={{ color: "var(--mut)" }}>{"1 h ago"}</span>
              </div>
              <div
                className="row-hover"
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr .7fr .8fr",
                  padding: "9px 16px",
                  fontSize: "12px",
                  alignItems: "center",
                  borderTop: "1px solid var(--brd)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span style={{ color: "#e5636e" }}>
                  {"/help/* "}
                  <span style={{ fontSize: "10px", border: "1px solid rgba(229,99,110,.4)", borderRadius: "4px", padding: "1px 5px", marginLeft: "4px" }}>{"BLOCKED"}</span>
                  {" "}
                  <Hint text="Your site turns this bot away here" size={12} />
                </span>
                <span style={{ fontWeight: "600", color: "var(--mut)" }}>{"—"}</span>
                <span style={{ color: "var(--mut)" }}>{"robots.txt"}</span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "var(--mut)", background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "8px", padding: "11px 14px", lineHeight: "1.55" }}>
            <span style={{ color: "var(--tx)", fontWeight: "500" }}>{"Note:"}</span>
            {" search-fetch traffic doubled since July — GPTBot re-reads /pricing before answering cost questions. Keep that page fresh."}
          </div>
        </div>
      </div>
    </>
  );
}
