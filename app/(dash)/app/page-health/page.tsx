import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import LockedPreview from "@/components/app/LockedPreview";
import { capabilitySource } from "@/lib/preview/sources";
import { getLiveMetrics } from "@/lib/live/metrics";
import AgentsTabs from "../agents/AgentsTabs";
import { SetupState } from "../agents/TelemetryStates";
import PageHealthPreview from "./Preview";
import { pageHealthSpec } from "./report";

/* Agent Analytics — Page health — route kept, fixtures removed, replaced by a
   locked preview.

   The screen used to open on one hard-coded URL with hard-coded render timings,
   a per-platform table and a fix note naming a bundle size. Nothing in the
   pipeline produces any of it: no probe fetches or renders your pages.

   What renders now is <LockedPreview>: the health KPIs and the per-URL table
   (URL, crawlable, JS-dependent, schema, last crawled) a crawl would fill,
   drawn at 28% opacity, desaturated, inert and aria-hidden, under a permanent
   "illustrative — not measured data" badge, with the overlay naming the crawl
   vendors, integration and pricing behind it. The rows are example.com paths:
   the workspace's own domain is never shown carrying a verdict it has not been
   given, and every value lives ONLY inside that wrapper.

   The route keeps its topbar and the Agent Analytics sub-nav so navigation is
   unchanged. The crumb's brand and the domain chip are read live, and Export
   downloads the not-collected report (./report.ts), which states the same
   requirement and carries no figures. */

export const metadata: Metadata = {
  title: "Page health — Agent Analytics",
};

export const dynamic = "force-dynamic";

function slugify(brand: string | null): string {
  return (
    (brand ?? "workspace")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "workspace"
  );
}

export default async function PageHealthPage() {
  const metrics = await getLiveMetrics();
  const brand = metrics.workspace?.brand ?? null;
  const domain = metrics.workspace?.domain || null;
  const source = capabilitySource("page-health");

  return (
    <>
      <Topbar
        crumb={["Agent Analytics", "Page health"]}
        brand={brand ?? "Your brand"}
        showDateRange={false}
        showPlatforms={false}
        exportFilename={`${slugify(brand)}-page-health-not-collected.csv`}
        exportReport={pageHealthSpec(brand)}
        extra={
          domain ? (
            <span
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--mut)",
                background: "rgba(255,255,255,0.045)",
                borderRadius: "7px",
                padding: "6px 12px",
              }}
            >
              {domain}
            </span>
          ) : undefined
        }
      />
      <AgentsTabs />
      <div className="frame-m-pagehealth">
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {!metrics.configured && (
            <SetupState note="Page health would score your own pages for AI readability. Set up your brand and domain first — without them there is no site to look at, and the crawl that would measure a page still has to be built." />
          )}
          {source && (
            <LockedPreview source={source}>
              <PageHealthPreview />
            </LockedPreview>
          )}
        </div>
      </div>
    </>
  );
}
