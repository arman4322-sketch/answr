import type { SegmentMetrics } from "@/lib/live/segments";
import SegmentPassButton from "../SegmentPassButton";

/* Regions — live. Every figure is counted by lib/live/segments over the runs the
   segment sampler actually stored; nothing is modelled.

   The claim this screen has to get right is what a "regional" number means. A
   region is only genuinely measured when the lane searched FROM it: Perplexity,
   OpenAI, Anthropic and the Google AI Overviews lane take a location parameter,
   so those searches were located. Gemini has none, so for it the region is only
   stated in the wording of the question — a weaker thing, counted separately and
   never blended in. `applied` carries the overall split and `nativeShare` the
   per-region one, and both are on the screen.

   The other honesty rule: a region that was never sampled is absent from the
   table and named in a muted list instead, because 0% is a measurement and "not
   sampled" is not. */

const card: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "12px",
  padding: "18px 20px",
};

const head: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 500,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--fnt)",
};

const pct = (n: number) => `${Math.round(n * 10) / 10}%`;
const stampOf = (ts: number | null) =>
  ts ? new Date(ts).toISOString().slice(0, 16).replace("T", " ") : null;

function Delta({ value }: { value: number }) {
  const v = Math.round(value * 10) / 10;
  if (v === 0) return <span style={{ color: "var(--mut)" }}>level</span>;
  return (
    <span style={{ color: v > 0 ? "var(--good)" : "var(--bad)", fontVariantNumeric: "tabular-nums" }}>
      {v > 0 ? "+" : "−"}
      {Math.abs(v)}pt
    </span>
  );
}

