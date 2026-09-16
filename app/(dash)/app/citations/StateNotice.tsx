import Link from "next/link";

/* Honest states for the Citations screen.

   <SetupNotice>      — no workspace configured yet.
   <CollectingNotice> — configured, but the sampler has not produced a run.
   <CardEmpty>        — a card the live engine cannot fill; it says why rather
                        than printing a number that would be made up.

   Same card chrome as every other panel on the screen (bg1 / brd / radius 10),
   so the layout is unchanged — only the contents are honest. */

const panel: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "22px 24px",
};

const title: React.CSSProperties = { fontSize: "14.5px", fontWeight: 600 };
const body: React.CSSProperties = { fontSize: "12.5px", color: "var(--mut)", lineHeight: 1.55, marginTop: "6px", maxWidth: "72ch" };
const link: React.CSSProperties = { fontSize: "12.5px", fontWeight: 500, color: "var(--ac)", textDecoration: "none", marginTop: "12px", display: "inline-block" };

export function SetupNotice() {
  return (
    <div style={panel}>
      <div style={title}>Set up your brand to start collecting data</div>
      <div style={body}>
        Citations are parsed from the sources AI assistants quote when they answer your tracked prompts. Nothing is
        sampled until a workspace exists — no brand, domain or prompt set is configured yet.
      </div>
      <Link href="/onboarding/brand" style={link}>
        Set up your brand →
      </Link>
      <span style={{ ...link, color: "var(--fnt)", marginLeft: "14px" }}>
        or open <Link href="/app/settings" style={{ color: "var(--ac)", textDecoration: "none" }}>Settings</Link>
      </span>
    </div>
  );
}

export function CollectingNotice({ prompts }: { prompts: number }) {
  return (
    <div style={panel}>
      <div style={title}>Collecting — first sample runs tonight</div>
      <div style={body}>
        {prompts > 0
          ? `Your workspace is configured and ${prompts} prompt${prompts === 1 ? " is" : "s are"} queued. `
          : "Your workspace is configured. "}
        No answers have been sampled yet, so there are no citations to count. Every figure below stays at zero until the
        first run lands — none of them are estimates.
      </div>
      <Link href="/app/settings" style={link}>
        Review the tracked prompt set →
      </Link>
    </div>
  );
}

export function CardEmpty({ line, note }: { line: string; note?: string }) {
  return (
    <div style={{ padding: "26px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "12.5px", color: "var(--mut)" }}>{line}</div>
      {note && <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "6px", lineHeight: 1.5 }}>{note}</div>}
    </div>
  );
}
