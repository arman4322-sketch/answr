import Link from "next/link";

/* Honest states for the Settings cluster.

   Settings used to be the last place fixtures lived: a hard-coded display
   name, invented alias chips, competitors with invented domains and "Added"
   dates, saved alert rules, a team roster and an invoice history — none of it
   backed by anything the deployment actually stores.

   Every settings screen now reads the configured workspace (lib/workspace) and
   the live metrics layer (lib/live/metrics). Where a control genuinely has no
   backing store yet — aliases, alert rules, seats, keys, invoices — the screen
   says so with one of the states below instead of printing a plausible-looking
   example. The card chrome matches the rest of the cluster, so the layout is
   unchanged; only the honesty is new. */

const panel: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "22px 24px",
};

const titleStyle: React.CSSProperties = { fontSize: "14.5px", fontWeight: 600 };
const bodyStyle: React.CSSProperties = {
  fontSize: "12.5px",
  color: "var(--mut)",
  lineHeight: 1.6,
  marginTop: "6px",
  maxWidth: "72ch",
};
const linkStyle: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 500,
  color: "var(--ac)",
  marginTop: "13px",
  display: "inline-block",
};

/** No workspace configured — the screen has no brand to describe. */
export function NoBrandPanel({ what }: { what: string }) {
  return (
    <div style={panel}>
      <div style={titleStyle}>No brand configured</div>
      <div style={bodyStyle}>
        {what} Name the brand, its domain and the competitors to track, and this screen fills in with your own
        workspace — never an example one.
      </div>
      <Link href="/onboarding/brand" style={linkStyle}>
        Set up your brand →
      </Link>
    </div>
  );
}

/** A card section with nothing stored behind it yet. */
export function EmptyState({ line, note }: { line: string; note?: string }) {
  return (
    <div
      style={{
        padding: "18px 16px",
        border: "1px dashed var(--brd)",
        borderRadius: "8px",
        background: "var(--bg0)",
      }}
    >
      <div style={{ fontSize: "12.5px", color: "var(--mut)" }}>{line}</div>
      {note && <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "5px", lineHeight: 1.55 }}>{note}</div>}
    </div>
  );
}

/** Filename-safe slug for exports and URLs — derived, never hard-coded. */
export function slugify(name: string | undefined | null): string {
  return (name ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** The brand label every settings topbar shows in its crumb. */
export function brandLabel(brand: string | undefined | null): string {
  return brand?.trim() || "Your brand";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Mar 12, 2026" in UTC — stable between server render and hydration. */
export function fmtDayUTC(ts: number | null | undefined): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
