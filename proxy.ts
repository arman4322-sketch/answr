import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { GATE_COOKIE, SESSION_COOKIE, isGated, isUnlocked } from "@/lib/gate";

/* First-party AI-crawler capture (INTEGRATIONS.md Move 2, pilot step 3).

   Next 16 renamed Middleware → Proxy; this file must sit at the project root.
   Every request passes through here, which is the ONLY way to see AI crawlers:
   GPTBot/ClaudeBot/PerplexityBot never execute JavaScript, so a client snippet
   can never observe them.

   The proxy stays hot-path-cheap: it matches the UA against a small pattern
   list and, on a hit, fires a non-blocking POST to /api/ingest (which owns the
   store). Non-bot traffic costs one string scan and nothing else.

   The POST is handed to `event.waitUntil()` rather than left floating: it still
   never delays the crawler's response, but the runtime keeps the proxy alive
   until it settles instead of tearing it down mid-flight and dropping the
   event. See node_modules/next/dist/docs/…/file-conventions/proxy.md. */

const BOT_UA_PATTERNS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-User", "Claude-SearchBot",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "GoogleOther", "Google-CloudVertexBot",
  "bingbot", "meta-externalagent", "Bytespider", "Amazonbot",
  "Applebot-Extended", "CCBot", "cohere-ai", "MistralAI-User", "Diffbot",
];

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const ua = request.headers.get("user-agent") ?? "";
  const lower = ua.toLowerCase();
  const hit = BOT_UA_PATTERNS.find((p) => lower.includes(p.toLowerCase()));

  if (hit) {
    const url = new URL("/api/ingest", request.url);
    // The on-demand test hit (/api/telemetry/test-hit) stamps this header so its
    // own copy of the event and ours collapse into one via the ingest dedupe.
    // Real crawlers never send it, so their events are unaffected.
    const probeId = request.headers.get("x-answr-probe") ?? undefined;
    // Background, not blocking: the crawler's response goes out immediately.
    event.waitUntil(
      fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ua, path: request.nextUrl.pathname, id: probeId }),
      }).catch(() => {}),
    );
  }

  /* Access control for /app. Two paths are honored:
       - the shared demo passphrase cookie (isUnlocked), for the public demo, and
       - a real account session cookie (presence only — this is edge middleware
         and cannot hit the data layer; the dashboard layout validates it for
         real via lib/auth and bounces invalid/expired sessions).
     Marketing stays public so crawlers (and prospects) can read it. */
  if (isGated(request.nextUrl.pathname)) {
    const hasDemo = isUnlocked(request.cookies.get(GATE_COOKIE)?.value);
    const hasSession = !!request.cookies.get(SESSION_COOKIE)?.value;
    if (!hasDemo && !hasSession) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals, the ingest route itself (no recursion) and static assets.
  matcher: ["/((?!_next/static|_next/image|api/ingest|favicon.ico|snippet.js).*)"],
};
