import Sidebar from "@/components/app/Sidebar";
import Overlays from "@/components/app/Overlays";
import SmallScreenGate from "@/components/app/SmallScreenGate";
import Toaster from "@/components/ui/Toaster";
import { FilterProvider } from "@/lib/filters/context";

/* FilterProvider holds the topbar's date-range + platform selection. It lives
   in the layout (not a page) so the window survives navigation between
   dashboard screens.

   SmallScreenGate is a position:fixed, display:none-by-default overlay — it is
   out of flow and invisible at >=900px, so the desktop layout below is
   untouched. The `dash-main` class it pairs with only does anything inside the
   same <900px media query (see small-screen-gate.css): it lets a wide table
   scroll inside the content column instead of shoving the whole page sideways. */

export default function DashLayout({ children }: { children: React.ReactNode }) {
  return (
    <FilterProvider>
      <div style={{ display: "flex", background: "var(--bg0)", minHeight: "100vh" }}>
        <Sidebar />
        <div className="dash-main" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {children}
        </div>
        <SmallScreenGate />
        <Overlays />
        <Toaster />
      </div>
    </FilterProvider>
  );
}
