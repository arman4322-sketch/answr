"use client";

import { toast } from "@/lib/toast";

/* Primary action that has no fixture-backed behavior (create/new/run flows).
   Never dead: it states honestly what would happen on a live workspace.
   Used by Topbar's action slot and by pages needing the same treatment. */

export default function DemoActionButton({
  label,
  message,
  style,
  className = "btn-ac",
}: {
  label: string;
  message: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => toast(message)}
      style={{
        fontSize: "12.5px",
        fontWeight: 500,
        borderRadius: "7px",
        padding: "6px 14px",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        ...style,
      }}
    >
      {label}
    </button>
  );
}
