import Link from "next/link";
import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { getLiveMetrics } from "@/lib/live/metrics";
import InsightsTabs from "./InsightsTabs";
import AeiTrend from "./AeiTrend";
import { topicsSpec } from "./reports";
import { historyNote, int, pct, s, stampUTC } from "./aei-format";

export const metadata: Metadata = { title: "Answer Engine Insights" };
export const dynamic = "force-dynamic";

/* Answer Engine Insights — the main screen, on live data.

   Server component: one getLiveMetrics() call feeds the whole screen, so there
   is a single source of truth and nothing is assembled in the browser. The
   lib/data/insights fixtures are gone.

   What is measured, and is therefore rendered:
   - the daily visibility / share-of-voice series (hidden below two sampled days,
     because one point is not a trend),
   - the brand comparison, from the tracked brand set's measured mentions,
   - per-platform visibility, from the engines that actually answered.

   What is NOT measured, and is therefore not rendered: anything per topic. The
   sampler stores prompts without a subject tag, so "Visibility by topic ×
   platform", the Topics table and "Topic movers" had no live source at all.
   They are replaced by one panel that says exactly what would have to exist —
   no estimated heatmap, no invented per-topic deltas.

   Honest scope: the topbar's date-range and platform pills are not rendered.
   They re-slice a 30-day fixture window that no longer backs this screen; the
   scope chip states the history the corpus really has. The sub-tab nav is
   untouched, so Topics / Regions / Audiences / Shopping / Sentiment still
   navigate. */

const CARD: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "18px 20px",
};

