"use client";

import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import { ADD_BRAND_NOTE, LIVE_BRAND } from "@/lib/brands";

/* "+ Add a brand" flow (INTERACTIVITY_CONVENTIONS playbook 3 + 9).
   Opened from the sidebar brand switcher and from both add-brand affordances
   on /app/assets. Real form: name + website are required, category and
   competitor seeds are optional. "Connect brand" validates, then says honestly
   what would happen next on a live workspace and closes.

   Dismissal: ✕, Cancel, Esc, backdrop click. */

const FIELD: React.CSSProperties = {
  width: "100%",
  background: "var(--bg0)",
  border: "1px solid var(--brd)",
  borderRadius: "8px",
  padding: "9px 12px",
  fontSize: "12.5px",
  lineHeight: 1.5,
  color: "var(--tx)",
  fontFamily: "inherit",
  outline: "none",
};

const LABEL: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 500,
  color: "var(--fnt)",
  marginBottom: "6px",
};

export default function AddBrandModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [category, setCategory] = useState("");
  const [seeds, setSeeds] = useState("");
  const [error, setError] = useState<string | null>(null);

  /* Fresh form every time it opens. */
  useEffect(() => {
    if (open) return;
    setName("");
    setDomain("");
    setCategory("");
    setSeeds("");
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const nameBad = error !== null && name.trim() === "";
  const domainBad = error !== null && domain.trim() === "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim() === "" || domain.trim() === "") {
      setError("A brand needs a name and a website before Answr can scan it.");
      return;
    }
    setError(null);
    toast(ADD_BRAND_NOTE);
    onClose();
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(5,5,8,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-label="Add a brand"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        style={{
          width: "520px",
          maxWidth: "100%",
          maxHeight: "86vh",
          overflowY: "auto",
          background: "var(--bg2)",
          border: "1px solid var(--brd)",
          borderRadius: "12px",
          padding: "22px",
          boxShadow: "0 30px 80px rgba(0,0,0,.6)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "15px", fontWeight: 600 }}>{"Add a brand"}</span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{ color: "var(--fnt)", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "inherit", fontFamily: "inherit", lineHeight: 1 }}
          >
            {"✕"}
          </button>
        </div>
        <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "4px", lineHeight: 1.5 }}>
          {"Each brand gets its own prompt set, competitor list and dashboards. Plan quota is pooled across assets."}
        </div>

        <div style={{ marginTop: "18px" }}>
          <label htmlFor="brand-name" style={LABEL}>{"Brand name"}</label>
          <input
            id="brand-name"
            autoFocus
            value={name}
            onChange={(e) => { setName(e.target.value); if (error) setError(null); }}
            placeholder="Jordan Brand"
            style={{ ...FIELD, border: `1px solid ${nameBad ? "#e5636e" : "var(--brd)"}` }}
          />
        </div>

        <div style={{ marginTop: "12px" }}>
          <label htmlFor="brand-domain" style={LABEL}>{"Website"}</label>
          <input
            id="brand-domain"
            value={domain}
            onChange={(e) => { setDomain(e.target.value); if (error) setError(null); }}
            placeholder="jordan.com"
            style={{ ...FIELD, border: `1px solid ${domainBad ? "#e5636e" : "var(--brd)"}` }}
          />
        </div>

        <div style={{ marginTop: "12px" }}>
          <label htmlFor="brand-category" style={LABEL}>{"Category"}</label>
          <input
            id="brand-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="basketball footwear"
            style={FIELD}
          />
          <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "5px", lineHeight: 1.45 }}>
            {"Sets the question mix Answr writes for the first prompt set."}
          </div>
        </div>

        <div style={{ marginTop: "12px" }}>
          <label htmlFor="brand-seeds" style={LABEL}>{"Competitors to track"}</label>
          <textarea
            id="brand-seeds"
            rows={2}
            value={seeds}
            onChange={(e) => setSeeds(e.target.value)}
            placeholder={(LIVE_BRAND.competitorNames ?? []).join(", ")}
            style={{ ...FIELD, resize: "vertical" }}
          />
          <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "5px", lineHeight: 1.45 }}>
            {"Comma-separated seeds — share of voice compares the new brand against these."}
          </div>
        </div>

        {error && <div style={{ fontSize: "11.5px", color: "#e5636e", marginTop: "12px" }}>{error}</div>}

        <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
          <button
            type="submit"
            className="btn-ac"
            style={{ flex: 1, textAlign: "center", fontSize: "12.5px", fontWeight: 500, borderRadius: "7px", padding: "9px 0", border: "none", cursor: "pointer", fontFamily: "inherit" }}
          >
            {"Connect brand"}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, textAlign: "center", fontSize: "12.5px", fontWeight: 500, color: "var(--tx)", background: "transparent", border: "1px solid var(--brd)", borderRadius: "7px", padding: "9px 0", cursor: "pointer", fontFamily: "inherit" }}
          >
            {"Cancel"}
          </button>
        </div>
        <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "10px", lineHeight: 1.45 }}>
          {"Connecting starts a first scan and a prompt-set draft on live workspaces."}
        </div>
      </form>
    </div>
  );
}
