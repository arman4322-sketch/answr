"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/* Honest sample-data banner. The dashboards run on an illustrative demo
   workspace; the real per-brand numbers live in the Live Scan. This slim,
   dismissible strip states that plainly and routes to the real surface.
   Hidden on the screens that are already real (/app/scan, /app/live). */

const KEY = "answr:sampleBannerDismissed";
const HIDE_ON = ["/app/scan", "/app/live"];

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

  if (dismissed || HIDE_ON.some((p) => pathname?.startsWith(p))) return null;

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
        Sample workspace — the figures here are illustrative demo data.
      </span>
      <Link href="/app/scan" style={{ color: "var(--ac)", fontWeight: 600, textDecoration: "none" }}>
        Run a Live Scan for real numbers on your brand →
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
