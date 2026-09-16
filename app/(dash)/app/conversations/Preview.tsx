/* Illustrative layout for Conversations.

   This renders ONLY inside <LockedPreview>, which dims it to 28% opacity,
   desaturates it, marks it inert + aria-hidden and stamps the permanent
   "Preview · illustrative — not measured data" badge on top. Nothing here is
   measured and nothing here is reachable by keyboard, pointer or screen reader.

   It exists so a viewer can see the SHAPE of the screen this capability would
   fill: a conversation list with a volume column on the left, and the selected
   multi-turn thread on the right. Every label is a neutral placeholder
   ("Brand A", "Competitor A", example.com) — no real brand carries a figure. */

const panel: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  overflow: "hidden",
};
const cardHead: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 20px 12px",
};
const cardTitle: React.CSSProperties = { fontSize: "14.5px", fontWeight: 600 };
const cardNote: React.CSSProperties = { fontSize: "11px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" };

const GRID = "2.3fr .55fr .9fr 1.3fr";
const colHead: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: GRID,
  padding: "8px 20px",
  fontSize: "10px",
  fontWeight: 500,
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--fnt)",
  borderBottom: "1px solid var(--brd)",
};

interface Thread {
  topic: string;
  turns: number;
  assistant: string;
  volume: string;
  share: number;
}

const THREADS: Thread[] = [
  { topic: "What should I look for before choosing?", turns: 4, assistant: "ChatGPT", volume: "3,000", share: 100 },
  { topic: "How does Brand A compare to Competitor A?", turns: 5, assistant: "Claude", volume: "2,400", share: 80 },
  { topic: "Is Brand A worth the higher price?", turns: 3, assistant: "Gemini", volume: "1,800", share: 60 },
  { topic: "Alternatives to Competitor A", turns: 4, assistant: "Perplexity", volume: "1,200", share: 40 },
  { topic: "Which option has the best support?", turns: 3, assistant: "ChatGPT", volume: "900", share: 30 },
  { topic: "Do people switch away from Brand A?", turns: 2, assistant: "Claude", volume: "600", share: 20 },
];

interface Turn {
  role: "person" | "assistant";
  text: string;
  mentions?: string[];
  cites?: string[];
}

const TURNS: Turn[] = [
  { role: "person", text: "What should I look for before choosing?" },
  {
    role: "assistant",
    text: "Start with the three things that actually differ between vendors — coverage, price and support response time. Brand A and Competitor A both publish their numbers.",
    mentions: ["Brand A", "Competitor A"],
    cites: ["example.com", "example.org"],
  },
  { role: "person", text: "How does Brand A compare to Competitor A on support?" },
  {
    role: "assistant",
    text: "Brand A publishes a same-business-day target; Competitor A quotes a 48-hour window on its standard plan.",
    mentions: ["Brand A", "Competitor A"],
    cites: ["example.com"],
  },
  { role: "person", text: "Is Brand A worth the extra cost for a small team?" },
];

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "15px 17px" }}>
      <div style={{ fontSize: "11.5px", fontWeight: 500, color: "var(--mut)" }}>{label}</div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          fontVariantNumeric: "tabular-nums",
          marginTop: "10px",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "10.5px", color: "var(--fnt)", marginTop: "6px" }}>{sub}</div>
    </div>
  );
}

function Chip({ text, tone }: { text: string; tone: "brand" | "source" }) {
  const brand = tone === "brand";
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: 500,
        borderRadius: "4px",
        padding: "2px 6px",
        color: brand ? "var(--ac)" : "#7fa7d9",
        border: `1px solid ${brand ? "color-mix(in oklab,var(--ac) 40%,transparent)" : "rgba(127,167,217,.35)"}`,
      }}
    >
      {text}
    </span>
  );
}

export default function ConversationsPreview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        <Kpi label="Conversations analysed" value="12,000" sub="rolling 30 days" />
        <Kpi label="Topics covered" value="40" sub="clustered from the panel" />
        <Kpi label="Avg turns per thread" value="3.4" sub="opening prompt to decision" />
        <Kpi label="Threads mentioning Brand A" value="20%" sub="of analysed conversations" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "16px", alignItems: "start" }}>
        <div style={panel}>
          <div style={cardHead}>
            <div style={cardTitle}>Conversations</div>
            <div style={cardNote}>Sorted by volume</div>
          </div>
          <div style={colHead}>
            <span>Opening prompt</span>
            <span>Turns</span>
            <span>Assistant</span>
            <span>Volume / mo</span>
          </div>
          {THREADS.map((t, i) => (
            <div
              key={t.topic}
              style={{
                display: "grid",
                gridTemplateColumns: GRID,
                alignItems: "center",
                padding: "11px 20px",
                fontSize: "13px",
                ...(i > 0 ? { borderTop: "1px solid var(--brd)" } : {}),
                ...(i === 0 ? { background: "rgba(255,255,255,0.025)" } : {}),
              }}
            >
              <span style={{ fontSize: "12.5px" }}>{t.topic}</span>
              <span style={{ fontSize: "12.5px", color: "var(--mut)", fontVariantNumeric: "tabular-nums" }}>{t.turns}</span>
              <span style={{ fontSize: "11.5px", color: "var(--mut)" }}>{t.assistant}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "88px", height: "4px", background: "var(--bg2)", borderRadius: "2px", display: "inline-block" }}>
                  <span style={{ display: "block", width: `${t.share}%`, height: "4px", background: "var(--ac)", borderRadius: "2px" }} />
                </span>
                <span style={{ fontSize: "11px", color: "var(--mut)", fontVariantNumeric: "tabular-nums" }}>{t.volume}</span>
              </span>
            </div>
          ))}
        </div>

        <div style={panel}>
          <div style={cardHead}>
            <div style={cardTitle}>Thread</div>
            <div style={cardNote}>5 turns · ChatGPT</div>
          </div>
          <div style={{ padding: "4px 20px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {TURNS.map((turn, i) => (
              <div
                key={i}
                style={{
                  background: turn.role === "person" ? "transparent" : "var(--bg2)",
                  border: `1px solid ${turn.role === "person" ? "var(--brd)" : "transparent"}`,
                  borderRadius: "9px",
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 600,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    color: "var(--fnt)",
                    marginBottom: "5px",
                  }}
                >
                  {turn.role === "person" ? "Person" : "Assistant"}
                </div>
                <div style={{ fontSize: "12.5px", lineHeight: 1.6, color: turn.role === "person" ? "var(--tx)" : "var(--mut)" }}>
                  {turn.text}
                </div>
                {(turn.mentions || turn.cites) && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "9px" }}>
                    {turn.mentions?.map((m) => (
                      <Chip key={m} text={m} tone="brand" />
                    ))}
                    {turn.cites?.map((c) => (
                      <Chip key={c} text={c} tone="source" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
