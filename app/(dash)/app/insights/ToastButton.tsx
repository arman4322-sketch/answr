"use client";

import { toast } from "@/lib/toast";
import type { CSSProperties, ReactNode } from "react";

/* Small client wrapper (INTERACTIVITY_CONVENTIONS playbook 3/4): keeps the
   frame's exact styling (passed through untouched) and toasts the honest
   demo line on click. Used across the Insights cluster for "Create action",
   "Manage topics →" and "+ New segment". */

export default function ToastButton({
  message,
  className,
  style,
  children,
}: {
  message: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <button type="button" className={className} style={style} onClick={() => toast(message)}>
      {children}
    </button>
  );
}
