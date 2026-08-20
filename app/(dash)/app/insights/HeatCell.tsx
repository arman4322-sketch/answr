"use client";

import { useState } from "react";

/* Heatmap cell for the AEI "Visibility by topic × platform" grid, with the
   hover state the frame only depicted on its first cell: accent outline plus a
   tooltip (topic × platform, visibility %, 30d delta). Tooltip styling matches
   TrendChart's: bg2, brd border, radius 8, shadow, 10px uppercase title,
   tabular values. */

export default function HeatCell({
  topic,
  platform,
  visibility,
  delta,
  align = "center",
}: {
  topic: string;
  platform: string;
  visibility: number;
  delta: number;
  /** tooltip alignment relative to the cell — "right" keeps the last column inside the card */
  align?: "center" | "right";
}) {
  const [hover, setHover] = useState(false);
  const good = delta >= 0;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: "38px",
        borderRadius: "6px",
        background: `color-mix(in oklab,var(--ac) ${visibility}%,transparent)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11.5px",
        fontWeight: 500,
        fontVariantNumeric: "tabular-nums",
        color: visibility >= 49 ? "#fff" : undefined,
        position: "relative",
        outline: hover ? "2px solid var(--ac)" : undefined,
        outlineOffset: "1px",
        cursor: "crosshair",
      }}
    >
      {visibility}%
      {hover && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            ...(align === "right" ? { right: 0 } : { left: "50%", transform: "translateX(-50%)" }),
            width: "164px",
            background: "var(--bg2)",
            border: "1px solid var(--brd)",
            borderRadius: "8px",
            boxShadow: "0 12px 32px rgba(0,0,0,.5)",
            padding: "9px 11px",
            pointerEvents: "none",
            zIndex: 30,
            textAlign: "left",
            fontWeight: 400,
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--fnt)" }}>
            {topic} × {platform}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginTop: "6px" }}>
            <span style={{ fontSize: "11px", color: "var(--mut)", flex: 1 }}>Visibility</span>
            <span style={{ fontSize: "11px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--tx)" }}>{visibility}%</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginTop: "6px" }}>
            <span style={{ fontSize: "11px", color: "var(--mut)", flex: 1 }}>Δ 30d</span>
            <span style={{ fontSize: "11px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: good ? "var(--good)" : "var(--bad)" }}>
              {good ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}pt
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
