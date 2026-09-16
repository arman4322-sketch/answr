import { db } from "@/lib/db";
import { configuredProviders } from "@/lib/providers/registry";
import type { AnswerProvider } from "@/lib/providers/types";
import { answerStore, type PromptRun, type SampledAnswer } from "./store";
import { getWorkspace } from "@/lib/workspace";
import { listPrompts } from "@/lib/db/entities";
import { runEntityVerification } from "@/lib/live/entity";
import { runClassification } from "@/lib/live/classify";
import { scopeKey } from "@/lib/tenant";

/* First-run job — the pipeline a person watches finish right after onboarding.
 *
 * lib/sampler/run.ts does the same work in ONE call, which is right for the
 * nightly cron: nobody is watching, and the platform gives a cron a long
 * budget. It is wrong for a person who has just saved their brand. A full pass
 * is prompts × lanes and takes minutes; a single HTTP request doing all of it
 * gets killed by the platform mid-way and shows no progress until it does.
 *
 * So the same pass is cut into steps and the client drives it:
 *
 *     POST /api/runs/start          freeze the prompt set, create the job
 *     POST /api/runs/step   ×N      one unit of work, then return
 *     GET  /api/runs/status         where it is now
 *
 * A unit is one prompt sampled across every connected lane, or the entity
 * verification stage, or the classification stage. Each is short, each is
 * resumable if the tab is closed, and `doneCount / prompts.length` is honest
 * progress because the denominator is frozen at start.
 *
 * Tenancy: every call takes a workspace id. The job record lives in a
 * workspace-scoped collection AND is keyed by the workspace id, so there is at
 * most one job per workspace and no workspace can read another's. The demo
 * workspace keeps the unsuffixed collection name (lib/tenant scopeKey).
 *
 * Costs real provider credits, so nothing here starts without an explicit call.
 */

export type RunStage = "sampling" | "verifying" | "classifying" | "done";
export type RunStatus = "running" | "done" | "failed";

export interface RunJob {
  /** record id === workspaceId; one active job per workspace */
  id: string;
  workspaceId: string;
  status: RunStatus;
  stage: RunStage;
  /** the prompt set frozen at start, so progress has a fixed denominator */
  prompts: string[];
  /** prompts sampled so far */
  doneCount: number;
  /** provider answers written (one per lane per prompt) */
  answers: number;
  /** lanes that failed, plus enrichment stages that failed; never fatal */
  errors: number;
  startedAt: number;
  finishedAt?: number;
  /** set only when status is 'failed' — a sentence for the operator */
  error?: string;
}

export type StartResult = { ok: true; job: RunJob } | { ok: false; error: string };
export type StepResult =
  | { ok: true; job: RunJob; done: boolean }
  | { ok: false; error: string; job?: RunJob };

const COLLECTION = "run_jobs";

/** One job per workspace; the demo workspace keeps the unsuffixed name. */
const collectionFor = (workspaceId: string) => scopeKey(COLLECTION, workspaceId);

/* How long a job may sit in 'running' before a new start replaces it. A pass is
   at most ~25 prompts × ~60s of lanes plus two enrichment stages, so an hour
   without finishing means the driver went away (closed tab, crashed process)
   rather than that it is still working. */
const ABANDONED_AFTER_MS = 60 * 60 * 1000;

/** The workspace's current job, or null if it has never run one. */
export async function getJob(workspaceId: string): Promise<RunJob | null> {
  return db().get<RunJob>(collectionFor(workspaceId), workspaceId);
}

async function save(job: RunJob): Promise<RunJob> {
  return db().put(collectionFor(job.workspaceId), job);
}

function abandoned(job: RunJob, now = Date.now()): boolean {
  return job.status === "running" && now - job.startedAt > ABANDONED_AFTER_MS;
}

/**
 * Start the first-run job for a workspace, or return the one already running.
 *
 * Idempotent on purpose: the welcome screen may fire this more than once (a
 * reload, a double click, a retry after a flaky response) and a second job
 * would double-spend provider credits and corrupt the progress denominator.
 */
