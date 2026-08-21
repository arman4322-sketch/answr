import Link from "next/link";

/* Shared renderer for the legal pages (Privacy, Terms, DPA). Content is passed
   as structured sections so the three pages stay visually consistent and the
   prose lives in one readable place per document.

   These are honest starter documents written for this product's actual data
   model (official-API sampling + first-party telemetry, no scraping). They are a
   real, customizable baseline — a buyer should have counsel review them before
   relying on them, and fill the bracketed placeholders. */

export type LegalSection = { heading: string; body: string[] };

export default function LegalDoc({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div style={{ maxWidth: "820px", margin: "0 auto", padding: "72px 48px 96px" }}>
      <div
        style={{
          display: "inline-block",
          fontSize: "10.5px",
          fontWeight: 600,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "var(--ac)",
          border: "1px solid color-mix(in oklab,var(--ac) 32%,transparent)",
          background: "rgba(142,124,242,0.08)",
          borderRadius: "999px",
          padding: "6px 14px",
        }}
      >
        Legal
      </div>
      <h1 style={{ fontSize: "40px", fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.15, marginTop: "16px" }}>
        {title}
      </h1>
      <div style={{ fontSize: "12.5px", color: "var(--fnt)", marginTop: "10px" }}>Last updated: {updated}</div>
      <p style={{ fontSize: "15px", color: "var(--mut)", lineHeight: 1.75, marginTop: "20px", textWrap: "pretty" }}>{intro}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "28px", marginTop: "36px" }}>
        {sections.map((s, i) => (
          <section key={i}>
            <h2 style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-0.01em" }}>{s.heading}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
              {s.body.map((p, j) => (
                <p key={j} style={{ fontSize: "14px", color: "var(--mut)", lineHeight: 1.7 }}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid var(--brd)", fontSize: "13px", color: "var(--mut)" }}>
        Questions about this document? Contact{" "}
        <a href="mailto:privacy@answr.io" style={{ color: "var(--ac)" }}>privacy@answr.io</a>. See also our{" "}
        <Link href="/privacy" style={{ color: "var(--ac)" }}>Privacy Policy</Link>,{" "}
        <Link href="/terms" style={{ color: "var(--ac)" }}>Terms</Link>, and{" "}
        <Link href="/dpa" style={{ color: "var(--ac)" }}>DPA</Link>.
      </div>
    </div>
  );
}
