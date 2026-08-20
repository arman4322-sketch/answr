"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* The dashboard's single tooltip — the "explain it to a 15-year-old" layer.

   One control, one glyph. Every metric, chart, workflow step and column header
   carries the same small (i): hover or focus it and you get a short, jargon-free
   line of under ten words.

   Rendered through a PORTAL to document.body with fixed positioning. Cards in
   this app use overflow:hidden for their rounded corners, which clipped the old
   absolutely-positioned bubble (it disappeared behind the card edge). A portal
   escapes every ancestor's overflow and stacking context.

   It also flips below the dot when there isn't room above, so header-row hints
   no longer cover the topbar. */

export default function Hint({
  text,
  align = "left",
  size = 13,
}: {
  /** under 10 words, plain language */
  text: string;
  /** which edge of the bubble lines up with the dot */
  align?: "left" | "right";
  /** dot diameter in px */
  size?: number;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; below: boolean } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const WIDTH = 230;
  const GAP = 8;

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const el = btnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // Flip below when the bubble would run off the top of the viewport.
      const below = r.top < 90;
      let left = align === "right" ? r.right - WIDTH : r.left - 6;
      left = Math.max(8, Math.min(left, window.innerWidth - WIDTH - 8));
      setPos({ top: below ? r.bottom + GAP : r.top - GAP, left, below });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, align]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={text}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          border: "1px solid var(--brd)",
          background: "transparent",
          color: "var(--fnt)",
          fontSize: `${Math.max(8, size - 5)}px`,
          fontWeight: 600,
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "help",
          padding: 0,
          fontFamily: "inherit",
          flex: "none",
          verticalAlign: "middle",
        }}
      >
        i
      </button>
      {open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            role="tooltip"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              transform: pos.below ? undefined : "translateY(-100%)",
              width: `${WIDTH}px`,
              background: "var(--bg2)",
              border: "1px solid var(--brd)",
              borderRadius: "7px",
              boxShadow: "0 12px 32px rgba(0,0,0,.5)",
              padding: "7px 10px",
              zIndex: 200,
              fontSize: "11.5px",
              fontWeight: 400,
              lineHeight: 1.45,
              color: "var(--tx)",
              textTransform: "none",
              letterSpacing: "normal",
              whiteSpace: "normal",
              textAlign: "left",
              pointerEvents: "none",
            }}
          >
            {text}
          </span>,
          document.body,
        )}
    </>
  );
}
