/* Illustrative layout for Answer Engine Insights → Sentiment.

   Shape only: the positive/neutral/negative split bar, the sentiment-over-time
   line and the themes table this screen is designed around, filled with neutral
   placeholder values. Rendered exclusively as the child of <LockedPreview>,
   which dims it to 28% opacity, desaturates it, marks it inert/aria-hidden and
   stamps the "Preview · illustrative — not measured data" badge over it.
   Nothing here is measured and nothing here may be rendered outside it.

   The workspace brand NAME is the only real value threaded through; it appears
   in the card captions so the illustration reads as this workspace's screen. */

const CARD: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "17px 19px",
};

const GRID = "1.6fr .9fr .9fr .6fr";

type Tone = "up" | "down" | "flat";

const TONE: Record<Tone, string> = {
  up: "var(--good)",
  down: "var(--bad)",
  flat: "var(--fnt)",
};

const SPLIT: { label: string; value: number; color: string }[] = [
  { label: "Positive", value: 60, color: "var(--good)" },
  { label: "Neutral", value: 25, color: "var(--info)" },
  { label: "Negative", value: 15, color: "var(--bad)" },
];

const THEMES: { theme: string; sentiment: "Positive" | "Neutral" | "Negative"; occurrences: number; delta: string; tone: Tone; trending?: boolean }[] = [
  { theme: "Product accuracy", sentiment: "Positive", occurrences: 200, delta: "↑ 25", tone: "up" },
  { theme: "Integrations", sentiment: "Positive", occurrences: 150, delta: "↑ 10", tone: "up" },
  { theme: "Pricing at scale", sentiment: "Negative", occurrences: 90, delta: "↑ 30", tone: "down", trending: true },
  { theme: "Onboarding time", sentiment: "Negative", occurrences: 60, delta: "↓ 10", tone: "up" },
  { theme: "Support quality", sentiment: "Neutral", occurrences: 40, delta: "↑ 5", tone: "up" },
];

const SENTIMENT_COLOR: Record<"Positive" | "Neutral" | "Negative", string> = {
  Positive: "var(--good)",
  Neutral: "var(--info)",
  Negative: "var(--bad)",
};

