import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import InsightsTabs from "../InsightsTabs";
import NotCollectingPanel from "../NotCollectingPanel";
import { getLiveMetrics } from "@/lib/live/metrics";
import { shoppingSpec } from "../reports";

export const metadata: Metadata = { title: "Shopping · Answer Engine Insights" };
export const dynamic = "force-dynamic";

/* Answer Engine Insights — Shopping.

   The recommendation-rate headline and trend, the products table, the attribute
   influence bars, the head-to-head comparisons and the "why #2" note were all
   shipped fixtures. Two things the pipeline does not have would
   be needed to measure any of it: a purchase-intent prompt set, and a product
   catalog to match named products against. Without both, a recommendation rate
   cannot be computed — only guessed at, which this screen no longer does.

   The route keeps its topbar and sub-nav. The shopping-platform filter pill is
   gone with the table it used to filter; Export downloads the not-collected
   report (../reports.ts) instead of the fixture's products and rates. */
export default async function Page() {
  const m = await getLiveMetrics();
  const brand = m.workspace?.brand ?? "Your brand";
  const slug = (m.workspace?.brand ?? "workspace").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace";

  return (
    <div className="frame-p2-shopping">
      <Topbar
        crumb={["Answer Engine Insights", "Shopping"]}
        brand={brand}
        showDateRange={false}
        showPlatforms={false}
        exportFilename={`${slug}-insights-shopping-not-collected.csv`}
        exportReport={shoppingSpec}
      />
      <InsightsTabs />
      <NotCollectingPanel
        title="Shopping isn't collecting data yet"
        requires="This needs purchase-intent prompt runs and a product catalog to match recommendations against, neither of which the sampler has — tracked prompts are asked as written and answers are scored for the brand as a whole, not per product."
      />
    </div>
  );
}
