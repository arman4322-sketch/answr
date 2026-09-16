import type { LiveMetrics } from "@/lib/live/metrics";
import type { ActionItem } from "@/lib/db/entities";

/* Actions — the action queue, derived from REAL GAPS in the sampled answers.

   The fixture queue this screen used to render is gone: action ids 92/87/81/76/
   64, their impact estimates (+2.8pt, +1.9pt…), effort sizes, owners (DO / MK /
   JT / "Dana Okafor"), statuses, ship dates and the whole "+9.4pt available"
   impact model were invented numbers with nothing behind them.

   What IS real is the gap itself. lib/live/metrics reports, per tracked prompt,
   the latest sampled run: whether the brand was named, how early it was named
   relative to tracked competitors, which competitors appeared, how many engines
   answered, and when. Two honest kinds of gap fall out of that:

     missing  — no engine named the brand in the latest answers. A genuine
                visibility gap.
     trailing — the brand is named, but at least one competitor is named first
                (rank > 1). A ranking gap.

   Everything the queue shows is one of those observations. Nothing here scores,
   projects, estimates effort, assigns an owner or invents a status — the
   pipeline produces none of that, so those columns are gone rather than faked.
   The only status-bearing rows on the screen are the actions the user saved
   themselves through /api/actions, which carry their own real fields. */

export type GapKind = "missing" | "trailing";

export type GapRow = {
  /** stable, derived from the prompt text — the detail route's [id] */
  id: string;
  kind: GapKind;
  prompt: string;
  /** plain-language framing of the observed gap — no projection */
  title: string;
  /** one sentence of evidence, assembled only from the run's own values */
  evidence: string;
  /** engines that returned an answer for this prompt in the latest run */
  providersAnswered: number;
  /** tracked competitors named in those same answers */
  competitorsMentioned: string[];
  /** average position of the brand's first mention; null when absent */
  rank: number | null;
  /** first sampled answer, verbatim (truncated by the live layer) */
  excerpt: string;
  ts: number;
};

export type RivalGap = {
  name: string;
  /** prompts in this queue whose latest answers named this competitor */
  prompts: number;
};

export type SavedAction = {
  id: string;
  title: string;
  /** the user's own estimate — empty unless they typed one */
  impact: string;
  effort: string;
  status: ActionItem["status"];
  createdAt: number;
};

export type ActionsScreen = {
  configured: boolean;
  hasData: boolean;
  brand: string;
  domain: string;
  /** distinct days of sampled history, workspace-wide */
  days: number;
  lastRunAt: number | null;
  /** prompts in the workspace's tracked set */
  promptsTracked: number;
  /** prompts with at least one completed run */
  promptsSampled: number;
  answersSampled: number;
  /** the queue itself, worst-first */
  gaps: GapRow[];
  missingCount: number;
  trailingCount: number;
  /** sampled prompts where the brand is named ahead of every competitor */
  leadCount: number;
  rivals: RivalGap[];
  /** actions the user created through /api/actions */
  saved: SavedAction[];
  /** false when the action store is in-memory (no KV key configured) */
  savedDurable: boolean;
};

/* ── ids ───────────────────────────────────────────────────────────────────
   A gap has no database row, so its id is derived from the prompt text: a
   readable slug plus a hash, stable across renders and sort order. */

