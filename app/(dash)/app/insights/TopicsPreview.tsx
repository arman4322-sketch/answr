/* Illustrative layout for the Topics section of Answer Engine Insights.

   This renders ONLY inside <LockedPreview>, which dims it to 28% opacity,
   greyscales it, marks it inert/aria-hidden and stamps the "illustrative — not
   measured data" badge over it. Nothing here is a measurement: the figures are
   neutral round placeholders that show the SHAPE of the screen once per-prompt
   topic tagging exists (see lib/preview/sources.ts → "topics").

   No brand is named. Topic labels are generic category-agnostic subjects and the
   leading-brand column uses "Brand A" / "Competitor A" placeholders, so no
   figure on this layer can be read as a claim about anyone's real visibility.

   Platform columns come from the workspace's own answering engines when there
   are any — those are real labels, and only the cells under them are illustrative. */

const CARD: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "18px 20px",
};

const PLATFORM_FALLBACK = ["ChatGPT", "Claude", "Gemini", "Perplexity"];

/** Neutral placeholder topics — round figures, no brand, no real category. */
const ROWS: {
  topic: string;
  prompts: number;
  visibility: number;
  /** one cell per platform column, in column order */
  cells: number[];
  leader: string;
}[] = [
  { topic: "Product comparisons", prompts: 40, visibility: 55, cells: [70, 65, 55, 50, 45], leader: "Brand A" },
  { topic: "Alternatives & switching", prompts: 30, visibility: 50, cells: [45, 60, 55, 50, 40], leader: "Competitor A" },
  { topic: "Pricing & value", prompts: 25, visibility: 40, cells: [40, 45, 50, 40, 35], leader: "Brand A" },
  { topic: "Getting started", prompts: 20, visibility: 35, cells: [30, 35, 40, 45, 30], leader: "Competitor B" },
  { topic: "Reviews & reputation", prompts: 15, visibility: 30, cells: [30, 25, 25, 30, 35], leader: "Competitor A" },
  { topic: "Integrations & setup", prompts: 10, visibility: 20, cells: [25, 20, 20, 15, 15], leader: "Brand A" },
];

function cellStyle(v: number): React.CSSProperties {
  return {
    background: `rgba(142,124,242,${(0.07 + (v / 100) * 0.45).toFixed(3)})`,
    borderRadius: "6px",
    padding: "9px 0",
    textAlign: "center",
    fontSize: "11.5px",
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    color: v >= 50 ? "var(--tx)" : "var(--mut)",
  };
}

export default function TopicsPreview({ platforms }: { platforms?: string[] }) {
  const cols = (platforms && platforms.length ? platforms : PLATFORM_FALLBACK).slice(0, 5);
  const grid = `minmax(150px, 1.4fr) repeat(${cols.length}, minmax(64px, 1fr))`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* ── topic × platform heatmap ── */}
      <div style={CARD}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Visibility by topic × platform"}</div>
            <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>
              {"% of sampled answers naming your brand, per subject and engine"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--fnt)" }}>
            <span>{"Low"}</span>
            <span style={{ display: "inline-flex", gap: "2px" }}>
              {[15, 30, 45, 60, 75].map((v) => (
                <span
                  key={v}
                  style={{
                    width: "14px",
                    height: "8px",
                    borderRadius: "2px",
                    background: `rgba(142,124,242,${(0.07 + (v / 100) * 0.45).toFixed(3)})`,
                  }}
                />
              ))}
            </span>
            <span>{"High"}</span>
          </div>
        </div>

        <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: grid, gap: "6px", alignItems: "center" }}>
          <div />
          {cols.map((c) => (
            <div key={c} style={{ fontSize: "11px", color: "var(--fnt)", textAlign: "center", fontWeight: 500 }}>
              {c}
            </div>
          ))}

          {ROWS.map((r) => (
            <PreviewHeatRow key={r.topic} topic={r.topic} cells={r.cells.slice(0, cols.length)} />
          ))}
        </div>

        <div style={{ fontSize: "11px", color: "var(--fnt)", lineHeight: 1.55, marginTop: "14px" }}>
          {"Each cell would be answers naming your brand ÷ answers that engine returned for prompts tagged to that topic."}
        </div>
      </div>

      {/* ── topics table ── */}
      <div style={CARD}>
        <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Topics"}</div>
        <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>
          {"Every subject your tracked prompts fall into, ranked by visibility"}
        </div>

        <div style={{ marginTop: "14px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(160px,1.6fr) 80px minmax(140px,1fr) 130px 130px",
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
            <div>{"Topic"}</div>
            <div style={{ textAlign: "right" }}>{"Prompts"}</div>
            <div>{"Visibility"}</div>
            <div>{"Best platform"}</div>
            <div>{"Leading brand"}</div>
          </div>

          {ROWS.map((r, i) => {
            const cells = r.cells.slice(0, cols.length);
            const bestIdx = cells.reduce((best, v, idx) => (v > cells[best] ? idx : best), 0);
            return (
              <div
                key={r.topic}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(160px,1.6fr) 80px minmax(140px,1fr) 130px 130px",
                  gap: "12px",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: i === ROWS.length - 1 ? undefined : "1px solid var(--brd)",
                  fontSize: "12.5px",
                }}
              >
                <div style={{ fontWeight: 500 }}>{r.topic}</div>
                <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}>
                  {r.prompts}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "70px", height: "4px", background: "var(--bg2)", borderRadius: "2px", display: "inline-block" }}>
                    <span style={{ display: "block", width: `${r.visibility}%`, height: "4px", background: "var(--ac)", borderRadius: "2px" }} />
                  </span>
                  <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{`${r.visibility}%`}</span>
                </div>
                <div style={{ color: "var(--mut)" }}>{cols[bestIdx]}</div>
                <div style={{ color: "var(--mut)" }}>{r.leader}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PreviewHeatRow({ topic, cells }: { topic: string; cells: number[] }) {
  return (
    <>
      <div style={{ fontSize: "12.5px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {topic}
      </div>
      {cells.map((v, i) => (
        <div key={`${topic}-${i}`} style={cellStyle(v)}>
          {`${v}%`}
        </div>
      ))}
    </>
  );
}
