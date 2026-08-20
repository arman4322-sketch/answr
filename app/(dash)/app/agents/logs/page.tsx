import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import FilterPill from "@/components/ui/FilterPill";
import Hint from "@/components/ui/Hint";
import { ToastButton } from "../../settings/DemoControls";
import AgentsTabs from "../AgentsTabs";
import { logsSpec } from "../reports";

/* Agent Analytics — Live logs (frame #m-logs).
   Topbar Export downloads the executive report (../reports.ts): what the stream
   is showing and why it matters (3 of 6 requests blocked, action #87's
   evidence), then the request log itself. */

export const metadata: Metadata = {
  title: "Live logs — Agent Analytics",
};

const DEMO_NOTE = "This filter needs a live workspace — the demo ships one fixture set for this list.";

export default function LiveLogsPage() {
  return (
    <>
      <Topbar
        crumb={["Agent Analytics", "Live logs"]}
        rangeNote="The stream shows the most recent requests as they arrive, not a date window. The date range re-slices Agent Analytics, Overview, Insights and Citations."
        platformNote="Requests are attributed by crawler user agent, not by answer platform — this stream isn't split by the platform filter."
        exportFilename="nike-logs-30d.csv"
        exportReport={logsSpec}
      />
      <AgentsTabs />
      <div className="frame-m-logs">
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ToastButton
              note="The demo ships a fixed log snapshot — pausing the stream applies on live workspaces."
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
                background: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4cb782" }} />
              {"LIVE"}
            </ToastButton>
            <Hint text="Bot visits shown as they happen" />
            <ToastButton
              note="Path filters apply on live workspaces — the demo stream is pinned to /help."
              style={{
                fontSize: "12px",
                color: "var(--fnt)",
                background: "rgba(255,255,255,0.045)",
                borderRadius: "7px",
                padding: "6px 12px",
                fontVariantNumeric: "tabular-nums",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {"path: /help"}
            </ToastButton>
            <FilterPill label="All bot types" items={["All bot types", "Crawlers", "Search fetch", "Live browse"]} note={DEMO_NOTE} />
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{"streaming · 48 req/min"}<Hint text="Bot visits arriving each minute" align="right" /></span>
          </div>
          <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden", fontVariantNumeric: "tabular-nums" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: ".9fr .8fr 1.3fr 1.6fr .6fr",
                padding: "8px 16px",
                fontSize: "10.5px",
                fontWeight: "500",
                color: "var(--fnt)",
                borderBottom: "1px solid var(--brd)",
              }}
            >
              <span>{"Time"}</span>
              <span>{"Platform"}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>{"User agent"}<Hint text="The name a bot calls itself" size={12} /></span>
              <span>{"Path"}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>{"Status"}<Hint text="200 means let in, 403 means blocked" size={12} align="right" /></span>
            </div>
            <div className="row-hover" style={{ display: "grid", gridTemplateColumns: ".9fr .8fr 1.3fr 1.6fr .6fr", padding: "8px 16px", fontSize: "12px", alignItems: "center", background: "rgba(142,124,242,0.05)" }}>
              <span style={{ color: "var(--mut)" }}>{"14:02:11"}</span>
              <span>{"OpenAI"}</span>
              <span style={{ color: "var(--mut)" }}>{"GPTBot/1.2"}</span>
              <span>{"/help/size-guide"}</span>
              <span style={{ color: "#e5636e", fontWeight: "600" }}>{"403"}</span>
            </div>
            <div className="row-hover" style={{ display: "grid", gridTemplateColumns: ".9fr .8fr 1.3fr 1.6fr .6fr", padding: "8px 16px", fontSize: "12px", alignItems: "center", borderTop: "1px solid var(--brd)" }}>
              <span style={{ color: "var(--mut)" }}>{"14:02:08"}</span>
              <span>{"Anthropic"}</span>
              <span style={{ color: "var(--mut)" }}>{"ClaudeBot/1.0"}</span>
              <span>{"/help/returns"}</span>
              <span style={{ color: "#e5636e", fontWeight: "600" }}>{"403"}</span>
            </div>
            <div className="row-hover" style={{ display: "grid", gridTemplateColumns: ".9fr .8fr 1.3fr 1.6fr .6fr", padding: "8px 16px", fontSize: "12px", alignItems: "center", borderTop: "1px solid var(--brd)" }}>
              <span style={{ color: "var(--mut)" }}>{"14:01:59"}</span>
              <span>{"Perplexity"}</span>
              <span style={{ color: "var(--mut)" }}>{"PerplexityBot/1.1"}</span>
              <span>{"/running/shoe-fitting-101"}</span>
              <span style={{ color: "#4cb782", fontWeight: "600" }}>{"200"}</span>
            </div>
            <div className="row-hover" style={{ display: "grid", gridTemplateColumns: ".9fr .8fr 1.3fr 1.6fr .6fr", padding: "8px 16px", fontSize: "12px", alignItems: "center", borderTop: "1px solid var(--brd)" }}>
              <span style={{ color: "var(--mut)" }}>{"14:01:44"}</span>
              <span>{"OpenAI"}</span>
              <span style={{ color: "var(--mut)" }}>{"OAI-SearchBot/1.0"}</span>
              <span>{"/pricing"}</span>
              <span style={{ color: "#4cb782", fontWeight: "600" }}>{"200"}</span>
            </div>
            <div className="row-hover" style={{ display: "grid", gridTemplateColumns: ".9fr .8fr 1.3fr 1.6fr .6fr", padding: "8px 16px", fontSize: "12px", alignItems: "center", borderTop: "1px solid var(--brd)" }}>
              <span style={{ color: "var(--mut)" }}>{"14:01:31"}</span>
              <span>{"Google"}</span>
              <span style={{ color: "var(--mut)" }}>{"Google-Extended"}</span>
              <span>{"/w/womens-running-shoes"}</span>
              <span style={{ color: "#4cb782", fontWeight: "600" }}>{"200"}</span>
            </div>
            <div className="row-hover" style={{ display: "grid", gridTemplateColumns: ".9fr .8fr 1.3fr 1.6fr .6fr", padding: "8px 16px", fontSize: "12px", alignItems: "center", borderTop: "1px solid var(--brd)" }}>
              <span style={{ color: "var(--mut)" }}>{"14:01:19"}</span>
              <span>{"ByteDance"}</span>
              <span style={{ color: "var(--mut)" }}>{"Bytespider"}</span>
              <span>{"/running/marathon-training-guide"}</span>
              <span style={{ color: "#e5636e", fontWeight: "600" }}>{"403"}</span>
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "var(--mut)", background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "8px", padding: "11px 14px", lineHeight: "1.55" }}>
            {"Filtered to /help — the 403 pattern is action "}
            <span style={{ color: "var(--tx)", fontWeight: "500" }}>{"#87"}</span>
            {"'s evidence, live."}
          </div>
        </div>
      </div>
    </>
  );
}
