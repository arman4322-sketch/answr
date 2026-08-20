"use client";

import { useState } from "react";
import Hint from "@/components/ui/Hint";

/* "Referring platform" card (frame #p2-referrals) with a real Share/Totals
   segmented control: Totals swaps the % column for referred-human counts
   derived from the page's own 3,412 fixture total (sums exactly to 3,412).
   Markup/styling of the depicted Share view is verbatim from the frame. */

const ROWS: { name: string; pct: number; opacity?: number; total: string; delta: string; deltaColor: string }[] = [
  { name: "ChatGPT", pct: 55, total: "1,876", delta: "↑ 4", deltaColor: "#4cb782" },
  { name: "Perplexity", pct: 24, opacity: 0.75, total: "819", delta: "↓ 2", deltaColor: "#e5636e" },
  { name: "Gemini", pct: 10, opacity: 0.55, total: "341", delta: "↑ 1", deltaColor: "#4cb782" },
  { name: "Copilot", pct: 6, opacity: 0.4, total: "205", delta: "—", deltaColor: "var(--fnt)" },
  { name: "Claude", pct: 5, opacity: 0.3, total: "171", delta: "↑ 1", deltaColor: "#4cb782" },
];

const SEG_ACTIVE: React.CSSProperties = { fontWeight: 600, background: "var(--ac)", color: "#fff", borderRadius: "4px", padding: "3px 10px" };
const SEG_IDLE: React.CSSProperties = { color: "var(--mut)", padding: "3px 10px" };
const SEG_RESET: React.CSSProperties = { border: "none", fontFamily: "inherit", fontSize: "inherit", cursor: "pointer", background: "transparent" };

export default function ReferringPlatformCard() {
  const [view, setView] = useState<"share" | "totals">("share");
  return (
    <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 19px 11px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>{"Referring platform"}<Hint text="Which AI sent people to your site" /></span>
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
          gridTemplateColumns: "1.2fr 1.6fr .6fr .6fr",
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
        <span>{"Δ"}</span>
      </div>
      {ROWS.map((r, i) => (
        <div
          key={r.name}
          className="row-hover"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1.6fr .6fr .6fr",
            alignItems: "center",
            padding: "10px 19px",
            fontSize: "13px",
            ...(i > 0 ? { borderTop: "1px solid var(--brd)" } : {}),
          }}
        >
          <span>{r.name}</span>
          <span style={{ height: "4px", background: "var(--bg2)", borderRadius: "2px" }}>
            <span style={{ display: "block", width: `${r.pct}%`, height: "4px", background: "var(--ac)", ...(r.opacity ? { opacity: `${r.opacity}` } : {}), borderRadius: "2px" }} />
          </span>
          <span style={{ fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>{view === "share" ? `${r.pct}%` : r.total}</span>
          <span style={{ fontSize: "12px", fontWeight: "500", color: r.deltaColor }}>{r.delta}</span>
        </div>
      ))}
    </div>
  );
}
