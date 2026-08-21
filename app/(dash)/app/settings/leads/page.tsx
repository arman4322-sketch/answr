import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import SettingsRail from "../SettingsRail";
import LeadsTable from "./LeadsTable";

/* Settings › Leads — captured demo/snapshot/signup submissions. The table reads
   from /api/lead (the same route module the forms POST to), so the store is
   shared; durable once a KV/Redis key is configured. */

export const metadata: Metadata = { title: "Leads — Settings" };

export default function LeadsPage() {
  return (
    <>
      <Topbar crumb={["Settings", "Leads"]} showDateRange={false} showPlatforms={false} exportLabel={null} />
      <div style={{ flex: "1", display: "flex" }}>
        <SettingsRail />
        <div style={{ flex: "1", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "14px", maxWidth: "960px" }}>
          <LeadsTable />
        </div>
      </div>
    </>
  );
}
