import type { Metadata } from "next";
import WaitlistForm from "./WaitlistForm";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description: "Be first to know what AI says about your brand. Join the Answr early-access waitlist.",
};

const points = [
  "See what ChatGPT, Claude, Gemini, Perplexity and AI Overviews say about your brand",
  "Trace the citations behind every AI answer",
  "Track the AI crawlers hitting your site — in real time",
  "Turn visibility gaps into a prioritized action plan",
];

export default function WaitlistPage() {
  return (
    <div style={{ maxWidth: "620px", margin: "0 auto", padding: "80px 24px 100px", textAlign: "center" }}>
      <div style={{ display: "inline-block", fontSize: "10.5px", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ac)", border: "1px solid color-mix(in oklab,var(--ac) 32%,transparent)", background: "rgba(142,124,242,0.08)", borderRadius: "999px", padding: "6px 14px" }}>
        Early access
      </div>
      <h1 style={{ fontSize: "clamp(32px,6vw,48px)", fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.1, marginTop: "20px", textWrap: "balance" }}>
        Know what AI says about your brand — before your competitors do.
      </h1>
      <p style={{ fontSize: "16.5px", color: "var(--mut)", lineHeight: 1.65, marginTop: "18px", maxWidth: "520px", marginInline: "auto", textWrap: "pretty" }}>
        Answr is the answer-engine optimization platform for the AI era. Join the waitlist for early access and launch pricing.
      </p>

      <div style={{ marginTop: "36px" }}>
        <WaitlistForm />
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: "44px auto 0", maxWidth: "460px", textAlign: "left", display: "grid", gap: "12px" }}>
        {points.map((p) => (
          <li key={p} style={{ display: "flex", gap: "11px", alignItems: "flex-start", fontSize: "14.5px", color: "var(--mut)", lineHeight: 1.5 }}>
            <span style={{ color: "var(--ac)", fontWeight: 700, flex: "none" }}>✓</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
