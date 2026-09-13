import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import ScanRunner from "./ScanRunner";

/* Live Scan — the real-numbers demo surface. Queries live LLMs and shows the
   scoring engine's genuine output for any brand. */

export const metadata: Metadata = { title: "Live Scan" };

export default function ScanPage() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      <Topbar crumb="Live Scan" showDateRange={false} showPlatforms={false} exportLabel={null} />
      <ScanRunner />
    </div>
  );
}
