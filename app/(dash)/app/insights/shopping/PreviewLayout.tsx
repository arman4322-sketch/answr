/* Illustrative layout for Answer Engine Insights → Shopping.

   Shape only: the recommendation-rate headline, the attribute-influence bars,
   the products table (product · mentions · engines · average position) and the
   purchase-intent prompt rows this screen is designed around, filled with
   neutral placeholder values. Rendered exclusively as the child of
   <LockedPreview>, which dims it to 28% opacity, desaturates it, marks it
   inert/aria-hidden and stamps the "Preview · illustrative — not measured data"
   badge over it. Nothing here is measured and nothing here may be rendered
   outside it.

   The workspace brand NAME is the only real value threaded through, used to
   label the rows that would be the workspace's own products. */

const CARD: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "17px 19px",
};

const GRID = "1.5fr .7fr .7fr 1.2fr 1.3fr .6fr";

type Tone = "up" | "down" | "flat";

const TONE: Record<Tone, string> = {
  up: "var(--good)",
  down: "var(--bad)",
  flat: "var(--fnt)",
};

const ATTRIBUTES: { name: string; weight: number }[] = [
  { name: "Accuracy", weight: 35 },
  { name: "Integrations", weight: 30 },
  { name: "Ease of setup", weight: 20 },
  { name: "Price", weight: 15 },
];

const PRODUCTS: {
  product: string;
  isBrand?: boolean;
  position: string;
  mentions: number;
  engines: string[];
  attributes: string[];
  delta: string;
  tone: Tone;
}[] = [
  { product: "Product A", isBrand: true, position: "#1", mentions: 200, engines: ["ChatGPT", "AI Overviews"], attributes: ["accuracy", "integrations"], delta: "↑ 30", tone: "up" },
  { product: "Competitor A — flagship", position: "#2", mentions: 180, engines: ["Perplexity", "ChatGPT"], attributes: ["setup", "price"], delta: "↓ 10", tone: "down" },
  { product: "Product B", isBrand: true, position: "#3", mentions: 100, engines: ["ChatGPT"], attributes: ["automation"], delta: "↑ 10", tone: "up" },
  { product: "Competitor B — flagship", position: "#4", mentions: 70, engines: ["Claude", "Gemini"], attributes: ["reporting"], delta: "↓ 5", tone: "down" },
];

const INTENT_PROMPTS: { prompt: string; engines: string; answers: number; outcome: string; tone: Tone }[] = [
  { prompt: "“best [category] tool for a small team”", engines: "4 engines", answers: 60, outcome: "Recommended · position 1", tone: "up" },
  { prompt: "“[category] platforms compared”", engines: "4 engines", answers: 40, outcome: "Recommended · position 2", tone: "up" },
  { prompt: "“cheapest [category] software that still integrates”", engines: "3 engines", answers: 30, outcome: "Not recommended", tone: "down" },
  { prompt: "“alternatives to [competitor]”", engines: "3 engines", answers: 20, outcome: "Recommended · position 3", tone: "flat" },
];

