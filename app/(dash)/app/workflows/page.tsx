import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import { getWorkspace } from "@/lib/workspace";
import NotAvailable, { SetupNotice } from "./NotAvailable";

/* Workflows — route kept, fixtures removed.

   The screen used to ship three automation rules ("New-citation alert",
   "Weekly content audit", "Low-visibility topic sweep") with triggers naming a
   brand this deployment does not track, statuses, "last run" dates and run
   counts, a selected rule's trigger/step chain, and a "Recent runs" feed of
   things that never happened.

   None of it is derivable: no automation rule is stored anywhere, and there is
   no trigger runner to evaluate one, so a rule cannot exist and a run cannot
   have occurred. The template chips, the status filter, "+ New workflow",
   "+ add step", "Save workflow" and "Run test" went with them — every one of
   those controls acted on a rule engine that isn't there.

   The topbar's brand is read live from lib/workspace so the header never names
   a brand this deployment isn't tracking. */

export const metadata: Metadata = {
  title: "Workflows — Answr",
};

export const dynamic = "force-dynamic";

export default async function WorkflowsPage() {
  const workspace = await getWorkspace();
  const brand = workspace?.brand ?? null;

  return (
    <div className="frame-p2-workflows" style={{ flex: "1", display: "flex", flexDirection: "column", minWidth: "0" }}>
      <Topbar
        crumb="Workflows"
        brand={brand ?? "Your brand"}
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
      />
      <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: "600", letterSpacing: "-0.01em" }}>{"Workflows"}</div>
          <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>
            {"Rules that watch your answer data and act on it"}
          </div>
        </div>
        {/* Both states are true at once when nothing is configured: there is no
            workspace to watch, AND no engine that could watch one. Neither fact
            is hidden behind the other. */}
        {!workspace && <SetupNotice />}
        <NotAvailable brand={brand} />
      </div>
    </div>
  );
}
