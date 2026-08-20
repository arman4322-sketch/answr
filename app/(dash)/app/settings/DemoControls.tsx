"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "@/lib/toast";

/* Cluster-local client controls (infra + settings cluster).
   INTERACTIVITY_CONVENTIONS playbook:
   - ToastButton  → playbook 3/4 (honest-demo toast, exact depicted styling kept)
   - Toggle       → playbook 5 (real visual flip + honest toast, nothing else changes)
   - CsvButton    → playbook 1 (real CSV download for non-accent-styled export buttons)
   - SelectField  → playbook 2 for select-styled dropdowns FilterPill would restyle */

export function ToastButton({
  note,
  className,
  style,
  children,
}: {
  /** honest-demo toast fired on click */
  note: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className={className} onClick={() => toast(note)} style={style}>
      {children}
    </button>
  );
}

export function Toggle({
  label,
  note,
  defaultOn = true,
  width = 28,
  height = 16,
  knob = 12,
  radius = 9,
}: {
  /** accessible name, e.g. "Toggle ChatGPT tracking" */
  label: string;
  /** honest-demo toast fired on flip */
  note: string;
  defaultOn?: boolean;
  width?: number;
  height?: number;
  knob?: number;
  radius?: number;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => {
        setOn((v) => !v);
        toast(note);
      }}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: `${radius}px`,
        background: on ? "var(--ac)" : "var(--bg2)",
        border: on ? "none" : "1px solid var(--brd)",
        position: "relative",
        display: "inline-block",
        flex: "none",
        padding: 0,
        cursor: "pointer",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "2px",
          borderRadius: "50%",
          ...(on
            ? { right: "2px", width: `${knob}px`, height: `${knob}px`, background: "#fff" }
            : { left: "2px", width: `${knob - 1}px`, height: `${knob - 1}px`, background: "var(--fnt)" }),
        }}
      />
    </button>
  );
}

export function CsvButton({
  filename,
  rows,
  className,
  style,
  children,
}: {
  /** e.g. "nike-agents-30d.csv" */
  filename: string;
  /** header row first */
  rows: string[][];
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  function download() {
    const csv = rows
      .map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replaceAll('"', '""')}"` : c)).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Downloaded ${filename} — ${rows.length - 1} rows.`);
  }

  return (
    <button type="button" className={className} onClick={download} style={style}>
      {children}
    </button>
  );
}

export function SelectField({
  defaultValue,
  items,
  note,
}: {
  defaultValue: string;
  items: string[];
  /** toast shown when a non-default item is picked (demo honesty) */
  note?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", flex: "1", minWidth: "0" }}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          textAlign: "left",
          border: "1px solid var(--brd)",
          borderRadius: "7px",
          background: "var(--bg0)",
          padding: "9px 12px",
          fontSize: "12.5px",
          color: "var(--tx)",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {selected + " "}
        <span style={{ color: "var(--fnt)", float: "right" }}>{"▾"}</span>
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            minWidth: "220px",
            background: "var(--bg2)",
            border: "1px solid var(--brd)",
            borderRadius: "9px",
            boxShadow: "0 18px 48px rgba(0,0,0,.55)",
            padding: "5px",
            zIndex: 50,
          }}
        >
          {items.map((it) => (
            <button
              key={it}
              type="button"
              role="menuitemradio"
              aria-checked={selected === it}
              className="dd-item"
              onClick={() => {
                setSelected(it);
                setOpen(false);
                if (note && it !== defaultValue) toast(note);
              }}
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                padding: "7px 10px",
                borderRadius: "6px",
                border: "none",
                background: "transparent",
                color: selected === it ? "var(--tx)" : "var(--mut)",
                fontSize: "12.5px",
                fontFamily: "inherit",
                cursor: "pointer",
                textAlign: "left",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {it}
              {selected === it && <span style={{ color: "var(--ac)", fontSize: "11px" }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
