import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import KpiCard from "@/components/app/KpiCard";
import Hint from "@/components/ui/Hint";
import { PIPELINE } from "@/lib/telemetry/pipeline";
import AgentsTabs from "../AgentsTabs";
import CrawlTrend from "../CrawlTrend";
import { CaptureBanner, EmptyNote, SetupState } from "../TelemetryStates";
import { referralsReport } from "../reports";
import { ago, dateTime, fmtInt, getAgentsView } from "../telemetryView";
import ReferringPlatformCard from "./ReferringPlatformCard";

/* Agent Analytics — Referrals.

   Real human click-throughs from AI assistants, captured by public/snippet.js →
   /api/collect. The Nike referral fixture is gone, and so are the figures it
   carried that this pipeline cannot observe: sessions, purchases, share of all
   referral traffic and the GA4 comparison. What the snippet genuinely knows —
   how many AI-referred visits arrived, from which assistant, on which page — is
   what this screen shows. Referrer-stripped clicks are unattributable, so every
   count here is a floor, and the measurement card says so. */

export const metadata: Metadata = {
  title: "Referrals — Agent Analytics",
};

export const dynamic = "force-dynamic";

const RANGE_NOTE =
  "Referrals are counted from click-throughs captured on this deployment since the store started collecting — this screen is not sliced by the date range.";

