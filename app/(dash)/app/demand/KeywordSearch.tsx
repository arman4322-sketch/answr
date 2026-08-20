"use client";

import { toast } from "@/lib/toast";

/* Keyword search box — a real input; submitting (Enter) shows the honest demo
   line, since ad-hoc searches draw from the live-workspace quota (playbook 9
   spirit: validate non-empty, then respond). Styles verbatim from the frame. */

export default function KeywordSearch() {
  return (
    <input
      type="text"
      aria-label="Search any keyword"
      placeholder="⌕ Search any keyword…"
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.currentTarget.value.trim()) {
          toast("Ad-hoc keyword searches run on live workspaces — the demo ships the fixture watchlists.");
        }
      }}
      style={{width:"380px",border:"1px solid var(--brd)",borderRadius:"8px",background:"var(--bg1)",padding:"10px 13px",fontSize:"13px",color:"var(--tx)",fontFamily:"inherit",boxSizing:"border-box"}}
    />
  );
}
