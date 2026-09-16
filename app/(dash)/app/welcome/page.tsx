import Link from "next/link";
import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import KpiCard from "@/components/app/KpiCard";
import Hint from "@/components/ui/Hint";
import { getLiveMetrics } from "@/lib/live/metrics";
import { configuredProviders } from "@/lib/providers/registry";
import FirstRun from "./FirstRun";
import "./page.css";

export const metadata: Metadata = { title: "Welcome" };
export const dynamic = "force-dynamic";

/* Day zero — the screen onboarding lands on.

   It used to be a fixture: "your first prompt run starts tonight", "412 prompts
   across 5 platforms", "first results land within 24 hours — we'll email you",
   a "Run now instead" button that only raised a toast, and a checklist whose
   ticks were hardcoded. None of it was true. There is no email system, 412 was
   a leftover number, and nothing was scheduled for tonight — so a new account
   sat in front of an empty dashboard with no way to fill it.

   What it is now: a server component that reads THIS caller's own workspace and
   its live metrics, plus a client runner that starts the first pull the moment
   the screen mounts. Every figure below comes from the workspace record
   (brand, domain, competitors, prompts), the provider registry (which answer
   lanes actually have keys) or lib/live/metrics (what has actually been
   sampled). Where a value does not exist yet the element says so or is absent —
   nothing is invented and nothing is promised. */

