import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import InsightsTabs from "../../InsightsTabs";
import NotCollectingPanel from "../../NotCollectingPanel";
import { getLiveMetrics } from "@/lib/live/metrics";
import { runningShoesSpec } from "../../reports";

export const metadata: Metadata = { title: "Topic · Answer Engine Insights" };
export const dynamic = "force-dynamic";

/* Answer Engine Insights — topic detail.

   This route was a hard-coded demo topic page: a fixed topic, a fixed prompt
   count, a fixed visibility trend and a topic-scoped brand rank, all from
   a shipped fixture, all describing a brand that is not the workspace.
   None of it survives. Topic detail needs tracked prompts to carry topic tags,
   and the sampler doesn't tag them — every prompt is sampled and scored for the
   workspace as a whole, so a per-topic figure cannot be computed.

   The route still renders (links to it from elsewhere in the app stay alive)
   with its topbar and the Insights sub-nav, which keeps "Topics" active for
   /app/insights/topics/*. It names what is missing and shows nothing else;
   Export downloads the not-collected report (../../reports.ts). */
export default async function Page() {
  const m = await getLiveMetrics();
  const brand = m.workspace?.brand ?? "Your brand";
  const slug = (m.workspace?.brand ?? "workspace").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace";

  return (
    <div className="frame-m-topic">
      <Topbar
        crumb={["Answer Engine Insights", "Topics"]}
        brand={brand}
        showDateRange={false}
        showPlatforms={false}
        exportFilename={`${slug}-insights-topic-not-collected.csv`}
        exportReport={runningShoesSpec}
      />
      <InsightsTabs />
      <NotCollectingPanel
        title="Topic breakdowns aren't collecting data yet"
        requires="This needs topic tagging of tracked prompts, which the sampler doesn't perform — every prompt is sampled and scored for the workspace as a whole, so visibility cannot be split by topic."
      />
    </div>
  );
}
