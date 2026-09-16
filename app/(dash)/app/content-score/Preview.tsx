/* Illustrative layout for Content score.

   Rendered ONLY as a child of <LockedPreview>, which dims it to 28% opacity,
   desaturates it, marks it inert + aria-hidden and stamps the permanent
   "Preview · illustrative — not measured data" badge over it. Nothing in the
   pipeline fetches or grades a page, so no figure below is measured and none of
   it is interactive.

   Shape of the screen a scoring pass would fill: the 0–100 gauge, the four
   sub-scores behind it, and the "raise this score" checklist. The draft is an
   example.com URL — no real page of the workspace is shown carrying a grade. */

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

const SCORE = 70;
const R = 52;
const C = 2 * Math.PI * R;

const SUBSCORES: { label: string; value: number; note: string }[] = [
  { label: "Answerability", value: 75, note: "Opens with a direct answer to the question" },
  { label: "Structure", value: 80, note: "Headings, lists and a comparison table" },
  { label: "Evidence", value: 55, note: "Claims that carry a named, dated source" },
  { label: "Freshness", value: 60, note: "Last substantive update on the page" },
];

const CHECKLIST: { done: boolean; text: string; lift: string }[] = [
  { done: true, text: "Answer the question in the first two sentences", lift: "done" },
  { done: true, text: "Add a comparison table for the options named in the draft", lift: "done" },
  { done: false, text: "Cite a named source for each numeric claim", lift: "+10 est." },
  { done: false, text: "Add an FAQ block covering the three follow-up turns", lift: "+6 est." },
  { done: false, text: "Publish a visible last-updated date", lift: "+4 est." },
  { done: false, text: "Add Article and FAQPage structured data", lift: "+3 est." },
];

function Bar({ value }: { value: number }) {
  return (
    <span style={{ display: "block", width: "100%", height: "5px", background: "var(--bg2)", borderRadius: "3px" }}>
      <span style={{ display: "block", width: `${value}%`, height: "5px", background: "var(--ac)", borderRadius: "3px" }} />
    </span>
  );
}

export default function ContentScorePreview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ ...panel, padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "11px", color: "var(--fnt)", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600 }}>
          Draft
        </span>
        <span style={{ fontSize: "13px" }}>example.com/guides/choosing-a-plan</span>
        <span style={{ marginLeft: "auto", ...cardNote }}>Scored against 40 sampled answers</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: "16px", alignItems: "start" }}>
        <div style={panel}>
          <div style={cardHead}>
            <div style={cardTitle}>Likely to be cited</div>
            <div style={cardNote}>0–100</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "26px", padding: "6px 20px 20px" }}>
            <div style={{ position: "relative", width: "128px", height: "128px", flex: "none" }}>
              <svg width="128" height="128" viewBox="0 0 128 128" role="presentation">
                <circle cx="64" cy="64" r={R} fill="none" stroke="var(--bg2)" strokeWidth="10" />
                <circle
                  cx="64"
                  cy="64"
                  r={R}
                  fill="none"
                  stroke="var(--ac)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(C * SCORE) / 100} ${C}`}
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "30px", fontWeight: 600, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                  {SCORE}
                </span>
                <span style={{ fontSize: "10.5px", color: "var(--fnt)" }}>of 100</span>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "13px" }}>
              {SUBSCORES.map((s) => (
                <div key={s.label}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 500 }}>{s.label}</span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: "12px",
                        color: "var(--mut)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {s.value}
                    </span>
                  </div>
                  <div style={{ marginTop: "6px" }}>
                    <Bar value={s.value} />
                  </div>
                  <div style={{ fontSize: "10.5px", color: "var(--fnt)", marginTop: "5px", lineHeight: 1.45 }}>{s.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={panel}>
          <div style={cardHead}>
            <div style={cardTitle}>Raise this score</div>
            <div style={cardNote}>4 open</div>
          </div>
          <div>
            {CHECKLIST.map((c) => (
              <div
                key={c.text}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "11px 20px",
                  borderTop: "1px solid var(--brd)",
                }}
              >
                <span
                  style={{
                    flex: "none",
                    width: "14px",
                    height: "14px",
                    marginTop: "1px",
                    borderRadius: "4px",
                    border: `1px solid ${c.done ? "transparent" : "var(--brd)"}`,
                    background: c.done ? "var(--good)" : "transparent",
                  }}
                />
                <span
                  style={{
                    fontSize: "12.5px",
                    lineHeight: 1.5,
                    color: c.done ? "var(--fnt)" : "var(--tx)",
                    textDecoration: c.done ? "line-through" : "none",
                  }}
                >
                  {c.text}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    flex: "none",
                    fontSize: "10.5px",
                    fontWeight: 500,
                    color: c.done ? "var(--fnt)" : "var(--ac)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {c.lift}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
