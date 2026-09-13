"use client";

import { useState } from "react";

/* Live AI-visibility scan — queries real LLMs on demand and shows the scoring
   engine's genuine output. This is the "real numbers from LLMs" demo surface. */

type Scores = {
  sampledAnswers: number;
  visibilityScore: number;
  shareOfVoice: number;
  platformAppearances: Record<string, number>;
  citationsCount: number;
  avgAnswerPosition: number | null;
  answerRankFirst: number;
};
type PerPrompt = { prompt: string; error: string | null; mentioned: boolean; competitorsMentioned: string[]; excerpt: string };
type Result = {
  ok: boolean; error?: string;
  brand: string; model: string; providersUsed: string[]; ranAt: number;
  promptsRun: number; promptsAnswered: number; grounded: boolean;
  scores: Scores; brandMentions: number; competitorMentions: Record<string, number>; perPrompt: PerPrompt[];
};

const card: React.CSSProperties = { background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "12px", padding: "16px 18px" };
const label: React.CSSProperties = { display: "block", fontSize: "10.5px", fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--fnt)", marginBottom: "5px" };
const input: React.CSSProperties = { width: "100%", background: "var(--bg2)", border: "1px solid var(--brd)", borderRadius: "8px", padding: "9px 11px", color: "var(--tx)", fontSize: "13px", fontFamily: "inherit" };

