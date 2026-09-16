/* Illustrative layout for Answer Engine Insights → Audiences.

   Shape only: the segment cards, the in-segment rank list and the per-segment
   comparison table this screen is designed around, filled with neutral
   placeholder values. Rendered exclusively as the child of <LockedPreview>,
   which dims it to 28% opacity, desaturates it, marks it inert/aria-hidden and
   stamps the "Preview · illustrative — not measured data" badge over it.
   Nothing here is measured and nothing here may be rendered outside it.

   The workspace brand NAME is the only real value threaded through; it labels
   the "you" row so the illustration reads as this workspace's screen. */

const CARD: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "17px 19px",
};

const GRID = "1.4fr 1fr 1fr 1fr .7fr";

type Tone = "up" | "down" | "flat";

const TONE: Record<Tone, string> = {
  up: "var(--good)",
  down: "var(--bad)",
  flat: "var(--fnt)",
};

const SEGMENTS: { name: string; desc: string; prompts: number; selected?: boolean }[] = [
  { name: "Segment A", desc: "Decision makers comparing options before a shortlist", prompts: 90, selected: true },
  { name: "Segment B", desc: "Practitioners evaluating day-to-day fit", prompts: 70 },
  { name: "Segment C", desc: "Finance and procurement checking cost and terms", prompts: 50 },
];

const RANK: { name: string; value: number; isBrand?: boolean }[] = [
  { name: "", value: 45, isBrand: true },
  { name: "Competitor A", value: 30 },
  { name: "Competitor B", value: 20 },
  { name: "Competitor C", value: 15 },
];

const TABLE: { segment: string; visibility: number; sov: number; sentiment: string; score: number; delta: string; tone: Tone }[] = [
  { segment: "Segment A", visibility: 45, sov: 36, sentiment: "Positive", score: 78, delta: "↑ 3.0", tone: "up" },
  { segment: "Segment B", visibility: 32, sov: 26, sentiment: "Positive", score: 70, delta: "↑ 1.0", tone: "up" },
  { segment: "Segment C", visibility: 18, sov: 16, sentiment: "Neutral", score: 55, delta: "↓ 0.5", tone: "down" },
];

