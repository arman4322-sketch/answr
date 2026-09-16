import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import LockedPreview from "@/components/app/LockedPreview";
import InsightsTabs from "../InsightsTabs";
import PreviewLayout from "./PreviewLayout";
import { getLiveMetrics } from "@/lib/live/metrics";
import { getEnrichedMetrics } from "@/lib/live/enriched";
import SentimentLive from "./SentimentLive";
import { capabilitySource } from "@/lib/preview/sources";
import { sentimentSpec } from "../reports";

export const metadata: Metadata = { title: "Sentiment · Answer Engine Insights" };
export const dynamic = "force-dynamic";

/* Answer Engine Insights — Sentiment.

   LIVE once the classification pass has run: lib/live/classify labels each
   stored answer's tone and lib/live/enriched counts the split, the themes and
   the per-engine positivity. Until anything is classified the route falls back
   to the dimmed illustrative preview below.

   That fallback is a DIMMED ILLUSTRATIVE PREVIEW rather than an empty panel:
   ./PreviewLayout draws the screen's real shape — the
   positive/neutral/negative split, the sentiment-over-time line, the themes
   table and the annotated answer receipt — with neutral placeholder values, and
   <LockedPreview> wraps it. The wrapper owns every honesty guarantee: the gold
   "Preview · illustrative — not measured data" badge, the aria-hidden / inert
   preview layer, the 28%-opacity greyscale dimming, the hover tooltip naming
   the data source, and the panel explaining what it would take to enable the
   capability (lib/preview/sources.ts, key "sentiment").

   The illustrative figures exist ONLY inside that wrapper. The topbar, the
   sub-nav and the route are unchanged; Export still downloads the not-collected
   report (../reports.ts). */
export default async function Page() {
  const [m, e] = await Promise.all([getLiveMetrics(), getEnrichedMetrics()]);
  const brand = m.workspace?.brand ?? "Your brand";
  const slug = (m.workspace?.brand ?? "workspace").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace";
  const source = capabilitySource("sentiment");

  return (
    <div className="frame-p2-sentiment">
      <Topbar
        crumb={["Answer Engine Insights", "Sentiment"]}
        brand={brand}
        showDateRange={false}
        showPlatforms={false}
        exportFilename={`${slug}-insights-sentiment-not-collected.csv`}
        exportReport={sentimentSpec}
      />
      <InsightsTabs />
      {e.hasSentiment ? (
        <SentimentLive e={e} brand={brand} />
      ) : (
        source && (
          <LockedPreview source={source}>
            <PreviewLayout brand={brand} />
          </LockedPreview>
        )
      )}
    </div>
  );
}
