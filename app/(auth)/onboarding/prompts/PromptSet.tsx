"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import { readDraft, writeDraft, type DraftTopic } from "../draft";

/* Onboarding step 3 — AI-generated prompt set, and the point where onboarding
   stops being a draft.

   "Start monitoring" writes the workspace: the brand, its website, the
   competitors chosen in step 2, and the identity resolved from the website in
   step 1. That identity is the whole reason the website is asked for — it is
   what lets scoring tell this company apart from anything else sharing its
   name — so it has to reach the server, not just the session. */

const HIDDEN_FROM = 3;

const rowStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", background: "var(--bg0)", border: "1px solid var(--brd)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", width: "100%", boxSizing: "border-box", fontFamily: "inherit", color: "var(--tx)", textAlign: "left", cursor: "pointer" };
const countStyle: React.CSSProperties = { fontSize: "11.5px", fontWeight: "400", fontVariantNumeric: "tabular-nums", color: "var(--fnt)" };

function fallbackTopics(brand: string): DraftTopic[] {
  return [
    { name: `${brand} overview`, prompts: 120 },
    { name: "Product comparisons", prompts: 96 },
    { name: "Recommendations", prompts: 72 },
    { name: "Pricing & value", prompts: 56 },
    { name: "Reviews & sentiment", prompts: 40 },
  ];
}

