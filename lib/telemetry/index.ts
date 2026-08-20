import { createKvStore } from "./kv";
import { MemoryStore } from "./memory";
import type { TelemetryStore, TelemetrySummary } from "./types";

export * from "./types";
export { MemoryStore } from "./memory";
export { createKvStore, readKvEnv } from "./kv";

/* Store selection (INTEGRATIONS.md Move 2).

   Durable storage activates automatically: if a KV/Upstash REST env pair is
   present the durable store is used, otherwise we fall back to the in-process
   ring buffer silently. No credential is invented, none is hardcoded, and the
   rest of the app is identical either way — it only ever sees `TelemetryStore`.

   The store is parked on globalThis so dev-server hot reloads (module
   re-evaluation) don't wipe captured events between edits. */

const g = globalThis as unknown as { __answrTelemetry?: TelemetryStore };

export const telemetry: TelemetryStore =
  g.__answrTelemetry ?? (g.__answrTelemetry = createKvStore() ?? new MemoryStore());

/* ---- aggregation (shared by the API and the dashboard view) ---- */

export async function summarize(store: TelemetryStore = telemetry): Promise<TelemetrySummary> {
  const { crawlers: c, referrals: r, since, degraded } = await store.snapshot();

  const botMap = new Map<string, { label: string; operator: string; count: number; lastSeen: number }>();
  for (const e of c) {
    const cur = botMap.get(e.botId) ?? { label: e.botLabel, operator: e.operator, count: 0, lastSeen: 0 };
    cur.count++;
    cur.lastSeen = Math.max(cur.lastSeen, e.ts);
    botMap.set(e.botId, cur);
  }

  const pathMap = new Map<string, number>();
  for (const e of c) pathMap.set(e.path, (pathMap.get(e.path) ?? 0) + 1);

  const srcMap = new Map<string, number>();
  for (const e of r) srcMap.set(e.sourceLabel, (srcMap.get(e.sourceLabel) ?? 0) + 1);

  return {
    since,
    crawlerEvents: c.length,
    uniqueAgents: botMap.size,
    pagesCrawled: pathMap.size,
    referrals: r.length,
    byBot: [...botMap.values()].sort((a, b) => b.count - a.count),
    byPath: [...pathMap.entries()].map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 12),
    bySource: [...srcMap.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
    recent: c.slice(-25).reverse().map((e) => ({ ...e, type: "crawler" as const })),
    store: { kind: store.kind, label: store.label, durable: store.durable, degraded },
  };
}
