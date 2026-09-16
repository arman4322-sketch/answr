import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import { getWorkspace } from "@/lib/workspace";
import NotAvailable from "../NotAvailable";

/* Demand → keyword detail — route kept, fixtures removed.

   The screen used to be a full profile of one invented keyword: a bi-weekly
   volume curve, a per-platform split, age / income / gender / region
   demographics, a keyword tree and a set of "asked recently" questions. Every
   figure came from fixtures.

   None of it is derivable from the connected answer providers. Per-keyword
   volume needs a search-volume pipeline the sampler does not run, and the
   demographics and sample questions would additionally need a licensed
   consented conversation panel. So the route renders the honest-unavailable
   panel and keeps working; Demand no longer links into it, but ⌘K history and
   saved URLs still resolve instead of 404ing. */

export const metadata: Metadata = {
  title: "Keyword · Demand — Answr",
};

export const dynamic = "force-dynamic";

export default async function DemandKeywordPage() {
  const workspace = await getWorkspace();
  const brand = workspace?.brand ?? "Your brand";

  return (
    <div className="frame-p2-demand" style={{flex:"1",display:"flex",flexDirection:"column",minWidth:"0"}}>
      <Topbar
        crumb={["Demand", "Keyword"]}
        brand={brand}
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
      />
      <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:"16px"}}>
        <div>
          <div style={{fontSize:"20px",fontWeight:"600",letterSpacing:"-0.01em"}}>{"Keyword detail"}</div>
          <div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"3px"}}>{"Volume, platform split and audience for a single keyword"}</div>
        </div>
        <NotAvailable
          title="Keyword detail isn't collecting data yet"
          affected="Monthly volume, the volume trend, the per-platform split and the keyword tree all come from that pipeline. The audience breakdowns and the sample questions would additionally need a licensed consented conversation panel."
        />
      </div>
    </div>
  );
}
