import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import InsightsTabs from "../InsightsTabs";
import NotCollectingPanel from "../NotCollectingPanel";
import { getLiveMetrics } from "@/lib/live/metrics";
import { regionsSpec } from "../reports";

export const metadata: Metadata = { title: "Regions · Answer Engine Insights" };
export const dynamic = "force-dynamic";

/* Answer Engine Insights — Regions.

   Every figure this screen used to show (the regional trend, the region rank,
   the world-view choropleth, the by-region table and the "translation gap"
   note) came from a shipped 30-day fixture, written for a brand that is
   not the workspace. There is no live equivalent: the sampler runs each tracked
   prompt once against one default locale, so no answer is attributable to a
   country or language and no amount of derivation would make one.

   The route therefore keeps its topbar and sub-nav and says so. The date-range
   and platform pills are gone with the data they used to slice; Export now
   downloads the not-collected report (../reports.ts), which states the same
   requirement and carries no figures. */
export default async function Page() {
  const m = await getLiveMetrics();
  const brand = m.workspace?.brand ?? "Your brand";
  const slug = (m.workspace?.brand ?? "workspace").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace";

  return (
    <div className="frame-p2-regions">
      <Topbar
        crumb={["Answer Engine Insights", "Regions"]}
        brand={brand}
        showDateRange={false}
        showPlatforms={false}
        exportFilename={`${slug}-insights-regions-not-collected.csv`}
        exportReport={regionsSpec}
      />
      <InsightsTabs />
      <NotCollectingPanel
        title="Regional visibility isn't collecting data yet"
        requires="This needs region-scoped sampling runs, which the nightly sampler doesn't perform — it asks every tracked prompt once in a single default locale, so no answer can be attributed to a country or language."
      />
    </div>
  );
}
