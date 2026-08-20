"use client";

/* Regional visibility choropleth — ported from the handoff's working region-map.html
   (full d3 + CDN-fetched world-atlas) to d3-geo + topojson-client, with the topology
   imported from the world-atlas npm package instead of a CDN fetch.
   Kept identical: Natural Earth projection fit to [w, h*1.14], 0–45% domain,
   #232430 → #8E7CF2 ramp, tracked-region shading, hover tooltip with region /
   score / 30-day delta, resize handling.
   Audit fix: legend top label reads "45%" (frame said "40%+" against a 45% domain). */

import { useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import world from "world-atlas/countries-110m.json";

const VIS: Record<number, number> = {
  840: 41.2, 826: 33.8, 276: 27.4, 40: 27.4, 756: 27.4, 250: 22.1, 76: 12.2, 392: 9.8,
};
const NAMES: Record<number, string> = {
  840: "United States",
  826: "United Kingdom",
  276: "Germany · DACH",
  40: "Austria · DACH",
  756: "Switzerland · DACH",
  250: "France",
  76: "Brazil",
  392: "Japan",
};
const DELTAS: Record<number, string> = {
  840: "↑ 2.4", 826: "↑ 1.6", 276: "↑ 3.9", 40: "↑ 3.9", 756: "↑ 3.9", 250: "↓ 0.8", 76: "↑ 1.1", 392: "—",
};

/* d3.interpolateRgb("#232430", "#8E7CF2") sampled at v/45, clamped — hand-rolled so
   we don't need d3-interpolate. */
function ramp(v: number) {
  const t = Math.max(0, Math.min(v / 45, 1));
  const r = Math.round(0x23 + (0x8e - 0x23) * t);
  const g = Math.round(0x24 + (0x7c - 0x24) * t);
  const b = Math.round(0x30 + (0xf2 - 0x30) * t);
  return `rgb(${r},${g},${b})`;
}

function deltaColor(d: string) {
  return d.startsWith("↓") ? "#e5636e" : d === "—" ? "var(--fnt)" : "#4cb782";
}

const topology = world as unknown as { objects: { countries: unknown } };
const countries = feature(topology, topology.objects.countries);
const FEATURES = countries.features.filter((f) => Number(f.id) !== 10); // drop Antarctica
const FIT: FeatureCollection<Geometry> = { type: "FeatureCollection", features: FEATURES };

export default function RegionMap({ height = 400 }: { height?: number }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [tip, setTip] = useState<{ id: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth || 900);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const shapes = useMemo(() => {
    if (!width) return [];
    const projection = geoNaturalEarth1().fitSize([width, height * 1.14], FIT);
    const path = geoPath(projection);
    return FEATURES.map((f, i) => ({ key: `c${i}`, id: Number(f.id), d: path(f) || "" }));
  }, [width, height]);

  const move = (id: number) => (e: React.MouseEvent<SVGPathElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTip({
      id,
      x: Math.min(e.clientX - r.left + 14, width - 170),
      y: Math.min(e.clientY - r.top + 14, height - 70),
    });
  };

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", width: "100%", height: `${height}px`, background: "var(--bg1)", overflow: "hidden" }}
      onMouseLeave={() => setTip(null)}
    >
      <svg width={width || undefined} height={height} style={{ display: "block", width: "100%" }}>
        {shapes.map((s) => {
          const v = VIS[s.id];
          const tracked = v != null;
          return (
            <path
              key={s.key}
              d={s.d}
              fill={tracked ? ramp(v) : "#1b1c20"}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={0.5}
              style={{ cursor: tracked ? "pointer" : "default" }}
              onMouseMove={tracked ? move(s.id) : () => setTip(null)}
              onMouseLeave={tracked ? () => setTip(null) : undefined}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: "19px",
          bottom: "13px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "10px",
          color: "var(--fnt)",
          zIndex: 1,
        }}
      >
        <span>0%</span>
        <div style={{ width: "120px", height: "6px", borderRadius: "3px", background: "linear-gradient(90deg,#232430,#8E7CF2)" }} />
        <span>45%</span>
        <span style={{ marginLeft: "10px" }}>visibility by answer locale · hover a tracked region</span>
      </div>
      {tip && (
        <div
          style={{
            position: "absolute",
            left: `${tip.x}px`,
            top: `${tip.y}px`,
            pointerEvents: "none",
            background: "var(--bg2)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "8px",
            padding: "8px 11px",
            fontSize: "11.5px",
            lineHeight: 1.5,
            color: "var(--mut)",
            boxShadow: "0 12px 32px rgba(0,0,0,.45)",
            zIndex: 2,
          }}
        >
          <span style={{ color: "var(--tx)", fontWeight: 600 }}>{NAMES[tip.id]}</span>
          <br />
          visibility <span style={{ color: "var(--tx)", fontWeight: 600 }}>{VIS[tip.id]}%</span> ·{" "}
          <span style={{ color: deltaColor(DELTAS[tip.id]) }}>{DELTAS[tip.id]}</span> 30d
        </div>
      )}
    </div>
  );
}
