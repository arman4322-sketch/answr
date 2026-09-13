"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { writeDraft } from "../draft";

/* Onboarding step 1 — website field + AI brand detection.
   Enter (or "Detect brand") calls /api/suggest/brand to identify the real brand,
   category and aliases from the URL, then shows the detected card. "Continue →"
   saves the draft and advances. Detecting a new URL clears the downstream draft
   so steps 2–3 regenerate for the new brand. */

type Detected = { name: string; category: string; aliases: string[]; fallback?: boolean };

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
      const d = (await r.json()) as { ok: boolean; name?: string; category?: string; aliases?: string[]; fallback?: boolean; error?: string };
      if (!d.ok || !d.name) {
        setError(d.error || "Couldn't detect the brand — try again.");
        return;
      }
      const next: Detected = { name: d.name, category: d.category || "", aliases: d.aliases || [], fallback: d.fallback };
      setDetected(next);
      // Save brand + reset downstream so steps 2–3 regenerate for this brand.
      writeDraft({ website: url, brand: next.name, category: next.category, aliases: next.aliases, competitors: undefined, topics: undefined });
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
          {detected.aliases.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "14px" }}>
              {detected.aliases.map((a) => (
                <span key={a} style={{ fontSize: "11px", fontWeight: "400", background: "var(--bg2)", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 9px" }}>{a}</span>
              ))}
            </div>
          )}
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
