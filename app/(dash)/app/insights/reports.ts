import type { ReportSpec } from "@/lib/export/report";
import { WINDOW_30D, sentimentReport, seriesSection } from "@/lib/export/reports";
import { METRICS } from "@/lib/metrics";
import {
  aeiHeatPlatforms,
  aeiHeatRows,
  insightsDays,
  regionsSeries,
  sentimentSeries,
  shoppingSeries,
  visibilityByBrandSeries,
  topicRunningShoesSeries,
} from "@/lib/data/insights";

/* Answer Engine Insights → executive CSVs.

   One ReportSpec per screen in the cluster. Each opens with the screen's
   headline metrics (value + delta + a plain-English read reusing
   METRICS[id].plain), then the trend behind them as a dated table, then every
   supporting table the screen renders, then footnotes naming the data source.
   Numbers are the pages' own fixtures — nothing is restated or rounded
   differently here. */

const FOOTNOTE_METRICS = "Full metric definitions: METRICS.md, or the ⓘ beside each figure in-app.";
const FOOTNOTE_SAMPLING =
  "Source: Answr's daily prompt runs — every tracked prompt executed against each enabled platform, answers stored with full text and citations.";

/* ------------------------------------------------------------------ topics */

export const topicsSpec: ReportSpec = {
  module: "Answer Engine Insights · Topics",
  brand: "Nike",
  window: WINDOW_30D,
  summary: [
    {
      label: METRICS.visibility_score.label,
      value: "34.2%",
      delta: "+10.7pt over the window (23.5% → 34.2%)",
      note: `${METRICS.share_of_voice.plain}. Across all 412 tracked prompts; Adidas ends 24.9%, Puma 18.8%, Under Armour 13.1%.`,
    },
    {
      label: "Strongest topic",
      value: "Running shoes — 42.6%",
      delta: "+6.2pt",
      note: `${METRICS.topic_visibility.plain}. 132 prompts; Nike leads, best on ChatGPT.`,
    },
    {
      label: "Weakest topic",
      value: "Basketball gear — 14.2%",
      delta: "-0.7pt",
      note: "40 prompts and Puma leads them — the smallest tracked topic block.",
    },
    {
      label: "Biggest decline",
      value: "Sustainability — 18.7%",
      delta: "-2.1pt",
      note: "48 prompts, and Under Armour leads it on Claude — a visibility gap worth closing.",
    },
    {
      label: METRICS.prompts_tracked.label,
      value: "412",
      note: `${METRICS.prompts_tracked.plain}. Topic prompt counts sum to this total.`,
    },
    {
      label: METRICS.data_quality_sample.label,
      value: "1,312 answers",
      note: `${METRICS.data_quality_sample.plain}. The sample every figure on this screen is computed from.`,
    },
  ],
  sections: [
    seriesSection("Visibility — daily trend, all tracked prompts", visibilityByBrandSeries, insightsDays, {
      unit: "%",
      note: "Share of sampled answers mentioning each brand, by day. Not share of voice — see the Overview report for that.",
    }),
    {
      title: "Topics",
      note: "Every tracked topic: prompt volume, share of voice, where the brand is strongest, and who leads.",
      columns: ["Topic", "Prompts", "Visibility", "Change vs previous", "Best platform", "Leading brand"],
      rows: [
        ["Running shoes", "132", "42.6%", "+6.2", "ChatGPT", "Nike"],
        ["Training apparel", "108", "38.1%", "+3.8", "ChatGPT", "Nike"],
        ["Sneaker releases", "84", "29.4%", "+1.4", "Perplexity", "Adidas"],
        ["Sustainability", "48", "18.7%", "-2.1", "Claude", "Under Armour"],
        ["Basketball gear", "40", "14.2%", "-0.7", "Gemini", "Puma"],
      ],
    },
    {
      title: "Visibility by topic × platform",
      note: "Each cell = % of that platform's answers on that topic mentioning Nike, with the 30-day change.",
      columns: ["Topic", ...aeiHeatPlatforms.flatMap((p) => [`${p} visibility`, `${p} change`])],
      rows: aeiHeatRows.map((r) => [
        r.topic,
        ...r.cells.flatMap((c) => [`${c.visibility}%`, `${c.delta > 0 ? "+" : ""}${c.delta.toFixed(1)}`]),
      ]),
    },
  ],
  footnotes: [
    FOOTNOTE_SAMPLING,
    "Visibility (this report) is the share of answers mentioning a brand; share of voice (Overview report) is each brand's slice of total mentions. They answer different questions and will not match.",
    "Topic assignment happens at prompt creation and is editable in Prompts — re-tagging a prompt moves its answers between topics.",
    FOOTNOTE_METRICS,
  ],
};

