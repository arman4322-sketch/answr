import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import LockedPreview from "@/components/app/LockedPreview";
import InsightsTabs from "../InsightsTabs";
import PreviewLayout from "./PreviewLayout";
import AudiencesLive from "./AudiencesLive";
import SegmentPassButton from "../SegmentPassButton";
import { getLiveMetrics } from "@/lib/live/metrics";
import { getSegmentMetrics } from "@/lib/live/segments";
import { capabilitySource } from "@/lib/preview/sources";

export const metadata: Metadata = { title: "Audiences · Answer Engine Insights" };
export const dynamic = "force-dynamic";

/* Answer Engine Insights — Audiences.

   LIVE once an audience sampling pass has run: lib/sampler/segments asks each
   tracked prompt with the audience's persona sentence prepended, and
   lib/live/segments scores those runs with the same scorer and entity matcher as
   the headline numbers.

   The claim this screen must not overstate is different from the Regions one.
   No answer engine exposes a "who is asking" parameter, so an audience figure is
   never a located or authenticated measurement — it is prompt framing, always.
   ./AudiencesLive says that once, near the top, and prints each persona sentence
   verbatim so the reader can see exactly what was asked.

   Until any audience has been sampled the route falls back to the DIMMED
   ILLUSTRATIVE PREVIEW: ./PreviewLayout draws the screen's real shape with
   neutral placeholder values and <LockedPreview> wraps it, owning every honesty
   guarantee — the gold "Preview · illustrative — not measured data" badge, the
   aria-hidden / inert preview layer, the 28%-opacity greyscale dimming, the
   hover tooltip naming the data source and the panel explaining what the
   capability needs (lib/preview/sources.ts, key "audiences"). The illustrative
   figures exist ONLY inside that wrapper; the panel above it is real and carries
   the buttons that define and measure audiences.

   Export stays off: there is no report spec for this screen. */
export default async function Page() {
  const [m, seg] = await Promise.all([getLiveMetrics(), getSegmentMetrics("audience")]);
  const brand = m.workspace?.brand ?? "Your brand";
  const source = capabilitySource("audiences");
  const defined = seg.rows.length;

  return (
    <div className="frame-p2-audiences">
      <Topbar
        crumb={["Answer Engine Insights", "Audiences"]}
        brand={brand}
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
      />
      <InsightsTabs />
      {seg.hasData ? (
        <AudiencesLive m={seg} brand={brand} />
      ) : (
        <>
          <div
            style={{
              padding: "22px clamp(14px, 4vw, 26px) 0",
              maxWidth: "1100px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                background: "var(--bg1)",
                border: "1px solid var(--brd)",
                borderRadius: "12px",
                padding: "18px 20px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>
                {defined === 0 ? "No audiences are defined yet" : "No audience has been sampled yet"}
              </h2>
              <p style={{ margin: "7px 0 0", fontSize: "12.5px", lineHeight: 1.6, color: "var(--tx)" }}>
                No answer engine accepts a searcher persona, so an audience can only ever be measured as prompt framing:
                the same tracked prompts, asked the way that buyer would ask them, with the persona sentence prepended
                to the question word for word. That is a real and repeatable measurement, but it is framing, and every
                figure this screen shows will say so.
              </p>
              {defined > 0 && (
                <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {seg.rows.map((r) => (
                    <li key={r.id} style={{ fontSize: "11.5px", color: "var(--mut)", lineHeight: 1.6 }}>
                      <strong style={{ fontWeight: 600 }}>{r.label}</strong>
                      {r.persona && <span style={{ color: "var(--fnt)" }}> — &ldquo;{r.persona}&rdquo;</span>}
                    </li>
                  ))}
                </ul>
              )}
              {seg.pending.length > 0 && (
                <p style={{ margin: "8px 0 0", fontSize: "11.5px", lineHeight: 1.6, color: "var(--fnt)" }}>
                  Defined and waiting — nothing has been measured for
                  {seg.pending.length === 1 ? " this audience" : " these audiences"} yet, which is not the same as a 0%.
                </p>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", marginTop: "14px" }}>
                {defined === 0 && (
                  <SegmentPassButton
                    kind="audience"
                    action="suggest"
                    label="Generate audiences"
                    busyLabel="Proposing audiences…"
                    hint="Asks the connected model for four buyer segments for this brand."
                    primary
                  />
                )}
                <SegmentPassButton
                  kind="audience"
                  action="sample"
                  label="Run an audience pass"
                  busyLabel="Running the pass…"
                  hint="Several minutes — 3 prompts × every audience × every connected lane."
                  promptLimit={3}
                  primary={defined > 0}
                />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: "11.5px", color: "var(--fnt)" }}>
              Below: an illustrative preview of the populated screen. Every figure in it is placeholder, not measured.
            </p>
          </div>
          {source && (
            <LockedPreview source={source}>
              <PreviewLayout brand={brand} />
            </LockedPreview>
          )}
        </>
      )}
    </div>
  );
}
