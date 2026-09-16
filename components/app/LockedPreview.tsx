"use client";

import { useEffect, useState } from "react";
import {
  type CapabilitySource,
  FEASIBILITY_LABEL,
  EFFORT_LABEL,
} from "@/lib/preview/sources";

/* LockedPreview — wraps a capability Answr does not yet measure.

   It renders the screen's layout as a DIMMED, NON-INTERACTIVE preview so a
   viewer can see what the populated screen would look like, with an overlay
   that explains exactly where the data would come from.

   Honesty guardrails (this app ships no unlabelled sample data):
   - a permanent "PREVIEW · ILLUSTRATIVE — NOT MEASURED DATA" badge sits on top,
   - the preview layer is aria-hidden and inert, so assistive tech never reads a
     sample figure as a measurement and nothing inside is clickable,
   - every number underneath is visibly greyed and desaturated.

   Interaction: hovering the badge shows the one-line source headline; the
   "What's needed" button opens the full research detail (vendors, integration
   approach, pricing, trade-offs, effort). */

export default function LockedPreview({
  source,
  children,
}: {
  source: CapabilitySource;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div style={{ position: "relative" }}>
      {/* ── the dimmed, inert preview of what this screen would look like ── */}
      <div
        aria-hidden="true"
        inert
        style={{
          opacity: 0.28,
          filter: "grayscale(0.85)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {children}
      </div>

      {/* ── overlay ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: "56px",
          /* let the page scroll normally; only the card is interactive */
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            pointerEvents: "auto",
            maxWidth: "520px",
            background: "var(--bg1)",
            border: "1px solid var(--brd)",
            borderRadius: "12px",
            padding: "18px 20px",
            boxShadow: "0 18px 50px rgba(0,0,0,.45)",
            textAlign: "center",
          }}
        >
          <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{ position: "relative", display: "inline-block" }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: "9.5px",
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--gold, #d9b679)",
                border: "1px solid color-mix(in oklab, var(--gold, #d9b679) 40%, transparent)",
                background: "color-mix(in oklab, var(--gold, #d9b679) 12%, transparent)",
                borderRadius: "999px",
                padding: "4px 11px",
                cursor: "help",
              }}
            >
              Preview · illustrative — not measured data
            </span>

            {/* hover tooltip: the one-line "where it comes from" */}
            {hover && (
              <div
                role="tooltip"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "320px",
                  background: "var(--bg2)",
                  border: "1px solid var(--brd)",
                  borderRadius: "9px",
                  padding: "10px 12px",
                  fontSize: "11.5px",
                  lineHeight: 1.55,
                  color: "var(--mut)",
                  textAlign: "left",
                  zIndex: 30,
                  boxShadow: "0 12px 30px rgba(0,0,0,.45)",
                }}
              >
                <div style={{ color: "var(--tx)", fontWeight: 600, marginBottom: "3px" }}>
                  Where this data would come from
                </div>
                {source.headline}
                <div style={{ marginTop: "6px", color: "var(--fnt)" }}>
                  {FEASIBILITY_LABEL[source.feasibility]} · {EFFORT_LABEL[source.effort]}
                </div>
              </div>
            )}
          </div>

          <div style={{ fontSize: "15px", fontWeight: 600, marginTop: "12px" }}>
            {source.title} isn&rsquo;t collecting data yet
          </div>
          <div style={{ fontSize: "12.5px", color: "var(--mut)", lineHeight: 1.6, marginTop: "6px" }}>
            {source.whatItMeasures} The layout behind this panel is an illustration of how it would look
            once connected — the figures in it are not measured.
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-ac"
            style={{
              marginTop: "14px",
              fontSize: "12.5px",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "9px 18px",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            What&rsquo;s needed to enable this →
          </button>
        </div>
      </div>

      {open && <DetailPanel source={source} onClose={() => setOpen(false)} />}
    </div>
  );
}

function DetailPanel({ source, onClose }: { source: CapabilitySource; onClose: () => void }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(5,5,8,0.6)", zIndex: 120 }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`What's needed to enable ${source.title}`}
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          width: "min(720px, calc(100vw - 48px))",
          maxHeight: "calc(100vh - 80px)",
          overflowY: "auto",
          background: "var(--bg1)",
          border: "1px solid var(--brd)",
          borderRadius: "14px",
          boxShadow: "0 30px 80px rgba(0,0,0,.55)",
          zIndex: 121,
          padding: "22px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "17px", fontWeight: 700 }}>{source.title}</div>
            <div style={{ fontSize: "12.5px", color: "var(--mut)", marginTop: "4px", lineHeight: 1.6 }}>
              {source.whatItMeasures}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              color: "var(--fnt)",
              fontSize: "18px",
              cursor: "pointer",
              fontFamily: "inherit",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "14px" }}>
          <Chip label={FEASIBILITY_LABEL[source.feasibility]} tone="accent" />
          <Chip label={`Build effort: ${EFFORT_LABEL[source.effort]}`} />
        </div>

        <Section title="Recommended path">
          <div style={{ fontSize: "13px", color: "var(--mut)", lineHeight: 1.65 }}>{source.recommended}</div>
        </Section>

        <Section title={`Data sources (${source.sources.length})`}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {source.sources.map((s, i) => (
              <div
                key={s.name}
                style={{
                  border: "1px solid var(--brd)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  background: "var(--bg2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "10px", color: "var(--fnt)", fontWeight: 700 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: "13.5px", fontWeight: 600 }}>{s.name}</span>
                  <span style={{ marginLeft: "auto", fontSize: "11.5px", color: "var(--ac)", fontWeight: 600 }}>
                    {s.cost}
                  </span>
                </div>
                <Row label="Provides" value={s.what} />
                <Row label="Integration" value={s.how} />
                <Row label="Trade-off" value={s.tradeoff} muted />
              </div>
            ))}
          </div>
        </Section>

        {source.notes && (
          <Section title="Notes">
            <div style={{ fontSize: "12.5px", color: "var(--mut)", lineHeight: 1.65 }}>{source.notes}</div>
          </Section>
        )}

        <div
          style={{
            marginTop: "18px",
            paddingTop: "12px",
            borderTop: "1px solid var(--brd)",
            fontSize: "11px",
            color: "var(--fnt)",
            lineHeight: 1.6,
          }}
        >
          Pricing and availability were researched at the time of writing and should be re-verified before
          committing to a vendor. Answr measures nothing for this capability today.
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "18px" }}>
      <div
        style={{
          fontSize: "10.5px",
          fontWeight: 700,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--fnt)",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div style={{ display: "flex", gap: "8px", marginTop: "7px", fontSize: "12px", lineHeight: 1.55 }}>
      <span style={{ flex: "none", width: "76px", color: "var(--fnt)" }}>{label}</span>
      <span style={{ color: muted ? "var(--fnt)" : "var(--mut)" }}>{value}</span>
    </div>
  );
}

function Chip({ label, tone }: { label: string; tone?: "accent" }) {
  const accent = tone === "accent";
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: "999px",
        color: accent ? "var(--ac)" : "var(--mut)",
        background: accent ? "rgba(142,124,242,0.12)" : "var(--bg2)",
        border: `1px solid ${accent ? "color-mix(in oklab,var(--ac) 32%,transparent)" : "var(--brd)"}`,
      }}
    >
      {label}
    </span>
  );
}
