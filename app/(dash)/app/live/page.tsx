import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import LiveTelemetry from "./LiveTelemetry";

/* Live telemetry — the one screen in the app fed by REAL captured data rather
   than the Nike demo fixture. Sources: proxy.ts → /api/ingest (AI crawler
   requests on this deployment), public/snippet.js → /api/collect (human
   click-throughs from assistants), and /api/telemetry/test-hit (an on-demand
   GPTBot request to this deployment, for demonstrating the pipeline live).
   See INTEGRATIONS.md Move 2. */

export const metadata: Metadata = {
  title: "Live telemetry — Answr",
};

export default function LivePage() {
  return (
    <div>
      <Topbar crumb={["Infrastructure", "Live telemetry"]} showDateRange={false} showPlatforms={false} exportLabel={null} />
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>Live telemetry</h1>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--good)",
              background: "rgba(76,183,130,.12)",
              borderRadius: "4px",
              padding: "3px 7px",
            }}
          >
            Real data
          </span>
          <span style={{ fontSize: "12.5px", color: "var(--mut)" }}>
            Real AI-crawler traffic captured on this deployment. Every other screen runs on the Nike demo fixture; this one
            counts requests that actually happened.
          </span>
        </div>
        <LiveTelemetry />
      </div>
    </div>
  );
}
