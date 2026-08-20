import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import FilterPill from "@/components/ui/FilterPill";
import { ExportPromptsButton } from "./Controls";
import AddPromptsModal from "./AddPromptsModal";
import PromptsBody from "./PromptsBody";
import "./page.css";

/* Prompts — converted from canvas frame #prompts. The frame's topbar controls
   (search, intent filter, export, add) ride in the Topbar `extra` slot; the
   intent pill is a working FilterPill, Export downloads the fixture CSV, and
   the table/bulk-bar/detail-panel interactivity lives in PromptsBody. */

export const metadata: Metadata = {
  title: "Prompts",
};

const DEMO_NOTE = "This filter needs a live workspace — the demo ships one fixture set for this list.";

export default function PromptsPage() {
  return (
    <div className="frame-prompts" style={{flex:"1",display:"flex",flexDirection:"column",minWidth:"0"}}>
      <Topbar
        crumb="Prompts"
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
        extra={
          <>
            <input type="search" aria-label="Search prompts" placeholder="⌕ Search 412 prompts…" style={{fontSize:"12px",fontWeight:400,fontVariantNumeric:"tabular-nums",color:"var(--tx)",background:"rgba(255,255,255,0.045)",border:"none",borderRadius:"7px",padding:"6px 12px",width:"200px",fontFamily:"inherit"}} />
            <FilterPill label="Intent: All" items={["Intent: All", "Intent: Commercial", "Intent: Informational", "Intent: Branded"]} note={DEMO_NOTE} />
            <ExportPromptsButton />
            <AddPromptsModal />
          </>
        }
      />
      <PromptsBody />
    </div>
  );
}