/* --------------------------------------------------------------- sentiment */

/* Theme share is computed over the 602 occurrences of the five listed themes
   (214 + 187 + 96 + 61 + 44) — see the added footnote. */
const sentimentBase = sentimentReport({
  brand: "Nike",
  positivePct: "74%",
  positiveDelta: "+3pt",
  negativePct: "26%",
  answersAnalyzed: "186",
  positiveThemes: "Cushioning and comfort · Outsole durability · Return experience",
  negativeThemes: "Price at full retail · Break-in time",
  series: sentimentSeries,
  xLabels: insightsDays,
  themes: [
    { theme: "Cushioning and comfort", tone: "Positive", mentions: "214", share: "35.5%", delta: "+28" },
    { theme: "Outsole durability", tone: "Positive", mentions: "187", share: "31.1%", delta: "+11" },
    { theme: "Price at full retail", tone: "Negative", mentions: "96", share: "15.9%", delta: "+34 (trending)" },
    { theme: "Break-in time", tone: "Negative", mentions: "61", share: "10.1%", delta: "-9" },
    { theme: "Wide-fit availability", tone: "Positive", mentions: "44", share: "7.3%", delta: "+6" },
  ],
  receipt: {
    platform: "ChatGPT",
    date: "Aug 2",
    region: "US",
    theme: "Price at full retail (negative)",
    quote:
      "…Nike is the strongest option technically, with best-in-class cushioning, though paying full retail adds up beyond ~40 miles a week — budget-sensitive runners sometimes choose Adidas…",
    sources: "nike.com/pegasus (cached Jun) · runnersworld.com",
  },
});

export const sentimentSpec: ReportSpec = {
  ...sentimentBase,
  summary: [
    ...(sentimentBase.summary ?? []),
    {
      label: "Trending negative",
      value: "Price at full retail — 96 mentions",
      delta: "+34",
      note: "Traces to a July price change: 31 of the 34 new occurrences cite the old cached pricing page. Fixable at source.",
    },
  ],
  sections: [
    ...sentimentBase.sections,
    {
      title: "Engine sub-queries behind the receipt",
      note: "Searches the assistant ran on its own before answering — what it was actually looking for.",
      columns: ["Sub-query"],
      rows: [['"nike pegasus price 2026"'], ['"nike vs adidas running shoe cost"']],
    },
  ],
  footnotes: [
    ...(sentimentBase.footnotes ?? []),
    "Theme share is of the 602 occurrences across the five listed themes (214 + 187 + 96 + 61 + 44); shares round to 99.9%.",
    "One answer can carry several themes, so theme occurrences exceed the 186 answers analyzed.",
  ],
};

/* ---------------------------------------------------------------- shopping */

