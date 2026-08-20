/* Per-module executive report builders.

   Each returns a ReportSpec for lib/export/report.ts → buildExecutiveCsv, so an
   Export downloads the whole story of a screen (headline metrics with deltas and
   plain-English reads, the trend behind them, and every supporting table) rather
   than the one table the button happened to sit next to.

   Builders take the screen's own facts as arguments so they stay in step with
   what is rendered — no second source of truth to drift. */

import type { ReportSpec, ReportSection, SummaryStat } from "@/lib/export/report";
import type { TrendSeries } from "@/components/app/charts/TrendChart";

export const WINDOW_30D = "Last 30 days (vs previous 30 days)";

/** Turn chart series into a dated table: one row per point, one column per series. */
export function seriesSection(
  title: string,
  series: TrendSeries[],
  xLabels: string[],
  opts: { unit?: string; note?: string } = {}
): ReportSection {
  const unit = opts.unit ?? "";
  return {
    title,
    note: opts.note,
    columns: ["Date", ...series.map((s) => `${s.label}${unit ? ` (${unit})` : ""}`)],
    rows: xLabels.map((d, i) => [d, ...series.map((s) => (s.points[i] !== undefined ? s.points[i] : ""))]),
  };
}

/* ------------------------------------------------------------------ sentiment */

export function sentimentReport(args: {
  brand: string;
  positivePct: string;
  positiveDelta: string;
  negativePct: string;
  answersAnalyzed: string;
  positiveThemes: string;
  negativeThemes: string;
  series: TrendSeries[];
  xLabels: string[];
  themes: { theme: string; tone: string; mentions: string; share: string; delta: string }[];
  receipt?: { platform: string; date: string; region: string; theme: string; quote: string; sources: string };
}): ReportSpec {
  const summary: SummaryStat[] = [
    {
      label: "Positive sentiment",
      value: args.positivePct,
      delta: args.positiveDelta,
      note: `Share of ${args.brand} mentions classified positive across sampled answers. Rising — see the drivers below.`,
    },
    {
      label: "Negative sentiment",
      value: args.negativePct,
      note: `Remainder of classified mentions. Concentrated in: ${args.negativeThemes}.`,
    },
    {
      label: "Answers analyzed",
      value: args.answersAnalyzed,
      note: "Sampled answers in which the brand appeared and was classified in this window.",
    },
    {
      label: "Leading positive themes",
      value: args.positiveThemes,
      note: "What answers praise most often — reinforce these in owned content.",
    },
    {
      label: "Leading negative themes",
      value: args.negativeThemes,
      note: "What answers criticize most often — the highest-leverage narrative to correct.",
    },
  ];

  const sections: ReportSection[] = [
    seriesSection("Positive sentiment — daily trend", args.series, args.xLabels, {
      unit: "%",
      note: "Daily positive-mention share over the reporting window.",
    }),
    {
      title: "Themes driving sentiment",
      note: "Recurring subjects in classified mentions, ranked by volume.",
      columns: ["Theme", "Tone", "Mentions", "Share of mentions", "Change vs previous"],
      rows: args.themes.map((t) => [t.theme, t.tone, t.mentions, t.share, t.delta]),
    },
  ];

  if (args.receipt) {
    sections.push({
      title: "Answer receipt — representative negative mention",
      note: "One verbatim sampled answer, with the sources the assistant cited.",
      columns: ["Platform", "Date", "Region", "Theme", "Answer excerpt", "Cited sources"],
      rows: [[args.receipt.platform, args.receipt.date, args.receipt.region, args.receipt.theme, args.receipt.quote, args.receipt.sources]],
    });
  }

  return {
    module: "Sentiment",
    brand: args.brand,
    window: WINDOW_30D,
    summary,
    sections,
    footnotes: [
      "Sentiment = LLM classification of each brand-mention span, calibrated against a human-audited set (Settings › Data quality).",
      "Positive + negative shares are of classified mentions, not of all sampled answers.",
      "Full metric definitions: METRICS.md, or the ⓘ beside each figure in-app.",
    ],
  };
}

/* ------------------------------------------------------------------- overview */

export function overviewReport(args: {
  brand: string;
  kpis: { label: string; value: string; delta?: string; note?: string }[];
  visibilitySeries: TrendSeries[];
  xLabels: string[];
  competitors: { rank: string; brand: string; sov: string; delta: string; topPlatform: string }[];
  platforms: { platform: string; visibility: string; delta: string }[];
  sources: { source: string; citations: string; delta: string }[];
}): ReportSpec {
  return {
    module: "Overview",
    brand: args.brand,
    window: WINDOW_30D,
    summary: args.kpis.map((k) => ({ label: k.label, value: k.value, delta: k.delta, note: k.note })),
    sections: [
      seriesSection("Visibility — daily trend vs competitors", args.visibilitySeries, args.xLabels, {
        unit: "%",
        note: "Share of sampled answers mentioning each brand, by day.",
      }),
      {
        title: "Competitive share of voice",
        note: "Of all brand mentions in the category's tracked prompts. Rows sum to 100%.",
        columns: ["Rank", "Brand", "Share of voice", "Change vs previous", "Strongest platform"],
        rows: args.competitors.map((c) => [c.rank, c.brand, c.sov, c.delta, c.topPlatform]),
      },
      {
        title: "Visibility by platform",
        note: "Where the brand is strongest and weakest across answer engines.",
        columns: ["Platform", "Visibility", "Change vs previous"],
        rows: args.platforms.map((p) => [p.platform, p.visibility, p.delta]),
      },
      {
        title: "Top cited sources",
        note: "Domains AI answers drew on most for these prompts — the pages worth influencing.",
        columns: ["Source", "Citations", "Change vs previous"],
        rows: args.sources.map((s) => [s.source, s.citations, s.delta]),
      },
    ],
    footnotes: [
      "Visibility is platform- and position-weighted; share of voice is unweighted mention share. They differ by design.",
      "Paused platforms are excluded from both (Settings › Platforms).",
      "Full metric definitions: METRICS.md, or the ⓘ beside each KPI in-app.",
    ],
  };
}

/* ------------------------------------------------------------------ generic */

/** Topic/region/audience/shopping screens: one headline + trend + one table. */
export function moduleReport(args: {
  module: string;
  brand: string;
  headline: { label: string; value: string; delta?: string; note?: string };
  extraSummary?: SummaryStat[];
  series?: TrendSeries[];
  xLabels?: string[];
  seriesUnit?: string;
  tableTitle: string;
  tableNote?: string;
  columns: string[];
  rows: (string | number)[][];
  footnotes?: string[];
}): ReportSpec {
  const sections: ReportSection[] = [];
  if (args.series?.length && args.xLabels?.length) {
    sections.push(seriesSection(`${args.headline.label} — daily trend`, args.series, args.xLabels, { unit: args.seriesUnit ?? "%" }));
  }
  sections.push({ title: args.tableTitle, note: args.tableNote, columns: args.columns, rows: args.rows });

  return {
    module: args.module,
    brand: args.brand,
    window: WINDOW_30D,
    summary: [args.headline, ...(args.extraSummary ?? [])],
    sections,
    footnotes: args.footnotes ?? ["Full metric definitions: METRICS.md, or the ⓘ beside each figure in-app."],
  };
}
