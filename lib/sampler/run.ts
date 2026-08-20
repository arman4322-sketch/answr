import { configuredProviders } from "@/lib/providers/registry";
import type { AnswerProvider } from "@/lib/providers/types";
import { answerStore, type PromptRun, type SampledAnswer } from "./store";

/* The nightly sampler — the core of "the engine". Given a set of prompts, it
   runs each configured provider against each prompt, normalizes the answers +
   citations, and writes one PromptRun per prompt to the answer store. The
   scoring functions that turn these runs into the 31 metrics are specified
   verbatim in lib/metrics.ts (visibility_score, share_of_voice, …) and are the
   next build step once real runs are accumulating.

   Safe by construction: if no provider key is set it does nothing and reports
   why, so it is harmless to schedule (see app/api/runs/execute + vercel.json).

   Prompts: a production build reads the workspace's tracked prompt set from the
   database. Until that exists, callers pass prompts explicitly; a small default
   set lets a buyer smoke-test the pipeline the moment they add a key. */

export const DEFAULT_PROMPTS: string[] = [
  "What are the best running shoes for marathon training?",
  "Which brands make the most sustainable athletic wear?",
  "Best basketball shoes for outdoor courts?",
];

export interface SamplerReport {
  ok: boolean;
  reason?: "no-providers";
  startedAt: number;
  finishedAt: number;
  providers: string[];
  store: { kind: string; durable: boolean };
  prompts: number;
  runs: number;
  answers: number;
  errors: number;
}

export interface RunSamplerOptions {
  prompts?: string[];
  /** cap concurrent provider calls per prompt (default: all in parallel) */
  timeoutMs?: number;
  now?: number;
}

export async function runSampler(opts: RunSamplerOptions = {}): Promise<SamplerReport> {
  const startedAt = opts.now ?? Date.now();
  const providers = configuredProviders();
  const store = answerStore();
  const base: Omit<SamplerReport, "ok" | "reason"> = {
    startedAt,
    finishedAt: startedAt,
    providers: providers.map((p) => p.id),
    store: { kind: store.kind, durable: store.durable },
    prompts: 0,
    runs: 0,
    answers: 0,
    errors: 0,
  };

  if (providers.length === 0) {
    return { ...base, ok: false, reason: "no-providers", finishedAt: startedAt };
  }

  const prompts = opts.prompts?.length ? opts.prompts : DEFAULT_PROMPTS;
  let answers = 0;
  let errors = 0;
  let runs = 0;

  for (const prompt of prompts) {
    const results = await Promise.all(
      providers.map((provider) => sampleOne(provider, prompt, opts.timeoutMs)),
    );
    for (const r of results) {
      answers += 1;
      if (r.error) errors += 1;
    }
    const run: PromptRun = { id: runId(prompt, startedAt, runs), prompt, ts: Date.now(), answers: results };
    await store.saveRun(run);
    runs += 1;
  }

  return {
    ...base,
    ok: true,
    finishedAt: Date.now(),
    prompts: prompts.length,
    runs,
    answers,
    errors,
  };
}

async function sampleOne(provider: AnswerProvider, prompt: string, timeoutMs?: number): Promise<SampledAnswer> {
  try {
    const r = await provider.sample(prompt, { timeoutMs });
    return { provider: r.provider, model: r.model, text: r.text, citations: r.citations };
  } catch (err) {
    return {
      provider: provider.id,
      model: "",
      text: "",
      citations: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function runId(prompt: string, startedAt: number, index: number): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) hash = (hash * 31 + prompt.charCodeAt(i)) | 0;
  return `run-${startedAt}-${index}-${(hash >>> 0).toString(36)}`;
}
