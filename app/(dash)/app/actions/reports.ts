import type { ReportSpec } from "@/lib/export/report";
import { WINDOW_30D, seriesSection } from "@/lib/export/reports";
import { METRICS } from "@/lib/metrics";
import { impactHistory, impactProjection, impactXLabels } from "@/lib/data/optimize";

/* Actions → executive CSVs.

   The queue report answers the only two questions a VP asks of this screen —
   how much visibility is on the table, and what has to ship to get it — so it
   leads with the queue counts and the impact model, carries the measured and
   projected visibility curves as one dated table, then lists every action with
   its estimate, effort and blast radius. The detail report is the brief for one
   action, exportable on its own. */

const FOOTNOTE_MODEL =
  "Source: the recommendation engine's gap analysis for this workspace (which prompts and topics the brand loses, and why), scored against cohort priors from comparable workspaces.";
const FOOTNOTE_MEASURE =
  "Measured lift uses difference-in-differences — the action's target prompts against untouched control prompts — so market-wide drift is stripped out. Each measurement window closes 14 days after ship.";
const FOOTNOTE_METRICS = "Full metric definitions: METRICS.md, or the ⓘ beside each figure in-app.";

export const actionsSpec: ReportSpec = {
  module: "Actions",
  brand: "Nike",
  window: WINDOW_30D,
  summary: [
    {
      label: METRICS.impact_estimate.label,
      value: "+9.4pt available",
      note: `${METRICS.impact_estimate.plain}. Visibility goes 34.2% → 43.6% if all 24 open actions ship: Content +4.1pt, Technical +3.5pt, Authority +1.8pt.`,
    },
    {
      label: "Open",
      value: "24",
      note: `${METRICS.actions_queue.plain}. Nobody has started these yet — they hold the entire +9.4pt.`,
    },
    {
      label: "In progress",
      value: "6",
      note: "Someone is working on them now. Action #87 (unblock AI crawlers on /help) is the highest-impact one in flight at +1.9pt.",
    },
    {
      label: "Shipped · 90d",
      value: "38",
      note: "Fixes finished in the last three months. Their measured lift is what calibrates the projection below.",
    },
    {
      label: "Model accuracy to date",
      value: "Action #64 measured +0.6pt against +0.4pt estimated",
      note: `${METRICS.measured_lift.plain}. The most recent closed measurement beat its estimate by 50%.`,
    },
    {
      label: "Highest-scoring open action",
      value: "#92 — Nike vs Adidas comparison page (+2.8pt, effort M, 41 prompts)",
      note: `${METRICS.action_score.plain}. Biggest single win in the queue; ChatGPT cites comparison pages 3× more than category pages.`,
    },
  ],
  sections: [
    seriesSection(
      "Impact model — measured visibility and projection",
      [
        { id: "measured", label: "Measured", color: "var(--ac)", points: impactHistory },
        { id: "projected", label: "Projected", color: "#b98ed9", points: impactProjection },
      ],
      impactXLabels,
      {
        unit: "%",
        note: "The first 30 rows are measured days (Jul 7 – Aug 5); the Proj rows are the modelled path if all open actions ship, at 6-day steps to +90d.",
      }
    ),
    {
      title: "Action queue",
      note: "Every action on the board, with its estimated impact, effort and how many tracked prompts it touches.",
      columns: ["#", "Action", "Category", "Status", "Owner", "Est. impact", "Effort", "Prompts affected"],
      rows: [
        ["92", 'Publish a "Nike vs Adidas" running-shoe comparison page', "Content", "OPEN", "DO", "+2.8pt", "M", "41"],
        ["87", "Add llms.txt and allow AI crawlers on /help", "Technical", "IN PROGRESS", "MK", "+1.9pt", "S", "28"],
        ["81", "Add FAQ + Product schema to shoe product pages", "Technical", "OPEN", "—", "+1.4pt", "S", "16"],
        ["76", "Pitch Wirecutter's running-shoe roundup", "Authority", "OPEN", "JT", "+1.2pt", "L", "33"],
        ["64", "Consolidate duplicate help-center pages", "Technical", "SHIPPED Jul 22", "—", "+0.4pt est.", "—", "measured +0.6pt"],
      ],
    },
    {
      title: "Impact by category",
      note: "Where the +9.4pt sits, so the work can be staffed against the right team.",
      columns: ["Category", "Estimated visibility gain"],
      rows: [
        ["Content actions", "+4.1pt"],
        ["Technical actions", "+3.5pt"],
        ["Authority actions", "+1.8pt"],
        ["Total available", "+9.4pt"],
      ],
    },
    {
      title: "Why each open action exists",
      note: "The evidence the recommendation engine cited, verbatim.",
      columns: ["#", "Evidence"],
      rows: [
        [
          "92",
          "ChatGPT cites comparison pages 3× more often than category pages for commercial prompts. Adidas's own comparison page is cited in 31 answers where Nike is absent.",
        ],
        [
          "87",
          "AI crawlers were blocked on 214 help-center pages last month. Help citations lag running-guide citations 5:1 despite higher answer relevance.",
        ],
        [
          "81",
          'AI Overviews pulls pricing answers from structured data. Competitors with Product schema win 68% of "how much does X cost" prompts.',
        ],
        [
          "76",
          "wirecutter.com is a top-5 source across all platforms but cites Nike in only 9% of relevant answers. The 2026 roundup refresh is scheduled for September.",
        ],
      ],
    },
  ],
  footnotes: [
    "The demo ships the top five actions; all 24 open actions export on live workspaces.",
    FOOTNOTE_MODEL,
    FOOTNOTE_MEASURE,
    "The projection applies diminishing returns — shipping every action does not simply add the individual estimates.",
    FOOTNOTE_METRICS,
  ],
};

