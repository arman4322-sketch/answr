"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";
import "./marketing.css";

/* Shared marketing nav — built from the canvas nav (canonical on 24 pages) with the
   audit fixes applied: spec item order (Resources 4th, per README + i-nav mock),
   correct active states (none on home, Enterprise on /enterprise), and the
   Industries dropdown ported from frame i-nav. Product/Solutions/Resources panels
   follow the same depicted pattern (290px · bg1 · 12px radius · 0 30px 80px shadow).

   Mobile (<= 900px): the seven section links and the "Log in" link are hidden and
   replaced by a hamburger that opens a full-width panel listing every section with
   its dropdown items. The logo and the "Get a demo" CTA stay in the bar at every
   width. All of that is driven from marketing.css — the desktop markup and its
   inline styles are untouched, so >= 1440px renders exactly as before. */

const CARET = (
  <svg
    width="9"
    height="9"
    viewBox="0 0 10 10"
    fill="none"
    stroke="var(--fnt)"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flex: "none", display: "block" }}
    aria-hidden="true"
  >
    <path d="M2 3.5 5 6.5 8 3.5" />
  </svg>
);

type Item = { href: string; title: string; sub?: string };

const DROPDOWNS: Record<string, Item[]> = {
  Product: [
    { href: "/product/answer-engine-insights", title: "Answer Engine Insights", sub: "See every answer, on every platform" },
    { href: "/product/citations", title: "Citations", sub: "Know which sources AI trusts" },
    { href: "/product/conversations-demand", title: "Conversations & Demand", sub: "Real questions, quantified demand" },
    { href: "/product/agent-analytics", title: "Agent Analytics", sub: "Watch AI crawlers work your site" },
    { href: "/product/actions-workflows", title: "Actions & Workflows", sub: "From answer to action to proof" },
    { href: "/integrations", title: "Integrations", sub: "CMS, Slack, Jira, Looker and more" },
  ],
  Solutions: [
    { href: "/solutions/in-house", title: "In-house teams", sub: "Make AEO a channel you own" },
    { href: "/solutions/agencies", title: "Agencies", sub: "Portfolio views and white-label reports" },
  ],
  Industries: [
    { href: "/industries/b2b-saas", title: "B2B SaaS", sub: "Win the AI shortlist" },
    { href: "/industries/ecommerce", title: "E-commerce & DTC", sub: "Be the product AI recommends" },
    { href: "/industries/fintech", title: "Fintech", sub: "Accuracy, monitored daily" },
    { href: "/industries/healthcare", title: "Healthcare", sub: "Patients ask AI first" },
    { href: "/industries/travel", title: "Travel & Hospitality", sub: "Own the itinerary answer" },
  ],
  Resources: [
    { href: "/blog", title: "Blog", sub: "Research and field notes" },
    { href: "/resources/aeo-handbook", title: "The AEO handbook", sub: "The complete guide to answer engines" },
    { href: "/resources/answr-index", title: "The Answr Index", sub: "Monthly visibility benchmarks" },
    { href: "/changelog", title: "Changelog", sub: "What shipped, every week" },
    { href: "/customers", title: "Case studies", sub: "How teams win the answer layer" },
  ],
};

