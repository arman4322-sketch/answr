/* Illustrative layout for the Demand screen.

   Rendered ONLY as a child of <LockedPreview>, which dims it to 28% opacity,
   greyscales it, marks it inert/aria-hidden and stamps the "illustrative — not
   measured data" badge over it.

   It shows the shape Demand would take once a keyword search-volume pipeline
   runs (lib/preview/sources.ts → "demand": DataForSEO Keywords Data for the
   search-volume column, AI Keyword Data / LLM Mentions for the AI-demand column,
   Google Trends for direction of travel).

   Every value is a neutral round placeholder. No brand, domain or category from
   any workspace appears: terms are generic phrasings and rivals are "Competitor
   A" / "Competitor B". */

const CARD: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "18px 20px",
};

const GRID = "minmax(220px,2.2fr) 130px minmax(150px,1fr) 150px";

/** 12 months of round placeholder volume. */
const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const VOLUME = [30, 30, 35, 40, 40, 45, 45, 50, 55, 55, 60, 65];

type Row = {
  term: string;
  volume: number;
  /** 12-month change, percentage points */
  trend: number;
  spark: number[];
  difficulty: number;
  difficultyLabel: string;
};

const ROWS: Row[] = [
  { term: "best tools for small teams", volume: 12000, trend: 15, spark: [30, 35, 35, 40, 45, 50, 55], difficulty: 45, difficultyLabel: "Medium" },
  { term: "alternatives to Competitor A", volume: 8000, trend: 25, spark: [20, 25, 30, 35, 40, 45, 55], difficulty: 30, difficultyLabel: "Low" },
  { term: "how much does it cost", volume: 6000, trend: -5, spark: [45, 45, 40, 40, 35, 35, 30], difficulty: 25, difficultyLabel: "Low" },
  { term: "Brand A vs Competitor B", volume: 5000, trend: 10, spark: [30, 30, 35, 35, 40, 40, 45], difficulty: 55, difficultyLabel: "Medium" },
  { term: "top rated options this year", volume: 4000, trend: 5, spark: [35, 35, 40, 40, 40, 45, 45], difficulty: 60, difficultyLabel: "High" },
  { term: "is it worth it for beginners", volume: 3000, trend: 0, spark: [35, 40, 35, 40, 35, 40, 35], difficulty: 20, difficultyLabel: "Low" },
  { term: "cheapest option for one person", volume: 2000, trend: -10, spark: [50, 45, 45, 40, 35, 35, 30], difficulty: 35, difficultyLabel: "Low" },
  { term: "how to choose the right one", volume: 1000, trend: 20, spark: [20, 25, 25, 30, 35, 40, 45], difficulty: 40, difficultyLabel: "Medium" },
];

function Spark({ values, up }: { values: number[]; up: boolean }) {
  const w = 60;
  const h = 18;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const pts = values
    .map((v, i) => `${((i / (values.length - 1)) * w).toFixed(1)},${(h - ((v - lo) / span) * h).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: `${w}px`, height: `${h}px`, flex: "none", display: "block" }}>
      <polyline points={pts} fill="none" stroke={up ? "var(--good)" : "var(--bad)"} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export default function DemandPreview() {
  const peak = Math.max(...VOLUME);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* ── watchlist strip ── */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        {["All tracked terms", "Comparison terms", "Pricing terms"].map((name, i) => (
          <span
            key={name}
            style={{
              fontSize: "12px",
              fontWeight: 500,
              padding: "6px 12px",
              borderRadius: "999px",
              color: i === 0 ? "var(--tx)" : "var(--mut)",
              background: i === 0 ? "rgba(142,124,242,0.14)" : "var(--bg1)",
              border: `1px solid ${i === 0 ? "color-mix(in oklab,var(--ac) 32%,transparent)" : "var(--brd)"}`,
            }}
          >
            {name}
          </span>
        ))}
        <span style={{ fontSize: "11.5px", color: "var(--fnt)", marginLeft: "4px" }}>
          {"8 terms · volume refreshed monthly"}
        </span>
      </div>

      {/* ── volume over time ── */}
      <div style={CARD}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Volume over time"}</div>
            <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>
              {"Combined monthly volume across every term in this watchlist"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "22px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{"41,000"}</div>
            <div style={{ fontSize: "11.5px", color: "var(--good)", fontWeight: 600 }}>{"+10% vs 12 months ago"}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "120px", marginTop: "18px" }}>
          {VOLUME.map((v, i) => (
            <div key={MONTHS[i]} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "100%",
                  height: `${(v / peak) * 100}px`,
                  background: "rgba(142,124,242,0.55)",
                  borderRadius: "4px 4px 0 0",
                }}
              />
              <span style={{ fontSize: "10px", color: "var(--fnt)" }}>{MONTHS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── keyword / topic demand table ── */}
      <div style={CARD}>
        <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Terms"}</div>
        <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>
          {"Monthly volume, 12-month direction and how contested each term is"}
        </div>

        <div style={{ marginTop: "14px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              gap: "12px",
              padding: "0 0 8px",
              borderBottom: "1px solid var(--brd)",
              fontSize: "10.5px",
              fontWeight: 600,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "var(--fnt)",
            }}
          >
            <div>{"Term"}</div>
            <div style={{ textAlign: "right" }}>{"Monthly volume"}</div>
            <div>{"Trend"}</div>
            <div>{"Difficulty"}</div>
          </div>

          {ROWS.map((r, i) => (
            <div
              key={r.term}
              style={{
                display: "grid",
                gridTemplateColumns: GRID,
                gap: "12px",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: i === ROWS.length - 1 ? undefined : "1px solid var(--brd)",
                fontSize: "12.5px",
              }}
            >
              <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.term}</div>
              <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.volume.toLocaleString("en-US")}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Spark values={r.spark} up={r.trend >= 0} />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                    color: r.trend > 0 ? "var(--good)" : r.trend < 0 ? "var(--bad)" : "var(--mut)",
                  }}
                >
                  {`${r.trend > 0 ? "+" : ""}${r.trend}%`}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <span style={{ width: "54px", height: "4px", background: "var(--bg2)", borderRadius: "2px", display: "inline-block" }}>
                  <span style={{ display: "block", width: `${r.difficulty}%`, height: "4px", background: "var(--ac)", borderRadius: "2px" }} />
                </span>
                <span style={{ color: "var(--mut)", fontVariantNumeric: "tabular-nums" }}>
                  {`${r.difficulty} · ${r.difficultyLabel}`}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: "11px", color: "var(--fnt)", lineHeight: 1.55, marginTop: "14px" }}>
          {"Volume would come from a keyword search-volume pipeline; difficulty from how many distinct brands the answers name for that term."}
        </div>
      </div>
    </div>
  );
}
