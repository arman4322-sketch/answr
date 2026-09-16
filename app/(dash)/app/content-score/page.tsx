import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import { getLiveMetrics } from "@/lib/live/metrics";
import NotAvailable, { SetupNotice } from "./NotAvailable";
import { contentScoreSpec } from "./report";

/* Optimize — Content score.

   The whole screen was a fixture: one Nike draft URL, a 68/100 gauge, a "vs. 54
   median for pages on this topic" line, four subscores and three recommendations
   carrying invented lifts. None of it is derivable from what the product
   collects — the sampler queries the assistants with the workspace's tracked
   prompts and stores their answers and cited domains; it never fetches a page,
   never parses one, and keeps no corpus of the pages that win citations, so
   there is nothing to grade a draft against.

   So the route now renders the honest panel (./NotAvailable) and the Export
   downloads the not-collected report (./report.ts). The topbar and the shared
   nav stay intact, so navigation is unchanged. The scoring form went with the
   fixture: a "Score it" button that cannot score would be the same claim in
   another shape. */

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
      {m.configured ? <NotAvailable /> : <SetupNotice />}
    </div>
  );
}
