/* Illustrative layout for Page health.

   Rendered ONLY as a child of <LockedPreview>, which dims it to 28% opacity,
   desaturates it, marks it inert + aria-hidden and stamps the permanent
   "Preview · illustrative — not measured data" badge over it. No crawler runs
   on this deployment, so nothing below was measured and nothing is clickable.

   Shape of the screen a crawl would fill: four health KPIs over a per-URL table
   reading URL, crawlable, JS-dependent, schema and last crawled. URLs are
   example.com paths on purpose — the workspace's own domain is never shown
   carrying a health verdict it has not been given. */

const panel: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  overflow: "hidden",
};
const cardHead: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 20px 12px",
};
const cardTitle: React.CSSProperties = { fontSize: "14.5px", fontWeight: 600 };
const cardNote: React.CSSProperties = { fontSize: "11px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" };

const GRID = "2.4fr .9fr 1fr 1.3fr .9fr";
const colHead: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: GRID,
  padding: "8px 20px",
  fontSize: "10px",
  fontWeight: 500,
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--fnt)",
  borderBottom: "1px solid var(--brd)",
};

type Verdict = "good" | "bad" | "warn";

interface Row {
  url: string;
  crawlable: string;
  crawlableTone: Verdict;
  js: string;
  jsTone: Verdict;
  schema: string;
  schemaTone: Verdict;
  crawled: string;
}

const ROWS: Row[] = [
  { url: "example.com/", crawlable: "Yes", crawlableTone: "good", js: "No", jsTone: "good", schema: "Organization", schemaTone: "good", crawled: "6h ago" },
  { url: "example.com/products", crawlable: "Yes", crawlableTone: "good", js: "No", jsTone: "good", schema: "Product", schemaTone: "good", crawled: "6h ago" },
  { url: "example.com/pricing", crawlable: "Yes", crawlableTone: "good", js: "Yes", jsTone: "bad", schema: "None", schemaTone: "bad", crawled: "6h ago" },
  { url: "example.com/guides/getting-started", crawlable: "Yes", crawlableTone: "good", js: "No", jsTone: "good", schema: "Article · FAQ", schemaTone: "good", crawled: "1d ago" },
  { url: "example.com/compare", crawlable: "Yes", crawlableTone: "good", js: "Partly", jsTone: "warn", schema: "Article", schemaTone: "good", crawled: "1d ago" },
  { url: "example.com/support", crawlable: "Blocked", crawlableTone: "bad", js: "No", jsTone: "good", schema: "FAQ", schemaTone: "good", crawled: "3d ago" },
  { url: "example.com/account", crawlable: "Blocked", crawlableTone: "bad", js: "Yes", jsTone: "bad", schema: "None", schemaTone: "bad", crawled: "Not crawled" },
];

const TONE: Record<Verdict, string> = {
  good: "var(--good)",
  bad: "var(--bad)",
  warn: "var(--gold)",
};

function Kpi({ label, value, sub, color }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "15px 17px" }}>
      <div style={{ fontSize: "11.5px", fontWeight: 500, color: "var(--mut)" }}>{label}</div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          fontVariantNumeric: "tabular-nums",
          marginTop: "10px",
          color: color ?? "var(--tx)",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "10.5px", color: "var(--fnt)", marginTop: "6px" }}>{sub}</div>
    </div>
  );
}

function Cell({ text, tone }: { text: string; tone: Verdict }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--mut)" }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: TONE[tone], flex: "none" }} />
      {text}
    </span>
  );
}

export default function PageHealthPreview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        <Kpi label="Pages crawlable by AI bots" value="90%" sub="of 200 pages in the sitemap" color="var(--good)" />
        <Kpi label="JS-dependent pages" value="20" sub="main content missing without JS" color="var(--bad)" />
        <Kpi label="Schema coverage" value="60%" sub="pages with valid structured data" />
        <Kpi label="Last full crawl" value="6h ago" sub="nightly, robots.txt respected" />
      </div>

      <div style={panel}>
        <div style={cardHead}>
          <div style={cardTitle}>Pages</div>
          <div style={cardNote}>Showing 7 of 200</div>
        </div>
        <div style={colHead}>
          <span>URL</span>
          <span>Crawlable</span>
          <span>JS-dependent</span>
          <span>Schema</span>
          <span>Last crawled</span>
        </div>
        {ROWS.map((r, i) => (
          <div
            key={r.url}
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              alignItems: "center",
              padding: "11px 20px",
              fontSize: "13px",
              ...(i > 0 ? { borderTop: "1px solid var(--brd)" } : {}),
            }}
          >
            <span style={{ fontSize: "12.5px", fontVariantNumeric: "tabular-nums" }}>{r.url}</span>
            <Cell text={r.crawlable} tone={r.crawlableTone} />
            <Cell text={r.js} tone={r.jsTone} />
            <Cell text={r.schema} tone={r.schemaTone} />
            <span style={{ fontSize: "11.5px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{r.crawled}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
