import type { Metadata } from "next";
import Link from "next/link";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { getLiveMetrics } from "@/lib/live/metrics";
import { providerStatuses } from "@/lib/providers/registry";
import { Toggle } from "../DemoControls";
import SettingsRail from "../SettingsRail";
import { EmptyState, brandLabel } from "../states";
import RunNow from "./RunNow";

/* Settings — Platforms.

   Which answer engines this deployment can sample, read from the provider
   registry against the real environment, and what each has actually returned,
   read from the live metrics layer.

   Nothing on this screen is invented. Every figure rendered is read back from
   something the deployment actually holds: the prompt count is the tracked set
   (lib/live/metrics), the connected count is the real key state (the provider
   registry against process.env), the per-lane counts are answers already
   sampled, and the schedule card reports the sampler plumbing — whether a cron
   secret is set, and what the last run collected — rather than a countdown.
   The daily-volume figures, the "enabled" badge, the plan quota and the
   "next run in …" clock that used to sit here were fixture and are gone.

   "Run now" is a real run: RunNow drives the stepped engine
   (/api/runs/start → /api/runs/step) exactly as the welcome screen does. */

export const metadata: Metadata = {
  title: "Platforms — Settings",
};

export const dynamic = "force-dynamic";

const NOT_WIRED = "Pausing a lane isn't wired up yet — every connected provider is sampled.";

const card: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "17px 19px",
};

const stat: React.CSSProperties = { fontSize: "11.5px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" };

export default async function PlatformsSettingsPage() {
  const m = await getLiveMetrics();
  const brand = brandLabel(m.workspace?.brand);
  const providers = providerStatuses();
  const connected = providers.filter((p) => p.configured).length;
  const cronArmed = !!(process.env.CRON_SECRET || process.env.ANSWR_INGEST_SECRET);
  const sampled = new Map(m.platforms.map((p) => [p.provider, p]));

  return (
    <>
      <Topbar
        crumb={["Settings", "Platforms"]}
        brand={brand}
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
        extra={<span style={{ fontSize: "11.5px", color: "var(--fnt)" }}>Connected lanes are sampled on the next run</span>}
      />
      <div className="frame-settings-platforms" style={{ flex: "1", display: "flex" }}>
        <SettingsRail />
        <div style={{ flex: "1", padding: "28px 32px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "860px" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "600" }}>{"Platforms"}</div>
            <div style={{ fontSize: "12.5px", color: "var(--mut)", marginTop: "4px" }}>
              {"Where your prompt set runs. A lane samples answers once its API key is set in the deployment's environment — until then it contributes nothing to scores."}
            </div>
            <div style={{ marginTop: "14px" }}>
              <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 19px 11px" }}>
                  <div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>{"Monitored platforms"}<Hint text="AI tools we ask your questions on" /></span>
                    <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>
                      {m.promptsTracked === 0
                        ? "No prompts are tracked yet, so nothing is being asked on any lane."
                        : `Your ${m.promptsTracked} tracked prompt${m.promptsTracked === 1 ? "" : "s"} run on every connected platform.`}
                    </div>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>
                    {`${connected} OF ${providers.length} CONNECTED`}
                    <Hint text="Lanes without a key are left out of scores" align="right" size={12} />
                  </span>
                </div>
                {providers.map((p, i) => {
                  const row = sampled.get(p.id);
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "13px 19px",
                        ...(i < providers.length - 1 ? { borderBottom: "1px solid var(--brd)" } : {}),
                      }}
                    >
                      <div style={{ minWidth: "0", flex: "1" }}>
                        <div style={{ fontSize: "13px", fontWeight: "500" }}>{p.label}</div>
                        <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "2px" }}>{p.blurb}</div>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>
                        {!p.configured
                          ? "No key set"
                          : row
                            ? `${row.answers} answer${row.answers === 1 ? "" : "s"} sampled`
                            : "No answers yet"}
                      </span>
                      <Toggle
                        label={`Toggle ${p.label} monitoring`}
                        note={p.configured ? NOT_WIRED : `${p.label} has no key set — connect it in Settings › Integrations.`}
                        defaultOn={p.configured}
                        width={30}
                        height={18}
                        knob={14}
                        radius={9}
                      />
                    </div>
                  );
                })}
              </div>
              {connected === 0 && (
                <div style={{ marginTop: "10px" }}>
                  <EmptyState
                    line="No answer engines connected."
                    note="Add a provider key in Settings › Integrations and redeploy — the sampler stays inert until at least one lane has a key."
                  />
                </div>
              )}
            </div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "16px", fontWeight: "600" }}>{"Schedule & sampling"}<Hint text="When we ask, and what came back" /></div>
            <div style={{ fontSize: "12.5px", color: "var(--mut)", marginTop: "4px" }}>
              {"The sampler runs on the deployment's cron (vercel.json → /api/runs/execute). Everything below is what it has actually collected."}
            </div>
            <div style={{ marginTop: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div style={card}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>{"Run schedule"}<Hint text="When we ask AI your questions" /></div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: ".04em",
                        textTransform: "uppercase",
                        padding: "3px 9px",
                        borderRadius: "999px",
                        whiteSpace: "nowrap",
                        color: cronArmed ? "#3fd08a" : "var(--fnt)",
                        background: cronArmed ? "rgba(63,208,138,0.12)" : "rgba(255,255,255,0.045)",
                        border: `1px solid ${cronArmed ? "color-mix(in oklab,#3fd08a 34%,transparent)" : "var(--brd)"}`,
                      }}
                    >
                      {cronArmed ? "Armed" : "Not armed"}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--mut)" }}>
                      {cronArmed ? "The scheduled run can execute." : "Set CRON_SECRET to arm the scheduled run."}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "12px", ...stat }}>
                    <span>{m.lastRunAt ? `Last run collected ${m.answersSampled} answer${m.answersSampled === 1 ? "" : "s"}` : "No run has completed yet"}</span>
                    <Link href="/app/settings/integrations" style={{ color: "var(--ac)", fontWeight: 500 }}>
                      {"Pipeline status"}
                    </Link>
                  </div>
                </div>
                <div style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>{"Tracked prompt set"}<Hint text="The questions we ask for you" /></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "12px" }}>
                    <span style={{ fontSize: "20px", fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>{m.promptsTracked}</span>
                    <span style={{ fontSize: "12px", color: "var(--fnt)" }}>{m.promptsTracked === 1 ? "tracked prompt" : "tracked prompts"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "12px", ...stat }}>
                    <span>{m.days > 0 ? `${m.days} day${m.days === 1 ? "" : "s"} of sampled history` : "No sampled history yet"}</span>
                    <Link href="/app/prompts" style={{ color: "var(--ac)", fontWeight: 500 }}>
                      {"Manage prompts"}
                    </Link>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "10px" }}>
                <RunNow connectedLanes={connected} promptsTracked={m.promptsTracked} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
