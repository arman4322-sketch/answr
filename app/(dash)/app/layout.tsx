import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/app/Sidebar";
import { getLiveMetrics } from "@/lib/live/metrics";
import Overlays from "@/components/app/Overlays";
import SmallScreenGate from "@/components/app/SmallScreenGate";
import Toaster from "@/components/ui/Toaster";
import { FilterProvider } from "@/lib/filters/context";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { AUTH_COOKIE, sessionUser } from "@/lib/auth";
import { brandIdentity } from "@/lib/brands";

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
  const user = await sessionUser(jar.get(AUTH_COOKIE)?.value);
  if (!demoOk && !user) redirect("/login");

  /* Real nav counts from the live layer — never fixture numbers. */
  const live = await getLiveMetrics().catch(() => null);
  const counts = live?.hasData
    ? { citations: live.citationsCount, prompts: live.promptsTracked }
    : undefined;

  /* The sidebar's workspace row and account menu show the REAL brand and the
     REAL signed-in account. `brand` is null when nothing is configured yet, and
     the rail then offers onboarding instead of naming a brand that isn't there.
     Access via the demo passphrase has no account, so `account` stays undefined
     and the menu says so rather than inventing a person. */
  const brand = brandIdentity(live?.workspace ?? null);
  const account = user ? { name: user.name, email: user.email } : undefined;

  return (
    <FilterProvider>
      <div style={{ display: "flex", background: "var(--bg0)", minHeight: "100vh" }}>
        <Sidebar counts={counts} brand={brand} user={account} />
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
