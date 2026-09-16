import type { ReportSpec, ReportSection, SummaryStat } from "@/lib/export/report";
import { seriesSection } from "@/lib/export/reports";
import { METRICS } from "@/lib/metrics";
import type { LiveMetrics } from "@/lib/live/metrics";
import { dayLabel, historyNote, int, pct, s, seriesDelta } from "./aei-format";

/* Answer Engine Insights → executive CSVs, built from live metrics.

   The fixture specs that used to live here are gone: every cell below is either
   a value the sampler measured (lib/live/metrics) or a plain statement that a
   figure is not collected. Nothing is estimated, and there is no "Change vs
   previous" column where there is no previous window to compare against — the
   report states the history it really covers instead.

   Two shapes:
   - `topicsSpec(m)` — the main screen's report, assembled from the metrics the
     screen itself renders, so the file and the page can never disagree.
   - `regionsSpec` / `audience-free` sibling specs — screens whose data the
     connected providers do not produce at all. Their export downloads an honest
     one-line report naming what would have to exist, rather than a fixture. */

const FOOTNOTE_METRICS = "Full metric definitions: METRICS.md, or the ⓘ beside each figure in-app.";
const FOOTNOTE_SAMPLING =
  "Source: the workspace's own sampled answers — each tracked prompt run against every configured platform, stored with full text and citations (lib/live/metrics).";
const FOOTNOTE_TOPICS =
  "No topic breakdown is included: the sampler stores prompts without a subject tag, so answers cannot be grouped into topics. Nothing here is estimated per topic.";

/* ------------------------------------------------------------------ topics */

/** The main Insights screen's report — measured values only. */
export function topicsSpec(m: LiveMetrics): ReportSpec {
  const brand = m.workspace?.brand ?? "Workspace";
  const visDelta = seriesDelta(m.series, (p) => p.visibility);
  const sovDelta = seriesDelta(m.series, (p) => p.shareOfVoice);
  const first = m.series[0]?.date;
  const last = m.series[m.series.length - 1]?.date;
  const competitors = m.workspace?.competitors.length ?? 0;

  const summary: SummaryStat[] = [
    {
      label: METRICS.visibility_score.label,
      value: pct(m.visibilityScore),
      delta: visDelta === null ? undefined : `${visDelta >= 0 ? "+" : "-"}${Math.abs(visDelta).toFixed(1)}pt`,
      note:
        `${METRICS.visibility_score.plain}. Scored over ${int(m.answersSampled)} sampled answer${s(m.answersSampled)}` +
        (visDelta === null ? `. Only ${historyNote(m.days)} — no change reported.` : ` across ${historyNote(m.days)}.`),
    },
    {
      label: METRICS.share_of_voice.label,
      value: pct(m.shareOfVoice),
      delta: sovDelta === null ? undefined : `${sovDelta >= 0 ? "+" : "-"}${Math.abs(sovDelta).toFixed(1)}pt`,
      note: `${METRICS.share_of_voice.plain}. ${brand} against ${int(competitors)} tracked competitor${s(competitors)}.`,
    },
    {
      label: "Strongest platform",
      value: m.platforms[0] ? `${m.platforms[0].label} — ${pct(m.platforms[0].visibility)}` : "No platform has answered yet",
      note: m.platforms[0]
        ? `${METRICS.platform_appearances.plain}. ${int(m.platforms[0].appearances)} of ${int(m.platforms[0].answers)} answer${s(m.platforms[0].answers)} from this engine name ${brand}.`
        : "No engine has returned an answer for the tracked prompts yet.",
    },
    {
      label: METRICS.avg_answer_position.label,
      value: m.avgAnswerPosition == null ? "Not named yet" : m.avgAnswerPosition.toFixed(1),
      note: `${METRICS.avg_answer_position.plain}. Named ahead of every competitor in ${int(m.answerRankFirst)} answer${s(m.answerRankFirst)}.`,
    },
    {
      label: METRICS.prompts_tracked.label,
      value: `${int(m.promptsTracked)} prompt${s(m.promptsTracked)}`,
      note: `${METRICS.prompts_tracked.plain}. Every figure in this report is computed over these prompts as one set — they carry no topic tags.`,
    },
    {
      label: METRICS.data_quality_sample.label,
      value: `${int(m.answersSampled)} answer${s(m.answersSampled)}`,
      note: `${METRICS.data_quality_sample.plain}. The sample every figure in this report is computed from.`,
    },
    {
      label: "Sampled history",
      value: `${int(m.days)} day${s(m.days)}`,
      note:
        m.lastRunAt == null
          ? "No runs collected yet."
          : `Days on which runs were actually collected${first && last ? ` (${dayLabel(first)} – ${dayLabel(last)})` : ""}. Trends are computed from these days only.`,
    },
  ];

  const sections: ReportSection[] = [];

  if (m.series.length > 0) {
    sections.push(
      seriesSection(
        "Visibility and share of voice — sampled days",
        [
          { id: "vis", label: "Visibility", color: "var(--ac)", points: m.series.map((p) => p.visibility) },
          { id: "sov", label: "Share of voice", color: "#7fa7d9", points: m.series.map((p) => p.shareOfVoice) },
        ],
        m.series.map((p) => p.date),
        { unit: "%", note: "One row per day the sampler ran. Days with no runs are absent rather than interpolated." }
      )
    );
    sections.push({
      title: "Runs collected per sampled day",
      note: "Prompt runs stored that day — the sample size behind that day's scores.",
      columns: ["Date", "Runs"],
      rows: m.series.map((p) => [p.date, p.runs]),
    });
  }

  sections.push({
    title: "Brand visibility comparison",
    note: "Every tracked brand's share of brand mentions across sampled answers. Rows sum to 100%.",
    columns: ["Rank", "Brand", "Share of mentions", "Answers naming it"],
    rows: m.brands.map((b, i) => [String(i + 1), b.isBrand ? `${b.name} (You)` : b.name, pct(b.share), b.mentions]),
  });

  sections.push({
    title: "Visibility by platform",
    note: "Answers naming the brand ÷ answers returned, per engine that answered the latest run of each prompt.",
    columns: ["Platform", "Visibility", "Answers naming brand", "Answers returned"],
    rows: m.platforms.map((p) => [p.label, pct(p.visibility), p.appearances, p.answers]),
  });

  sections.push({
    title: "Tracked prompts — latest sampled answer",
    note: "One row per tracked prompt, from its most recent run. No topic column: prompts carry no subject tag.",
    columns: ["Prompt", "Brand named", "Mention position", "Competitors named", "Platforms that answered", "Last sampled"],
    rows: m.prompts.map((p) => [
      p.prompt,
      p.mentioned ? "yes" : "no",
      p.rank == null ? "" : p.rank.toFixed(1),
      p.competitorsMentioned.join(" · "),
      p.providersAnswered,
      dayLabel(new Date(p.ts).toISOString().slice(0, 10)),
    ]),
  });

  return {
    module: "Answer Engine Insights",
    brand,
    window:
      m.series.length > 0 && first && last
        ? `Sampled history: ${int(m.days)} day${s(m.days)} (${dayLabel(first)} – ${dayLabel(last)})`
        : "No sampled runs yet",
    windowNote:
      "This report covers only the days the sampler actually ran — there is no 30-day comparison window, so change-vs-previous columns are omitted rather than estimated.",
    summary,
    sections,
    footnotes: [
      FOOTNOTE_SAMPLING,
      FOOTNOTE_TOPICS,
      "Visibility is platform- and position-weighted; share of voice is unweighted mention share. They answer different questions and will not match.",
      FOOTNOTE_METRICS,
    ],
  };
}

