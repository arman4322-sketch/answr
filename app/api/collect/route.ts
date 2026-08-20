import { NextResponse } from "next/server";
import { identifyReferral } from "@/lib/bots";
import { telemetry } from "@/lib/telemetry";

/* AI-referral capture — the human side. Fed by public/snippet.js on first touch
   of a session: it reports document.referrer and utm_source, and we classify
   against the known assistant hostnames / link-decoration conventions.

   Counts are a FLOOR: a large share of assistant clicks arrive with the
   referrer stripped, and Google AI Overviews clicks are indistinguishable from
   organic search. The ai_referrals provenance tooltip says so. */

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
  let body: { referrer?: string; utm?: string; path?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const source = identifyReferral(body.referrer, body.utm);
  if (!source) return NextResponse.json({ ok: true, recorded: false });

  // Awaited: with a durable store this write is a network round trip.
  await telemetry.addReferral({
    ts: Date.now(),
    sourceId: source.id,
    sourceLabel: source.label,
    path: (body.path ?? "/").slice(0, 200),
    via: body.utm && identifyReferral(null, body.utm) ? "utm" : "referrer",
  });

  return NextResponse.json({ ok: true, recorded: true });
}