export async function startJob(workspaceId: string): Promise<StartResult> {
  return withWorkspaceLock(workspaceId, async () => {
    const existing = await getJob(workspaceId);
    if (existing && existing.status === "running" && !abandoned(existing)) {
      return { ok: true, job: existing };
    }

    if (configuredProviders().length === 0) {
      return {
        ok: false,
        error: "No answer-engine keys are connected. Add one in Settings › Integrations first.",
      };
    }

    const workspace = await getWorkspace(workspaceId);
    if (!workspace) {
      return { ok: false, error: "No brand is configured yet. Finish onboarding first." };
    }

    // Freeze the prompt set now. Editing prompts mid-run must not move the
    // denominator under a progress bar somebody is watching.
    const prompts = await promptsFor(workspaceId, workspace.prompts);
    if (prompts.length === 0) {
      return { ok: false, error: "This workspace has no tracked prompts to run yet." };
    }

    const job: RunJob = {
      id: workspaceId,
      workspaceId,
      status: "running",
      stage: "sampling",
      prompts,
      doneCount: 0,
      answers: 0,
      errors: 0,
      startedAt: Date.now(),
    };
    return { ok: true, job: await save(job) };
  });
}

/**
 * Do ONE unit of work and return.
 *
 * Safe to call twice for the same step: the job is re-read after the work and
 * only advanced when the stored state is still the one this call started from,
 * so a duplicated request cannot skip a prompt or push doneCount past the
 * denominator.
 */
export async function stepJob(workspaceId: string, jobId?: string): Promise<StepResult> {
  return withWorkspaceLock(workspaceId, async () => {
    const job = await getJob(workspaceId);
    if (!job) return { ok: false, error: "No run is in progress for this workspace." };
    // An empty jobId means "whatever is current" — the workspace is already
    // pinned by the caller's session, so this can never reach another tenant.
    if (jobId && jobId !== job.id) {
      return { ok: false, error: "That run is no longer the current one for this workspace.", job };
    }
    if (job.status !== "running") return { ok: true, job, done: true };

    try {
      const next =
        job.stage === "sampling"
          ? await stepSampling(job)
          : job.stage === "verifying"
            ? await stepVerifying(job)
            : await stepClassifying(job);
      return { ok: true, job: next, done: next.status !== "running" };
    } catch (err) {
      // Only an unrecoverable error gets here: a provider failure is recorded
      // as an error count inside the step and never thrown.
      const current = (await getJob(workspaceId).catch(() => null)) ?? job;
      const failed: RunJob = {
        ...current,
        status: "failed",
        error: message(err),
        finishedAt: Date.now(),
      };
      await save(failed).catch(() => {});
      return { ok: true, job: failed, done: true };
    }
  });
}

/* ---- the three kinds of step ---- */

/** One prompt across every connected lane, written as one PromptRun. */
async function stepSampling(job: RunJob): Promise<RunJob> {
  const index = job.doneCount;
  if (index >= job.prompts.length) return save({ ...job, stage: "verifying" });

  const providers = configuredProviders();
  if (providers.length === 0) {
    throw new Error("No answer-engine keys are connected, so there is nothing to sample.");
  }

  const prompt = job.prompts[index];
  const results = await Promise.all(providers.map((p) => sampleOne(p, prompt)));
  const failedLanes = results.filter((r) => r.error).length;

  // Write the answers before advancing: a step that samples and then dies must
  // lose the counter, not the data.
  const run: PromptRun = {
    id: runId(prompt, job.startedAt, index),
    prompt,
    ts: Date.now(),
    answers: results,
  };
  await answerStore(job.workspaceId).saveRun(run);

  // Double-advance guard: if a concurrent step already moved past this index,
  // its counters are authoritative and this call adds nothing.
  const base = await getJob(job.workspaceId);
  if (!sameJob(base, job) || base.doneCount !== index || base.stage !== "sampling") {
    return base ?? job;
  }

  const doneCount = index + 1;
  return save({
    ...base,
    doneCount,
    answers: base.answers + results.length,
    errors: base.errors + failedLanes,
    stage: doneCount >= base.prompts.length ? "verifying" : "sampling",
  });
}

