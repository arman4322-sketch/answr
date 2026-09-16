/* Illustrative layout for Answer Engine Insights → Regions.

   This file renders ONLY the shape of the screen: the cards, the table and the
   columns Regions is designed around, filled with neutral placeholder values.
   It is rendered exclusively as the child of <LockedPreview>, which dims it to
   28% opacity, desaturates it, marks it inert/aria-hidden and stamps the
   "Preview · illustrative — not measured data" badge over it. Nothing here is
   measured and nothing here may be rendered outside that wrapper.

   The only real value threaded through is the workspace brand NAME, used as a
   row label so the illustration reads as this workspace's screen. Every figure
   beside it is a round placeholder. */

const CARD: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "17px 19px",
};

const GRID = "1.15fr .8fr 1.1fr 1fr .6fr 1.1fr";

type Tone = "up" | "down" | "flat";

const TONE: Record<Tone, string> = {
  up: "var(--good)",
  down: "var(--bad)",
  flat: "var(--fnt)",
};

type RegionRow = {
  region: string;
  language: string;
  visibility: number;
  sov: number;
  delta: string;
  tone: Tone;
  /** null = the workspace brand leads this region */
  leader: string | null;
  dot: string;
};

const ROWS: RegionRow[] = [
  { region: "United States", language: "English", visibility: 40, sov: 32, delta: "↑ 2.0", tone: "up", leader: null, dot: "var(--ac)" },
  { region: "United Kingdom", language: "English", visibility: 34, sov: 27, delta: "↑ 1.5", tone: "up", leader: null, dot: "var(--ac)" },
  { region: "Germany", language: "German", visibility: 28, sov: 22, delta: "↑ 3.0", tone: "up", leader: "Competitor A", dot: "var(--info)" },
  { region: "France", language: "French", visibility: 22, sov: 18, delta: "↓ 1.0", tone: "down", leader: "Competitor B", dot: "var(--violet)" },
  { region: "Brazil", language: "Portuguese", visibility: 12, sov: 10, delta: "↑ 1.0", tone: "up", leader: "Competitor A", dot: "var(--info)" },
  { region: "Japan", language: "Japanese", visibility: 10, sov: 8, delta: "—", tone: "flat", leader: "Competitor C", dot: "var(--gold2)" },
];

const RANK: { region: string; value: number; delta: string; tone: Tone }[] = [
  { region: "United States", value: 40, delta: "↑ 2.0", tone: "up" },
  { region: "United Kingdom", value: 34, delta: "↑ 1.5", tone: "up" },
  { region: "Germany", value: 28, delta: "↑ 3.0", tone: "up" },
  { region: "France", value: 22, delta: "↓ 1.0", tone: "down" },
  { region: "Brazil", value: 12, delta: "↑ 1.0", tone: "up" },
  { region: "Japan", value: 10, delta: "—", tone: "flat" },
];

function YouChip({ brand }: { brand: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontWeight: 500 }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "2px", background: "var(--ac)", flex: "none" }} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{brand}</span>
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
    </span>
  );
}

