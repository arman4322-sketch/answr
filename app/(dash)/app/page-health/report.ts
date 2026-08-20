import type { ReportSpec } from "@/lib/export/report";
import { WINDOW_30D } from "@/lib/export/reports";
import { METRICS } from "@/lib/metrics";

/* Page health → executive CSV.

   A single-URL report: the crawler-probe render timings with their web-vitals
   band and a plain-English read, then how each platform actually treats the
   page (citations, crawls, humans referred), then the fix. No trend chart
   exists on this screen, so there is no dated series to carry. */

export const pageHealthSpec: ReportSpec = {
  module: "Agent Analytics · Page health",
  brand: "Nike",
  window: WINDOW_30D,
  summary: [
    {
      label: "Page",
      value: "/running/marathon-training-guide",
      note: `${METRICS.page_health.plain}. Last indexed 2h ago by GPTBot — the site's most crawled, most cited and highest-referring page.`,
    },
    {
      label: "First Contentful Paint",
      value: "0.9s — GOOD",
      note: "When the first thing appears on screen. Fast enough for bots and people.",
    },
    {
      label: "Largest Contentful Paint",
      value: "1.8s — GOOD",
      note: "When the main content finishes loading. Comfortably inside the web-vitals good band.",
    },
    {
      label: "Time to Interactive",
      value: "3.4s — FAIR",
      note: `${METRICS.page_speed.plain}. The only failing check: a 1.2 MB analytics bundle delays interactivity.`,
    },
    {
      label: "Citations earned",
      value: "173 across three platforms",
      note: "ChatGPT 84 · Perplexity 51 · AI Overviews 38 — all three rising this window.",
    },
    {
      label: "Humans referred",
      value: "912",
      delta: "+103 across platforms",
      note: `${METRICS.ai_referrals.plain}. 26.7% of every AI referral the site receives lands here.`,
    },
  ],
  sections: [
    {
      title: "Render timings",
      note: "Measured by Answr's own crawler probes during the weekly re-crawl; bands follow web-vitals thresholds.",
      columns: ["Metric", "Value", "Band", "Why it matters"],
      rows: [
        ["First Contentful Paint", "0.9s", "GOOD", "When the first thing appears on screen"],
        ["Largest Contentful Paint", "1.8s", "GOOD", "When the main content finishes loading"],
        ["Time to Interactive", "3.4s", "FAIR", "When the page becomes usable — slower than it should be"],
      ],
    },
    {
      title: "Platform breakdown",
      note: "How each assistant treats this page: how often it cites it, how often it crawls it, and how many people it sends.",
      columns: ["Platform", "Citations", "Crawls", "Humans referred", "Change vs previous"],
      rows: [
        ["ChatGPT", "84", "2,214", "512", "+61"],
        ["Perplexity", "51", "1,108", "231", "+18"],
        ["AI Overviews", "38", "846", "169", "+24"],
      ],
    },
  ],
  footnotes: [
    "TTI fair: a 1.2 MB analytics bundle delays interactivity — irrelevant to crawlers, costly for the humans they refer. Defer it below the fold.",
    "Source: Answr's headless crawler probes (respecting robots.txt) for timings, joined to the crawler-event log and the citation corpus for this URL.",
    "Page health is re-crawled weekly, or on demand via Re-analyze — figures here are from the most recent crawl.",
    "Full metric definitions: METRICS.md, or the ⓘ beside each figure in-app.",
  ],
};
