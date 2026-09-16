"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { brandSubtitle, UNCONFIGURED_GRADIENT, type BrandIdentity } from "@/lib/brands";

/* Sidebar workspace row — the panel canvas frame 06a depicted, wired to the one
   workspace this deployment actually tracks.

   There is no brand list any more, because there is no multi-brand product: a
   deployment has exactly one configured workspace (lib/workspace.ts) and every
   dashboard reads it. The trigger shows that brand and its domain; the panel
   shows it in full and points at the two places it can be changed. With nothing
   configured the row says so plainly and links to onboarding — it never invents
   a brand to fill the space.

   `brand` comes from the dashboard layout (a server component that already
   loads the live layer), so this component holds no data of its own.

   The panel is position:fixed and anchored to the trigger's rect because the
   sidebar scrolls (overflow-y:auto), which would clip a 290px absolutely
   positioned child inside a 236px rail. */

const PANEL_W = 290;

export default function BrandSwitcher({
  brand = null,
  collapsed = false,
  onToggleCollapse,
}: {
  brand?: BrandIdentity | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
} = {}) {
  const router = useRouter();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [trigHover, setTrigHover] = useState(false);

  const name = brand?.name ?? "No brand configured";
  /* The rail is 232px, so the trigger's second line is the domain alone — the
     full "domain · category" belongs in the panel, where it fits. */
  const subtitle = brand ? brand.domain || brand.category || "Answr workspace" : "Set up your brand";

  // One menu at a time — opening the account menu closes this one.
  useEffect(() => {
    const onOther = () => setOpen(false);
    window.addEventListener("answr:account-menu-open", onOther);
    return () => window.removeEventListener("answr:account-menu-open", onOther);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    const r = btnRef.current?.getBoundingClientRect();
    if (r) {
      setPos({
        top: Math.round(r.bottom + 6),
        left: Math.round(Math.min(r.left, window.innerWidth - PANEL_W - 12)),
      });
    }
    window.dispatchEvent(new CustomEvent("answr:brand-menu-open"));
    setHover(null);
    setOpen(true);
  }

  /* Row background: the current workspace reads as selected, then hover, then
     nothing. Done in React rather than CSS because inline styles would beat any
     :hover rule anyway. */
  function rowBg(id: string, selected: boolean) {
    if (selected) return "rgba(142,124,242,0.12)";
    return hover === id ? "rgba(255,255,255,0.04)" : "transparent";
  }

  const rowProps = (id: string) => ({
    onMouseEnter: () => setHover(id),
    onMouseLeave: () => setHover((h) => (h === id ? null : h)),
    onFocus: () => setHover(id),
    onBlur: () => setHover((h) => (h === id ? null : h)),
  });

  const linkRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "7px 8px",
    fontSize: "11.5px",
    color: "var(--tx)",
    fontWeight: 500,
    borderRadius: "7px",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "left",
    textDecoration: "none",
    marginTop: "2px",
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", width: "100%" }}>
        <button
          ref={btnRef}
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={brand ? `Workspace brand: ${brand.name}. Open workspace menu` : "No brand configured. Open workspace menu"}
          title={collapsed ? (brand ? `${brand.name} — workspace` : "No brand configured") : undefined}
          onMouseEnter={() => setTrigHover(true)}
          onMouseLeave={() => setTrigHover(false)}
          onFocus={() => setTrigHover(true)}
          onBlur={() => setTrigHover(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: collapsed ? 0 : "9px",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? 0 : "6px 8px",
            width: collapsed ? "34px" : "100%",
            height: collapsed ? "32px" : undefined,
            borderRadius: "7px",
            color: "var(--tx)",
            background: open ? "rgba(255,255,255,0.05)" : trigHover ? "rgba(255,255,255,0.035)" : "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left",
            minWidth: 0,
          }}
        >
          <span
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "6px",
              background: brand ? brand.gradient : UNCONFIGURED_GRADIENT,
              border: brand ? undefined : "1px dashed var(--brd)",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 700,
              color: brand ? "#fff" : "var(--fnt)",
              flex: "none",
            }}
          >
            {brand ? brand.initial : "?"}
          </span>
          {!collapsed && (
            <>
              <span style={{ minWidth: 0, lineHeight: 1.25 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: brand ? "var(--tx)" : "var(--mut)",
                  }}
                >
                  {name}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "10.5px",
                    color: "var(--fnt)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {subtitle}
                </span>
              </span>
              <span style={{ marginLeft: "auto", color: "var(--fnt)", fontSize: "11px", flex: "none" }}>⇅</span>
            </>
          )}
        </button>
        {!collapsed && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            title="Collapse sidebar  ⌘\\"
            className="nav-row"
            style={{
              flex: "none",
              width: "22px",
              height: "22px",
              borderRadius: "6px",
              border: "none",
              background: "transparent",
              color: "var(--fnt)",
              cursor: "pointer",
              fontSize: "11px",
              fontFamily: "inherit",
              lineHeight: 1,
            }}
          >
            «
          </button>
        )}
      </div>
      {collapsed && onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          title="Expand sidebar  ⌘\\"
          className="nav-row"
          style={{
            width: "34px",
            height: "26px",
            marginTop: "6px",
            borderRadius: "7px",
            border: "none",
            background: "transparent",
            color: "var(--fnt)",
            cursor: "pointer",
            fontSize: "11px",
            fontFamily: "inherit",
          }}
        >
          »
        </button>
      )}

      {open && pos && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 50 }} />
          <div
            role="menu"
            aria-label="Workspace"
            style={{
              position: "fixed",
              top: `${pos.top}px`,
              left: `${pos.left}px`,
              width: `${PANEL_W}px`,
              zIndex: 51,
              background: "var(--bg1)",
              border: "1px solid var(--brd)",
              borderRadius: "12px",
              boxShadow: "0 30px 80px rgba(0,0,0,.6)",
              padding: "6px",
            }}
          >
            <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--fnt)", letterSpacing: ".08em", padding: "6px 8px 4px" }}>
              {"WORKSPACE"}
            </div>

            {brand ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  padding: "7px 8px",
                  borderRadius: "7px",
                  width: "100%",
                  background: rowBg("brand", true),
                }}
              >
                <span
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "6px",
                    background: brand.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#fff",
                    flex: "none",
                  }}
                >
                  {brand.initial}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "var(--tx)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {brand.name}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "10px",
                      color: "var(--fnt)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {brandSubtitle(brand) || "Tracked brand"}
                  </span>
                </span>
                <span style={{ marginLeft: "auto", color: "var(--ac)", fontWeight: 700, fontSize: "12px", flex: "none" }}>{"✓"}</span>
              </div>
            ) : (
              <div style={{ padding: "4px 8px 8px", fontSize: "11.5px", color: "var(--mut)", lineHeight: 1.5 }}>
                {"No brand is configured yet, so nothing is being sampled. Answr tracks one brand per deployment — name it and the first scan follows."}
              </div>
            )}

            {brand && (
              <div style={{ fontSize: "10.5px", color: "var(--fnt)", lineHeight: 1.5, padding: "8px 8px 2px" }}>
                {"This deployment tracks a single brand — change it in brand settings."}
              </div>
            )}

            <div style={{ height: "1px", background: "var(--brd)", margin: "6px 4px" }} />

            <Link
              href={brand ? "/app/settings" : "/onboarding/brand"}
              role="menuitem"
              onClick={() => setOpen(false)}
              {...rowProps("settings")}
              style={{
                ...linkRow,
                color: "var(--ac)",
                fontSize: "12.5px",
                background: hover === "settings" ? "rgba(255,255,255,0.04)" : "transparent",
              }}
            >
              <span>{brand ? "Brand settings" : "Set up your brand"}</span>
              <span style={{ color: "var(--fnt)" }}>{"→"}</span>
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                router.push("/app/assets");
              }}
              {...rowProps("all")}
              style={{
                ...linkRow,
                background: hover === "all" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
              }}
            >
              <span>{"View all assets"}</span>
              <span style={{ color: "var(--fnt)" }}>{"→"}</span>
            </button>
          </div>
        </>
      )}
    </>
  );
}