function Chip({ label }: { label: string }) {
  return (
    <span
      style={{
        fontSize: "10.5px",
        color: "var(--mut)",
        border: "1px solid var(--brd)",
        background: "var(--bg2)",
        borderRadius: "4px",
        padding: "2px 6px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export default function ShoppingPreview({ brand }: { brand: string }) {
  return (
    <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "14px" }}>
        {/* ── recommendation rate over time ── */}
        <div style={CARD}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "13.5px", fontWeight: 600 }}>Recommendation rate</div>
              <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>
                {`% of purchase-intent answers recommending a ${brand} product`}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "22px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>30%</span>
              <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--good)" }}>↑ 2.0</span>
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
              <span>40%</span>
              <span>30%</span>
              <span>20%</span>
              <span>10%</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <svg width="100%" height="170" viewBox="0 0 700 170" preserveAspectRatio="none" style={{ width: "100%", display: "block" }}>
                <line x1="0" y1="16" x2="700" y2="16" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="66" x2="700" y2="66" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="116" x2="700" y2="116" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="166" x2="700" y2="166" stroke="rgba(255,255,255,0.05)" />
                <path
                  d="M0 124L58 120L116 122L174 112L232 114L290 104L348 106L406 96L464 98L522 88L580 84L638 78L700 74"
                  fill="none"
                  stroke="var(--ac)"
                  strokeWidth="1.75"
                />
                <circle cx="700" cy="74" r="3" fill="var(--ac)" />
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

        {/* ── what the engines weigh when they recommend ── */}
        <div style={CARD}>
          <div style={{ fontSize: "13.5px", fontWeight: 600 }}>Attribute influence</div>
          <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>
            what drives recommendations in this category
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "13px", marginTop: "16px" }}>
            {ATTRIBUTES.map((a) => (
              <div key={a.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "6px" }}>
                  <span>{a.name}</span>
                  <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{`${a.weight}%`}</span>
                </div>
                <div style={{ height: "4px", background: "var(--bg2)", borderRadius: "2px" }}>
                  <div style={{ width: `${a.weight * 2}%`, maxWidth: "100%", height: "4px", background: "var(--ac)", borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── the products table ── */}
      <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 19px 11px" }}>
          <span style={{ fontSize: "13.5px", fontWeight: 600 }}>Products in AI recommendations</span>
          <span style={{ fontSize: "11px", color: "var(--fnt)" }}>matched against your product catalog</span>
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
          <span>Product</span>
          <span>Avg. position</span>
          <span>Mentions</span>
          <span>Engines</span>
          <span>Attributes cited</span>
          <span>Δ 30d</span>
        </div>

        {PRODUCTS.map((p, i) => (
          <div
            key={p.product}
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
            <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, fontWeight: 500 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.product}</span>
              {p.isBrand && (
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
                  {brand}
                </span>
              )}
            </span>
            <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{p.position}</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{p.mentions}</span>
            <span style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {p.engines.map((e) => (
                <Chip key={e} label={e} />
              ))}
            </span>
            <span style={{ display: "flex", gap: "5px", flexWrap: "wrap", color: "var(--mut)", fontSize: "12px" }}>
              {p.attributes.join(" · ")}
            </span>
            <span style={{ fontSize: "12px", fontWeight: 500, color: TONE[p.tone] }}>{p.delta}</span>
          </div>
        ))}
      </div>

      {/* ── the purchase-intent prompt set ── */}
      <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 19px 11px" }}>
          <span style={{ fontSize: "13.5px", fontWeight: 600 }}>Purchase-intent prompts</span>
          <span style={{ fontSize: "11px", color: "var(--fnt)" }}>the buying questions this category is asked</span>
        </div>

        {INTENT_PROMPTS.map((r, i) => (
          <div
            key={r.prompt}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "11px 19px",
              fontSize: "13px",
              borderTop: i === 0 ? "1px solid var(--brd)" : "1px solid var(--brd)",
            }}
          >
            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.prompt}
            </span>
            <span style={{ fontSize: "11.5px", color: "var(--fnt)", flex: "none" }}>{r.engines}</span>
            <span style={{ fontSize: "11.5px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums", flex: "none", width: "76px", textAlign: "right" }}>
              {`${r.answers} answers`}
            </span>
            <span style={{ fontSize: "12px", fontWeight: 500, color: TONE[r.tone], flex: "none", width: "160px", textAlign: "right" }}>
              {r.outcome}
            </span>
          </div>
        ))}
      </div>

      {/* ── the insight line the screen is designed to end on ── */}
      <div style={{ ...CARD, padding: "14px 19px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--ac)", marginTop: "6px", flex: "none" }} />
        <div style={{ fontSize: "12.5px", color: "var(--mut)", lineHeight: 1.6 }}>
          <span style={{ color: "var(--tx)", fontWeight: 500 }}>Why second on one engine: </span>
          engines that weight recent editorial reviews rank the product they have fresher coverage for. The indicated
          move is refreshing the most-cited review pages on example.com.
        </div>
      </div>
    </div>
  );
}