export const shoppingSpec: ReportSpec = {
  module: "Answer Engine Insights · Shopping",
  brand: "Nike",
  window: WINDOW_30D,
  summary: [
    {
      label: "Recommendation rate",
      value: "31.4%",
      delta: "+2.2pt",
      note: `${METRICS.shopping_visibility.plain}. Share of purchase-intent conversations where a Nike product is recommended.`,
    },
    {
      label: "Top recommended product",
      value: "Pegasus 41 — rank #1, 218 mentions",
      delta: "+31",
      note: "Wins on cushioning, fit and durability, and leads on ChatGPT and AI Overviews.",
    },
    {
      label: "Closest rival product",
      value: "Adidas Ultraboost 5 — rank #2, 184 mentions",
      delta: "-12",
      note: "Beats Pegasus on Perplexity, where recommendations lean on recent editorial reviews.",
    },
    {
      label: "Attribute that decides the answer",
      value: "Cushioning — 34% of influence",
      note: "What drives AI recommendations in this category; price is last at 9%.",
    },
    {
      label: "Head-to-head volume",
      value: "64 answers — Pegasus 41 vs Adidas Ultraboost 5",
      note: "The most common comparison AI stacks the brand into; 41 more pit Pegasus against budget shoes.",
    },
  ],
  sections: [
    seriesSection("Recommendation rate — daily trend", shoppingSeries, insightsDays, {
      unit: "%",
      note: "Share of purchase-intent conversations recommending a Nike product, by day.",
    }),
    {
      title: "Products in AI recommendations",
      note: "Every product AI names in this category's purchase-intent answers, ranked.",
      columns: ["Product", "Recommendation rank", "Mentions", "Platforms", "Attributes cited", "Change vs previous"],
      rows: [
        ["Pegasus 41 (You)", "#1", "218", "ChatGPT · AIO", "cushioning · fit · durability", "+31"],
        ["Adidas Ultraboost 5", "#2", "184", "Perplexity · ChatGPT", "comfort · price", "-12"],
        ["Metcon 9 (You)", "#3", "96", "ChatGPT", "stability · grip", "+8"],
        ["Under Armour HOVR", "#4", "71", "Claude · Gemini", "support", "-4"],
      ],
    },
    {
      title: "Attribute influence",
      note: "How much each product attribute drives the recommendation, across the category.",
      columns: ["Attribute", "Influence"],
      rows: [
        ["Cushioning", "34%"],
        ["Fit and sizing", "28%"],
        ["Durability", "17%"],
        ["Style", "12%"],
        ["Price", "9%"],
      ],
    },
    {
      title: "Compared against",
      note: "Products AI stacks next to yours inside the same answer.",
      columns: ["Comparison", "Answers"],
      rows: [
        ["Pegasus 41 vs Adidas Ultraboost 5", "64"],
        ["Pegasus 41 vs budget running shoes", "41"],
        ["Metcon 9 vs Under Armour HOVR", "28"],
      ],
    },
  ],
  footnotes: [
    "Why #2 on Perplexity: Perplexity recommendations weight recent editorial reviews. Adidas's June review coverage cites launch pricing; Nike's most-cited review is 14 months old.",
    "Source: the purchase-intent slice of the tracked prompt set (auto-tagged by intent classifier), matched to catalog products by name and alias.",
    "Shopping visibility is a beta metric — platform coverage is limited to shopping-capable surfaces.",
    FOOTNOTE_METRICS,
  ],
};

/* ----------------------------------------------------------------- regions */

export const regionsSpec: ReportSpec = {
  module: "Answer Engine Insights · Regions",
  brand: "Nike",
  window: WINDOW_30D,
  summary: [
    {
      label: "Strongest region",
      value: "United States — 41.2% visibility",
      delta: "+2.4pt",
      note: `${METRICS.region_visibility.plain}. 33.4% share of voice and Nike leads.`,
    },
    {
      label: "Fastest-rising region",
      value: "DACH — 27.4% visibility",
      delta: "+3.9pt",
      note: "Rising on earned sources only: German answers cite help.nike.com 4× less than English answers. Adidas still leads.",
    },
    {
      label: "Weakest region",
      value: "Japan — 9.8% visibility",
      delta: "flat",
      note: "8.1% share of voice, Under Armour leads. No movement in the window.",
    },
    {
      label: "Only declining region",
      value: "France — 22.1% visibility",
      delta: "-0.8pt",
      note: "Puma leads French answers; the sole region losing ground this window.",
    },
    {
      label: "Coverage",
      value: "8 regions, 5 languages tracked",
      note: "The six regions with reportable volume are listed below; the world map shades all tracked regions.",
    },
  ],
  sections: [
    seriesSection("Regional visibility — daily trend by region", regionsSeries, insightsDays, {
      unit: "%",
      note: "Visibility in each charted region, by day. Each line ends on that region's visibility in the by-region table below.",
    }),
    {
      title: "Region rank",
      note: "Tracked regions ordered by visibility.",
      columns: ["Rank", "Region", "Visibility", "Change vs previous"],
      rows: [
        ["1", "United States", "41.2%", "+2.4"],
        ["2", "United Kingdom", "33.8%", "+1.6"],
        ["3", "DACH", "27.4%", "+3.9"],
        ["4", "France", "22.1%", "-0.8"],
        ["5", "Brazil", "12.2%", "+1.1"],
        ["6", "Japan", "9.8%", "—"],
      ],
    },
    {
      title: "By region",
      note: "Visibility and share of voice per region, with the answer language and who leads there.",
      columns: ["Region", "Language", "Visibility", "Visibility", "Change vs previous", "Leading brand"],
      rows: [
        ["United States", "English", "41.2%", "33.4%", "+2.4", "Nike (You)"],
        ["United Kingdom", "English", "33.8%", "27.2%", "+1.6", "Nike (You)"],
        ["DACH", "German", "27.4%", "21.8%", "+3.9", "Adidas"],
        ["France", "French", "22.1%", "18.6%", "-0.8", "Puma"],
        ["Brazil", "Portuguese", "12.2%", "10.4%", "+1.1", "Adidas"],
        ["Japan", "Japanese", "9.8%", "8.1%", "—", "Under Armour"],
      ],
    },
  ],
  footnotes: [
    "Translation gap: German answers cite help.nike.com 4× less than English answers — DACH visibility is rising on earned sources only. Localizing the top 12 product pages is projected at +4.2pt regional visibility.",
    "Source: region-pinned prompt runs (Accept-Language + geo-routed egress per region, localized prompt translations where configured).",
    "Regional runs are weekly by default (daily on Enterprise), so regional figures lag the all-region numbers on Overview.",
    FOOTNOTE_METRICS,
  ],
};