export default function SentimentPreview({ brand }: { brand: string }) {
  return (
    <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "14px" }}>
        {/* ── sentiment over time ── */}
        <div style={CARD}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "13.5px", fontWeight: 600 }}>Positive sentiment</div>
              <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>
                {`how favourably answers describe ${brand} when it appears`}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "22px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>60%</span>
              <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--good)" }}>↑ 3pt</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "14px", alignItems: "stretch" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "2px 0",
                textAlign: "right",
                fontSize: "10.5px",
                color: "var(--fnt)",
                fontVariantNumeric: "tabular-nums",
                flex: "none",
                width: "26px",
              }}
            >
              <span>80%</span>
              <span>70%</span>
              <span>60%</span>
              <span>50%</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <svg width="100%" height="170" viewBox="0 0 700 170" preserveAspectRatio="none" style={{ width: "100%", display: "block" }}>
                <line x1="0" y1="16" x2="700" y2="16" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="66" x2="700" y2="66" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="116" x2="700" y2="116" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="166" x2="700" y2="166" stroke="rgba(255,255,255,0.05)" />
                <path
                  d="M0 128L58 124L116 126L174 118L232 120L290 110L348 112L406 102L464 104L522 96L580 92L638 86L700 82"
                  fill="none"
                  stroke="var(--good)"
                  strokeWidth="1.75"
                />
                <path
                  d="M0 150L58 149L116 151L174 148L232 150L290 146L348 148L406 145L464 147L522 144L580 146L638 143L700 142"
                  fill="none"
                  stroke="var(--bad)"
                  strokeWidth="1.25"
                  opacity=".8"
                />
                <circle cx="700" cy="82" r="3" fill="var(--good)" />
              </svg>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "10.5px",
                  color: "var(--fnt)",
                  marginTop: "8px",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── the split ── */}
        <div style={CARD}>
          <div style={{ fontSize: "13.5px", fontWeight: 600 }}>What drives it</div>
          <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>Share of answers by tone</div>

          <div style={{ display: "flex", height: "10px", borderRadius: "5px", overflow: "hidden", marginTop: "16px" }}>
            {SPLIT.map((s) => (
              <div key={s.label} style={{ width: `${s.value}%`, background: s.color }} />
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "14px" }}>
            {SPLIT.map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "2px", background: s.color, flex: "none" }} />
                <span style={{ color: "var(--mut)" }}>{s.label}</span>
                <span style={{ marginLeft: "auto", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{`${s.value}%`}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--brd)" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--fnt)" }}>
              Positive themes
            </div>
            <div style={{ fontSize: "12px", color: "var(--mut)", marginTop: "5px", lineHeight: 1.55 }}>
              Product accuracy · Integrations · Support quality
            </div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--fnt)",
                marginTop: "12px",
              }}
            >
              Negative themes
            </div>
            <div style={{ fontSize: "12px", color: "var(--mut)", marginTop: "5px", lineHeight: 1.55 }}>
              Pricing at scale · Onboarding time
            </div>
          </div>
        </div>
      </div>

      {/* ── the themes table ── */}
      <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 19px 11px" }}>
          <span style={{ fontSize: "13.5px", fontWeight: 600 }}>Themes</span>
          <div style={{ display: "flex", gap: "8px", fontSize: "11.5px" }}>
            <span style={{ color: "#fff", background: "var(--ac)", borderRadius: "5px", padding: "4px 10px", fontWeight: 600 }}>All</span>
            <span style={{ color: "var(--mut)", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 10px" }}>Positive</span>
            <span style={{ color: "var(--mut)", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 10px" }}>Negative</span>
            <span style={{ color: "var(--mut)", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 10px" }}>Trending</span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            padding: "7px 19px",
            fontSize: "11px",
            fontWeight: 500,
            color: "var(--fnt)",
            borderBottom: "1px solid var(--brd)",
          }}
        >
          <span>Theme</span>
          <span>Sentiment</span>
          <span>Occurrences</span>
          <span>Δ 30d</span>
        </div>

        {THEMES.map((t, i) => (
          <div
            key={t.theme}
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              alignItems: "center",
              padding: "10px 19px",
              fontSize: "13px",
              borderTop: i === 0 ? undefined : "1px solid var(--brd)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, fontWeight: 500 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.theme}</span>
              {t.trending && (
                <span
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 700,
                    letterSpacing: ".06em",
                    color: "var(--gold)",
                    background: "rgba(232,179,75,0.14)",
                    borderRadius: "4px",
                    padding: "2px 6px",
                    flex: "none",
                  }}
                >
                  TRENDING
                </span>
              )}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--mut)" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "2px", background: SENTIMENT_COLOR[t.sentiment], flex: "none" }} />
              {t.sentiment}
            </span>
            <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{t.occurrences}</span>
            <span style={{ fontSize: "12px", fontWeight: 500, color: TONE[t.tone] }}>{t.delta}</span>
          </div>
        ))}
      </div>

      {/* ── the annotated answer the screen is designed to end on ── */}
      <div style={{ ...CARD, padding: "15px 19px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "13.5px", fontWeight: 600 }}>Answer receipt</span>
          <span style={{ fontSize: "10px", color: "var(--fnt)", letterSpacing: ".06em" }}>ONE ENGINE · ONE SAMPLED ANSWER</span>
          <span style={{ marginLeft: "auto", fontSize: "11.5px", color: "var(--mut)" }}>Negative theme · Pricing at scale</span>
        </div>
        <div
          style={{
            marginTop: "12px",
            background: "var(--bg2)",
            border: "1px solid var(--brd)",
            borderRadius: "8px",
            padding: "13px 15px",
            fontSize: "12.5px",
            color: "var(--mut)",
            lineHeight: 1.7,
          }}
        >
          {`…${brand} is the stronger option technically, with `}
          <span style={{ color: "var(--tx)", background: "rgba(76,183,130,0.14)", borderRadius: "3px", padding: "1px 4px" }}>
            accuracy reviewers consistently praise
          </span>
          {", though "}
          <span style={{ color: "var(--tx)", background: "rgba(229,99,110,0.14)", borderRadius: "3px", padding: "1px 4px" }}>
            per-seat pricing adds up on larger teams
          </span>
          {" — budget-led buyers sometimes choose an alternative…"}
        </div>
        <div style={{ display: "flex", gap: "14px", marginTop: "10px", fontSize: "11px", color: "var(--fnt)" }}>
          <span>¹ example.com/pricing</span>
          <span>² example.com/reviews</span>
        </div>
      </div>
    </div>
  );
}
