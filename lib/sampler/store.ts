import { readKvEnv } from "@/lib/telemetry/kv";
import type { Citation, ProviderId } from "@/lib/providers/types";

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
}

export interface PromptRun {
  id: string;
  prompt: string;
  ts: number;
  answers: SampledAnswer[];
}

export interface AnswerStore {
  kind: "memory" | "kv";
  durable: boolean;
  saveRun(run: PromptRun): Promise<void>;
  recentRuns(limit?: number): Promise<PromptRun[]>;
}

const MAX_RUNS = 500;
const KEY_RUNS = "answr:sampler:runs";

class MemoryAnswerStore implements AnswerStore {
  kind = "memory" as const;
  durable = false;
  private runs: PromptRun[] = [];
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
  constructor(private creds: { url: string; token: string }) {}

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
    await this.pipeline([
      ["LPUSH", KEY_RUNS, JSON.stringify(run)],
      ["LTRIM", KEY_RUNS, 0, MAX_RUNS - 1],
    ]);
  }

  async recentRuns(limit = 50) {
    const [raw] = await this.pipeline([["LRANGE", KEY_RUNS, 0, limit - 1]]);
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

let cached: AnswerStore | null = null;

/** Returns the durable KV store when telemetry's KV env is set, else in-memory. */
export function answerStore(env: NodeJS.ProcessEnv = process.env): AnswerStore {
  if (cached) return cached;
  const creds = readKvEnv(env);
  cached = creds ? new KvAnswerStore(creds) : new MemoryAnswerStore();
  return cached;
}
