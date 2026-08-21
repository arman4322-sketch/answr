/* Prompts module fixture data — the per-platform answer corpus behind the
   prompt detail panel, its run history, and the add-prompts quota.

   THE POINT OF THE PRODUCT: the same question gets a genuinely different answer
   on every engine — different phrasing, different ordering of brands, different
   sources cited, and therefore a different mention rate for Nike. The platform
   tabs in the detail panel swap all of it.

   ── Coherence with the numbers already on screen ────────────────────────────
   The table row for "best running shoes for marathon training" reads
   Visibility 78% / Position 1.4, and those are PLATFORM-WEIGHTED figures.
   Platform weight = that platform's share of the workspace's tracked-prompt
   volume (see METRICS.md → visibility_score): ChatGPT .55, Perplexity .25,
   Claude .12, AI Overviews .08.

     mention rate  .55×78 + .25×86 + .12×71 + .08×64 = 78.0  → 78%  ✓
     avg position  .55×1.4 + .25×1.2 + .12×1.9 + .08×1.6 = 1.43 → 1.4  ✓

   The ChatGPT tab therefore keeps the frame's painted 78% / 1.4 / Positive /
   "Adidas, Asics" untouched; the other three tabs are new content.

   Each platform also ships its last 14 daily runs (Jul 23 → Aug 5, 2026 — the
   demo window's final fortnight). The runs reproduce their platform's headline:

     ChatGPT     11 of 14 mentioned = 79%  (30d 78%)  positions avg 1.36 → 1.4
     Perplexity  12 of 14 mentioned = 86%  (30d 86%)  positions avg 1.17 → 1.2
     Claude      10 of 14 mentioned = 71%  (30d 71%)  positions avg 1.90 → 1.9
     AI Overview  9 of 14 mentioned = 64%  (30d 64%)  positions avg 1.56 → 1.6

   The 14-run rate and the 30-day rate are shown side by side in the run-history
   sheet rather than pretended to be the same number. */

export type PlatformId = "chatgpt" | "perplexity" | "claude" | "aio";

/** One chunk of an answer; `highlight` marks the tracked brand's mention. */
export type AnswerSegment = { text: string; highlight?: boolean };

/** One daily run of the prompt on one platform. */
export type PromptRun = {
  /** "Aug 5" */
  date: string;
  mentioned: boolean;
  /** rank of the brand's first mention, "—" when not mentioned */
  position: string;
  /** "Positive" | "Neutral" | "Negative" | "—" */
  sentiment: string;
};

export type PlatformAnswer = {
  id: PlatformId;
  label: string;
  /** the answer text, with the brand mention marked for highlighting */
  segments: AnswerSegment[];
  citations: string[];
  /** headline mention rate over 30 days, e.g. "78%" */
  mentionRate: string;
  /** e.g. "↑ 6pt" */
  mentionDelta: string;
  mentionDeltaColor: string;
  avgPosition: string;
  sentiment: string;
  sentimentColor: string;
  competitors: string;
  /** 15-point path in the panel's 380×54 sparkline viewBox */
  sparkPath: string;
  /** share of tracked-prompt volume — the weight behind the 78% headline */
  weight: number;
  /** last 14 daily runs, newest first */
  runs: PromptRun[];
};

const GREEN = "#4cb782";
const RED = "#e5636e";

/** Jul 23 → Aug 5, 2026, newest first — the fortnight the run sheet shows. */
export const RUN_DATES = [
  "Aug 5", "Aug 4", "Aug 3", "Aug 2", "Aug 1",
  "Jul 31", "Jul 30", "Jul 29", "Jul 28", "Jul 27",
  "Jul 26", "Jul 25", "Jul 24", "Jul 23",
];

function runs(spec: [boolean, string, string][]): PromptRun[] {
  return spec.map(([mentioned, position, sentiment], i) => ({
    date: RUN_DATES[i],
    mentioned,
    position,
    sentiment,
  }));
}

