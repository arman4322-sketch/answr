import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import LockedPreview from "@/components/app/LockedPreview";
import { capabilitySource } from "@/lib/preview/sources";
import { getLiveMetrics } from "@/lib/live/metrics";
import SetupNotice from "./SetupNotice";
import ContentScorePreview from "./Preview";
import { contentScoreSpec } from "./report";

/* Optimize — Content score.

   The whole screen was a fixture: one draft URL under a brand this deployment
   does not track, a grade, a topic median, four subscores and three
   recommendations carrying invented lifts. None of it is derivable from what
   the product collects — the sampler queries the assistants with the
   workspace's tracked prompts and stores their answers and cited domains; it
   never fetches a page, never parses one, and keeps no corpus of the pages that
   win citations.

   What renders now is <LockedPreview>: the gauge, the four sub-scores and the
   "raise this score" checklist a scoring pass would fill, drawn at 28% opacity,
   desaturated, inert and aria-hidden, under a permanent "illustrative — not
   measured data" badge, with the overlay explaining what the grade would be
   computed from. The draft is an example.com URL and every figure lives ONLY
   inside that wrapper.

   The topbar and the shared nav stay intact, so navigation is unchanged, and
   Export still downloads the not-collected report (./report.ts). */

export const metadata: Metadata = {
  title: "Content score — Answr",
};

export const dynamic = "force-dynamic";

export default async function ContentScorePage() {
  const m = await getLiveMetrics();
  const brand = m.workspace?.brand ?? "Your brand";
  const slug =
    (m.workspace?.brand ?? "workspace")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "workspace";
  const source = capabilitySource("content-score");

  return (
    <div className="frame-m-score">
      <Topbar
        crumb={["Optimize", "Content score"]}
        brand={brand}
        showDateRange={false}
        showPlatforms={false}
        exportFilename={`${slug}-content-score-not-collected.csv`}
        exportReport={contentScoreSpec(m)}
      />
      {m.configured ? (
        source && (
          <div style={{ padding: "22px 24px" }}>
            <LockedPreview source={source}>
              <ContentScorePreview />
            </LockedPreview>
          </div>
        )
      ) : (
        <SetupNotice />
      )}
    </div>
  );
}
