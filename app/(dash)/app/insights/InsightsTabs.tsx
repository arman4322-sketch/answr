"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* AEI sub-nav (frames #aei / #p2-*) — one tab row for the whole Insights cluster.
   Styling verbatim from the frames' tab strip (incl. BETA badges); active tab is
   derived from the pathname (topic detail pages keep "Topics" active). */

const BETA = (
  <span
    style={{
      fontSize: "9.5px",
      fontWeight: 600,
      color: "var(--ac)",
      background: "rgba(142,124,242,0.14)",
      borderRadius: "4px",
      padding: "1px 5px",
    }}
  >
    BETA
  </span>
);

const TABS: { href: string; label: string; beta?: boolean }[] = [
  { href: "/app/insights", label: "Topics" },
  { href: "/app/insights/regions", label: "Regions" },
  { href: "/app/insights/audiences", label: "Audiences", beta: true },
  { href: "/app/insights/shopping", label: "Shopping", beta: true },
  { href: "/app/insights/sentiment", label: "Sentiment" },
];

function isActive(pathname: string, href: string) {
  if (href === "/app/insights") {
    return pathname === href || pathname.startsWith("/app/insights/topics");
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export default function InsightsTabs() {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", gap: "2px", padding: "8px 24px 0", borderBottom: "1px solid var(--brd)", fontSize: "12.5px" }}>
      {TABS.map((t) => {
        const active = isActive(pathname, t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            style={
              active
                ? { padding: "8px 12px", color: "var(--tx)", fontWeight: 500, borderBottom: "2px solid var(--ac)" }
                : { padding: "8px 12px", color: "var(--mut)" }
            }
          >
            {t.label}
            {t.beta && <> {BETA}</>}
          </Link>
        );
      })}
    </div>
  );
}
