"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BrandIdentity } from "@/lib/brand/identity";
import type { EntityReport } from "@/lib/live/entity";

/* "Re-check brand identity" — the one interactive control on this screen.

   POSTs to /api/brand/resolve (cookie-authed, no body). That route re-reads the
   website, searches the live web for anything else of the same name, saves the
   new profile and then re-judges every answer already collected against it.
   Several provider round-trips, so it is slow: the pending line says a minute
   rather than pretending the call is instant.

   Everything reported afterwards is read out of the response — the conflicts
   the route resolved, the verdicts it discarded, the answers it re-checked.
   Nothing here is estimated, and a failure prints the server's own `error`
   string instead of a generic one. On success router.refresh() re-renders the
   card above, so the profile shown is the one that was just saved. */

interface ResolveResponse {
  ok: boolean;
  error?: string;
  identity?: BrandIdentity;
  discardedVerdicts?: number;
  verification?: EntityReport;
}

/** Why runEntityVerification did nothing, in the operator's language. */
const NOT_RUN: Record<string, string> = {
  "no-workspace": "No workspace is configured, so nothing was re-judged.",
  "no-provider": "No model key is configured, so the answers already collected could not be re-judged.",
  "not-ambiguous": "Nothing else uses this name, so no answer needed re-judging.",
  "no-answers": "No answers have been collected yet, so there was nothing to re-judge.",
};

const plural = (n: number) => (n === 1 ? "" : "s");

/** Turn the route's response into plain lines. Every number comes from `data`. */
function summarize(data: ResolveResponse, identity: BrandIdentity): string[] {
  const out: string[] = [];
  const found = identity.conflicts.length;

  out.push(
    found === 0
      ? `Nothing else was found using the name “${identity.name}” — every mention of it counts as you.`
      : `${found} other compan${found === 1 ? "y" : "ies"} found using the name “${identity.name}”.`,
  );

  const discarded = data.discardedVerdicts;
  if (typeof discarded === "number") {
    out.push(
      discarded === 0
        ? "No earlier verdicts had to be discarded."
        : `${discarded} earlier verdict${plural(discarded)} discarded — they judged the previous profile.`,
    );
  }

  const v = data.verification;
  if (v) {
    if (!v.ok) {
      out.push(NOT_RUN[v.reason ?? ""] ?? "The collected answers were not re-judged.");
    } else {
      out.push(
        `${v.verified} answer${plural(v.verified)} re-checked against the new profile — ` +
          `${v.rejected} described a different company.`,
      );
    }
  }

  return out;
}

export default function RecheckIdentityButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [lines, setLines] = useState<string[] | null>(null);
  const [failed, setFailed] = useState(false);

  async function run() {
    setPending(true);
    setLines(null);
    setFailed(false);
    try {
      const res = await fetch("/api/brand/resolve", { method: "POST" });
      const data = (await res.json()) as ResolveResponse;
      if (!data.ok || !data.identity) {
        setFailed(true);
        setLines([data.error ?? `The re-check did not complete (HTTP ${res.status}).`]);
        return;
      }
      setLines(summarize(data, data.identity));
      // The card above is server-rendered from the saved workspace; pull it again.
      router.refresh();
    } catch (err) {
      setFailed(true);
      setLines([err instanceof Error ? err.message : "The request did not complete."]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ marginTop: "14px" }}>
      <button
        type="button"
        onClick={run}
        disabled={pending}
        style={{
          fontSize: "12.5px",
          fontWeight: 500,
          border: "1px solid var(--brd)",
          borderRadius: "7px",
          padding: "7px 14px",
          background: "var(--bg2)",
          color: "var(--tx)",
          cursor: pending ? "default" : "pointer",
          fontFamily: "inherit",
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? "Re-checking…" : "Re-check brand identity"}
      </button>

      <div role="status" aria-live="polite" style={{ marginTop: pending || lines ? "9px" : 0 }}>
        {pending && (
          <div style={{ fontSize: "11.5px", color: "var(--mut)", lineHeight: 1.6, maxWidth: "62ch" }}>
            Reading your site and searching for name collisions — this takes a minute. Every answer already collected is
            then re-judged against the new profile, so leave this screen open.
          </div>
        )}

        {!pending && lines && (
          <div style={{ fontSize: "11.5px", lineHeight: 1.6, maxWidth: "62ch" }}>
            <div style={{ fontWeight: 600, color: failed ? "var(--bad)" : "var(--tx)" }}>
              {failed ? "Re-check failed" : "Re-check finished"}
            </div>
            <div style={{ color: "var(--mut)", marginTop: "3px", display: "flex", flexDirection: "column", gap: "2px" }}>
              {lines.map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
