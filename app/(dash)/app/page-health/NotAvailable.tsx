import Link from "next/link";

/* Honest-unavailable panel for Page health.

   The screen reported page-level health — render timings with web-vitals bands,
   a readiness read and a per-URL platform breakdown — for a single hard-coded
   URL. Nothing in the pipeline measures any of it: the sampler stores the
   answers assistants give to the workspace's tracked prompts, not crawls of the
   workspace's own pages. No probe fetches or renders a URL, so there is no FCP,
   LCP or TTI to report, and neither the citation corpus nor the crawler-event
   log is resolved down to one page, so the per-platform table has no source
   either.

   Card chrome matches the rest of the dashboard (bg1 / brd / radius 10). */

const panel: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "22px 24px",
};
const heading: React.CSSProperties = { fontSize: "14.5px", fontWeight: 600 };
const body: React.CSSProperties = {
  fontSize: "12.5px",
  color: "var(--mut)",
  lineHeight: 1.6,
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
  lineHeight: 1.6,
  marginTop: "8px",
  maxWidth: "72ch",
};
const link: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 500,
  color: "var(--ac)",
  textDecoration: "none",
};

export default function NotAvailable({ domain }: { domain: string | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={panel}>
        <div style={heading}>Page health isn&rsquo;t collecting data yet</div>
        <div style={body}>
          This needs a crawler that fetches and renders your own pages, which this deployment doesn&rsquo;t run — the
          sampler stores the answers assistants give to your tracked prompts, not crawls of your site. No estimated
          figures are shown.
        </div>
      </div>

      <div style={panel}>
        <div style={label}>What this screen would require</div>
        <div style={item}>
          {domain
            ? `A headless crawl of ${domain} (respecting robots.txt) that fetches and renders each page and stores its paint and interactive timings, so a render band is measured rather than asserted.`
            : "A headless crawl of your own domain (respecting robots.txt) that fetches and renders each page and stores its paint and interactive timings, so a render band is measured rather than asserted."}
        </div>
        <div style={item}>
          Markup checks from that same crawl — status, robots and llms.txt, structured data, headings, a freshness date —
          to support a readiness read for a page.
        </div>
        <div style={item}>
          A per-URL join across the three stores. Citations are recorded per sampled answer, crawler hits per request and
          referrals per visit; until each is resolved to one page of yours, a single row cannot say what a page earns per
          platform.
        </div>
      </div>

      <div style={panel}>
        <div style={label}>Live today</div>
        <div style={item}>
          AI crawler requests and AI referral visits captured on this deployment are on{" "}
          <Link href="/app/agents" style={link}>
            Crawlers
          </Link>{" "}
          and{" "}
          <Link href="/app/agents/referrals" style={link}>
            Referrals
          </Link>
          , and the domains cited in sampled answers are on{" "}
          <Link href="/app/citations" style={link}>
            Citations
          </Link>
          .
        </div>
        <div style={item}>
          Those are real traffic and real sampled answers. They are reported at the level they are actually observed at,
          which is why none of them is re-cut into a per-page score here.
        </div>
      </div>
    </div>
  );
}
