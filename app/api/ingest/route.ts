import { NextResponse } from "next/server";
import { identifyBot } from "@/lib/bots";
import { telemetry } from "@/lib/telemetry";

/* Crawler-event ingest. Fed by proxy.ts on this deployment, and — for customer
   sites — by the same payload shape from a CDN log drain (Vercel Drains,
   Cloudflare AI Crawl Control) or the server-side npm package.
   See INTEGRATIONS.md §2.2. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


/* Write guard — these endpoints are public by necessity (the proxy and the
   client snippet both POST to them), so accept only same-origin requests or a
   caller holding ANSWR_INGEST_SECRET. Without this, anyone could forge crawler
   or referral events into the store; an audit did exactly that. */
function sameOriginOrSecret(request: Request): boolean {
  const secret = process.env.ANSWR_INGEST_SECRET;
  if (secret && request.headers.get("x-answr-secret") === secret) return true;

  const host = request.headers.get("host");
  for (const h of ["origin", "referer"]) {
    const v = request.headers.get(h);
    if (v) {
      try {
        if (new URL(v).host === host) return true;
      } catch {}
    }
  }
  // The proxy's server-side fetch sends neither Origin nor Referer; it is
  // same-process, so allow only when both are absent AND no secret is required.
  return !request.headers.get("origin") && !request.headers.get("referer") && !secret;
}

export async function POST(request: Request) {
  if (!sameOriginOrSecret(request)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  // Shared-secret gate for external senders (drains/snippets). Same-origin
  // calls from our own proxy carry no secret and are accepted; when
  // ANSWR_INGEST_SECRET is set, external callers must present it.
  const secret = process.env.ANSWR_INGEST_SECRET;
  if (secret) {
    const origin = request.headers.get("origin");
    const auth = request.headers.get("x-answr-ingest");
    const sameOrigin = !origin || new URL(request.url).origin === origin;
    if (!sameOrigin && auth !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  let body: { ua?: string; path?: string; status?: number; id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const bot = identifyBot(body.ua);
  if (!bot) return NextResponse.json({ ok: true, recorded: false });

  // Awaited, not fired-and-forgotten: with a durable store the write is a
  // network round trip, and a serverless response can end the instance.
  const recorded = await telemetry.addCrawler({
    ts: Date.now(),
    botId: bot.id,
    botLabel: bot.label,
    operator: bot.operator,
    platform: bot.platform,
    kind: bot.kind,
    path: (body.path ?? "/").slice(0, 200),
    status: body.status ?? 200,
    // UA matched a published pattern. IP-range verification against the
    // operators' JSON files is a separate job (INTEGRATIONS.md §2.2).
    verification: "declared",
    // Idempotency key, only ever set by the on-demand test hit. `recorded:false`
    // means this exact request was already recorded and was skipped.
    id: body.id ? String(body.id).slice(0, 64) : undefined,
  });

  return NextResponse.json({ ok: true, recorded });
}
