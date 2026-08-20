"use client";

import { useEffect, useId, useRef, useState } from "react";
import { toast } from "@/lib/toast";
import { useFilters } from "@/lib/filters/context";
import {
  DEFAULT_PLATFORM,
  DEFAULT_RANGE,
  PLATFORM_LABELS,
  RANGE_LABELS,
  platformFromLabel,
  platformMeta,
  rangeFromLabel,
  rangeMeta,
} from "@/lib/filters/windows";

/* Working dropdown filter pill — the depicted "Last 30 days · vs prev ▾" /
   "All platforms ▾" controls, made real.

   Three modes:
   - `bind="range"` / `bind="platform"`: the pill IS the workspace filter. Its
     label reflects the shared FilterContext and picking an option re-slices
     every wired screen (Overview, Insights, Citations, Agents). Items default
     to the canonical option sets.
   - no `bind`: a page-local pill (categories, sort, properties…) that keeps its
     own selection state, plus the optional honest `note` toast.
   - `inert`: the screen CANNOT re-slice on this filter. Rather than render a
     control that looks applied and isn't, the pill is drawn as a plainly
     disabled chip — dimmed, `cursor:not-allowed`, `aria-disabled`, no caret,
     no menu — showing the scope the screen ACTUALLY reports (the shipped
     fixture's 30-day / all-platform sample), with a ? tooltip carrying `note`.
     It never displays the workspace selection it is not honoring, so the
     screen can no longer claim a scope it does not use (audit fix: "never
     display a scope the screen does not honor"). The workspace selection is
     untouched — it is still live when you navigate back to a wired screen. */

export default function FilterPill({
  label,
  items,
  note,
  strong = false,
  weight = 500,
  bind,
  inert = false,
}: {
  /** default/selected label, e.g. "Last 30 days · vs prev" (ignored when bound) */
  label?: string;
  items?: string[];
  /** page-local pills: toast shown when a non-default item is picked.
      inert pills: the tooltip text explaining what this screen actually shows. */
  note?: string;
  /** stronger text color (some frames render the active filter brighter) */
  strong?: boolean;
  /** match a frame that drew the pill at a different weight */
  weight?: number;
  /** wire this pill to the workspace date-range / platform filter */
  bind?: "range" | "platform";
  /** this screen does not honor the filter — render a disabled, explained chip */
  inert?: boolean;
}) {
  const [open, setOpen] = useState(false);
  /* inert pills only: the tooltip shows on hover/focus AND stays put once
     tapped, so a touch device (where hover fires and then immediately ends)
     can still read the explanation. Tapping again, Esc, or a tap elsewhere
     dismisses it. */
  const [pinned, setPinned] = useState(false);
  const filters = useFilters();
  const tipId = useId();
  const boundLabel =
    bind === "range" ? filters.window.label : bind === "platform" ? filters.platformInfo.label : null;
  const options = items ?? (bind === "range" ? RANGE_LABELS : bind === "platform" ? PLATFORM_LABELS : []);
  const [local, setLocal] = useState(label ?? options[0] ?? "");
  const selected = boundLabel ?? local;
  /** the "nothing filtered" option — picking it never toasts */
  const defaultLabel = bind ? options[0] : label ?? options[0];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setPinned(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setPinned(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const pill: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: weight,
    color: strong ? "var(--tx)" : "var(--mut)",
    background: "rgba(255,255,255,0.045)",
    borderRadius: "7px",
    padding: "6px 12px",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    fontVariantNumeric: "tabular-nums",
  };

  /* ── inert: a disabled chip stating the scope this screen really reports ── */
  if (inert) {
    /* the FIXED scope of this screen, never the workspace selection */
    const fixed =
      bind === "range"
        ? rangeMeta(DEFAULT_RANGE).label
        : bind === "platform"
          ? platformMeta(DEFAULT_PLATFORM).label
          : label ?? options[0] ?? "";

    return (
      <div ref={ref} style={{ position: "relative" }}>
        <button
          type="button"
          aria-disabled="true"
          aria-describedby={note ? tipId : undefined}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(pinned)}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setOpen(false);
            setPinned(false);
          }}
          onClick={(e) => {
            /* nothing to apply — tapping only reveals the explanation, and
               pins it so a touch tap does not open-and-close in one gesture */
            e.preventDefault();
            const next = !pinned;
            setPinned(next);
            setOpen(next);
          }}
          style={{
            ...pill,
            cursor: "not-allowed",
            opacity: 0.55,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {fixed}
          <span
            aria-hidden="true"
            style={{
              width: "12px",
              height: "12px",
              flex: "none",
              borderRadius: "50%",
              border: "1px solid var(--brd)",
              color: "var(--fnt)",
              fontSize: "8px",
              fontWeight: 600,
              lineHeight: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ?
          </span>
        </button>
        {open && note && (
          <span
            role="tooltip"
            id={tipId}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              width: "max-content",
              maxWidth: "260px",
              background: "var(--bg2)",
              border: "1px solid var(--brd)",
              borderRadius: "9px",
              boxShadow: "0 18px 48px rgba(0,0,0,.55)",
              padding: "9px 11px",
              zIndex: 50,
              fontSize: "11.5px",
              fontWeight: 400,
              lineHeight: 1.45,
              color: "var(--tx)",
              whiteSpace: "normal",
              textAlign: "left",
              pointerEvents: "none",
            }}
          >
            {note}
          </span>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={pill}
      >
        {selected} ▾
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: "200px",
            background: "var(--bg2)",
            border: "1px solid var(--brd)",
            borderRadius: "9px",
            boxShadow: "0 18px 48px rgba(0,0,0,.55)",
            padding: "5px",
            zIndex: 50,
          }}
        >
          {options.map((it) => (
            <button
              key={it}
              type="button"
              role="menuitemradio"
              aria-checked={selected === it}
              className="dd-item"
              onClick={() => {
                if (bind === "range") {
                  const id = rangeFromLabel(it);
                  if (id) filters.setRange(id);
                } else if (bind === "platform") {
                  const id = platformFromLabel(it);
                  if (id) filters.setPlatform(id);
                } else {
                  setLocal(it);
                }
                setOpen(false);
                if (note && it !== defaultLabel) toast(note);
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
