import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { getLiveMetrics } from "@/lib/live/metrics";
import { providerStatuses } from "@/lib/providers/registry";
import { ToastButton, Toggle } from "./DemoControls";
import SettingsRail from "./SettingsRail";
import { EmptyState, NoBrandPanel, brandLabel } from "./states";

/* Settings — Brand & competitors.

   Server component on the live workspace. The display name, owned domain and
   competitor list are the configured workspace (lib/workspace); the share-of-
   voice column is computed from real sampled answers (lib/live/metrics); the
   platform rows are the provider registry read against this deployment's
   environment.

   Aliases have no backing store yet, so the alias row says that rather than
   showing invented chips. Same rule everywhere in this cluster. */

export const metadata: Metadata = {
  title: "Settings",
};

export const dynamic = "force-dynamic";

const NOT_WIRED = "Editing brand settings from this screen isn't wired up yet — changes are made in onboarding.";

const CHIP: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "400",
  fontVariantNumeric: "tabular-nums",
  background: "var(--bg2)",
  border: "1px solid var(--brd)",
  borderRadius: "5px",
  padding: "5px 10px",
  color: "var(--tx)",
  cursor: "pointer",
  fontFamily: "inherit",
};

const CHIP_ADD: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "400",
  fontVariantNumeric: "tabular-nums",
  color: "var(--fnt)",
  border: "1px dashed var(--brd)",
  borderRadius: "5px",
  padding: "5px 10px",
  background: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};

const LABEL: React.CSSProperties = {
  fontSize: "10.5px",
  fontWeight: "500",
  fontVariantNumeric: "tabular-nums",
  color: "var(--fnt)",
};

/* Row accents for the competitor table — presentation only, assigned by
   position. Nothing here encodes a particular brand. */
const DOTS = ["#7fa7d9", "#b98ed9", "#d9b679", "#d985a8", "#7fd9c0", "#d9d97f"];

const HEAD: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.4fr 1fr .5fr",
  padding: "8px 20px",
  fontSize: "10px",
  fontWeight: "500",
  fontVariantNumeric: "tabular-nums",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--fnt)",
  borderBottom: "1px solid var(--brd)",
};

const ROW: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.4fr 1fr .5fr",
  alignItems: "center",
  padding: "12px 20px",
  fontSize: "13px",
};

const MUTED: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "400",
  fontVariantNumeric: "tabular-nums",
  color: "var(--mut)",
};