export const PLATFORM_ANSWERS: PlatformAnswer[] = [
  {
    id: "chatgpt",
    label: "ChatGPT",
    /* Verbatim from the canvas frame — the worked answer the design painted. */
    segments: [
      { text: "\n                  For marathon training, the strongest picks pair a durable daily trainer with a lighter race-day shoe. " },
      { text: "Nike leads for cushioning and race-day speed", highlight: true },
      { text: ", with the Pegasus for weekly mileage and the Vaporfly for race day. Adidas is a steadier option for wide feet, while Asics focuses on budget trainers…\n                  " },
    ],
    citations: ["¹ nike.com/running", "² runnersworld.com", "³ reddit.com"],
    mentionRate: "78%",
    mentionDelta: "↑ 6pt",
    mentionDeltaColor: GREEN,
    avgPosition: "1.4",
    sentiment: "Positive",
    sentimentColor: "var(--ac)",
    competitors: "Adidas, Asics",
    sparkPath: "M0 40L27 37L54 38L81 33L108 34L135 28L162 29L189 24L216 25L243 20L270 21L297 15L324 12L351 10L380 10",
    weight: 0.55,
    runs: runs([
      [true, "1", "Positive"],
      [true, "1", "Positive"],
      [true, "1", "Positive"],
      [true, "1", "Positive"],
      [true, "2", "Neutral"],
      [false, "—", "—"],
      [true, "1", "Positive"],
      [true, "1", "Positive"],
      [true, "3", "Neutral"],
      [false, "—", "—"],
      [true, "1", "Positive"],
      [true, "2", "Positive"],
      [false, "—", "—"],
      [true, "1", "Positive"],
    ]),
  },
  {
    id: "perplexity",
    label: "Perplexity",
    /* Perplexity: source-forward, numbered inline, brand named first. */
    segments: [
      { text: "Marathon training usually calls for two shoes — a cushioned daily trainer and a lighter plated shoe for race day.¹ Across 2026 reviews and coach roundups, " },
      { text: "Nike is the most-recommended brand for both roles", highlight: true },
      { text: ": the Pegasus for weekly mileage and the Vaporfly for race day.² New Balance is named next for wide feet, Adidas Adizero for tempo work,³ and Brooks Deviate as the value pick.⁴ Reviewers agree the plate matters less than fit for a first marathon.²" },
    ],
    citations: ["¹ runnersworld.com", "² believeintherun.com", "³ nike.com/running", "⁴ letsrun.com"],
    mentionRate: "86%",
    mentionDelta: "↑ 9pt",
    mentionDeltaColor: GREEN,
    avgPosition: "1.2",
    sentiment: "Positive",
    sentimentColor: "var(--ac)",
    competitors: "Adidas, New Balance, Brooks",
    sparkPath: "M0 44L27 42L54 41L81 38L108 36L135 35L162 32L189 30L216 28L243 24L270 22L297 18L324 14L351 11L380 8",
    weight: 0.25,
    runs: runs([
      [true, "1", "Positive"],
      [true, "1", "Positive"],
      [true, "1", "Positive"],
      [true, "2", "Positive"],
      [true, "1", "Positive"],
      [true, "1", "Positive"],
      [false, "—", "—"],
      [true, "1", "Positive"],
      [true, "1", "Neutral"],
      [true, "1", "Positive"],
      [true, "2", "Positive"],
      [false, "—", "—"],
      [true, "1", "Positive"],
      [true, "1", "Positive"],
    ]),
  },
  {
    id: "claude",
    label: "Claude",
    /* Claude: caveated, fit-first, brand arrives second — hence position 1.9. */
    segments: [
      { text: "It depends on your foot shape, weekly mileage, and whether you want a carbon plate. Most training plans work best with two shoes: a soft daily trainer and something lighter for race day. Adidas Adizero comes up constantly for tempo runs, and " },
      { text: "Nike's Pegasus and Vaporfly", highlight: true },
      { text: " are the pairing runners mention most for the daily/race split. New Balance and Asics are worth trying if you need a wider toe box. One caveat: I can't tell you what fits your feet — get gait-analysed at a running shop before you commit to a plated shoe." },
    ],
    citations: ["¹ runnersworld.com", "² podiumrunner.com"],
    mentionRate: "71%",
    mentionDelta: "↓ 2pt",
    mentionDeltaColor: RED,
    avgPosition: "1.9",
    sentiment: "Neutral",
    sentimentColor: "var(--mut)",
    competitors: "Adidas, New Balance, Asics",
    sparkPath: "M0 22L27 21L54 23L81 22L108 24L135 23L162 25L189 24L216 26L243 25L270 27L297 26L324 28L351 27L380 28",
    weight: 0.12,
    runs: runs([
      [true, "2", "Neutral"],
      [true, "1", "Positive"],
      [false, "—", "—"],
      [true, "2", "Neutral"],
      [true, "2", "Positive"],
      [false, "—", "—"],
      [true, "3", "Neutral"],
      [true, "1", "Positive"],
      [false, "—", "—"],
      [true, "2", "Neutral"],
      [true, "2", "Neutral"],
      [true, "3", "Neutral"],
      [false, "—", "—"],
      [true, "1", "Positive"],
    ]),
  },
  {
    id: "aio",
    label: "AIO",
    /* Google AI Overviews: short, product-list shaped, retail sources. */
    segments: [
      { text: "Most runners rotate two shoes while marathon training: a cushioned daily trainer and a lighter shoe for race day. Frequently listed options include the " },
      { text: "Nike Pegasus and Nike Vaporfly", highlight: true },
      { text: ", the Adidas Adizero Boston, and the Brooks Deviate Nitro. For a first marathon, fit and comfort matter more than a carbon plate." },
    ],
    citations: ["¹ runnersworld.com", "² nike.com", "³ dickssportinggoods.com", "⁴ reddit.com"],
    mentionRate: "64%",
    mentionDelta: "↑ 3pt",
    mentionDeltaColor: GREEN,
    avgPosition: "1.6",
    sentiment: "Positive",
    sentimentColor: "var(--ac)",
    competitors: "Adidas, Brooks",
    sparkPath: "M0 34L27 35L54 33L81 34L108 32L135 33L162 31L189 32L216 30L243 31L270 29L297 30L324 28L351 29L380 27",
    weight: 0.08,
    runs: runs([
      [true, "1", "Positive"],
      [false, "—", "—"],
      [true, "1", "Positive"],
      [true, "2", "Neutral"],
      [false, "—", "—"],
      [true, "1", "Positive"],
      [true, "2", "Positive"],
      [false, "—", "—"],
      [true, "1", "Positive"],
      [true, "3", "Neutral"],
      [false, "—", "—"],
      [true, "1", "Positive"],
      [false, "—", "—"],
      [true, "2", "Positive"],
    ]),
  },
];

