"use client";

import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import { readDraft, writeDraft, domainFromName, type DraftCompetitor } from "../draft";

/* Onboarding step 2 — competitor picker (AI-driven).
   On mount it reads the brand detected in step 1 and asks the LLM to suggest
   competitors (first few tracked, the rest offered as Suggested). Add/remove/
   search stay local; every change persists to the onboarding draft. */

type Brand = { name: string; domain: string; color: string };

const MAX = 10;
const swatches = ["#7fa7d9", "#b98ed9", "#d9b679", "#d985a8", "#7fd9c4", "#e0a878", "#8e7cf2", "#4cb782"];

function toBrand(name: string, domain: string, i: number): Brand {
  return { name, domain: domain || domainFromName(name), color: swatches[i % swatches.length] };
}
function brandFromInput(raw: string, used: number): Brand {
  const cleaned = raw.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();
  const label = cleaned.split(".")[0] || cleaned;
  return { name: label.charAt(0).toUpperCase() + label.slice(1), domain: cleaned.includes(".") ? cleaned : `${cleaned}.com`, color: swatches[used % swatches.length] };
}

export default function CompetitorPicker() {
  const [tracked, setTracked] = useState<Brand[]>([]);
  const [suggested, setSuggested] = useState<Brand[]>([]);
  const [query, setQuery] = useState("");
  const [added, setAdded] = useState(0);
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<string | undefined>();

  useEffect(() => {
    const d = readDraft();
    setBrand(d.brand);

    if (d.competitors?.length) {
      setTracked(d.competitors.map((c, i) => toBrand(c.name, c.domain, i)));
      setLoading(false);
      return;
    }
    if (!d.brand) {
      setLoading(false); // step 1 skipped — allow manual add
      return;
    }
    // Ask the LLM for competitors of the detected brand.
    fetch("/api/suggest/competitors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ brand: d.brand, domain: d.website, category: d.category }),
    })
      .then((r) => r.json())
      .then((res: { ok: boolean; competitors?: string[] }) => {
        const names = res.ok ? res.competitors ?? [] : [];
        const brands = names.map((n, i) => toBrand(n, "", i));
        const initialTracked = brands.slice(0, 4);
        setTracked(initialTracked);
        setSuggested(brands.slice(4));
        writeDraft({ competitors: initialTracked.map(({ name, domain }) => ({ name, domain })) });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function persist(next: Brand[]) {
    setTracked(next);
    writeDraft({ competitors: next.map(({ name, domain }): DraftCompetitor => ({ name, domain })) });
  }

  function add(b: Brand) {
    if (tracked.length >= MAX) {
      toast("Share of voice is measured against up to 10 brands — remove one to add another.");
      return;
    }
    if (tracked.some((x) => x.domain === b.domain)) {
      toast(`${b.name} is already on the list.`);
      return;
    }
    persist([...tracked, b]);
    setSuggested((list) => list.filter((x) => x.domain !== b.domain));
  }
  function remove(b: Brand) {
    persist(tracked.filter((x) => x.domain !== b.domain));
    setSuggested((list) => (list.some((x) => x.domain === b.domain) ? list : [...list, b]));
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    add(brandFromInput(query, added));
    setAdded((n) => n + 1);
    setQuery("");
  }

  return (
    <>
      <form onSubmit={submit} noValidate style={{ margin: 0 }}>
        <input
          aria-label="Search or paste a domain"
          name="competitor"
          type="text"
          placeholder="⌕ Search or paste a domain…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ display: "block", width: "100%", boxSizing: "border-box", border: "1px solid var(--brd)", borderRadius: "8px", background: "var(--bg0)", padding: "11px 13px", fontSize: "13px", color: "var(--tx)", fontFamily: "inherit", marginTop: "20px" }}
        />
      </form>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px", color: "var(--mut)", fontSize: "13px" }}>
          <span className="ob-spin" style={{ width: "15px", height: "15px", border: "2px solid var(--brd)", borderTopColor: "var(--ac)", borderRadius: "50%", display: "inline-block" }} />
          {brand ? `Finding competitors for ${brand}…` : "Loading…"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
          {tracked.map((b) => (
            <div key={b.domain} style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--bg0)", border: "1px solid var(--brd)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "2px", background: b.color }} />
              <span style={{ fontWeight: "500" }}>{b.name}</span>
              <span style={{ fontSize: "11px", fontWeight: "400", color: "var(--fnt)" }}>{b.domain}</span>
              <button type="button" onClick={() => remove(b)} aria-label={`Remove ${b.name}`} style={{ marginLeft: "auto", color: "var(--fnt)", background: "transparent", border: "none", padding: "0", fontSize: "13px", fontFamily: "inherit", lineHeight: "1", cursor: "pointer" }}>{"✕"}</button>
            </div>
          ))}
          {tracked.length === 0 && (
            <div style={{ fontSize: "12.5px", color: "var(--fnt)", lineHeight: "1.55", padding: "2px 0" }}>{brand ? "No competitors yet — add one above, or pick from Suggested." : "Detect a brand in step 1 for AI suggestions, or add competitors above."}</div>
          )}
        </div>
      )}

      {!loading && suggested.length > 0 && (
        <>
          <div style={{ fontSize: "10.5px", fontWeight: "500", color: "var(--fnt)", marginTop: "18px" }}>{"Suggested"}</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
            {suggested.map((b) => (
              <button key={b.domain} type="button" onClick={() => add(b)} style={{ fontSize: "12px", border: "1px dashed var(--brd)", borderRadius: "6px", padding: "6px 11px", color: "var(--mut)", background: "transparent", fontFamily: "inherit", cursor: "pointer" }}>{`+ ${b.name}`}</button>
            ))}
          </div>
        </>
      )}
      <style>{`@keyframes ob-spin{to{transform:rotate(360deg)}} .ob-spin{animation:ob-spin .8s linear infinite}`}</style>
    </>
  );
}