/* ------------------------------------------------- not collected (pattern B) */

/** An export for a screen with no live source: says what is missing, nothing else. */
function unavailableSpec(args: { module: string; feature: string; needs: string; alsoMissing?: string[] }): ReportSpec {
  return {
    module: args.module,
    brand: "Workspace",
    window: "Not collected",
    windowNote: `${args.feature} is not being collected, so this file carries no figures for it.`,
    summary: [
      {
        label: args.feature,
        value: "Not available yet",
        note: `${args.needs} No estimated figures are shown.`,
      },
    ],
    sections: [
      {
        title: `${args.feature} — not collecting data yet`,
        note: "Nothing is estimated below; each row states a requirement that is not met.",
        columns: ["What this report would contain", "Why it is empty"],
        rows: [
          [args.feature, args.needs],
          ...(args.alsoMissing ?? []).map((x) => [x, "Same requirement — not produced by the sampler."] as string[]),
        ],
      },
    ],
    footnotes: [
      "This export exists so the screen's button is honest: there is no sampled data behind this feature, and none is invented here.",
      "Measured figures for this workspace are in the Answer Engine Insights and Overview reports.",
      FOOTNOTE_METRICS,
    ],
  };
}

export const regionsSpec: ReportSpec = unavailableSpec({
  module: "Answer Engine Insights · Regions",
  feature: "Regional visibility",
  needs:
    "This needs region-scoped sampling runs (locale-pinned prompts, geo-routed requests), which the nightly sampler doesn't perform — every stored answer is from one unscoped run.",
  alsoMissing: ["Visibility per region", "Share of voice per region", "Answer language per region"],
});

export const shoppingSpec: ReportSpec = unavailableSpec({
  module: "Answer Engine Insights · Shopping",
  feature: "Shopping and product recommendations",
  needs:
    "This needs purchase-intent classification and a product catalog matched against answer text, neither of which the sampler or the scoring layer produces.",
  alsoMissing: ["Recommendation rate", "Products named in answers", "Attribute influence", "Head-to-head comparisons"],
});

export const sentimentSpec: ReportSpec = unavailableSpec({
  module: "Answer Engine Insights · Sentiment",
  feature: "Sentiment and themes",
  needs:
    "This needs per-mention sentiment classification and theme extraction over stored answers, which no step of the pipeline runs — answers are stored and scored for mentions only.",
  alsoMissing: ["Positive / negative split", "Themes driving sentiment", "Representative answer receipts"],
});

export const runningShoesSpec: ReportSpec = unavailableSpec({
  module: "Answer Engine Insights · Topic detail",
  feature: "Per-topic visibility",
  needs:
    "This needs per-prompt topic tagging in the sampler, which it doesn't do — prompts are stored without a subject, so answers cannot be grouped into a topic.",
  alsoMissing: ["Topic visibility", "Rank within a topic", "Prompts in a topic"],
});
