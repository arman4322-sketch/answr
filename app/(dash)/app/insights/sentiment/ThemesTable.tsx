"use client";

import { useState } from "react";
import Hint from "@/components/ui/Hint";

/* Themes card — the frame's "All / Positive / Negative / Trending" pills are
   now a working segmented filter. All five theme rows live in the 30-day
   fixture, so filtering really applies (no demo-honesty toast needed). Row
   markup/styling verbatim from frame #p2-sentiment; borderTop is computed
   from the visible index; the trending-negative footer note stays pinned. */

const FILTERS = ["All", "Positive", "Negative", "Trending"] as const;

type ThemeRow = {
  name: string;
  sentiment: "Positive" | "Negative";
  color: string;
  occurrences: string;
  spark: string;
  delta: string;
  deltaColor: string;
  trending?: boolean;
};

const ROWS: ThemeRow[] = [
  { name: "Cushioning and comfort", sentiment: "Positive", color: "#4cb782", occurrences: "214", spark: "M0 12L9 11L18 11L27 9L36 8L45 6L52 5", delta: "↑ 28", deltaColor: "#4cb782" },
  { name: "Outsole durability", sentiment: "Positive", color: "#4cb782", occurrences: "187", spark: "M0 10L9 10L18 9L27 9L36 8L45 8L52 7", delta: "↑ 11", deltaColor: "#4cb782" },
  { name: "Price at full retail", sentiment: "Negative", color: "#e5636e", occurrences: "96", spark: "M0 12L9 11L18 10L27 8L36 6L45 4L52 3", delta: "↑ 34", deltaColor: "#e5636e", trending: true },
  { name: "Break-in time", sentiment: "Negative", color: "#e5636e", occurrences: "61", spark: "M0 6L9 7L18 7L27 9L36 10L45 11L52 12", delta: "↓ 9", deltaColor: "#4cb782" },
  { name: "Wide-fit availability", sentiment: "Positive", color: "#4cb782", occurrences: "44", spark: "M0 11L9 10L18 10L27 9L36 9L45 8L52 8", delta: "↑ 6", deltaColor: "#4cb782" },
];

function matches(row: ThemeRow, filter: (typeof FILTERS)[number]) {
  if (filter === "All") return true;
  if (filter === "Trending") return !!row.trending;
  return row.sentiment === filter;
}

export default function ThemesTable() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const visible = ROWS.filter((r) => matches(r, filter));

  return (
    <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 19px 11px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>{"Themes"}<Hint text="What AI keeps saying about you" /></span>
        <div style={{ display: "flex", gap: "8px", fontSize: "11.5px" }}>
          {FILTERS.map((f) =>
            f === filter ? (
              <button
                key={f}
                type="button"
                aria-pressed="true"
                onClick={() => setFilter(f)}
                style={{ color: "#fff", background: "var(--ac)", border: "none", borderRadius: "5px", padding: "4px 10px", fontWeight: "600", fontSize: "11.5px", fontFamily: "inherit", cursor: "pointer" }}
              >
                {f}
              </button>
            ) : (
              <button
                key={f}
                type="button"
                aria-pressed="false"
                onClick={() => setFilter(f)}
                style={{ color: "var(--mut)", background: "transparent", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 10px", fontWeight: "400", fontSize: "11.5px", fontFamily: "inherit", cursor: "pointer" }}
              >
                {f}
              </button>
            )
          )}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr .9fr .9fr .6fr", padding: "7px 19px", fontSize: "11px", fontWeight: "500", color: "var(--fnt)", borderBottom: "1px solid var(--brd)" }}>
        <span>{"Theme"}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>{"Sentiment"}<Hint text="Said as praise or as complaint" size={12} /></span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>{"Occurrences"}<Hint text="Times AI answers raised this" size={12} /></span>
        <span>{"Δ 30d"}</span>
      </div>
      {visible.map((r, i) => (
        <div
          key={r.name}
          className="row-hover"
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr .9fr .9fr .6fr",
            alignItems: "center",
            padding: "11px 19px",
            fontSize: "13px",
            ...(i > 0 ? { borderTop: "1px solid var(--brd)" } : {}),
            ...(r.trending ? { background: "rgba(229,99,110,0.05)" } : {}),
          }}
        >
          {r.trending ? (
            <span style={{ fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
              {r.name + " "}
              <span style={{ fontSize: "9.5px", fontWeight: "600", color: "#d9b679", border: "1px solid rgba(217,182,121,.4)", borderRadius: "4px", padding: "1px 5px" }}>{"TRENDING"}</span>
            </span>
          ) : (
            <span style={{ fontWeight: "500" }}>{r.name}</span>
          )}
          <span style={{ color: r.color, fontWeight: "500" }}>{r.sentiment}</span>
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>{r.occurrences}</span>
            <svg width="52" height="16" viewBox="0 0 52 16">
              <path d={r.spark} fill="none" stroke={r.color} strokeWidth="1.25" />
            </svg>
          </span>
          <span style={{ fontSize: "12px", fontWeight: "500", color: r.deltaColor }}>{r.delta}</span>
        </div>
      ))}
      <div style={{ padding: "12px 19px", borderTop: "1px solid var(--brd)", fontSize: "12px", color: "var(--mut)", lineHeight: "1.6" }}>
        <span style={{ color: "var(--tx)", fontWeight: "500" }}>{"Trending negative:"}</span>
        {" \"Price at full retail\" traces to a July price change — 31 of 34 new occurrences cite the old cached page. Action suggested."}
      </div>
    </div>
  );
}
