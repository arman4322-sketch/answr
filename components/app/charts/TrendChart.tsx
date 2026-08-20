"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

/* Multi-series line/area chart in the Answr design language, with the hover layer
   the prototype only depicted: crosshair + dots + tooltip showing every series'
   value at the hovered point. Colors follow the design's series assignments
   (you = var(--ac); competitors = #7fa7d9 #b98ed9 #d9b679 #d985a8). */

export type TrendSeries = {
  id: string;
  label: string;
  color: string;
  points: number[];
  /** soft gradient fill under this series (typically only the primary) */
  area?: boolean;
  /** strokeDasharray for projected/comparison series (e.g. "5 4") */
  dash?: string;
};

export default function TrendChart({
  series,
  xLabels,
  width = 640,
  height = 180,
  yDomain,
  yFormat,
  yUnit = "",
  yDecimals = 1,
  step = false,
  showLegend = series.length > 1,
  pad = { top: 10, right: 12, bottom: 8, left: 12 },
}: {
  series: TrendSeries[];
  /** one label per point index — shown as the tooltip title (e.g. "Jul 18") */
  xLabels: string[];
  width?: number;
  height?: number;
  yDomain?: [number, number];
  yFormat?: (v: number) => string;
  /** serializable alternative to yFormat for server components: suffix + decimals */
  yUnit?: string;
  yDecimals?: number;
  /** stepped-line rendering (the design's stepped charts) */
  step?: boolean;
  showLegend?: boolean;
  pad?: { top: number; right: number; bottom: number; left: number };
}) {
  const gradBase = useId().replace(/[:]/g, "");
  const fmt = yFormat ?? ((v: number) => `${Number(v.toFixed(yDecimals)).toLocaleString("en-US")}${yUnit}`);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  /* Fluid width: measure the container and fill it; the `width` prop is only the
     SSR/first-paint fallback. Cards stretch with the viewport (flex/grid columns),
     so a fixed SVG width leaves charts "incomplete" on wide screens. */
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

  const n = Math.max(...series.map((s) => s.points.length));
  const all = series.flatMap((s) => s.points);
  const [dMin, dMax] = yDomain ?? [Math.min(...all), Math.max(...all)];
  const span = dMax - dMin || 1;
  const lo = yDomain ? dMin : dMin - span * 0.12;
  const hi = yDomain ? dMax : dMax + span * 0.12;

  const plotW = W - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (i / (n - 1)) * plotW;
  const y = (v: number) => pad.top + (1 - (v - lo) / (hi - lo)) * plotH;

  function linePath(pts: number[]) {
    return pts
      .map((v, i) => {
        if (i === 0) return `M${x(0)},${y(v)}`;
        if (step) return `H${x(i)} V${y(v)}`;
        return `L${x(i)},${y(v)}`;
      })
      .join("");
  }

  function onMove(e: React.MouseEvent) {
    const rect = wrapRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = Math.round(((px - pad.left) / plotW) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  }

  const gridLines = 3;
  const tipLeft = hover === null ? 0 : x(hover) > W * 0.62 ? x(hover) - 172 : x(hover) + 14;

  return (
    <div style={{ position: "relative" }}>
      <div ref={wrapRef} style={{ position: "relative", width: "100%", cursor: "crosshair" }} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <svg width={W} height={height} role="img" aria-label={`Trend chart: ${series.map((s) => s.label).join(", ")}`}>
          {Array.from({ length: gridLines }, (_, g) => {
            const gy = pad.top + ((g + 1) / (gridLines + 1)) * plotH;
            return <line key={g} x1={pad.left} x2={W - pad.right} y1={gy} y2={gy} stroke="var(--brd)" strokeWidth="1" />;
          })}
          {series.map((s) =>
            s.area ? (
              <g key={s.id + "-a"}>
                <defs>
                  <linearGradient id={`${gradBase}-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${linePath(s.points)} L${x(s.points.length - 1)},${height - pad.bottom} L${x(0)},${height - pad.bottom} Z`} fill={`url(#${gradBase}-${s.id})`} />
              </g>
            ) : null
          )}
          {series.map((s) => (
            <path key={s.id} d={linePath(s.points)} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dash} />
          ))}
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={height - pad.bottom} stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
              {series.map((s) =>
                s.points[hover] !== undefined ? (
                  <circle key={s.id + "-d"} cx={x(hover)} cy={y(s.points[hover])} r="3.5" fill={s.color} stroke="var(--bg1)" strokeWidth="2" />
                ) : null
              )}
            </g>
          )}
        </svg>
        {hover !== null && (
          <div
            style={{
              position: "absolute",
              top: 6,
              left: tipLeft,
              width: "158px",
              background: "var(--bg2)",
              border: "1px solid var(--brd)",
              borderRadius: "8px",
              boxShadow: "0 12px 32px rgba(0,0,0,.5)",
              padding: "9px 11px",
              pointerEvents: "none",
              zIndex: 30,
            }}
          >
            <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--fnt)" }}>{xLabels[hover]}</div>
            {series
              .filter((s) => s.points[hover] !== undefined)
              .map((s) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "7px", marginTop: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: s.color, flex: "none" }} />
                  <span style={{ fontSize: "11px", color: "var(--mut)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--tx)" }}>{fmt(s.points[hover])}</span>
                </div>
              ))}
          </div>
        )}
      </div>
      {showLegend && (
        <div style={{ display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap" }}>
          {series.map((s) => (
            <span key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--mut)" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
