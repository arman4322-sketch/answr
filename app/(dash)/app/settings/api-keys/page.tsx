import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { ToastButton } from "../DemoControls";
import SettingsRail from "../SettingsRail";

/* Settings — API keys. Rail item existed in the canvas with no page; built here.
   Also surfaces the MCP server, which the pricing page bills on the Scale plan. */

export const metadata: Metadata = {
  title: "API keys — Settings",
};

const NOTE = "Key management needs a live workspace — this demo is read-only.";

const card: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "16px 18px",
};

const KEYS = [
  { name: "Production", masked: "answr_sk_live_••••••••••••4f2a", scope: "Read + write", created: "Mar 12, 2026", used: "2 minutes ago" },
  { name: "Looker Studio connector", masked: "answr_sk_live_••••••••••••9c17", scope: "Read only", created: "Apr 2, 2026", used: "Today, 06:00" },
  { name: "CI smoke tests", masked: "answr_sk_test_••••••••••••1b83", scope: "Read only", created: "Jun 19, 2026", used: "3 days ago" },
];

const KEY_ROWS: string[][] = [
  ["Name", "Key", "Scope", "Created", "Last used"],
  ...KEYS.map((k) => [k.name, k.masked, k.scope, k.created, k.used]),
];

export default function ApiKeysPage() {
  return (
    <>
      <Topbar
        crumb={["Settings", "API keys"]}
        showDateRange={false}
        showPlatforms={false}
        exportLabel="Export keys"
        exportFilename="nike-api-keys.csv"
        exportRows={KEY_ROWS}
        exportModule="API keys"
        exportWindow="Key inventory as of Aug 5, 2026 — a point-in-time list, not a date window"
      />
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
                  note={NOTE}
                  className="btn-ac"
                  style={{ fontSize: "12.5px", fontWeight: 500, borderRadius: "7px", padding: "6px 14px", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                >
                  + Create key
                </ToastButton>
              </span>
            </div>

            <div style={{ marginTop: "13px", border: "1px solid var(--brd)", borderRadius: "8px", overflow: "hidden" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.1fr 1.5fr .8fr .8fr 80px",
                  padding: "9px 14px",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--fnt)",
                  borderBottom: "1px solid var(--brd)",
                }}
              >
                <span>Name</span>
                <span>Key</span>
                <span>Scope</span>
                <span>Last used</span>
                <span />
              </div>
              {KEYS.map((k, i) => (
                <div
                  key={k.masked}
                  className="row-hover"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.1fr 1.5fr .8fr .8fr 80px",
                    alignItems: "center",
                    padding: "11px 14px",
                    fontSize: "12.5px",
                    ...(i > 0 ? { borderTop: "1px solid var(--brd)" } : {}),
                  }}
                >
                  <span>{k.name}</span>
                  <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "11.5px", color: "var(--mut)" }}>{k.masked}</span>
                  <span style={{ color: "var(--mut)" }}>{k.scope}</span>
                  <span style={{ color: "var(--mut)", fontVariantNumeric: "tabular-nums" }}>{k.used}</span>
                  <span style={{ textAlign: "right" }}>
                    <ToastButton
                      note={NOTE}
                      style={{ fontSize: "11.5px", background: "none", border: "none", color: "var(--bad)", cursor: "pointer", fontFamily: "inherit", padding: 0 }}
                    >
                      Revoke
                    </ToastButton>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              MCP server
              <Hint text="Lets AI assistants query your Answr data" />
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>
              Included on Scale. Point Claude, Cursor or ChatGPT at this endpoint with a read-only key.
            </div>
            <div
              style={{
                marginTop: "12px",
                padding: "10px 12px",
                background: "var(--bg0)",
                border: "1px solid var(--brd)",
                borderRadius: "7px",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "11.5px",
                color: "var(--mut)",
                overflowX: "auto",
                whiteSpace: "nowrap",
              }}
            >
              https://mcp.answr.io/v1/nike
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              Rate limits
              <Hint text="How many requests you get per minute" />
            </div>
            <div style={{ display: "flex", gap: "28px", marginTop: "12px", fontSize: "12.5px", flexWrap: "wrap" }}>
              {[
                ["600 / min", "Read endpoints"],
                ["60 / min", "Write endpoints"],
                ["10 / min", "Export endpoints"],
              ].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontSize: "17px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{v}</div>
                  <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "2px" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
