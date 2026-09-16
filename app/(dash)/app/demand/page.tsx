import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import LockedPreview from "@/components/app/LockedPreview";
import { capabilitySource } from "@/lib/preview/sources";
import { getWorkspace } from "@/lib/workspace";
import DemandPreview from "./DemandPreview";

/* Demand — watchlists — route kept, fixtures removed.

   The screen used to show two fixture watchlists whose every figure was
   invented. Prompt volume needs a keyword search-volume pipeline the sampler
   does not run, so none of that data survives.

   What renders now is an ILLUSTRATIVE PREVIEW of the populated screen —
   the volume-over-time chart and the term table (term, monthly volume, trend,
   difficulty) — wrapped in <LockedPreview>, which dims it to 28%, greyscales
   it, marks it inert/aria-hidden and lays the permanent "not measured data"
   badge plus the full "what's needed to enable this" research panel over it
   (lib/preview/sources.ts → "demand": DataForSEO Keywords Data, AI Keyword Data
   and Google Trends, all on credentials Answr already holds). The placeholder
   figures live only inside that wrapper and name no real brand or category.

   The crumb's brand is read live from lib/workspace so the header never names
   a brand this deployment isn't tracking. */

export const metadata: Metadata = {
  title: "Demand — Answr",
};

export const dynamic = "force-dynamic";

export default async function DemandPage() {
  const workspace = await getWorkspace();
  const brand = workspace?.brand ?? "Your brand";
  const source = capabilitySource("demand");

  return (
    <div className="frame-demand" style={{flex:"1",display:"flex",flexDirection:"column",minWidth:"0"}}>
      <Topbar
        crumb="Demand"
        brand={brand}
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
      />
      <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:"16px"}}>
        <div>
          <div style={{fontSize:"20px",fontWeight:"600",letterSpacing:"-0.01em"}}>{"Demand"}</div>
          <div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"3px"}}>{"What buyers ask AI — keyword volume, watchlists and intent"}</div>
        </div>
        {source && (
          <LockedPreview source={source}>
            <DemandPreview />
          </LockedPreview>
        )}
      </div>
    </div>
  );
}
