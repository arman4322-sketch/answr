import Link from "next/link";

/* Honest states for the Actions screens.

   <SetupNotice>       — no workspace configured, so nothing can be sampled and
                         no gap can exist.
   <CollectingNotice>  — configured, but the sampler has not produced a run yet.
   <NoGapsNotice>      — runs exist and none of them produced a gap. A real,
                         measured result: the queue is empty because the brand
                         led every sampled prompt, not because data is missing.
   <NotAvailablePanel> — a panel the live engine cannot fill. It names exactly
                         what the feature would need and prints "No estimated
                         figures are shown." so an empty panel can never be read
                         as a measured zero.

   Same card chrome as the rest of the screen (bg1 / brd / radius 10), so the
   layout is untouched — only the contents are honest. */

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
const link: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 500,
  color: "var(--ac)",
  textDecoration: "none",
  marginTop: "12px",
  display: "inline-block",
};

export function SetupNotice() {
  return (
    <div style={panel}>
      <div style={title}>Set up your brand to start collecting data</div>
      <div style={body}>
        Actions are derived from the answers AI assistants give to your tracked prompts — which ones leave your brand
        out, and which ones name a competitor first. Nothing is sampled until a workspace exists: no brand, domain or
        prompt set is configured yet.
      </div>
      <Link href="/onboarding/brand" style={link}>
        Set up your brand →
      </Link>
      <span style={{ ...link, color: "var(--fnt)", marginLeft: "14px" }}>
        or open{" "}
        <Link href="/app/settings" style={{ color: "var(--ac)", textDecoration: "none" }}>
          Settings
        </Link>
      </span>
    </div>
  );
}

/* No schedule is promised here. The heading used to read "first sample runs
   tonight", which nothing backed: the only cron (vercel.json → /api/runs/execute,
   07:00 UTC) names no workspace, so it runs the demo workspace and no other, and
   it does nothing at all unless a cron secret is configured. What IS real is the
   on-demand trigger — POST /api/runs/start, driven by the welcome screen and by
   "Run now" in Settings › Platforms — so the notice points at that instead of
   telling a user to wait for something that may never come. */
export function CollectingNotice({ prompts }: { prompts: number }) {
  return (
    <div style={panel}>
      <div style={title}>Collecting — no answers sampled yet</div>
      <div style={body}>
        {prompts > 0
          ? `Your workspace is configured and ${prompts} prompt${prompts === 1 ? " is" : "s are"} tracked. `
          : "Your workspace is configured. "}
        No answers have been sampled yet, so no gap can be observed and the queue is empty. Nothing below is an
        estimate — the queue fills with real prompts the moment a run lands. Start one from Settings › Platforms;
        it samples your tracked prompts against every connected provider.
      </div>
      <Link href="/app/settings/platforms" style={link}>
        Run the sampler now →
      </Link>
      <span style={{ ...link, color: "var(--fnt)", marginLeft: "14px" }}>
        or{" "}
        <Link href="/app/prompts" style={{ color: "var(--ac)", textDecoration: "none" }}>
          review the tracked prompt set
        </Link>
      </span>
    </div>
  );
}

export function NoGapsNotice({ brand, sampled }: { brand: string; sampled: number }) {
  return (
    <div style={panel}>
      <div style={title}>No gaps in the latest runs</div>
      <div style={body}>
        {`Across all ${sampled} sampled prompt${sampled === 1 ? "" : "s"}, ${brand || "your brand"} was named ahead of every tracked competitor, so there is nothing for the queue to raise. This is a measured result from the latest run of each prompt, not an empty screen — add more prompts to widen what is checked.`}
      </div>
      <Link href="/app/prompts" style={link}>
        Add more prompts →
      </Link>
    </div>
  );
}

export function NotAvailablePanel({
  heading,
  requires,
  compact = false,
}: {
  /** "<Feature> isn't collecting data yet" */
  heading: string;
  /** one sentence naming exactly what the feature needs */
  requires: string;
  /** tighter type for the narrow sidebar column */
  compact?: boolean;
}) {
  return (
    <div style={{ ...panel, padding: compact ? "16px 18px" : "22px 24px" }}>
      <div style={{ ...title, fontSize: compact ? "13.5px" : "14.5px" }}>{heading}</div>
      <div style={{ ...body, fontSize: compact ? "12px" : "12.5px" }}>{requires} No estimated figures are shown.</div>
    </div>
  );
}
