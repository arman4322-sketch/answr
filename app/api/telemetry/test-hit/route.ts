import { NextResponse } from "next/server";
import { identifyBot } from "@/lib/bots";
import { summarize, telemetry, type TestHitResult } from "@/lib/telemetry";

/* On-demand proof that the capture pipeline works.

   Everything here is a real request: the route fetches THIS deployment's own
   /pricing with a GPTBot user-agent, which travels the exact path a real
   crawler travels — edge → proxy.ts → /api/ingest → the telemetry store. It
   then waits briefly for that event to show up and, if the fire-and-forget
   ingest hasn't landed yet (or landed on a different serverless instance),
   records the same request itself.

   Both copies carry the same idempotency `id`, so a click always produces
   exactly ONE event, never two — and the event describes a request that
   genuinely happened, with the status code the deployment actually returned.
   Nothing is fabricated: if the fetch fails, nothing is recorded and the
   response says so. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROBE_UA = "GPTBot/1.2 (+https://openai.com/gptbot)";
const PROBE_PATH = "/pricing";
/** Backoff while waiting for the proxy's fire-and-forget ingest to land. */
const WAIT_MS = [120, 220, 350, 500];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: Request) {
  const started = Date.now();
  // The target is built from this request's own origin — no caller-supplied
  // value ever reaches the fetch URL, so there is no SSRF surface here.
  const target = new URL(PROBE_PATH, request.url).toString();
  const id = `probe-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const bot = identifyBot(PROBE_UA);

  let status = 0;
  let error: string | null = null;

  if (!bot) {
    // Only reachable if lib/bots.ts loses its GPTBot entry.
    error = "GPTBot is not in the user-agent catalog";
  } else {
    try {
      const res = await fetch(target, {
        method: "GET",
        headers: { "user-agent": PROBE_UA, "x-answr-probe": id, accept: "text/html" },
        cache: "no-store",
        redirect: "manual",
      });
      status = res.status;
      await res.arrayBuffer().catch(() => {});
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  }

  let observedVia: TestHitResult["observedVia"] = null;
  let recorded = false;

  if (bot && !error) {
    // Give proxy.ts → /api/ingest a moment to land on its own.
    for (const ms of WAIT_MS) {
      await sleep(ms);
      const snap = await telemetry.snapshot();
      if (snap.crawlers.some((e) => e.id === id)) {
        observedVia = "proxy";
        recorded = true;
        break;
      }
    }

    if (!recorded) {
      // Record it here instead. Same `id`, so a late ingest is deduped rather
      // than double-counted. `status` is the real code the deployment returned
      // — a blocked crawler (401/403) is a true event worth seeing.
      const wroteItHere = await telemetry.addCrawler({
        ts: Date.now(),
        id,
        botId: bot.id,
        botLabel: bot.label,
        operator: bot.operator,
        platform: bot.platform,
        kind: bot.kind,
        path: PROBE_PATH,
        status,
        verification: "declared",
      });
      // false ⇒ the proxy's copy landed in the window between our last poll and
      // this write, so the event is in the store either way.
      observedVia = wroteItHere ? "route" : "proxy";
      recorded = true;
    }
  }

  const result: TestHitResult = {
    ok: !error,
    target,
    path: PROBE_PATH,
    ua: PROBE_UA,
    status,
    observedVia,
    recorded,
    elapsedMs: Date.now() - started,
    error,
    summary: await summarize(),
  };

  return NextResponse.json(result);
}
