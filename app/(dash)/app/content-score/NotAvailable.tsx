import Link from "next/link";

/* Honest states for the Content score screen.

   <SetupNotice>  — no workspace configured, so there is not even a prompt set to
                    grade a draft against.
   <NotAvailable> — configured, but nothing in the product scores content. The
                    0–100 gauge, the four subscores and the three "+N est." lifts
                    were a shipped fixture for one Nike draft; none of them can be
                    derived from what the pipeline collects. The sampler asks the
                    assistants the workspace's tracked prompts and stores their
                    answers — it never fetches a page, never parses its structure
                    and keeps no corpus of the pages that win citations. So the
                    screen names what is missing instead of printing a grade.

   Card chrome matches every other panel in the dashboard (bg1 / brd / radius 10),
   so the route keeps its shape — only the contents are honest. */

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
  marginTop: "6px",
  maxWidth: "72ch",
};
const link: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 500,
  color: "var(--ac)",
  textDecoration: "none",
};
const linkBlock: React.CSSProperties = { ...link, marginTop: "12px", display: "inline-block" };

export function SetupNotice() {
  return (
    <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={panel}>
        <div style={title}>Set up your brand to start collecting data</div>
        <div style={body}>
          A content score would grade a draft against the answers sampled for your tracked prompts. No workspace exists
          yet, so there is no brand, no prompt set and no sampled answer to grade anything against. No estimated figures
          are shown.
        </div>
        <Link href="/onboarding/brand" style={linkBlock}>
          Set up your brand →
        </Link>
        <span style={{ ...linkBlock, color: "var(--fnt)", marginLeft: "14px" }}>
          or open{" "}
          <Link href="/app/settings" style={link}>
            Settings
          </Link>
        </span>
      </div>
    </div>
  );
}

export default function NotAvailable() {
  return (
    <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={panel}>
        <div style={title}>Content score isn&rsquo;t collecting data yet</div>
        <div style={body}>
          This needs a page-fetching step that retrieves a draft and a scoring pass that grades it against the answers
          sampled for your tracked prompts — neither runs in the pipeline, which only records what the assistants say.
          No estimated figures are shown.
        </div>
      </div>

      <div style={panel}>
        <div style={label}>What this screen would require</div>
        <div style={item}>
          A fetcher that pulls the draft itself — by URL, pasted text or uploaded file — and parses its headings,
          tables, schema blocks, dates and sourced claims.
        </div>
        <div style={item}>
          A reference corpus of the pages that already win citations for these prompts. The live layer records which
          domains are cited, not the pages behind them, so there is nothing to grade a draft against today.
        </div>
        <div style={item}>
          Until both exist there is no 0&ndash;100 grade, no answerability / structure / evidence / freshness subscore,
          no topic median and no estimated lift — so none of them are drawn.
        </div>
      </div>

      <div style={panel}>
        <div style={label}>Live today</div>
        <div style={item}>
          What the assistants actually answer for your prompts, and which sources they quote, is measured and already on{" "}
          <Link href="/app/prompts" style={link}>
            Prompts
          </Link>
          ,{" "}
          <Link href="/app/citations" style={link}>
            Citations
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
