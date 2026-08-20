"use client";

import { toast } from "@/lib/toast";

/* "View all 214 →" in the Most cited pages card — the fixture ships only the
   first page of rows, so this toasts the honest demo line (playbook 8). */

export default function ViewAllButton() {
  return (
    <button
      type="button"
      onClick={() => toast("The demo ships the first page of fixture rows — full history lives on live workspaces.")}
      style={{fontSize:"11px",fontWeight:400,fontVariantNumeric:"tabular-nums",color:"var(--ac)",background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:"inherit"}}
    >
      {"View all 214 →"}
    </button>
  );
}
