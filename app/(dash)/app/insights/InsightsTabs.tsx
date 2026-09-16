"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* AEI sub-nav (frames #aei / #p2-*) — one tab row for the whole Insights cluster.
   Active tab is derived from the pathname (topic detail pages keep "Topics"
   active).

   Badges. The frames badged Audiences and Shopping "BETA", which claims a
   working-but-rough feature. One rule now decides the badge, and it is the same
   for every tab: a tab is badged PREVIEW when its route has NO live data source
   at all and can only ever render a <LockedPreview> illustration; a tab with a
   real source carries no badge, whether or not the workspace has sampled
   anything yet.

   By that rule only Shopping is badged. It has no live component — recommendation
   rates need a purchase-intent prompt set and a product catalog, neither of which
   the pipeline has (lib/preview/sources.ts → "shopping") — so the whole route is
   the illustrative preview. Topics (TopicsLive), Regions (RegionsLive),
   Audiences (AudiencesLive) and Sentiment (SentimentLive) all read measured data
   and fall back to the preview only while empty, so none of them is badged: the
   BETA badge came off Audiences with Shopping's. The gold matches
   LockedPreview's own "Preview · illustrative" badge, so the tab and the screen
   it opens say the same thing. */

const PREVIEW = (
  <span
    style={{
      fontSize: "9.5px",
      fontWeight: 600,
      color: "var(--gold, #d9b679)",
      background: "color-mix(in oklab, var(--gold, #d9b679) 12%, transparent)",
      border: "1px solid color-mix(in oklab, var(--gold, #d9b679) 40%, transparent)",
      borderRadius: "4px",
      padding: "1px 5px",
    }}
  >
    PREVIEW
  </span>
);

const TABS: { href: string; label: string; preview?: boolean }[] = [
  { href: "/app/insights", label: "Topics" },
  { href: "/app/insights/regions", label: "Regions" },
  { href: "/app/insights/audiences", label: "Audiences" },
  { href: "/app/insights/shopping", label: "Shopping", preview: true },
  { href: "/app/insights/sentiment", label: "Sentiment" },
];

function isActive(pathname: string, href: string) {
  if (href === "/app/insights") {
    return pathname === href || pathname.startsWith("/app/insights/topics");
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export default function InsightsTabs() {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", gap: "2px", padding: "8px 24px 0", borderBottom: "1px solid var(--brd)", fontSize: "12.5px" }}>
      {TABS.map((t) => {
        const active = isActive(pathname, t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            style={
              active
                ? { padding: "8px 12px", color: "var(--tx)", fontWeight: 500, borderBottom: "2px solid var(--ac)" }
                : { padding: "8px 12px", color: "var(--mut)" }
            }
          >
            {t.label}
            {t.preview && (
              <>
                {" "}
                <span title="Illustrative preview — this screen has no data source yet.">{PREVIEW}</span>
              </>
            )}
          </Link>
        );
      })}
    </div>
  );
}
