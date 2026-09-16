import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import LockedPreview from "@/components/app/LockedPreview";
import InsightsTabs from "../InsightsTabs";
import PreviewLayout from "./PreviewLayout";
import RegionsLive from "./RegionsLive";
import SegmentPassButton from "../SegmentPassButton";
import { getLiveMetrics } from "@/lib/live/metrics";
import { getSegmentMetrics } from "@/lib/live/segments";
import { currentWorkspaceId } from "@/lib/tenant";
import { capabilitySource } from "@/lib/preview/sources";
import { regionsSpec } from "../reports";

export const metadata: Metadata = { title: "Regions · Answer Engine Insights" };
export const dynamic = "force-dynamic";

/* Answer Engine Insights — Regions.

   LIVE once a regional sampling pass has run: lib/sampler/segments asks each
   tracked prompt from each tracked region — through the lane's own location
   parameter where one exists, and with the location stated in the question where
   it does not — and lib/live/segments scores the stored runs per region with the
   same scorer and entity matcher as the headline numbers.

   ./RegionsLive renders that, and it is responsible for the one claim this
   screen could overstate: a regional figure is only a located measurement when
   the lane searched from the region. The native/stated split is on the screen,
   overall and per row, and a region that has never been sampled is listed
   separately rather than shown as 0%.

   Until any region has been sampled the route falls back to the DIMMED
   ILLUSTRATIVE PREVIEW: ./PreviewLayout draws the screen's real shape with
   neutral placeholder values and <LockedPreview> wraps it, owning every honesty
   guarantee — the gold "Preview · illustrative — not measured data" badge, the
   aria-hidden / inert preview layer, the 28%-opacity greyscale dimming, the
   hover tooltip naming the data source and the panel explaining what the
   capability needs (lib/preview/sources.ts, key "regions"). The illustrative
   figures exist ONLY inside that wrapper; the panel above it is real and carries
   the button that starts a pass.

   Export: the not-collected report (../reports.ts) still describes regional
   sampling as something the pipeline does not do, so it is offered only while
   that is true — once there is live data the stale report is not offered. */
export default async function Page() {
  // Resolve the tenant once so both reads describe the same workspace.
  const wsId = await currentWorkspaceId();
  const [m, seg] = await Promise.all([getLiveMetrics(wsId), getSegmentMetrics("region", wsId)]);
  const brand = m.workspace?.brand ?? "Your brand";
  const slug = (m.workspace?.brand ?? "workspace").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace";
  const source = capabilitySource("regions");

  return (
    <div className="frame-p2-regions">
      <Topbar
        crumb={["Answer Engine Insights", "Regions"]}
        brand={brand}
        showDateRange={false}
        showPlatforms={false}
        exportLabel={seg.hasData ? null : "Export"}
        exportFilename={`${slug}-insights-regions-not-collected.csv`}
        exportReport={regionsSpec}
      />
      <InsightsTabs />
      {seg.hasData ? (
        <RegionsLive m={seg} brand={brand} />
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
              <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>No region has been sampled yet</h2>
              <p style={{ margin: "7px 0 0", fontSize: "12.5px", lineHeight: 1.6, color: "var(--tx)" }}>
                Regional figures need their own sampling pass: the same tracked prompts, asked again from each region.
                Perplexity, OpenAI, Anthropic and the Google AI Overviews lane take a location parameter, so those
                searches genuinely run from the region. Google Gemini has none, so for that lane the location is only
                stated in the wording of the question — a weaker measurement, which the screen counts and labels
                separately once there is data.
              </p>
              {seg.pending.length > 0 && (
                <p style={{ margin: "8px 0 0", fontSize: "11.5px", lineHeight: 1.6, color: "var(--fnt)" }}>
                  Tracked and waiting: {seg.pending.join(", ")}. Nothing has been measured for
                  {seg.pending.length === 1 ? " it" : " them"} yet, which is not the same as a 0%.
                </p>
              )}
              <div style={{ marginTop: "14px" }}>
                <SegmentPassButton
                  kind="region"
                  action="sample"
                  label="Run a regional pass"
                  busyLabel="Running the pass…"
                  hint="Several minutes — 3 prompts × every tracked region × every connected lane."
                  promptLimit={3}
                  primary
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
