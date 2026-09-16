import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import InsightsTabs from "../InsightsTabs";
import NotCollectingPanel from "../NotCollectingPanel";
import { getLiveMetrics } from "@/lib/live/metrics";

export const metadata: Metadata = { title: "Audiences · Answer Engine Insights" };
export const dynamic = "force-dynamic";

/* Answer Engine Insights — Audiences.

   The segment cards, their trends, the "rank in segment" list, the comparison
   table and the "+ New segment" flow were all driven by a shipped fixture.
   Nothing in the live corpus can replace them: the sampler runs each tracked
   prompt as written, once, with no persona variants, so there is no sampled
   answer that belongs to one audience rather than another.

   The route keeps its topbar and sub-nav and states what is missing. The
   client board and its modal are deleted along with the fixture, and the Export
   button is gone — there is no report spec for a feature with no data. */
export default async function Page() {
  const m = await getLiveMetrics();
  const brand = m.workspace?.brand ?? "Your brand";

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
      <NotCollectingPanel
        title="Audiences isn't collecting data yet"
        requires="This needs persona-variant prompt runs, which the sampler doesn't perform — each tracked prompt is asked once, as written, so no sampled answer can be split by audience segment."
      />
    </div>
  );
}
