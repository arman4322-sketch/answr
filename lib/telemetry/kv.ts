import { MemoryStore } from "./memory";
import {
  DEDUPE_TTL_SECONDS,
  MAX_EVENTS,
  type CrawlerEvent,
  type ReferralEvent,
  type TelemetrySnapshot,
  type TelemetryStore,
} from "./types";

/* Durable store over the Upstash REST protocol — activates BY ITSELF when the
   env vars are present, and is never referenced otherwise.

   Two env-var families are supported, both speaking the same REST protocol:

     KV_REST_API_URL      + KV_REST_API_TOKEN
       Injected by a Vercel Marketplace Redis integration (and by the legacy
       Vercel KV store, which Vercel migrated onto Upstash Redis in Dec 2024).
       https://vercel.com/docs/redis

     UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
       Upstash's own names, for a database provisioned directly at upstash.com.
       https://upstash.com/docs/redis/features/restapi

   Nothing is hardcoded and no credential lives in this repo — if neither pair
   is set, ./index silently keeps the in-memory store. Transport is plain
   `fetch` against the documented `/pipeline` endpoint (POST, Bearer auth, body
   = 2-D array of commands), so there is no SDK dependency to add either.

   Data model — two capped Redis lists plus a first-write timestamp:
     answr:telemetry:crawlers   LPUSH + LTRIM 0 499   (newest first in Redis)
     answr:telemetry:referrals  LPUSH + LTRIM 0 499
     answr:telemetry:since      SET … NX
     answr:telemetry:seen:<id>  SET … NX EX 600       (idempotency claims) */

const KEY_CRAWLERS = "answr:telemetry:crawlers";
const KEY_REFERRALS = "answr:telemetry:referrals";
const KEY_SINCE = "answr:telemetry:since";
const keySeen = (id: string) => `answr:telemetry:seen:${id}`;

type KvCreds = { url: string; token: string; via: string };

/** Reads the documented env-var names. Returns null when none are configured. */
export function readKvEnv(env: NodeJS.ProcessEnv = process.env): KvCreds | null {
  const pairs: [string, string, string][] = [
    ["KV_REST_API_URL", "KV_REST_API_TOKEN", "KV_REST_API_URL / KV_REST_API_TOKEN"],
    ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN"],
  ];
  for (const [urlVar, tokenVar, via] of pairs) {
    const url = env[urlVar]?.trim();
    const token = env[tokenVar]?.trim();
    if (url && token && /^https?:\/\//.test(url)) {
      return { url: url.replace(/\/+$/, ""), token, via };
    }
  }
  return null;
}

function describe(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

function parseEvents<T>(raw: unknown): T[] {
  if (!Array.isArray(raw)) return [];
  const out: T[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    try {
      out.push(JSON.parse(item) as T);
    } catch {
      /* a malformed row must never take down the whole read */
    }
  }
  return out;
}

class KvStore implements TelemetryStore {
  readonly kind = "kv" as const;
  readonly durable = true;
  readonly label: string;

  /** Local copy of what THIS instance wrote — served only if the backend is down. */
  private mirror = new MemoryStore();
  private lastError: string | null = null;
  /** Stand-in for `since` until the shared store holds its first event. */
  private booted = Date.now();

  constructor(private creds: KvCreds) {
    this.label = `Durable Redis via ${creds.via}`;
  }

  private async pipeline(commands: string[][]): Promise<unknown[]> {
    const res = await fetch(`${this.creds.url}/pipeline`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.creds.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(commands),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`REST call returned ${res.status}`);
    const body = (await res.json()) as { result?: unknown; error?: string }[];
    if (!Array.isArray(body)) throw new Error("unexpected pipeline response");
    const failed = body.find((r) => r.error);
    if (failed) throw new Error(failed.error);
    return body.map((r) => r.result);
  }

  /** Claim an idempotency key. False ⇒ another instance already recorded it. */
  private async claim(id: string): Promise<boolean> {
    const [won] = await this.pipeline([["SET", keySeen(id), "1", "NX", "EX", String(DEDUPE_TTL_SECONDS)]]);
    return won !== null;
  }

  private async push(key: string, event: CrawlerEvent | ReferralEvent) {
    await this.pipeline([
      ["LPUSH", key, JSON.stringify(event)],
      ["LTRIM", key, "0", String(MAX_EVENTS - 1)],
      ["SET", KEY_SINCE, String(event.ts), "NX"],
    ]);
  }

  async addCrawler(e: CrawlerEvent): Promise<boolean> {
    // Mirror first so a KV outage still leaves this instance with something true.
    if (!(await this.mirror.addCrawler(e))) return false;
    try {
      if (e.id && !(await this.claim(e.id))) return false;
      await this.push(KEY_CRAWLERS, e);
      this.lastError = null;
    } catch (err) {
      this.lastError = describe(err);
    }
    return true;
  }

  async addReferral(e: ReferralEvent): Promise<boolean> {
    await this.mirror.addReferral(e);
    try {
      await this.push(KEY_REFERRALS, e);
      this.lastError = null;
    } catch (err) {
      this.lastError = describe(err);
    }
    return true;
  }

  async snapshot(): Promise<TelemetrySnapshot> {
    try {
      const last = String(MAX_EVENTS - 1);
      const [crawlers, referrals, since] = await this.pipeline([
        ["LRANGE", KEY_CRAWLERS, "0", last],
        ["LRANGE", KEY_REFERRALS, "0", last],
        ["GET", KEY_SINCE],
      ]);
      this.lastError = null;
      return {
        // LPUSH stores newest-first; every consumer here wants oldest → newest.
        crawlers: parseEvents<CrawlerEvent>(crawlers).reverse(),
        referrals: parseEvents<ReferralEvent>(referrals).reverse(),
        since: Number(since) || this.booted,
        degraded: null,
      };
    } catch (err) {
      const local = await this.mirror.snapshot();
      return {
        ...local,
        degraded: `Durable store unreachable (${describe(err)}) — showing this instance's buffer instead.`,
      };
    }
  }

  /** Last transport error, for the honesty panel. */
  get transportError() {
    return this.lastError;
  }
}

/** Returns a durable store when the env vars are set, otherwise null. */
export function createKvStore(env: NodeJS.ProcessEnv = process.env): TelemetryStore | null {
  const creds = readKvEnv(env);
  return creds ? new KvStore(creds) : null;
}
