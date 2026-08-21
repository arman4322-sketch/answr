"use client";

import { useEffect, useState } from "react";

/* Live proof that the scoring engine is real: calls /api/scoring/preview, which
   runs lib/scoring over real sampler runs (or a synthetic example when none
   exist yet) and returns metrics computed by the same formulas the dictionary
   specifies. This is the "it's not just fixtures" demonstration for a buyer. */

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
};

export default function ScoringPreview() {
  const [data, setData] = useState<{ source: string; runsScored: number; scores: Scores } | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    fetch("/api/scoring/preview")
      .then((r) => r.json())
      .then((d: { ok: boolean; source?: string; runsScored?: number; scores?: Scores }) => {
        if (d.ok && d.scores) setData({ source: d.source ?? "", runsScored: d.runsScored ?? 0, scores: d.scores });
        else setErr(true);
      })
      .catch(() => setErr(true));
  }, []);

  const card: React.CSSProperties = { background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "16px 18px" };

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ fontSize: "14px", fontWeight: 600 }}>Scoring engine</div>
        <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#3fd08a", border: "1px solid color-mix(in oklab,#3fd08a 34%,transparent)", background: "rgba(63,208,138,0.12)", borderRadius: "999px", padding: "3px 9px" }}>Live</span>
      </div>
      <div style={{ fontSize: "12.5px", color: "var(--mut)", marginTop: "6px", lineHeight: 1.6 }}>
        {err
          ? "Preview unavailable."
          : !data
            ? "Computing…"
            : `Metrics computed by the scoring engine from ${data.runsScored} ${data.source === "synthetic-example" ? "synthetic sample" : "sampled"} run${data.runsScored === 1 ? "" : "s"} (${data.scores.sampledAnswers} answers). This is the real formula that replaces the fixtures once providers are connected.`}
      </div>

      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: "10px", marginTop: "14px" }}>
          <Metric label="Visibility score" value={`${data.scores.visibilityScore}%`} />
          <Metric label="Share of voice" value={`${data.scores.shareOfVoice}%`} />
          <Metric label="Citations" value={String(data.scores.citationsCount)} />
          <Metric label="Cited domains" value={String(data.scores.uniqueCitedDomains)} />
          <Metric label="Owned citations" value={`${data.scores.ownedCitationShare}%`} />
          <Metric label="Avg. position" value={data.scores.avgAnswerPosition === null ? "—" : String(data.scores.avgAnswerPosition)} />
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
