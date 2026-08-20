"use client";

import { useRef, useState } from "react";
import { sourceMix } from "@/lib/data/evidence";
import { useFilters } from "@/lib/filters/context";
import { fmtInt } from "@/lib/filters/windows";
import { citationWindow } from "./citationWindow";

/* Source-mix donut from canvas frame #citations, with the per-segment hover
   layer the prototype only depicted (same tooltip styling as TrendChart's:
   bg2, brd border, radius 8, shadow, 10px uppercase title, tabular values).
   SVG geometry is the frame's, verbatim — data lives in lib/data/evidence.ts. */

export default function SourceMixDonut() {
  const { window } = useFilters();
  /* the centre label IS the "Total citations" KPI, and each segment is that
     total split by the shares the fixture states — both follow the window */
  const { value: total, scale } = citationWindow(window.days);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  function onMove(e: React.MouseEvent) {
    const rect = wrapRef.current!.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  const seg = hover === null ? null : sourceMix[hover];

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: "none" }} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label={`Source mix: ${sourceMix.map((s) => `${s.label} ${s.pct}%`).join(", ")}`}>
        <circle cx="75" cy="75" r="60" fill="none" stroke="var(--bg2)" strokeWidth="16" />
        {sourceMix.map((s, i) => (
          <circle
            key={s.key}
            cx="75"
            cy="75"
            r="60"
            fill="none"
            stroke={s.color}
            strokeWidth="16"
            strokeDasharray={`${s.dash} 377`}
            strokeDashoffset={s.offset || undefined}
            transform="rotate(-90 75 75)"
            opacity={hover === null || hover === i ? 1 : 0.45}
            style={{ transition: "opacity .12s", cursor: "crosshair" }}
            onMouseEnter={() => setHover(i)}
          />
        ))}
        <text x="75" y="71" textAnchor="middle" fill="var(--tx)" style={{ fontSize: "20px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>
          {fmtInt(total)}
        </text>
        <text x="75" y="88" textAnchor="middle" fill="var(--fnt)" style={{ fontSize: "10px", fontWeight: "400", fontVariantNumeric: "tabular-nums" }}>
          {"CITATIONS"}
        </text>
      </svg>
      {seg && (
        <div
          style={{
            position: "absolute",
            top: pos.y + 12,
            left: pos.x > 60 ? pos.x - 158 : pos.x + 12,
            width: "146px",
            background: "var(--bg2)",
            border: "1px solid var(--brd)",
            borderRadius: "8px",
            boxShadow: "0 12px 32px rgba(0,0,0,.5)",
            padding: "9px 11px",
            pointerEvents: "none",
            zIndex: 30,
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--fnt)" }}>{seg.label}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginTop: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: seg.color, flex: "none" }} />
            <span style={{ fontSize: "11px", color: "var(--mut)", flex: 1 }}>Citations</span>
            <span style={{ fontSize: "11px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--tx)" }}>{fmtInt(seg.count * scale)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "7px", paddingTop: "6px", borderTop: "1px solid var(--brd)", fontSize: "11px" }}>
            <span style={{ color: "var(--fnt)" }}>Share</span>
            <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--tx)" }}>{seg.pct}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
