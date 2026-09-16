import Link from "next/link";

/* Honest states for Workflows.

   Workflows used to render three automation rules, a selected rule's
   trigger/step chain and a "Recent runs" feed — all of it invented. Nothing
   behind it exists: there is no table that stores an automation rule, no
   scheduler or event watcher that evaluates one against incoming sampled runs,
   and no delivery path that could carry out a step. A rule could not be saved,
   matched or fired, so a run history cannot exist either.

   Rather than keep a plausible rule, trigger or last-run time on screen, the
   route keeps its topbar and states what the feature would need.

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

/** No workspace yet — there is nothing for a rule to watch in the first place. */
export function SetupNotice() {
  return (
    <div style={panel}>
      <div style={heading}>Set up your brand to start collecting data</div>
      <div style={body}>
        A workflow would watch what AI assistants say about your brand. No brand, domain or prompt set is configured on
        this deployment, so nothing is being sampled and there is nothing for a rule to react to.
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
        <Link
          href="/onboarding/brand"
          className="btn-ac"
          style={{ fontSize: "12.5px", fontWeight: 500, borderRadius: "7px", padding: "7px 14px" }}
        >
          Set up brand
        </Link>
        <Link
          href="/app/settings"
          style={{
            fontSize: "12.5px",
            fontWeight: 500,
            color: "var(--mut)",
            background: "rgba(255,255,255,0.045)",
            borderRadius: "7px",
            padding: "7px 14px",
          }}
        >
          Settings
        </Link>
      </div>
    </div>
  );
}

/** The feature itself: no engine, so no rules and no run history. */
export default function NotAvailable({ brand }: { brand: string | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={panel}>
        <div style={heading}>Workflows isn&rsquo;t collecting data yet</div>
        <div style={body}>
          This needs a stored automation-rule engine and a trigger runner, neither of which exists on this deployment, so
          no rule can be saved, matched or fired. No estimated figures are shown.
        </div>
      </div>

      <div style={panel}>
        <div style={label}>What this screen would require</div>
        <div style={item}>
          Somewhere to store a rule — its trigger, its conditions and its ordered steps — against the workspace. Nothing
          is persisted today, so the rule list and its statuses have no source.
        </div>
        <div style={item}>
          A trigger runner that evaluates stored rules as sampled answers land and on a schedule. Without it there is no
          &ldquo;last run&rdquo;, no run count and no run history to report.
        </div>
        <div style={item}>
          Delivery for the steps a rule would take: writing to the action queue, and the outbound integrations (chat,
          email) a notification step would use. None of these are wired to a rule engine.
        </div>
      </div>

      <div style={panel}>
        <div style={label}>Live today</div>
        <div style={item}>
          {brand
            ? `What the assistants actually answer for ${brand}, and the gaps those answers reveal, are measured and shown on `
            : "What the assistants actually answer, and the gaps those answers reveal, are measured and shown on "}
          <Link href="/app/overview" style={link}>
            Overview
          </Link>
          ,{" "}
          <Link href="/app/prompts" style={link}>
            Prompts
          </Link>{" "}
          and{" "}
          <Link href="/app/actions" style={link}>
            Actions
          </Link>
          .
        </div>
        <div style={item}>
          Actions is the closest thing that runs today: it derives work from the answers that were really sampled, rather
          than from a rule this deployment cannot execute.
        </div>
      </div>
    </div>
  );
}
