"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./small-screen-gate.css";

/* Small-screen interstitial for the dashboard.

   The 36 dashboard screens are a desktop-first design (1440px handoff) and are
   not being rebuilt responsively. What matters is that someone opening the link
   on a phone lands somewhere deliberate instead of in a sideways-scrolling mess,
   so this card explains the situation and offers the two honest ways forward:
   carry on anyway, or go read the marketing site.

   How it stays invisible on desktop: the card is always in the SSR HTML but
   carries an INLINE `display:none`, which the stylesheet only overrides inside
   `@media (max-width: 899px)` (small-screen-gate.css). The hidden state is
   inline on purpose — a CSS file imported by a client component is not
   guaranteed to be applied before first paint, and a base `.ssg{display:none}`
   rule that arrives late would paint a full-screen overlay on a 1440px desktop
   for a frame. Inline-hidden inverts that failure mode: if the stylesheet never
   lands, the gate simply never shows and the dashboard renders as it always
   did. No matchMedia, no mount-time measurement, so nothing can flash at
   1440px and the server output is identical to what desktop already rendered.

   Dismissal is per session (sessionStorage): an investor who continues stays
   continued while they click around, and a fresh visit re-explains itself. */

const KEY = "answr:dash-small-ok";

/* Runs during HTML parse, before the card below is parsed, so a visitor who
   already continued this session never sees it blink back on reload. */
const BOOT = `try{if(sessionStorage.getItem(${JSON.stringify(KEY)})==="1")document.documentElement.setAttribute("data-answr-gate","off")}catch(e){}`;

export default function SmallScreenGate() {
  // Always false on the server AND on the first client render — the CSS, not
  // React, decides visibility, so hydration can never disagree with the markup.
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY) === "1") setDismissed(true);
    } catch {
      /* private mode / storage disabled — the card simply stays dismissible */
    }
  }, []);

  function dismiss() {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore — the React state below still hides it for this page view */
    }
    document.documentElement.setAttribute("data-answr-gate", "off");
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />

      <div
        className="ssg"
        role="dialog"
        aria-labelledby="ssg-title"
        style={{
          // Hidden here, revealed only by the <900px media query (with
          // !important, since an inline declaration otherwise wins).
          display: "none",
          position: "fixed",
          inset: 0,
          zIndex: 200,
          // Same ground the dashboard itself sits on, so the card reads as a
          // screen of the app rather than a panel floating over a broken page.
          background: "var(--bg0)",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "340px",
            background: "var(--bg1)",
            border: "1px solid var(--brd)",
            borderRadius: "14px",
            padding: "26px 22px 22px",
            boxShadow: "0 30px 80px rgba(0,0,0,.55)",
            textAlign: "center",
          }}
        >
          {/* Answr mark — same lockup as the marketing nav and the login card */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", marginBottom: "18px" }}>
            <span
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "7px",
                background: "linear-gradient(135deg,#a394ff,#6d5ce6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#fff",
                flex: "none",
              }}
              aria-hidden="true"
            >
              A
            </span>
            <span style={{ fontSize: "17px", fontWeight: 600, color: "var(--tx)" }}>Answr</span>
          </div>

          <h1 id="ssg-title" style={{ margin: 0, fontSize: "15.5px", fontWeight: 600, color: "var(--tx)", letterSpacing: "-.01em" }}>
            Built for a wide screen
          </h1>

          <p style={{ margin: "9px 0 0", fontSize: "13px", lineHeight: 1.55, color: "var(--mut)" }}>
            Answr&rsquo;s dashboard is designed for desktop — open this link on a larger screen for the full view.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={dismiss}
              className="btn-ac"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "9px",
                border: "none",
                fontSize: "13px",
                fontWeight: 500,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              Continue anyway
            </button>

            <Link
              href="/"
              style={{
                display: "block",
                width: "100%",
                padding: "10px 14px",
                borderRadius: "9px",
                border: "1px solid var(--brd)",
                background: "var(--bg2)",
                color: "var(--tx)",
                fontSize: "13px",
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              Back to answr.io
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
