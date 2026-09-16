import type { LiveMetrics } from "@/lib/live/metrics";

/* Prompts screen — the shape the table, the detail panel and the modals read.

   Everything here is derived from lib/live/metrics (real sampled answers). The
   screen used to run on lib/data/prompts fixtures (Nike, 412 prompts, a painted
   78% / 1.4 row and 14 invented daily runs); none of that survives.

   Two kinds of row exist and the screen must not conflate them:
   - SAMPLED   — the prompt has a latest run, so mention / rank / engines /
                 competitors / excerpt are real.
   - TRACKED   — the prompt is in the workspace's tracked set but has not been
                 sampled yet. Every metric cell renders "—"; we never guess.

   The live API reports the LATEST run per prompt, not a per-prompt time series,
   so this screen shows no per-prompt trend or delta. `days` (workspace-wide
   distinct days sampled) is printed verbatim wherever history is implied. */

export type ScreenPromptRow = {
  prompt: string;
  /** false = tracked but no run yet — all metric cells render "—" */
  sampled: boolean;
  mentioned: boolean;
  /** average rank of the brand's first mention in the latest run; null when absent */
  rank: number | null;
  competitorsMentioned: string[];
  providersAnswered: number;
  excerpt: string;
  ts: number | null;
};

export type PromptsScreen = {
  configured: boolean;
  hasData: boolean;
  brand: string;
  domain: string;
  category: string;
  competitors: string[];
  /** distinct days of sampled history, workspace-wide */
  days: number;
  lastRunAt: number | null;
  promptsTracked: number;
  answersSampled: number;
  /** size of the workspace's own prompt set — the set the sampler runs */
  workspacePrompts: number;
  rows: ScreenPromptRow[];
  /** prompt suggestions generated for this workspace's brand + category */
  suggestions: string[];
};

export function normPrompt(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Merge the sampled rows with tracked-but-unsampled prompts. */
export function promptsScreen(m: LiveMetrics, suggestions: string[] = []): PromptsScreen {
  const rows: ScreenPromptRow[] = m.prompts.map((p) => ({
    prompt: p.prompt,
    sampled: true,
    mentioned: p.mentioned,
    rank: p.rank,
    competitorsMentioned: p.competitorsMentioned,
    providersAnswered: p.providersAnswered,
    excerpt: p.excerpt,
    ts: p.ts,
  }));

  const seen = new Set(rows.map((r) => normPrompt(r.prompt)));
  for (const tracked of m.workspace?.prompts ?? []) {
    const key = normPrompt(tracked);
    if (!tracked.trim() || seen.has(key)) continue;
    seen.add(key);
    rows.push({
      prompt: tracked,
      sampled: false,
      mentioned: false,
      rank: null,
      competitorsMentioned: [],
      providersAnswered: 0,
      excerpt: "",
      ts: null,
    });
  }

  return {
    configured: m.configured,
    hasData: m.hasData,
    brand: m.workspace?.brand ?? "",
    domain: m.workspace?.domain ?? "",
    category: m.workspace?.category ?? "",
    competitors: m.workspace?.competitors ?? [],
    days: m.days,
    lastRunAt: m.lastRunAt,
    promptsTracked: m.promptsTracked,
    answersSampled: m.answersSampled,
    workspacePrompts: m.workspace?.prompts.length ?? 0,
    rows,
    suggestions,
  };
}

/* ── formatting ────────────────────────────────────────────────────────────
   Deterministic UTC formatting: these rows are rendered on the server and
   hydrated on the client, so locale/timezone-dependent formatting would
   mismatch. */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n: number) => String(n).padStart(2, "0");

export function fmtDate(ts: number | null): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function fmtDateTime(ts: number | null): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${fmtDate(ts)}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

/** Honest history label — never implies days that were not sampled. */
export function historyLabel(days: number): string {
  if (days <= 0) return "no sampled history yet";
  return `${days} day${days === 1 ? "" : "s"} of history`;
}

export function rankLabel(row: ScreenPromptRow): string {
  if (!row.sampled || row.rank == null) return "—";
  return row.rank.toFixed(1);
}

export function statusLabel(row: ScreenPromptRow): "Mentioned" | "Not mentioned" | "Awaiting run" {
  if (!row.sampled) return "Awaiting run";
  return row.mentioned ? "Mentioned" : "Not mentioned";
}

export function slugify(brand: string): string {
  return brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace";
}

/** Splits text into segments, marking real occurrences of the tracked brand. */
export function highlightBrand(text: string, brand: string): { text: string; hit: boolean }[] {
  if (!text) return [];
  if (!brand.trim()) return [{ text, hit: false }];
  const esc = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\b${esc}\\b`, "gi");
  const out: { text: string; hit: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: text.slice(last, i), hit: false });
    out.push({ text: m[0], hit: true });
    last = i + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), hit: false });
  return out;
}
