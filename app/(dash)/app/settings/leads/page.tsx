import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import { getWorkspace } from "@/lib/workspace";
import SettingsRail from "../SettingsRail";
import { brandLabel } from "../states";
import LeadsTable from "./LeadsTable";

/* Settings › Leads — captured demo/snapshot/signup submissions. The table reads
   from /api/lead (the same route module the forms POST to), so the store is
   shared; durable once a KV/Redis key is configured. */

export const metadata: Metadata = { title: "Leads — Settings" };

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const ws = await getWorkspace();
  return (
    <>
      <Topbar crumb={["Settings", "Leads"]} brand={brandLabel(ws?.brand)} showDateRange={false} showPlatforms={false} exportLabel={null} />
      <div style={{ flex: "1", display: "flex" }}>
        <SettingsRail />
        <div style={{ flex: "1", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "14px", maxWidth: "960px" }}>
          <LeadsTable />
        </div>
      </div>
    </>
  );
}
