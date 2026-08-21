import Link from "next/link";

/* Shared marketing footer — canonical 4-column structure from the canvas, with audit
   fixes: the stray nav-caret on the Company→Industries link is removed (F3a), and the
   per-frame "Next: …" prototype furniture is replaced by the home frame's compliance
   line. Privacy/Terms/DPA now link to the real starter legal pages (/privacy, /terms,
   /dpa) added in the sale-readiness pass. */

const COLS: { title: string; items: { label: string; href?: string }[] }[] = [
  {
    title: "Product",
    items: [
      { label: "Answer Engine Insights", href: "/product/answer-engine-insights" },
      { label: "Citations", href: "/product/citations" },
      { label: "Conversations & Demand", href: "/product/conversations-demand" },
      { label: "Agent Analytics", href: "/product/agent-analytics" },
      { label: "Actions & Workflows", href: "/product/actions-workflows" },
      { label: "Integrations", href: "/integrations" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Customers", href: "/customers" },
      { label: "Enterprise", href: "/enterprise" },
      { label: "For agencies", href: "/solutions/agencies" },
      { label: "Industries", href: "/industries/b2b-saas" },
      { label: "Contact", href: "/demo" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Blog", href: "/blog" },
      { label: "AEO guide", href: "/resources/aeo-handbook" },
      { label: "Changelog", href: "/changelog" },
      { label: "Case studies", href: "/customers" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "DPA", href: "/dpa" },
      { label: "Security", href: "/security" },
    ],
  },
];

export default function Footer() {
  return (
    <div className="mkt-footer" style={{ borderTop: "1px solid var(--brd)", padding: "56px 48px 40px", display: "flex", gap: "64px", flexWrap: "wrap" }}>
      <div className="mkt-footer-brand" style={{ minWidth: "220px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "6px",
              background: "linear-gradient(135deg,#a394ff,#6d5ce6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            A
          </div>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>Answr</div>
        </div>
        <div style={{ fontSize: "12.5px", color: "var(--fnt)", marginTop: "12px", lineHeight: 1.6, maxWidth: "240px" }}>
          The answer engine optimization platform for brands that AI talks about.
        </div>
      </div>
      <div className="mkt-footer-cols" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(130px,1fr))", gap: "40px", flex: 1 }}>
        {COLS.map((col) => (
          <div key={col.title} style={{ display: "flex", flexDirection: "column", gap: "9px", fontSize: "12.5px" }}>
            <div style={{ fontSize: "10px", fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "var(--fnt)", marginBottom: "4px" }}>
              {col.title}
            </div>
            {col.items.map((it) =>
              it.href ? (
                <Link key={it.label} href={it.href} className="footer-link" style={{ color: "var(--mut)" }}>
                  {it.label}
                </Link>
              ) : (
                <span key={it.label} style={{ color: "var(--mut)" }}>
                  {it.label}
                </span>
              )
            )}
          </div>
        ))}
      </div>
      <div
        className="mkt-footer-legal"
        style={{
          width: "100%",
          borderTop: "1px solid var(--brd)",
          paddingTop: "20px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "11px",
          fontVariantNumeric: "tabular-nums",
          color: "var(--fnt)",
        }}
      >
        <span>© 2026 Answr, Inc.</span>
        <span>Built for the answer-engine era</span>
      </div>
    </div>
  );
}