export default function RegionsLive({ m, brand }: { m: SegmentMetrics; brand: string }) {
  const measured = m.rows.filter((r) => r.hasData);
  const applied = m.applied.native + m.applied.prompt;
  const stamp = stampOf(m.lastRunAt);
  const overall = m.overall;
  const collisions = measured.filter((r) => r.nameCollisions > 0);

  /* "Searched from region" sits second, next to the region name: it qualifies
     every figure in the row, so it must not be the column that scrolls off. */
  const cols = "144px 132px 176px 100px 96px 156px";

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
          {measured.length} of {m.rows.length} tracked region{m.rows.length === 1 ? "" : "s"} sampled
        </span>
        <span>· {applied} answers</span>
        {stamp && <span>· last pass {stamp} UTC</span>}
      </div>

      {/* ── the claim this screen must not overstate ── */}
      <div style={{ ...card, borderColor: "rgba(142,124,242,0.28)" }}>
        <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>How these regional answers were collected</h2>
        <p style={{ margin: "7px 0 0", fontSize: "12.5px", lineHeight: 1.6, color: "var(--tx)" }}>
          {applied === 0
            ? "No answers have been collected for a region yet."
            : m.applied.prompt === 0
              ? `All ${applied} answers were searched from the region itself.`
              : `${m.applied.native} of ${applied} answers were searched from the region itself; the remaining ${m.applied.prompt} had the location stated in the question.`}
        </p>
        <p style={{ margin: "8px 0 0", fontSize: "11.5px", lineHeight: 1.6, color: "var(--fnt)" }}>
          Perplexity, OpenAI, Anthropic and the Google AI Overviews lane accept a location parameter, so those searches
          ran from the region. Google Gemini has no such parameter, so for that lane the region is only stated in the
          wording of the question. A stated location is a weaker measurement and is never counted as a located one — the
          per-region column below shows how much of each row was genuinely searched from there.
        </p>
      </div>

      {/* ── baseline for the same prompts ── */}
      {overall && (
        <div style={{ ...card, display: "flex", flexWrap: "wrap", gap: "10px 26px", alignItems: "baseline" }}>
          <span style={{ fontSize: "12.5px", fontWeight: 600 }}>Unlocated baseline, same prompts</span>
          <span style={{ fontSize: "12.5px", color: "var(--mut)", fontVariantNumeric: "tabular-nums" }}>
            {pct(overall.visibility)} visibility · {pct(overall.shareOfVoice)} share of voice · {overall.answers} answers
          </span>
          <span style={{ fontSize: "11.5px", color: "var(--fnt)", flexBasis: "100%" }}>
            The same questions asked with no location at all. Each region below is read against this, so a difference is
            about the region rather than about which questions it happened to be asked.
          </span>
        </div>
      )}

      {/* ── measured regions ── */}
      <div style={card}>
        <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>{brand} by region</h2>
        <p style={{ margin: "3px 0 0", fontSize: "11.5px", lineHeight: 1.6, color: "var(--fnt)" }}>
          Only regions with sampled answers appear here. A 0% is a real measurement — it means {brand} was not named in
          any of that region&rsquo;s answers.
        </p>

        <div style={{ overflowX: "auto", marginTop: "12px" }}>
          <div style={{ minWidth: "864px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: cols,
                gap: "12px",
                padding: "10px 0 7px",
                borderBottom: "1px solid var(--brd)",
                ...head,
              }}
            >
              <span>Region</span>
              <span>Searched from region</span>
              <span>Visibility</span>
              <span>Share of voice</span>
              <span>Avg position</span>
              <span>Leading brand</span>
            </div>

            {measured.map((r) => (
              <div
                key={r.id}
                className="row-hover"
                style={{
                  display: "grid",
                  gridTemplateColumns: cols,
                  gap: "12px",
                  alignItems: "center",
                  padding: "11px 0",
                  fontSize: "12.5px",
                  borderBottom: "1px solid var(--brd)",
                }}
              >
                <span>
                  {r.label}
                  <span style={{ display: "block", fontSize: "10.5px", color: "var(--fnt)" }}>
                    {r.prompts} prompt{r.prompts === 1 ? "" : "s"} · {r.answers} answer{r.answers === 1 ? "" : "s"}
                  </span>
                </span>

                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {pct(r.nativeShare)}
                  <span style={{ display: "block", fontSize: "10.5px", color: "var(--fnt)" }}>
                    {r.nativeShare >= 100
                      ? "all located"
                      : r.nativeShare <= 0
                        ? "none located — all stated in the prompt"
                        : "rest stated in the prompt"}
                  </span>
                </span>

                <span>
                  <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                    <span style={{ fontVariantNumeric: "tabular-nums", minWidth: "42px" }}>{pct(r.visibility)}</span>
                    <span style={{ flex: 1, height: "6px", background: "var(--bg2)", borderRadius: "3px", overflow: "hidden" }}>
                      <span style={{ display: "block", height: "6px", width: `${Math.max(0, Math.min(100, r.visibility))}%`, background: "var(--ac)", borderRadius: "3px" }} />
                    </span>
                  </span>
                  {overall && (
                    <span style={{ display: "block", fontSize: "10.5px", marginTop: "3px" }}>
                      <Delta value={r.visibility - overall.visibility} /> <span style={{ color: "var(--fnt)" }}>vs baseline</span>
                    </span>
                  )}
                </span>

                <span style={{ fontVariantNumeric: "tabular-nums" }}>{pct(r.shareOfVoice)}</span>
                <span style={{ fontVariantNumeric: "tabular-nums", color: r.avgAnswerPosition === null ? "var(--fnt)" : "var(--tx)" }}>
                  {r.avgAnswerPosition === null ? "—" : r.avgAnswerPosition.toFixed(1)}
                </span>

                <span>
                  {r.leader ? (
                    <>
                      {r.leader.name}
                      {r.leader.isBrand && (
                        <span style={{ marginLeft: "6px", fontSize: "10px", color: "var(--ac)", border: "1px solid var(--brd)", borderRadius: "999px", padding: "1px 6px" }}>
                          your brand
                        </span>
                      )}
                      <span style={{ display: "block", fontSize: "10.5px", color: "var(--fnt)" }}>
                        {r.leader.mentions} of {r.answers} answers
                      </span>
                    </>
                  ) : (
                    <span style={{ color: "var(--fnt)" }}>no tracked brand named</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {collisions.length > 0 && (
          <p style={{ margin: "12px 0 0", fontSize: "11.5px", lineHeight: 1.6, color: "var(--fnt)" }}>
            Name collisions excluded from visibility:{" "}
            {collisions.map((r, i) => (
              <span key={r.id}>
                {i > 0 ? ", " : ""}
                {r.label} {r.nameCollisions}
              </span>
            ))}
            . In those answers the name &ldquo;{brand}&rdquo; appeared but referred to a different company, so they are
            not counted as a mention.
          </p>
        )}
      </div>

      {/* ── configured but never sampled ── */}
      {m.pending.length > 0 && (
        <div style={{ ...card, background: "transparent" }}>
          <h2 style={{ margin: 0, fontSize: "12.5px", fontWeight: 600, color: "var(--mut)" }}>Not sampled yet</h2>
          <p style={{ margin: "6px 0 0", fontSize: "11.5px", lineHeight: 1.6, color: "var(--fnt)" }}>
            {m.pending.join(", ")} — tracked, but no answer has been collected from {m.pending.length === 1 ? "it" : "them"} yet.
            These have no measurement at all, which is not the same as a 0%, so they are kept out of the table above.
          </p>
        </div>
      )}

      <div style={card}>
        <SegmentPassButton
          kind="region"
          action="sample"
          label="Run a regional pass"
          busyLabel="Running the pass…"
          hint="Several minutes — 3 prompts × every tracked region × every connected lane."
          promptLimit={3}
          primary
        />
      </div>
    </div>
  );
}
