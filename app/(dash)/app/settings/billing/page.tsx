import type { Metadata } from "next";
import Link from "next/link";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { ToastButton } from "../DemoControls";
import SettingsRail from "../SettingsRail";

/* Settings — Billing. Rail item existed in the canvas with no page; built here.
   Plan/quota figures agree with the rest of the fixture: Scale plan,
   412 of 1,000 tracked prompts, 18 Demand searches left this month. */

export const metadata: Metadata = {
  title: "Billing — Settings",
};

const NOTE = "Billing changes need a live workspace — this demo is read-only.";

const card: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "16px 18px",
};

const USAGE = [
  { label: "Tracked prompts", used: 412, limit: 1000, display: "412 / 1,000", hint: "Questions we ask AI for you daily" },
  { label: "Demand searches", used: 12, limit: 30, display: "18 left this month", hint: "Keyword lookups you have left" },
  { label: "Team seats", used: 4, limit: 10, display: "4 / 10", hint: "People who can open this workspace" },
  { label: "Tracked brands", used: 3, limit: 5, display: "3 / 5", hint: "Separate brands you can measure" },
];

const INVOICES = [
  ["Aug 1, 2026", "INV-2026-0801", "$1,290.00", "Paid"],
  ["Jul 1, 2026", "INV-2026-0701", "$1,290.00", "Paid"],
  ["Jun 1, 2026", "INV-2026-0601", "$1,290.00", "Paid"],
  ["May 1, 2026", "INV-2026-0501", "$490.00", "Paid"],
];

const INVOICE_ROWS: string[][] = [["Date", "Invoice", "Amount", "Status"], ...INVOICES];

export default function BillingPage() {
  return (
    <>
      <Topbar
        crumb={["Settings", "Billing"]}
        showDateRange={false}
        showPlatforms={false}
        exportLabel="Export invoices"
        exportFilename="nike-invoices.csv"
        exportRows={INVOICE_ROWS}
        exportModule="Billing"
        exportWindow="Invoice history May 1 – Aug 1, 2026 — billing periods, not the workspace date range"
      />
      <div style={{ flex: "1", display: "flex" }}>
        <SettingsRail />
        <div style={{ flex: "1", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "14px", maxWidth: "900px" }}>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                  Current plan
                  <Hint text="What you pay for and what you get" />
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "8px" }}>
                  <span style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.01em" }}>Scale</span>
                  <span style={{ fontSize: "13px", color: "var(--mut)", fontVariantNumeric: "tabular-nums" }}>$1,290/mo · billed annually</span>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "5px" }}>Renews Sep 1, 2026 · 5 platforms, daily runs, MCP server included.</div>
              </div>
              <span style={{ marginLeft: "auto", display: "flex", gap: "8px", flex: "none" }}>
                <Link
                  href="/pricing"
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 500,
                    borderRadius: "7px",
                    padding: "7px 14px",
                    border: "1px solid var(--brd)",
                    color: "var(--tx)",
                  }}
                >
                  Compare plans
                </Link>
                <ToastButton
                  note={NOTE}
                  className="btn-ac"
                  style={{ fontSize: "12.5px", fontWeight: 500, borderRadius: "7px", padding: "7px 14px", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                >
                  Change plan
                </ToastButton>
              </span>
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              Usage this period
              <Hint text="How much of your plan you have used" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "13px", marginTop: "14px" }}>
              {USAGE.map((u) => {
                const pct = Math.round((u.used / u.limit) * 100);
                return (
                  <div key={u.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "6px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {u.label}
                        <Hint text={u.hint} />
                      </span>
                      <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}>{u.display}</span>
                    </div>
                    <div style={{ height: "4px", background: "var(--bg2)", borderRadius: "2px" }}>
                      <div style={{ width: `${pct}%`, height: "4px", background: pct > 85 ? "var(--gold)" : "var(--ac)", borderRadius: "2px" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              Payment method
              <Hint text="The card we charge each renewal" />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "12px",
                padding: "11px 13px",
                background: "var(--bg0)",
                border: "1px solid var(--brd)",
                borderRadius: "7px",
                fontSize: "12.5px",
              }}
            >
              <span style={{ fontWeight: 500 }}>Visa ending 4242</span>
              <span style={{ color: "var(--fnt)" }}>Expires 04 / 2029</span>
              <span style={{ marginLeft: "auto" }}>
                <ToastButton note={NOTE} style={{ fontSize: "11.5px", background: "none", border: "none", color: "var(--ac)", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
                  Update
                </ToastButton>
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "9px" }}>
              Billing contact: dana@nike.com · Invoices are emailed on renewal.
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              Invoices
              <Hint text="Receipts for everything you have paid" />
            </div>
            <div style={{ marginTop: "12px", border: "1px solid var(--brd)", borderRadius: "8px", overflow: "hidden" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.2fr .8fr .8fr",
                  padding: "9px 14px",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--fnt)",
                  borderBottom: "1px solid var(--brd)",
                }}
              >
                <span>Date</span>
                <span>Invoice</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              {INVOICES.map((inv, i) => (
                <div
                  key={inv[1]}
                  className="row-hover"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.2fr .8fr .8fr",
                    alignItems: "center",
                    padding: "11px 14px",
                    fontSize: "12.5px",
                    fontVariantNumeric: "tabular-nums",
                    ...(i > 0 ? { borderTop: "1px solid var(--brd)" } : {}),
                  }}
                >
                  <span>{inv[0]}</span>
                  <span style={{ color: "var(--mut)" }}>{inv[1]}</span>
                  <span>{inv[2]}</span>
                  <span style={{ color: "var(--good)" }}>{inv[3]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
