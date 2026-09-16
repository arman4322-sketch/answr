import Link from "next/link";
import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { getLiveMetrics } from "@/lib/live/metrics";
import OverviewTrend from "./OverviewTrend";
import OverviewKpis from "./OverviewKpis";
import PlatformVisibilityCard from "./PlatformVisibilityCard";
import CompetitorSovCard from "./CompetitorSovCard";
import TopSourcesCard from "./TopSourcesCard";
import NameCollisionNotice from "./NameCollisionNotice";
import DemoActionButton from "./DemoActionButton";
import { overviewSpec } from "./report";
import { historyNote, int, s, stampUTC, summaryLines } from "./format";
import "./page.css";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

/* Overview — the flagship dashboard, now fed by real sampled answers.

   Server component: it calls getLiveMetrics() once and hands the result to the
   cards, so there is a single source of truth for the screen and no figure is
   assembled in the browser. The lib/data/* fixtures are gone entirely.

   Three states, explicitly:
   - not configured    → the setup panel below; no cards, no zeros pretending to
                         be measurements.
   - configured, no runs → the full layout with real zeros and a "collecting"
                         line on every card.
   - has data          → the measured values.

   Honest scope: the topbar's date-range and platform pills are not rendered
   here. They re-slice a 30-day fixture that no longer backs this screen; the
   live corpus covers only the days actually sampled, which the scope chip
   states. Trends and deltas come from `series` and disappear below two points
   rather than being invented. */

