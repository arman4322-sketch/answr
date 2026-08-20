"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* Agent Analytics sub-nav — frames #agents / #p2-referrals / #m-pagehealth / #m-logs
   share this row. Every tab is a real route; the active tab keeps the frame's
   2px accent underline. Bot detail pages sit under the Crawlers tab. */

const TABS: { label: string; href: string; isActive: (pathname: string) => boolean }[] = [
  {
    label: "Crawlers",
    href: "/app/agents",
    isActive: (p) => p === "/app/agents" || p.startsWith("/app/agents/bots"),
  },
  {
    label: "Referrals",
    href: "/app/agents/referrals",
    isActive: (p) => p.startsWith("/app/agents/referrals"),
  },
  {
    label: "Pages",
    href: "/app/page-health",
    isActive: (p) => p.startsWith("/app/page-health"),
  },
  {
    label: "Logs",
    href: "/app/agents/logs",
    isActive: (p) => p.startsWith("/app/agents/logs"),
  },
];

export default function AgentsTabs() {
  const pathname = usePathname();
  return (
    <div style={{ display: "flex", gap: "2px", padding: "8px 24px 0", borderBottom: "1px solid var(--brd)", fontSize: "12.5px" }}>
      {TABS.map((t) =>
        t.isActive(pathname) ? (
          <Link key={t.href} href={t.href} style={{ padding: "8px 12px", color: "var(--tx)", fontWeight: 500, borderBottom: "2px solid var(--ac)" }}>
            {t.label}
          </Link>
        ) : (
          <Link key={t.href} href={t.href} style={{ padding: "8px 12px", color: "var(--mut)" }}>
            {t.label}
          </Link>
        ),
      )}
    </div>
  );
}
