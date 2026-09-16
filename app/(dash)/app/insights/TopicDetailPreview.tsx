/* Illustrative layout for the Insights → topic detail screen.

   Rendered ONLY as a child of <LockedPreview>, which dims, greyscales and
   inerts it and stamps the "illustrative — not measured data" badge over it.
   Every figure below is a neutral round placeholder showing what a single
   topic's page would look like once the sampler tags prompts with a subject
   (lib/preview/sources.ts → "topics"). No brand and no real topic is named —
   the topic is "Example topic" and brands are "Brand A" / "Competitor A". */

const CARD: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "18px 20px",
};

const PLATFORM_FALLBACK = ["ChatGPT", "Claude", "Gemini", "Perplexity"];

/** 14 evenly-spaced round points — a plausible curve, not a measured one. */
const TREND = [30, 30, 35, 35, 40, 40, 40, 45, 45, 50, 50, 45, 50, 55];

const PLATFORM_SPLIT = [55, 50, 40, 35, 30];

const BRANDS = [
  { name: "Brand A", share: 40 },
  { name: "Competitor A", share: 30 },
  { name: "Competitor B", share: 20 },
  { name: "Competitor C", share: 10 },
];

const PROMPTS = [
  { prompt: "best options for a small team", mentioned: true, rank: 1, platforms: 4 },
  { prompt: "what are the main alternatives", mentioned: true, rank: 2, platforms: 4 },
  { prompt: "how much does it typically cost", mentioned: false, rank: null, platforms: 3 },
  { prompt: "which one is easiest to set up", mentioned: true, rank: 3, platforms: 4 },
  { prompt: "is it worth it for a first-time buyer", mentioned: false, rank: null, platforms: 3 },
];

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div style={CARD}>
      <div style={{ fontSize: "11.5px", color: "var(--fnt)", fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: "26px", fontWeight: 600, marginTop: "6px", fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: "11.5px", color: "var(--mut)", marginTop: "4px", lineHeight: 1.5 }}>{note}</div>
    </div>
  );
}

export default function TopicDetailPreview({ platforms }: { platforms?: string[] }) {
  const cols = (platforms && platforms.length ? platforms : PLATFORM_FALLBACK).slice(0, 5);

  const w = 640;
  const h = 130;
  const pts = TREND.map((v, i) => {
    const x = (i / (TREND.length - 1)) * w;
    const y = h - (v / 70) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* ── topic header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ fontSize: "20px", fontWeight: 600, letterSpacing: "-0.01em" }}>{"Example topic"}</div>
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
          {"20 tracked prompts"}
        </span>
      </div>

      {/* ── topic-scoped headline figures ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        <Stat label="Visibility in this topic" value="50%" note="Sampled answers on this subject that name your brand" />
        <Stat label="Share of voice" value="40%" note="Your slice of tracked-brand mentions on this subject" />
        <Stat label="Average position" value="2nd" note="Where your brand is named among brands in the answer" />
      </div>

      {/* ── trend ── */}
      <div style={CARD}>
        <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Visibility in this topic over time"}</div>
        <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>
          {"One point per day the sampler ran, for prompts tagged to this topic"}
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: "130px", marginTop: "14px", display: "block" }}>
          <polyline points={`0,${h} ${pts.join(" ")} ${w},${h}`} fill="rgba(142,124,242,0.14)" stroke="none" />
          <polyline points={pts.join(" ")} fill="none" stroke="var(--ac)" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: "var(--fnt)", marginTop: "6px" }}>
          <span>{"Earliest sampled day"}</span>
          <span>{"Latest sampled day"}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "16px" }}>
        {/* ── per-platform split within the topic ── */}
        <div style={CARD}>
          <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Visibility by platform"}</div>
          <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>{"Within this topic only"}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
            {cols.map((label, i) => {
              const v = PLATFORM_SPLIT[i % PLATFORM_SPLIT.length];
              return (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "6px" }}>
                    <span>{label}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{`${v}%`}</span>
                  </div>
                  <div style={{ height: "4px", background: "var(--bg2)", borderRadius: "2px" }}>
                    <div style={{ width: `${v}%`, height: "4px", background: "var(--ac)", borderRadius: "2px" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── topic-scoped brand rank ── */}
        <div style={CARD}>
          <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Brands named on this topic"}</div>
          <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>{"Share of tracked-brand mentions"}</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: "12px" }}>
            {BRANDS.map((b, i) => (
              <div
                key={b.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "11px 0",
                  borderBottom: i === BRANDS.length - 1 ? undefined : "1px solid var(--brd)",
                  fontSize: "12.5px",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "2px",
                      background: i === 0 ? "var(--ac)" : "#7fa7d9",
                      flex: "none",
                    }}
                  />
                  {b.name}
                </span>
                <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{`${b.share}%`}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── prompts inside the topic ── */}
      <div style={CARD}>
        <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Prompts in this topic"}</div>
        <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "3px" }}>
          {"Each tracked prompt tagged to this subject, with its latest sampled result"}
        </div>

        <div style={{ marginTop: "14px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(220px,2.4fr) 110px 90px 120px",
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
            <div>{"Prompt"}</div>
            <div>{"Mentioned"}</div>
            <div style={{ textAlign: "right" }}>{"Position"}</div>
            <div style={{ textAlign: "right" }}>{"Platforms"}</div>
          </div>

          {PROMPTS.map((p, i) => (
            <div
              key={p.prompt}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(220px,2.4fr) 110px 90px 120px",
                gap: "12px",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: i === PROMPTS.length - 1 ? undefined : "1px solid var(--brd)",
                fontSize: "12.5px",
              }}
            >
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.prompt}</div>
              <div style={{ color: p.mentioned ? "var(--good)" : "var(--fnt)" }}>{p.mentioned ? "Named" : "Not named"}</div>
              <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}>
                {p.rank === null ? "—" : `#${p.rank}`}
              </div>
              <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}>
                {`${p.platforms} of ${cols.length}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
