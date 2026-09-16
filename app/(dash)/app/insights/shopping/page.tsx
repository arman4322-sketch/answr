import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import LockedPreview from "@/components/app/LockedPreview";
import InsightsTabs from "../InsightsTabs";
import PreviewLayout from "./PreviewLayout";
import { getLiveMetrics } from "@/lib/live/metrics";
import { capabilitySource } from "@/lib/preview/sources";
import { shoppingSpec } from "../reports";

export const metadata: Metadata = { title: "Shopping · Answer Engine Insights" };
export const dynamic = "force-dynamic";

/* Answer Engine Insights — Shopping.

   Nothing on this route is measured. Two things the pipeline does not have are
   needed before a recommendation rate exists at all: a purchase-intent prompt
   set, and a product catalog to match named products against.

   Rather than an empty panel, the route now renders a DIMMED ILLUSTRATIVE
   PREVIEW: ./PreviewLayout draws the screen's real shape — the recommendation
   rate, the attribute-influence bars, the products table and the
   purchase-intent prompt rows — with neutral placeholder values, and
   <LockedPreview> wraps it. The wrapper owns every honesty guarantee: the gold
   "Preview · illustrative — not measured data" badge, the aria-hidden / inert
   preview layer, the 28%-opacity greyscale dimming, the hover tooltip naming
   the data source, and the panel explaining what it would take to enable the
   capability (lib/preview/sources.ts, key "shopping").

   The illustrative figures exist ONLY inside that wrapper. The topbar, the
   sub-nav and the route are unchanged; Export still downloads the not-collected
   report (../reports.ts) instead of products and rates. */
export default async function Page() {
  const m = await getLiveMetrics();
  const brand = m.workspace?.brand ?? "Your brand";
  const slug = (m.workspace?.brand ?? "workspace").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace";
  const source = capabilitySource("shopping");

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
      {source && (
        <LockedPreview source={source}>
          <PreviewLayout brand={brand} />
        </LockedPreview>
      )}
    </div>
  );
}
