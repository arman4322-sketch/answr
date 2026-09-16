import { configuredProviders } from "@/lib/providers/registry";
import type { AnswerProvider } from "@/lib/providers/types";
import { answerStore, type PromptRun, type SampledAnswer } from "./store";
import { getWorkspace } from "@/lib/workspace";
import { trackedRegions, listAudiences } from "@/lib/segments/catalog";
import { locationPrompt, personaPrompt, type Segment, type SegmentKind } from "@/lib/segments/types";

/* Segmented sampling — the same prompts, asked from somewhere else or by
   someone else.
 *
 * A regional run is asked FROM the region: the lanes whose search API takes a
 * searcher location get it natively, which is the measurement that matters,
 * because answer engines localise their results. Lanes without that parameter
 * are told the location in the question instead; that is a weaker measurement,
 * so each answer records which of the two it was and the screens report the
 * split rather than blending them.
 *
 * An audience run is asked AS the buyer: no engine exposes a searcher persona,
 * so this is always prompt framing — and honestly labelled as such.
 *
 * Output is ordinary PromptRuns carrying a segment tag, so scoring, entity
 * matching and every existing metric apply to them unchanged. */

export interface SegmentRunRow {
  id: string;
  label: string;
  prompts: number;
  answers: number;
  errors: number;
  /** answers where the lane applied the segment natively */
  native: number;
  /** answers where it was framed in the prompt instead */
  framed: number;
}

export interface SegmentRunReport {
  ok: boolean;
  reason?: "no-providers" | "no-workspace" | "no-segments" | "no-prompts";
  kind: SegmentKind;
  startedAt: number;
  finishedAt: number;
  providers: string[];
  store: { kind: string; durable: boolean };
  segments: SegmentRunRow[];
  runs: number;
  answers: number;
  errors: number;
}

export interface SegmentRunOptions {
  kind: SegmentKind;
  /** restrict to these segment ids; default is everything tracked */
  ids?: string[];
  /** override the prompt set; default is the workspace's, capped */
  prompts?: string[];
  /**
   * How many tracked prompts to run per segment. Every segment runs the SAME
   * prompts — a comparison across segments is only meaningful if the question
   * was held constant. Default 3 keeps a full pass affordable.
   */
  promptLimit?: number;
  timeoutMs?: number;
}

export async function runSegmentSampler(opts: SegmentRunOptions): Promise<SegmentRunReport> {
  const startedAt = Date.now();
  const providers = configuredProviders();
  const store = answerStore();
  const base: Omit<SegmentRunReport, "ok" | "reason"> = {
    kind: opts.kind,
    startedAt,
    finishedAt: startedAt,
    providers: providers.map((p) => p.id),
    store: { kind: store.kind, durable: store.durable },
    segments: [],
    runs: 0,
    answers: 0,
    errors: 0,
  };

  if (providers.length === 0) return { ...base, ok: false, reason: "no-providers" };

  const ws = await getWorkspace().catch(() => null);
  if (!ws) return { ...base, ok: false, reason: "no-workspace" };

  const all: Segment[] = opts.kind === "region" ? await trackedRegions() : await listAudiences();
  const segments = opts.ids?.length ? all.filter((s) => opts.ids!.includes(s.id)) : all;
  if (segments.length === 0) return { ...base, ok: false, reason: "no-segments" };

  const prompts = (opts.prompts?.length ? opts.prompts : ws.prompts).slice(0, opts.promptLimit ?? 3);
  if (prompts.length === 0) return { ...base, ok: false, reason: "no-prompts" };

  const rows: SegmentRunRow[] = [];
  let totalRuns = 0;
  let totalAnswers = 0;
  let totalErrors = 0;

  for (const segment of segments) {
    const row: SegmentRunRow = { id: segment.id, label: segment.label, prompts: 0, answers: 0, errors: 0, native: 0, framed: 0 };

    for (const prompt of prompts) {
      const results = await Promise.all(
        providers.map((provider) => sampleForSegment(provider, prompt, segment, opts.timeoutMs)),
      );
      for (const r of results) {
        row.answers += 1;
        totalAnswers += 1;
        if (r.error) {
          row.errors += 1;
          totalErrors += 1;
        }
        if (r.applied === "native") row.native += 1;
        else if (r.applied === "prompt") row.framed += 1;
      }

      const run: PromptRun = {
        id: runId(segment.id, prompt, startedAt, totalRuns),
        prompt,
        ts: Date.now(),
        answers: results,
        segment: { kind: segment.kind, id: segment.id, label: segment.label },
      };
      await store.saveRun(run);
      row.prompts += 1;
      totalRuns += 1;
    }

    rows.push(row);
  }

  return {
    ...base,
    ok: true,
    finishedAt: Date.now(),
    segments: rows,
    runs: totalRuns,
    answers: totalAnswers,
    errors: totalErrors,
  };
}

async function sampleForSegment(
  provider: AnswerProvider,
  prompt: string,
  segment: Segment,
  timeoutMs?: number,
): Promise<SampledAnswer> {
  // A region goes to the API when the lane has a location parameter, and into
  // the question when it does not. A persona has nowhere to go but the question.
  const native = segment.kind === "region" && !!provider.supportsLocation;
  const applied: SampledAnswer["applied"] = native ? "native" : "prompt";

  const text =
    segment.kind === "audience"
      ? personaPrompt(segment.persona, prompt)
      : native
        ? prompt
        : locationPrompt(segment.location.label ?? segment.label, prompt);

  try {
    const r = await provider.sample(text, {
      timeoutMs,
      ...(segment.kind === "region" && native ? { userLocation: segment.location } : {}),
    });
    return { provider: r.provider, model: r.model, text: r.text, citations: r.citations, applied };
  } catch (err) {
    return {
      provider: provider.id,
      model: "",
      text: "",
      citations: [],
      applied,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function runId(segmentId: string, prompt: string, startedAt: number, index: number): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) hash = (hash * 31 + prompt.charCodeAt(i)) | 0;
  return `seg-${segmentId}-${startedAt}-${index}-${(hash >>> 0).toString(36)}`;
}
