import type { Metadata } from "next";
import { cookies } from "next/headers";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { db } from "@/lib/db";
import type { User } from "@/lib/db/entities";
import { AUTH_COOKIE, sessionUser } from "@/lib/auth";
import { getWorkspace } from "@/lib/workspace";
import { ToastButton } from "../DemoControls";
import SettingsRail from "../SettingsRail";
import { EmptyState, brandLabel, fmtDayUTC, slugify } from "../states";

/* Settings — Team.

   The roster is the accounts that actually exist for this workspace (lib/auth →
   the `users` collection), not the four invented colleagues this screen used to
   list. Seats, invitations and per-member roles have no store, so each of those
   is an honest empty state or a plain statement that roles are not enforced
   yet. */

export const metadata: Metadata = {
  title: "Team — Settings",
};

export const dynamic = "force-dynamic";

const NOT_WIRED = "Team management isn't wired up yet — invites and roles are not stored.";

const card: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "16px 18px",
};

const ROLES = [
  ["Owner", "Everything, including billing and deleting the workspace"],
  ["Admin", "Everything except billing"],
  ["Editor", "Add prompts, ship actions, publish reports"],
  ["Viewer", "Read dashboards and download reports"],
];

const GRID = "1.8fr 1fr 90px";

export default async function TeamPage() {
  const jar = await cookies();
  const me = await sessionUser(jar.get(AUTH_COOKIE)?.value);
  const ws = await getWorkspace();
  const brand = brandLabel(ws?.brand);
  const slug = slugify(ws?.brand) || "workspace";

  /* Accounts that can open this workspace. With no session (the workspace was
     unlocked with the shared passphrase) there is no roster to read. */
  const members: User[] = me
    ? (await db().list<User>("users")).filter((u) => u.workspaceId === me.workspaceId).sort((a, b) => a.createdAt - b.createdAt)
    : [];

  const rows: string[][] = [["Name", "Email", "Joined"], ...members.map((u) => [u.name, u.email, fmtDayUTC(u.createdAt)])];
  const hasRows = rows.length > 1;

  return (
    <>
      <Topbar
        crumb={["Settings", "Team"]}
        brand={brand}
        showDateRange={false}
        showPlatforms={false}
        exportLabel={hasRows ? "Export team" : null}
        exportFilename={`${slug}-team.csv`}
        exportRows={hasRows ? rows : undefined}
        exportModule="Team"
        exportWindow="Accounts with access to this workspace — a point-in-time list, not a date window"
        actionNote="Nothing to export — no accounts are registered for this workspace."
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
                  {members.length === 0
                    ? "No accounts registered for this workspace."
                    : `${members.length} account${members.length === 1 ? "" : "s"} with access.`}
                </div>
              </div>
              <span style={{ marginLeft: "auto" }}>
                <ToastButton
                  note={NOT_WIRED}
                  className="btn-ac"
                  style={{ fontSize: "12.5px", fontWeight: 500, borderRadius: "7px", padding: "6px 14px", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                >
                  + Invite teammate
                </ToastButton>
              </span>
            </div>

            {members.length === 0 ? (
              <div style={{ marginTop: "13px" }}>
                <EmptyState
                  line="No team accounts to list."
                  note="This roster shows the accounts registered against the workspace. Sign in with an account (rather than the shared workspace passphrase) to see it."
                />
              </div>
            ) : (
              <div style={{ marginTop: "13px", border: "1px solid var(--brd)", borderRadius: "8px", overflow: "hidden" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: GRID,
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
                  <span>Joined</span>
                  <span />
                </div>
                {members.map((u, i) => (
                  <div
                    key={u.id}
                    className="row-hover"
                    style={{
                      display: "grid",
                      gridTemplateColumns: GRID,
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
                        {initials(u.name, u.email)}
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: "block" }}>
                          {u.name || u.email}
                          {me && u.id === me.id && <span style={{ color: "var(--fnt)", fontWeight: 400 }}>{" · you"}</span>}
                        </span>
                        <span style={{ display: "block", fontSize: "11px", color: "var(--fnt)" }}>{u.email}</span>
                      </span>
                    </span>
                    <span style={{ color: "var(--mut)", fontVariantNumeric: "tabular-nums" }}>{fmtDayUTC(u.createdAt)}</span>
                    <span style={{ textAlign: "right" }}>
                      <ToastButton
                        note={NOT_WIRED}
                        style={{ fontSize: "11.5px", background: "none", border: "none", color: "var(--mut)", cursor: "pointer", fontFamily: "inherit", padding: 0 }}
                      >
                        Remove
                      </ToastButton>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              Pending invites
              <Hint text="Invited people who have not joined yet" />
            </div>
            <div style={{ marginTop: "12px" }}>
              <EmptyState line="No pending invites." note="Invitations are not stored yet, so none can be outstanding." />
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              What each role can do
              <Hint text="Who is allowed to change what" />
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>
              Roles are not stored or enforced yet — every account with access sees the whole workspace.
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

function initials(name: string, email: string): string {
  const source = name?.trim() || email.split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]);
  return (letters.join("") || source.slice(0, 2)).toUpperCase();
}
