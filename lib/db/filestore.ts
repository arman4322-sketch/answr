import fs from "node:fs";
import path from "node:path";

/* File-backed JSON store for LOCAL DEVELOPMENT.

   Why this exists: the in-memory store isn't shared between Next's separate
   module graphs (an API route writing and a server component reading are
   different instances), so locally-written data reads back empty. On a
   serverless host the same is true across instances. Durable KV/Redis solves
   this in production; this file store solves it on a single dev machine so the
   whole live pipeline can be built and verified without an external account.

   Selection order (see lib/db/index.ts and lib/sampler/store.ts):
     KV/Upstash env set  → durable shared store (production)
     else, non-production → this file store (.data/, gitignored)
     else                 → in-memory (last resort)

   Not for production: a serverless filesystem is ephemeral and per-instance. */

const ROOT = path.join(process.cwd(), ".data");

function fileFor(collection: string): string {
  const safe = collection.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(ROOT, `${safe}.json`);
}

function readAll(collection: string): Record<string, unknown> {
  try {
    const raw = fs.readFileSync(fileFor(collection), "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(collection: string, data: Record<string, unknown>): void {
  fs.mkdirSync(ROOT, { recursive: true });
  // Write-then-rename keeps concurrent readers from seeing a truncated file.
  const target = fileFor(collection);
  const tmp = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, target);
}

/** Read every record in a collection. */
export function fileList<T>(collection: string): T[] {
  return Object.values(readAll(collection)) as T[];
}

/** Read one record by id, or null. */
export function fileGet<T>(collection: string, id: string): T | null {
  const all = readAll(collection);
  return (all[id] as T) ?? null;
}

/** Insert or replace one record. */
export function filePut<T extends { id: string }>(collection: string, record: T): T {
  const all = readAll(collection);
  all[record.id] = record;
  writeAll(collection, all);
  return record;
}

/** Remove one record. */
export function fileRemove(collection: string, id: string): void {
  const all = readAll(collection);
  if (id in all) {
    delete all[id];
    writeAll(collection, all);
  }
}

/** Append to a capped, newest-first list (used by the answer/telemetry stores). */
export function filePushCapped<T>(collection: string, item: T, cap = 500): void {
  const all = readAll(collection) as { items?: T[] };
  const items = Array.isArray(all.items) ? all.items : [];
  items.unshift(item);
  writeAll(collection, { items: items.slice(0, cap) });
}

/** Read a capped list, newest first. */
export function fileListCapped<T>(collection: string, limit = 50): T[] {
  const all = readAll(collection) as { items?: T[] };
  const items = Array.isArray(all.items) ? all.items : [];
  return items.slice(0, limit);
}

/** True when the file store should be used (dev machine, no durable KV). */
export function fileStoreAvailable(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV !== "production";
}
