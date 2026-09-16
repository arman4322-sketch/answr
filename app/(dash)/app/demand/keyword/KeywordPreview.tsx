/* Illustrative layout for the Demand → keyword detail screen.

   Rendered ONLY as a child of <LockedPreview>, which dims, greyscales and inerts
   it and stamps the "illustrative — not measured data" badge over it.

   It shows how one term's breakdown would look once a keyword search-volume
   pipeline runs (lib/preview/sources.ts → "demand"): headline volume, the
   volume curve, the split across AI surfaces, related terms and the question
   phrasings behind the term.

   Every figure is a neutral round placeholder and no real brand, domain or
   category appears — the term is a generic phrasing and rivals are "Competitor
   A" / "Competitor B". */

const CARD: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "18px 20px",
};

const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const VOLUME = [9000, 9000, 10000, 10000, 10000, 11000, 11000, 11000, 12000, 12000, 12000, 12000];

const SURFACES = [
  { label: "ChatGPT", share: 40 },
  { label: "Google AI Overviews", share: 25 },
  { label: "Perplexity", share: 20 },
  { label: "Gemini", share: 10 },
  { label: "Claude", share: 5 },
];

const RELATED = [
  { term: "best tools for a team of five", volume: 5000, trend: 10 },
  { term: "tools for small teams pricing", volume: 4000, trend: 15 },
  { term: "free alternatives for small teams", volume: 3000, trend: 25 },
  { term: "Competitor A for small teams", volume: 2000, trend: -5 },
  { term: "small team software comparison", volume: 1000, trend: 5 },
];

const QUESTIONS = [
  "What is the best tool for a small team?",
  "Which option is easiest for a team with no admin?",
  "How do the main tools compare on price for small teams?",
  "Is Brand A or Competitor B better for a team of five?",
  "What do small teams usually start with?",
];

function Stat({ label, value, note, tone }: { label: string; value: string; note: string; tone?: "good" }) {
  return (
    <div style={CARD}>
      <div style={{ fontSize: "11.5px", color: "var(--fnt)", fontWeight: 500 }}>{label}</div>
      <div
        style={{
          fontSize: "26px",
          fontWeight: 600,
          marginTop: "6px",
          fontVariantNumeric: "tabular-nums",
          color: tone === "good" ? "var(--good)" : "var(--tx)",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "11.5px", color: "var(--mut)", marginTop: "4px", lineHeight: 1.5 }}>{note}</div>
    </div>
  );
}

export default function KeywordPreview() {
  const peak = Math.max(...VOLUME);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* ── the term ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ fontSize: "20px", fontWeight: 600, letterSpacing: "-0.01em" }}>{"“best tools for small teams”"}</div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--mut)",
            background: "var(--bg2)",
            border: "1px solid var(--brd)",
            borderRadius: "999px",
            padding: "3px 10px",
          }}
        >
          {"Commercial intent"}
        </span>
      </div>

      {/* ── headline figures ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <Stat label="Monthly volume" value="12,000" note="Searches and AI questions using this phrasing" />
        <Stat label="12-month change" value="+15%" note="Direction of travel over the last year" tone="good" />
        <Stat label="Difficulty" value="45" note="How contested the term is, 0–100" />
        <Stat label="Brands named" value="6" note="Distinct brands AI answers name for this term" />
      </div>

      {/* ── volume curve ── */}
      <div style={CARD}>
        <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Volume over time"}</div>
        <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>{"Monthly volume for this term, last 12 months"}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "130px", marginTop: "18px" }}>
          {VOLUME.map((v, i) => (
            <div key={MONTHS[i]} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "100%",
                  height: `${(v / peak) * 105}px`,
                  background: "rgba(142,124,242,0.55)",
                  borderRadius: "4px 4px 0 0",
                }}
              />
              <span style={{ fontSize: "10px", color: "var(--fnt)" }}>{MONTHS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "16px" }}>
        {/* ── related terms ── */}
        <div style={CARD}>
          <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Related terms"}</div>
          <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>{"Phrasings that expand the same demand"}</div>

          <div style={{ marginTop: "14px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(200px,2fr) 120px 90px",
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
              <div style={{ textAlign: "right" }}>{"Trend"}</div>
            </div>

            {RELATED.map((r, i) => (
              <div
                key={r.term}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(200px,2fr) 120px 90px",
                  gap: "12px",
                  alignItems: "center",
                  padding: "11px 0",
                  borderBottom: i === RELATED.length - 1 ? undefined : "1px solid var(--brd)",
                  fontSize: "12.5px",
                }}
              >
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.term}</div>
                <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.volume.toLocaleString("en-US")}</div>
                <div
                  style={{
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: 600,
                    color: r.trend > 0 ? "var(--good)" : r.trend < 0 ? "var(--bad)" : "var(--mut)",
                  }}
                >
                  {`${r.trend > 0 ? "+" : ""}${r.trend}%`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── where the demand shows up ── */}
        <div style={CARD}>
          <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Where it is asked"}</div>
          <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>{"Share of this term's volume by surface"}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
            {SURFACES.map((p) => (
              <div key={p.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "6px" }}>
                  <span>{p.label}</span>
                  <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{`${p.share}%`}</span>
                </div>
                <div style={{ height: "4px", background: "var(--bg2)", borderRadius: "2px" }}>
                  <div style={{ width: `${p.share}%`, height: "4px", background: "var(--ac)", borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── question phrasings ── */}
      <div style={CARD}>
        <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Questions behind this term"}</div>
        <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>
          {"The question phrasings a demand pipeline would surface, ready to add as tracked prompts"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "12px" }}>
          {QUESTIONS.map((q, i) => (
            <div
              key={q}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "11px 0",
                borderBottom: i === QUESTIONS.length - 1 ? undefined : "1px solid var(--brd)",
                fontSize: "12.5px",
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q}</span>
              <span
                style={{
                  flex: "none",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "var(--ac)",
                  border: "1px solid color-mix(in oklab,var(--ac) 32%,transparent)",
                  borderRadius: "6px",
                  padding: "4px 10px",
                }}
              >
                {"Track prompt"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
