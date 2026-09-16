import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import InsightsTabs from "../InsightsTabs";
import NotCollectingPanel from "../NotCollectingPanel";
import { getLiveMetrics } from "@/lib/live/metrics";
import { sentimentSpec } from "../reports";

export const metadata: Metadata = { title: "Sentiment · Answer Engine Insights" };
export const dynamic = "force-dynamic";

/* Answer Engine Insights — Sentiment.

   The positive-sentiment headline and trend, the positive/negative split, the
   theme cards, the themes table and the annotated "answer receipt" were all
   shipped fixtures. Sampled answers are stored in full, but
   nothing in the pipeline reads them for tone: there is no classification pass,
   so no answer carries a sentiment label and no split can be counted.

   The route keeps its topbar and sub-nav. Export no longer offers the "186
   answers" that were never sampled — it downloads the not-collected report
   (../reports.ts). */
export default async function Page() {
  const m = await getLiveMetrics();
  const brand = m.workspace?.brand ?? "Your brand";
  const slug = (m.workspace?.brand ?? "workspace").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace";

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
      <NotCollectingPanel
        title="Sentiment isn't collecting data yet"
        requires="This needs a sentiment classification pass over sampled answers, which isn't in the pipeline yet — answers are stored and scored for brand mentions and citations only, never for tone."
      />
    </div>
  );
}