export const action92Spec: ReportSpec = {
  module: "Actions · #92 comparison page",
  brand: "Nike",
  window: WINDOW_30D,
  summary: [
    {
      label: "Action",
      value: '#92 — Publish a "Nike vs Adidas" running-shoe comparison page',
      note: "Content · topic Running shoes · effort M. Created Jul 28 by the recommendation engine, assigned to Dana Okafor, status OPEN.",
    },
    {
      label: "Current performance",
      value: "28.6% share of voice (topic scope)",
      delta: "→ 31.4% projected (+2.8pt)",
      note: `${METRICS.impact_estimate.plain}. The single largest estimate in the open queue.`,
    },
    {
      label: "Prompts affected",
      value: "41",
      note: "Tracked prompts whose answers this page could change — 10% of the workspace's 412.",
    },
    {
      label: "The gap in one line",
      value: "Adidas's comparison page appears in 31 answers where Nike is absent",
      note: "On prompts Nike already ranks #1 for elsewhere. A neutral, well-structured comparison page redirects those citations.",
    },
    {
      label: "Progress",
      value: "1 of 3 steps done",
      note: "Outline complete (Aug 1, Dana). Drafting and publishing remain.",
    },
  ],
  sections: [
    {
      title: "Why this matters",
      note: "The engine's reasoning, verbatim.",
      columns: ["Rationale"],
      rows: [
        [
          "ChatGPT cites comparison pages 3× more often than category pages for commercial prompts. Adidas's own comparison page currently appears in 31 answers where Nike is absent — for prompts you already rank #1 on elsewhere. A neutral, well-structured comparison page redirects those citations.",
        ],
      ],
    },
    {
      title: "Implementation",
      note: "The checklist as it stands in-app.",
      columns: ["Step", "Status", "Detail"],
      rows: [
        ["1", "Done — Aug 1, Dana", "Outline from the 41 affected prompts — mirror the questions AI actually answers"],
        ["2", "Open", "Draft with a criteria table and FAQ schema; keep brand tone neutral — cited pages skew factual"],
        ["3", "Open", "Publish under /compare, submit to index, add to Watched URLs"],
      ],
    },
    {
      title: "References",
      note: "Pages AI already quotes for these prompts — the pattern to beat.",
      columns: ["URL", "What it is", "Citations · 30d"],
      rows: [
        ["adidas.com/compare", "The page winning your prompts", "31"],
        ["runnersworld.com/compare/…", "Comparison grid AI leans on", "22"],
        ["reddit.com/r/running/…", "Thread framing the comparison", "12"],
      ],
    },
    {
      title: "Affected prompts — preview",
      note: "First rows of the 41 tracked prompts this action targets.",
      columns: ["Prompt"],
      rows: [
        ["best running shoes for marathon training"],
        ["Nike vs Adidas running shoes"],
        ["compare Nike and Adidas for marathon training"],
      ],
    },
  ],
  footnotes: [
    "The demo ships the first page of affected prompts; all 41 export on live workspaces.",
    FOOTNOTE_MODEL,
    "Current performance is the reading the screen labels it with — share of voice, topic scope. Topic visibility for Running shoes is reported separately in Answer Engine Insights.",
    FOOTNOTE_METRICS,
  ],
};
