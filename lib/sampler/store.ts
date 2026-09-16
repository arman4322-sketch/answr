import { readKvEnv } from "@/lib/telemetry/kv";
import { filePushCapped, fileListCapped, fileStoreAvailable } from "@/lib/db/filestore";
import type { Citation, ProviderId } from "@/lib/providers/types";
import type { SegmentTag } from "@/lib/segments/types";
import { scopeKey, currentWorkspaceId } from "@/lib/tenant";

/* Answer store — where the nightly sampler writes the answers it collects.
   Mirrors lib/telemetry's design exactly: a durable Upstash/Redis store that
   activates itself from the SAME env vars as telemetry (KV_REST_API_* or
   UPSTASH_REDIS_REST_*), with an in-process fallback so the code always runs.

   This is a landing zone, not the final persistence layer: a production build
   replaces (or backs) this with the Postgres schema in READINESS.md. Keeping
   the interface here means the sampler and any reader don't change when that
   lands. */

export interface SampledAnswer {
  provider: ProviderId;
  model: string;
  text: string;
  citations: Citation[];
  error?: string;
  /**
   * For a segmented run, how the segment reached THIS lane:
   *   native — the API took it (a search actually run from that location)
   *   prompt — it was stated in the question instead
   * The two are not the same measurement, so the UI reports the split rather
   * than averaging them together.
   */
  applied?: "native" | "prompt";
}

export interface PromptRun {
  id: string;
  prompt: string;
  ts: number;
  answers: SampledAnswer[];
  /**
   * The slice this run was sampled under — a region the question was asked
   * from, or an audience whose framing it carried. Absent on the nightly
   * overall run, which is what every headline metric is computed from.
   */
  segment?: SegmentTag;
}

export interface AnswerStore {
  kind: "memory" | "kv";
  durable: boolean;
  /** the workspace whose answers this store holds */
  workspaceId: string;
  saveRun(run: PromptRun): Promise<void>;
  recentRuns(limit?: number): Promise<PromptRun[]>;
}

// Segmented runs share this list with the nightly overall run, so the cap has
// to hold several passes of both without evicting the overall history.
const MAX_RUNS = 2000;
const KEY_RUNS = "answr:sampler:runs";

/** Each workspace gets its own list of runs. The demo workspace keeps the
 *  original key so everything collected before tenancy stays readable. */
const runsKey = (workspaceId: string) => scopeKey(KEY_RUNS, workspaceId);
const fileKey = (workspaceId: string) => scopeKey("sampler_runs", workspaceId).replace(/:/g, "_");

class MemoryAnswerStore implements AnswerStore {
  kind = "memory" as const;
  durable = false;
  private runs: PromptRun[] = [];
  constructor(readonly workspaceId: string) {}
  async saveRun(run: PromptRun) {
    this.runs.unshift(run);
    if (this.runs.length > MAX_RUNS) this.runs.length = MAX_RUNS;
  }
  async recentRuns(limit = 50) {
    return this.runs.slice(0, limit);
  }
}

class KvAnswerStore implements AnswerStore {
  kind = "kv" as const;
  durable = true;
  constructor(
    private creds: { url: string; token: string },
    readonly workspaceId: string,
  ) {}

  private async pipeline(commands: (string | number)[][]): Promise<unknown[]> {
    const res = await fetch(`${this.creds.url}/pipeline`, {
      method: "POST",
      headers: { authorization: `Bearer ${this.creds.token}`, "content-type": "application/json" },
      body: JSON.stringify(commands),
    });
    if (!res.ok) throw new Error(`kv answer store HTTP ${res.status}`);
    const out = (await res.json()) as { result?: unknown }[];
    return out.map((o) => o.result);
  }

  async saveRun(run: PromptRun) {
    const key = runsKey(this.workspaceId);
    await this.pipeline([
      ["LPUSH", key, JSON.stringify(run)],
      ["LTRIM", key, 0, MAX_RUNS - 1],
    ]);
  }

  async recentRuns(limit = 50) {
    const [raw] = await this.pipeline([["LRANGE", runsKey(this.workspaceId), 0, limit - 1]]);
    const list = Array.isArray(raw) ? (raw as string[]) : [];
    const runs: PromptRun[] = [];
    for (const s of list) {
      try {
        runs.push(JSON.parse(s) as PromptRun);
      } catch {
        /* skip malformed */
      }
    }
    return runs;
  }
}

/* Local-development answer store: JSON file under .data/, shared across Next's
   separate module graphs so the sampler's runs are readable by page renders on
   the same machine. Production uses KV. */
class FileAnswerStore implements AnswerStore {
  kind = "memory" as const; // dev-only; reported as non-durable
  durable = false;
  constructor(readonly workspaceId: string) {}
  async saveRun(run: PromptRun) {
    filePushCapped(fileKey(this.workspaceId), run, 2000);
  }
  async recentRuns(limit = 50) {
    return fileListCapped<PromptRun>(fileKey(this.workspaceId), limit);
  }
}

// One store per workspace. The memory store in particular must not be shared:
// a single instance would hand one workspace's answers to another.
const cached = new Map<string, AnswerStore>();

/**
 * The answer store for a workspace.
 *
 * Durable KV when configured, a local file store in development, else memory.
 * The workspace id is required — omitting it used to mean "the only workspace",
 * which is how every account ended up reading the same answers.
 */
export function answerStore(workspaceId: string, env: NodeJS.ProcessEnv = process.env): AnswerStore {
  const hit = cached.get(workspaceId);
  if (hit) return hit;
  const creds = readKvEnv(env);
  const store: AnswerStore = creds
    ? new KvAnswerStore(creds, workspaceId)
    : fileStoreAvailable(env)
      ? new FileAnswerStore(workspaceId)
      : new MemoryAnswerStore(workspaceId);
  cached.set(workspaceId, store);
  return store;
}

/** The answer store for the workspace this request belongs to. */
export async function requestAnswerStore(env: NodeJS.ProcessEnv = process.env): Promise<AnswerStore> {
  return answerStore(await currentWorkspaceId(), env);
}
