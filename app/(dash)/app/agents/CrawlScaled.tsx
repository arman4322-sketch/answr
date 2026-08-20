"use client";

import { useFilters } from "@/lib/filters/context";
import { accrued, fmtInt } from "@/lib/filters/windows";
import { crawlWindow } from "./crawlWindow";
import { crawlerActivitySeries } from "@/lib/data/infra";

/* A single window-aware number inside the frame's tables, so the agents table
   and the most-crawled paths cannot drift away from the KPI row.

   - `bot`: this agent is one of the four charted bots, so its requests are the
     real sum of its own daily series over the window.
   - `volume`: a request count that scales with total crawl volume.
   - `distinct`: a count of distinct pages, which accrues on the saturating
     curve rather than summing.

   Every mode returns the shipped number at 30 days. */

export default function CrawlScaled({
  n,
  kind = "volume",
  bot,
}: {
  /** the value the frame printed for the shipped 30-day window */
  n: number;
  kind?: "volume" | "distinct";
  /** id in crawlerActivitySeries, when this row is one of the charted bots */
  bot?: string;
}) {
  const { window } = useFilters();
  const crawl = crawlWindow(window.days);

  if (bot) {
    const i = crawlerActivitySeries.findIndex((s) => s.id === bot);
    if (i >= 0) return <>{fmtInt(crawl.perBot[i])}</>;
  }
  return <>{fmtInt(kind === "distinct" ? accrued(n, window.days, 0.55) : n * crawl.scale)}</>;
}
