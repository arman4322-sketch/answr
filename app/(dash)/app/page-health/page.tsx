import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import KpiCard from "@/components/app/KpiCard";
import Hint from "@/components/ui/Hint";
import { ToastButton } from "../settings/DemoControls";
import AgentsTabs from "../agents/AgentsTabs";
import { pageHealthSpec } from "./report";

/* Agent Analytics — Page health (frame #m-pagehealth).
   Topbar Export downloads the executive report (./report.ts): the three render
   timings with their web-vitals bands and plain-English reads, what the page
   earns per platform, and the TTI fix. */

export const metadata: Metadata = {
  title: "Page health — Agent Analytics",
};

export default function PageHealthPage() {
  return (
    <>
      <Topbar
        crumb={["Agent Analytics", "Page health"]}
        rangeNote="Page health is the latest render measurement for this URL, not a date window. The date range re-slices Agent Analytics, Overview, Insights and Citations."
        platformNote="The Platform breakdown below already lists this page's engines side by side — the table isn't narrowed by the platform filter."
        exportFilename="nike-page-health-30d.csv"
        exportReport={pageHealthSpec}
      />
      <AgentsTabs />
      <div className="frame-m-pagehealth">
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "11.5px", color: "var(--fnt)" }}>
                {"Agent Analytics / Pages / "}
                <span style={{ color: "var(--tx)" }}>{"/running/marathon-training-guide"}</span>
              </div>
              <div style={{ fontSize: "15px", fontWeight: "600", marginTop: "5px", fontVariantNumeric: "tabular-nums" }}>{"/running/marathon-training-guide"}</div>
              <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "3px", fontVariantNumeric: "tabular-nums" }}>{"last indexed 2h ago · GPTBot"}</div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <ToastButton
                note="Re-analysis runs on live workspaces — this demo is read-only."
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "var(--mut)",
                  background: "rgba(255,255,255,0.045)",
                  borderRadius: "7px",
                  padding: "6px 12px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {"Re-analyze"}
              </ToastButton>
              <ToastButton
                className="btn-ac"
                note="Index submissions run on live workspaces — this demo is read-only."
                style={{ fontSize: "12.5px", fontWeight: "500", borderRadius: "7px", padding: "6px 14px", border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                {"Submit to index"}
              </ToastButton>
            </div>
          </div>
          {/* Web-vital timing cards carry metricId page_speed (crawler-probe render timings).
              The GOOD/FAIR chip is passed as children so its exact markup is preserved. */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
            <KpiCard label="First Contentful Paint" value="0.9s" metricId="page_speed" hint="When the first thing appears on screen">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "9.5px", fontWeight: "600", color: "#4cb782", border: "1px solid rgba(76,183,130,.4)", borderRadius: "4px", padding: "1px 6px" }}>{"GOOD"}</span>
                <Hint text="Fast enough for bots and people" align="right" size={12} />
              </span>
            </KpiCard>
            <KpiCard label="Largest Contentful Paint" value="1.8s" metricId="page_speed" hint="When the main content finishes loading">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "9.5px", fontWeight: "600", color: "#4cb782", border: "1px solid rgba(76,183,130,.4)", borderRadius: "4px", padding: "1px 6px" }}>{"GOOD"}</span>
                <Hint text="Fast enough for bots and people" align="right" size={12} />
              </span>
            </KpiCard>
            <KpiCard label="Time to Interactive" value="3.4s" metricId="page_speed" hint="When the page becomes usable">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "9.5px", fontWeight: "600", color: "#d9b679", border: "1px solid rgba(217,182,121,.4)", borderRadius: "4px", padding: "1px 6px" }}>{"FAIR"}</span>
                <Hint text="Slower than it should be" align="right" size={12} />
              </span>
            </KpiCard>
          </div>
          <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ padding: "13px 16px 9px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600" }}>{"Platform breakdown"}<Hint text="How each AI treats this page" /></div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr .8fr .8fr .9fr .7fr",
                padding: "6px 16px",
                fontSize: "10.5px",
                fontWeight: "500",
                color: "var(--fnt)",
                borderBottom: "1px solid var(--brd)",
              }}
            >
              <span>{"Platform"}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>{"Citations"}<Hint text="Times AI linked to this page" size={12} /></span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>{"Crawls"}<Hint text="Times a bot read this page" size={12} /></span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>{"Humans referred"}<Hint text="People who clicked here from AI" size={12} align="right" /></span>
              <span>{"Δ 30d"}</span>
            </div>
            <div className="row-hover" style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr .8fr .9fr .7fr", padding: "9px 16px", fontSize: "12.5px", alignItems: "center", fontVariantNumeric: "tabular-nums" }}>
              <span>{"ChatGPT"}</span>
              <span style={{ fontWeight: "600" }}>{"84"}</span>
              <span style={{ color: "var(--mut)" }}>{"2,214"}</span>
              <span style={{ fontWeight: "600" }}>{"512"}</span>
              <span style={{ fontSize: "11.5px", color: "#4cb782" }}>{"↑ 61"}</span>
            </div>
            <div
              className="row-hover"
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr .8fr .8fr .9fr .7fr",
                padding: "9px 16px",
                fontSize: "12.5px",
                alignItems: "center",
                borderTop: "1px solid var(--brd)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span>{"Perplexity"}</span>
              <span style={{ fontWeight: "600" }}>{"51"}</span>
              <span style={{ color: "var(--mut)" }}>{"1,108"}</span>
              <span style={{ fontWeight: "600" }}>{"231"}</span>
              <span style={{ fontSize: "11.5px", color: "#4cb782" }}>{"↑ 18"}</span>
            </div>
            <div
              className="row-hover"
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr .8fr .8fr .9fr .7fr",
                padding: "9px 16px",
                fontSize: "12.5px",
                alignItems: "center",
                borderTop: "1px solid var(--brd)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span>{"AI Overviews"}</span>
              <span style={{ fontWeight: "600" }}>{"38"}</span>
              <span style={{ color: "var(--mut)" }}>{"846"}</span>
              <span style={{ fontWeight: "600" }}>{"169"}</span>
              <span style={{ fontSize: "11.5px", color: "#4cb782" }}>{"↑ 24"}</span>
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "var(--mut)", background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "8px", padding: "11px 14px", lineHeight: "1.55" }}>
            <span style={{ color: "#d9b679", fontWeight: "500" }}>{"TTI fair:"}</span>
            {" a 1.2 MB analytics bundle delays interactivity — irrelevant to crawlers, costly for the humans they refer. Defer it below the fold."}
          </div>
        </div>
      </div>
    </>
  );
}
