"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

/* The one interactive control on Regions and Audiences: it POSTs to
   /api/segments/run and refreshes the server components so every figure on the
   screen is re-read from the store.

   A sampling pass is prompts × segments × lanes of real provider calls, so it
   takes minutes. The button says so before it starts and keeps a text status
   (not a colour) while it runs. Nothing here invents a figure: the completion
   line repeats the counts the API's own report returns. */

type Kind = "region" | "audience";
type Action = "sample" | "suggest";

interface Report {
  runs?: number;
  answers?: number;
  errors?: number;
}

export default function SegmentPassButton({
  kind,
  action,
  label,
  busyLabel,
  hint,
  primary = false,
  promptLimit,
}: {
  kind: Kind;
  action: Action;
  label: string;
  /** what the button says while the request is in flight */
  busyLabel: string;
  /** the honest warning shown beside the button before it is pressed */
  hint?: string;
  primary?: boolean;
  promptLimit?: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setStatus(
      action === "suggest"
        ? "Asking the model for buyer segments…"
        : "Sampling. This runs every tracked prompt against every lane for every segment and can take several minutes — leave this tab open.",
    );
    try {
      const res = await fetch("/api/segments/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind,
          action,
          ...(action === "sample" && promptLimit ? { promptLimit } : {}),
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        report?: Report;
        audiences?: unknown[];
      };

      if (!data.ok) {
        const msg = data.error ?? "The request could not be completed.";
        setStatus(`Did not run: ${msg}`);
        toast(msg);
        return;
      }

      const done =
        action === "suggest"
          ? `${data.audiences?.length ?? 0} audiences saved. Run a pass to measure them.`
          : `Pass finished — ${data.report?.answers ?? 0} answers stored from ${data.report?.runs ?? 0} runs` +
            (data.report?.errors ? `, ${data.report.errors} lane errors` : "") +
            ".";
      setStatus(done);
      toast(done);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "the request failed";
      setStatus(`Did not run: ${msg}`);
      toast(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={run}
          disabled={busy}
          aria-busy={busy}
          className={primary && !busy ? "btn-ac" : undefined}
          style={{
            fontSize: "12.5px",
            fontWeight: 500,
            borderRadius: "7px",
            padding: "8px 16px",
            fontFamily: "inherit",
            cursor: busy ? "default" : "pointer",
            border: primary && !busy ? "none" : "1px solid var(--brd)",
            background: primary && !busy ? undefined : "var(--bg2)",
            color: primary && !busy ? undefined : "var(--tx)",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? busyLabel : label}
        </button>
        {hint && !busy && (
          <span style={{ fontSize: "11.5px", color: "var(--fnt)" }}>{hint}</span>
        )}
      </div>
      <p
        role="status"
        aria-live="polite"
        style={{
          margin: 0,
          fontSize: "11.5px",
          lineHeight: 1.55,
          color: "var(--mut)",
          minHeight: status ? undefined : 0,
        }}
      >
        {status}
      </p>
    </div>
  );
}
