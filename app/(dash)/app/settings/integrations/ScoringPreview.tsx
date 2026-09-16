"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* Live proof that the scoring engine is real: calls /api/scoring/preview, which
   runs lib/scoring over THIS workspace's sampled answers, scored against this
   workspace's brand, domain and competitors and matched by the same entity
   matcher the dashboard uses. The numbers here and the numbers on the overview
   are produced by one code path, so they cannot disagree.

   It used to score against a hard-coded "Nike" (and fell back to a synthetic
   Nike example when the store was empty), which made this card print a
   real-looking score for a company the workspace has nothing to do with.

   There is no example to fall back on now. Nothing configured, or nothing
   sampled, says so — a zero here would read as a measurement. */

type Scores = {
  sampledAnswers: number;
  visibilityScore: number;
  shareOfVoice: number;
  citationsCount: number;
  uniqueCitedDomains: number;
  ownedCitationShare: number;
  answersWithCitationRate: number;
  avgAnswerPosition: number | null;
  answerRankFirst: number;
  nameCollisions: number;
};

interface Preview {
  ok: boolean;
  error?: string;
  configured?: boolean;
  hasData?: boolean;
  brand?: string | null;
  runsScored?: number;
  scores?: Scores | null;
}

type State =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "unconfigured" }
  | { kind: "empty"; brand: string }
  | { kind: "scored"; brand: string; runsScored: number; scores: Scores };

export default function ScoringPreview() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/scoring/preview", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Preview) => {
        if (cancelled) return;
        if (!d.ok) return setState({ kind: "error" });
        if (!d.configured) return setState({ kind: "unconfigured" });
        const brand = d.brand ?? "";
        if (!d.hasData || !d.scores) return setState({ kind: "empty", brand });
        setState({ kind: "scored", brand, runsScored: d.runsScored ?? 0, scores: d.scores });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const card: React.CSSProperties = { background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "16px 18px" };

  let line: string;
  if (state.kind === "loading") line = "Computing…";
  else if (state.kind === "error") line = "Preview unavailable.";
  else if (state.kind === "unconfigured")
    line = "No brand is configured yet, so there is nothing to score. Name the brand, its website and its competitors and this card fills in with your own numbers.";
  else if (state.kind === "empty")
    line = `No answers have been sampled for ${state.brand} yet, so there is nothing to score. Connect an answer engine and run your prompt set — this card computes from whatever comes back.`;
  else
    line = `Metrics computed by the scoring engine from ${state.runsScored} sampled run${state.runsScored === 1 ? "" : "s"} (${state.scores.sampledAnswers} answer${state.scores.sampledAnswers === 1 ? "" : "s"}) for ${state.brand}. Mentions are matched by the same entity matcher your dashboard uses, so these figures agree with it.`;

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ fontSize: "14px", fontWeight: 600 }}>Scoring engine</div>
        {state.kind === "scored" && (
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#3fd08a", border: "1px solid color-mix(in oklab,#3fd08a 34%,transparent)", background: "rgba(63,208,138,0.12)", borderRadius: "999px", padding: "3px 9px" }}>Live</span>
        )}
      </div>
      <div role="status" aria-live="polite" style={{ fontSize: "12.5px", color: "var(--mut)", marginTop: "6px", lineHeight: 1.6 }}>
        {line}
      </div>

      {state.kind === "unconfigured" && (
        <Link href="/onboarding/brand" style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--ac)", marginTop: "10px", display: "inline-block" }}>
          {"Set up your brand →"}
        </Link>
      )}

      {state.kind === "scored" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: "10px", marginTop: "14px" }}>
          <Metric label="Visibility score" value={`${state.scores.visibilityScore}%`} />
          <Metric label="Share of voice" value={`${state.scores.shareOfVoice}%`} />
          <Metric label="Citations" value={String(state.scores.citationsCount)} />
          <Metric label="Cited domains" value={String(state.scores.uniqueCitedDomains)} />
          <Metric label="Owned citations" value={`${state.scores.ownedCitationShare}%`} />
          <Metric label="Avg. position" value={state.scores.avgAnswerPosition === null ? "—" : String(state.scores.avgAnswerPosition)} />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--brd)", borderRadius: "8px", padding: "10px 12px" }}>
      <div style={{ fontSize: "18px", fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>{value}</div>
      <div style={{ fontSize: "10.5px", color: "var(--mut)", marginTop: "2px" }}>{label}</div>
    </div>
  );
}
