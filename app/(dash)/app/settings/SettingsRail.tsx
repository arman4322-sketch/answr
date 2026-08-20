"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./settings-rail.css";

/* Settings sub-rail — single source of truth (frame #settings' 8-item rail; audit
   fix: #m-alerts' 7-item variant that dropped "Platforms" is retired). Items with
   All eight items now have built pages, so every entry is a real Link. */

const ITEMS: { label: string; href?: string }[] = [
  { label: "Workspace", href: "/app/settings/workspace" },
  { label: "Brand & competitors", href: "/app/settings" },
  { label: "Data quality", href: "/app/settings/data-quality" },
  { label: "Platforms", href: "/app/settings/platforms" },
  { label: "Team", href: "/app/settings/team" },
  { label: "Notifications", href: "/app/settings/alerts" },
  { label: "API keys", href: "/app/settings/api-keys" },
  { label: "Billing", href: "/app/settings/billing" },
];

export default function SettingsRail() {
  const pathname = usePathname();
  return (
    <div
      className="settings-rail"
      style={{ width: "200px", flex: "none", borderRight: "1px solid var(--brd)", padding: "20px 14px", display: "flex", flexDirection: "column", gap: "2px", fontSize: "13px" }}
    >
      {ITEMS.map((it) =>
        it.href ? (
          pathname === it.href ? (
            <Link key={it.label} href={it.href} style={{ padding: "7px 10px", borderRadius: "7px", background: "rgba(255,255,255,0.05)", color: "var(--tx)", fontWeight: 500 }}>
              {it.label}
            </Link>
          ) : (
            <Link key={it.label} href={it.href} className="rail-item" style={{ padding: "7px 10px", borderRadius: "7px", color: "var(--mut)" }}>
              {it.label}
            </Link>
          )
        ) : (
          <span key={it.label} style={{ padding: "7px 10px", borderRadius: "7px", color: "var(--mut)" }}>
            {it.label}
          </span>
        ),
      )}
    </div>
  );
}