/** Decide which company each contested answer is about. No-ops when the brand
 *  name is not shared with anything else. */
async function stepVerifying(job: RunJob): Promise<RunJob> {
  let errors = 0;
  try {
    const report = await runEntityVerification({ workspaceId: job.workspaceId });
    errors = report.errors;
  } catch {
    // Enrichment is worth less than the sample it enriches: record it and move
    // on rather than failing a job whose answers are already stored.
    errors = 1;
  }
  const base = await getJob(job.workspaceId);
  if (!sameJob(base, job) || base.stage !== "verifying") return base ?? job;
  return save({ ...base, errors: base.errors + errors, stage: "classifying" });
}

/** Sentiment and topics over the answers that survived verification. */
async function stepClassifying(job: RunJob): Promise<RunJob> {
  let errors = 0;
  try {
    const report = await runClassification({ workspaceId: job.workspaceId });
    errors = report.errors;
  } catch {
    errors = 1;
  }
  const base = await getJob(job.workspaceId);
  if (!sameJob(base, job) || base.stage !== "classifying") return base ?? job;
  return save({
    ...base,
    errors: base.errors + errors,
    stage: "done",
    status: "done",
    finishedAt: Date.now(),
  });
}

/* ---- helpers ---- */

/** True when the stored record is still the run this step started from. A
 *  later `start` replaces the record in place, so the id alone is not enough. */
function sameJob(stored: RunJob | null, job: RunJob): stored is RunJob {
  return !!stored && stored.id === job.id && stored.startedAt === job.startedAt;
}

/**
 * The prompt set to freeze, on the same priority as the nightly sampler: the
 * workspace's tracked set, then prompts persisted through /api/prompts.
 */
async function promptsFor(workspaceId: string, workspacePrompts: string[]): Promise<string[]> {
  const fromWorkspace = workspacePrompts.map((p) => p.trim()).filter(Boolean);
  if (fromWorkspace.length) return fromWorkspace;
  const tracked = await listPrompts(workspaceId).catch(() => []);
  return tracked.map((p) => p.text.trim()).filter(Boolean);
}

/* Copied from lib/sampler/run.ts rather than imported: `sampleOne` and `runId`
   are private there, and extracting them would mean editing a file this change
   does not own. The shape is deliberately identical so a stepped run and a
   nightly run produce the same PromptRun records. */
async function sampleOne(provider: AnswerProvider, prompt: string, timeoutMs?: number): Promise<SampledAnswer> {
  try {
    const r = await provider.sample(prompt, { timeoutMs });
    return { provider: r.provider, model: r.model, text: r.text, citations: r.citations };
  } catch (err) {
    // A lane that errors is a datum, not a failure: it is counted and the rest
    // of the pass continues.
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

function message(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  return raw.trim() ? raw.trim().slice(0, 300) : "The run stopped on an unexpected error.";
}

/* In-process serialisation per workspace. The document store has no
   compare-and-set, so two steps arriving together would otherwise read the same
   doneCount and both advance it. This makes them queue within an instance; the
   re-read guard above covers the cross-instance case. */
const locks = new Map<string, Promise<void>>();

function withWorkspaceLock<T>(workspaceId: string, fn: () => Promise<T>): Promise<T> {
  const previous = locks.get(workspaceId) ?? Promise.resolve();
  const result = previous.then(fn, fn);
  const settled = result.then(
    () => {},
    () => {},
  );
  locks.set(workspaceId, settled);
  void settled.then(() => {
    if (locks.get(workspaceId) === settled) locks.delete(workspaceId);
  });
  return result;
}
