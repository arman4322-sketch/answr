import type { ReportSpec } from "@/lib/export/report";
import { WINDOW_30D, seriesSection } from "@/lib/export/reports";
import { METRICS } from "@/lib/metrics";
import { demandKeywordTrend, demandKeywordTrendLabels } from "@/lib/data/demand";

/* Demand → executive CSVs.

   Demand is the only module whose window is monthly rather than daily, so the
   watchlist report states volumes as monthly prompt volume and the keyword
   report carries the bi-weekly volume curve (Feb → Aug) rather than a 30-day
   series. Both open with the headline volumes and their deltas in plain
   English before any table. */

const FOOTNOTE_PANEL =
  "Source: Answr's opt-in consumer research panel (2.1M conversations/month) — anonymized, consented conversation logs licensed from panel providers — blended with licensed search-volume data as a prior for long-tail stability.";
const FOOTNOTE_ROUNDING =
  "Volumes are rounded for display; keywords with fewer than 30 panel observations are shrunk toward the search-volume prior and carry a credible interval in the detail view.";
const FOOTNOTE_METRICS = "Full metric definitions: METRICS.md, or the ⓘ beside each figure in-app.";

export const demandSpec: ReportSpec = {
  module: "Demand · Watchlists",
  brand: "Nike",
  window: "Last 30 days (vs previous 30 days) · monthly prompt volume",
  summary: [
    {
      label: "Core category volume",
      value: "486K / month across 12 keywords",
      delta: "+8%",
      note: `${METRICS.demand_volume.plain}. The category people actually ask AI about, and it is still growing.`,
    },
    {
      label: "Competitor-term volume",
      value: "214K / month across 8 keywords",
      delta: "+21%",
      note: "Keywords that name a rival brand — growing nearly 3× faster than the core category. Comparison demand is where the category is heading.",
    },
    {
      label: "Largest keyword",
      value: '"best running shoes" — 128K / month',
      delta: "+12K",
      note: "Commercial intent, and Nike is the top brand in its answers at 34%. The single biggest prize on this screen.",
    },
    {
      label: "Biggest brand gap",
      value: '"nike vs adidas" — 41K / month, Adidas leads at 38%',
      delta: "+9K",
      note: "A comparison keyword that names Nike and still favours Adidas. Action #92 targets exactly this.",
    },
    {
      label: "Only declining keyword",
      value: '"carbon plate shoe benefits" — 38K / month',
      delta: "-2K",
      note: "Informational, and Brooks leads it at 26%. The one term losing volume in the watchlist.",
    },
    {
      label: "Search quota",
      value: "18 searches left this month",
      note: "Keyword lookups outside the watchlists draw from the monthly quota on the Scale plan.",
    },
  ],
  sections: [
    {
      title: "Watchlists",
      note: "The keyword groups under weekly digest, with their combined monthly volume.",
      columns: ["Watchlist", "Keywords", "Combined volume", "Change vs previous"],
      rows: [
        ["Core category", "12", "486K", "+8%"],
        ["Competitor terms", "8", "214K", "+21%"],
      ],
    },
    {
      title: "Core category — keywords",
      note: "Sorted by prompt volume. Showing the 6 keywords on screen of the watchlist's 12.",
      columns: ["Keyword", "Intent", "Prompt volume", "Change vs previous", "Top brand in answers"],
      rows: [
        ["best running shoes", "Commercial", "128K", "+12K", "Nike · 34%"],
        ["best training shoes", "Commercial", "94K", "+6K", "Adidas · 31%"],
        ["marathon training shoes", "Informational", "76K", "+3K", "Nike · 29%"],
        ["nike vs adidas", "Comparison", "41K", "+9K", "Adidas · 38%"],
        ["carbon plate shoe benefits", "Informational", "38K", "-2K", "Brooks · 26%"],
        ["running shoe size guide", "Informational", "29K", "+1K", "Nike · 22%"],
      ],
    },
  ],
  footnotes: [
    "The demo ships the first 6 of the Core category watchlist's 12 keywords; the full list exports on live workspaces.",
    FOOTNOTE_PANEL,
    FOOTNOTE_ROUNDING,
    FOOTNOTE_METRICS,
  ],
};