export default function PromptSet() {
  const router = useRouter();
  const [topics, setTopics] = useState<DraftTopic[]>([]);
  const [included, setIncluded] = useState<boolean[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = readDraft();
    setBrand(d.brand);
    const apply = (t: DraftTopic[]) => { setTopics(t); setIncluded(t.map(() => true)); };

    if (d.topics?.length) { apply(d.topics); setLoading(false); return; }
    if (!d.brand) { setLoading(false); return; }

    fetch("/api/suggest/topics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ brand: d.brand, category: d.category }),
    })
      .then((r) => r.json())
      .then((res: { ok: boolean; topics?: DraftTopic[] }) => {
        const t = res.ok && res.topics?.length ? res.topics : fallbackTopics(d.brand!);
        apply(t);
        writeDraft({ topics: t });
      })
      .catch(() => { const t = fallbackTopics(d.brand!); apply(t); writeDraft({ topics: t }); })
      .finally(() => setLoading(false));
  }, []);

  const chosen = topics.filter((_, i) => included[i]);
  const promptTotal = chosen.reduce((s, t) => s + t.prompts, 0);
  const hiddenTotal = topics.slice(HIDDEN_FROM).reduce((s, t, i) => (included[HIDDEN_FROM + i] ? s + t.prompts : s), 0);
  const shown = expanded ? topics.length : Math.min(HIDDEN_FROM, topics.length);
  const extra = Math.max(0, topics.length - HIDDEN_FROM);

  function toggle(i: number) { setIncluded((list) => list.map((v, j) => (j === i ? !v : v))); }

  /** Write the workspace, then move on. Nothing before this point persists. */
  async function startMonitoring() {
    if (saving) return;
    const d = readDraft();
    if (!d.brand) {
      toast("Go back to step 1 and detect your brand first.");
      return;
    }
    setSaving(true);
    try {
      const r = await fetch("/api/workspace", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          brand: d.brand,
          domain: d.website || d.identity?.domain,
          category: d.category,
          competitors: (d.competitors ?? []).map((c) => c.name),
          // Resolved in step 1 from the website. Sending it saves the server
          // re-deriving it, and keeps what the operator was shown and what gets
          // measured the same thing.
          identity: d.identity,
        }),
      });
      const res = (await r.json()) as { ok: boolean; error?: string };
      if (!res.ok) {
        toast(res.error || "Couldn't save your workspace — try again.");
        return;
      }
      router.push("/app/welcome");
    } catch (e) {
      toast((e as Error).message || "Couldn't save your workspace — try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "20px", color: "var(--mut)", fontSize: "13px" }}>
        <span className="ob-spin" style={{ width: "15px", height: "15px", border: "2px solid var(--brd)", borderTopColor: "var(--ac)", borderRadius: "50%", display: "inline-block" }} />
        {brand ? `Generating a starting prompt set for ${brand}…` : "Loading…"}
        <style>{`@keyframes ob-spin{to{transform:rotate(360deg)}} .ob-spin{animation:ob-spin .8s linear infinite}`}</style>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div style={{ marginTop: "20px" }}>
        <div style={{ fontSize: "12.5px", color: "var(--fnt)", lineHeight: 1.55 }}>{"Detect a brand in step 1 to generate a prompt set."}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
          <Link href="/onboarding/competitors" style={{ fontSize: "13px", color: "var(--fnt)" }}>{"← Back"}</Link>
          <Link href="/onboarding/brand" className="btn-ac" style={{ display: "inline-block", fontSize: "13px", fontWeight: "600", borderRadius: "8px", padding: "10px 22px" }}>{"← Detect a brand"}</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg0)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "14px 16px", marginTop: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ fontSize: "22px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{String(promptTotal)}</span>
          <span style={{ fontSize: "11px", fontWeight: "400", fontVariantNumeric: "tabular-nums", color: "var(--fnt)" }}>{`prompts across ${chosen.length} ${chosen.length === 1 ? "topic" : "topics"}`}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "right" }}>
          <span style={{ fontSize: "22px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{"5"}</span>
          <span style={{ fontSize: "11px", fontWeight: "400", fontVariantNumeric: "tabular-nums", color: "var(--fnt)" }}>{"platforms monitored"}</span>
        </div>
      </div>
      <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "10px", lineHeight: "1.55" }}>{"All 5 platforms on by default — ChatGPT, Perplexity, Google AI Overviews, Claude, Gemini. Change anytime in Settings."}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
        {topics.slice(0, shown).map((t, i) => (
          <button key={t.name} type="button" aria-pressed={included[i]} onClick={() => toggle(i)} style={included[i] ? rowStyle : { ...rowStyle, opacity: "0.5" }}>
            <span style={included[i] ? undefined : { textDecoration: "line-through" }}>{t.name}</span>
            <span style={countStyle}>{`${t.prompts} prompts`}</span>
          </button>
        ))}
        {extra > 0 && (
          <button type="button" aria-expanded={expanded} onClick={() => setExpanded((v) => !v)} style={{ ...rowStyle, color: "var(--mut)" }}>
            <span>{expanded ? `− Hide ${extra} ${extra === 1 ? "topic" : "topics"}` : `+ ${extra} more ${extra === 1 ? "topic" : "topics"}`}</span>
            <span style={countStyle}>{`${hiddenTotal} prompts`}</span>
          </button>
        )}
        {chosen.length === 0 && (
          <div role="alert" style={{ fontSize: "11.5px", color: "var(--bad)", lineHeight: "1.55", marginTop: "2px" }}>{"Keep at least one topic — monitoring needs prompts to run."}</div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
        <Link href="/onboarding/competitors" style={{ fontSize: "13px", color: "var(--fnt)" }}>{"← Back"}</Link>
        <button
          type="button"
          className="btn-ac"
          disabled={saving}
          onClick={() =>
            chosen.length === 0
              ? toast("Keep at least one topic — monitoring needs prompts to run.")
              : void startMonitoring()
          }
          style={{ display: "inline-block", fontSize: "13px", fontWeight: "600", borderRadius: "8px", padding: "10px 22px", border: "none", cursor: saving ? "default" : "pointer", fontFamily: "inherit", opacity: saving ? 0.6 : 1 }}
        >
          {saving ? "Setting up…" : "Start monitoring"}
        </button>
      </div>
      <style>{`@keyframes ob-spin{to{transform:rotate(360deg)}} .ob-spin{animation:ob-spin .8s linear infinite}`}</style>
    </>
  );
}
