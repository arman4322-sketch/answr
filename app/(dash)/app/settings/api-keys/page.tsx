import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { getWorkspace } from "@/lib/workspace";
import { ToastButton } from "../DemoControls";
import SettingsRail from "../SettingsRail";
import { EmptyState, brandLabel } from "../states";

/* Settings — API keys.

   This deployment issues no API keys and serves no public API or MCP endpoint:
   there is no key store, no `/v1` route and no per-workspace MCP host. The
   three keys this screen used to list (with creation dates and "last used"
   stamps) and the per-workspace MCP URL were fixture, so they are gone. The
   only figure left is the rate limit that lib/ratelimit really enforces. */

export const metadata: Metadata = {
  title: "API keys — Settings",
};

export const dynamic = "force-dynamic";

const NOT_WIRED = "Key management isn't available yet — this deployment issues no API keys.";

const card: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "16px 18px",
};

export default async function ApiKeysPage() {
  const ws = await getWorkspace();
  const brand = brandLabel(ws?.brand);

  return (
    <>
      <Topbar crumb={["Settings", "API keys"]} brand={brand} showDateRange={false} showPlatforms={false} exportLabel={null} />
      <div style={{ flex: "1", display: "flex" }}>
        <SettingsRail />
        <div style={{ flex: "1", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "14px", maxWidth: "900px" }}>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                  API keys
                  <Hint text="Passwords that let other tools read your data" />
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>
                  Keys are shown once at creation. Rotate anything that leaks.
                </div>
              </div>
              <span style={{ marginLeft: "auto" }}>
                <ToastButton
                  note={NOT_WIRED}
                  className="btn-ac"
                  style={{ fontSize: "12.5px", fontWeight: 500, borderRadius: "7px", padding: "6px 14px", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                >
                  + Create key
                </ToastButton>
              </span>
            </div>

            <div style={{ marginTop: "13px" }}>
              <EmptyState
                line="No API keys."
                note="Programmatic access is not part of this deployment yet: there is no key store and no public API surface to authenticate against."
              />
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              MCP server
              <Hint text="Lets AI assistants query your Answr data" />
            </div>
            <div style={{ marginTop: "12px" }}>
              <EmptyState
                line="No MCP endpoint provisioned."
                note="An MCP host would let Claude, Cursor or ChatGPT query this workspace with a read-only key. Nothing is served for it today, so no address is shown."
              />
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              Rate limits
              <Hint text="How many requests you get per minute" />
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>
              What the app enforces today (lib/ratelimit), per caller IP.
            </div>
            <div style={{ display: "flex", gap: "28px", marginTop: "12px", fontSize: "12.5px", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "17px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>20 / min</div>
                <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "2px" }}>Brand, competitor and topic suggestion endpoints</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
