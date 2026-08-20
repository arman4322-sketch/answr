"use client";

import KpiCard from "@/components/app/KpiCard";
import { useFilters } from "@/lib/filters/context";
import { accruedStat, deltaTone, fmtDelta, fmtInt } from "@/lib/filters/windows";
import {
  BLOCKED_ON_HELP_30D,
  BLOCKED_REQUESTS_30D,
  PAGES_CRAWLED_30D,
  PAGES_CRAWLED_DELTA_30D,
  UNIQUE_AGENTS_30D,
  UNIQUE_AGENTS_DELTA_30D,
} from "@/lib/data/infra";
import { crawlWindow } from "./crawlWindow";

/* Agent Analytics KPI row — live on the date-range pill in this page's own
   topbar slot.

   - AI crawler requests: the window's summed requests vs the previous window's
     (the card's delta is a percentage, so it prints the growth rate).
   - Unique agents and Pages crawled are distinct counts — they accrue on the
     saturating curve, not by summing days.
   - Blocked requests scale with crawl volume, and so does the /help share of
     them the card calls out.

   At 30 days: 48,231 ↑18% · 14 ↑2 · 1,846 ↑214 · 312 with 214 on /help. */

export default function AgentKpis() {
  const { window } = useFilters();
  const crawl = crawlWindow(window.days);
  const agents = accruedStat(UNIQUE_AGENTS_30D, UNIQUE_AGENTS_DELTA_30D, window.days, 0.25);
  const pages = accruedStat(PAGES_CRAWLED_30D, PAGES_CRAWLED_DELTA_30D, window.days, 0.55);
  const blocked = Math.round(BLOCKED_REQUESTS_30D * crawl.scale);
  const blockedHelp = Math.round(BLOCKED_ON_HELP_30D * crawl.scale);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
      <KpiCard
        label="AI crawler requests"
        value={fmtInt(crawl.value)}
        metricId="crawler_events"
        delta={`${Math.round(crawl.pct) === 0 ? "±" : crawl.pct < 0 ? "↓" : "↑"} ${Math.abs(Math.round(crawl.pct))}%`}
        deltaGood={Math.round(crawl.pct) === 0 ? undefined : crawl.pct >= 0}
      />
      <KpiCard
        label="Unique agents"
        value={fmtInt(agents.value)}
        metricId="unique_agents"
        delta={fmtDelta(agents.delta, 0)}
        deltaGood={deltaTone(agents.delta, 0)}
      />
      <KpiCard
        label="Pages crawled"
        value={fmtInt(pages.value)}
        metricId="pages_crawled"
        delta={fmtDelta(pages.delta, 0)}
        deltaGood={deltaTone(pages.delta, 0)}
      />
      <KpiCard
        label="Blocked requests"
        value={fmtInt(blocked)}
        metricId="crawler_events"
        hint="Bot visits your site turned away"
        delta={`${fmtInt(blockedHelp)} on /help`}
        deltaGood={false}
      />
    </div>
  );
}
