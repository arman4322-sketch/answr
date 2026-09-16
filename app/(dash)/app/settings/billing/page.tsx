import type { Metadata } from "next";
import Link from "next/link";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { getLiveMetrics } from "@/lib/live/metrics";
import { ToastButton } from "../DemoControls";
import SettingsRail from "../SettingsRail";
import { EmptyState, brandLabel } from "../states";

/* Settings — Billing.

   No billing provider is connected to this deployment: no subscription, no
   payment method, no invoice history and no enforced plan quota. The plan name,
   the monthly price, the renewal date, the paid invoices, the card on file and
   the billing contact this screen used to show were all fixture and are gone.

   What remains is real: the usage counters below are the workspace's actual
   tracked prompts, competitors and sampled answers, shown as counts rather than
   as progress bars against a limit nobody is enforcing. */

export const metadata: Metadata = {
  title: "Billing — Settings",
};

export const dynamic = "force-dynamic";

const NOT_WIRED = "Billing isn't connected to this deployment — there is no subscription to change.";

const card: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "16px 18px",
};

export default async function BillingPage() {
  const m = await getLiveMetrics();
  const ws = m.workspace;
  const brand = brandLabel(ws?.brand);

  const usage: { label: string; value: string; hint: string }[] = [
    { label: "Tracked prompts", value: `${m.promptsTracked}`, hint: "Questions we ask AI for you daily" },
    { label: "Tracked competitors", value: `${ws?.competitors.length ?? 0}`, hint: "Rivals in your share-of-voice split" },
    { label: "Answers sampled", value: `${m.answersSampled}`, hint: "Replies collected so far" },
    { label: "Days of history", value: `${m.days}`, hint: "Days the sampler has actually run" },
  ];

  return (
    <>
      <Topbar crumb={["Settings", "Billing"]} brand={brand} showDateRange={false} showPlatforms={false} exportLabel={null} />
      <div style={{ flex: "1", display: "flex" }}>
        <SettingsRail />
        <div style={{ flex: "1", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "14px", maxWidth: "900px" }}>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                  Current plan
                  <Hint text="What you pay for and what you get" />
                </div>
                <div style={{ marginTop: "12px" }}>
                  <EmptyState
                    line="No subscription on this workspace."
                    note="Billing is not connected to this deployment, so nothing is being charged and no plan limits are enforced."
                  />
                </div>
              </div>
              <span style={{ display: "flex", gap: "8px", flex: "none" }}>
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
                  note={NOT_WIRED}
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
              Usage
              <Hint text="What this workspace is actually using" />
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>
              Live counts from the workspace and the sampler. No plan limit is applied to them.
            </div>
            <div style={{ display: "flex", gap: "28px", marginTop: "14px", flexWrap: "wrap" }}>
              {usage.map((u) => (
                <div key={u.label}>
                  <div style={{ fontSize: "19px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{u.value}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--fnt)", marginTop: "3px" }}>
                    {u.label}
                    <Hint text={u.hint} size={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              Payment method
              <Hint text="The card we charge each renewal" />
            </div>
            <div style={{ marginTop: "12px" }}>
              <EmptyState line="No payment method on file." note="No card or billing contact is stored for this workspace." />
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              Invoices
              <Hint text="Receipts for everything you have paid" />
            </div>
            <div style={{ marginTop: "12px" }}>
              <EmptyState line="No invoices." note="Nothing has been billed, so there is no receipt history to show." />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