export default function RegionsPreview({ brand }: { brand: string }) {
  return (
    <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "14px" }}>
        {/* ── visibility by locale, over time ── */}
        <div style={CARD}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "13.5px", fontWeight: 600 }}>Regional visibility</div>
              <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>
                {`% of answers naming ${brand}, by answer locale · 6 regions, 5 languages`}
              </div>
            </div>
            <div style={{ display: "flex", gap: "14px", fontSize: "11.5px", color: "var(--mut)", whiteSpace: "nowrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "2px", borderRadius: "1px", background: "var(--ac)" }} />
                United States
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "2px", borderRadius: "1px", background: "var(--info)" }} />
                United Kingdom
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "2px", borderRadius: "1px", background: "var(--gold2)" }} />
                Germany
              </span>
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
              <span>45%</span>
              <span>35%</span>
              <span>25%</span>
              <span>15%</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <svg width="100%" height="180" viewBox="0 0 700 180" preserveAspectRatio="none" style={{ width: "100%", display: "block" }}>
                <line x1="0" y1="20" x2="700" y2="20" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="72" x2="700" y2="72" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="124" x2="700" y2="124" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="176" x2="700" y2="176" stroke="rgba(255,255,255,0.05)" />
                <path
                  d="M0 92L58 88L116 90L174 80L232 76L290 78L348 68L406 62L464 64L522 54L580 48L638 44L700 40"
                  fill="none"
                  stroke="var(--ac)"
                  strokeWidth="1.75"
                />
                <path
                  d="M0 114L58 111L116 113L174 106L232 108L290 101L348 103L406 96L464 98L522 92L580 94L638 88L700 86"
                  fill="none"
                  stroke="var(--info)"
                  strokeWidth="1.25"
                  opacity=".8"
                />
                <path
                  d="M0 152L58 150L116 151L174 146L232 148L290 143L348 145L406 140L464 142L522 137L580 139L638 134L700 132"
                  fill="none"
                  stroke="var(--gold2)"
                  strokeWidth="1.25"
                  opacity=".8"
                />
                <circle cx="700" cy="40" r="3" fill="var(--ac)" />
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

        {/* ── region ranking ── */}
        <div style={CARD}>
          <div style={{ fontSize: "13.5px", fontWeight: 600 }}>Region rank</div>
          <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>Visibility, best locale first</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: "8px" }}>
            {RANK.map((r, i) => (
              <div
                key={r.region}
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
                <span>{r.region}</span>
                <span style={{ marginLeft: "auto", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{`${r.value}%`}</span>
                <span style={{ fontSize: "11.5px", fontWeight: 500, color: TONE[r.tone], width: "38px", textAlign: "right" }}>
                  {r.delta}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── the by-region table ── */}
      <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 19px 11px" }}>
          <span style={{ fontSize: "13.5px", fontWeight: 600 }}>By region</span>
          <div style={{ display: "flex", gap: "8px", fontSize: "11.5px" }}>
            <span style={{ color: "#fff", background: "var(--ac)", borderRadius: "5px", padding: "4px 10px", fontWeight: 600 }}>
              All languages
            </span>
            <span style={{ color: "var(--mut)", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 10px" }}>English</span>
            <span style={{ color: "var(--mut)", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 10px" }}>German</span>
            <span style={{ color: "var(--mut)", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 10px" }}>French</span>
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
          <span>Region</span>
          <span>Language</span>
          <span>Visibility</span>
          <span>Share of voice</span>
          <span>Δ 30d</span>
          <span>Leading brand</span>
        </div>

        {ROWS.map((r, i) => (
          <div
            key={r.region}
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              alignItems: "center",
              padding: "10px 19px",
              fontSize: "13px",
              background: r.leader === null && i === 0 ? "rgba(142,124,242,0.06)" : undefined,
              borderTop: i === 0 ? undefined : "1px solid var(--brd)",
            }}
          >
            <span style={{ fontWeight: 500 }}>{r.region}</span>
            <span style={{ color: "var(--mut)" }}>{r.language}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{`${r.visibility}%`}</span>
              <span style={{ width: "70px", height: "3px", background: "var(--bg2)", borderRadius: "2px", display: "inline-block" }}>
                <span style={{ display: "block", width: `${r.visibility}%`, height: "3px", background: "var(--ac)", borderRadius: "2px" }} />
              </span>
            </span>
            <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{`${r.sov}%`}</span>
            <span style={{ fontSize: "12px", fontWeight: 500, color: TONE[r.tone] }}>{r.delta}</span>
            {r.leader === null ? (
              <YouChip brand={brand} />
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--tx)" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "2px", background: r.dot, flex: "none" }} />
                {r.leader}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── the insight line the screen is designed to end on ── */}
      <div style={{ ...CARD, padding: "14px 19px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--ac)", marginTop: "6px", flex: "none" }} />
        <div style={{ fontSize: "12.5px", color: "var(--mut)", lineHeight: 1.6 }}>
          <span style={{ color: "var(--tx)", fontWeight: 500 }}>Translation gap: </span>
          German-locale answers cite example.com far less often than English-locale answers, so visibility in that region
          rests on third-party sources. Localising the most-cited pages is the indicated move.
        </div>
      </div>
    </div>
  );
}