export default async function Page() {
  const m = await getLiveMetrics();
  const brand = m.workspace?.brand ?? "Your brand";
  const slug = (m.workspace?.brand ?? "workspace").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const scope = !m.configured
    ? "Not set up"
    : !m.hasData
      ? "Collecting · no runs yet"
      : `${historyNote(m.days)}${m.lastRunAt ? ` · last run ${stampUTC(m.lastRunAt)}` : ""}`;

  return (
    <div className="frame-overview">
      <Topbar
        crumb="Overview"
        brand={brand}
        showDateRange={false}
        showPlatforms={false}
        extra={
          <span
            style={{
              fontSize: "11.5px",
              color: "var(--mut)",
              background: "rgba(255,255,255,0.045)",
              borderRadius: "7px",
              padding: "6px 12px",
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            {scope}
          </span>
        }
        exportFilename={`${slug || "workspace"}-overview-${m.days}d.csv`}
        exportReport={m.hasData ? overviewSpec(m) : undefined}
        actionNote={
          m.configured
            ? "Nothing to export yet — no sample has run. Start the first run from Settings › Platforms."
            : "Nothing to export yet — set up your brand to start collecting data."
        }
      />

      {!m.configured ? (
        <div style={{ padding: "22px 24px" }}>
          <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "26px 28px", maxWidth: "620px" }}>
            <div style={{ fontSize: "15px", fontWeight: 600 }}>Set up your brand to start collecting data</div>
            <div style={{ fontSize: "13px", color: "var(--mut)", lineHeight: 1.7, marginTop: "10px" }}>
              This dashboard reports what AI assistants actually say about your brand. Nothing has been measured yet
              because no workspace is configured — name the brand, its domain and the competitors to track, and the
              sampler starts collecting answers on its next run. Until then this screen stays empty rather than showing
              numbers that are not yours.
            </div>
            <div style={{ display: "flex", gap: "9px", marginTop: "18px", flexWrap: "wrap" }}>
              <Link
                href="/onboarding/brand"
                style={{ padding: "9px 15px", background: "var(--ac)", borderRadius: "7px", color: "#0e0e11", fontSize: "12.5px", fontWeight: 600 }}
              >
                Set up your brand →
              </Link>
              <Link
                href="/app/settings"
                style={{ padding: "9px 15px", background: "var(--bg0)", border: "1px solid var(--brd)", borderRadius: "7px", color: "var(--tx)", fontSize: "12.5px", fontWeight: 500 }}
              >
                Open settings
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:"16px"}}>
          {!m.hasData && (
            <div
              role="note"
              style={{
                fontSize: "12px",
                lineHeight: 1.55,
                color: "var(--mut)",
                background: "var(--bg1)",
                border: "1px solid var(--brd)",
                borderRadius: "8px",
                padding: "10px 14px",
              }}
            >
              <span style={{ color: "var(--tx)", fontWeight: 500 }}>No sample has run yet.</span>{" "}
              {`${brand} is configured with ${int(m.promptsTracked)} tracked prompt${s(m.promptsTracked)}. Every number below is zero because nothing has been sampled yet, not because visibility is zero. `}
              <Link href="/app/settings/platforms" style={{ color: "var(--ac)", fontWeight: 500 }}>
                {"Start the first run from Settings › Platforms →"}
              </Link>
            </div>
          )}

          <OverviewKpis m={m} />

          {/* Sits under the KPIs it explains: those numbers exclude answers that
              named the brand but meant someone else. Renders nothing at zero. */}
          <NameCollisionNotice m={m} />

          <div style={{display:"grid",gridTemplateColumns:"1fr 372px",gap:"14px"}}>
            <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"17px 19px"}}>
              <OverviewTrend series={m.series} days={m.days} brand={brand} configured={m.configured} hasData={m.hasData} />
            </div>
            <PlatformVisibilityCard m={m} />
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 372px",gap:"14px"}}>
            <CompetitorSovCard m={m} />
            <TopSourcesCard m={m} />
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 372px",gap:"14px"}}>
            {/* Was an AI-written weekly narrative. It is now composed only of
                measured values (see summaryLines in ./format) — no claim here
                that the workspace did not produce. */}
            <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"17px 19px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"10px"}}>
                <span style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13.5px",fontWeight:"600"}}>
                  {"Where you stand"}
                  <Hint text="Your sampled numbers, read back in plain English" />
                </span>
                <span style={{fontSize:"10.5px",color:"var(--fnt)",fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap"}}>
                  {m.lastRunAt ? `computed from the run of ${stampUTC(m.lastRunAt)}` : "no runs collected yet"}
                </span>
              </div>
              <div style={{fontSize:"13px",color:"var(--mut)",lineHeight:"1.75",marginTop:"10px",display:"flex",flexDirection:"column",gap:"6px"}}>
                {summaryLines(m).map((line, i) => (
                  <span key={i}>{line}</span>
                ))}
              </div>
            </div>

            <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"17px 19px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                <div style={{fontSize:"13.5px",fontWeight:"600"}}>{"Improve visibility"}</div>
                <Hint text="Quick ways to get mentioned more often" />
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"7px",marginTop:"12px",fontSize:"12.5px"}}>
                {/* These two still have no pipeline behind them — the note says
                    exactly that instead of implying a read-only demo. */}
                <DemoActionButton label="Create content" note="Content drafting isn't wired up yet — nothing was created." />
                <DemoActionButton label="Optimize a page" note="Page optimization isn't wired up yet — nothing was changed." />
                {/* The action count this row used to badge is not part of the
                    live metrics, so the badge is gone rather than guessed. */}
                <Link href="/app/actions" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",color:"var(--tx)"}}>
                  <span style={{fontWeight:"500"}}>{"Review actions"}</span>
                  <span style={{color:"var(--ac)"}}>{"→"}</span>
                </Link>
                <Link href="/app/prompts" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",color:"var(--tx)"}}>
                  <span style={{fontWeight:"500"}}>{"Manage prompts"}</span>
                  <span style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{fontSize:"10.5px",fontWeight:"600",color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"4px",padding:"2px 7px",fontVariantNumeric:"tabular-nums"}}>
                      {`${int(m.promptsTracked)} tracked`}
                    </span>
                    <span style={{color:"var(--ac)"}}>{"→"}</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
