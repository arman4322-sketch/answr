import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import AddBrandButton from "./AddBrandButton";
import AssetsBody from "./AssetsBody";

export const metadata: Metadata = { title: "All assets" };

/* MISC — All assets — converted from canvas frame #m-assets. The embedded sidebar
   comes from the layout, and the brand-switcher popup the frame mocked up there is
   now real (components/app/BrandSwitcher) and reads the same lib/brands.ts list as
   this page; the frame's staged .css only styled that popup, so no page css.
   The Topbar's "+ Add brand" is passed via `extra` (with exportLabel null) so it
   can be a working client button — same slot, same btn-ac styling. Body is a
   client component: search filters the brand cards, add-brand buttons open the
   add-brand form. */
export default function Page() {
  return (
    <div className="frame-m-assets">
      <Topbar
        crumb="All assets"
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
        extra={<AddBrandButton />}
      />
      <AssetsBody />
    </div>
  );
}
