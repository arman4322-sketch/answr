import type { ReportSpec } from "@/lib/export/report";
import { METRICS } from "@/lib/metrics";

/* Page health → "not collecting" export (pattern B).

   This file used to carry a hand-written executive report for a single URL:
   render timings with web-vitals bands, a per-platform citations/crawls/
   referrals table and a fix note, all under a hard-coded brand. Every figure
   was invented — nothing in the pipeline crawls your pages. The sampler stores
   the answers assistants give to your tracked prompts; it never fetches, renders
   or times a URL of yours, and no per-URL join exists between the citation
   corpus and the crawler-event log.

   The Export button stays honest rather than dead: the CSV names the missing
   capability and carries no figures at all. The brand comes from the live
   workspace, so a downloaded file can never be headed with a brand this
   deployment does not track. */

export function pageHealthSpec(brand: string | null): ReportSpec {
  return {
    module: "Agent Analytics · Page health",
    brand: brand ?? "Not configured",
    window: "Not collected",
    windowNote:
      "Page health is not being measured on this deployment, so this file covers no window and carries no figures.",
    summary: [
      {
        label: METRICS.page_health.label,
        value: "Not available yet",
        note: "This needs a crawler that fetches and renders your own URLs. The sampler stores the answers assistants give to your tracked prompts, not crawls of your pages. No estimated figures are shown.",
      },
      {
        label: METRICS.page_speed.label,
        value: "Not available yet",
        note: "First Contentful Paint, Largest Contentful Paint and Time to Interactive come from crawler render probes, which this deployment does not run.",
      },
    ],
    sections: [
      {
        title: "Page health — not collecting data yet",
        note: "Nothing is estimated below; each row states a requirement that is not met.",
        columns: ["What this report would contain", "Why it is empty"],
        rows: [
          [
            "Render timings per URL (FCP, LCP, TTI) and their web-vitals bands",
            "No headless crawler probe fetches, renders or times your pages, so no timing exists to band.",
          ],
          [
            "Readiness checks (fetchability, structured data, headings, freshness)",
            "Nothing crawls the page markup, so no check can be run against it.",
          ],
          [
            "Per-platform citations, crawls and humans referred for one URL",
            "Citations are stored per answer and crawler events per request; neither is joined to a single page of yours, so a per-URL breakdown cannot be derived.",
          ],
          [
            "Change versus a previous window for any of the above",
            "There is no first measurement, so there is nothing to compare against.",
          ],
        ],
      },
    ],
    footnotes: [
      "This export exists so the screen's button is honest: there is no measured data behind page health, and none is invented here.",
      "What this deployment does capture is AI crawler requests and AI referral visits (Agent Analytics), and the domains cited in sampled answers (Citations).",
      "Full metric definitions: METRICS.md, or the ⓘ beside each figure in-app.",
    ],
  };
}
