import { CITATIONS_PREV_TOTAL, CITATIONS_TOTAL, citationsDaily } from "@/lib/data/evidence";
import { countStat, extendCount } from "@/lib/filters/windows";

/* One source of truth for "how many citations does the active window hold".

   Everything on the Citations screen is a slice of the same pile: the KPI, the
   donut's centre label, each source class, each domain, each page. Per-domain
   daily history is not part of the fixture — what the fixture states is each
   source's SHARE — so counts below the headline scale with the window's own
   citation volume and shares stay put. At 30 days every number comes back as
   the shipped one (1,284 · 488/385/257/154 · 248/201/164/…). */

export function citationWindow(days: number) {
  const stat = countStat(extendCount(citationsDaily, "citations:daily", { prevSum: CITATIONS_PREV_TOTAL }), days);
  return {
    ...stat,
    /** window citations ÷ the shipped 1,284 */
    scale: stat.value / CITATIONS_TOTAL,
    /** window change ÷ the shipped +212, for the per-row deltas */
    deltaScale: stat.delta / (CITATIONS_TOTAL - CITATIONS_PREV_TOTAL),
  };
}
