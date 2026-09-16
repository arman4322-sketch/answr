import Link from "next/link";
import { PIPELINE } from "@/lib/telemetry/pipeline";
import { dateTime, type AgentsView } from "./telemetryView";

/* The three honest states every Agent Analytics screen renders.

   1. Not configured  → set the brand up; nothing is being attributed yet.
   2. Configured, no events captured → the capture path IS installed and
      listening; we say so and show zeros, never a placeholder number.
   3. Events captured → the banner names the store, when it started collecting
      and whether it survives a redeploy, so a small count is read correctly. */

const CARD: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "22px 24px",
};

export function SetupState({ note }: { note: string }) {
  return (
    <div style={{ ...CARD, display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ fontSize: "15px", fontWeight: 600 }}>Set up your brand to start collecting data</div>
      <div style={{ fontSize: "12.5px", color: "var(--mut)", lineHeight: 1.6, maxWidth: "640px" }}>{note}</div>
      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
        <Link
          href="/onboarding/brand"
          className="btn-ac"
          style={{ fontSize: "12.5px", fontWeight: 500, borderRadius: "7px", padding: "7px 14px" }}
        >
          Set up brand
        </Link>
        <Link
          href="/app/settings"
          style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--mut)", background: "rgba(255,255,255,0.045)", borderRadius: "7px", padding: "7px 14px" }}
        >
          Settings
        </Link>
      </div>
    </div>
  );
}

/** Banner above every Agent Analytics screen: what the capture is, and what it has. */
export function CaptureBanner({ view, events, subject }: { view: AgentsView; events: number; subject: string }) {
  const listening = events === 0;
  const accent = listening ? "#e8b34b" : "#4cb782";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: listening ? "rgba(232,179,75,0.08)" : "rgba(76,183,130,0.07)",
        border: `1px solid color-mix(in oklab, ${accent} 32%, transparent)`,
        borderRadius: "10px",
        padding: "11px 14px",
        fontSize: "12.5px",
        color: "var(--mut)",
        lineHeight: 1.5,
      }}
    >
      <span
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: accent,
          border: `1px solid color-mix(in oklab, ${accent} 40%, transparent)`,
          borderRadius: "999px",
          padding: "3px 9px",
          whiteSpace: "nowrap",
        }}
      >
        {listening ? "Listening" : "Live data"}
      </span>
      <span>
        {listening ? (
          <>
            {`No ${subject} captured yet. The tracking snippet and edge capture are installed and listening on this deployment — `}
            {`${PIPELINE.uaPatterns} AI user-agent patterns and ${PIPELINE.referralSources} assistant referrers are matched on every request. `}
            {`Figures appear here the moment real traffic arrives; nothing is simulated in the meantime. `}
            <Link href="/app/live" style={{ color: "var(--ac)" }}>
              Pipeline status →
            </Link>
          </>
        ) : (
          <>
            {`Every figure on this screen is traffic captured on this deployment since ${dateTime(view.since)}. `}
            {view.store.durable
              ? "Events are stored durably."
              : "Events live in an in-process buffer, so a redeploy or a cold start resets the count."}
            {` Retention is the last ${PIPELINE.retention} events per store.`}
          </>
        )}
      </span>
      {view.store.degraded && (
        <span style={{ marginLeft: "auto", color: "#e5636e", fontSize: "11.5px", whiteSpace: "nowrap" }}>
          {`Store degraded: ${view.store.degraded}`}
        </span>
      )}
    </div>
  );
}

/** A card's "nothing captured yet" body — never a placeholder row. */
export function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        margin: "12px 20px 18px",
        padding: "14px",
        border: "1px dashed var(--brd)",
        borderRadius: "8px",
        background: "var(--bg0)",
        fontSize: "12px",
        color: "var(--fnt)",
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  );
}
