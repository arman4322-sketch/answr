import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { SelectField, ToastButton, Toggle } from "../DemoControls";
import SettingsRail from "../SettingsRail";

/* Settings — Platforms (frame #settings-platforms; audit fix: Gemini un-paused). */

export const metadata: Metadata = {
  title: "Platforms — Settings",
};

const TOGGLE_NOTE = "Platform toggles apply on live workspaces.";

export default function PlatformsSettingsPage() {
  return (
    <>
      <Topbar
        crumb={["Settings", "Platforms"]}
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
        extra={
          <>
            <span style={{ fontSize: "11.5px", color: "var(--fnt)" }}>Changes apply from the next run</span>
            <ToastButton
              className="btn-ac"
              note="Saving changes needs a live workspace — this demo is read-only."
              style={{ fontSize: "12.5px", fontWeight: 500, borderRadius: "7px", padding: "6px 14px", border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              Save changes
            </ToastButton>
          </>
        }
      />
      <div className="frame-settings-platforms" style={{ flex: "1", display: "flex" }}>
        <SettingsRail />
        <div style={{ flex: "1", padding: "28px 32px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "860px" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "600" }}>{"Platforms"}</div>
            <div style={{ fontSize: "12.5px", color: "var(--mut)", marginTop: "4px" }}>
              {"Where your prompt set runs. All five are on by default for new workspaces — pausing one excludes it from scores until re-enabled."}
            </div>
            <div style={{ marginTop: "14px" }}>
              <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 19px 11px" }}>
                  <div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>{"Monitored platforms"}<Hint text="AI tools we ask your questions on" /></span>
                    <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>{"Your 412 prompts run on every enabled platform, daily at the scheduled time."}</div>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{"5 OF 5 ENABLED"}<Hint text="Switched off ones are left out of scores" align="right" size={12} /></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "13px 19px", borderBottom: "1px solid var(--brd)" }}>
                  <div style={{ minWidth: "0", flex: "1" }}>
                    <div style={{ fontSize: "13px", fontWeight: "500" }}>{"ChatGPT"}</div>
                    <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "2px" }}>{"GPT-5 · web-enabled sampling"}</div>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{"412 prompts / day"}</span>
                  <Toggle label="Toggle ChatGPT monitoring" note={TOGGLE_NOTE} width={30} height={18} knob={14} radius={9} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "13px 19px", borderBottom: "1px solid var(--brd)" }}>
                  <div style={{ minWidth: "0", flex: "1" }}>
                    <div style={{ fontSize: "13px", fontWeight: "500" }}>{"Perplexity"}</div>
                    <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "2px" }}>{"Sonar · citations native"}</div>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{"412 prompts / day"}</span>
                  <Toggle label="Toggle Perplexity monitoring" note={TOGGLE_NOTE} width={30} height={18} knob={14} radius={9} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "13px 19px", borderBottom: "1px solid var(--brd)" }}>
                  <div style={{ minWidth: "0", flex: "1" }}>
                    <div style={{ fontSize: "13px", fontWeight: "500" }}>{"Google AI Overviews"}</div>
                    <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "2px" }}>{"US + EU result pages"}</div>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{"388 prompts trigger an overview"}</span>
                  <Toggle label="Toggle Google AI Overviews monitoring" note={TOGGLE_NOTE} width={30} height={18} knob={14} radius={9} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "13px 19px", borderBottom: "1px solid var(--brd)" }}>
                  <div style={{ minWidth: "0", flex: "1" }}>
                    <div style={{ fontSize: "13px", fontWeight: "500" }}>{"Claude"}</div>
                    <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "2px" }}>{"Sonnet · web search on"}</div>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{"412 prompts / day"}</span>
                  <Toggle label="Toggle Claude monitoring" note={TOGGLE_NOTE} width={30} height={18} knob={14} radius={9} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "13px 19px" }}>
                  <div style={{ minWidth: "0", flex: "1" }}>
                    <div style={{ fontSize: "13px", fontWeight: "500" }}>{"Gemini"}</div>
                    <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "2px" }}>{"2.5 Pro"}</div>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{"412 prompts / day"}</span>
                  <Toggle label="Toggle Gemini monitoring" note={TOGGLE_NOTE} width={30} height={18} knob={14} radius={9} />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "16px", fontWeight: "600" }}>{"Schedule & quota"}<Hint text="When we ask, and how much you get" /></div>
            <div style={{ fontSize: "12.5px", color: "var(--mut)", marginTop: "4px" }}>{"One run per day on the Scale plan. Manual runs don't count against quota."}</div>
            <div style={{ marginTop: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "17px 19px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>{"Run schedule"}<Hint text="When we ask AI your questions" /></div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                    <SelectField
                      defaultValue="Daily at 02:00 UTC"
                      items={["Daily at 02:00 UTC", "Daily at 08:00 UTC", "Daily at 14:00 UTC", "Twice daily · 02:00 & 14:00 UTC"]}
                      note="Schedule changes apply on live workspaces — the demo runs a fixed fixture."
                    />
                    <ToastButton
                      note="Manual runs start on live workspaces — this demo is read-only."
                      style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "var(--mut)",
                        border: "1px solid var(--brd)",
                        borderRadius: "7px",
                        padding: "8px 14px",
                        background: "var(--bg2)",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {"Run now"}
                    </ToastButton>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "var(--fnt)", marginTop: "12px", fontVariantNumeric: "tabular-nums" }}>
                    <span>{"Next run in 6h 12m"}</span>
                    <span>{"Last: Aug 5, 02:00 · 412 prompts · 5 platforms ✓"}</span>
                  </div>
                </div>
                <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "17px 19px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>{"Prompt quota"}<Hint text="How many questions your plan allows" /></span>
                    <span style={{ fontSize: "11px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{"SCALE PLAN"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "12px" }}>
                    <span style={{ fontSize: "20px", fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>{"412"}</span>
                    <span style={{ fontSize: "12px", color: "var(--fnt)" }}>{"of 1,000 tracked prompts"}</span>
                  </div>
                  <div style={{ height: "5px", background: "var(--bg2)", borderRadius: "3px", marginTop: "10px" }}>
                    <div style={{ width: "41%", height: "5px", background: "var(--ac)", borderRadius: "3px" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "var(--fnt)", marginTop: "10px" }}>
                    <span>{"Demand searches: 18 left this month"}</span>
                    <ToastButton
                      note="Plan changes apply on live workspaces — this demo is read-only."
                      style={{ font: "inherit", color: "var(--ac)", fontWeight: "500", background: "none", border: "none", padding: "0", cursor: "pointer" }}
                    >
                      {"Manage plan"}
                    </ToastButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
