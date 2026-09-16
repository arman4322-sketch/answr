import type { TopicRow } from "@/lib/live/enriched";

/* Topics — live. Each row is counted from tracked prompts the classifier
   grouped into a subject area (lib/live/classify) and the answers actually
   sampled for those prompts. A topic showing 0% visibility means no sampled
   answer in that subject named the brand — a real gap, not a missing feature. */

const card: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "12px",
  padding: "18px 20px",
};

export default function TopicsLive({ topics, brand }: { topics: TopicRow[]; brand: string }) {
  const worst = topics.filter((t) => t.visibility === 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ fontSize: "14.5px", fontWeight: 600 }}>Visibility by topic</div>
          <span style={{ background: "var(--good, #4cb782)", color: "#06210f", fontWeight: 700, fontSize: "9.5px", padding: "2px 7px", borderRadius: "999px" }}>
            ● LIVE
          </span>
        </div>
        <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>
          Tracked prompts grouped by subject, scored on the answers actually sampled for them.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.7fr .6fr 1.1fr .8fr 1fr", padding: "12px 0 7px", fontSize: "10px", fontWeight: 500, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--fnt)", borderBottom: "1px solid var(--brd)" }}>
          <span>Topic</span><span>Prompts</span><span>Visibility</span><span>Answers</span><span>Best engine</span>
        </div>

        {topics.map((t) => (
          <div key={t.topic} style={{ display: "grid", gridTemplateColumns: "1.7fr .6fr 1.1fr .8fr 1fr", alignItems: "center", padding: "11px 0", fontSize: "13px", borderBottom: "1px solid var(--brd)" }}>
            <span style={{ fontWeight: 500 }}>{t.topic}</span>
            <span style={{ color: "var(--mut)", fontVariantNumeric: "tabular-nums" }}>{t.prompts}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "12.5px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: t.visibility === 0 ? "#e5636e" : "var(--tx)", minWidth: "44px" }}>
                {t.visibility}%
              </span>
              <span style={{ flex: 1, height: "5px", background: "var(--bg2)", borderRadius: "3px", overflow: "hidden", maxWidth: "110px" }}>
                <span style={{ display: "block", height: "5px", width: `${t.visibility}%`, background: t.visibility === 0 ? "#e5636e" : "var(--ac)", borderRadius: "3px" }} />
              </span>
            </span>
            <span style={{ color: "var(--mut)", fontSize: "12px", fontVariantNumeric: "tabular-nums" }}>
              {t.appearances}/{t.answers}
            </span>
            <span style={{ color: "var(--mut)", fontSize: "12px" }}>{t.bestPlatform ?? "—"}</span>
          </div>
        ))}
      </div>

      {worst.length > 0 && (
        <div style={{ ...card, borderColor: "color-mix(in oklab, #e5636e 35%, var(--brd))" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#e5636e" }}>
            {worst.length === 1 ? "A topic with no visibility" : `${worst.length} topics with no visibility`}
          </div>
          <div style={{ fontSize: "12.5px", color: "var(--mut)", lineHeight: 1.6, marginTop: "5px" }}>
            {`No sampled answer for ${worst.map((t) => `“${t.topic}”`).join(", ")} named ${brand}. `}
            These are the prompts where competitors own the answer outright.
          </div>
        </div>
      )}
    </div>
  );
}
