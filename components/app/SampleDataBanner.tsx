"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/* Honest sample-data banner — shown ONLY on the screens that have not yet been
   converted to the live metrics engine (lib/live/metrics).

   Overview, Citations, Prompts, Agents, Live Scan and Live Telemetry now read
   real sampled data, so the banner must not appear there. This is an allow-list
   (not a hide-list) so the banner disappears by itself as each remaining screen
   is converted — it can never outlive the fixtures it describes. */

const KEY = "answr:sampleBannerDismissed";
/* Screens still backed by lib/data fixtures. Remove entries as they go live. */
const SHOW_ON = [
  "/app/insights",
  "/app/conversations",
  "/app/demand",
  "/app/actions",
];

export default function SampleDataBanner() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true); // default hidden until mount check

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed || !SHOW_ON.some((p) => pathname?.startsWith(p))) return null;

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "7px 16px", fontSize: "12px", lineHeight: 1.4,
        background: "color-mix(in oklab, var(--ac) 12%, var(--bg1))",
        borderBottom: "1px solid var(--brd)", color: "var(--tx)",
      }}
    >
      <span style={{ color: "var(--ac)", fontWeight: 700 }}>◆</span>
      <span style={{ color: "var(--mut)" }}>
        This screen is not on live data yet — the figures below are illustrative.
      </span>
      <Link href="/app/overview" style={{ color: "var(--ac)", fontWeight: 600, textDecoration: "none" }}>
        Overview, Citations, Prompts &amp; Agents are live →
      </Link>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          try { localStorage.setItem(KEY, "1"); } catch {}
          setDismissed(true);
        }}
        style={{ marginLeft: "auto", background: "transparent", border: "none", color: "var(--fnt)", cursor: "pointer", fontSize: "13px", lineHeight: 1, fontFamily: "inherit", padding: "2px 4px" }}
      >
        ✕
      </button>
    </div>
  );
}
