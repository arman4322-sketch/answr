"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import NavIcon from "./nav-icons";
import BrandSwitcher from "./BrandSwitcher";
import AccountMenu from "./AccountMenu";
import "./sidebar.css";

/* Left navigation — built to NAVIGATION.md (design rev 8).

   Grouped rail with icons and inline counts, collapsible to a 56px icon rail,
   brand switcher on the top row, single account row at the bottom that absorbs
   Settings. There is deliberately NO standalone Settings row — the spec says
   not to re-add one. Active state derives from the route, never from clicks. */

const EXPANDED = 232;
const COLLAPSED = 56;
const STORAGE_KEY = "answr:nav-collapsed";

type Item = {
  icon: string;
  label: string;
  href: string;
  /** inline 30-day count, omitted entirely when unavailable */
  count?: string;
  badge?: "NEW" | "live";
  /** amber dot — open items need attention */
  attention?: number;
};

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "Monitor",
    items: [
      { icon: "overview", label: "Overview", href: "/app/overview" },
      { icon: "insights", label: "Answer Engine Insights", href: "/app/insights" },
      { icon: "citations", label: "Citations", href: "/app/citations", count: "1,284" },
      { icon: "prompts", label: "Prompts", href: "/app/prompts", count: "412" },
      { icon: "conversations", label: "Conversations", href: "/app/conversations", count: "38" },
      { icon: "demand", label: "Demand", href: "/app/demand", badge: "NEW" },
    ],
  },
  {
    title: "Optimize",
    items: [
      { icon: "actions", label: "Actions", href: "/app/actions", attention: 12 },
      { icon: "workflows", label: "Workflows", href: "/app/workflows", badge: "NEW" },
      { icon: "reports", label: "Reports", href: "/app/reports", count: "3" },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { icon: "agents", label: "Agent Analytics", href: "/app/agents" },
      { icon: "live", label: "Live telemetry", href: "/app/live", badge: "live" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  // Sub-pages keep their parent active; sub-nav lives in the page header.
  if (href === "/app/overview") return pathname === href || pathname === "/app/welcome";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  /* Read the stored preference after mount so SSR and first client render agree.
     With NO stored preference the rail starts collapsed below 900px — the
     dashboard is a desktop design and 232px of nav is a quarter of a phone
     screen. A stored preference always wins, and on desktop the fallback is the
     same `false` it has always been. */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setCollapsed(stored === null ? window.matchMedia("(max-width: 899px)").matches : stored === "1");
  }, []);

  /* Only an explicit toggle is persisted. The small-screen default above is a
     starting position, not a choice, so a phone visit never quietly decides how
     this browser opens the rail on a wide screen later. */
  const toggle = useCallback(() => {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* storage disabled — the rail still toggles for this page view */
      }
      return next;
    });
  }, []);

  // ⌘\ toggles the rail.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return (
    <nav
      aria-label="Main"
      style={{
        width: collapsed ? COLLAPSED : EXPANDED,
        /* A flex item's default min-width:auto is its content floor, which kept
           the rail at 232px however narrow `width` went. Pin all three and clip. */
        minWidth: collapsed ? COLLAPSED : EXPANDED,
        maxWidth: collapsed ? COLLAPSED : EXPANDED,
        boxSizing: "border-box",
        overflowX: "hidden",
        flex: "none",
        borderRight: "1px solid var(--brd)",
        display: "flex",
        flexDirection: "column",
        padding: collapsed ? "12px 0" : "12px 10px",
        alignItems: collapsed ? "center" : "stretch",
        transition: "width .16s ease",
        minHeight: "100vh",
      }}
    >
      <BrandSwitcher collapsed={collapsed} onToggleCollapse={toggle} />

      {/* Search — opens the ⌘K palette */}
      <button
        type="button"
        className="nav-row"
        onClick={() => window.dispatchEvent(new CustomEvent("answr:cmdk"))}
        title={collapsed ? "Search  ⌘K" : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : "9px",
          justifyContent: collapsed ? "center" : "flex-start",
          width: collapsed ? "34px" : "100%",
          height: collapsed ? "32px" : undefined,
          padding: collapsed ? 0 : "6px 9px",
          margin: collapsed ? "8px 0 0" : "10px 0 0",
          borderRadius: collapsed ? "7px" : "6px",
          border: "none",
          background: "transparent",
          color: "var(--fnt)",
          fontSize: "12.5px",
          fontFamily: "inherit",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <NavIcon name="search" size={collapsed ? 15 : 14} />
        {!collapsed && (
          <>
            Search
            <span style={{ marginLeft: "auto", fontSize: "10.5px", border: "1px solid var(--brd)", borderRadius: "4px", padding: "1px 5px" }}>⌘K</span>
          </>
        )}
      </button>

      {GROUPS.map((g) => (
        <div key={g.title} style={{ width: "100%" }}>
          {collapsed ? (
            <div style={{ width: "20px", height: "1px", background: "var(--brd)", margin: "13px auto 9px" }} />
          ) : (
            <div
              style={{
                fontSize: "10.5px",
                fontWeight: 500,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                color: "var(--fnt)",
                padding: "17px 8px 7px",
              }}
            >
              {g.title}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: collapsed ? "2px" : "1px", alignItems: collapsed ? "center" : "stretch" }}>
            {g.items.map((it) => {
              const active = isActive(pathname, it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className="nav-row"
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? it.label : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: collapsed ? 0 : "9px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    position: "relative",
                    width: collapsed ? "34px" : "100%",
                    height: collapsed ? "32px" : undefined,
                    padding: collapsed ? 0 : "6px 9px",
                    borderRadius: collapsed ? "7px" : "6px",
                    fontSize: "13px",
                    color: active ? "var(--tx)" : "var(--mut)",
                    fontWeight: active ? 500 : 400,
                    background: active ? "rgba(255,255,255,0.055)" : undefined,
                    // Collapsed rail is too narrow for the accent bar; tooltip carries the label.
                    boxShadow: active && !collapsed ? "inset 2px 0 0 var(--ac)" : undefined,
                  }}
                >
                  <NavIcon name={it.icon} size={collapsed ? 15 : 14} />
                  {!collapsed && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.label}</span>}

                  {!collapsed && it.count && (
                    <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{it.count}</span>
                  )}
                  {!collapsed && it.attention !== undefined && (
                    <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--gold)" }} />
                      <span style={{ fontSize: "11px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{it.attention}</span>
                    </span>
                  )}
                  {!collapsed && it.badge === "NEW" && (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: "9.5px",
                        fontWeight: 600,
                        color: "var(--ac)",
                        background: "rgba(142,124,242,.14)",
                        borderRadius: "4px",
                        padding: "1px 5px",
                      }}
                    >
                      NEW
                    </span>
                  )}
                  {!collapsed && it.badge === "live" && (
                    <span style={{ marginLeft: "auto", width: "5px", height: "5px", borderRadius: "50%", background: "var(--good)" }} />
                  )}

                  {/* Collapsed: badges shrink to a dot; Actions keeps its amber numeral. */}
                  {collapsed && (it.badge || it.attention !== undefined) && (
                    <span
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        ...(it.attention !== undefined
                          ? { fontSize: "9px", fontWeight: 600, color: "var(--gold)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }
                          : {
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: it.badge === "live" ? "var(--good)" : "var(--ac)",
                            }),
                      }}
                    >
                      {it.attention !== undefined ? it.attention : null}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ marginTop: "auto", width: "100%", paddingTop: "14px" }}>
        <AccountMenu collapsed={collapsed} />
      </div>
    </nav>
  );
}
