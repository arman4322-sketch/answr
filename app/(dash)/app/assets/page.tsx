import type { Metadata } from "next";
import Link from "next/link";
import Topbar from "@/components/app/Topbar";
import AssetsBody, { type AssetSummary } from "./AssetsBody";
import { brandIdentity, brandSubtitle } from "@/lib/brands";
import { getLiveMetrics } from "@/lib/live/metrics";

export const metadata: Metadata = { title: "All assets" };

/* MISC — All assets — converted from canvas frame #m-assets. The embedded sidebar
   comes from the layout, and the brand-switcher popup the frame mocked up there is
   now real (components/app/BrandSwitcher); the frame's staged .css only styled that
   popup, so no page css.

   The frame showed a portfolio of brands. The product tracks exactly one
   configured workspace, so this screen shows that one asset, resolved here from
   the live layer and handed to the client body as props — visibility from the
   sampled answers, prompts from the tracked prompt set, competitors from the
   workspace. The delta appears only once there are two sampled days to compare;
   below that there is no trend to state. With nothing configured the body shows
   a setup state instead of a brand.

   The Topbar's action (passed via `extra`, with exportLabel null) goes to brand
   settings — there is no "add a brand", because a second brand is not a thing
   this deployment can have. */

const r1 = (n: number) => Math.round(n * 10) / 10;

export default async function Page() {
  const m = await getLiveMetrics().catch(() => null);
  const brand = brandIdentity(m?.workspace ?? null);

  let asset: AssetSummary | null = null;
  if (m && brand) {
    const first = m.series[0];
    const last = m.series[m.series.length - 1];
    asset = {
      brand,
      visibility: m.hasData ? m.visibilityScore : null,
      delta: m.series.length >= 2 ? r1(last.visibility - first.visibility) : null,
      days: m.days,
      prompts: m.promptsTracked,
      competitors: m.workspace?.competitors.length ?? 0,
      search: [brand.name, brand.domain, brand.category].filter(Boolean).join(" ").toLowerCase(),
    };
  }

  return (
    <div className="frame-m-assets">
      <Topbar
        crumb="All assets"
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
        extra={
          <Link
            href={asset ? "/app/settings" : "/onboarding/brand"}
            className="btn-ac"
            style={{ fontSize: "12.5px", fontWeight: "500", borderRadius: "7px", padding: "6px 14px", textDecoration: "none" }}
            title={asset ? `Brand settings — ${brandSubtitle(asset.brand) || asset.brand.name}` : undefined}
          >
            {asset ? "Brand settings" : "Set up brand"}
          </Link>
        }
      />
      <AssetsBody asset={asset} />
    </div>
  );
}
