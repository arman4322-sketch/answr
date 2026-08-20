/* Telemetry event shapes + the pluggable store contract (INTEGRATIONS.md Move 2).

   Everything that flows through here is REAL data — requests actually observed
   on this deployment, never a fixture. The store behind it is swappable: see
   ./memory (zero-dependency ring buffer) and ./kv (durable, activates by itself
   when a KV/Upstash REST env var is present). Nothing else in the app changes
   when the backend changes — that is the whole point of this interface. */

export type CrawlerEvent = {
  ts: number;
  botId: string;
  botLabel: string;
  operator: string;
  platform: string;
  kind: "crawler" | "assistant-fetch";
  path: string;
  status: number;
  /** UA matched a published pattern; IP-range verification is a separate job */
  verification: "declared" | "verified";
  /** Optional idempotency key. The on-demand test hit stamps one so the copy
      recorded by proxy.ts and the copy recorded by the test route collapse into
      a single event instead of double-counting the same request. */
  id?: string;
};

export type ReferralEvent = {
  ts: number;
  sourceId: string;
  sourceLabel: string;
  path: string;
  /** how it was detected */
  via: "referrer" | "utm";
};

export type TelemetryStoreKind = "memory" | "kv";

/** One read of the whole window — a single round trip for durable backends. */
export type TelemetrySnapshot = {
  /** oldest → newest */
  crawlers: CrawlerEvent[];
  /** oldest → newest */
  referrals: ReferralEvent[];
  /** when this store started collecting */
  since: number;
  /** non-null when the durable backend failed and the local mirror was served */
  degraded: string | null;
};

export interface TelemetryStore {
  readonly kind: TelemetryStoreKind;
  /** human label naming the backend AND the env var that selected it */
  readonly label: string;
  /** true when events survive a cold start and are shared across instances */
  readonly durable: boolean;
  /** resolves false when the event carried an `id` already recorded (skipped) */
  addCrawler(e: CrawlerEvent): Promise<boolean>;
  addReferral(e: ReferralEvent): Promise<boolean>;
  snapshot(): Promise<TelemetrySnapshot>;
}

/** Aggregated read shared by /api/telemetry and the /app/live view. */
export type TelemetrySummary = {
  since: number;
  crawlerEvents: number;
  uniqueAgents: number;
  pagesCrawled: number;
  referrals: number;
  byBot: { label: string; operator: string; count: number; lastSeen: number }[];
  byPath: { path: string; count: number }[];
  bySource: { label: string; count: number }[];
  recent: (CrawlerEvent & { type: "crawler" })[];
  /** which backend answered this read — drives the honesty panel on /app/live */
  store: {
    kind: TelemetryStoreKind;
    label: string;
    durable: boolean;
    degraded: string | null;
  };
};

/** Result of POST /api/telemetry/test-hit (the on-demand pipeline proof).
    Lives here rather than in the route file: Next only allows HTTP-method and
    config exports from a `route.ts`. */
export type TestHitResult = {
  ok: boolean;
  /** the URL that was actually requested */
  target: string;
  path: string;
  ua: string;
  /** HTTP status this deployment returned to the crawler UA (0 if unreachable) */
  status: number;
  /** "proxy" = the live capture path recorded it; "route" = the test route did */
  observedVia: "proxy" | "route" | null;
  recorded: boolean;
  elapsedMs: number;
  error: string | null;
  /** fresh read so the caller can update without a second round trip */
  summary: TelemetrySummary | null;
};

/** Ring-buffer / list length shared by every implementation. */
export const MAX_EVENTS = 500;

/** How long an idempotency key stays claimed in a durable store. */
export const DEDUPE_TTL_SECONDS = 600;
