"use client";

import { useEffect, useState } from "react";

/* What's-new panel — from canvas frame #m-surfaces. Opened by the "What's new" row
   in the ⌘K palette (window CustomEvent "answr:whatsnew"); closes on ✕ / Esc.
   Audit fix: the frame lacked a close affordance — a ✕ button is added in the header. */
export default function WhatsNew() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("answr:whatsnew", onOpen);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("answr:whatsnew", onOpen);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!open) return null;

  return (
    <div role="dialog" aria-label="What's new" style={{ position: "fixed", right: "28px", top: "56px", width: "330px", zIndex: 95 }}>
      <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "12px", boxShadow: "0 30px 80px rgba(0,0,0,.5)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--brd)" }}>
          <span style={{ fontSize: "12.5px", fontWeight: 600 }}>{"What's new"}</span>
          <button
            type="button"
            aria-label="Close what's new"
            onClick={() => setOpen(false)}
            style={{ marginLeft: "auto", background: "transparent", border: "none", color: "var(--fnt)", fontSize: "12px", cursor: "pointer", padding: "2px 4px", lineHeight: 1, fontFamily: "inherit" }}
          >
            {"✕"}
          </button>
        </div>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--brd)" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "9.5px", fontWeight: 600, color: "var(--ac)", background: "rgba(142,124,242,0.14)", borderRadius: "4px", padding: "1px 5px" }}>{"NEW"}</span>
            <span style={{ fontSize: "12.5px", fontWeight: 500 }}>{"Audiences (beta)"}</span>
            <span style={{ marginLeft: "auto", fontSize: "10.5px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{"Aug 4"}</span>
          </div>
          <div style={{ fontSize: "11.5px", color: "var(--mut)", lineHeight: "1.55", marginTop: "5px" }}>
            {"Segment visibility by the audiences you define — first 3 segments free on every plan."}
          </div>
        </div>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--brd)" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "12.5px", fontWeight: 500 }}>{"Demand keyword trees"}</span>
            <span style={{ marginLeft: "auto", fontSize: "10.5px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{"Jul 28"}</span>
          </div>
          <div style={{ fontSize: "11.5px", color: "var(--mut)", lineHeight: "1.55", marginTop: "5px" }}>
            {"Long-tail hierarchies with per-node volume and bookmarks."}
          </div>
        </div>
        <div style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "12.5px", fontWeight: 500 }}>{"GA4 blended referrals"}</span>
            <span style={{ marginLeft: "auto", fontSize: "10.5px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{"Jul 21"}</span>
          </div>
          <div style={{ fontSize: "11.5px", color: "var(--mut)", lineHeight: "1.55", marginTop: "5px" }}>
            {"Answr logs and GA4 sessions on one chart, discrepancy called out."}
          </div>
        </div>
      </div>
    </div>
  );
}
