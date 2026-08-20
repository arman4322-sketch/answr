import type { TrendSeries } from "@/components/app/charts/TrendChart";
import {
  CRAWL_PREV_RATIO,
  CRAWL_REQUESTS_30D,
  CRAWL_TOTAL_UPLIFT,
  crawlerActivitySeries,
} from "@/lib/data/infra";
import { countStat, extendCount, rangeMeta, sliceWindow, sum, type RangeId } from "@/lib/filters/windows";

/* Crawl volume for the active window.

   Each charted bot keeps its own daily history — last 30 points are the
   shipped fixture — extended backwards at the rate the card's "↑ 18%" implies,
   with the previous 30-day block pinned so that delta is exactly 18% at 30
   days. The headline covers all 14 agents, of which only four are charted, so
   the total lifts the charted sum by the constant minor-agent factor
   (45,941 → 48,231). Rows further down the page that restate crawl volume
   (the agents table, most-crawled paths) scale by `scale`. */

export function botHistories(): { id: string; label: string; color: string; history: number[] }[] {
  return crawlerActivitySeries.map((s) => ({
    id: s.id,
    label: s.label,
    color: s.color,
    history: extendCount(s.points, `agents:${s.id}`, { prevSum: sum(s.points) * CRAWL_PREV_RATIO }),
  }));
}

export function crawlSeriesForRange(range: RangeId): TrendSeries[] {
  const days = rangeMeta(range).days;
  return botHistories().map((b, i) => ({
    ...crawlerActivitySeries[i],
    points: sliceWindow(b.history, days),
  }));
}

export function crawlWindow(days: number) {
  const bots = botHistories();
  const totalHistory = bots[0].history.map((_, i) => bots.reduce((t, b) => t + b.history[i], 0) * CRAWL_TOTAL_UPLIFT);
  const stat = countStat(totalHistory, days);
  return {
    ...stat,
    /** window requests ÷ the shipped 48,231 */
    scale: stat.value / CRAWL_REQUESTS_30D,
    /** per-bot window sums, in crawlerActivitySeries order */
    perBot: bots.map((b) => sum(sliceWindow(b.history, days))),
  };
}
