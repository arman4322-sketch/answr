import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import LockedPreview from "@/components/app/LockedPreview";
import { capabilitySource } from "@/lib/preview/sources";
import { getWorkspace } from "@/lib/workspace";
import KeywordPreview from "./KeywordPreview";

/* Demand → keyword detail — route kept, fixtures removed.

   The screen used to be a full profile of one invented keyword, every figure
   from a fixture. Per-keyword volume needs a search-volume pipeline the sampler
   does not run, so none of that data survives.

   What renders now is an ILLUSTRATIVE PREVIEW of one term's breakdown —
   headline volume, the volume curve, the split by AI surface, related terms and
   the question phrasings behind the term — wrapped in <LockedPreview>, which
   dims it to 28%, greyscales it, marks it inert/aria-hidden and lays the
   permanent "not measured data" badge plus the full "what's needed to enable
   this" research panel over it (lib/preview/sources.ts → "demand"). The
   placeholder figures live only inside that wrapper and name no real brand.

   Demand no longer links into this route, but ⌘K history and saved URLs still
   resolve instead of 404ing. */

export const metadata: Metadata = {
  title: "Keyword · Demand — Answr",
};

export const dynamic = "force-dynamic";

export default async function DemandKeywordPage() {
  const workspace = await getWorkspace();
  const brand = workspace?.brand ?? "Your brand";
  const source = capabilitySource("demand");

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
        {source && (
          <LockedPreview source={source}>
            <KeywordPreview />
          </LockedPreview>
        )}
      </div>
    </div>
  );
}
