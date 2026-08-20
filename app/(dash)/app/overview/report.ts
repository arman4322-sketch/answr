import type { ReportSpec } from "@/lib/export/report";
import { overviewReport, seriesSection } from "@/lib/export/reports";
import { METRICS } from "@/lib/metrics";
import {
  appearancesTrend,
  clicksTrend,
  clicksXLabels,
  overviewXLabels,
  visibilityTrend,
} from "@/lib/data/overview";

/* Overview → executive CSV.

   Everything the screen shows, in the order a reader would want it: the four
   headline KPIs with deltas and a plain-English read (METRICS[id].plain), the
   three trends behind the "Performance over time" card, then the competitor,
   platform and source tables — and the week's written digest verbatim.
   Figures are the page's own fixtures; no number is restated differently. */

const base = overviewReport({
  brand: "Nike",
  kpis: [
    {
      label: METRICS.visibility_score.label,
      value: "34.2%",
      delta: "+2.8pt",
      note: `${METRICS.visibility_score.plain}. Up on the back of Google AI Overviews (+4.6) after three new runnersworld.com citations.`,
    },
    {
      label: METRICS.share_of_voice.label,
      value: "28.6%",
      delta: "+1.1pt",
      note: `${METRICS.share_of_voice.plain}. Still #1 in the category; Adidas is 4.5pt behind and falling.`,
    },
    {
      label: "Citations · 30d",
      value: "1,284",
      delta: "+212",
      note: `${METRICS.citations_count.plain}. runnersworld.com passed reddit.com as the top earned source this window.`,
    },
    {
      label: METRICS.avg_answer_position.label,
      value: "2.4",
      delta: "-0.2 (worse — lower is better)",
      note: `${METRICS.avg_answer_position.plain}. Slipping while visibility rises: Nike appears in more answers but later inside them.`,
    },
    {
      label: METRICS.prompts_tracked.label,
      value: "412 of 1,000 used",
      note: `${METRICS.prompts_tracked.plain}. The whole report is computed over these 412 prompts.`,
    },
    {
      label: METRICS.actions_queue.label,
      value: "24 open",
      note: "Recommended fixes waiting. Action #87 targets the blocked /help crawl path called out below.",
    },
  ],
  visibilitySeries: visibilityTrend,
  xLabels: overviewXLabels,
  competitors: [
    { rank: "1", brand: "Nike (You)", sov: "28.6%", delta: "+1.1", topPlatform: "ChatGPT" },
    { rank: "2", brand: "Adidas", sov: "24.1%", delta: "-0.6", topPlatform: "Perplexity" },
    { rank: "3", brand: "Puma", sov: "18.9%", delta: "+0.3", topPlatform: "Gemini" },
    { rank: "4", brand: "Under Armour", sov: "15.2%", delta: "-1.4", topPlatform: "ChatGPT" },
    { rank: "5", brand: "New Balance", sov: "13.2%", delta: "+0.9", topPlatform: "Claude" },
  ],
  platforms: [
    { platform: "ChatGPT", visibility: "41.8%", delta: "+3.2" },
    { platform: "Perplexity", visibility: "36.4%", delta: "+1.9" },
    { platform: "Google AI Overviews", visibility: "31.0%", delta: "+4.6" },
    { platform: "Claude", visibility: "27.7%", delta: "-0.8" },
    { platform: "Gemini", visibility: "22.1%", delta: "+0.4" },
  ],
  sources: [
    { source: "runnersworld.com", citations: "248", delta: "+41" },
    { source: "nike.com/running", citations: "201", delta: "+38" },
    { source: "reddit.com", citations: "164", delta: "+67" },
    { source: "wirecutter.com", citations: "97", delta: "-8" },
    { source: "wikipedia.org", citations: "61", delta: "—" },
  ],
});

export const overviewSpec: ReportSpec = {
  ...base,
  sections: [
    base.sections[0],
    seriesSection("Appearances by platform — daily trend", appearancesTrend, overviewXLabels, {
      unit: "prompts",
      note: `${METRICS.platform_appearances.plain}. Count of the 412 tracked prompts whose latest answer names Nike, per platform — prompts overlap, so columns do not sum.`,
    }),
    seriesSection("AI-referral clicks by platform — weekly", clicksTrend, clicksXLabels, {
      unit: "clicks",
      note: `${METRICS.ai_referrals.plain}. Weekly clicks landing on nike.com, by source platform (30-day totals: ChatGPT 1,842 · AI Overviews 1,204 · Perplexity 926 · Gemini 512 · Claude 388).`,
    }),
    ...base.sections.slice(1),
    {
      title: "This week, summarized",
      note: "The digest Answr generated for this workspace, verbatim.",
      columns: ["Generated", "Summary"],
      rows: [
        [
          "Aug 4, 09:00",
          "Visibility rose +2.8pt, led by Google AI Overviews (+4.6) after three new runnersworld.com citations. runnersworld.com passed reddit.com as your top earned source. Product-page citations still trail nike.com/running 5:1 while ClaudeBot stays blocked on /help — action #87 targets this. One watch item: \"price at full retail\" is trending negative from a stale cached pricing page.",
        ],
      ],
    },
  ],
  footnotes: [
    ...(base.footnotes ?? []),
    "Appearances are unweighted per-platform counts; the visibility score is platform- and position-weighted. The two move differently by design.",
    "AI-referral clicks are raw click events from Demand; the Referrals module's 3,412 figure is deduplicated sessions.",
  ],
};
