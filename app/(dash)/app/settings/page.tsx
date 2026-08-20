import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { ToastButton, Toggle } from "./DemoControls";
import SettingsRail from "./SettingsRail";

/* Settings — Brand & competitors (frame #settings). */

export const metadata: Metadata = {
  title: "Settings",
};

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

export default function SettingsPage() {
  return (
    <>
      <Topbar crumb="Settings" showDateRange={false} showPlatforms={false} exportLabel={null} />
      <div className="frame-settings" style={{ flex: "1", display: "flex" }}>
        <SettingsRail />
        <div style={{ flex: "1", padding: "28px 32px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "860px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "16px", fontWeight: "600" }}>{"Brand"}<Hint text="The name we look for in answers" /></div>
            <div style={{ fontSize: "12.5px", color: "var(--mut)", marginTop: "4px" }}>{"How Answr recognizes Nike in AI answers. Aliases catch misspellings and shorthand."}</div>
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
                <label htmlFor="brand-display-name" style={{ fontSize: "10.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "var(--fnt)" }}>
                  {"Display name"}
                </label>
                <input
                  id="brand-display-name"
                  defaultValue="Nike"
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
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "var(--fnt)", paddingTop: "8px" }}>{"Aliases"}<Hint text="Other names people call your brand" size={12} /></div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <ToastButton note="Alias changes apply on live workspaces — this demo is read-only." style={CHIP}>
                    {"Nike ✕"}
                  </ToastButton>
                  <ToastButton note="Alias changes apply on live workspaces — this demo is read-only." style={CHIP}>
                    {"Nike Running ✕"}
                  </ToastButton>
                  <ToastButton note="Alias changes apply on live workspaces — this demo is read-only." style={CHIP}>
                    {"nikeinc ✕"}
                  </ToastButton>
                  <ToastButton note="Adding an alias needs a live workspace — this demo is read-only." style={CHIP_ADD}>
                    {"+ add alias"}
                  </ToastButton>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "var(--fnt)", paddingTop: "8px" }}>{"Owned domains"}<Hint text="Websites you control" size={12} /></div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <ToastButton note="Domain changes apply on live workspaces — this demo is read-only." style={CHIP}>
                    {"nike.com ✕"}
                  </ToastButton>
                  <ToastButton note="Domain changes apply on live workspaces — this demo is read-only." style={CHIP}>
                    {"help.nike.com ✕"}
                  </ToastButton>
                  <ToastButton note="Adding a domain needs a live workspace — this demo is read-only." style={CHIP_ADD}>
                    {"+ add domain"}
                  </ToastButton>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "16px", fontWeight: "600" }}>{"Competitors"}<Hint text="Rival brands we compare you against" /></div>
                <div style={{ fontSize: "12.5px", color: "var(--mut)", marginTop: "4px" }}>{"Tracked in every share-of-voice calculation. 4 of 10 slots used."}</div>
              </div>
              <ToastButton
                className="btn-ac"
                note="Adding a competitor needs a live workspace — this demo is read-only."
                style={{ fontSize: "12.5px", fontWeight: "500", borderRadius: "7px", padding: "6px 14px", border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                {"+ Add competitor"}
              </ToastButton>
            </div>
            <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", marginTop: "14px", overflow: "hidden" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr .8fr .5fr",
                  padding: "8px 20px",
                  fontSize: "10px",
                  fontWeight: "500",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--fnt)",
                  borderBottom: "1px solid var(--brd)",
                }}
              >
                <span>{"Brand"}</span>
                <span>{"Domain"}</span>
                <span>{"Added"}</span>
                <span />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr .8fr .5fr", alignItems: "center", padding: "12px 20px", fontSize: "13px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "500" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "2px", background: "#7fa7d9" }} />
                  {"Adidas"}
                </span>
                <span style={{ fontSize: "12px", fontWeight: "400", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}>{"adidas.com"}</span>
                <span style={{ fontSize: "12px", fontWeight: "400", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}>{"Mar 2026"}</span>
                <span style={{ textAlign: "right" }}>
                  <ToastButton
                    note="Competitor changes apply on live workspaces — this demo is read-only."
                    style={{ color: "var(--fnt)", background: "none", border: "none", padding: "0", font: "inherit", cursor: "pointer" }}
                  >
                    {"Remove"}
                  </ToastButton>
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr .8fr .5fr", alignItems: "center", padding: "12px 20px", fontSize: "13px", borderTop: "1px solid var(--brd)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "500" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "2px", background: "#b98ed9" }} />
                  {"Puma"}
                </span>
                <span style={{ fontSize: "12px", fontWeight: "400", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}>{"puma.com"}</span>
                <span style={{ fontSize: "12px", fontWeight: "400", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}>{"Mar 2026"}</span>
                <span style={{ textAlign: "right" }}>
                  <ToastButton
                    note="Competitor changes apply on live workspaces — this demo is read-only."
                    style={{ color: "var(--fnt)", background: "none", border: "none", padding: "0", font: "inherit", cursor: "pointer" }}
                  >
                    {"Remove"}
                  </ToastButton>
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr .8fr .5fr", alignItems: "center", padding: "12px 20px", fontSize: "13px", borderTop: "1px solid var(--brd)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "500" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "2px", background: "#d9b679" }} />
                  {"Under Armour"}
                </span>
                <span style={{ fontSize: "12px", fontWeight: "400", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}>{"underarmour.com"}</span>
                <span style={{ fontSize: "12px", fontWeight: "400", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}>{"Apr 2026"}</span>
                <span style={{ textAlign: "right" }}>
                  <ToastButton
                    note="Competitor changes apply on live workspaces — this demo is read-only."
                    style={{ color: "var(--fnt)", background: "none", border: "none", padding: "0", font: "inherit", cursor: "pointer" }}
                  >
                    {"Remove"}
                  </ToastButton>
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr .8fr .5fr", alignItems: "center", padding: "12px 20px", fontSize: "13px", borderTop: "1px solid var(--brd)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "500" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "2px", background: "#d985a8" }} />
                  {"New Balance"}
                </span>
                <span style={{ fontSize: "12px", fontWeight: "400", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}>{"newbalance.com"}</span>
                <span style={{ fontSize: "12px", fontWeight: "400", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}>{"Jun 2026"}</span>
                <span style={{ textAlign: "right" }}>
                  <ToastButton
                    note="Competitor changes apply on live workspaces — this demo is read-only."
                    style={{ color: "var(--fnt)", background: "none", border: "none", padding: "0", font: "inherit", cursor: "pointer" }}
                  >
                    {"Remove"}
                  </ToastButton>
                </span>
              </div>
            </div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "16px", fontWeight: "600" }}>{"Tracked platforms"}<Hint text="AI tools we check — switch each on or off" /></div>
            <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "8px 20px", marginTop: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid var(--brd)", fontSize: "13px" }}>
                <span>{"ChatGPT"}</span>
                <Toggle label="Toggle ChatGPT tracking" note="Platform toggles apply on live workspaces." width={34} height={19} knob={15} radius={10} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid var(--brd)", fontSize: "13px" }}>
                <span>{"Perplexity"}</span>
                <Toggle label="Toggle Perplexity tracking" note="Platform toggles apply on live workspaces." width={34} height={19} knob={15} radius={10} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid var(--brd)", fontSize: "13px" }}>
                <span>{"Google AI Overviews"}</span>
                <Toggle label="Toggle Google AI Overviews tracking" note="Platform toggles apply on live workspaces." width={34} height={19} knob={15} radius={10} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid var(--brd)", fontSize: "13px" }}>
                <span>{"Claude"}</span>
                <Toggle label="Toggle Claude tracking" note="Platform toggles apply on live workspaces." width={34} height={19} knob={15} radius={10} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", fontSize: "13px" }}>
                <span>{"Gemini"}</span>
                <Toggle label="Toggle Gemini tracking" note="Platform toggles apply on live workspaces." width={34} height={19} knob={15} radius={10} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
