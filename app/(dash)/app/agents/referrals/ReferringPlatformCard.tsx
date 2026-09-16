"use client";

import { useState } from "react";
import Hint from "@/components/ui/Hint";

/* "Referring platform" — real captured click-throughs, with the Share/Totals
   segmented control the design ships. Both views are the same captured counts
   read two ways, so they always agree; there is no change column, because a
   first-party referral store has no previous-period baseline to compare with. */

export type PlatformRow = { name: string; count: number; share: number };

const SEG_ACTIVE: React.CSSProperties = { fontWeight: 600, background: "var(--ac)", color: "#fff", borderRadius: "4px", padding: "3px 10px" };
const SEG_IDLE: React.CSSProperties = { color: "var(--mut)", padding: "3px 10px" };
const SEG_RESET: React.CSSProperties = { border: "none", fontFamily: "inherit", fontSize: "inherit", cursor: "pointer", background: "transparent" };

const GRID = "1.2fr 1.6fr .7fr";

export default function ReferringPlatformCard({ rows }: { rows: PlatformRow[] }) {
  const [view, setView] = useState<"share" | "totals">("share");
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 19px 11px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>
          {"Referring platform"}
          <Hint text="Which AI sent people to your site" />
        </span>
        <div style={{ display: "inline-flex", border: "1px solid var(--brd)", borderRadius: "6px", padding: "2px", fontSize: "11px" }}>
          <button type="button" aria-pressed={view === "share"} onClick={() => setView("share")} style={{ ...SEG_RESET, ...(view === "share" ? SEG_ACTIVE : SEG_IDLE) }}>
            {"Share"}
          </button>
          <button type="button" aria-pressed={view === "totals"} onClick={() => setView("totals")} style={{ ...SEG_RESET, ...(view === "totals" ? SEG_ACTIVE : SEG_IDLE) }}>
            {"Totals"}
          </button>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: GRID,
          padding: "7px 19px",
          fontSize: "11px",
          fontWeight: "500",
          color: "var(--fnt)",
          borderBottom: "1px solid var(--brd)",
        }}
      >
        <span>{"Platform"}</span>
        <span />
        <span>{view === "share" ? "Share" : "Referred"}</span>
      </div>
      {rows.length === 0 ? (
        <div
          style={{
            margin: "12px 19px 16px",
            padding: "14px",
            border: "1px dashed var(--brd)",
            borderRadius: "8px",
            background: "var(--bg0)",
            fontSize: "12px",
            color: "var(--fnt)",
            lineHeight: 1.6,
          }}
        >
          {"No assistant has sent a visitor here yet. The snippet classifies ChatGPT, Perplexity, Gemini, Claude, Copilot and Grok referrers — the first click-through fills this in."}
        </div>
      ) : (
        rows.map((r, i) => (
          <div
            key={r.name}
            className="row-hover"
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              alignItems: "center",
              padding: "10px 19px",
              fontSize: "13px",
              ...(i > 0 ? { borderTop: "1px solid var(--brd)" } : {}),
            }}
          >
            <span>{r.name}</span>
            <span style={{ height: "4px", background: "var(--bg2)", borderRadius: "2px" }}>
              <span style={{ display: "block", width: `${Math.round((r.count / max) * 100)}%`, height: "4px", background: "var(--ac)", borderRadius: "2px" }} />
            </span>
            <span style={{ fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>
              {view === "share" ? `${r.share}%` : r.count.toLocaleString("en-US")}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