export function platformById(id: PlatformId): PlatformAnswer {
  return PLATFORM_ANSWERS.find((p) => p.id === id) ?? PLATFORM_ANSWERS[0];
}

/** Mentioned count, mentioned rate and avg position over the 14 shown runs. */
export function runStats(p: PlatformAnswer) {
  const hits = p.runs.filter((r) => r.mentioned);
  const avg = hits.reduce((s, r) => s + Number(r.position), 0) / (hits.length || 1);
  return {
    total: p.runs.length,
    hits: hits.length,
    rate: `${Math.round((hits.length / p.runs.length) * 100)}%`,
    avgPosition: avg.toFixed(1),
  };
}

/* ─────────────────────────── prompt-level headline ─────────────────────────
   The platform-weighted figures the table row shows for this prompt. */
export const SELECTED_PROMPT = {
  text: "best running shoes for marathon training",
  intent: "COMMERCIAL",
  volume: "HIGH VOLUME",
  visibility: "78%",
  position: "1.4",
};

/* ─────────────────────────── create-action draft ───────────────────────────
   Drafted FROM the gap this prompt shows: Nike is absent from 22% of runs, and
   the weakest engine (Claude, 71% and falling) leads with Adidas because no
   single Nike page answers the "which two shoes do I rotate" question. */
export const ACTION_DRAFT = {
  title: "Publish a marathon shoe-rotation guide on nike.com/running",
  category: "CONTENT" as const,
  categories: ["CONTENT", "TECHNICAL", "AUTHORITY"],
  impact: "+1.6pt",
  effort: "M" as const,
  efforts: ["S", "M", "L"],
  promptsAffected: "26",
  owner: "Unassigned",
  owners: ["Unassigned", "DO", "MK", "JT"],
  rationale:
    "Nike is missing from 22% of runs on this prompt, and Claude — the weakest engine here at 71% and down 2pt in 30 days — opens with Adidas Adizero because no single Nike page answers \"which two shoes do I rotate for a marathon block\". One guide pairing the Pegasus (daily) with the Vaporfly (race day) gives every engine a citable Nike source for the highest-volume commercial prompt in the set.",
  /** next id after the queue's highest (#92 on the Actions board) */
  queueId: 93,
};

/* ───────────────────────────── add-prompts flow ────────────────────────────
   Quota matches the topbar's "Search 412 prompts…" / "Export 412 prompts" and
   the Scale plan's 1,000-prompt limit (METRICS.md → prompts_tracked). */
export const PROMPT_QUOTA = { used: 412, limit: 1000 };

/** Category-appropriate suggestions for Nike (running shoes / training apparel). */
export const SUGGESTED_PROMPTS: string[] = [
  "best cushioned running shoes for heavy runners",
  "how often should you replace running shoes",
  "carbon plate running shoes vs traditional trainers",
  "best running shoes for flat feet",
  "what to wear for a winter long run",
  "moisture-wicking vs cotton workout shirts",
  "best high-impact sports bra for running",
  "how to break in new running shoes",
  "best trail running shoes for beginners",
  "affordable training apparel for a first gym block",
  "Nike Vaporfly vs Adidas Adizero Adios Pro",
  "do compression tights help recovery after long runs",
];
