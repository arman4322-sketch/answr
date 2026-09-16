import Link from "next/link";

/* Honest-unavailable panel for the Conversations screen.

   Conversation Explorer cannot be served by the connected answer providers.
   Reading real consumer chats with AI assistants requires a licensed,
   consented conversation panel — a commercial data contract with a panel
   provider — and no model API key grants access to one. So the screen states
   that plainly instead of shipping transcripts, counts or a sample size that
   would all be invented.

   Card chrome matches every other panel in the dashboard (bg1 / brd /
   radius 10), so the route keeps its shape. */

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
};
const link: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 500,
  color: "var(--ac)",
  textDecoration: "none",
};

export default function NotAvailable() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={panel}>
        <div style={title}>Conversations isn&rsquo;t collecting data yet</div>
        <div style={body}>
          This needs a licensed, consented conversation panel — a commercial data contract with a panel provider — which
          no model API key provides. No estimated figures are shown.
        </div>
      </div>

      <div style={panel}>
        <div style={label}>What this screen would require</div>
        <div style={item}>
          A signed data licence with a provider of consented, anonymized consumer conversations with AI assistants.
        </div>
        <div style={item}>An ingest job that loads those transcripts into this workspace.</div>
        <div style={item}>
          Until both exist there is nothing to read here: the tracked-prompt sampler records the assistants&rsquo; answers
          to your own prompts, not other people&rsquo;s chats.
        </div>
      </div>

      <div style={panel}>
        <div style={label}>Live today</div>
        <div style={item}>
          The answers sampled for your tracked prompts are real and already on{" "}
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