function hash36(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

export function normPrompt(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function gapId(prompt: string): string {
  const slug = normPrompt(prompt)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/, "");
  return `${slug || "prompt"}-${hash36(normPrompt(prompt))}`;
}

/* ── formatting ────────────────────────────────────────────────────────────
   Deterministic UTC formatting — these rows render on the server and hydrate
   on the client, so locale/timezone formatting would mismatch. */

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

export function enginesLabel(n: number): string {
  return `${n} engine${n === 1 ? "" : "s"}`;
}

export function rankLabel(rank: number | null): string {
  return rank == null ? "—" : rank.toFixed(1);
}

export function kindLabel(kind: GapKind): string {
  return kind === "missing" ? "VISIBILITY GAP" : "RANKING GAP";
}

export function savedStatusLabel(status: ActionItem["status"]): string {
  return status === "in_progress" ? "IN PROGRESS" : status === "done" ? "DONE" : "OPEN";
}

/** Shorten a real string for a tight slot (breadcrumb) — never rewrites it. */
export function truncate(s: string, max = 58): string {
  return s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;
}

export function slugify(brand: string): string {
  return brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace";
}

/* ── derivation ────────────────────────────────────────────────────────────── */

function title(kind: GapKind, prompt: string, brand: string): string {
  const b = brand || "the brand";
  return kind === "missing"
    ? `Win a mention for ${b} on “${prompt}”`
    : `Move ${b} earlier in answers to “${prompt}”`;
}

function evidence(
  kind: GapKind,
  brand: string,
  engines: number,
  competitors: string[],
  rank: number | null,
  ts: number,
): string {
  const b = brand || "the brand";
  const named = competitors.length ? competitors.join(", ") : "";
  if (kind === "missing") {
    return (
      `${enginesLabel(engines)} answered this prompt in the latest run (${fmtDateTime(ts)}) and none named ${b}.` +
      (named ? ` Named instead: ${named}.` : " No tracked competitor was named either.")
    );
  }
  return (
    `${b} is named at rank ${rankLabel(rank)} across ${enginesLabel(engines)} in the latest run (${fmtDateTime(ts)}), ` +
    `so at least one competitor is named first.` +
    (named ? ` Named in the same answers: ${named}.` : "")
  );
}

/** Worst-first: real gaps before ranking gaps, then by how much was observed. */
export function compareGaps(a: GapRow, b: GapRow): number {
  if (a.kind !== b.kind) return a.kind === "missing" ? -1 : 1;
  if (a.kind === "missing") {
    /* more engines answering without naming the brand = a wider gap */
    if (b.providersAnswered !== a.providersAnswered) return b.providersAnswered - a.providersAnswered;
    if (b.competitorsMentioned.length !== a.competitorsMentioned.length) {
      return b.competitorsMentioned.length - a.competitorsMentioned.length;
    }
    return b.ts - a.ts;
  }
  /* trailing: the later the brand is named, the worse */
  const ar = a.rank ?? 0;
  const br = b.rank ?? 0;
  if (br !== ar) return br - ar;
  if (b.providersAnswered !== a.providersAnswered) return b.providersAnswered - a.providersAnswered;
  return b.ts - a.ts;
}

export function actionsScreen(
  m: LiveMetrics,
  saved: SavedAction[] = [],
  savedDurable = false,
): ActionsScreen {
  const brand = m.workspace?.brand ?? "";

  const gaps: GapRow[] = m.prompts
    .filter((p) => !p.mentioned || (p.rank != null && p.rank > 1))
    .map((p) => {
      const kind: GapKind = p.mentioned ? "trailing" : "missing";
      return {
        id: gapId(p.prompt),
        kind,
        prompt: p.prompt,
        title: title(kind, p.prompt, brand),
        evidence: evidence(kind, brand, p.providersAnswered, p.competitorsMentioned, p.rank, p.ts),
        providersAnswered: p.providersAnswered,
        competitorsMentioned: p.competitorsMentioned,
        rank: p.rank,
        excerpt: p.excerpt,
        ts: p.ts,
      };
    })
    .sort(compareGaps);

  /* competitors named in the answers behind this queue — a count of prompts,
     not a share: the live layer reports presence per prompt, not frequency */
  const rivalCounts = new Map<string, number>();
  for (const g of gaps) {
    for (const c of g.competitorsMentioned) rivalCounts.set(c, (rivalCounts.get(c) ?? 0) + 1);
  }
  const rivals: RivalGap[] = [...rivalCounts.entries()]
    .map(([name, prompts]) => ({ name, prompts }))
    .sort((a, b) => b.prompts - a.prompts || a.name.localeCompare(b.name));

  const missingCount = gaps.filter((g) => g.kind === "missing").length;
  const trailingCount = gaps.length - missingCount;

  return {
    configured: m.configured,
    hasData: m.hasData,
    brand,
    domain: m.workspace?.domain ?? "",
    days: m.days,
    lastRunAt: m.lastRunAt,
    promptsTracked: m.promptsTracked,
    promptsSampled: m.prompts.length,
    answersSampled: m.answersSampled,
    gaps,
    missingCount,
    trailingCount,
    leadCount: m.prompts.length - gaps.length,
    rivals,
    saved: [...saved].sort((a, b) => b.createdAt - a.createdAt),
    savedDurable,
  };
}

export function findGap(d: ActionsScreen, id: string): GapRow | null {
  return d.gaps.find((g) => g.id === id) ?? null;
}
