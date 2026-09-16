import Link from "next/link";

/* Honest "not available yet" panel for the Insights screens that no live source
   backs today.

   Regions, Audiences, Shopping, Sentiment and the topic detail page were all
   built on shipped fixtures. None of them can be derived from what the
   sampler actually collects: the pipeline runs each tracked prompt once, in one
   locale, with no persona variants, no purchase-intent set, no product catalog,
   no sentiment classifier and no topic tags. Rather than keep a plausible
   number on screen, each route now states what the feature would need and shows
   nothing else — the route, its topbar and the Insights sub-nav stay intact.

   `requires` is a single sentence naming the missing capability. The panel then
   always prints "No estimated figures are shown." so the reader cannot mistake
   the empty screen for a measured zero. */

export default function NotCollectingPanel({
  title,
  requires,
}: {
  /** "<Feature> isn't collecting data yet" */
  title: string;
  /** one sentence naming exactly what the feature needs to start collecting */
  requires: string;
}) {
  return (
    <div style={{ padding: "22px 24px" }}>
      <div
        style={{
          background: "var(--bg1)",
          border: "1px solid var(--brd)",
          borderRadius: "10px",
          padding: "26px 28px",
          maxWidth: "620px",
        }}
      >
        <div style={{ fontSize: "15px", fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: "13px", color: "var(--mut)", lineHeight: 1.7, marginTop: "10px" }}>
          {requires} No estimated figures are shown.
        </div>
        <div style={{ display: "flex", gap: "9px", marginTop: "18px", flexWrap: "wrap" }}>
          <Link
            href="/app/overview"
            style={{
              padding: "9px 15px",
              background: "var(--bg0)",
              border: "1px solid var(--brd)",
              borderRadius: "7px",
              color: "var(--tx)",
              fontSize: "12.5px",
              fontWeight: 500,
            }}
          >
            What is measured today
          </Link>
          <Link
            href="/app/prompts"
            style={{
              padding: "9px 15px",
              background: "var(--bg0)",
              border: "1px solid var(--brd)",
              borderRadius: "7px",
              color: "var(--tx)",
              fontSize: "12.5px",
              fontWeight: 500,
            }}
          >
            Tracked prompts
          </Link>
        </div>
      </div>
    </div>
  );
}