const SECTIONS: { label: string; href: string; match: (p: string) => boolean; dropdown?: string }[] = [
  { label: "Product", href: "/product/answer-engine-insights", match: (p) => p.startsWith("/product") || p === "/integrations", dropdown: "Product" },
  { label: "Solutions", href: "/solutions/in-house", match: (p) => p.startsWith("/solutions"), dropdown: "Solutions" },
  { label: "Industries", href: "/industries/b2b-saas", match: (p) => p.startsWith("/industries"), dropdown: "Industries" },
  { label: "Resources", href: "/blog", match: (p) => p.startsWith("/blog") || p.startsWith("/resources") || p === "/changelog", dropdown: "Resources" },
  { label: "Pricing", href: "/pricing", match: (p) => p === "/pricing" },
  { label: "Enterprise", href: "/enterprise", match: (p) => p === "/enterprise" },
  { label: "Customers", href: "/customers", match: (p) => p.startsWith("/customers") },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);

  const openNow = useCallback((key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(key);
  }, []);
  const closeSoon = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  }, []);

  /* Close on navigation. */
  useEffect(() => { setMenu(false); }, [pathname]);

  /* Escape closes and returns focus to the trigger; the page behind must not
     scroll while the sheet is up; growing past the breakpoint drops the sheet so
     it can never be left open on a desktop layout. */
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMenu(false); trigger.current?.focus(); }
    };
    const mq = window.matchMedia("(min-width: 901px)");
    const onWide = () => { if (mq.matches) setMenu(false); };
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
      document.body.style.overflow = prev;
    };
  }, [menu]);

  return (
    <div
      className="mkt-nav"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "26px",
        padding: "18px 48px",
        borderBottom: "1px solid var(--brd)",
        position: "relative",
        zIndex: 20,
      }}
    >
      <Link href="/" className="mkt-nav-logo" style={{ display: "flex", alignItems: "center", gap: "9px", marginRight: "12px", color: "var(--tx)" }}>
        <span
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
        </span>
        <span style={{ fontSize: "16px", fontWeight: 600 }}>Answr</span>
      </Link>

      {SECTIONS.map((s) => {
        const active = s.match(pathname);
        const hasDd = !!s.dropdown;
        return (
          <span
            key={s.label}
            className="mkt-nav-item"
            style={{ position: "relative", flex: "none" }}
            onMouseEnter={hasDd ? () => openNow(s.label) : undefined}
            onMouseLeave={hasDd ? closeSoon : undefined}
          >
            <Link
              href={s.href}
              className="nav-link"
              aria-expanded={hasDd ? open === s.label : undefined}
              style={{
                fontSize: "13px",
                color: active ? "var(--tx)" : "var(--mut)",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                whiteSpace: "nowrap",
              }}
              onClick={() => setOpen(null)}
            >
              {s.label}
              {hasDd && CARET}
            </Link>
            {hasDd && open === s.label && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 14px)",
                  left: "-8px",
                  width: "290px",
                  background: "var(--bg1)",
                  border: "1px solid var(--brd)",
                  borderRadius: "12px",
                  boxShadow: "0 30px 80px rgba(0,0,0,.6)",
                  padding: "8px",
                  zIndex: 9,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {DROPDOWNS[s.dropdown!].map((it) => (
                    <Link
                      key={it.href}
                      href={it.href}
                      className="dd-item"
                      style={{ display: "block", padding: "9px 11px", borderRadius: "8px", color: "var(--tx)" }}
                      onClick={() => setOpen(null)}
                    >
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>{it.title}</div>
                      {it.sub && <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "2px" }}>{it.sub}</div>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </span>
        );
      })}

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "18px", flex: "none" }}>
        <Link href="/login" className="nav-link mkt-nav-login" style={{ fontSize: "13px", color: "var(--mut)", whiteSpace: "nowrap" }}>
          Log in
        </Link>
        <Link
          href="/demo"
          className="btn-ac"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            fontSize: "13px",
            fontWeight: 600,
            borderRadius: "7px",
            padding: "8px 16px",
            whiteSpace: "nowrap",
            flex: "none",
          }}
        >
          Get a demo<span style={{ display: "inline-block" }}>→</span>
        </Link>

        {/* Mobile menu trigger — display:none above 900px, so it adds nothing to
            the desktop layout. */}
        <button
          ref={trigger}
          type="button"
          className="mkt-burger"
          aria-label={menu ? "Close menu" : "Open menu"}
          aria-expanded={menu}
          aria-controls="mkt-mobile-menu"
          onClick={() => setMenu((v) => !v)}
        >
          <span className="mkt-burger-box" data-open={menu || undefined} aria-hidden="true">
            <span /><span /><span />
          </span>
        </button>
      </div>

      {menu && (
        <>
          <div className="mkt-menu-backdrop" onClick={() => setMenu(false)} aria-hidden="true" />
          <div
            id="mkt-mobile-menu"
            ref={panel}
            className="mkt-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            tabIndex={-1}
          >
            {SECTIONS.map((s) => (
              <div key={s.label} className="mkt-menu-group">
                <Link href={s.href} className="mkt-menu-section" data-active={s.match(pathname) || undefined} onClick={() => setMenu(false)}>
                  {s.label}
                </Link>
                {s.dropdown &&
                  DROPDOWNS[s.dropdown].map((it) => (
                    <Link key={it.href} href={it.href} className="mkt-menu-item" onClick={() => setMenu(false)}>
                      <span className="mkt-menu-item-t">{it.title}</span>
                      {it.sub && <span className="mkt-menu-item-s">{it.sub}</span>}
                    </Link>
                  ))}
              </div>
            ))}
            <div className="mkt-menu-foot">
              <Link href="/login" className="mkt-menu-section" onClick={() => setMenu(false)}>
                Log in
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
