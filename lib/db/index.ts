import { readKvEnv } from "@/lib/telemetry/kv";

/* Persistence layer — a small, generic document store that is REAL and testable
   today, on the exact pattern the telemetry store already uses:

     - no storage configured → in-process memory (works now; resets on cold start)
     - Upstash/Redis env set   → durable, shared across instances (zero code change)

   It is deliberately backend-agnostic: a production build can drop in Postgres by
   implementing this same `Db` interface, and nothing that consumes it changes.
   Every domain table (workspaces, users, prompts, actions, leads, sessions) is a
   "collection" of JSON records keyed by id.

   This is the landing zone the readiness audit called blocker #1 ("no persistence
   layer"). It does not, by itself, make the fixture dashboards live — that needs
   the scoring step (lib/scoring) fed by real sampler runs — but it gives auth,
   write paths, and lead capture somewhere real to persist. */

export interface Db {
  kind: "memory" | "kv";
  durable: boolean;
  list<T>(collection: string): Promise<T[]>;
  get<T>(collection: string, id: string): Promise<T | null>;
  put<T extends { id: string }>(collection: string, record: T): Promise<T>;
  remove(collection: string, id: string): Promise<void>;
}

const key = (collection: string) => `answr:db:${collection}`;

class MemoryDb implements Db {
  kind = "memory" as const;
  durable = false;
  private store = new Map<string, Map<string, string>>();

  private col(collection: string) {
    let m = this.store.get(collection);
    if (!m) {
      m = new Map();
      this.store.set(collection, m);
    }
    return m;
  }
  async list<T>(collection: string): Promise<T[]> {
    return [...this.col(collection).values()].map((s) => JSON.parse(s) as T);
  }
  async get<T>(collection: string, id: string): Promise<T | null> {
    const raw = this.col(collection).get(id);
    return raw ? (JSON.parse(raw) as T) : null;
  }
  async put<T extends { id: string }>(collection: string, record: T): Promise<T> {
    this.col(collection).set(record.id, JSON.stringify(record));
    return record;
  }
  async remove(collection: string, id: string): Promise<void> {
    this.col(collection).delete(id);
  }
}

class KvDb implements Db {
  kind = "kv" as const;
  durable = true;
  constructor(private creds: { url: string; token: string }) {}

  private async cmd(command: (string | number)[]): Promise<unknown> {
    const [out] = await this.pipe([command]);
    return out;
  }
  private async pipe(commands: (string | number)[][]): Promise<unknown[]> {
    const res = await fetch(`${this.creds.url}/pipeline`, {
      method: "POST",
      headers: { authorization: `Bearer ${this.creds.token}`, "content-type": "application/json" },
      body: JSON.stringify(commands),
    });
    if (!res.ok) throw new Error(`db kv HTTP ${res.status}`);
    const out = (await res.json()) as { result?: unknown }[];
    return out.map((o) => o.result);
  }

  async list<T>(collection: string): Promise<T[]> {
    const raw = (await this.cmd(["HVALS", key(collection)])) as string[] | null;
    if (!Array.isArray(raw)) return [];
    const out: T[] = [];
    for (const s of raw) {
      try {
        out.push(JSON.parse(s) as T);
      } catch {
        /* skip malformed */
      }
    }
    return out;
  }
  async get<T>(collection: string, id: string): Promise<T | null> {
    const raw = (await this.cmd(["HGET", key(collection), id])) as string | null;
    return raw ? (JSON.parse(raw) as T) : null;
  }
  async put<T extends { id: string }>(collection: string, record: T): Promise<T> {
    await this.cmd(["HSET", key(collection), record.id, JSON.stringify(record)]);
    return record;
  }
  async remove(collection: string, id: string): Promise<void> {
    await this.cmd(["HDEL", key(collection), id]);
  }
}

let cached: Db | null = null;

/** The active store: durable KV when configured, else in-process memory. */
export function db(env: NodeJS.ProcessEnv = process.env): Db {
  if (cached) return cached;
  const creds = readKvEnv(env);
  cached = creds ? new KvDb(creds) : new MemoryDb();
  return cached;
}

/** Stable-ish id without Math.random/Date at module scope (both fine at call time). */
export function newId(prefix = "rec"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
