import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { getWorkspace } from "@/lib/workspace";
import { ToastButton } from "../DemoControls";
import SettingsRail from "../SettingsRail";
import { EmptyState, brandLabel } from "../states";

/* Settings — Notifications.

   Alert rules, delivery channels and the fired-alert history have no store in
   this deployment: nothing writes them, nothing reads them, and no job
   evaluates a threshold. The screen therefore shows three honest empty states
   instead of the rules it used to list ("New domain cites <brand>", a
   week-over-week visibility threshold, a Slack channel, two recipients) — every
   one of which was fixture text with nothing behind it. */

export const metadata: Metadata = {
  title: "Notifications — Settings",
};

export const dynamic = "force-dynamic";

const NOT_WIRED = "Alerting isn't wired up yet — no rules are stored and nothing is sent.";

const card: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "14px 16px",
};

export default async function NotificationsSettingsPage() {
  const ws = await getWorkspace();
  const brand = brandLabel(ws?.brand);

  return (
    <>
      <Topbar
        crumb={["Settings", "Notifications"]}
        brand={brand}
        rangeNote="Notification rules are current settings, not a reported window. The date range re-slices Overview, Insights, Citations and Agent Analytics."
        platformNote="Notification rules apply to every platform — they aren't split by the platform filter."
        exportLabel={null}
      />
      <div className="frame-m-alerts" style={{ flex: "1", display: "flex" }}>
        <SettingsRail />
        <div style={{ flex: "1", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "16px", fontWeight: "600" }}>{"Notifications"}<Hint text="Warnings we send when something changes" /></div>
            <ToastButton
              className="btn-ac"
              note={NOT_WIRED}
              style={{ fontSize: "12.5px", fontWeight: "500", borderRadius: "7px", padding: "6px 14px", border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              {"+ New alert"}
            </ToastButton>
          </div>
          <div style={{ ...card, padding: "16px" }}>
            <EmptyState
              line="No alert rules yet."
              note={
                ws
                  ? `Rules would watch ${ws.brand}'s sampled answers — a new domain citing you, a visibility drop, a competitor overtaking a topic — and notify you when one fires. None are stored, so nothing is being watched.`
                  : "Rules watch your sampled answers and notify you when something moves. None are stored, so nothing is being watched."
              }
            />
          </div>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600" }}>{"Channels"}<Hint text="Where these alerts get sent" /></div>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: "1", minWidth: "260px" }}>
                <EmptyState line="No delivery channels connected." note="Slack, email and webhook delivery are not configured for this workspace." />
              </div>
              <ToastButton
                note={NOT_WIRED}
                style={{ fontSize: "12px", color: "var(--fnt)", border: "1px dashed var(--brd)", borderRadius: "7px", padding: "7px 12px", background: "none", cursor: "pointer", fontFamily: "inherit", flex: "none" }}
              >
                {"+ Webhook"}
              </ToastButton>
            </div>
          </div>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600" }}>{"Recent"}<Hint text="Alerts that fired lately" /></div>
            <div style={{ marginTop: "10px" }}>
              <EmptyState line="No alerts have fired." note="This list fills in once alert rules exist and one of them triggers." />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
