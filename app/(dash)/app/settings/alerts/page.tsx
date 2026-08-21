import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { ToastButton, Toggle } from "../DemoControls";
import SettingsRail from "../SettingsRail";

/* Settings — Notifications (frame #m-alerts; audit fixes: full 8-item rail via
   SettingsRail, page title matches the rail label). */

export const metadata: Metadata = {
  title: "Notifications — Settings",
};

const ALERT_NOTE = "Alert toggles apply on live workspaces.";

/* Alerts fixture table, downloaded by the Topbar export. */
const ALERT_ROWS: string[][] = [
  ["Alert", "Cadence · channel", "Status"],
  ["New domain cites Nike", "instant · Slack #aeo-alerts", "ACTIVE"],
  ["Visibility drops > 3pt week-over-week", "daily check · email dana@nike.com", "ACTIVE"],
  ["Competitor overtakes a topic you lead", "daily check · Slack + email", "ACTIVE"],
  ["Blocked-crawler spike", "hourly · Slack #aeo-alerts", "PAUSED"],
];

export default function NotificationsSettingsPage() {
  return (
    <>
      <Topbar
        crumb={["Settings", "Notifications"]}
        rangeNote="Notification rules are current settings, not a reported window. The date range re-slices Overview, Insights, Citations and Agent Analytics."
        platformNote="Notification rules apply to every platform — they aren't split by the platform filter."
        exportFilename="nike-alerts.csv"
        exportRows={ALERT_ROWS}
        exportWindow="Notification rules as configured on Aug 5, 2026 — settings, not a date window"
      />
      <div className="frame-m-alerts" style={{ flex: "1", display: "flex" }}>
        <SettingsRail />
        <div style={{ flex: "1", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "16px", fontWeight: "600" }}>{"Notifications"}<Hint text="Warnings we send when something changes" /></div>
            <ToastButton
              className="btn-ac"
              note="Creating an alert needs a live workspace — this demo is read-only."
              style={{ fontSize: "12.5px", fontWeight: "500", borderRadius: "7px", padding: "6px 14px", border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              {"+ New alert"}
            </ToastButton>
          </div>
          <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px" }}>
              <div style={{ flex: "1" }}>
                <div style={{ fontSize: "13px", fontWeight: "500" }}>{"New domain cites Nike"}</div>
                <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "2px" }}>{"instant · Slack #aeo-alerts"}</div>
              </div>
              <Hint text="This alert is switched on" align="right" size={12} />
              <span style={{ fontSize: "10px", fontWeight: "600", color: "#4cb782", border: "1px solid rgba(76,183,130,.4)", borderRadius: "4px", padding: "2px 7px" }}>{"ACTIVE"}</span>
              <Toggle label="Toggle alert: New domain cites Nike" note={ALERT_NOTE} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", borderTop: "1px solid var(--brd)" }}>
              <div style={{ flex: "1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "500" }}>{"Visibility drops > 3pt week-over-week"}<Hint text="Warn me if visibility falls this much" size={12} /></div>
                <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "2px" }}>{"daily check · email dana@nike.com"}</div>
              </div>
              <Hint text="This alert is switched on" align="right" size={12} />
              <span style={{ fontSize: "10px", fontWeight: "600", color: "#4cb782", border: "1px solid rgba(76,183,130,.4)", borderRadius: "4px", padding: "2px 7px" }}>{"ACTIVE"}</span>
              <Toggle label="Toggle alert: Visibility drops week-over-week" note={ALERT_NOTE} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", borderTop: "1px solid var(--brd)" }}>
              <div style={{ flex: "1" }}>
                <div style={{ fontSize: "13px", fontWeight: "500" }}>{"Competitor overtakes a topic you lead"}</div>
                <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "2px" }}>{"daily check · Slack + email"}</div>
              </div>
              <Hint text="This alert is switched on" align="right" size={12} />
              <span style={{ fontSize: "10px", fontWeight: "600", color: "#4cb782", border: "1px solid rgba(76,183,130,.4)", borderRadius: "4px", padding: "2px 7px" }}>{"ACTIVE"}</span>
              <Toggle label="Toggle alert: Competitor overtakes a topic you lead" note={ALERT_NOTE} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", borderTop: "1px solid var(--brd)", opacity: ".65" }}>
              <div style={{ flex: "1" }}>
                <div style={{ fontSize: "13px", fontWeight: "500" }}>{"Blocked-crawler spike"}</div>
                <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "2px" }}>{"hourly · Slack #aeo-alerts"}</div>
              </div>
              <Hint text="This alert is switched off" align="right" size={12} />
              <span style={{ fontSize: "10px", fontWeight: "600", color: "var(--mut)", border: "1px solid var(--brd)", borderRadius: "4px", padding: "2px 7px" }}>{"PAUSED"}</span>
              <Toggle label="Toggle alert: Blocked-crawler spike" note={ALERT_NOTE} defaultOn={false} />
            </div>
          </div>
          <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600" }}>{"Channels"}<Hint text="Where these alerts get sent" /></div>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
              <ToastButton
                note="Channel settings apply on live workspaces — this demo is read-only."
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: "12px",
                  background: "var(--bg0)",
                  border: "1px solid var(--brd)",
                  borderRadius: "7px",
                  padding: "7px 12px",
                  color: "var(--tx)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4cb782" }} />
                {"Slack — #aeo-alerts"}
              </ToastButton>
              <ToastButton
                note="Channel settings apply on live workspaces — this demo is read-only."
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: "12px",
                  background: "var(--bg0)",
                  border: "1px solid var(--brd)",
                  borderRadius: "7px",
                  padding: "7px 12px",
                  color: "var(--tx)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4cb782" }} />
                {"Email — 2 recipients"}
              </ToastButton>
              <ToastButton
                note="Adding a webhook needs a live workspace — this demo is read-only."
                style={{ fontSize: "12px", color: "var(--fnt)", border: "1px dashed var(--brd)", borderRadius: "7px", padding: "7px 12px", background: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                {"+ Webhook"}
              </ToastButton>
            </div>
          </div>
          <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600" }}>{"Recent"}<Hint text="Alerts that fired lately" /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px", fontSize: "12px", color: "var(--mut)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  <span style={{ color: "var(--tx)", fontWeight: "500" }}>{"letsrun.com"}</span>
                  {" cited Nike for the first time"}
                </span>
                <span style={{ color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{"2h ago"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{'"Sustainability" — Asics overtook Nike'}</span>
                <span style={{ color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{"Jul 30"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
