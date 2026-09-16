"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { writeDraft } from "../draft";
import type { BrandIdentity } from "@/lib/brand/identity";

/* Onboarding step 1 — website field + AI brand detection.
   Enter (or "Detect brand") calls /api/suggest/brand to identify the real brand,
   category and aliases from the URL, then shows the detected card. "Continue →"
   saves the draft and advances. Detecting a new URL clears the downstream draft
   so steps 2–3 regenerate for the new brand. */

type Conflict = { name: string; what: string; domain?: string };
type Detected = {
  name: string;
  category: string;
  aliases: string[];
  fallback?: boolean;
  description?: string;
  ambiguous?: boolean;
  conflicts?: Conflict[];
};

export default function BrandField() {
  const router = useRouter();
  const [website, setWebsite] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState<Detected | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function detect() {
    const url = website.trim();
    if (!url) {
      setInvalid(true);
      return;
    }
    setDetecting(true);
    setError(null);
    try {
      const r = await fetch("/api/suggest/brand", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const d = (await r.json()) as {
        ok: boolean;
        name?: string;
        category?: string;
        aliases?: string[];
        fallback?: boolean;
        identity?: BrandIdentity;
        error?: string;
      };
      if (!d.ok || !d.name) {
        setError(d.error || "Couldn't detect the brand — try again.");
        return;
      }
      const next: Detected = {
        name: d.name,
        category: d.category || "",
        aliases: d.aliases || [],
        fallback: d.fallback,
        description: d.identity?.description,
        ambiguous: d.identity?.ambiguous,
        conflicts: d.identity?.conflicts,
      };
      setDetected(next);
      // Save brand + identity, and reset downstream so steps 2–3 regenerate for
      // this brand. The identity is what later tells this company apart from
      // anything else of the same name, so it travels with the draft.
      writeDraft({
        website: url,
        brand: next.name,
        category: next.category,
        aliases: next.aliases,
        identity: d.identity,
        competitors: undefined,
        topics: undefined,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDetecting(false);
    }
  }

  function onPrimary(e: React.FormEvent) {
    e.preventDefault();
    if (detecting) return;
    if (detected) {
      router.push("/onboarding/competitors");
      return;
    }
    void detect();
  }

  return (
    <form onSubmit={onPrimary} noValidate style={{ margin: 0 }}>
      <div style={{ border: `1px solid ${invalid ? "var(--bad)" : "var(--ac)"}`, borderRadius: "8px", background: "var(--bg0)", padding: "11px 13px", fontSize: "14px", marginTop: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "var(--fnt)" }}>{"https://"}</span>
        <input
          aria-label="Website"
          name="website"
          type="text"
          value={website}
          placeholder="www.yourbrand.com"
          onChange={(e) => { setWebsite(e.target.value); setInvalid(false); if (detected) setDetected(null); }}
          style={{ flex: "1", minWidth: "0", border: "none", background: "transparent", padding: "0", fontSize: "14px", color: "var(--tx)", fontFamily: "inherit" }}
        />
      </div>
      {invalid && <div role="alert" style={{ fontSize: "11.5px", color: "var(--bad)", marginTop: "7px", lineHeight: "1.5" }}>{"Enter the website you want tracked."}</div>}
      {error && <div role="alert" style={{ fontSize: "11.5px", color: "var(--bad)", marginTop: "7px", lineHeight: "1.5" }}>{error}</div>}

      {/* Detecting / detected card */}
      {detecting && (
        <div style={{ marginTop: "16px", background: "var(--bg0)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "16px", display: "flex", alignItems: "center", gap: "10px", color: "var(--mut)", fontSize: "13px" }}>
          <span className="ob-spin" style={{ width: "15px", height: "15px", border: "2px solid var(--brd)", borderTopColor: "var(--ac)", borderRadius: "50%", display: "inline-block" }} />
          Detecting brand from the website…
        </div>
      )}
      {!detecting && detected && (
        <div style={{ marginTop: "16px", background: "var(--bg0)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "var(--bg2)", border: "1px solid var(--brd)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "15px", color: "var(--ac)" }}>{detected.name.charAt(0).toUpperCase()}</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>{detected.name}</div>
              {detected.category && <div style={{ fontSize: "11px", fontWeight: "400", color: "var(--fnt)" }}>{detected.category}</div>}
            </div>
            <div style={{ marginLeft: "auto", fontSize: "10px", fontWeight: "500", color: "var(--ac)" }}>{detected.fallback ? "FROM DOMAIN" : "DETECTED ✓"}</div>
          </div>
          {detected.description && (
            <div style={{ fontSize: "12px", color: "var(--mut)", lineHeight: 1.6, marginTop: "12px" }}>{detected.description}</div>
          )}
          {detected.aliases.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "14px" }}>
              {detected.aliases.map((a) => (
                <span key={a} style={{ fontSize: "11px", fontWeight: "400", background: "var(--bg2)", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 9px" }}>{a}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* A shared name is the single biggest source of wrong numbers, so it is
          said here, before anything is tracked, rather than discovered later. */}
      {!detecting && detected?.ambiguous && detected.conflicts && detected.conflicts.length > 0 && (
        <div
          role="note"
          style={{ marginTop: "12px", background: "var(--bg0)", border: "1px solid var(--brd)", borderLeft: "3px solid var(--ac)", borderRadius: "10px", padding: "14px 16px" }}
        >
          <div style={{ fontSize: "12.5px", fontWeight: 600 }}>
            {`Other companies also go by “${detected.name}”`}
          </div>
          <div style={{ fontSize: "12px", color: "var(--mut)", lineHeight: 1.65, marginTop: "6px" }}>
            {`We'll use ${website.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "") || "your website"} to tell you apart, so answers about them aren't counted as mentions of you.`}
          </div>
          <ul style={{ margin: "10px 0 0", padding: "0 0 0 16px", fontSize: "11.5px", color: "var(--fnt)", lineHeight: 1.7 }}>
            {detected.conflicts.slice(0, 3).map((c) => (
              <li key={c.domain ?? c.what}>{c.domain ? `${c.domain} — ${c.what}` : c.what}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
        <button type="submit" className="btn-ac" disabled={detecting} style={{ display: "inline-block", fontSize: "13px", fontWeight: "600", borderRadius: "8px", padding: "10px 22px", border: "none", cursor: detecting ? "default" : "pointer", fontFamily: "inherit", opacity: detecting ? 0.6 : 1 }}>
          {detecting ? "Detecting…" : detected ? "Continue →" : "Detect brand"}
        </button>
      </div>
      <style>{`@keyframes ob-spin{to{transform:rotate(360deg)}} .ob-spin{animation:ob-spin .8s linear infinite}`}</style>
    </form>
  );
}
