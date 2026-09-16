import { readKvEnv } from "@/lib/telemetry/kv";
import { fileList, fileGet, filePut, fileRemove, fileStoreAvailable } from "./filestore";

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

/* Tenancy — which collections are per-workspace, and who namespaces them.
 *
 * The `Db` interface is deliberately tenant-agnostic: a collection is just a
 * name, and the CALLER decides whether that name carries a workspace. Callers
 * that own per-workspace data build the name with `scopeKey` from lib/tenant,
 * which leaves the demo workspace on the unsuffixed name so everything written
 * before tenancy stays exactly where it is:
 *
 *   scoped by the caller     "sentiment"        lib/live/classify
 *                            "prompt_topics"    lib/live/classify
 *                            "entity_verdicts"  lib/live/entity
 *                            "segment_settings" lib/segments/catalog
 *                            "audiences"        lib/segments/catalog
 *
 *   deliberately GLOBAL      "users", "sessions"  identity spans workspaces —
 *                                                 scoping them would make login
 *                                                 unresolvable
 *                            "workspace"          the record id IS the
 *                                                 workspace id, so the
 *                                                 collection must stay shared
 *                            "leads", "views"     marketing capture for the
 *                                                 product itself, not a tenant's
 *
 *   row-filtered instead     "prompts", "actions" carry a `workspaceId` FIELD
 *                                                 (lib/db/entities) and are
 *                                                 filtered on read
 *
 * A new per-workspace collection goes through `scopeKey` at its call site. */

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

/* Local-development store: JSON files under .data/. Unlike MemoryDb this is
   shared across Next's separate module graphs, so data written by an API route
   is readable by a server component on the same machine. */
class FileDb implements Db {
  kind = "memory" as const; // reported as non-durable; it is dev-only
  durable = false;
  async list<T>(collection: string): Promise<T[]> {
    return fileList<T>(collection);
  }
  async get<T>(collection: string, id: string): Promise<T | null> {
    return fileGet<T>(collection, id);
  }
  async put<T extends { id: string }>(collection: string, record: T): Promise<T> {
    return filePut(collection, record);
  }
  async remove(collection: string, id: string): Promise<void> {
    fileRemove(collection, id);
  }
}

let cached: Db | null = null;

/** The active store: durable KV when configured, a local file store in
    development, else in-process memory. */
export function db(env: NodeJS.ProcessEnv = process.env): Db {
  if (cached) return cached;
  const creds = readKvEnv(env);
  cached = creds ? new KvDb(creds) : fileStoreAvailable(env) ? new FileDb() : new MemoryDb();
  return cached;
}

/** Stable-ish id without Math.random/Date at module scope (both fine at call time). */
export function newId(prefix = "rec"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