export default function AudiencesPreview({ brand }: { brand: string }) {
  return (
    <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* ── the segment board ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {SEGMENTS.map((seg) => (
          <div
            key={seg.name}
            style={{
              ...CARD,
              padding: "15px 16px",
              border: seg.selected ? "1px solid color-mix(in oklab, var(--ac) 45%, transparent)" : "1px solid var(--brd)",
              background: seg.selected ? "rgba(142,124,242,0.06)" : "var(--bg1)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13.5px", fontWeight: 600 }}>{seg.name}</span>
              {seg.selected && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#b3a7f8",
                    background: "rgba(142,124,242,0.16)",
                    borderRadius: "4px",
                    padding: "2px 6px",
                  }}
                >
                  Selected
                </span>
              )}
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--mut)", lineHeight: 1.55 }}>{seg.desc}</div>
            <div style={{ fontSize: "11.5px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums", marginTop: "auto", paddingTop: "6px" }}>
              {`${seg.prompts} prompts`}
            </div>
          </div>
        ))}
        <div
          style={{
            border: "1px dashed var(--brd)",
            borderRadius: "10px",
            padding: "15px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--mut)" }}>+ New segment</div>
          <div style={{ fontSize: "11.5px", color: "var(--fnt)", lineHeight: 1.55 }}>
            Describe an audience — its prompt set is generated and rerun with every sample.
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "14px" }}>
        {/* ── visibility within the selected segment ── */}
        <div style={CARD}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "13.5px", fontWeight: 600 }}>Visibility — Segment A</div>
              <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>
                {`how often ${brand} appears in this segment's answers`}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "22px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>45%</span>
              <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--good)" }}>↑ 3.0</span>
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
              <span>50%</span>
              <span>40%</span>
              <span>30%</span>
              <span>20%</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <svg width="100%" height="170" viewBox="0 0 700 170" preserveAspectRatio="none" style={{ width: "100%", display: "block" }}>
                <line x1="0" y1="16" x2="700" y2="16" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="66" x2="700" y2="66" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="116" x2="700" y2="116" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="166" x2="700" y2="166" stroke="rgba(255,255,255,0.05)" />
                <path
                  d="M0 118L58 114L116 116L174 106L232 102L290 104L348 94L406 88L464 90L522 76L580 70L638 62L700 56"
                  fill="none"
                  stroke="var(--ac)"
                  strokeWidth="1.75"
                />
                <path
                  d="M0 138L58 136L116 137L174 132L232 134L290 129L348 131L406 126L464 128L522 123L580 125L638 120L700 118"
                  fill="none"
                  stroke="var(--info)"
                  strokeWidth="1.25"
                  opacity=".75"
                />
                <circle cx="700" cy="56" r="3" fill="var(--ac)" />
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

        {/* ── rank inside the selected segment ── */}
        <div style={CARD}>
          <div style={{ fontSize: "13.5px", fontWeight: 600 }}>Rank in segment</div>
          <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>Segment A · share of brand mentions</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: "8px" }}>
            {RANK.map((r, i) => (
              <div
                key={r.isBrand ? "brand" : r.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 0",
                  borderBottom: i === RANK.length - 1 ? undefined : "1px solid var(--brd)",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "var(--fnt)", fontVariantNumeric: "tabular-nums", width: "16px" }}>{i + 1}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "2px",
                      background: r.isBrand ? "var(--ac)" : "var(--info)",
                      flex: "none",
                    }}
                  />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.isBrand ? brand : r.name}
                  </span>
                  {r.isBrand && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        color: "#b3a7f8",
                        background: "rgba(142,124,242,0.16)",
                        borderRadius: "4px",
                        padding: "2px 6px",
                        flex: "none",
                      }}
                    >
                      You
                    </span>
                  )}
                </span>
                <span style={{ marginLeft: "auto", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{`${r.value}%`}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "11px", color: "var(--fnt)", lineHeight: 1.55, marginTop: "12px" }}>
            Segments come from your audience definitions and are rerun with every sample, like any prompt set.
          </div>
        </div>
      </div>

      {/* ── the per-segment comparison table ── */}
      <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 19px 11px" }}>
          <span style={{ fontSize: "13.5px", fontWeight: 600 }}>Segment comparison</span>
          <span style={{ fontSize: "11px", color: "var(--fnt)" }}>sentiment = 0–100 favourability score</span>
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
          <span>Segment</span>
          <span>Visibility</span>
          <span>Share of voice</span>
          <span>Sentiment</span>
          <span>Δ 30d</span>
        </div>

        {TABLE.map((r, i) => (
          <div
            key={r.segment}
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              alignItems: "center",
              padding: "10px 19px",
              fontSize: "13px",
              background: i === 0 ? "rgba(142,124,242,0.06)" : undefined,
              borderTop: i === 0 ? undefined : "1px solid var(--brd)",
            }}
          >
            <span style={{ fontWeight: 500 }}>{r.segment}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{`${r.visibility}%`}</span>
              <span style={{ width: "60px", height: "3px", background: "var(--bg2)", borderRadius: "2px", display: "inline-block" }}>
                <span style={{ display: "block", width: `${r.visibility}%`, height: "3px", background: "var(--ac)", borderRadius: "2px" }} />
              </span>
            </span>
            <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{`${r.sov}%`}</span>
            <span style={{ color: "var(--mut)", fontVariantNumeric: "tabular-nums" }}>{`${r.sentiment} · ${r.score}`}</span>
            <span style={{ fontSize: "12px", fontWeight: 500, color: TONE[r.tone] }}>{r.delta}</span>
          </div>
        ))}
      </div>

      {/* ── the insight line the screen is designed to end on ── */}
      <div style={{ ...CARD, padding: "14px 19px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--ac)", marginTop: "6px", flex: "none" }} />
        <div style={{ fontSize: "12.5px", color: "var(--mut)", lineHeight: 1.6 }}>
          <span style={{ color: "var(--tx)", fontWeight: 500 }}>Weakest segment: </span>
          Segment C answers rarely cite the pages that segment asks about most, so its share of voice trails the other
          two even where the prompts overlap.
        </div>
      </div>
    </div>
  );
}
