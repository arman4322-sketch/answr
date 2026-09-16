import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import LockedPreview from "@/components/app/LockedPreview";
import { capabilitySource } from "@/lib/preview/sources";
import { getWorkspace } from "@/lib/workspace";
import SetupNotice from "./SetupNotice";
import WorkflowsPreview from "./Preview";

/* Workflows — route kept, fixtures removed, replaced by a locked preview.

   The screen used to ship three automation rules with triggers naming a brand
   this deployment does not track, statuses, "last run" dates and run counts,
   and a "Recent runs" feed of things that never happened. None of it is
   derivable: no automation rule is stored anywhere, and there is no trigger
   runner to evaluate one, so a rule cannot exist and a run cannot have
   occurred.

   What renders now is <LockedPreview>: the rule cards (trigger → action →
   notify) and the recent-runs feed the engine would fill, drawn at 28% opacity,
   desaturated, inert and aria-hidden, under a permanent "illustrative — not
   measured data" badge, with the overlay explaining what building the engine
   would take. Every rule, run and timestamp inside is a neutral placeholder and
   lives ONLY inside that wrapper.

   The topbar's brand is read live from lib/workspace so the header never names
   a brand this deployment isn't tracking. */

export const metadata: Metadata = {
  title: "Workflows — Answr",
};

export const dynamic = "force-dynamic";

export default async function WorkflowsPage() {
  const workspace = await getWorkspace();
  const brand = workspace?.brand ?? null;
  const source = capabilitySource("workflows");

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
            workspace to watch, AND no engine that could watch one. The setup
            notice is a real statement about this deployment, so it stays outside
            the preview. */}
        {!workspace && <SetupNotice />}
        {source && (
          <LockedPreview source={source}>
            <WorkflowsPreview />
          </LockedPreview>
        )}
      </div>
    </div>
  );
}
