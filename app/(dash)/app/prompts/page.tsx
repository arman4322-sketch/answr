import type { Metadata } from "next";
import { Suspense } from "react";
import Topbar from "@/components/app/Topbar";
import { getLiveMetrics } from "@/lib/live/metrics";
import { defaultPromptsFor } from "@/lib/workspace";
import { ExportPromptsButton } from "./Controls";
import AddPromptsModal from "./AddPromptsModal";
import PromptsBody from "./PromptsBody";
import PromptSearch from "./PromptSearch";
import { promptsScreen } from "./rows";
import "./page.css";

/* Prompts — the workspace's tracked prompt list, read from the live metrics
   layer (lib/live/metrics → real sampled answers). The fixture list that used
   to feed this screen is gone.

   The topbar's intent filter went with it: the live pipeline does not classify
   prompt intent, so a pill offering "Intent: Commercial" had nothing behind it.
   Search, export and "+ Add prompts" all run against the live rows. */

export const metadata: Metadata = {
  title: "Prompts",
};

export const dynamic = "force-dynamic";

export default async function PromptsPage() {
  const metrics = await getLiveMetrics();
  /* Suggestions are generated from the real brand + category (the same
     generator onboarding uses) — not a fixture list. */
  const suggestions = metrics.workspace
    ? defaultPromptsFor(metrics.workspace.brand, metrics.workspace.category)
    : [];
  const data = promptsScreen(metrics, suggestions);

  return (
    <div className="frame-prompts" style={{flex:"1",display:"flex",flexDirection:"column",minWidth:"0"}}>
      <Topbar
        crumb="Prompts"
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
        extra={
          <>
            <Suspense fallback={null}><PromptSearch /></Suspense>
            <ExportPromptsButton data={data} />
            <AddPromptsModal data={data} />
          </>
        }
      />
      <Suspense fallback={null}><PromptsBody data={data} /></Suspense>
    </div>
  );
}
