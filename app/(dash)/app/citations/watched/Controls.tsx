/* Controls for the Watched URLs page.

   Neither control has an implementation behind it: sampled citations are
   aggregated per DOMAIN, so there is no per-URL record to watch, and the
   gap/all-sources split needs per-citation brand attribution the engine does
   not compute. Rather than look live and answer with a toast, both are rendered
   visibly disabled — dimmed, `cursor: not-allowed`, `aria-disabled` — with the
   reason on the control itself and, for the watch button, printed beside it.

   No alerting exists either, so nothing here offers to notify anyone. These are
   server components now: there is no client behaviour left to ship. */

const WATCH_REASON = "Watching a single URL isn't supported — sampled citations are tracked per domain, not per page.";
const GAP_REASON = "The all-sources view needs per-citation brand attribution, which isn't computed. Every domain in the sample is listed on the Citations screen.";

export function WatchUrlButton() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
      <span style={{ fontSize: "11px", color: "var(--fnt)" }}>{"not supported yet"}</span>
      <span
        role="button"
        aria-disabled="true"
        title={WATCH_REASON}
        style={{
          fontSize: "12px",
          fontWeight: 500,
          borderRadius: "7px",
          padding: "5px 12px",
          border: "1px solid var(--brd)",
          color: "var(--mut)",
          opacity: 0.45,
          cursor: "not-allowed",
          userSelect: "none",
        }}
      >
        {"+ Watch a URL"}
      </span>
    </span>
  );
}

export function GapViewToggle() {
  return (
    <div
      title={GAP_REASON}
      style={{ display: "inline-flex", border: "1px solid var(--brd)", borderRadius: "6px", padding: "2px", fontSize: "11px" }}
    >
      <span style={{ fontWeight: 600, background: "var(--ac)", color: "#fff", borderRadius: "4px", padding: "3px 10px" }}>{"Gap view"}</span>
      <span
        aria-disabled="true"
        style={{ color: "var(--mut)", padding: "3px 10px", opacity: 0.45, cursor: "not-allowed", userSelect: "none" }}
      >
        {"All sources"}
      </span>
    </div>
  );
}