export default function ScanRunner() {
  const [brand, setBrand] = useState("Nike");
  const [domain, setDomain] = useState("nike.com");
  const [category, setCategory] = useState("running shoe brands");
  const [competitors, setCompetitors] = useState("Adidas, Brooks, Asics, New Balance, Hoka");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [res, setRes] = useState<Result | null>(null);

  async function run() {
    setBusy(true); setErr(null); setRes(null);
    try {
      const r = await fetch("/api/scan/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          brand: brand.trim(),
          domain: domain.trim() || undefined,
          category: category.trim() || undefined,
          competitors: competitors.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      const d = (await r.json()) as Result;
      if (!d.ok) { setErr(d.error || "Scan failed."); return; }
      setRes(d);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const sov = res ? sovBars(res) : [];

  return (
    <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: "16px", maxWidth: "1040px" }}>
      {/* intro */}
      <div>
        <div style={{ fontSize: "18px", fontWeight: 700 }}>Live AI Visibility Scan</div>
        <div style={{ fontSize: "13px", color: "var(--mut)", marginTop: "4px", lineHeight: 1.6, maxWidth: "70ch" }}>
          Queries real LLMs right now and scores the answers with Answr's live scoring engine — genuine
          visibility, share of voice, and ranking computed from actual model output. Enter any brand and run it.
        </div>
      </div>

      {/* form */}
      <div style={{ ...card, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
        <div><span style={label}>Brand</span><input style={input} value={brand} onChange={(e) => setBrand(e.target.value)} /></div>
        <div><span style={label}>Website (optional)</span><input style={input} value={domain} onChange={(e) => setDomain(e.target.value)} /></div>
        <div><span style={label}>Category</span><input style={input} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. project management tools" /></div>
        <div><span style={label}>Competitors (comma-separated)</span><input style={input} value={competitors} onChange={(e) => setCompetitors(e.target.value)} /></div>
        <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "12px" }}>
          <button type="button" className="btn-ac" onClick={run} disabled={busy || !brand.trim()}
            style={{ fontSize: "13px", fontWeight: 600, borderRadius: "8px", padding: "10px 20px", border: "none", cursor: busy ? "default" : "pointer", fontFamily: "inherit", opacity: busy || !brand.trim() ? 0.6 : 1 }}>
            {busy ? "Querying live models…" : "Run live scan"}
          </button>
          <span style={{ fontSize: "11.5px", color: "var(--fnt)" }}>Live Google Gemini calls · ~15–25s</span>
        </div>
      </div>

      {err && <div style={{ ...card, borderColor: "var(--bad)", color: "var(--bad)", fontSize: "13px" }}>{err}</div>}

      {busy && (
        <div style={{ ...card, display: "flex", alignItems: "center", gap: "12px", color: "var(--mut)", fontSize: "13px" }}>
          <span className="spin" style={{ width: "16px", height: "16px", border: "2px solid var(--brd)", borderTopColor: "var(--ac)", borderRadius: "50%", display: "inline-block" }} />
          Querying the model live across the prompt set and scoring the answers…
        </div>
      )}

      {res && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", fontSize: "11.5px", color: "var(--mut)" }}>
            <span style={{ background: "var(--good)", color: "#06210f", fontWeight: 700, fontSize: "10px", padding: "2px 8px", borderRadius: "999px" }}>● LIVE DATA</span>
            <span>Model: <b style={{ color: "var(--tx)" }}>{res.model}</b></span>
            <span>· {res.promptsAnswered}/{res.promptsRun} prompts answered</span>
            <span>· {new Date(res.ranAt).toLocaleTimeString()}</span>
          </div>

          {/* KPI cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
            <Kpi n={`${res.scores.visibilityScore}%`} l="Visibility score" />
            <Kpi n={`${res.scores.shareOfVoice}%`} l="Share of voice" />
            <Kpi n={`${res.scores.answerRankFirst}/${res.promptsAnswered}`} l="Ranked #1" />
            <Kpi n={res.scores.avgAnswerPosition == null ? "—" : String(res.scores.avgAnswerPosition)} l="Avg. position" />
          </div>

          {/* Share of voice bars */}
          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, marginBottom: "12px" }}>Share of voice — {res.brand} vs. competitors</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {sov.map((row) => (
                <div key={row.name} style={{ display: "grid", gridTemplateColumns: "130px 1fr 46px", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: row.isBrand ? 700 : 400, color: row.isBrand ? "var(--tx)" : "var(--mut)" }}>{row.name}{row.isBrand ? " (you)" : ""}</span>
                  <span style={{ height: "10px", background: "var(--bg2)", borderRadius: "5px", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "10px", width: `${row.pct}%`, background: row.isBrand ? "var(--ac)" : "#7fa7d9", borderRadius: "5px" }} />
                  </span>
                  <span style={{ fontSize: "12px", fontVariantNumeric: "tabular-nums", color: "var(--mut)", textAlign: "right" }}>{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Per-prompt breakdown */}
          <div style={card}>
            <div style={{ fontSize: "13.5px", fontWeight: 600, marginBottom: "10px" }}>What the model actually said</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {res.perPrompt.map((p, i) => (
                <div key={i} style={{ borderTop: i ? "1px solid var(--brd)" : "none", paddingTop: i ? "10px" : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                    <span style={{ color: p.mentioned ? "var(--good)" : "var(--bad)", fontWeight: 700 }}>{p.mentioned ? "✓" : "✗"}</span>
                    <span style={{ fontWeight: 500 }}>{p.prompt}</span>
                  </div>
                  {p.error
                    ? <div style={{ fontSize: "11.5px", color: "var(--bad)", marginTop: "3px", marginLeft: "18px" }}>Error: {p.error}</div>
                    : <div style={{ fontSize: "12px", color: "var(--mut)", marginTop: "4px", marginLeft: "18px", lineHeight: 1.55 }}>
                        {p.excerpt}…
                        {p.competitorsMentioned.length > 0 && <span style={{ color: "var(--fnt)" }}>{"  ·  also named: " + p.competitorsMentioned.join(", ")}</span>}
                      </div>}
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: "11px", color: "var(--fnt)", lineHeight: 1.6 }}>
            Real answers from live {res.providersUsed.join(", ")} calls, scored by the same engine that powers the
            dashboards. Citations require a paid (grounded) key; ChatGPT, Claude, and Perplexity lanes activate by
            adding their API keys in Settings → Integrations.
          </div>
        </>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .spin{animation:spin .8s linear infinite}`}</style>
    </div>
  );
}

function Kpi({ n, l }: { n: string; l: string }) {
  return (
    <div style={{ ...card, padding: "14px 16px" }}>
      <div style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ac)", fontVariantNumeric: "tabular-nums" }}>{n}</div>
      <div style={{ fontSize: "11px", color: "var(--mut)", marginTop: "2px" }}>{l}</div>
    </div>
  );
}

function sovBars(res: Result): { name: string; pct: number; isBrand: boolean }[] {
  const counts: [string, number, boolean][] = [[res.brand, res.brandMentions, true]];
  for (const [name, c] of Object.entries(res.competitorMentions)) counts.push([name, c, false]);
  const total = counts.reduce((s, [, c]) => s + c, 0) || 1;
  return counts
    .map(([name, c, isBrand]) => ({ name, pct: Math.round((c / total) * 1000) / 10, isBrand }))
    .sort((a, b) => b.pct - a.pct);
}
