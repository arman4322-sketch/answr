"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { BRANDS, SWITCH_NOTE, setSelectedBrand, useSelectedBrand, type Brand } from "@/lib/brands";
import AddBrandModal from "./AddBrandModal";

/* Sidebar brand switcher — the panel canvas frame 06a depicted but never wired.
   The "Answr · Nike" line is the trigger; the panel lists every tracked brand
   with its visibility stat, ticks the selected one, and ends with "+ Add a
   brand" and "View all assets →".

   The panel is position:fixed and anchored to the trigger's rect because the
   sidebar scrolls (overflow-y:auto), which would clip a 290px absolutely
   positioned child inside a 236px rail.

   Honesty: the demo ships one brand's fixtures, so picking another keeps the
   selection in the UI and says plainly that the rest are read-only. */

const PANEL_W = 290;

export default function BrandSwitcher({
  collapsed = false,
  onToggleCollapse,
}: {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
} = {}) {
  const router = useRouter();
  const brand = useSelectedBrand();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [trigHover, setTrigHover] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

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

  function choose(b: Brand) {
    setSelectedBrand(b.id);
    setOpen(false);
    toast(SWITCH_NOTE);
  }

  /* Row background: selection wins, then hover, then nothing. Done in React
     rather than CSS because inline styles would beat any :hover rule anyway. */
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

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", width: "100%" }}>
        <button
          ref={btnRef}
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Workspace brand: ${brand.name}. Switch brand`}
          title={collapsed ? `${brand.name} — switch brand` : undefined}
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
          {!collapsed && (
            <>
              <span style={{ minWidth: 0, lineHeight: 1.25 }}>
                <span style={{ display: "block", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {brand.name}
                </span>
                <span style={{ display: "block", fontSize: "10.5px", color: "var(--fnt)", whiteSpace: "nowrap" }}>Answr workspace</span>
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
            aria-label="Switch brand"
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
              {"SWITCH BRAND"}
            </div>

            {BRANDS.map((b) => {
              const selected = b.id === brand.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => choose(b)}
                  {...rowProps(b.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    padding: "7px 8px",
                    borderRadius: "7px",
                    width: "100%",
                    background: rowBg(b.id, selected),
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      background: b.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#fff",
                      flex: "none",
                    }}
                  >
                    {b.initial}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: "12.5px", fontWeight: selected ? 600 : 500, color: selected ? "var(--tx)" : "var(--mut)" }}>
                      {b.name}
                    </span>
                    <span style={{ display: "block", fontSize: "10px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>
                      {`${b.domain} · ${b.visibility} visibility`}
                    </span>
                  </span>
                  {selected && (
                    <span style={{ marginLeft: "auto", color: "var(--ac)", fontWeight: 700, fontSize: "12px", flex: "none" }}>{"✓"}</span>
                  )}
                </button>
              );
            })}

            <div style={{ height: "1px", background: "var(--brd)", margin: "6px 4px" }} />

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setAddOpen(true);
              }}
              {...rowProps("add")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding: "7px 8px",
                borderRadius: "7px",
                width: "100%",
                color: "var(--ac)",
                fontSize: "12.5px",
                fontWeight: 500,
                background: hover === "add" ? "rgba(255,255,255,0.04)" : "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "6px",
                  border: "1px dashed color-mix(in oklab,var(--ac) 50%,transparent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                }}
              >
                {"+"}
              </span>
              {"Add a brand"}
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                router.push("/app/assets");
              }}
              {...rowProps("all")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "7px 8px",
                fontSize: "11.5px",
                color: "var(--tx)",
                fontWeight: 500,
                background: hover === "all" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
                borderRadius: "7px",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                marginTop: "2px",
              }}
            >
              <span>{"View all assets"}</span>
              <span style={{ color: "var(--fnt)" }}>{"→"}</span>
            </button>
          </div>
        </>
      )}

      <AddBrandModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
