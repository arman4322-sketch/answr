"use client";

import { useState } from "react";
import Hint from "@/components/ui/Hint";

/* "By region" card — the frame's language pills ("All languages / English /
   German / French") are now a working segmented filter. Every region row
   already lives in the 30-day fixture, so the filter really applies (no
   demo-honesty toast needed). Row markup and styling verbatim from frame
   #p2-regions; borderTop is computed from the visible index so the first
   visible row never double-borders against the header. */

const LANGS = ["All languages", "English", "German", "French"] as const;

type Row = {
  region: string;
  language: string;
  visibility: string;
  barWidth: string;
  sov: string;
  delta: string;
  deltaColor: string;
  brand: { you: true } | { dot: string; name: string };
  highlight?: boolean;
};

const ROWS: Row[] = [
  { region: "United States", language: "English", visibility: "41.2%", barWidth: "41%", sov: "33.4%", delta: "↑ 2.4", deltaColor: "#4cb782", brand: { you: true }, highlight: true },
  { region: "United Kingdom", language: "English", visibility: "33.8%", barWidth: "34%", sov: "27.2%", delta: "↑ 1.6", deltaColor: "#4cb782", brand: { you: true } },
  { region: "DACH", language: "German", visibility: "27.4%", barWidth: "27%", sov: "21.8%", delta: "↑ 3.9", deltaColor: "#4cb782", brand: { dot: "#7fa7d9", name: "Adidas" } },
  { region: "France", language: "French", visibility: "22.1%", barWidth: "22%", sov: "18.6%", delta: "↓ 0.8", deltaColor: "#e5636e", brand: { dot: "#b98ed9", name: "Puma" } },
  { region: "Brazil", language: "Portuguese", visibility: "12.2%", barWidth: "12%", sov: "10.4%", delta: "↑ 1.1", deltaColor: "#4cb782", brand: { dot: "#7fa7d9", name: "Adidas" } },
  { region: "Japan", language: "Japanese", visibility: "9.8%", barWidth: "10%", sov: "8.1%", delta: "—", deltaColor: "var(--fnt)", brand: { dot: "#d9b679", name: "Under Armour" } },
];

export default function ByRegionTable() {
  const [lang, setLang] = useState<(typeof LANGS)[number]>("All languages");
  const visible = ROWS.filter((r) => lang === "All languages" || r.language === lang);

  return (
    <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 19px 11px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>{"By region"}<Hint text="How you do country by country" /></span>
        <div style={{ display: "flex", gap: "8px", fontSize: "11.5px" }}>
          {LANGS.map((l) =>
            l === lang ? (
              <button
                key={l}
                type="button"
                aria-pressed="true"
                onClick={() => setLang(l)}
                style={{ color: "#fff", background: "var(--ac)", border: "none", borderRadius: "5px", padding: "4px 10px", fontWeight: "600", fontSize: "11.5px", fontFamily: "inherit", cursor: "pointer" }}
              >
                {l}
              </button>
            ) : (
              <button
                key={l}
                type="button"
                aria-pressed="false"
                onClick={() => setLang(l)}
                style={{ color: "var(--mut)", background: "transparent", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 10px", fontWeight: "400", fontSize: "11.5px", fontFamily: "inherit", cursor: "pointer" }}
              >
                {l}
              </button>
            )
          )}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr 1fr 1fr .7fr 1.1fr", padding: "7px 19px", fontSize: "11px", fontWeight: "500", color: "var(--fnt)", borderBottom: "1px solid var(--brd)" }}>
        <span>{"Region"}</span>
        <span>{"Language"}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>{"Visibility"}<Hint text="How often AI mentions you here" size={12} /></span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>{"Share of voice"}<Hint text="Your slice of brand mentions versus rivals" size={12} /></span>
        <span>{"Δ 30d"}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>{"Leading brand"}<Hint text="Brand AI names most here" size={12} align="right" /></span>
      </div>
      {visible.map((r, i) => (
        <div
          key={r.region}
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr .8fr 1fr 1fr .7fr 1.1fr",
            alignItems: "center",
            padding: "10px 19px",
            fontSize: "13px",
            ...(i > 0 ? { borderTop: "1px solid var(--brd)" } : {}),
            ...(r.highlight ? { background: "rgba(142,124,242,0.06)" } : {}),
          }}
        >
          <span style={{ fontWeight: "500" }}>{r.region}</span>
          <span style={{ color: "var(--mut)" }}>{r.language}</span>
          <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>{r.visibility}</span>
            <span style={{ width: "76px", height: "3px", background: "var(--bg2)", borderRadius: "2px", display: "inline-block" }}>
              <span style={{ display: "block", width: r.barWidth, height: "3px", background: "var(--ac)", borderRadius: "2px" }} />
            </span>
          </span>
          <span style={{ fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>{r.sov}</span>
          <span style={{ fontSize: "12px", fontWeight: "500", color: r.deltaColor }}>{r.delta}</span>
          {"you" in r.brand ? (
            <span style={{ display: "flex", alignItems: "center", gap: "7px", fontWeight: "500" }}>
              {"Nike "}
              <span style={{ fontSize: "10px", fontWeight: "600", color: "#b3a7f8", background: "rgba(142,124,242,0.16)", borderRadius: "4px", padding: "2px 6px" }}>{"You"}</span>
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--tx)" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "2px", background: r.brand.dot }} />
              {r.brand.name}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
