import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { ToastButton, SelectField } from "../DemoControls";
import SettingsRail from "../SettingsRail";

/* Settings — Team. Rail item existed in the canvas with no page; built here. */

export const metadata: Metadata = {
  title: "Team — Settings",
};

const NOTE = "Team changes apply on live workspaces.";

const card: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "16px 18px",
};

const MEMBERS = [
  { name: "Dana Okafor", email: "dana@nike.com", role: "Owner", initials: "DO", last: "Active now" },
  { name: "Priya Raman", email: "priya@nike.com", role: "Admin", initials: "PR", last: "2 hours ago" },
  { name: "Marc Lefevre", email: "marc@nike.com", role: "Editor", initials: "ML", last: "Yesterday" },
  { name: "Sam Whitfield", email: "sam@nike.com", role: "Viewer", initials: "SW", last: "4 days ago" },
];

const PENDING = [{ email: "agency@bravocreative.com", role: "Viewer", sent: "Sent Aug 3" }];

const ROLES = [
  ["Owner", "Everything, including billing and deleting the workspace"],
  ["Admin", "Everything except billing"],
  ["Editor", "Add prompts, ship actions, publish reports"],
  ["Viewer", "Read dashboards and download reports"],
];

const TEAM_ROWS: string[][] = [
  ["Name", "Email", "Role", "Last active"],
  ...MEMBERS.map((m) => [m.name, m.email, m.role, m.last]),
];

export default function TeamPage() {
  return (
    <>
      <Topbar
        crumb={["Settings", "Team"]}
        showDateRange={false}
        showPlatforms={false}
        exportLabel="Export team"
        exportFilename="nike-team.csv"
        exportRows={TEAM_ROWS}
        exportModule="Team"
        exportWindow="Team roster as of Aug 5, 2026 — a point-in-time list, not a date window"
      />
      <div style={{ flex: "1", display: "flex" }}>
        <SettingsRail />
        <div style={{ flex: "1", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "14px", maxWidth: "900px" }}>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                  Members
                  <Hint text="People who can open this workspace" />
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>
                  {MEMBERS.length} of 10 seats used on the Scale plan.
                </div>
              </div>
              <span style={{ marginLeft: "auto" }}>
                <ToastButton
                  note="Inviting teammates needs a live workspace — this demo is read-only."
                  className="btn-ac"
                  style={{ fontSize: "12.5px", fontWeight: 500, borderRadius: "7px", padding: "6px 14px", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                >
                  + Invite teammate
                </ToastButton>
              </span>
            </div>

            <div style={{ marginTop: "13px", border: "1px solid var(--brd)", borderRadius: "8px", overflow: "hidden" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr 1fr 1fr 90px",
                  padding: "9px 14px",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--fnt)",
                  borderBottom: "1px solid var(--brd)",
                }}
              >
                <span>Member</span>
                <span>Role</span>
                <span>Last active</span>
                <span />
              </div>
              {MEMBERS.map((m, i) => (
                <div
                  key={m.email}
                  className="row-hover"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.6fr 1fr 1fr 90px",
                    alignItems: "center",
                    padding: "11px 14px",
                    fontSize: "12.5px",
                    ...(i > 0 ? { borderTop: "1px solid var(--brd)" } : {}),
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0 }}>
                    <span
                      style={{
                        width: "24px",
                        height: "24px",
                        flex: "none",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#3e4046,#26272b)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "9px",
                        fontWeight: 600,
                        color: "var(--mut)",
                      }}
                    >
                      {m.initials}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block" }}>{m.name}</span>
                      <span style={{ display: "block", fontSize: "11px", color: "var(--fnt)" }}>{m.email}</span>
                    </span>
                  </span>
                  <span>
                    <SelectField defaultValue={m.role} items={["Owner", "Admin", "Editor", "Viewer"]} note={NOTE} />
                  </span>
                  <span style={{ color: "var(--mut)", fontVariantNumeric: "tabular-nums" }}>{m.last}</span>
                  <span style={{ textAlign: "right" }}>
                    <ToastButton
                      note={NOTE}
                      style={{ fontSize: "11.5px", background: "none", border: "none", color: "var(--mut)", cursor: "pointer", fontFamily: "inherit", padding: 0 }}
                    >
                      Remove
                    </ToastButton>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              Pending invites
              <Hint text="Invited people who have not joined yet" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginTop: "12px" }}>
              {PENDING.map((p) => (
                <div
                  key={p.email}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "9px 12px",
                    background: "var(--bg0)",
                    border: "1px solid var(--brd)",
                    borderRadius: "7px",
                    fontSize: "12.5px",
                  }}
                >
                  <span>{p.email}</span>
                  <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--mut)", border: "1px solid var(--brd)", borderRadius: "4px", padding: "2px 6px" }}>
                    {p.role}
                  </span>
                  <span style={{ marginLeft: "auto", color: "var(--fnt)", fontSize: "11px" }}>{p.sent}</span>
                  <ToastButton note={NOTE} style={{ fontSize: "11.5px", background: "none", border: "none", color: "var(--ac)", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
                    Resend
                  </ToastButton>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              What each role can do
              <Hint text="Who is allowed to change what" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginTop: "12px", fontSize: "12.5px" }}>
              {ROLES.map(([role, desc]) => (
                <div key={role} style={{ display: "flex", gap: "14px", alignItems: "baseline" }}>
                  <span style={{ width: "70px", flex: "none", fontWeight: 500 }}>{role}</span>
                  <span style={{ color: "var(--mut)" }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
