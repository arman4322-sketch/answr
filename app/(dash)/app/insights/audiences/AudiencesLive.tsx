import type { SegmentMetrics } from "@/lib/live/segments";
import SegmentPassButton from "../SegmentPassButton";

/* Audiences — live. Counted by lib/live/segments over the runs the segment
   sampler stored, on the same scorer and the same entity matcher as the
   headline numbers.

   What this screen must not overstate: no answer engine exposes a "who is
   asking" parameter, so an audience is never a located or authenticated
   measurement. It is prompt framing — the same tracked questions, asked the way
   that buyer would ask them, with the persona sentence prepended verbatim. That
   sentence is printed on every card so the reader can see exactly what was
   asked. `nativeShare` is 0 here by definition and is therefore not shown: it
   would read as a failure rather than as a property of the method.

   An audience with no sampled runs is listed separately, never as a 0%. */

const card: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "12px",
  padding: "18px 20px",
};

const pct = (n: number) => `${Math.round(n * 10) / 10}%`;
const stampOf = (ts: number | null) =>
  ts ? new Date(ts).toISOString().slice(0, 16).replace("T", " ") : null;

function Figure({ label, value, sub }: { label: string; value: string; sub?: React.ReactNode }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: "10.5px", color: "var(--fnt)" }}>{label}</div>
      <div style={{ fontSize: "19px", fontWeight: 700, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", marginTop: "2px" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "10.5px", color: "var(--mut)", marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

function delta(value: number) {
  const v = Math.round(value * 10) / 10;
  if (v === 0) return <span style={{ color: "var(--mut)" }}>level with baseline</span>;
  return (
    <span style={{ color: v > 0 ? "var(--good)" : "var(--bad)" }}>
      {v > 0 ? "+" : "−"}
      {Math.abs(v)}pt vs baseline
    </span>
  );
}

export default function AudiencesLive({ m, brand }: { m: SegmentMetrics; brand: string }) {
  const measured = m.rows.filter((r) => r.hasData);
  const waiting = m.rows.filter((r) => !r.hasData);
  const stamp = stampOf(m.lastRunAt);
  const overall = m.overall;
  const answers = m.applied.native + m.applied.prompt;

  return (
    <div
      style={{
        padding: "22px clamp(14px, 4vw, 26px)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: "1100px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", fontSize: "11.5px", color: "var(--mut)" }}>
        <span style={{ background: "var(--good, #4cb782)", color: "#06210f", fontWeight: 700, fontSize: "10px", padding: "2px 8px", borderRadius: "999px" }}>
          ● LIVE DATA
        </span>
        <span>
          {measured.length} of {m.rows.length} audience{m.rows.length === 1 ? "" : "s"} sampled
        </span>
        <span>· {answers} answers</span>
        {stamp && <span>· last pass {stamp} UTC</span>}
      </div>

      {/* ── the claim this screen must not overstate ── */}
      <div style={{ ...card, borderColor: "rgba(142,124,242,0.28)" }}>
        <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>Every figure here is prompt framing</h2>
        <p style={{ margin: "7px 0 0", fontSize: "12.5px", lineHeight: 1.6, color: "var(--tx)" }}>
          No answer engine accepts a searcher persona, so nothing on this screen was measured for a real person in that
          segment. Each audience is the same tracked prompts asked the way that buyer would ask them: the persona
          sentence is prepended to the question, word for word, and is printed on every card below so you can see
          exactly what was asked.
        </p>
      </div>

      {overall && (
        <div style={{ ...card, display: "flex", flexWrap: "wrap", gap: "10px 26px", alignItems: "baseline" }}>
          <span style={{ fontSize: "12.5px", fontWeight: 600 }}>Unframed baseline, same prompts</span>
          <span style={{ fontSize: "12.5px", color: "var(--mut)", fontVariantNumeric: "tabular-nums" }}>
            {pct(overall.visibility)} visibility · {pct(overall.shareOfVoice)} share of voice · {overall.answers} answers
          </span>
          <span style={{ fontSize: "11.5px", color: "var(--fnt)", flexBasis: "100%" }}>
            The same questions asked plainly, with no persona in front of them. Each card is read against this, so a
            difference is about the framing rather than about which questions were asked.
          </span>
        </div>
      )}

      {/* min() keeps a card from forcing horizontal overflow in a container
          narrower than the card's own minimum */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(290px, 100%), 1fr))", gap: "12px" }}>
        {measured.map((r) => (
          <div key={r.id} style={{ ...card, display: "flex", flexDirection: "column", gap: "12px", minWidth: 0 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>{r.label}</h3>
              {r.note && <div style={{ fontSize: "11.5px", color: "var(--mut)", marginTop: "3px" }}>{r.note}</div>}
            </div>

            {r.persona && (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--brd)", borderRadius: "9px", padding: "10px 12px" }}>
                <div style={{ fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--fnt)" }}>
                  Prepended to every prompt
                </div>
                <p style={{ margin: "5px 0 0", fontSize: "12px", lineHeight: 1.6, color: "var(--tx)" }}>
                  &ldquo;{r.persona}&rdquo;
                </p>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "10px" }}>
              <Figure
                label="Visibility"
                value={pct(r.visibility)}
                sub={overall ? delta(r.visibility - overall.visibility) : undefined}
              />
              <Figure label="Share of voice" value={pct(r.shareOfVoice)} />
              <Figure
                label="Answers"
                value={String(r.answers)}
                sub={`${r.prompts} prompt${r.prompts === 1 ? "" : "s"}`}
              />
            </div>

            <div style={{ height: "6px", background: "var(--bg2)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "6px", width: `${Math.max(0, Math.min(100, r.visibility))}%`, background: "var(--ac)", borderRadius: "3px" }} />
            </div>

            <div style={{ fontSize: "11.5px", color: "var(--mut)", lineHeight: 1.6 }}>
              {r.leader ? (
                <>
                  Leading brand: <strong style={{ color: "var(--tx)", fontWeight: 600 }}>{r.leader.name}</strong>
                  {r.leader.isBrand && (
                    <span style={{ marginLeft: "6px", fontSize: "10px", color: "var(--ac)", border: "1px solid var(--brd)", borderRadius: "999px", padding: "1px 6px" }}>
                      your brand
                    </span>
                  )}{" "}
                  — named in {r.leader.mentions} of {r.answers} answers.
                </>
              ) : (
                <>No tracked brand was named in this audience&rsquo;s answers.</>
              )}
              {r.avgAnswerPosition !== null && <> Average answer position {r.avgAnswerPosition.toFixed(1)}.</>}
              {r.nameCollisions > 0 && (
                <>
                  {" "}
                  {r.nameCollisions} answer{r.nameCollisions === 1 ? "" : "s"} used the name &ldquo;{brand}&rdquo; for a
                  different company and {r.nameCollisions === 1 ? "was" : "were"} excluded.
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {waiting.length > 0 && (
        <div style={{ ...card, background: "transparent" }}>
          <h2 style={{ margin: 0, fontSize: "12.5px", fontWeight: 600, color: "var(--mut)" }}>Not sampled yet</h2>
          <p style={{ margin: "6px 0 8px", fontSize: "11.5px", lineHeight: 1.6, color: "var(--fnt)" }}>
            Defined, but no answer has been collected for {waiting.length === 1 ? "it" : "them"} yet. There is no
            measurement here at all, which is not the same as a 0%.
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
            {waiting.map((r) => (
              <li key={r.id} style={{ fontSize: "11.5px", color: "var(--mut)", lineHeight: 1.6 }}>
                <strong style={{ fontWeight: 600 }}>{r.label}</strong>
                {r.persona && <span style={{ color: "var(--fnt)" }}> — &ldquo;{r.persona}&rdquo;</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={card}>
        <SegmentPassButton
          kind="audience"
          action="sample"
          label="Run an audience pass"
          busyLabel="Running the pass…"
          hint="Several minutes — 3 prompts × every audience × every connected lane."
          promptLimit={3}
          primary
        />
      </div>
    </div>
  );
}