function CardNote({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        border: "1px dashed var(--brd)",
        borderRadius: "8px",
        background: "var(--bg0)",
        padding: "16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
      }}
    >
      <div style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--tx)" }}>{title}</div>
      <div style={{ fontSize: "11.5px", color: "var(--mut)", lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}

export default async function Page() {
  const m = await getLiveMetrics();
  const brand = m.workspace?.brand ?? "Your brand";
  const slug = (m.workspace?.brand ?? "workspace").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const scope = !m.configured
    ? "Not set up"
    : !m.hasData
      ? "Collecting · no runs yet"
      : `${historyNote(m.days)}${m.lastRunAt ? ` · last run ${stampUTC(m.lastRunAt)}` : ""}`;

  const answersInLatestRun = m.platforms.reduce((t, p) => t + p.answers, 0);

  return (
    <div className="frame-aei">
      <Topbar
        crumb={["Answer Engine Insights", "Topics"]}
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
        exportLabel={m.hasData ? `Export ${int(m.answersSampled)} answer${s(m.answersSampled)}` : "Export"}
        exportFilename={`${slug || "workspace"}-insights-${m.days}d.csv`}
        exportReport={m.hasData ? topicsSpec(m) : undefined}
        actionNote={
          m.configured
            ? "Nothing to export yet — the first sample runs tonight."
            : "Nothing to export yet — set up your brand to start collecting data."
        }
      />
      <InsightsTabs />

      {!m.configured ? (
        <div style={{ padding: "24px" }}>
          <div style={{ ...CARD, padding: "26px 28px", maxWidth: "620px" }}>
            <div style={{ fontSize: "15px", fontWeight: 600 }}>Set up your brand to start collecting data</div>
            <div style={{ fontSize: "13px", color: "var(--mut)", lineHeight: 1.7, marginTop: "10px" }}>
              This screen reports how often AI assistants name your brand when they answer your tracked prompts. Nothing
              has been measured yet because no workspace is configured — name the brand, its domain and the competitors
              to track, and the sampler starts collecting answers on its next run. Until then it stays empty rather than
              showing numbers that are not yours.
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
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
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
              <span style={{ color: "var(--tx)", fontWeight: 500 }}>Collecting — first sample runs tonight.</span>{" "}
              {`${brand} is configured with ${int(m.promptsTracked)} tracked prompt${s(m.promptsTracked)}. Nothing has been sampled yet, so this screen has no figures to show — not because visibility is zero.`}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "16px" }}>
            {/* ── visibility over time — the sampled series only ── */}
            <div style={CARD}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "14.5px", fontWeight: 600 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      {"Visibility — all tracked prompts"}
                      <Hint text="How often AI mentions you when people ask" />
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>
                    {`% of sampled AI answers naming ${brand}, per day the sampler ran`}
                  </div>
                </div>
                {m.series.length >= 2 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "14px",
                      fontSize: "11px",
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--mut)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "8px", height: "2px", background: "var(--ac)" }} />
                      {"Visibility"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "8px", height: "2px", background: "#7fa7d9" }} />
                      {"Share of voice"}
                    </div>
                  </div>
                )}
              </div>

              {m.series.length >= 2 ? (
                <AeiTrend series={m.series} brand={brand} days={m.days} />
              ) : (
                <div style={{ marginTop: "14px" }}>
                  <CardNote
                    title={m.hasData ? `Collecting history — ${historyNote(m.days)}` : "Collecting — first sample runs tonight"}
                    body={
                      m.hasData
                        ? `A trend needs at least two sampled days. Today's measured figures are beside this card; the line appears after the next run. Current visibility ${pct(m.visibilityScore)}, share of voice ${pct(m.shareOfVoice)}.`
                        : "Nothing has been sampled yet. This chart draws its first line once two days of runs exist."
                    }
                  />
                </div>
              )}
            </div>

            {/* ── brand comparison — measured mentions, no per-brand trend ── */}
            <div style={CARD}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Brand visibility"}</div>
                <Hint text="Your slice of brand mentions versus rivals" align="right" />
              </div>
              <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>
                {"Share of all tracked-brand mentions in sampled answers"}
              </div>

              {m.brands.length === 0 ? (
                <div style={{ marginTop: "14px" }}>
                  <CardNote
                    title="Collecting — first sample runs tonight"
                    body="Your brand and its tracked competitors appear here with their measured mention counts as soon as the first answers land."
                  />
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", marginTop: "12px" }}>
                    {m.brands.map((b, i) => (
                      <div
                        key={b.name}
                        className="row-hover"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                          padding: "11px 0",
                          borderBottom: i === m.brands.length - 1 ? undefined : "1px solid var(--brd)",
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}>
                            <span
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "2px",
                                background: b.isBrand ? "var(--ac)" : "#7fa7d9",
                                flex: "none",
                              }}
                            />
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</span>
                            {b.isBrand && (
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 600,
                                  color: "#b3a7f8",
                                  background: "rgba(142,124,242,0.16)",
                                  borderRadius: "4px",
                                  padding: "2px 6px",
                                }}
                              >
                                {"You"}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "11px", fontVariantNumeric: "tabular-nums", color: "var(--fnt)", marginTop: "2px" }}>
                            {`${int(b.mentions)} answer${s(b.mentions)} naming it`}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "none" }}>
                          <span style={{ width: "70px", height: "4px", background: "var(--bg2)", borderRadius: "2px", display: "inline-block" }}>
                            <span
                              style={{
                                display: "block",
                                width: `${Math.max(0, Math.min(100, Math.round(b.share)))}%`,
                                height: "4px",
                                background: b.isBrand ? "var(--ac)" : "#7fa7d9",
                                borderRadius: "2px",
                              }}
                            />
                          </span>
                          <span style={{ fontSize: "12.5px", fontWeight: 500, fontVariantNumeric: "tabular-nums", width: "48px", textAlign: "right" }}>
                            {pct(b.share)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--fnt)", lineHeight: 1.55, marginTop: "12px" }}>
                    {`Counted per sampled answer across ${historyNote(m.days)}; rows sum to 100%. Per-brand change over time is not shown — the store keeps competitor mentions in aggregate, not as a daily series per brand.`}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── per-platform visibility — engines that actually answered ── */}
          <div style={CARD}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Visibility by platform"}</div>
                <Hint text="How often each AI mentions you" />
              </div>
              <div style={{ fontSize: "11px", fontVariantNumeric: "tabular-nums", color: "var(--fnt)" }}>
                {`answers naming ${brand} ÷ answers that platform returned`}
              </div>
            </div>

            {m.platforms.length === 0 ? (
              <div style={{ marginTop: "16px" }}>
                <CardNote
                  title={m.hasData ? "No platform answers in the latest run" : "Collecting — first sample runs tonight"}
                  body="Each engine appears here as soon as it returns an answer for one of your tracked prompts. Platforms that have never answered are not listed rather than shown at zero."
                />
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
                  {m.platforms.map((p) => (
                    <div className="row-hover" key={p.provider}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "6px" }}>
                        <span>{p.label}</span>
                        <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                          {`${pct(p.visibility)} `}
                          <span style={{ color: "var(--fnt)", fontWeight: 500, fontSize: "11.5px" }}>
                            {`${int(p.appearances)}/${int(p.answers)}`}
                          </span>
                        </span>
                      </div>
                      <div style={{ height: "4px", background: "var(--bg2)", borderRadius: "2px" }}>
                        <div style={{ width: `${Math.round(p.visibility)}%`, height: "4px", background: "var(--ac)", borderRadius: "2px" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "11px", color: "var(--fnt)", lineHeight: 1.55, marginTop: "14px" }}>
                  {`${int(answersInLatestRun)} answer${s(answersInLatestRun)} from ${int(m.platforms.length)} platform${s(m.platforms.length)} in the latest run of each tracked prompt. Per-platform trends need per-platform daily history, which the store does not keep.`}
                </div>
              </>
            )}
          </div>

          {/* ── the topic breakdowns: no live source, stated plainly ── */}
          <div style={{ ...CARD, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Topic breakdowns aren't collecting data yet"}</div>
              <Hint text="What this screen would need to report per subject" />
            </div>
            <div style={{ fontSize: "13px", color: "var(--mut)", lineHeight: 1.7, marginTop: "10px", maxWidth: "820px" }}>
              This needs per-prompt topic tagging in the sampler, which it doesn&apos;t do yet — prompts are stored
              without a subject, so sampled answers cannot be grouped into topics. No estimated figures are shown.
            </div>
            <div style={{ fontSize: "12px", color: "var(--fnt)", lineHeight: 1.65, marginTop: "12px", maxWidth: "820px" }}>
              {`Three panels used to sit here: "Visibility by topic × platform", the Topics table and "Topic movers". Each one needed a topic per prompt to compute, so they are gone rather than estimated. The figures above are topic-agnostic: they cover all ${int(m.promptsTracked)} tracked prompt${s(m.promptsTracked)} together.`}
            </div>
            <div style={{ display: "flex", gap: "9px", marginTop: "16px", flexWrap: "wrap" }}>
              <Link
                href="/app/prompts"
                style={{
                  padding: "8px 14px",
                  background: "var(--bg0)",
                  border: "1px solid var(--brd)",
                  borderRadius: "7px",
                  color: "var(--tx)",
                  fontSize: "12.5px",
                  fontWeight: 500,
                }}
              >
                {"See tracked prompts →"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
