"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelectedBrand } from "@/lib/brands";
import { toast } from "@/lib/toast";

/* Account row + menu — NAVIGATION.md: the bottom row absorbs Settings, so there
   is no standalone Settings nav item. Menu contents per spec: the user's email
   (non-interactive), Brand settings (showing the current brand as its value),
   Workspace & members, Plan & billing, Notifications, Log out. */

const PANEL_W = 236;

const USER = { name: "Dana Okafor", email: "dana@nike.com", initials: "DO" };

export default function AccountMenu({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();
  const brand = useSelectedBrand();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [trigHover, setTrigHover] = useState(false);

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

  // One menu at a time — opening this closes the brand menu and vice versa.
  useEffect(() => {
    const onOther = () => setOpen(false);
    window.addEventListener("answr:brand-menu-open", onOther);
    return () => window.removeEventListener("answr:brand-menu-open", onOther);
  }, []);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    window.dispatchEvent(new CustomEvent("answr:account-menu-open"));
    const r = btnRef.current?.getBoundingClientRect();
    if (r) {
      // Menu opens upward: the row sits at the bottom of the rail.
      setPos({ top: Math.round(r.top - 8), left: Math.round(Math.min(r.left, window.innerWidth - PANEL_W - 12)) });
    }
    setHover(null);
    setOpen(true);
  }

  const ITEMS: { key: string; label: string; value?: string; href?: string; onClick?: () => void }[] = [
    { key: "brand", label: "Brand settings", value: brand.name, href: "/app/settings" },
    { key: "workspace", label: "Workspace & members", href: "/app/settings/workspace" },
    { key: "billing", label: "Plan & billing", href: "/app/settings/billing" },
    { key: "notifications", label: "Notifications", href: "/app/settings/alerts" },
    {
      key: "logout",
      label: "Log out",
      onClick: async () => {
        // Clear the gate cookie server-side, then hard-navigate so the proxy
        // re-evaluates on the next request.
        await fetch("/api/session", { method: "DELETE" }).catch(() => {});
        window.location.assign("/login");
      },
    },
  ];

  const rowStyle = (key: string): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "7px 10px",
    borderRadius: "6px",
    border: "none",
    background: hover === key ? "rgba(255,255,255,0.04)" : "transparent",
    color: key === "logout" ? "var(--mut)" : "var(--tx)",
    fontSize: "12.5px",
    fontFamily: "inherit",
    cursor: "pointer",
    textAlign: "left",
  });

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account: ${USER.name}. Open account menu`}
        title={collapsed ? USER.name : undefined}
        onMouseEnter={() => setTrigHover(true)}
        onMouseLeave={() => setTrigHover(false)}
        onFocus={() => setTrigHover(true)}
        onBlur={() => setTrigHover(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : "9px",
          justifyContent: collapsed ? "center" : "flex-start",
          width: collapsed ? "34px" : "100%",
          height: collapsed ? "32px" : undefined,
          padding: collapsed ? 0 : "6px 8px",
          margin: collapsed ? "0 auto" : undefined,
          borderRadius: "7px",
          border: "none",
          background: open ? "rgba(255,255,255,0.05)" : trigHover ? "rgba(255,255,255,0.035)" : "transparent",
          color: "var(--tx)",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left",
          minWidth: 0,
        }}
      >
        <span
          style={{
            width: "22px",
            height: "22px",
            flex: "none",
            borderRadius: "50%",
            background: "linear-gradient(135deg,#3e4046,#26272b)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "9px",
            fontWeight: 600,
            color: "var(--mut)",
          }}
        >
          {USER.initials}
        </span>
        {!collapsed && (
          <>
            <span style={{ fontSize: "12.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{USER.name}</span>
            <span style={{ marginLeft: "auto", color: "var(--fnt)", fontSize: "10px", flex: "none" }}>{open ? "▾" : "▴"}</span>
          </>
        )}
      </button>

      {open && pos && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 50 }} />
          <div
            role="menu"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              transform: "translateY(-100%)",
              width: `${PANEL_W}px`,
              background: "var(--bg2)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "9px",
              boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
              padding: "6px",
              zIndex: 51,
            }}
          >
            <div style={{ padding: "7px 10px 9px", borderBottom: "1px solid var(--brd)", marginBottom: "5px" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 500 }}>{USER.name}</div>
              <div style={{ fontSize: "11px", color: "var(--fnt)", marginTop: "1px" }}>{USER.email}</div>
            </div>
            {ITEMS.map((it) =>
              it.href ? (
                <Link
                  key={it.key}
                  href={it.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  onMouseEnter={() => setHover(it.key)}
                  onMouseLeave={() => setHover(null)}
                  style={rowStyle(it.key)}
                >
                  {it.label}
                  {it.value && <span style={{ marginLeft: "auto", fontSize: "11.5px", color: "var(--fnt)" }}>{it.value}</span>}
                </Link>
              ) : (
                <button
                  key={it.key}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    it.onClick?.();
                  }}
                  onMouseEnter={() => setHover(it.key)}
                  onMouseLeave={() => setHover(null)}
                  style={rowStyle(it.key)}
                >
                  {it.label}
                </button>
              ),
            )}
          </div>
        </>
      )}
    </>
  );
}