const int = (n: number) => Math.round(n).toLocaleString("en-US");
const s = (n: number) => (n === 1 ? "" : "s");
const pct = (n: number) => `${n.toFixed(1)}%`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** epoch ms → "Sep 16, 18:04 UTC" (UTC keeps SSR and hydration identical) */
function stampUTC(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`;
}

const panel: React.CSSProperties = {
  border: "1px dashed var(--brd)",
  borderRadius: "10px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  textAlign: "center",
  padding: "32px",
  minWidth: 0,
};

const glyph: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  background: "rgba(142,124,242,0.14)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--ac)",
  fontSize: "17px",
  fontWeight: 700,
};

const headline: React.CSSProperties = { fontSize: "15px", fontWeight: 600 };
const body: React.CSSProperties = { fontSize: "12.5px", color: "var(--mut)", maxWidth: "420px", lineHeight: 1.6 };
const cta: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 500,
  borderRadius: "7px",
  padding: "8px 18px",
  marginTop: "4px",
  display: "inline-block",
};

const row: React.CSSProperties = {
  display: "flex",
  gap: "9px",
  alignItems: "center",
  padding: "9px 11px",
  background: "var(--bg0)",
  border: "1px solid var(--brd)",
  borderRadius: "7px",
  minWidth: 0,
};

const tick: React.CSSProperties = {
  width: "14px",
  height: "14px",
  borderRadius: "4px",
  background: "var(--ac)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#0e0f11",
  fontSize: "9px",
  fontWeight: 700,
  flex: "none",
};

const untick: React.CSSProperties = {
  width: "14px",
  height: "14px",
  borderRadius: "4px",
  border: "1px solid var(--brd)",
  flex: "none",
};

const meta: React.CSSProperties = {
  marginLeft: "auto",
  color: "var(--fnt)",
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
  paddingLeft: "8px",
};

/** One setup row. `done` is always read off a real field — never assumed. */
function Step({ done, label, value, href }: { done: boolean; label: string; value?: string; href?: string }) {
  const inner = (
    <>
      <span style={done ? tick : untick} aria-hidden="true">
        {done ? "✓" : ""}
      </span>
      <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{label}</span>
      {value && <span style={meta}>{value}</span>}
      {href && (
        <span style={{ color: "var(--ac)", paddingLeft: value ? "8px" : "0", marginLeft: value ? undefined : "auto" }} aria-hidden="true">
          {"→"}
        </span>
      )}
    </>
  );
  const sr = <span className="wl-sr">{done ? " — done" : " — not done yet"}</span>;
  return href ? (
    <Link href={href} style={{ ...row, color: done ? "var(--tx)" : "var(--mut)" }}>
      {inner}
      {sr}
    </Link>
  ) : (
    <div style={{ ...row, color: done ? "var(--tx)" : "var(--mut)" }}>
      {inner}
      {sr}
    </div>
  );
}

export default async function Page() {
  const m = await getLiveMetrics();
  const ws = m.workspace;

  // The answer lanes this deployment can actually ask — from the registry,
  // against the live environment. Never a fixed list of five.
  const lanes = configuredProviders().map((p) => p.label);

  const prompts = ws?.prompts ?? [];
  const brand = ws?.brand ?? "Your brand";
  const canRun = !!ws && prompts.length > 0 && lanes.length > 0;

  const sub = m.hasData ? undefined : "No answers sampled yet";

  return (
    <div className="frame-m-empty">
      <Topbar crumb="Overview" brand={brand} showDateRange={false} showPlatforms={false} exportLabel={null} />
      <div style={{ padding: "22px 24px", display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "900px",
            maxWidth: "100%",
            background: "var(--bg0)",
            border: "1px solid var(--brd)",
            borderRadius: "12px",
            padding: "22px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            minHeight: "560px",
            boxSizing: "border-box",
          }}
        >
          {/* KPI row only exists once there is a workspace for it to be about.
              With no workspace there is nothing to report, so the row is absent
              rather than four dashes pretending to be a reading. */}
          {ws && (
            <div className="wl-kpis" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: "12px" }}>
              <KpiCard
                label="Visibility score"
                value={m.hasData ? pct(m.visibilityScore) : "—"}
                metricId="visibility_score"
                valueColor={m.hasData ? undefined : "var(--fnt)"}
                sub={sub ?? `From ${int(m.answersSampled)} sampled answer${s(m.answersSampled)}`}
              />
              <KpiCard
                label="Share of voice"
                value={m.hasData ? pct(m.shareOfVoice) : "—"}
                metricId="share_of_voice"
                valueColor={m.hasData ? undefined : "var(--fnt)"}
                sub={sub ?? `${brand} against ${int(ws.competitors.length)} tracked competitor${s(ws.competitors.length)}`}
              />
              <KpiCard
                label="Citations"
                value={m.hasData ? int(m.citationsCount) : "—"}
                metricId="citations_count"
                valueColor={m.hasData ? undefined : "var(--fnt)"}
                sub={sub ?? `${int(m.uniqueCitedDomains)} distinct domain${s(m.uniqueCitedDomains)}`}
              />
              <KpiCard
                label="Avg. position"
                value={m.avgAnswerPosition == null ? "—" : m.avgAnswerPosition.toFixed(1)}
                metricId="avg_answer_position"
                valueColor={m.avgAnswerPosition == null ? "var(--fnt)" : undefined}
                sub={sub ?? (m.avgAnswerPosition == null ? `${brand} has not been named in a sampled answer yet` : `Named first in ${int(m.answerRankFirst)} answer${s(m.answerRankFirst)}`)}
              />
            </div>
          )}

          <div className="wl-body" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: "12px", flex: "1" }}>
            {!ws ? (
              /* Nothing configured — the run has nothing to ask about. */
              <div style={panel}>
                <div style={glyph} aria-hidden="true">
                  {"◆"}
                </div>
                <div style={headline}>{"Set up your brand to start collecting"}</div>
                <div style={body}>
                  {
                    "No workspace is configured for this account, so there is nothing to measure yet. Name your brand, its website and the competitors you want tracked — the first run starts as soon as you finish."
                  }
                </div>
                <Link href="/onboarding/brand" className="btn-ac" style={cta}>
                  {"Set up your brand →"}
                </Link>
              </div>
            ) : m.hasData ? (
              /* Answers are already stored for this workspace. */
              <div style={panel}>
                <div style={glyph} aria-hidden="true">
                  {"✓"}
                </div>
                <div style={headline}>{"Your dashboard has data"}</div>
                <div style={body}>
                  {`${int(m.answersSampled)} answer${s(m.answersSampled)} stored across ${int(m.promptsTracked)} tracked prompt${s(m.promptsTracked)}${m.lastRunAt ? `, last run ${stampUTC(m.lastRunAt)}` : ""}.`}
                </div>
                <Link href="/app/overview" className="btn-ac" style={cta}>
                  {"Open your dashboard →"}
                </Link>
              </div>
            ) : lanes.length === 0 ? (
              /* Configured, but no provider key — the run would ask nobody. */
              <div style={panel}>
                <div style={glyph} aria-hidden="true">
                  {"○"}
                </div>
                <div style={headline}>{"No answer engine is connected"}</div>
                <div style={body}>
                  {
                    "A run asks your tracked prompts of every connected answer engine. None has a key on this deployment, so there is nothing to ask yet."
                  }
                </div>
                <Link href="/app/settings/integrations" className="btn-ac" style={cta}>
                  {"Connect an answer engine →"}
                </Link>
              </div>
            ) : prompts.length === 0 ? (
              /* Configured with no prompt set — nothing to ask. */
              <div style={panel}>
                <div style={glyph} aria-hidden="true">
                  {"○"}
                </div>
                <div style={headline}>{"No prompts to run yet"}</div>
                <div style={body}>
                  {`${brand} is set up, but its prompt set is empty — a run needs questions to ask. Add the prompts you want monitored and the run can start.`}
                </div>
                <Link href="/app/prompts" className="btn-ac" style={cta}>
                  {"Add prompts →"}
                </Link>
              </div>
            ) : (
              /* The real thing: the first pull, started on mount. */
              <FirstRun brand={brand} lanes={lanes} promptCount={prompts.length} />
            )}

            <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "16px", minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: 600 }}>
                {"Your setup"}
                <Hint text="What this workspace has configured" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px", fontSize: "12.5px" }}>
                <Step
                  done={!!ws?.brand}
                  label={ws?.brand ? `Brand set — ${ws.brand}` : "Set your brand"}
                  value={ws ? `${int(ws.competitors.length)} competitor${s(ws.competitors.length)}` : undefined}
                  href={ws ? "/app/settings/workspace" : "/onboarding/brand"}
                />
                <Step
                  done={!!ws?.domain}
                  label={ws?.domain ? "Website connected" : "Connect your website"}
                  value={ws?.domain || undefined}
                  href="/app/settings/workspace"
                />
                <Step
                  done={prompts.length > 0}
                  label={prompts.length > 0 ? "Review your prompts" : "Generate a prompt set"}
                  value={prompts.length > 0 ? `${int(prompts.length)} prompt${s(prompts.length)}` : undefined}
                  href="/app/prompts"
                />
                <Step
                  done={lanes.length > 0}
                  label={lanes.length > 0 ? "Answer engines connected" : "Connect an answer engine"}
                  value={lanes.length > 0 ? `${int(lanes.length)} lane${s(lanes.length)}` : undefined}
                  href="/app/settings/integrations"
                />
              </div>
              {lanes.length > 0 && (
                <div style={{ fontSize: "11px", color: "var(--fnt)", lineHeight: 1.55, marginTop: "12px" }}>
                  {`Every run is asked across ${lanes.join(", ")}.`}
                </div>
              )}
              {!canRun && ws && (
                <div style={{ fontSize: "11px", color: "var(--fnt)", lineHeight: 1.55, marginTop: "12px" }}>
                  {"A run needs a prompt set and at least one connected answer engine."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
