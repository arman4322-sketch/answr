import { db, newId } from "@/lib/db";
import { answerStore, type PromptRun } from "@/lib/sampler/store";
import { getWorkspace } from "@/lib/workspace";
import { pickProvider } from "@/lib/providers/registry";

/* Classification pass — turns answers Answr has ALREADY sampled into two more
   live metrics, using only the provider keys already connected:

     Sentiment — how favourably each answer describes the brand, plus the
                 themes driving it.
     Topics    — the subject area each tracked prompt belongs to, so visibility
                 can be reported per topic.

   Both read from the stored answer corpus rather than issuing new sampling
   runs, so enabling them costs a few cents, not a new provider contract.
   Results are persisted (Redis in production) and recomputed only for answers
   that have not been classified yet, so repeat runs are nearly free. */

export type Sentiment = "positive" | "neutral" | "negative";

export interface AnswerSentiment {
  id: string;
  /** stable key: run id + provider */
  runId: string;
  provider: string;
  prompt: string;
  sentiment: Sentiment;
  /** short phrases explaining the judgement */
  themes: string[];
  ts: number;
}

export interface PromptTopic {
  id: string;
  prompt: string;
  topic: string;
  ts: number;
}

const SENTIMENT_COLLECTION = "sentiment";
const TOPIC_COLLECTION = "prompt_topics";

export function listSentiment(): Promise<AnswerSentiment[]> {
  return db().list<AnswerSentiment>(SENTIMENT_COLLECTION);
}
export function listPromptTopics(): Promise<PromptTopic[]> {
  return db().list<PromptTopic>(TOPIC_COLLECTION);
}

/** Deterministic id so re-running never double-counts the same answer. */
function answerKey(runId: string, provider: string): string {
  return `${runId}::${provider}`.replace(/[^A-Za-z0-9_:.-]/g, "_");
}

function firstJson<T>(text: string): T | null {
  // Models often wrap JSON in prose or fences; take the first balanced object/array.
  const cleaned = text.replace(/```(?:json)?/gi, "");
  const start = cleaned.search(/[[{]/);
  if (start < 0) return null;
  for (let end = cleaned.length; end > start; end--) {
    const slice = cleaned.slice(start, end);
    try {
      return JSON.parse(slice) as T;
    } catch {
      /* keep shrinking */
    }
  }
  return null;
}

const SENTIMENTS: Sentiment[] = ["positive", "neutral", "negative"];
const asSentiment = (v: unknown): Sentiment =>
  SENTIMENTS.includes(v as Sentiment) ? (v as Sentiment) : "neutral";

export interface ClassifyReport {
  ok: boolean;
  reason?: "no-provider" | "no-workspace" | "no-answers";
  provider?: string;
  sentimentClassified: number;
  sentimentSkipped: number;
  topicsAssigned: number;
  errors: number;
}

/**
 * Classify any not-yet-classified answers and tag any untagged prompts.
 * Safe to run repeatedly — it only processes what's new.
 */
export async function runClassification(opts: { limit?: number } = {}): Promise<ClassifyReport> {
  const base: ClassifyReport = {
    ok: false,
    sentimentClassified: 0,
    sentimentSkipped: 0,
    topicsAssigned: 0,
    errors: 0,
  };

  const provider = pickProvider();
  if (!provider) return { ...base, reason: "no-provider" };
  const workspace = await getWorkspace();
  if (!workspace) return { ...base, reason: "no-workspace" };

  const runs: PromptRun[] = await answerStore().recentRuns(opts.limit ?? 500);
  if (runs.length === 0) return { ...base, reason: "no-answers", provider: provider.id };

  const brand = workspace.brand;
  const existing = await listSentiment();
  const done = new Set(existing.map((s) => s.id));

  let classified = 0;
  let skipped = 0;
  let errors = 0;

  // ---- sentiment: only answers that actually mention the brand ----
  const mentions = (text: string) => {
    const esc = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${esc}\\b`, "i").test(text);
  };

  const pending: { id: string; run: PromptRun; provider: string; text: string }[] = [];
  for (const run of runs) {
    for (const a of run.answers) {
      if (a.error || !a.text || !mentions(a.text)) continue;
      const id = answerKey(run.id, a.provider);
      if (done.has(id)) {
        skipped += 1;
        continue;
      }
      pending.push({ id, run, provider: a.provider, text: a.text });
    }
  }

  for (const item of pending) {
    const prompt =
      `You are analysing how an AI assistant's answer describes a brand.\n` +
      `Brand: "${brand}"\n\n` +
      `Answer:\n"""${item.text.slice(0, 4000)}"""\n\n` +
      `Classify how this answer portrays ${brand}. Reply with ONLY minified JSON:\n` +
      `{"sentiment":"positive|neutral|negative","themes":["short phrase","short phrase"]}\n` +
      `"themes" = up to 3 short phrases (2-4 words) naming what drives that judgement. No other text.`;
    try {
      const r = await provider.sample(prompt, { grounding: false, timeoutMs: 30000 });
      const parsed = firstJson<{ sentiment?: string; themes?: unknown }>(r.text);
      if (!parsed) {
        errors += 1;
        continue;
      }
      const rec: AnswerSentiment = {
        id: item.id,
        runId: item.run.id,
        provider: item.provider,
        prompt: item.run.prompt,
        sentiment: asSentiment(parsed.sentiment),
        themes: Array.isArray(parsed.themes)
          ? parsed.themes.map((t) => String(t).trim().slice(0, 60)).filter(Boolean).slice(0, 3)
          : [],
        ts: Date.now(),
      };
      await db().put(SENTIMENT_COLLECTION, rec);
      classified += 1;
    } catch {
      errors += 1;
    }
  }

  // ---- topics: tag each tracked prompt once ----
  const trackedPrompts = workspace.prompts.length
    ? workspace.prompts
    : [...new Set(runs.map((r) => r.prompt))];
  const existingTopics = await listPromptTopics();
  const taggedFor = new Map(existingTopics.map((t) => [t.prompt, t]));
  const untagged = trackedPrompts.filter((p) => !taggedFor.has(p));

  let topicsAssigned = 0;
  if (untagged.length > 0) {
    const prompt =
      `Group these questions into a small set of subject areas (topics) for a brand in the ` +
      `"${workspace.category || "its"}" category.\n\n` +
      untagged.map((p, i) => `${i + 1}. ${p}`).join("\n") +
      `\n\nUse between 2 and 5 topics total, reusing a topic across questions where they share a subject. ` +
      `Topic names: 1-3 words, title case.\n` +
      `Reply with ONLY minified JSON: [{"n":1,"topic":"Topic Name"}, ...] — one entry per question number. No other text.`;
    try {
      const r = await provider.sample(prompt, { grounding: false, timeoutMs: 40000 });
      const parsed = firstJson<{ n?: number; topic?: string }[]>(r.text);
      if (Array.isArray(parsed)) {
        for (const entry of parsed) {
          const idx = Number(entry?.n) - 1;
          const topic = String(entry?.topic ?? "").trim().slice(0, 40);
          if (!topic || idx < 0 || idx >= untagged.length) continue;
          const rec: PromptTopic = {
            id: newId("topic"),
            prompt: untagged[idx],
            topic,
            ts: Date.now(),
          };
          await db().put(TOPIC_COLLECTION, rec);
          topicsAssigned += 1;
        }
      } else {
        errors += 1;
      }
    } catch {
      errors += 1;
    }
  }

  return {
    ok: true,
    provider: provider.id,
    sentimentClassified: classified,
    sentimentSkipped: skipped,
    topicsAssigned,
    errors,
  };
}
