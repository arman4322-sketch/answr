import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import KpiCard from "@/components/app/KpiCard";
import TrendChart from "@/components/app/charts/TrendChart";
import FilterPill from "@/components/ui/FilterPill";
import Hint from "@/components/ui/Hint";
import { analyticsComparisonSeries, infraDays, referredHumansSeries } from "@/lib/data/infra";
import AgentsTabs from "../AgentsTabs";
import ReferringPlatformCard from "./ReferringPlatformCard";
import { referralsSpec } from "../reports";

/* Agent Analytics — Referrals (frame #p2-referrals).
   "Export 3,412 referrals" downloads the executive report (../reports.ts): the
   four KPIs with plain-English reads, both daily series (referred humans by
   platform, and Answr edge logs vs GA4) as dated tables, the referring-platform
   split and the landing-pages table. */

export const metadata: Metadata = {
  title: "Referrals — Agent Analytics",
};

const DEMO_NOTE = "This filter needs a live workspace — the demo ships one fixture set for this list.";

export default function ReferralsPage() {
  return (
    <>
      <Topbar
        crumb={["Agent Analytics", "Referrals"]}
        rangeNote="Referrals report the fixed 30-day sample (Jul 7 – Aug 5). The date range re-slices Agent Analytics, Overview, Insights and Citations."
        showPlatforms={false}
        exportLabel="Export 3,412 referrals"
        exportFilename="nike-referrals-30d.csv"
        exportReport={referralsSpec}
        extra={<FilterPill label="nike.com" items={["nike.com", "help.nike.com", "All properties"]} note={DEMO_NOTE} />}
      />
      <AgentsTabs />
      <div className="frame-p2-referrals">
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
            <KpiCard label="Human referrals from AI" value="3,412" metricId="ai_referrals" delta="↑ 22%" deltaGood />
            <KpiCard label="Share of all referral traffic" value="8.4%" metricId="ai_referrals" hint="Slice of your visitors that AI sent" delta="↑ 1.2pt" deltaGood />
            <KpiCard label="Sessions from AI" value="5,108" metricId="ai_referrals" hint="Visits that started from an AI answer" delta="↑ 18%" deltaGood />
            <KpiCard label="Purchases from AI" value="61" metricId="ai_referrals" hint="Sales from people AI sent you" delta="↑ 14" deltaGood />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 372px", gap: "14px" }}>
            <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "17px 19px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>{"Referred humans by platform"}<Hint text="Which AI sent the most people" /></div>
                <div style={{ display: "flex", gap: "14px", fontSize: "11.5px", color: "var(--mut)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "2px", borderRadius: "1px", background: "var(--ac)" }} />
                    {"ChatGPT"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "2px", borderRadius: "1px", background: "#7fa7d9" }} />
                    {"Perplexity"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "2px", borderRadius: "1px", background: "#b98ed9" }} />
                    {"Gemini"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "stretch" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "2px 0",
                    textAlign: "right",
                    fontSize: "10.5px",
                    color: "var(--fnt)",
                    fontVariantNumeric: "tabular-nums",
                    flex: "none",
                    width: "26px",
                  }}
                >
                  <span>{"120"}</span>
                  <span>{"80"}</span>
                  <span>{"40"}</span>
                  <span>{"0"}</span>
                </div>
                <div style={{ position: "relative", flex: "1", minWidth: "0" }}>
                  <TrendChart
                    series={referredHumansSeries}
                    xLabels={infraDays}
                    width={700}
                    height={190}
                    yDomain={[0, 120]}
                    yDecimals={0}
                    showLegend={false}
                    pad={{ top: 2, right: 2, bottom: 2, left: 2 }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: "var(--fnt)", marginTop: "8px", fontVariantNumeric: "tabular-nums", paddingLeft: "34px" }}>
                <span>{"Jul 7"}</span>
                <span>{"Jul 14"}</span>
                <span>{"Jul 22"}</span>
                <span>{"Jul 29"}</span>
                <span>{"Aug 5"}</span>
              </div>
            </div>
            <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "17px 19px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>{"Analytics connection"}<Hint text="Where these visitor numbers come from" /></span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Hint text="Your analytics account is linked" align="right" size={12} /><span style={{ fontSize: "10px", fontWeight: "600", color: "#4cb782", border: "1px solid rgba(76,183,130,.4)", borderRadius: "4px", padding: "2px 7px" }}>{"CONNECTED"}</span></span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px", padding: "11px 13px", background: "var(--bg0)", border: "1px solid var(--brd)", borderRadius: "8px" }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "7px",
                    background: "var(--bg2)",
                    border: "1px solid var(--brd)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "var(--mut)",
                  }}
                >
                  {"GA4"}
                </div>
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: "500" }}>{"nike.com — GA4 property"}</div>
                  <div style={{ fontSize: "10.5px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{"last sync 6 min ago"}</div>
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "var(--mut)", lineHeight: "1.6", marginTop: "12px" }}>
                {"Answr's edge logs count "}
                <span style={{ color: "var(--tx)", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{"4.2% more"}</span>
                {" AI referrals than GA4 sessions — mostly agent browsers GA4 drops."}
              </div>
              <div style={{ marginTop: "10px" }}>
                <TrendChart
                  series={analyticsComparisonSeries}
                  xLabels={infraDays}
                  width={334}
                  height={64}
                  yDecimals={0}
                  showLegend={false}
                  pad={{ top: 6, right: 4, bottom: 6, left: 4 }}
                />
              </div>
              <div style={{ display: "flex", gap: "12px", fontSize: "10.5px", color: "var(--fnt)", marginTop: "6px" }}>
                <span style={{ color: "var(--mut)" }}>{"— Answr logs"}</span>
                <span>{"— GA4 sessions"}</span>
              </div>
              <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--brd)", fontSize: "11.5px", color: "var(--fnt)", lineHeight: "1.7" }}>
                {"Other methods: edge snippet · Cloudflare · Vercel · WordPress"}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <ReferringPlatformCard />
            <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "15px 19px 11px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>{"Landing pages"}<Hint text="Pages AI visitors land on first" /></div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr .8fr .8fr .5fr",
                  padding: "7px 19px",
                  fontSize: "11px",
                  fontWeight: "500",
                  color: "var(--fnt)",
                  borderBottom: "1px solid var(--brd)",
                }}
              >
                <span>{"Page"}</span>
                <span>{"Referred"}</span>
                <span>{"% of AI refs"}</span>
                <span>{"Δ"}</span>
              </div>
              <div className="row-hover" style={{ display: "grid", gridTemplateColumns: "2fr .8fr .8fr .5fr", alignItems: "center", padding: "10px 19px", fontSize: "12.5px", fontVariantNumeric: "tabular-nums" }}>
                <span style={{ color: "var(--tx)" }}>{"/running/marathon-training-guide"}</span>
                <span style={{ fontWeight: "600" }}>{"912"}</span>
                <span style={{ color: "var(--mut)" }}>{"26.7%"}</span>
                <span style={{ fontSize: "12px", fontWeight: "500", color: "#4cb782" }}>{"↑ 84"}</span>
              </div>
              <div
                className="row-hover"
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr .8fr .8fr .5fr",
                  alignItems: "center",
                  padding: "10px 19px",
                  fontSize: "12.5px",
                  borderTop: "1px solid var(--brd)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span style={{ color: "var(--tx)" }}>{"/pricing"}</span>
                <span style={{ fontWeight: "600" }}>{"746"}</span>
                <span style={{ color: "var(--mut)" }}>{"21.9%"}</span>
                <span style={{ fontSize: "12px", fontWeight: "500", color: "#4cb782" }}>{"↑ 61"}</span>
              </div>
              <div
                className="row-hover"
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr .8fr .8fr .5fr",
                  alignItems: "center",
                  padding: "10px 19px",
                  fontSize: "12.5px",
                  borderTop: "1px solid var(--brd)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span style={{ color: "var(--tx)" }}>{"/w/mens-running-shoes"}</span>
                <span style={{ fontWeight: "600" }}>{"418"}</span>
                <span style={{ color: "var(--mut)" }}>{"12.3%"}</span>
                <span style={{ fontSize: "12px", fontWeight: "500", color: "#4cb782" }}>{"↑ 22"}</span>
              </div>
              <div
                className="row-hover"
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr .8fr .8fr .5fr",
                  alignItems: "center",
                  padding: "10px 19px",
                  fontSize: "12.5px",
                  borderTop: "1px solid var(--brd)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span style={{ color: "var(--tx)" }}>{"/w/womens-running-shoes"}</span>
                <span style={{ fontWeight: "600" }}>{"296"}</span>
                <span style={{ color: "var(--mut)" }}>{"8.7%"}</span>
                <span style={{ fontSize: "12px", fontWeight: "500", color: "#e5636e" }}>{"↓ 12"}</span>
              </div>
              <div
                className="row-hover"
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr .8fr .8fr .5fr",
                  alignItems: "center",
                  padding: "10px 19px",
                  fontSize: "12.5px",
                  borderTop: "1px solid var(--brd)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span style={{ color: "var(--tx)" }}>{"/ (homepage)"}</span>
                <span style={{ fontWeight: "600" }}>{"288"}</span>
                <span style={{ color: "var(--mut)" }}>{"8.4%"}</span>
                <span style={{ fontSize: "12px", fontWeight: "500", color: "#4cb782" }}>{"↑ 9"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