export const demandKeywordSpec: ReportSpec = {
  module: 'Demand · keyword "best running shoes"',
  brand: "Nike",
  window: "Monthly prompt volume · Feb – Aug 2026, 30-day deltas",
  summary: [
    {
      label: METRICS.demand_volume.label,
      value: "128K / month",
      delta: "+12K vs previous",
      note: `${METRICS.demand_volume.plain}. Commercial intent — people asking this are close to buying.`,
    },
    {
      label: "Growth since February",
      value: "79K → 128K (+62%)",
      note: "Demand accelerated after mid-June: ChatGPT volume grew 13% following the June shopping rollout.",
    },
    {
      label: "Where it is asked",
      value: "ChatGPT 61K · Gemini 28K · Perplexity 22K · Claude 17K",
      note: "ChatGPT alone is 48% of the keyword's volume and is adding 7.2K a month — the platform to win first.",
    },
    {
      label: "Who asks",
      value: "25-34 (37%) · $75-150K income (46%) · male (58%) · US (44%)",
      note: "The buyer behind the keyword, from the consented panel — rephrased for privacy.",
    },
    {
      label: "Fastest-growing long tail",
      value: '"carbon plate running shoes" — 41K',
      delta: "+38%",
      note: "The steepest riser under the running-shoes parent (312K, +9%). Worth its own tracked prompts.",
    },
    {
      label: "Coverage",
      value: "In 2 watchlists",
      note: "Tracked in both Core category and Competitor terms, so it appears in both weekly digests.",
    },
  ],
  sections: [
    seriesSection("Prompt volume — bi-weekly trend", demandKeywordTrend, demandKeywordTrendLabels, {
      unit: "K/month",
      note: "Monthly conversations containing the keyword, sampled bi-weekly from Feb 1 to Aug 1.",
    }),
    {
      title: "By platform",
      note: "Where the keyword's volume sits, and how each platform is moving.",
      columns: ["Platform", "Volume", "Change vs previous", "Tracked"],
      rows: [
        ["ChatGPT", "61K", "+7.2K", "yes"],
        ["Gemini", "28K", "+2.1K", "yes"],
        ["Perplexity", "22K", "+1.9K", "yes"],
        ["Claude", "17K", "-0.4K", "no"],
      ],
    },
    {
      title: "Who asks — age",
      note: "Share of the keyword's demand by age band; 25-34 is up 2pt on the previous window.",
      columns: ["Age band", "Share of demand"],
      rows: [
        ["18-24", "9%"],
        ["25-34", "37%"],
        ["35-44", "30%"],
        ["45-54", "18%"],
        ["55+", "6%"],
      ],
    },
    {
      title: "Who asks — household income, gender, region",
      note: "The remaining panel demographics for this keyword; $150K+ is up 1pt, US up 3pt, gender stable.",
      columns: ["Dimension", "Segment", "Share"],
      rows: [
        ["Household income", "<$75K", "21%"],
        ["Household income", "$75-150K", "46%"],
        ["Household income", "$150K+", "33%"],
        ["Gender", "Male", "58%"],
        ["Gender", "Female", "39%"],
        ["Gender", "Other", "3%"],
        ["Region", "United States", "44%"],
        ["Region", "United Kingdom", "14%"],
        ["Region", "Germany", "9%"],
        ["Region", "India", "8%"],
        ["Region", "Canada", "6%"],
      ],
    },
    {
      title: "Keyword tree",
      note: "Parent term and its long tail, by prompt volume.",
      columns: ["Level", "Keyword", "Volume", "Change vs previous"],
      rows: [
        ["Parent", "running shoes", "312K", "+9%"],
        ["Long tail", "best running shoes", "128K", "+10%"],
        ["Long tail", "running shoes for flat feet", "96K", "-6%"],
        ["Long tail", "carbon plate running shoes", "41K", "+38%"],
        ["Long tail", "trail running shoes", "24K", "+12%"],
        ["Long tail", "nike pegasus review", "8.4K", "+22%"],
      ],
    },
    {
      title: "Asked recently",
      note: "Real questions from the panel, rephrased for privacy.",
      columns: ["Question", "Platform", "Date"],
      rows: [
        ['"best running shoes for a first marathon under $150"', "ChatGPT", "Aug 2"],
        ['"running shoes that work for both road and treadmill"', "Gemini", "Aug 1"],
        ['"are carbon plate running shoes worth it for a casual runner"', "Perplexity", "Jul 30"],
      ],
    },
  ],
  footnotes: [
    "ChatGPT demand grew 13% after the June shopping rollout — the inflection visible in the trend from mid-June.",
    FOOTNOTE_PANEL,
    FOOTNOTE_ROUNDING,
    "Panel questions are paraphrased before storage; no verbatim user text leaves the panel.",
    FOOTNOTE_METRICS,
  ],
};
