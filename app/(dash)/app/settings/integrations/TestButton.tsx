"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";
import type { ProviderId } from "@/lib/providers/types";

/* "Test connection" — makes one real provider call via /api/integrations/test.
   Enabled only when the provider is configured; otherwise it's a disabled hint. */
export default function TestButton({ provider, configured }: { provider: ProviderId; configured: boolean }) {
  const [state, setState] = useState<"idle" | "testing">("idle");

  async function run() {
    setState("testing");
    try {
      const res = await fetch("/api/integrations/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = (await res.json()) as { ok: boolean; model?: string; citations?: number; error?: string };
      if (data.ok) {
        toast(`✓ ${provider} responded — model ${data.model}, ${data.citations} citation${data.citations === 1 ? "" : "s"}.`);
      } else {
        toast(`${provider}: ${data.error ?? "test failed"}`);
      }
    } catch (err) {
      toast(`${provider}: ${err instanceof Error ? err.message : "request failed"}`);
    } finally {
      setState("idle");
    }
  }

  if (!configured) {
    return (
      <span style={{ fontSize: "11.5px", color: "var(--fnt)" }}>Add the key to enable testing</span>
    );
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={state === "testing"}
      style={{
        fontSize: "12px",
        fontWeight: 500,
        border: "1px solid var(--brd)",
        borderRadius: "7px",
        padding: "6px 13px",
        background: "var(--bg2)",
        color: "var(--tx)",
        cursor: state === "testing" ? "default" : "pointer",
        fontFamily: "inherit",
        opacity: state === "testing" ? 0.6 : 1,
      }}
    >
      {state === "testing" ? "Testing…" : "Test connection"}
    </button>
  );
}
