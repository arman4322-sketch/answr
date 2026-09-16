import type { EnrichedMetrics } from "@/lib/live/enriched";

/* Sentiment — live. Every figure here is counted from the classification pass
   (lib/live/classify) over answers the sampler actually stored. Nothing is
   estimated: the split is a count of classified answers, the themes are the
   phrases the classifier returned, and the trend spans only days that have
   classified answers. */

const card: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "12px",
  padding: "18px 20px",
};

const TONE = {
  positive: { color: "#4cb782", label: "Positive" },
  neutral: { color: "#7fa7d9", label: "Neutral" },
  negative: { color: "#e5636e", label: "Negative" },
} as const;

export default function SentimentLive({ e, brand }: { e: EnrichedMetrics; brand: string }) {
  const { split } = e;
  const stamp = e.lastClassifiedAt ? new Date(e.lastClassifiedAt).toISOString().slice(0, 16).replace("T", " ") : null;

  return (
    <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: "16px", maxWidth: "1100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", fontSize: "11.5px", color: "var(--mut)" }}>
        <span style={{ background: "var(--good, #4cb782)", color: "#06210f", fontWeight: 700, fontSize: "10px", padding: "2px 8px", borderRadius: "999px" }}>
          ● LIVE DATA
        </span>
        <span>{e.classifiedAnswers} classified answers</span>
        {stamp && <span>· last classified {stamp} UTC</span>}
      </div>

      {/* split */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
        {(["positive", "neutral", "negative"] as const).map((k) => {
          const pct = k === "positive" ? split.positivePct : k === "neutral" ? split.neutralPct : split.negativePct;
          const n = split[k];
          return (
            <div key={k} style={card}>
              <div style={{ fontSize: "11.5px", color: "var(--mut)" }}>{TONE[k].label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
                <span style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.02em", color: TONE[k].color, fontVariantNumeric: "tabular-nums" }}>
                  {pct}%
                </span>
                <span style={{ fontSize: "12px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>
                  {n} of {split.total}
                </span>
              </div>
              <div style={{ height: "6px", background: "var(--bg2)", borderRadius: "3px", marginTop: "10px", overflow: "hidden" }}>
                <div style={{ height: "6px", width: `${pct}%`, background: TONE[k].color, borderRadius: "3px" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* per engine */}
      <div style={card}>
        <div style={{ fontSize: "14px", fontWeight: 600 }}>How each engine describes {brand}</div>
        <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>
          Share of that engine&rsquo;s classified answers judged positive.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "14px" }}>
          {e.byProvider.map((p) => (
            <div key={p.provider} style={{ display: "grid", gridTemplateColumns: "160px 1fr 96px", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "12.5px" }}>{p.provider}</span>
              <span style={{ height: "8px", background: "var(--bg2)", borderRadius: "4px", overflow: "hidden" }}>
                <span style={{ display: "block", height: "8px", width: `${p.positivePct}%`, background: "#4cb782", borderRadius: "4px" }} />
              </span>
              <span style={{ fontSize: "11.5px", color: "var(--mut)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {p.positivePct}% · {p.total} ans
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* themes */}
      {e.themes.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>What drives the tone</div>
          <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>
            Themes the classifier extracted from the answers, most frequent first.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr .5fr .6fr", padding: "10px 0 7px", fontSize: "10px", fontWeight: 500, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--fnt)", borderBottom: "1px solid var(--brd)", marginTop: "10px" }}>
            <span>Theme</span><span>Answers</span><span>Leaning</span>
          </div>
          {e.themes.map((t) => (
            <div key={t.theme} style={{ display: "grid", gridTemplateColumns: "1.6fr .5fr .6fr", alignItems: "center", padding: "9px 0", fontSize: "12.5px", borderBottom: "1px solid var(--brd)" }}>
              <span style={{ textTransform: "capitalize" }}>{t.theme}</span>
              <span style={{ color: "var(--mut)", fontVariantNumeric: "tabular-nums" }}>{t.count}</span>
              <span style={{ color: TONE[t.leaning].color, fontWeight: 500 }}>{TONE[t.leaning].label}</span>
            </div>
          ))}
        </div>
      )}

      {/* trend — only when more than one day has been classified */}
      {e.sentimentSeries.length >= 2 ? (
        <div style={card}>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>Positive rate over time</div>
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginTop: "16px", height: "90px" }}>
            {e.sentimentSeries.map((d) => (
              <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "100%", background: "var(--bg2)", borderRadius: "4px", height: "70px", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                  <div style={{ width: "100%", height: `${d.positivePct}%`, background: "#4cb782" }} />
                </div>
                <span style={{ fontSize: "10px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ ...card, fontSize: "12px", color: "var(--mut)" }}>
          {e.sentimentSeries.length === 1
            ? "One day of classified answers — a sentiment trend starts on the second classified day."
            : "No classified history yet."}
        </div>
      )}
    </div>
  );
}
