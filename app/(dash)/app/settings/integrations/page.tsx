import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import SettingsRail from "../SettingsRail";
import TestButton from "./TestButton";
import ScoringPreview from "./ScoringPreview";
import { providerStatuses } from "@/lib/providers/registry";
import { readKvEnv } from "@/lib/telemetry/kv";
import { METRICS, type MetricId } from "@/lib/metrics";

/* Settings › Integrations — the real "plug in your keys" surface.

   Server component: reads the provider registry against the live environment and
   reflects what's configured. Secrets are NEVER sent to the client — only the
   boolean "configured" and the env-var NAMES to set. Set each variable in your
   host's environment (Vercel → Settings → Environment Variables), redeploy, and
   the lane activates: the sampler (lib/sampler) and its scoring turn these into
   the metrics in lib/metrics.ts. See INTEGRATIONS.md and HANDOFF.md. */

export const metadata: Metadata = { title: "Integrations — Settings" };
export const dynamic = "force-dynamic";

const card: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "16px 18px",
};

const pill = (ok: boolean): React.CSSProperties => ({
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: ".04em",
  textTransform: "uppercase",
  padding: "3px 9px",
  borderRadius: "999px",
  whiteSpace: "nowrap",
  color: ok ? "#3fd08a" : "var(--fnt)",
  background: ok ? "rgba(63,208,138,0.12)" : "rgba(255,255,255,0.045)",
  border: `1px solid ${ok ? "color-mix(in oklab,#3fd08a 34%,transparent)" : "var(--brd)"}`,
});

function metricLabel(id: string): string {
  return (METRICS as Record<string, { label?: string }>)[id as MetricId]?.label ?? id;
}

export default function IntegrationsPage() {
  const providers = providerStatuses();
  const configuredCount = providers.filter((p) => p.configured).length;
  const durable = !!readKvEnv();
  const cronSecretSet = !!(process.env.CRON_SECRET || process.env.ANSWR_INGEST_SECRET);

  return (
    <>
      <Topbar crumb={["Settings", "Integrations"]} showDateRange={false} showPlatforms={false} exportLabel={null} />
      <div style={{ flex: "1", display: "flex" }}>
        <SettingsRail />
        <div style={{ flex: "1", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "16px", maxWidth: "980px" }}>
          {/* Intro */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>Answer-engine providers</div>
              <Hint text="The API keys that turn Answr's metrics from demo fixtures into live data" />
            </div>
            <div style={{ fontSize: "12.5px", color: "var(--mut)", lineHeight: 1.6, marginTop: "6px" }}>
              {configuredCount === 0
                ? "No providers connected yet — the dashboard runs on demo fixtures. Add a key below to light up the sampling pipeline."
                : `${configuredCount} of ${providers.length} providers connected. The nightly sampler runs against every connected lane.`}
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--fnt)", lineHeight: 1.6, marginTop: "8px" }}>
              Set each variable in your host&rsquo;s environment (on Vercel: Settings → Environment Variables), then redeploy.
              Keys live only in the server environment — never in this page or the browser.
            </div>
          </div>

          {/* Provider cards */}
          {providers.map((p) => (
            <div key={p.id} style={card}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>{p.label}</span>
                    <span style={pill(p.configured)}>{p.configured ? "Connected" : "Not connected"}</span>
                    <span style={{ fontSize: "11px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{p.pilotCost}</span>
                  </div>
                  <div style={{ fontSize: "12.5px", color: "var(--mut)", marginTop: "6px", lineHeight: 1.55 }}>{p.blurb}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                    {p.powers.map((m) => (
                      <span key={m} style={{ fontSize: "10.5px", color: "var(--mut)", background: "rgba(255,255,255,0.045)", border: "1px solid var(--brd)", borderRadius: "6px", padding: "2px 7px" }}>
                        {metricLabel(m)}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginTop: "12px" }}>
                    {p.envVars.map((v) => (
                      <code key={v} style={{ fontSize: "11.5px", background: "var(--bg2)", border: "1px solid var(--brd)", borderRadius: "6px", padding: "3px 8px", color: "var(--tx)" }}>{v}</code>
                    ))}
                    <a href={p.docsUrl} target="_blank" rel="noreferrer" style={{ fontSize: "11.5px", color: "var(--ac)" }}>Get a key ↗</a>
                  </div>
                </div>
                <div style={{ flex: "none", paddingTop: "2px" }}>
                  <TestButton provider={p.id} configured={p.configured} />
                </div>
              </div>
            </div>
          ))}

          {/* Scoring engine — live proof it computes real metrics */}
          <ScoringPreview />

          {/* Infrastructure readiness */}
          <div style={card}>
            <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>Pipeline infrastructure</div>
            <Row
              label="Durable store (Redis / Upstash)"
              ok={durable}
              detail={durable ? "Connected — telemetry and sampled answers persist across restarts." : "Not set — data lives in memory and resets on cold start. Set KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL + _TOKEN)."}
            />
            <Row
              label="Sampler schedule"
              ok={cronSecretSet}
              detail={cronSecretSet ? "CRON_SECRET set — the daily cron (vercel.json → /api/runs/execute) can run the sampler." : "Set CRON_SECRET to arm the nightly sampler. Until then it stays inert even though the cron is scheduled."}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div style={{ display: "flex", gap: "12px", padding: "10px 0", borderTop: "1px solid var(--brd)" }}>
      <span style={{ ...pill(ok), alignSelf: "flex-start", marginTop: "1px" }}>{ok ? "Ready" : "Set up"}</span>
      <div>
        <div style={{ fontSize: "13px", fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: "11.5px", color: "var(--mut)", lineHeight: 1.55, marginTop: "3px" }}>{detail}</div>
      </div>
    </div>
  );
}
