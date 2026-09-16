/* Illustrative layout for Workflows.

   Rendered ONLY as a child of <LockedPreview>, which dims it to 28% opacity,
   desaturates it, marks it inert + aria-hidden and stamps the permanent
   "Preview · illustrative — not measured data" badge over it. No rule below
   exists, no run below happened, and nothing here is interactive.

   Shape of the screen the engine would fill: automation rule cards reading
   trigger → action → notify on the left, a recent-runs feed on the right.
   Placeholders are neutral ("Brand A", "Competitor A", example.com). */

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
const stepLabel: React.CSSProperties = {
  fontSize: "9.5px",
  fontWeight: 600,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--fnt)",
  flex: "none",
  width: "52px",
};
const stepText: React.CSSProperties = { fontSize: "12px", color: "var(--mut)", lineHeight: 1.5 };

interface Rule {
  name: string;
  active: boolean;
  trigger: string;
  action: string;
  notify: string;
  meta: string;
}

const RULES: Rule[] = [
  {
    name: "New citing domain",
    active: true,
    trigger: "A domain cites you for the first time in a sampled answer",
    action: "Create a task in Actions and tag the prompt it came from",
    notify: "Slack · #ai-visibility",
    meta: "Last run 2h ago · 30 runs",
  },
  {
    name: "Visibility drop",
    active: true,
    trigger: "Visibility falls more than 5 points week over week",
    action: "Open a review task for the affected topic",
    notify: "Email digest · Monday 09:00",
    meta: "Last run yesterday · 12 runs",
  },
  {
    name: "Competitor overtakes you",
    active: false,
    trigger: "Competitor A is named ahead of Brand A on a tracked prompt",
    action: "Add the prompt to the watchlist and draft a counter-brief",
    notify: "Slack · #competitive",
    meta: "Paused · 4 runs",
  },
];

interface Run {
  time: string;
  rule: string;
  detail: string;
  outcome: "acted" | "skipped";
}

const RUNS: Run[] = [
  { time: "09:12", rule: "New citing domain", detail: "example.com cited on 2 prompts · 1 task created", outcome: "acted" },
  { time: "09:12", rule: "Visibility drop", detail: "No threshold crossed", outcome: "skipped" },
  { time: "Yesterday 09:08", rule: "New citing domain", detail: "example.org cited on 1 prompt · notified Slack", outcome: "acted" },
  { time: "Yesterday 09:08", rule: "Visibility drop", detail: "Visibility −6 pts · review task opened", outcome: "acted" },
  { time: "2 days ago", rule: "New citing domain", detail: "No new domains in the sample", outcome: "skipped" },
  { time: "3 days ago", rule: "New citing domain", detail: "example.net cited on 3 prompts · 1 task created", outcome: "acted" },
];

function StatusChip({ active }: { active: boolean }) {
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: 500,
        letterSpacing: ".04em",
        borderRadius: "4px",
        padding: "2px 7px",
        color: active ? "var(--good)" : "var(--fnt)",
        border: `1px solid ${active ? "rgba(76,183,130,.35)" : "var(--brd)"}`,
      }}
    >
      {active ? "ACTIVE" : "PAUSED"}
    </span>
  );
}

function Step({ label, text }: { label: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: "10px", marginTop: "9px" }}>
      <span style={stepLabel}>{label}</span>
      <span style={stepText}>{text}</span>
    </div>
  );
}

export default function WorkflowsPreview() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "16px", alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {RULES.map((r) => (
          <div key={r.name} style={{ ...panel, padding: "16px 20px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>{r.name}</div>
              <StatusChip active={r.active} />
              <div style={{ marginLeft: "auto", ...cardNote }}>{r.meta}</div>
            </div>
            <Step label="When" text={r.trigger} />
            <Step label="Then" text={r.action} />
            <Step label="Notify" text={r.notify} />
          </div>
        ))}
        <div
          style={{
            border: "1px dashed var(--brd)",
            borderRadius: "10px",
            padding: "14px 20px",
            fontSize: "12.5px",
            color: "var(--fnt)",
          }}
        >
          + New workflow
        </div>
      </div>

      <div style={panel}>
        <div style={cardHead}>
          <div style={cardTitle}>Recent runs</div>
          <div style={cardNote}>Last 7 days</div>
        </div>
        <div>
          {RUNS.map((run, i) => (
            <div
              key={`${run.time}-${run.rule}-${i}`}
              style={{ padding: "11px 20px", borderTop: "1px solid var(--brd)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    flex: "none",
                    background: run.outcome === "acted" ? "var(--good)" : "var(--fnt)",
                  }}
                />
                <span style={{ fontSize: "12.5px", fontWeight: 500 }}>{run.rule}</span>
                <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>
                  {run.time}
                </span>
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--mut)", marginTop: "4px", paddingLeft: "14px", lineHeight: 1.5 }}>
                {run.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
