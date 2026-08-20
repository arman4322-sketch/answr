import {
  MAX_EVENTS,
  type CrawlerEvent,
  type ReferralEvent,
  type TelemetrySnapshot,
  type TelemetryStore,
} from "./types";

/* Zero-dependency store: an in-process ring buffer.

   Locally (one dev server) this behaves exactly like production would. On
   serverless it is instance-scoped and resets on a cold start — which is the
   honest limit the /app/live panel states, and the reason ./kv exists. */

export class MemoryStore implements TelemetryStore {
  readonly kind = "memory" as const;
  readonly label = "In-process ring buffer (no KV env var set)";
  readonly durable = false;

  private c: CrawlerEvent[] = [];
  private r: ReferralEvent[] = [];
  private started = Date.now();

  async addCrawler(e: CrawlerEvent): Promise<boolean> {
    if (e.id && this.c.some((x) => x.id === e.id)) return false;
    this.c.push(e);
    if (this.c.length > MAX_EVENTS) this.c.shift();
    return true;
  }

  async addReferral(e: ReferralEvent): Promise<boolean> {
    this.r.push(e);
    if (this.r.length > MAX_EVENTS) this.r.shift();
    return true;
  }

  async snapshot(): Promise<TelemetrySnapshot> {
    return { crawlers: [...this.c], referrals: [...this.r], since: this.started, degraded: null };
  }
}
