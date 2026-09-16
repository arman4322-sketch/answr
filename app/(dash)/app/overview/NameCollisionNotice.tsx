import Link from "next/link";
import type { LiveMetrics } from "@/lib/live/metrics";

/* Overview — name-collision notice.

   `nameCollisions` counts answers where the brand's NAME appeared but the
   answer described a different company of that name (lib/scoring). Those
   answers are deliberately not counted as mentions, which means the KPIs above
   are smaller than a bare name match would make them. That is worth saying
   plainly once, near the numbers it explains — it is a finding about the
   corpus, not an error, so it is styled as a note rather than an alarm.

   Renders nothing when there is no collision. Every figure and every name below
   comes from the metrics object; nothing is composed or estimated. */

/** "a and b", "a, b" style join for the one or two namesakes we cite. */
function joinNames(list: string[]): string {
  return list.length === 2 ? `${list[0]} and ${list[1]}` : list[0];
}

export default function NameCollisionNotice({ m }: { m: LiveMetrics }) {
  const n = m.nameCollisions;
  if (n <= 0) return null;

  const name = m.identity?.name || m.workspace?.brand || "";
  // The conflicts are all spelled with the tracked name, so the domain is what
  // actually tells them apart. Fall back to the stored name when one has no site.
  const others = (m.identity?.conflicts ?? [])
    .map((c) => c.domain || c.name)
    .filter(Boolean)
    .slice(0, 2);

  return (
    <div
      role="note"
      style={{
        fontSize: "12px",
        lineHeight: 1.6,
        color: "var(--mut)",
        background: "var(--bg1)",
        border: "1px solid var(--brd)",
        borderLeft: "2px solid var(--gold)",
        borderRadius: "8px",
        padding: "10px 14px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        columnGap: "6px",
        rowGap: "4px",
      }}
    >
      <span style={{ color: "var(--tx)", fontWeight: 500 }}>
        {`${n} sampled answer${n === 1 ? "" : "s"} named ${name} but described a different company.`}
      </span>
      <span>
        {others.length > 0
          ? `${name} is a shared name — ${joinNames(others)} publish${others.length === 1 ? "es" : ""} under it too. Those answers are not counted as mentions of you.`
          : `Those answers are not counted as mentions of you.`}
      </span>
      <Link
        href="/app/settings/workspace#brand-identity"
        style={{ color: "var(--ac)", fontWeight: 500, whiteSpace: "nowrap" }}
      >
        Brand identity →
      </Link>
    </div>
  );
}
