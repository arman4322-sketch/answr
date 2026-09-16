import Link from "next/link";

/* Honest-unavailable panel for the Demand cluster (watchlists + keyword detail).

   Demand answers "how many people ask AI this a month". That figure needs a
   keyword search-volume pipeline — DataForSEO Keywords Data — and the nightly
   sampler does not run one. The connected answer providers return answers to
   the workspace's own tracked prompts; they do not report how often anyone
   else asks a term. So both screens say what is missing rather than printing a
   volume, a delta, an intent label or a demographic split that would be made
   up.

   Card chrome matches the rest of the dashboard (bg1 / brd / radius 10). */

const panel: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "22px 24px",
};

const title: React.CSSProperties = { fontSize: "14.5px", fontWeight: 600 };
const body: React.CSSProperties = {
  fontSize: "12.5px",
  color: "var(--mut)",
  lineHeight: 1.55,
  marginTop: "6px",
  maxWidth: "72ch",
};
const label: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color: "var(--fnt)",
};
const item: React.CSSProperties = {
  fontSize: "12.5px",
  color: "var(--mut)",
  lineHeight: 1.55,
  marginTop: "6px",
  maxWidth: "72ch",
};
const link: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 500,
  color: "var(--ac)",
  textDecoration: "none",
};

export default function NotAvailable({
  title: heading,
  affected,
}: {
  /** "<Feature> isn't collecting data yet" */
  title: string;
  /** the figures this screen would have shown, so nothing looks merely missing */
  affected: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={panel}>
        <div style={title}>{heading}</div>
        <div style={body}>
          This needs a keyword search-volume pipeline (DataForSEO Keywords Data), which the nightly sampler doesn&rsquo;t
          run yet. No estimated figures are shown.
        </div>
      </div>

      <div style={panel}>
        <div style={label}>What this screen would require</div>
        <div style={item}>
          A DataForSEO Keywords Data subscription and key, plus a sampler job that fetches and stores monthly volume per
          keyword.
        </div>
        <div style={item}>{affected}</div>
        <div style={item}>
          The answer providers this workspace is connected to return answers to your own tracked prompts. They do not
          report how often anyone else asks a term, so no volume can be derived from them.
        </div>
      </div>

      <div style={panel}>
        <div style={label}>Live today</div>
        <div style={item}>
          The prompts this workspace actually tracks, and how the assistants answer them, are on{" "}
          <Link href="/app/prompts" style={link}>
            Prompts
          </Link>{" "}
          and{" "}
          <Link href="/app/overview" style={link}>
            Overview
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
