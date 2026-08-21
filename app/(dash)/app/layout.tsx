import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/app/Sidebar";
import Overlays from "@/components/app/Overlays";
import SmallScreenGate from "@/components/app/SmallScreenGate";
import Toaster from "@/components/ui/Toaster";
import { FilterProvider } from "@/lib/filters/context";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { AUTH_COOKIE, sessionUser } from "@/lib/auth";

/* FilterProvider holds the topbar's date-range + platform selection. It lives
   in the layout (not a page) so the window survives navigation between
   dashboard screens.

   SmallScreenGate is a position:fixed, display:none-by-default overlay — it is
   out of flow and invisible at >=900px, so the desktop layout below is
   untouched. The `dash-main` class it pairs with only does anything inside the
   same <900px media query (see small-screen-gate.css): it lets a wide table
   scroll inside the content column instead of shoving the whole page sideways. */

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  /* Server-side access guard — the real one. The proxy does an edge-safe cookie
     presence check; here we validate for real. Access is granted by EITHER the
     demo passphrase (keeps the public demo working) OR a valid account session
     (lib/auth). An invalid or expired session is bounced to /login. */
  const jar = await cookies();
  const demoOk = isUnlocked(jar.get(GATE_COOKIE)?.value);
  if (!demoOk) {
    const user = await sessionUser(jar.get(AUTH_COOKIE)?.value);
    if (!user) redirect("/login");
  }

  return (
    <FilterProvider>
      <div style={{ display: "flex", background: "var(--bg0)", minHeight: "100vh" }}>
        <Sidebar />
        <main id="main" className="dash-main" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {children}
        </main>
        <SmallScreenGate />
        <Overlays />
        <Toaster />
      </div>
    </FilterProvider>
  );
}
