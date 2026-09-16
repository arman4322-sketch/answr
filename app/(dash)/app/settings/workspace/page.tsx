import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { getLiveMetrics } from "@/lib/live/metrics";
import { ToastButton } from "../DemoControls";
import SettingsRail from "../SettingsRail";
import { EmptyState, NoBrandPanel, brandLabel, fmtDayUTC } from "../states";
import BrandIdentityCard from "./BrandIdentityCard";

/* Settings — Workspace.

   Reads the configured workspace (lib/workspace) through the live metrics
   layer. Every value on this screen is one the deployment actually stores:
   brand, domain, category, the tracked prompt count and when the workspace was
   created. The region / time-zone / digest preferences that used to sit here
   were never persisted anywhere, so they are an honest empty state rather than
   selects claiming a setting nobody saved. */

export const metadata: Metadata = {
  title: "Workspace — Settings",
};

export const dynamic = "force-dynamic";

const NOT_WIRED = "Workspace details are set in onboarding — editing them here isn't wired up yet.";

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
const valueStyle: React.CSSProperties = { flex: 1, minWidth: 0, color: "var(--tx)", fontSize: "12.5px" };
const unsetStyle: React.CSSProperties = { ...valueStyle, color: "var(--fnt)" };

export default async function WorkspacePage() {
  const m = await getLiveMetrics();
  const ws = m.workspace;
  const brand = brandLabel(ws?.brand);

  return (
    <>
      <Topbar crumb={["Settings", "Workspace"]} brand={brand} showDateRange={false} showPlatforms={false} exportLabel={null} />
      <div style={{ flex: "1", display: "flex" }}>
        <SettingsRail />
        <div style={{ flex: "1", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "14px", maxWidth: "860px" }}>
          {!ws ? (
            <NoBrandPanel what="This workspace has no brand attached yet, so there is nothing to describe here." />
          ) : (
            <div style={card}>
              <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                Workspace
                <Hint text="Your team's shared account for one brand" />
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>
                Everyone you invite sees the same brand, prompts and reports.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "13px" }}>
                <div style={rowStyle}>
                  <span style={labelStyle}>Brand</span>
                  <span style={valueStyle}>{ws.brand}</span>
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>
                    Brand domain
                    <Hint text="The site we count as yours in citations" />
                  </span>
                  {ws.domain ? <span style={valueStyle}>{ws.domain}</span> : <span style={unsetStyle}>Not set</span>}
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>Category</span>
                  {ws.category ? <span style={valueStyle}>{ws.category}</span> : <span style={unsetStyle}>Not set</span>}
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>
                    Tracked prompts
                    <Hint text="Questions we ask AI for you" />
                  </span>
                  <span style={{ ...valueStyle, fontVariantNumeric: "tabular-nums" }}>
                    {m.promptsTracked === 0 ? "None yet" : `${m.promptsTracked}`}
                  </span>
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>Created</span>
                  <span style={{ ...valueStyle, fontVariantNumeric: "tabular-nums" }}>{fmtDayUTC(ws.createdAt)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Who this workspace actually tracks — the entity resolved from the
              brand name AND the website, plus anything else found using the
              same name. Rendered only when there is a workspace to describe;
              identityOf() guarantees the profile whenever one exists. */}
          {ws && m.identity && (
            <BrandIdentityCard
              identity={m.identity}
              nameCollisions={m.nameCollisions}
              answersSampled={m.answersSampled}
            />
          )}

          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              Defaults
              <Hint text="What every screen shows before you change filters" />
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>
              Per-workspace preferences — region, time zone, default date range and the weekly digest.
            </div>
            <div style={{ marginTop: "13px" }}>
              {/* No preference store exists — the screen says so instead of
                  showing selects that look saved and are not. */}
              <EmptyState
                line="No workspace defaults saved yet."
                note="Dashboards use the date range you pick in the topbar, and the sampler runs against every connected provider. Nothing on this card is persisted, so none of it is shown as configured."
              />
            </div>
          </div>

          <div style={{ ...card, borderColor: "rgba(229,99,110,.3)" }}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--bad)" }}>Danger zone</div>
            <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>
              Deleting a workspace removes its prompts, history and reports for everyone.
            </div>
            <div style={{ marginTop: "12px" }}>
              <ToastButton
                note={NOT_WIRED}
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
