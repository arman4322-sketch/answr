"use client";

import { useLayoutEffect, useRef, useState } from "react";
import TrendChart from "@/components/app/charts/TrendChart";
import { demandKeywordTrend, demandKeywordTrendLabels, demandKeywordAgeBars } from "@/lib/data/demand";

/* Cluster-local client wrappers: page.tsx stays a server component (it exports
   metadata), and function props (yFormat) can't cross the server→client
   boundary — so the shared chart components are instantiated here. */

/* Sized to the box it replaces: the frame's 700×190 volume SVG. pad reproduces
   the frame's plot geometry (top gridline y=8, baseline y=185) so the static
   40K–160K axis-label column beside it stays aligned. */
export function KeywordVolumeTrend() {
  return (
    <TrendChart
      series={demandKeywordTrend}
      xLabels={demandKeywordTrendLabels}
      width={700}
      height={190}
      yDomain={[40, 160]}
      yFormat={(v) => `${Math.round(v)}K`}
      pad={{ top: 8, right: 0, bottom: 5, left: 0 }}
    />
  );
}

/* Age distribution — purpose-built for the demographic card's small footprint.

   The shared <BarChart> is tuned for wide cards: inside a ~204px-wide, 80px-tall
   box its three gridlines landed above the (undrawn) baseline, so the short
   buckets read as loose blocks hanging in mid-card, and there was no room for
   value labels. This draws the same buckets/values from lib/data/demand.ts on a
   real, drawn baseline, fills the card height sensibly, labels every bar with
   its share, and keeps a per-bar hover tooltip. */

const AGE_H = 112;
const AGE_PAD = { top: 16, bottom: 16, x: 2 };
/* Round headroom so the tallest bucket (37%) doesn't touch the value labels. */
const AGE_MAX = 40;

export function KeywordAgeBars() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  /* Fluid width — same pattern as TrendChart/BarChart: measure the container,
     fall back to the design width for SSR. */
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setMeasured(el.clientWidth));
    ro.observe(el);
    setMeasured(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const W = measured ?? 204;
  const baseY = AGE_H - AGE_PAD.bottom;
  const plotH = baseY - AGE_PAD.top;
  const plotW = W - AGE_PAD.x * 2;
  const slot = plotW / demandKeywordAgeBars.length;
  const barW = Math.min(22, slot * 0.56);

  const tipLeft = (i: number) => {
    const cx = AGE_PAD.x + i * slot + slot / 2;
    return Math.max(0, Math.min(W - 132, cx - 66));
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <svg width={W} height={AGE_H} role="img" aria-label="Share of demand by age bucket" onMouseLeave={() => setHover(null)}>
        {demandKeywordAgeBars.map((b, i) => {
          const v = b.segments[0].value;
          const h = Math.max(2, (v / AGE_MAX) * plotH);
          const x = AGE_PAD.x + i * slot + (slot - barW) / 2;
          const cx = x + barW / 2;
          const dim = hover !== null && hover !== i;
          return (
            <g key={b.label} opacity={dim ? 0.4 : 1} style={{ transition: "opacity .12s" }}>
              <rect x={x} y={baseY - h} width={barW} height={h} rx={3} fill={b.segments[0].color} />
              <text
                x={cx}
                y={baseY - h - 5}
                textAnchor="middle"
                fontSize="9.5"
                fontWeight={600}
                fill={hover === i ? "var(--tx)" : "var(--mut)"}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {`${v}%`}
              </text>
              <text x={cx} y={AGE_H - 3} textAnchor="middle" fontSize="9.5" fill="var(--fnt)" style={{ fontVariantNumeric: "tabular-nums" }}>
                {b.label}
              </text>
              <rect
                x={AGE_PAD.x + i * slot}
                y={0}
                width={slot}
                height={baseY}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                style={{ cursor: "crosshair" }}
              />
            </g>
          );
        })}
        {/* shared baseline — bars sit ON it instead of floating */}
        <line x1={AGE_PAD.x} x2={W - AGE_PAD.x} y1={baseY + 0.5} y2={baseY + 0.5} stroke="var(--brd)" strokeWidth="1" />
      </svg>
      {hover !== null && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: tipLeft(hover),
            width: "132px",
            background: "var(--bg2)",
            border: "1px solid var(--brd)",
            borderRadius: "8px",
            boxShadow: "0 12px 32px rgba(0,0,0,.5)",
            padding: "8px 10px",
            pointerEvents: "none",
            zIndex: 30,
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--fnt)" }}>
            {demandKeywordAgeBars[hover].label}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginTop: "5px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: demandKeywordAgeBars[hover].segments[0].color, flex: "none" }} />
            <span style={{ fontSize: "11px", color: "var(--mut)", flex: 1 }}>{demandKeywordAgeBars[hover].segments[0].label}</span>
            <span style={{ fontSize: "11px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--tx)" }}>
              {`${demandKeywordAgeBars[hover].segments[0].value}%`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
