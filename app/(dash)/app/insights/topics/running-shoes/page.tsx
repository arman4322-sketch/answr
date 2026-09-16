import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import InsightsTabs from "../../InsightsTabs";
import TopicDetailPreview from "../../TopicDetailPreview";
import LockedPreview from "@/components/app/LockedPreview";
import { capabilitySource } from "@/lib/preview/sources";
import { getLiveMetrics } from "@/lib/live/metrics";
import { runningShoesSpec } from "../../reports";

export const metadata: Metadata = { title: "Topic · Answer Engine Insights" };
export const dynamic = "force-dynamic";

/* Answer Engine Insights — topic detail.

   This route was a hard-coded demo topic page: a fixed topic, a fixed prompt
   count, a fixed visibility trend and a topic-scoped brand rank, all from a
   shipped fixture, all describing a brand that is not the workspace. None of
   that data survives — topic detail needs tracked prompts to carry topic tags,
   and the sampler doesn't tag them, so a per-topic figure cannot be computed.

   What renders now is an ILLUSTRATIVE PREVIEW of the same screen: <LockedPreview>
   dims it to 28%, greyscales it, marks it inert/aria-hidden and puts a permanent
   "not measured data" badge plus the full "what's needed to enable this" research
   panel (lib/preview/sources.ts → "topics") on top. Nothing inside names a real
   brand — the topic is "Example topic" and the rivals are "Brand A" /
   "Competitor A" — and those placeholders exist nowhere outside the wrapper.

   The route, its topbar and the Insights sub-nav are unchanged, so "Topics"
   stays active for /app/insights/topics/* and Export still downloads the
   not-collected report (../../reports.ts). */
export default async function Page() {
  const m = await getLiveMetrics();
  const source = capabilitySource("topics");
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
      {source && (
        <LockedPreview source={source}>
          <TopicDetailPreview platforms={m.platforms.map((p) => p.label)} />
        </LockedPreview>
      )}
    </div>
  );
}