/* ------------------------------------------------- topic detail — running shoes */

export const runningShoesSpec: ReportSpec = {
  module: "Answer Engine Insights · Topic: Running shoes",
  brand: "Nike",
  window: WINDOW_30D,
  summary: [
    {
      label: METRICS.topic_visibility.label,
      value: "42.6%",
      delta: "+6.2pt",
      note: `${METRICS.topic_visibility.plain}. The workspace's strongest topic, and its fastest-rising one.`,
    },
    {
      label: "Rank in topic",
      value: "#1 of 4 brands",
      note: "Nike 42.6% · Adidas 28.4% · Brooks Running 14.1% · Puma 11.9%. The 14.2pt lead over Adidas is the widest in any topic.",
    },
    {
      label: "Prompts in topic",
      value: "64",
      note: `${METRICS.prompts_tracked.plain}. 64 of the workspace's 412 tracked prompts sit in this topic.`,
    },
    {
      label: "Best-performing prompt",
      value: '"best running shoes for marathon training" — 78%',
      delta: "+6",
      note: `${METRICS.avg_answer_position.plain}: this prompt averages position 1.4, the earliest mention in the topic.`,
    },
    {
      label: "Weakest tracked prompt",
      value: '"how long do running shoes actually last" — 52%',
      delta: "+3",
      note: "An informational prompt where third-party guides out-cite nike.com — the clearest content gap in the topic.",
    },
  ],
  sections: [
    seriesSection("Topic visibility — daily trend", topicRunningShoesSeries, insightsDays, {
      unit: "%",
      note: "Visibility across the topic's 132 prompts, by day.",
    }),
    {
      title: "Rank in topic",
      note: "Topic-scoped competitor set — specialist running brands appear here but not in the workspace set.",
      columns: ["Rank", "Brand", "Share of answers"],
      rows: [
        ["1", "Nike (You)", "42.6%"],
        ["2", "Adidas", "28.4%"],
        ["3", "Brooks Running", "14.1%"],
        ["4", "Puma", "11.9%"],
      ],
    },
    {
      title: "Prompts in this topic",
      note: "Per-prompt visibility and first-mention position (lower position is better).",
      columns: ["Prompt", "Visibility", "Avg. position", "Change vs previous"],
      rows: [
        ["best running shoes for marathon training", "78%", "1.4", "+6"],
        ["how long do running shoes actually last", "52%", "2.3", "+3"],
        ["running shoes that work for wide feet", "61%", "1.8", "-1"],
      ],
    },
  ],
  footnotes: [
    "The demo ships the first page of this topic's prompt rows; all 64 are exportable on live workspaces.",
    "Competitor set is topic-scoped, so brand shares here will not match the workspace-wide share of voice on Overview.",
    FOOTNOTE_SAMPLING,
    FOOTNOTE_METRICS,
  ],
};