export default async function ReferralsPage() {
  const view = await getAgentsView();
  const { metrics } = view;
  const top = view.referralSources[0];
  const days = view.referralDayKeys.length;

  return (
    <>
      <Topbar
        crumb={["Agent Analytics", "Referrals"]}
        rangeNote={RANGE_NOTE}
        showPlatforms={false}
        exportLabel={metrics.configured && metrics.aiReferrals > 0 ? `Export ${fmtInt(metrics.aiReferrals)} referrals` : null}
        exportFilename="agents-referrals.csv"
        exportReport={referralsReport(view)}
        extra={metrics.workspace?.domain ? <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--mut)", background: "rgba(255,255,255,0.045)", borderRadius: "7px", padding: "6px 12px" }}>{metrics.workspace.domain}</span> : undefined}
      />
      <AgentsTabs />
      <div className="frame-p2-referrals">
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {!metrics.configured ? (
            <SetupState note="Referrals attribute human visits that started in an AI answer. Set up your brand and domain, and every click-through the snippet captures will be reported here." />
          ) : (
            <>
              <CaptureBanner view={view} events={metrics.aiReferrals} subject="AI referrals" />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
                <KpiCard
                  label="Human referrals from AI"
                  value={fmtInt(metrics.aiReferrals)}
                  metricId="ai_referrals"
                  sub={days === 0 ? "none captured yet" : `${days} ${days === 1 ? "day" : "days"} with referrals`}
                />
                <KpiCard
                  label="Referring platforms"
                  value={fmtInt(view.referralSources.length)}
                  hint="Assistants that sent you a visitor"
                  sub={`of ${PIPELINE.referralSources} the snippet recognises`}
                />
                <KpiCard
                  label="Landing pages"
                  value={fmtInt(view.landingPages.length)}
                  hint="Pages AI visitors arrived on"
                  sub={view.landingPages.length ? "distinct first pages" : "none reached yet"}
                />
                <KpiCard
                  label="Top platform"
                  value={top ? top.key : "—"}
                  hint="Which AI sent the most people"
                  valueColor={top ? undefined : "var(--fnt)"}
                  sub={top ? `${fmtInt(top.count)} ${top.count === 1 ? "referral" : "referrals"} · ${top.share}%` : "no referral captured yet"}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 372px", gap: "14px" }}>
                <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "17px 19px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>
                      {"Referred humans by platform"}
                      <Hint text="Which AI sent the most people" />
                    </div>
                    <div style={{ display: "flex", gap: "14px", fontSize: "11.5px", color: "var(--mut)" }}>
                      {view.referralSeries.map((s) => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: "8px", height: "2px", borderRadius: "1px", background: s.color }} />
                          {s.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  {days >= 2 ? (
                    <CrawlTrend series={view.referralSeries} labels={view.referralDayLabels} width={700} height={190} />
                  ) : (
                    <EmptyNote>
                      {days === 1
                        ? `One day of captured referrals so far (${view.referralDayLabels[0]}, ${fmtInt(metrics.aiReferrals)} ${metrics.aiReferrals === 1 ? "visit" : "visits"}). A daily trend needs two days — it draws itself once tomorrow's clicks land.`
                        : "No AI-referred visit captured yet, so there is no daily trend to draw. The snippet is live on every page of this deployment."}
                    </EmptyNote>
                  )}
                </div>

                <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "17px 19px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>
                      {"Measurement"}
                      <Hint text="Where these visitor numbers come from" />
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <Hint text="First-party capture, running on this deployment" align="right" size={12} />
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "600",
                          color: view.store.durable ? "#4cb782" : "#e8b34b",
                          border: `1px solid ${view.store.durable ? "rgba(76,183,130,.4)" : "rgba(232,179,75,.4)"}`,
                          borderRadius: "4px",
                          padding: "2px 7px",
                        }}
                      >
                        {view.store.durable ? "DURABLE" : "IN-MEMORY"}
                      </span>
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginTop: "14px",
                      padding: "11px 13px",
                      background: "var(--bg0)",
                      border: "1px solid var(--brd)",
                      borderRadius: "8px",
                    }}
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
                        fontSize: "9px",
                        fontWeight: "700",
                        color: "var(--mut)",
                      }}
                    >
                      {"JS"}
                    </div>
                    <div>
                      <div style={{ fontSize: "12.5px", fontWeight: "500" }}>{"/snippet.js → /api/collect"}</div>
                      <div style={{ fontSize: "10.5px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>
                        {`collecting since ${dateTime(view.since)}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--mut)", lineHeight: "1.6", marginTop: "12px" }}>
                    {`Cookieless and session-deduped: a visit counts when the referrer or a utm_source tag names one of the ${PIPELINE.referralSources} assistants in the catalog. Assistants strip referrers on a large share of clicks, so `}
                    <span style={{ color: "var(--tx)", fontWeight: "500" }}>{"these counts are a floor, never a ceiling"}</span>
                    {"."}
                  </div>
                  <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--brd)", fontSize: "11.5px", color: "var(--fnt)", lineHeight: "1.7" }}>
                    {view.store.durable
                      ? `Store: ${view.store.label}.`
                      : `Store: ${view.store.label} — a redeploy or a cold start clears the buffer. Attach a KV/Upstash env pair to make it durable.`}
                    <br />
                    {`Last referral: ${view.referralEvents[0] ? ago(view.referralEvents[0].ts) : "none yet"}`}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <ReferringPlatformCard rows={view.referralSources.map((s) => ({ name: s.key, count: s.count, share: s.share }))} />
                <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ padding: "15px 19px 11px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>
                    {"Landing pages"}
                    <Hint text="Pages AI visitors land on first" />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr .8fr .8fr",
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
                  </div>
                  {view.landingPages.length === 0 ? (
                    <EmptyNote>{"No AI-referred visitor has landed on a page yet."}</EmptyNote>
                  ) : (
                    view.landingPages.slice(0, 8).map((p, i) => (
                      <div
                        key={p.key}
                        className="row-hover"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2fr .8fr .8fr",
                          alignItems: "center",
                          padding: "10px 19px",
                          fontSize: "12.5px",
                          fontVariantNumeric: "tabular-nums",
                          ...(i > 0 ? { borderTop: "1px solid var(--brd)" } : {}),
                        }}
                      >
                        <span style={{ color: "var(--tx)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.key}</span>
                        <span style={{ fontWeight: "600" }}>{fmtInt(p.count)}</span>
                        <span style={{ color: "var(--mut)" }}>{`${p.share}%`}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
