import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import { getWorkspace } from "@/lib/workspace";
import NotAvailable from "./NotAvailable";

/* Demand — watchlists — route kept, fixtures removed.

   The screen used to show two fixture watchlists, keyword rows with monthly
   volumes, 30-day deltas, intent labels, a "top brand in answers" column and
   sparklines, plus a search quota and a CSV export — every figure invented.
   Prompt volume needs a keyword search-volume pipeline the sampler does not
   run, so all of it is gone rather than re-derived.

   Removed with them: the ad-hoc keyword search box, the "18 searches left this
   month" chip, the "vs previous 30 days" comparison pill, the CSV export and
   both "+ New watchlist" actions — none had anything real behind them.

   The crumb's brand is read live from lib/workspace so the header never names
   a brand this deployment isn't tracking. */

export const metadata: Metadata = {
  title: "Demand — Answr",
};

export const dynamic = "force-dynamic";

export default async function DemandPage() {
  const workspace = await getWorkspace();
  const brand = workspace?.brand ?? "Your brand";

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
        <NotAvailable
          title="Demand isn't collecting data yet"
          affected="Watchlists, monthly prompt volume, 30-day change, intent labels, the top brand per keyword and the trend sparklines all come from that pipeline, so none of them can be shown."
        />
      </div>
    </div>
  );
}
