"use client";

import { useState } from "react";
import { METRICS } from "@/lib/metrics";

/* Local exception (noted in the wiring report): the content-score hero is a gauge,
   not a stat card, so it keeps its gauge markup and gets KpiCard's ⓘ provenance
   popover pattern applied manually with the `content_score` dictionary entry.
   Button + popover styles mirror components/app/KpiCard.tsx exactly. */

export default function ScoreInfo() {
  const [open, setOpen] = useState(false);
  const def = METRICS.content_score;

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        aria-label={`About ${def.label}: definition, data source and calculation`}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          border: "1px solid var(--brd)",
          background: "transparent",
          color: "var(--fnt)",
          fontSize: "9px",
          fontWeight: 600,
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "help",
          padding: 0,
          fontFamily: "inherit",
        }}
      >
        i
      </button>
      {open && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: "-8px",
            width: "300px",
            background: "var(--bg2)",
            border: "1px solid var(--brd)",
            borderRadius: "10px",
            boxShadow: "0 18px 48px rgba(0,0,0,.55)",
            padding: "13px 15px",
            zIndex: 40,
            fontSize: "11.5px",
            lineHeight: 1.55,
            color: "var(--mut)",
            fontWeight: 400,
            cursor: "default",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--tx)" }}>{def.label}</div>
          <div style={{ marginTop: "5px" }}>{def.definition}</div>
          <div style={{ fontSize: "9.5px", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--fnt)", marginTop: "10px" }}>
            Source
          </div>
          <div style={{ marginTop: "3px" }}>{def.source}</div>
          <div style={{ fontSize: "9.5px", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--fnt)", marginTop: "10px" }}>
            Calculation
          </div>
          <div style={{ marginTop: "3px" }}>{def.calculation}</div>
          <div style={{ marginTop: "8px", fontSize: "10.5px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{def.cadence}</div>
        </div>
      )}
    </span>
  );
}