export default async function SettingsPage() {
  const m = await getLiveMetrics();
  const ws = m.workspace;
  const brand = brandLabel(ws?.brand);
  const competitors = ws?.competitors ?? [];
  const providers = providerStatuses();
  const connected = providers.filter((p) => p.configured).length;

  /* Share of voice per competitor — real sampled mentions, or nothing. */
  const shareOf = (name: string): string => {
    if (!m.hasData) return "No data yet";
    const row = m.brands.find((b) => b.name.toLowerCase() === name.toLowerCase());
    return row ? `${row.share}%` : "0%";
  };

  return (
    <>
      <Topbar crumb="Settings" brand={brand} showDateRange={false} showPlatforms={false} exportLabel={null} />
      <div className="frame-settings" style={{ flex: "1", display: "flex" }}>
        <SettingsRail />
        <div style={{ flex: "1", padding: "28px 32px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "860px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "16px", fontWeight: "600" }}>{"Brand"}<Hint text="The name we look for in answers" /></div>
            <div style={{ fontSize: "12.5px", color: "var(--mut)", marginTop: "4px" }}>
              {ws
                ? `How Answr recognizes ${ws.brand} in AI answers. Aliases catch misspellings and shorthand.`
                : "How Answr recognizes your brand in AI answers. Aliases catch misspellings and shorthand."}
            </div>
            {!ws ? (
              <div style={{ marginTop: "14px" }}>
                <NoBrandPanel what="Answr has no brand to look for in AI answers yet." />
              </div>
            ) : (
              <div
                style={{
                  background: "var(--bg1)",
                  border: "1px solid var(--brd)",
                  borderRadius: "10px",
                  padding: "18px 20px",
                  marginTop: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "12px", alignItems: "center" }}>
                  <label htmlFor="brand-display-name" style={LABEL}>
                    {"Display name"}
                  </label>
                  <input
                    id="brand-display-name"
                    defaultValue={ws.brand}
                    readOnly
                    style={{
                      border: "1px solid var(--brd)",
                      borderRadius: "7px",
                      background: "var(--bg0)",
                      padding: "9px 12px",
                      fontSize: "13px",
                      width: "320px",
                      boxSizing: "border-box",
                      color: "var(--tx)",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ ...LABEL, display: "flex", alignItems: "center", gap: "5px", paddingTop: "8px" }}>{"Aliases"}<Hint text="Other names people call your brand" size={12} /></div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                    {/* No alias store exists yet — matching falls back to the
                        brand name itself, and this says so. */}
                    <span style={{ ...MUTED, padding: "5px 0" }}>{"No aliases configured — answers are matched on the brand name."}</span>
                    <ToastButton note={NOT_WIRED} style={CHIP_ADD}>
                      {"+ add alias"}
                    </ToastButton>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ ...LABEL, display: "flex", alignItems: "center", gap: "5px", paddingTop: "8px" }}>{"Owned domains"}<Hint text="Websites you control" size={12} /></div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                    {ws.domain ? (
                      <ToastButton note={NOT_WIRED} style={CHIP}>
                        {`${ws.domain} ✕`}
                      </ToastButton>
                    ) : (
                      <span style={{ ...MUTED, padding: "5px 0" }}>{"No domain set — citations can't be split into owned and earned."}</span>
                    )}
                    <ToastButton note={NOT_WIRED} style={CHIP_ADD}>
                      {"+ add domain"}
                    </ToastButton>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "16px", fontWeight: "600" }}>{"Competitors"}<Hint text="Rival brands we compare you against" /></div>
                <div style={{ fontSize: "12.5px", color: "var(--mut)", marginTop: "4px" }}>
                  {competitors.length
                    ? `Tracked in every share-of-voice calculation. ${competitors.length} configured.`
                    : "Tracked in every share-of-voice calculation. None configured yet."}
                </div>
              </div>
              <ToastButton
                className="btn-ac"
                note={NOT_WIRED}
                style={{ fontSize: "12.5px", fontWeight: "500", borderRadius: "7px", padding: "6px 14px", border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                {"+ Add competitor"}
              </ToastButton>
            </div>
            {competitors.length === 0 ? (
              <div style={{ marginTop: "14px" }}>
                <EmptyState
                  line="No competitors tracked yet."
                  note="Share of voice compares your brand against the rivals you name. Until one is configured there is nothing to compare against."
                />
              </div>
            ) : (
              <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", marginTop: "14px", overflow: "hidden" }}>
                <div style={HEAD}>
                  <span>{"Brand"}</span>
                  <span>{"Share of voice"}</span>
                  <span />
                </div>
                {competitors.map((name, i) => (
                  <div key={name} style={{ ...ROW, ...(i > 0 ? { borderTop: "1px solid var(--brd)" } : {}) }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "500" }}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "2px", background: DOTS[i % DOTS.length] }} />
                      {name}
                    </span>
                    <span style={MUTED}>{shareOf(name)}</span>
                    <span style={{ textAlign: "right" }}>
                      <ToastButton
                        note={NOT_WIRED}
                        style={{ color: "var(--fnt)", background: "none", border: "none", padding: "0", font: "inherit", cursor: "pointer" }}
                      >
                        {"Remove"}
                      </ToastButton>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "16px", fontWeight: "600" }}>{"Tracked platforms"}<Hint text="AI tools we check — switch each on or off" /></div>
            <div style={{ fontSize: "12.5px", color: "var(--mut)", marginTop: "4px" }}>
              {connected === 0
                ? "No answer engines are connected — add a provider key in Integrations before the sampler can run."
                : `${connected} of ${providers.length} answer engines connected. A lane only contributes to scores once its key is set.`}
            </div>
            <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "8px 20px", marginTop: "14px" }}>
              {providers.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "11px 0",
                    fontSize: "13px",
                    ...(i < providers.length - 1 ? { borderBottom: "1px solid var(--brd)" } : {}),
                  }}
                >
                  <span>{p.label}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {!p.configured && <span style={{ fontSize: "11px", color: "var(--fnt)" }}>{"Not connected"}</span>}
                    <Toggle
                      label={`Toggle ${p.label} tracking`}
                      note={
                        p.configured
                          ? "Pausing a lane isn't wired up yet — every connected lane is sampled."
                          : `${p.label} has no key set — connect it in Settings › Integrations.`
                      }
                      defaultOn={p.configured}
                      width={34}
                      height={19}
                      knob={15}
                      radius={10}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
