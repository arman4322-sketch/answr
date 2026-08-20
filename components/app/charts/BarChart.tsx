"use client";

import { useLayoutEffect, useRef, useState } from "react";

/* Bar chart (vertical or stacked) with per-bar hover tooltips, in the Answr
   design language: thin bars, 3px rounded data ends, 2px surface gaps between
   stacked segments, recessive grid. */

export type BarSegment = { key: string; label: string; value: number; color: string };
export type Bar = { label: string; segments: BarSegment[] };

export default function BarChart({
  bars,
  width = 640,
  height = 160,
  yFormat,
  yUnit = "",
  yDecimals = 0,
  barRadius = 3,
  pad = { top: 8, right: 4, bottom: 20, left: 4 },
  showXLabels = true,
}: {
  bars: Bar[];
  width?: number;
  height?: number;
  yFormat?: (v: number) => string;
  /** serializable alternative to yFormat for server components: suffix + decimals */
  yUnit?: string;
  yDecimals?: number;
  barRadius?: number;
  pad?: { top: number; right: number; bottom: number; left: number };
  showXLabels?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const fmt = yFormat ?? ((v: number) => `${Number(v.toFixed(yDecimals)).toLocaleString("en-US")}${yUnit}`);

  /* Fluid width — see TrendChart: measure container, `width` prop is the SSR fallback. */
  const wrapRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setMeasured(el.clientWidth));
    ro.observe(el);
    setMeasured(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const W = measured ?? width;

  const totals = bars.map((b) => b.segments.reduce((a, s) => a + s.value, 0));
  const max = Math.max(...totals) || 1;
  const plotW = W - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const slot = plotW / bars.length;
  const barW = Math.min(26, slot * 0.58);

  const tipLeft = (i: number) => {
    const cx = pad.left + i * slot + slot / 2;
    return cx > W * 0.62 ? cx - 178 : cx + 12;
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <svg width={W} height={height} role="img" aria-label="Bar chart" onMouseLeave={() => setHover(null)}>
        {[1, 2, 3].map((g) => {
          const gy = pad.top + (g / 4) * plotH;
          return <line key={g} x1={pad.left} x2={W - pad.right} y1={gy} y2={gy} stroke="var(--brd)" strokeWidth="1" />;
        })}
        {bars.map((b, i) => {
          const cx = pad.left + i * slot + (slot - barW) / 2;
          let yCursor = height - pad.bottom;
          return (
            <g key={i} opacity={hover === null || hover === i ? 1 : 0.45} style={{ transition: "opacity .12s" }}>
              {b.segments.map((s, si) => {
                const h = (s.value / max) * plotH;
                yCursor -= h;
                const isTop = si === b.segments.length - 1;
                const gap = si > 0 ? 2 : 0;
                return (
                  <rect
                    key={s.key}
                    x={cx}
                    y={yCursor + gap}
                    width={barW}
                    height={Math.max(0, h - gap)}
                    rx={isTop ? barRadius : 0}
                    fill={s.color}
                  />
                );
              })}
              <rect
                x={pad.left + i * slot}
                y={pad.top}
                width={slot}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                style={{ cursor: "crosshair" }}
              />
              {showXLabels && (
                <text x={cx + barW / 2} y={height - 5} textAnchor="middle" fontSize="9.5" fill="var(--fnt)" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {b.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div
          style={{
            position: "absolute",
            top: 2,
            left: tipLeft(hover),
            width: "164px",
            background: "var(--bg2)",
            border: "1px solid var(--brd)",
            borderRadius: "8px",
            boxShadow: "0 12px 32px rgba(0,0,0,.5)",
            padding: "9px 11px",
            pointerEvents: "none",
            zIndex: 30,
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--fnt)" }}>{bars[hover].label}</div>
          {bars[hover].segments.map((s) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: "7px", marginTop: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: s.color, flex: "none" }} />
              <span style={{ fontSize: "11px", color: "var(--mut)", flex: 1 }}>{s.label}</span>
              <span style={{ fontSize: "11px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--tx)" }}>{fmt(s.value)}</span>
            </div>
          ))}
          {bars[hover].segments.length > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "7px", paddingTop: "6px", borderTop: "1px solid var(--brd)", fontSize: "11px" }}>
              <span style={{ color: "var(--fnt)" }}>Total</span>
              <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--tx)" }}>
                {fmt(bars[hover].segments.reduce((a, s) => a + s.value, 0))}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
