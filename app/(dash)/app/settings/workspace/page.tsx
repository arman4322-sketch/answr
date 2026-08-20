import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { ToastButton, Toggle, SelectField } from "../DemoControls";
import SettingsRail from "../SettingsRail";

/* Settings — Workspace. Rail item existed since the original canvas but had no
   page; built here so every sub-nav entry resolves. */

export const metadata: Metadata = {
  title: "Workspace — Settings",
};

const NOTE = "Workspace settings apply on live workspaces.";

const card: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "16px 18px",
};
const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 12px",
  background: "var(--bg0)",
  border: "1px solid var(--brd)",
  borderRadius: "7px",
  fontSize: "12.5px",
};
const labelStyle: React.CSSProperties = { width: "150px", flex: "none", color: "var(--mut)", fontSize: "11.5px" };
const valueBox: React.CSSProperties = {
  flex: 1,
  background: "transparent",
  border: "none",
  color: "var(--tx)",
  fontSize: "12.5px",
  fontFamily: "inherit",
  outline: "none",
  minWidth: 0,
};

export default function WorkspacePage() {
  return (
    <>
      <Topbar crumb={["Settings", "Workspace"]} showDateRange={false} showPlatforms={false} exportLabel={null} />
      <div style={{ flex: "1", display: "flex" }}>
        <SettingsRail />
        <div style={{ flex: "1", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "14px", maxWidth: "860px" }}>
          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              Workspace
              <Hint text="Your team's shared account for one brand" />
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>
              Everyone you invite sees the same brands, prompts and reports.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "13px" }}>
              <div style={rowStyle}>
                <span style={labelStyle}>Workspace name</span>
                <input defaultValue="Nike" aria-label="Workspace name" style={valueBox} />
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Workspace URL</span>
                <span style={{ color: "var(--fnt)" }}>answr.io/</span>
                <input defaultValue="nike" aria-label="Workspace URL slug" style={{ ...valueBox, flex: "none", width: "160px" }} />
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>
                  Primary region
                  <Hint text="Where we run prompts from by default" />
                </span>
                <SelectField defaultValue="United States" items={["United States", "Canada", "United Kingdom", "DACH", "France"]} note={NOTE} />
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Time zone</span>
                <SelectField defaultValue="America/New_York" items={["America/New_York", "America/Toronto", "Europe/London", "Europe/Berlin"]} note={NOTE} />
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              Defaults
              <Hint text="What every screen shows before you change filters" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "13px" }}>
              <div style={rowStyle}>
                <span style={labelStyle}>Default date range</span>
                <SelectField defaultValue="Last 30 days" items={["Last 7 days", "Last 30 days", "Last 90 days", "Year to date"]} note={NOTE} />
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>
                  Weekly digest
                  <Hint text="Monday email summarising last week's movement" />
                </span>
                <span style={{ color: "var(--mut)" }}>Send every Monday, 8:00</span>
                <span style={{ marginLeft: "auto" }}>
                  <Toggle label="Toggle weekly digest" note={NOTE} />
                </span>
              </div>
            </div>
          </div>

          <div style={{ ...card, borderColor: "rgba(229,99,110,.3)" }}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--bad)" }}>Danger zone</div>
            <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>
              Deleting a workspace removes its prompts, history and reports for everyone.
            </div>
            <div style={{ marginTop: "12px" }}>
              <ToastButton
                note="Deleting a workspace is disabled in the demo."
                style={{
                  fontSize: "12.5px",
                  fontWeight: 500,
                  borderRadius: "7px",
                  padding: "7px 14px",
                  border: "1px solid rgba(229,99,110,.4)",
                  background: "transparent",
                  color: "var(--bad)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Delete workspace
              </ToastButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
