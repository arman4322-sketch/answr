"use client";

import { toast } from "@/lib/toast";

/* Optimize-cluster helper (Actions / Demand / Workflows / Reports / Content
   score): a button whose click fires the honest-demo toast. Callers pass the
   exact inline styles of the static element it replaces — activation must not
   restyle (INTERACTIVITY_CONVENTIONS). */

export default function ToastButton({
  message,
  className,
  style,
  ariaLabel,
  children,
}: {
  /** toast copy shown on click */
  message: string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={className}
      onClick={() => toast(message)}
      style={style}
    >
      {children}
    </button>
  );
}
