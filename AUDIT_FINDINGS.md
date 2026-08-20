# Answr — Client-Readiness Audit Findings

Synthesis of eight specialist audits (functional completeness; data integrity; backend/API; security; correctness under real conditions; UI/UX; accessibility; responsive/performance; SEO/metadata; content/legal; code health), run against the live deployment at **https://useanswr.com** and the repo at `/Users/arman_usman/Desktop/PROJECTS/answr` on **8 Aug 2026**.

Severities have been re-ranked across auditors so P0/P1 mean the same thing everywhere in this document:

| | Meaning |
|---|---|
| **P0** | Creates legal, security or credibility exposure for the client or the vendor, or states a number/scope the screen does not honor in a way a client will act on. Fix before anyone outside the team sees the build. |
| **P1** | A client hits it in a normal demo or evaluation, and it damages trust or blocks a core task. Fix before the next demo. |
| **P2** | A real defect or internal contradiction that a careful evaluator will find. Fix before general availability. |
| **P3** | Polish. Cheap, visible to the meticulous, safe to batch. |

---

## 1. Verdict

**No — Answr is not client-ready, and the blockers are mostly not in the product.** The dashboard itself is unusually well built (zero dead controls across 37 routes, a genuinely correct date-window engine, an export envelope better than most shipping SaaS); what is not ready is everything around it — a passphrase gate that any visitor walks past by percent-encoding one character of the URL, an internal competitor teardown page live at `/app/capability-map`, an open telemetry endpoint feeding the one screen badged "Real data", three marketing lead forms that confirm a lead and transmit nothing, and a marketing site that asserts SOC 2 Type II, a 4.8 G2 rating and two real publicly traded companies as customers with invented results.

**The shortest path to yes is roughly four engineering days on nine P0 items** — normalize the gate path and add a server-side check in the dashboard layout, delete `/app/capability-map`, authenticate `/api/ingest` (or drop the "Real data" badge until it is), point the three lead forms at a real destination, make the Insights date pill either honest or inert, and strip every compliance, review-platform and customer claim that has no artifact behind it — run in parallel with a legal-copy track to publish a real Privacy Policy, Terms and DPA.

**Everything after that — about fifteen working days of P1 work — is the distance between a credible demo and something you can put in front of a procurement team**: the numbers must agree with each other across screens and CSVs, the sidebar must agree with the pages it links to, the dashboard needs headings, landmarks and modal focus traps before any accessibility review, and the repo needs to be under version control before another line is written.

---

## 2. Top 10 by priority

Ordered by severity × how likely a client is to hit it, not by dimension. Items 2, 4 and 10's cheap half are sub-hour fixes with outsized payoff — do those first while the bigger ones are scoped.

| # | Finding | Sev | Why this one first | Effort |
|---|---|---|---|---|
| 1 | **Passphrase gate is bypassed by percent-encoding one character** — `/%61pp/overview` returns the full dashboard, HTTP 200, no cookie | P0 | The gate is the only access control that exists, and all 36 dashboard routes are statically prerendered, so once the proxy waves the request through there is no second check anywhere. Harmless today, a client-data breach the day a real workspace exists. | 4h |
| 2 | **`/app/capability-map` ships an internal competitor teardown to every demo recipient** | P0 | Calls the product "ANSWR (THIS PROJECT)", names Profound and Peec AI as teardown sources, and lists what is "still unmade". The passphrase is printed on the login card by design, so the audience is anyone with the demo link. Deleting the route is a 15-minute change. | 15m |
| 3 | **Every marketing lead-capture form confirms the lead and transmits nothing** | P0 | Zero network requests fire on `/demo`, the homepage snapshot form or the blog newsletter. "Book your demo" tells a prospect a human will be in touch within one business day. The site is live and publicly reachable — this is lost revenue plus a broken promise on the record. | 4h |
| 4 | **Fabricated third-party proof: MTY Food Group and Bell Media as customers, plus a 4.8 G2 rating and a "Leader" badge** | P0 | Two real TSX-listed companies presented as completed engagements with a "MEASURED · 90 DAYS" badge, official logos, and a methodology section; an invented aggregate rating on a real review platform. `REBRAND_MAP.md` specifies a "Sample data" marker that was never shipped. Falsifiable by anyone at either company in one phone call. | 4h |
| 5 | **SOC 2 Type II, annual pen test, 99.9% SLA and GDPR/CCPA asserted on all 68 routes — with no Privacy Policy or Terms in existence** | P0 | The footer badge is on every page; `/trust`, `/status`, `/privacy`, `/terms`, `/dpa` all 404; and `/signup` binds the user to Terms and a Privacy Policy that do not exist. This is the page enterprise procurement opens first. | 6h to strip; 2–5d legal drafting |
| 6 | **Answer Engine Insights relabels the window and redraws the chart axis to 7 days while every number stays at its 30-day value** | P0 | Not an omission — an affirmative misstatement, on all five AEI tabs. Overview, Citations and Agent Analytics genuinely re-slice, so Insights is the odd one out, and the app contradicts itself twice about which screens honor the filter. | 4h (inert) / 3d (real) |
| 7 | **`/api/ingest` accepts anonymous forged events into the one store badged "Real data"** | P0 | Two vectors, neither closed by the secret the code relies on: a bare POST, and simply setting a `User-Agent` on any page request. `ANSWR_INGEST_SECRET` is provably unset in production. A "real data" badge on internet-writable data. | 1–2d |
| 8 | **Sidebar count badges contradict the pages they link to** — Actions 12 vs 24 open, Conversations 38 vs 2,841, Reports 3 vs 4 | P1 | The chrome contradicts the content from every screen simultaneously, so it needs no comparison to spot, and Actions-open is the number an AEO buyer actually acts on. Five hardcoded string literals in `Sidebar.tsx`. | 4h |
| 9 | **Overview and Insights report different visibility series for the same metric and window** — +2.8pt vs +10.7pt | P1 | The product's headline number, restated by the two screens a client opens first, off by 3.8×, and both versions leave the building in downloadable executive CSVs. | 4h |
| 10 | **⌘K palette and the Prompts search box accept typing and do nothing** | P1 | The two controls a power user reaches for first. ⌘K opens prefilled with `citations`, never filters, reaches 2 of ~36 screens, and asserts under the results that "Search is fuzzy — typos still match." The Prompts box is silent — no filter, no toast. Everything else in the app at least toasts honestly. | 6h (Prompts box: 15m) |

**Next five, all under an hour each, and all visible:** avg-answer-position polarity is inverted (an improvement painted red and exported as "worse"); Insights "Best platform" contradicts the heatmap directly above it for 3 of 5 topics; Overview "Top cited sources" skips the #4 and #6 domains in the table it links to; `/login?next=` is an unvalidated open redirect (one regex); Reports "Download ↓" returns a table of contents instead of the report.

---

## 3. Full findings

**Editorial notes.** Findings reported by two or more auditors have been merged into one entry with a cross-reference note; where auditors disagreed on evidence, the disagreement is stated in the finding. Severities are this document's, not the originating auditor's. Deliberately excluded as known-intentional design decisions: fixture data inside the gated dashboard; the passphrase gate not being authentication; the desktop-only dashboard; cold-instance zeros on `/app/live`; deliberately inert filter pills. Where a finding below touches one of those, it is because the decision is implemented inconsistently — public marketing pages carrying the same fixtures with no marker, the 900–1418px band that gets neither the interstitial nor containment, the referral counter that is structurally zero rather than cold, the AEI pill that redraws its axis. Low- and medium-confidence findings are marked at the end of each entry.

---

### 3.1 Security, the gate, and the telemetry pipeline

### [P0 · broken] Passphrase gate is bypassed by percent-encoding one character of the path

**Where:** `lib/gate.ts:37-38` (`isGated`) + `proxy.ts:54`; all 36 prerendered `app/(dash)/app/**` routes.
**Steps:** From a clean shell with no cookie: `curl -s -o enc.html -w '%{http_code}' 'https://useanswr.com/%61pp/overview'` → 200, 93,508 bytes, `<title>Overview · Answr</title>`, 6 occurrences of "Adidas". Same for `/%61pp/citations`, `/%61pp/prompts`, `/%61pp/settings/api-keys`, `/a%70p/overview`, `/ap%70/overview`. Control: `/app/overview` → 307 → `/login?next=…`.
**Expected / Actual:** Expected any dashboard route without a valid `answr_demo_access` cookie to redirect to `/login` — the gate's entire stated purpose ("the dashboard is not browsable by direct URL"). Actual: swapping one character for its `%XX` escape returns the complete server-rendered dashboard to an anonymous visitor. Mechanism proven: a probe request to the encoded path is recorded in `/api/telemetry` with `path` exactly `"/%61pp/overview"`, i.e. `request.nextUrl.pathname` reaches `isGated()` still percent-encoded, `startsWith("/app")` is false, and `NextResponse.next()` serves the page.
**Why it matters:** `npm run build` marks all 36 `/app/**` routes ○ (Static), and `app/(dash)/app/layout.tsx` has no `cookies()` or `redirect()` call — the proxy is the single point of failure, and past it the HTML comes straight off the static handler. No credential, no tooling and no prior knowledge required. Compounded by the missing `robots.txt`/`noindex` finding below: the bypassed URLs are also indexable.
**Fix:** (1) In `lib/gate.ts`, decode and normalize before the prefix test — match `decodeURIComponent(pathname).replace(/\/+/g,'/')` inside a try/catch that fails **closed**, and match the path segment rather than the raw prefix. (2) Add defense in depth in `app/(dash)/app/layout.tsx`: read the cookie via `next/headers` `cookies()`, call `isUnlocked()`, `redirect('/login')` when false — this also forces the routes off the static prerender path. (3) Add the Playwright guard `READINESS.md` Phase 2 already calls for, extended to `/%61pp/overview`, `/a%70p/overview`, `//app/overview`. **(4 hours)**
**Confidence:** high.

### [P0 · risky] Anyone can write forged events into the one store badged "Real data" — two vectors, neither closed by the secret the code relies on

**Where:** `app/api/ingest/route.ts:18-34` (`sameOriginOrSecret`) and `:36-83`; `proxy.ts:33-51`; surfaced on `app/(dash)/app/live/page.tsx` under the green REAL DATA badge via `LiveTelemetry.tsx:398-423`.
**Steps:** Path A — `curl -X POST https://useanswr.com/api/ingest -H 'content-type: application/json' -d '{"ua":"ClaudeBot","path":"/FORGED-1","status":200}'` → `{"ok":true,"recorded":true}`. Repeated 6×; `GET /api/telemetry` then reported `crawlerEvents:7`, `uniqueAgents:2`, ClaudeBot count 6 — every one fabricated. Adding `-H 'Origin: https://useanswr.com'` also succeeds. Path B — no API knowledge needed: `curl -s -o /dev/null 'https://useanswr.com/POISONED-BY-UA-HEADER' -A 'ClaudeBot/1.0'`, then `/api/telemetry` contains that path. The idempotency key is caller-supplied: `-H 'x-answr-probe: attacker-controlled-id-0001'` lands in the store as the event's `id`.
**Expected / Actual:** Expected `/app/live` to show first-party traffic actually observed on this deployment — the page says "this one counts requests that actually happened". Actual: the store accepts unauthenticated writes with attacker-chosen bot, path and idempotency key, rendered under that badge indistinguishably from genuine hits. `ANSWR_INGEST_SECRET` is provably unset in production (a header-less POST succeeds, which `route.ts:33` only permits when the var is absent).
**Why it matters:** The guard is structurally unsound, not merely unconfigured — `Origin` and `Referer` are attacker-controlled outside a browser, so setting the secret does not close it; a spoofed Origin satisfies `route.ts:22-30` before the secret is consulted. Path B needs no knowledge of the API at all. Once KV is enabled, each forged request with a fresh probe id creates a Redis key with a 600s TTL and no rate limit — unbounded key creation against a billed store.
**Fix:** Stop treating Origin/Referer as authentication. Require a per-workspace bearer token on `/api/ingest` and `/api/collect` and reject anything without one — fail closed, including the proxy's own call, which should carry the token from env. Add per-IP rate limiting to both. Until a token exists, drop the "Real data" badge or state on `/app/live` that the endpoint is open. Independently: only record paths that resolve to a known route on this deployment, and ignore caller-supplied `x-answr-probe` from external callers. **(1–2 days)**
**Confidence:** high.
**Note:** ~12 forged events (paths beginning `/FORGED-`, `/AUDIT-FORGED-EVENT-XYZ`, `/POISONED-BY-UA-HEADER`, a 200-char string, `/%61pp/overview`) were written into the live in-process buffer while proving this. They vanish on cold start but may still be visible if `/app/live` is demoed before then.

### [P0 · risky] An internal competitor teardown and build-status memo ships live inside the client dashboard at `/app/capability-map`

**Where:** `app/(dash)/app/capability-map/page.tsx:18-22` — live at `https://useanswr.com/app/capability-map`. *Reported independently by the functional, UX and code-health auditors — merged.*
**Steps:** `curl -c c.txt -X POST https://useanswr.com/api/session -H 'content-type: application/json' -d '{"email":"dana@nike.com","password":"answr-demo"}'` then `curl -b c.txt https://useanswr.com/app/capability-map` → HTTP 200. Or sign in with the credential printed on the login card and navigate directly.
**Expected / Actual:** Expected a dashboard route to show product content. Actual: an internal project-status document titled "Where Answr stands, capability by capability", subtitled "functional comparison from **your** teardown research (Aug 2026) · Answr screens are original designs, not recreations of either product", with columns headed **"ANSWR (THIS PROJECT)"**, "PROFOUND (DOCUMENTED)" and "PEEC AI (DOCUMENTED)", cells carrying internal build notation ("→ 01, 02", "→ P2-08", "→ P2-01/02/03", "source-gap view is a good next add"), and a closing card: "Gap status: every formerly open gap now exists as a frame — assets (06a), watched URLs & source gap (12a), live logs (21a), plus MISC drafts M2–M13 … **Still unmade: real region map, mobile layouts.**"
**Why it matters:** This is the single most damaging thing a paying client can find. It tells them the product is a set of design frames, names two competitors and what was compared against whose teardown research, exposes a list of what the product does not yet do, and carries a defensive IP disclaimer addressed to the builder. The passphrase is printed on the login card by design, so the effective audience is anyone who reaches `/login`. The page has **zero inbound links** anywhere in `app/` or `components/` and is absent from the sidebar and the ⌘K palette, so it exists only to be stumbled onto or shared by accident — and unlinked is not access control: it still returns 200. (`/app/content-score` is orphaned the same way but its content is product content — covered separately as a completeness issue.)
**Fix:** Delete `app/(dash)/app/capability-map/` from the client build — it is a planning document, not a feature; move it to `docs/` or a non-deployed directory. If it must stay for internal reference, exclude it from the production build behind an env flag that is unset in production, rather than relying on it being unlinked. Re-run the curl afterwards to confirm 404. **(15 minutes)**
**Confidence:** high.

### [P1 · risky] Open redirect: `/login?next=<absolute URL>` sends the visitor off-site after a successful sign-in

**Where:** `app/(auth)/login/LoginForm.tsx:38` (`useSearchParams().get("next")`) and `:53` (`window.location.assign(next)`). *Reported independently by the security and UX auditors — merged.*
**Steps:** Driven in headless Chrome with cookies cleared between trials, passphrase typed into `#login-password`: `next=/app/overview` → `useanswr.com/app/overview` (correct); `next=https://example.com/` → `https://example.com/`; `next=//example.com/` → `https://example.com/`; `next=javascript:…` → blocked by Chrome (so this is a redirect issue, not XSS).
**Expected / Actual:** Expected `next` accepted only as a same-origin path — `proxy.ts:56-58` only ever writes a pathname into it. Actual: any absolute or protocol-relative URL is handed to `window.location.assign()` and the browser leaves the site immediately after a successful login on the genuine domain.
**Why it matters:** The passphrase is printed on the login card, so "post-login only" is not a barrier. A prospect handed `https://useanswr.com/login?next=https://answr-login.example/` sees the real domain and the real card, signs in, and lands on a look-alike that can ask for anything. Becomes P0 the moment real accounts exist.
**Fix:** Accept `next` only when it matches `/^\/(?!\/)/` (single leading slash), ideally only when it starts with `/app`; otherwise fall back to `/app/overview`. One line, no change to the legitimate flow. **(15 minutes)**
**Confidence:** high.

### [P1 · broken] The durable store reports success on a failed write — events drop silently while the UI shows "Durable capture active"

**Where:** `lib/telemetry/kv.ts:124-135` (`addCrawler`), `:137-146` (`addReferral`), `:148-171` (`snapshot`), `:174-176` (`transportError`, dead); consumed by `app/api/ingest/route.ts:65-82` and `LiveTelemetry.tsx:248,514-517`.
**Steps:** Code path only — no KV env pair is configured on this deployment (`GET /api/telemetry` reports `store {"kind":"memory","durable":false}`). `addCrawler` writes the local mirror, then `try { claim(); push(); } catch (err) { this.lastError = describe(err) }` and unconditionally `return true` at line 134. `snapshot()` sets `degraded` only when the **read** fails (`:164-170`). `grep -rn transportError app lib components` returns exactly one hit — the getter's own definition.
**Expected / Actual:** Expected a write that did not reach the durable store to be retried or reported. Actual: when the Upstash REST call throws — the ordinary case for a quota-exceeded or write-throttled Redis — `/api/ingest` still answers `{"ok":true,"recorded":true}`, the test-hit toast still says "Captured by the proxy", and because reads still succeed, `degraded` stays null and `LiveTelemetry` renders the green "Durable capture active" panel.
**Why it matters:** This fails in the direction that destroys trust: quiet data loss plus a green badge. It is dormant only because no KV pair is set, and it activates automatically on the first deploy where `KV_REST_API_*` or `UPSTASH_REDIS_REST_*` appear — exactly the step being sold on `/app/live` as "durable storage switches on by itself".
**Fix:** Have `addCrawler`/`addReferral` resolve false (or reject) when the durable push throws, and have `/api/ingest` surface that as a non-200 so a drain can retry. Feed `lastError` into the snapshot so `degraded` covers write failures — `LiveTelemetry.tsx:546-548` already renders it, so no new UI. Add a retry or a small outbox for transient REST failures. Delete or wire the unused getter. **(6 hours)**
**Confidence:** medium — code-read only; a real Redis outage could not be observed because KV is unconfigured.

### [P1 · risky] Durable telemetry keys are globally fixed with no tenant prefix — two customers would share one event list

**Where:** `lib/telemetry/kv.ts:36-39` (`KEY_CRAWLERS`, `KEY_REFERRALS`, `KEY_SINCE`, `keySeen`) used by `push()`/`snapshot()`/`claim()` at `:112-171`; `lib/telemetry/types.ts:49-59`.
**Steps:** Read the module: every Redis key is a module-level constant (`answr:telemetry:crawlers`, `…:referrals`, `…:since`, `…:seen:<id>`). Neither `addCrawler`, `addReferral`, `snapshot` nor `claim` takes a workspace, brand or tenant argument, and neither does the `TelemetryStore` interface. `/api/ingest` and `/api/collect` carry no workspace in their payloads (`route.ts:53`).
**Expected / Actual:** Expected customer A's Live telemetry to show customer A's crawler traffic. Actual: there is no dimension in the data model that could separate them — both LPUSH into the same 500-entry list and both `/app/live` screens LRANGE it, so A sees B's crawled paths and B's higher volume evicts A's events from the shared LTRIM window.
**Why it matters:** Cross-tenant disclosure, and the disclosed field (which URLs a competitor's site is being crawled on) is commercially sensitive by itself. Unreachable today because KV is unconfigured and there is one workspace — but it becomes P0 on the day of the second paying customer, and the fix is a schema change, so it should be decided *before* anyone is onboarded. `READINESS.md` §2 acknowledges the same defect.
**Fix:** Namespace every key by workspace (`answr:telemetry:<workspaceId>:crawlers`), thread a workspace id through `TelemetryStore.addCrawler/addReferral/snapshot` and both ingest routes, deriving it from the per-workspace token proposed above rather than from the request body. Scope the retention window per tenant. **(6 hours, alongside the ingest-token work)**
**Confidence:** high.

### [P1 · broken] The referral half of the "one real data path" is dead end-to-end

**Where:** `public/snippet.js:1-11`, `:34-38`; `app/api/collect/route.ts:21-42`; `app/(dash)/app/live/page.tsx:5-9`; `LiveTelemetry.tsx:355-361` (the "AI referrals" KPI).
**Steps:** (1) Nothing loads the snippet: `for p in / /pricing /security /login /%61pp/live /%61pp/overview; do curl -s https://useanswr.com$p | grep -c snippet.js; done` → 0 everywhere; no `<script>` tag in `app/layout.tsx` or the marketing layout. (2) Cross-origin is blocked twice: `OPTIONS /api/collect` with a customer Origin returns 204 with **no** `access-control-allow-*` headers, so preflight fails; `POST` with that Origin returns 403 `{"ok":false,"error":"forbidden"}`. (3) Same-origin it works: a POST with `Origin: https://useanswr.com` records, and `/api/telemetry` then shows `referrals=1`. (4) `curl https://useanswr.com/snippet.js` still instructs customers to install from `https://answr-ruby.vercel.app/snippet.js` with `data-endpoint https://answr-ruby.vercel.app/api/collect` — the superseded preview deployment.
**Expected / Actual:** Expected, per `/app/live` and `INTEGRATIONS.md` §4b, that `public/snippet.js → /api/collect` is one of three live sources feeding the Real-data screen. Actual: no page loads it and no cross-origin installation can succeed, so the "AI referrals — human click-throughs" KPI and the "AI referrals by source" card are pinned at zero forever; no traffic pattern could move them.
**Why it matters:** A zero on `/app/live` is documented as legitimate for the crawler counters (cold instance) — which is why this is easy to miss. The referral zero is a different thing: it is an unwired path, so the honest empty-state copy ("this instance hasn't seen a visit yet") is misleading for that metric specifically. It also means the advertised one-line install cannot work for a prospect, and the public snippet points at an internal preview URL.
**Fix:** Decide which it is. Self-capture: add `<script defer src="/snippet.js">` to the marketing layout (same-origin, current guard passes). Customer-site capture: give `/api/collect` an explicit CORS contract (OPTIONS returning `Access-Control-Allow-Origin` for registered origins plus `Allow-Headers: content-type, x-answr-ingest`) and authenticate with the per-workspace token instead of Origin. Either way rewrite the install comment to `useanswr.com`. If neither happens before client demos, remove the AI-referrals KPI rather than showing a metric that cannot change. **(6 hours)**
**Confidence:** high.

### [P2 · broken] No type validation on request bodies — five one-line payloads return HTTP 500

**Where:** `app/api/ingest/route.ts:53-60`; `app/api/collect/route.ts:43-50`; `lib/bots.ts:53-57` (`identifyBot` calls `userAgent.toLowerCase()`) and `:76-86` (`identifyReferral`).
**Steps:** Live, one curl each: `POST /api/ingest -d 'null'` → 500; `-d '{"ua":12345}'` → 500; `-d '{"ua":{"x":1}}'` → 500; `POST /api/collect -d 'null'` → 500; `-d '{"referrer":{"a":1}}'` → 500. Contrast: `-d 'xx'` → 400 `{"error":"invalid json"}`; `-d '[]'` → 200 `{"ok":true,"recorded":false}`.
**Expected / Actual:** Expected a malformed payload on an untrusted public endpoint to return 400 with a message. Actual: `JSON.parse` failure is caught but a parsed body of the wrong shape is not, producing an unhandled TypeError and a bare 500 with no body.
**Why it matters:** These are the two endpoints intended for third-party CDN log drains and customer-site snippets, i.e. exactly where badly-shaped input arrives *normally*. Each 500 is an uncaught serverless exception. There is no data to corrupt and Vercel rejects oversized bodies at the edge (a 6 MB body correctly returned 413), so severity is low — but it is the first thing a partner integrating a drain will hit.
**Fix:** Validate the parsed body in both routes: require an object, coerce or reject non-string `ua`/`referrer`/`utm`/`path`, return 400 on failure. Independently harden `lib/bots.ts` with `typeof x !== 'string'` guards — they are pure helpers and should not be able to throw. ~10 lines, no library needed. **(2 hours)**
**Confidence:** high.

### [P2 · missing] The whole `/api/telemetry` tree is unauthenticated and unthrottled, and `test-hit` is a free server-side request amplifier

**Where:** `app/api/telemetry/route.ts:9-11` (GET) and `app/api/telemetry/test-hit/route.ts:26-30,63-72`; not covered by `lib/gate.ts:37-38`, which gates only `/app`. No rate limiting exists anywhere (`grep -rn -i 'ratelimit|rate-limit|throttle' app lib proxy.ts components` → no matches).
**Steps:** `curl https://useanswr.com/api/telemetry` → 200 with the full summary (`crawlerEvents`, `byBot`, `byPath`, `bySource`, `recent[]` with event ids, and the store label naming the env var that selected it). `curl -X POST …/api/telemetry/test-hit` → 200, no credential. Amplification measured: 15 concurrent unauthenticated POSTs, all 200, wall 2,278 ms; each makes the function fetch `https://useanswr.com/pricing` (which itself passes through `proxy.ts` and fires a further POST to `/api/ingest`) and then sit in `await sleep()` for up to 1,190 ms. One attacker request ⇒ ~3 server requests plus >1s of held function time.
**Expected / Actual:** Expected an endpoint that performs server-side network I/O and deliberate multi-hundred-millisecond waits to be authenticated or rate limited. Actual: neither, and it is documented on-screen as the way to prove the pipeline works.
**Why it matters:** Two consequences. Cost/availability: on per-GB-second billing, a trivial loop turns into spend, and the amplification means the deployment attacks itself. Information: the read endpoint hands an anonymous caller the store kind, a label naming the exact env var, and the captured crawl paths — free reconnaissance that also tells an attacker whether their forged writes landed.
**Fix:** Put both routes behind the same check that guards `/app` — the read endpoint only serves the dashboard and the test-hit button is only clickable from inside it, so requiring the gate cookie costs nothing. Add per-IP rate limiting to test-hit (1 per 10s, matching the page's own poll cadence) and cap the backoff loop. If the read endpoint must stay public, strip `store.label`. **(4 hours, same change as the ingest work)**
**Confidence:** high.

### [P2 · risky] No rate limiting on `/api/session`, and the session cookie is an unsigned, reversible encoding of the passphrase

**Where:** `lib/gate.ts:26-27` (`gateToken`), `:30-32` (`isUnlocked`); `app/api/session/route.ts:10-34`.
**Steps:** 25 sequential POSTs with wrong passwords completed in 6 seconds, all answered 401 — no throttle, no lockout, no backoff, no CAPTCHA. `gateToken()` returns `Buffer.from('answr:'+demoPassword()).toString('base64url')`; the live `set-cookie` value base64-decodes to the literal `answr:answr-demo`. Minting offline: `python3 -c "import base64;print(base64.urlsafe_b64encode(b'answr:answr-demo').decode().rstrip('='))"` → `YW5zd3I6YW5zd3ItZGVtbw`, and that cookie alone returns 200 on `/app/overview`.
**Expected / Actual:** Expected a session credential that is random or signed, so holding it does not reveal the passphrase and it cannot be constructed offline; and a shared-secret endpoint that resists guessing. Actual: reversible plaintext, offline-mintable, unlimited guesses at full speed.
**Why it matters:** Harmless today by design — the passphrase is on the login card. It stops being harmless the moment `DEMO_PASSWORD` is rotated to a per-client value, which `lib/gate.ts` explicitly anticipates: from then on the cookie is a plaintext credential in every proxy log, error report and browser profile that touched it. Reported separately from the gate bypass because that one is the gate not being consulted; this is the credential being weak once it is. Cookie flags themselves are correct (HttpOnly, Secure, SameSite=Lax, 30-day Max-Age) and logout genuinely clears it.
**Fix:** Make the cookie an HMAC over a random session id keyed by a server-side secret, or a random opaque token stored in the KV the telemetry store already reaches. Add per-IP rate limiting with backoff on `POST /api/session`. Both are prerequisites for real auth, not throwaway work. **(6 hours)**
**Confidence:** high.

### [P2 · inconsistent] The ingest write guard checks two different secret header names, and the second is unreachable dead code

**Where:** `app/api/ingest/route.ts:20` (`x-answr-secret`) vs `:46` (`x-answr-ingest`), with the early return at `:37-39`; `app/api/collect/route.ts:23` has only the first and no second block.
**Steps:** Trace with `ANSWR_INGEST_SECRET` set. Caller sends `x-answr-secret: S`, no Origin → line 20 returns true → accepted. Caller sends `x-answr-ingest: S` (the name line 46 checks), no Origin → line 20 fails, lines 22-30 find no Origin/Referer, line 33 returns false because the secret is set → 403 at line 37; line 46 is never reached. Cross-origin callers are refused either way. `INTEGRATIONS.md:277` documents only the env var, never the header name.
**Expected / Actual:** Expected one documented header authenticating an external drain against `ANSWR_INGEST_SECRET`. Actual: two names for one secret, the second unreachable, and no configuration in which the documented external senders succeed.
**Why it matters:** The opposite failure from the bypass finding — the *intended* integration path does not work, and the code implies two conventions. Whoever configures the first CDN log drain will follow the docs, get a 403 or 401 depending on which header they guessed, and have no way to tell which. The dead block also reads like a working second line of defence.
**Fix:** Pick one header name, delete the other block, document it next to the env var, and mirror the choice into `/api/collect`. Do it as part of the bearer-token rewrite, which removes both blocks anyway. **(30 minutes)**
**Confidence:** high.

### [P2 · missing] No security response headers beyond HSTS — no CSP, no frame protection, no Referrer-Policy

**Where:** `next.config.ts` (5 lines, no `headers()`); `proxy.ts` sets no response headers.
**Steps:** `curl -I https://useanswr.com/ | grep -iE 'content-security|x-frame|x-content-type|referrer-policy|permissions-policy|strict-transport'` → the only match is `strict-transport-security: max-age=63072000`, added by Vercel. Same check on the dashboard returns nothing, so it is embeddable in a third-party iframe.
**Expected / Actual:** Expected at minimum CSP (or `frame-ancestors`), `X-Content-Type-Options: nosniff`, `Referrer-Policy` and a `Permissions-Policy`. Actual: none on any route.
**Why it matters:** Low practical exploitability today — there is no XSS sink (the codebase's single `dangerouslySetInnerHTML` at `SmallScreenGate.tsx:62` injects a build-time constant) and no state-changing authenticated actions to clickjack. It is listed because it is the first automated check any enterprise security questionnaire runs, and because `/security` advertises an annual third-party pen test: a scan returning "no CSP, no X-Frame-Options" against that claim is a bad look in front of the exact audience this is shown to. It also becomes the mitigating control for the open redirect and the gate once real sessions exist.
**Fix:** Add a `headers()` block in `next.config.ts` for all routes: CSP with `frame-ancestors 'none'` and `object-src 'none'` (a full `script-src` needs a nonce because the app uses inline styles heavily — start here, tighten later), `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` disabling camera/microphone/geolocation. ~15 lines, no application changes. **(2 hours)**
**Confidence:** high.

### [P3 · broken] Copilot referrals via Bing Chat can never be classified — the host pattern contains a path segment

**Where:** `lib/bots.ts:72` (`hosts: ["copilot.microsoft.com", "bing.com/chat"]`) matched at `:84`.
**Steps:** `identifyReferral` parses with `new URL(referrer).hostname`, which never contains `/`. For `https://www.bing.com/chat` the hostname is `www.bing.com`, so all three tests at line 84 fail. The pattern is only reachable through the `catch` branch at line 82, where an unparseable referrer is substring-matched raw — which also means any unparseable value containing "claude.ai" or "perplexity" anywhere is attributed to that assistant.
**Expected / Actual:** Expected a Bing Chat referral attributed to Copilot. Actual: it falls through to null and is not counted, while malformed referrers can be attributed on a loose substring match.
**Why it matters:** Smallest item in the set and currently unobservable (nothing feeds `/api/collect` at all). Listed because it is a two-character fix that should ride along with the referral-path work rather than be discovered later against real customer traffic, when an undercount in a named assistant's column is the kind of thing a client questions.
**Fix:** Parse once and test `host === 'www.bing.com' && path.startsWith('/chat')`, or drop the entry and rely on `copilot.microsoft.com` plus the utm token. Tighten the unparseable-referrer fallback to an exact or suffix match. **(15 minutes)**
**Confidence:** high.
---

### 3.2 Legal exposure, compliance claims, and unsubstantiated marketing

Every item in this section is on the **public, unauthenticated** marketing site. The audit brief scopes fixture data inside the gated dashboard as intentional; none of these are that.

### [P0 · missing] No Privacy Policy, Terms or DPA exist, yet signup binds users to them and every page claims GDPR/CCPA compliance

**Where:** `components/marketing/Footer.tsx:43-46`; `app/(auth)/signup/SignupForm.tsx:116`; routes `/privacy`, `/terms`, `/dpa`, `/trust`, `/trust-center`.
**Steps:** `curl -o /dev/null -w '%{http_code}'` on `/privacy`, `/terms`, `/dpa`, `/trust`, `/trust-center`, `/status` → 404 on all six. In the footer Legal column, "Privacy" and "Terms" render as `<span>` with no href (confirmed in the RSC payload and in `Footer.tsx COLS`, which supplies no href for those two). "DPA" points at `/security`. On `/signup`, below the Create-account button: "By signing up you agree to the Terms and Privacy Policy" — both words are `<Link href="/security">`. `/demo` collects first name, last name, work email and company website with no privacy link and no consent checkbox.
**Expected / Actual:** Expected a commercial site collecting personal data and displaying GDPR/CCPA badges to publish a privacy notice and terms, with consent language linking to them. Actual: neither document exists; the DPA badge and both signup consent links resolve to `/security`, a marketing page that is not a DPA, not Terms and not a privacy notice.
**Why it matters:** This is the single largest legal exposure on the site. A signup flow asserting agreement to documents that do not exist is unenforceable and misrepresentative, and a GDPR/CCPA badge without a published notice inverts the very requirement it advertises (GDPR Art. 13/14 and CCPA §1798.130 both require notice at collection). `Footer.tsx:6` documents this as intentional ("legal pages are in the handoff's not-built gap list") — a known gap, which makes shipping it to paying clients a deliberate risk rather than an oversight.
**Fix:** Publish `/privacy`, `/terms` and `/dpa` as real routes and point the footer, the signup consent line and the DPA badge at them. Until the copy exists, remove the GDPR/CCPA badges and the signup consent sentence, and put a link to a real notice next to the `/demo` form. **(4 hours to wire; 2–5 days of counsel/copy to draft — start the drafting track today, it is the long pole)**
**Confidence:** high.

### [P0 · risky] SOC 2 Type II, annual pen test, AES-256-at-rest and a 99.9% SLA presented as fact on all 68 routes, with every evidence page 404

**Where:** the footer compliance line on all 68 routes (`components/marketing/Footer.tsx`); `/security`; the homepage Trust block; `/about`; `/enterprise`; `/industries/fintech`. *Reported by both the security and content auditors — merged; the security auditor additionally verified the infrastructure claims against the live deployment.*
**Steps:** Every route's footer reads "✓ SOC 2 Type II · GDPR" (grep matches all 68). `/security` cards, verbatim: "SOC 2 Type II — Report under NDA"; "GDPR & CCPA — DPA + subprocessor list"; "Encryption — TLS 1.3 · AES-256 at rest"; "Pen-tested — Annual third-party test". Homepage Trust block: "SOC 2 Type II — Audited annually. Report available under NDA in the trust center." `/about` timeline 2026: "SOC 2 Type II renewed." `/enterprise`: "99.9% uptime SLA — Contractual SLA with a public status page." `/industries/fintech`: "Compliance-grade answer monitoring … SOC 2 Type II, residency, audit log and a DPA your legal team has seen before." `curl /trust` → 404; `/status` → 404. Reality check on the same deployment: `server: Vercel` on every response (the page names AWS `eu-central-1`/`us-east-1` as the hosting subprocessor); `READINESS.md` §2 states there is no database, ORM, schema or migration — so there is nothing encrypted at rest and nothing to purge.
**Expected / Actual:** Expected a security page describing controls that exist, or no security page. Actual: four specific third-party-verifiable assertions about a build with no database, no auth, no pen test and no attestation, while every artifact offered as evidence 404s. "Audited annually" and "renewed" compound it by asserting a history.
**Why it matters:** SOC 2 Type II is an attestation issued by a licensed CPA firm; asserting one you do not hold, on every page, is what enterprise procurement diligences first and what converts a sales conversation into a legal problem. The `/industries/fintech` framing sells it to regulated buyers as "compliance-grade". This is the one item on the site that creates liability rather than embarrassment.
**Fix:** Remove the footer badge and every SOC 2 / pen-test / AES-256 / 99.9% SLA claim until the corresponding artifact exists. If a certification is genuinely in progress, say "SOC 2 Type II in progress" with a date, and do not reference a trust center or status page until those pages exist. Have counsel review before any of this text is reused in an RFP or MSA. **(3 hours)**
**Confidence:** high.

### [P0 · risky] Fabricated case studies assert two real publicly traded companies as customers, with invented results, their logos, and no disclaimer

**Where:** `/customers`, `/customers/mty-food-group`, `/customers/bell-media`, and the homepage logo wall (`app/(marketing)/page.tsx:244-252`); `public/logos/mty-food-group.svg`, `public/logos/bell.svg`.
**Steps:** The homepage logo wall eyebrow reads "Built for leading Canadian brands — enterprise and publicly traded" directly above the official MTY Food Group and Bell logo files. `/customers/mty-food-group`: badge "On the Scale plan"; "+16pt banner answer coverage in 90 days"; "9.2% → 25.4%"; "38 banners"; "#2 on 'quick-service sushi near me'"; a chart labelled "MEASURED · 90 DAYS"; a "How we measured it" section stating "Answr ran 310 quick-service and category prompts daily against ChatGPT, Perplexity, Google AI Overviews, Claude and Gemini"; real sub-brands named (Thai Express, Sushi Shop, Cultures). `/customers/bell-media`: "On the Enterprise plan"; "+21pt"; "12.8% → 33.6%"; "1,400 titles"; "−63% answers naming a US-only service"; names Crave, CTV, TSN; asserts "Bell held the Canadian rights". Disclaimer check across all 68 rendered pages — `grep -rhoiE 'illustrative|sample data|not a real|hypothetical|for demonstration|fictional|no affiliation|trademark|property of their'` → **zero matches**.
**Expected / Actual:** Expected either real customers with permission and substantiated numbers, or a visible "illustrative scenario" disclaimer. Actual: presented as completed engagements — named plan tier, a MEASURED badge, a methodology section — about MTY Food Group Inc. (TSX: MTY) and Bell Media / BCE Inc. (TSX/NYSE: BCE), with no disclaimer anywhere in shipped output.
**Why it matters:** Naming a real public company as a paying customer, attributing specific performance figures to it, and displaying its trademarked logo under a customer-proof eyebrow is a false-endorsement and trademark exposure regardless of intent, and it is directly falsifiable by anyone at either company. `REBRAND_MAP.md:97` calls these "the disclaimed illustrative MTY Food Group and Bell Media scenarios" and `:118-120` says a "Sample data" marker "is being added centrally by the orchestrator" — the disclaimer was specified and never shipped. This is inconsistent implementation of a known-intentional decision, not an accepted fixture.
**Fix:** Either obtain written permission and substantiate every figure, or replace both companies with clearly fictional brands and remove the two logo files. If the scenarios stay as illustrative, ship the specified marker prominently on `/customers`, both detail pages and the homepage wall, and change the eyebrow from "Built for leading Canadian brands" to something that does not assert a customer relationship. **(4 hours)**
**Confidence:** high.

### [P0 · risky] Fabricated G2 star rating, review count and "Leader" award on the homepage

**Where:** `/` social-proof row under the logo wall; `app/(marketing)/page.tsx:254-262`.
**Steps:** Scroll below the logo wall. Pill 1, verbatim: "★★★★★ 4.8 on G2 · 140+ reviews". Pill 2: "Leader — G2 Winter 2026, AEO category". Source confirms the literal strings `"★★★★★"`, `"4.8"`, `" on G2 · 140+ reviews"` and the Leader badge.
**Expected / Actual:** Expected a G2 badge to reflect an actual G2 listing with actual reviews, and a Leader badge to reflect an actual Grid report placement. Actual: both are hardcoded strings; there is no G2 listing, and "G2 Winter 2026, AEO category" names a specific report edition.
**Why it matters:** Distinct exposure from the case studies. G2 Grid badges are licensed marks with published usage terms, and an invented aggregate rating with a star glyph and a review count is a quantified third-party endorsement claim — the type most likely to draw an advertising-standards or platform complaint, and the first thing a skeptical buyer verifies by searching G2. Fifteen minutes to remove.
**Fix:** Delete both pills. Reinstate only if a real listing exists, and then use G2's own licensed badge asset and live rating rather than hardcoded text. **(15 minutes)**
**Confidence:** high.

### [P1 · risky] `/security` describes a data pipeline, panel economics and subprocessor chain that do not exist

**Where:** `/security`; the same figures repeat on `/about` and `/product/conversations-demand`.
**Steps:** Verbatim from `/security`: "Every number in Answr traces to one of two sources: answers we sample directly from the platforms, or conversations shared by consented, compensated panel participants. Nothing else." / "SOURCE 02 Consented panels — 2.1M conversations a month from opt-in participants who are paid for their data. PII stripped at ingestion, never at query time." / "NEVER — No scraping sessions. No browser extensions harvesting private chats, no purchased session logs, no gray-market data. Ever." / "DELETE — Panel raw text after 13 months; full workspace purge within 30 days of churn." Subprocessor table names AWS (Hosting & storage, eu-central-1 / us-east-1), Cloudflare (Edge network, Agent Analytics ingestion), Postmark (Transactional email), followed by "Full list with DPAs available in the trust center" (`/trust` → 404). Vulnerability contact: `security@answr.io` with "response within 24 hours" — a domain with no A record that is not the domain serving the site. The 2.1M figure repeats on `/about` ("2025 The consented panel network launches") and `/product/conversations-demand`.
**Expected / Actual:** Expected a security-and-methodology page describing the system that exists. Actual: it describes a 2.1M-conversation consented panel network, a paid-participant compensation model, a PII-stripping ingestion pipeline, defined retention windows and a three-vendor subprocessor chain, for a product whose data layer is hardcoded fixtures — and the deployment runs on Vercel, not the AWS it names.
**Why it matters:** This is the page enterprise buyers and privacy officers are sent to — linked from the homepage Trust block, from `/industries/healthcare` as "a methodology your privacy office can read", and standing in for both Terms and the Privacy Policy on `/signup`. Representations about consent, compensation, PII handling and retention are exactly what a DPA and a regulator hold you to, and the subprocessor table is a factual claim about commercial relationships with three named companies.
**Fix:** Rewrite `/security` to describe only what the deployment actually does, or take it down until the pipeline exists. Correct the subprocessor list to the real stack (Vercel) or remove the table. Stop linking it from the signup consent line. Repoint `security@answr.io` to a monitored mailbox on the live domain before advertising a 24-hour response. **(4 hours)**
**Confidence:** high.

### [P1 · risky] Public marketing pages publish invented brand-performance data for five real competing companies, including a negative sentiment claim about Nike

**Where:** `/` (hero mockup + Share-of-voice table), `/product/answer-engine-insights`, `/product/conversations-demand`, `/product/actions-workflows`, `/solutions/in-house`, `/solutions/agencies`, `/industries/b2b-saas`.
**Steps:** `/` (no login required): hero mockup chromed "app.answr.io — Nike" showing "Visibility score 34.2% ↑2.8", "Share of voice 28.6% ↑1.1", "Citations · 30d 1,284 ↑212", and a ranked table — 1 Nike 28.6%, 2 Adidas 24.1%, 3 Puma 18.9%, 4 Under Armour 15.2%. `/product/answer-engine-insights`, verbatim: "'are Nike shoes overpriced' turned negative — a stale cached pricing page is the cited source." `/solutions/in-house` repeats it and adds "#91 · comparison page vs Adidas". `/solutions/agencies` shows a client-workspace list headed "QUOTA POOLED · 770/950 PROMPTS" with "N Nike Vis. 34.2% ↑2.8 412 prompts" and a report card "GR Graymatter Agency — Nike monthly". Sample-data marker across all 68 pages: zero matches.
**Expected / Actual:** Expected fixture data confined to the gated demo dashboard, or carrying the "Sample data" marker `REBRAND_MAP.md:118-120` specifies. Actual: invented competitive rankings for five real, directly competing companies published on unauthenticated, indexable marketing pages with no marker, plus two pages asserting that consumer sentiment about a named brand "turned negative".
**Why it matters:** The brief establishes fixtures in the gated dashboard as intentional; this is the inconsistent case, where the same fixtures sit on the public site and read as published market research. The sentiment lines go further than ranking — "'are Nike shoes overpriced' turned negative" is a disparaging factual assertion about a named brand's public perception, sourced to nothing, on a page anyone can find. `/solutions/agencies` additionally implies a named agency runs Nike as a client.
**Fix:** Ship the specified "Sample data" marker on every public page carrying demo metrics, or switch the marketing mockups to fictional brands (the dashboard can keep Nike behind the gate). Remove the two "are Nike shoes overpriced" sentiment lines outright — a negative claim about a named real brand should not appear even with a marker. **(4 hours)**
**Confidence:** high.

### [P1 · risky] Fabricated research statistics published as sourced findings, with named methodologies

**Where:** `/resources/answr-index`, `/industries/b2b-saas`, `/industries/healthcare`, `/industries/ecommerce`, `/industries/travel`, `/customers`, `/blog`, `/blog/what-50k-prompts-taught-us`, `/about`.
**Steps:** `/resources/answr-index`, verbatim: "The 500 domains AI cites most — Ranked monthly from 1.2M citations across five platforms. Public and free — the category's benchmark for source authority." "UPDATED AUG 1, 2026". The table attributes monthly citation volumes to real domains: wikipedia.org 84.2K ↑2.1K, reddit.com 61.8K ↑4.4K, youtube.com 47.3K ↓1.2K, github.com 33.9K, g2.com 29.4K, nih.gov 27.1K, stackoverflow.com 24.8K, booking.com 21.5K. Footer: "Methodology: direct sampling, deduplicated per answer". `/industries/b2b-saas`: "68% of B2B evals start with AI" sourced "Buyer-panel benchmark, 2026 · consented panels"; "3.2× comparison pages out-cite feature pages" sourced "Measured across 50K sampled prompts". `/industries/healthcare`: "52% research symptoms with AI first"; "1 in 5 condition answers cite outdated guidance". `/industries/travel`: "76% of AI trip plans name specific properties"; "64% of citations go to OTAs, not brands". `/customers`: "2,400+ teams"; "+9.4pt median lift"; "41 days to first win". `/blog/what-50k-prompts-taught-us`: a full research article bylined "Rui Kimura, Head of Research" with a chart labelled "50K PROMPTS · JUL 2026".
**Expected / Actual:** Expected a published benchmark with a stated methodology and a monthly update date to rest on real sampling. Actual: no sampling pipeline exists, so every figure and every methodology line is invented — including per-domain citation volumes attributed to eight real websites and a named research author.
**Why it matters:** These are the claims most likely to be cited back at the company. The Answr Index is positioned as "the category's public benchmark", free and dated, which invites journalists and competitors to reference and check it. Each industry statistic carries a fabricated methodology caption that manufactures credibility the data does not have.
**Fix:** Remove or clearly label every statistic with no underlying measurement, and strip the methodology captions that imply one. If the Answr Index is a planned product, replace the populated table with a waitlist rather than fabricated rankings for real domains. **(4 hours)**
**Confidence:** high.

### [P1 · risky] Eight fabricated customer testimonials presented as real quotes with role and sector attributions

**Where:** `/enterprise`, `/industries/b2b-saas`, `/industries/ecommerce`, `/industries/fintech`, `/industries/healthcare`, `/industries/travel`, `/product/actions-workflows`, `/solutions/in-house`.
**Steps:** Read each quote and its attribution. Examples verbatim: "Procurement cleared Answr in nine days. The audit log and residency answers were already written." — Director of MarTech, Fortune 500 retailer. / "The stale-APR alert paid for the year. We corrected the source page before the first support ticket landed." — Head of Digital, North American payments provider. / "We found AI steering patients to a service line we closed in 2024. Two page fixes later, bookings route correctly." — VP Patient Experience, regional hospital network. Three of the eight carry no attribution at all; `/product/actions-workflows` appends "more stories", implying a library.
**Expected / Actual:** Expected a quotation in quotation marks with a job-title attribution to be something a real person said. Actual: all eight are invented.
**Why it matters:** Anonymising by role and sector removes the named-company exposure but not the core misrepresentation — these are presented as verbatim customer statements, and "Fortune 500 retailer" still reads as a specific real customer. Testimonial substantiation is among the most commonly enforced advertising rules.
**Fix:** Remove all eight, or replace with quotes obtained in writing. If retained as illustrative, label the block explicitly — an unlabelled quotation mark is itself the claim. **(2 hours)**
**Confidence:** high.

### [P1 · risky] Eleven named third-party integrations asserted as shipped, dated in the changelog, and sold behind paid plans

**Where:** `/integrations`, `/enterprise`, `/solutions/in-house`, `/changelog`, `/pricing`.
**Steps:** `/integrations` lists, each with a capability claim: Looker Studio ("Native connector: blend visibility with GA4 and Search Console"), GA4, Slack, Salesforce, HubSpot, Notion, Zapier ("6,000+ apps"), Webhooks. The same page shows a REST sample `GET /v1/visibility?brand=nike&window=30d → {"score": 34.2, …}` and an "MCP server NEW". `/enterprise`: "SSO / SAML + SCIM — Okta, Entra, Google" and "Audit log — streamable to your SIEM". `/changelog` dates them shipped: "Apr 8, 2026 Looker Studio connector NEW"; "May 27, 2026 MCP server NEW — Available on Scale and above". The MCP endpoint shown inside the product, `https://mcp.answr.io/v1/nike`, does not resolve (no A record).
**Expected / Actual:** Expected an integrations page to list integrations that exist, or mark them as planned. Actual: eleven named third-party products presented as shipped with per-vendor capability descriptions, for a product with no backend.
**Why it matters:** The exposure here is third-party product attribution *plus* a purchasable-capability claim — `/pricing` gates "Workflows, API & MCP access" behind the $1,290/mo Scale plan and "SSO / SAML, SCIM & audit log" behind Enterprise, so a buyer can pay for these specifically. The changelog dating them as already shipped removes the roadmap defence.
**Fix:** Mark every unbuilt integration as "Planned" or remove it, remove the corresponding changelog entries, and remove API/MCP/SSO from the paid plan feature lists on `/pricing` until they exist. **(3 hours)**
**Confidence:** high.

### [P2 · inconsistent] Every contact address and product URL in shipped copy uses `answr.io`, which does not resolve; the site runs on `useanswr.com`, which appears nowhere in its own copy

**Where:** `app/not-found.tsx:34`; `app/(marketing)/security/page.tsx` (×2); `app/(marketing)/about/page.tsx:58,65,72`; `app/(marketing)/page.tsx:37`; `app/(dash)/app/settings/api-keys/page.tsx:144`; `app/(dash)/app/settings/workspace/page.tsx:66`; `components/app/SmallScreenGate.tsx:161`.
**Steps:** Grep the shipped HTML: 272 occurrences of `support@answr.io`, 136 of the mailto subject "Broken link on answr.io", 6 of `security@answr.io`, 6 of `careers@answr.io`, 2 of `mcp.answr.io/v`, 2 of `app.answr.io`. Occurrences of `useanswr.com` in shipped HTML: **zero**. DNS: `dig answr.io A` → empty (MX records exist, pointing at Google Workspace; NS is Cloudflare); `dig app.answr.io A` → empty; `dig mcp.answr.io A` → empty; `dig useanswr.com A` → 76.76.21.21.
**Expected / Actual:** Expected one brand domain for the site, product URLs and contact addresses. Actual: the site is served from a domain that appears nowhere in its own copy, while every address and product URL points at a host with no A record — so `app.answr.io` and `mcp.answr.io` do not resolve and the API endpoint shown to users inside the product is unreachable.
**Why it matters:** A prospect who reads `/security` and mails `security@answr.io`, or `/about` and mails `careers@answr.io`, is writing to a domain that does not serve the site they were just on, and the "app.answr.io" chrome on the homepage tells them the product lives somewhere they cannot reach. Visible on the 404 page, the security page, the about page and inside the product.
**Fix:** Decide the canonical brand domain. If `useanswr.com`: replace all `answr.io` strings and either drop the `mcp.`/`app.` examples or point them at real hosts. If `answr.io`: add DNS records, serve the site there, redirect `useanswr.com`. **(4 hours)**
**Confidence:** medium — mail delivery for `@answr.io` may well work (MX is configured); domain ownership could not be verified from outside. The site-facing hosts definitively do not resolve.

### [P2 · missing] `/blog` lists 7 articles, 1 exists, and it contradicts its own index card

**Where:** `/blog`, `/blog/what-50k-prompts-taught-us`.
**Steps:** `/blog` lists seven entries, six with a "Read →" affordance ("llms.txt, explained" Jul 22 · 9 min; "Conversation Explorer now covers multi-turn threads" Jul 15 · 4 min; "How AI Overviews picks its sources, measured across 8,000 queries" Jul 8 · 11 min; and three more), plus a "Load 12 more" control implying 19 total. Extract every href from the rendered HTML: the only article link is `/blog/what-50k-prompts-taught-us` — the six "Read →" entries are not links. Featured card vs the actual post: "Jul 29, 2026 · 14 min", headline "We ran 50,000 prompts through five AI platforms…", byline "Rui Kimura, Research" vs the post's "Jul 28, 2026 · 9 min read", headline "Do comparison pages still win AI answers?", byline "Rui Kimura, Head of Research". The `<title>` tag is a third variant.
**Expected / Actual:** Expected listed articles to be reachable and the index card to match the post. Actual: 6 of 7 go nowhere, and the one working post disagrees with its own card on date, read time, headline and author title.
**Why it matters:** The blog is a credibility surface a client evaluating an AEO vendor will click through. Six dead entries plus "Load 12 more" advertises a library that does not exist, and the featured-card mismatch means the one real post looks like a different article until you open it. The dead entries are unfinished; the card mismatch is a genuine data inconsistency — both stem from the index being hand-written rather than driven off the post data.
**Fix:** Drive the `/blog` index from the post data so title, date and read time cannot diverge. Remove the six entries with no page and the "Load 12 more" control, or write the posts. **(4 hours)**
**Confidence:** high.

### [P3 · inconsistent] `/changelog` says "Ships every Tuesday"; no entry falls on a Tuesday

**Where:** `/changelog` header line and all 8 entries.
**Steps:** Header: "Ships every Tuesday · Subscribe via the digest". Weekday of each entry: Aug 2 2026 = Sunday; Jul 15, Jun 24, Jun 10, May 27, May 6, Apr 22, Apr 8 = all Wednesdays.
**Expected / Actual:** Expected entries on the stated cadence. Actual: 7 of 8 Wednesdays, the most recent a Sunday, zero Tuesdays.
**Why it matters:** Nobody will check this, but it is free to fix and it is the kind of internal contradiction that undermines a page whose entire purpose is demonstrating shipping discipline.
**Fix:** Change the header to "Ships every Wednesday" and move the Aug 2 entry to Wednesday Aug 5, or drop the cadence claim. **(5 minutes)**
**Confidence:** high.

### [P3 · inconsistent] Mixed apostrophe and quote glyphs, plus one British spelling

**Where:** `/customers` and both case studies (curly) vs the rest of the marketing site (straight).
**Steps:** Across the 10,024-word marketing corpus, straight apostrophes dominate (you're ×7, don't ×5, isn't ×3, can't ×3, plus ~20 more) while curly appear alongside them (we’re ×3, you’re, what’s, season’s, didn’t) — so "you're/you’re" and "didn't/didn’t" each appear both ways on the same site. Double quotes split by page: straight on `/product/*` and `/industries/*`, curly on `/customers` and both case studies. Spelling: "prioritised" on `/customers` vs "prioritized" on the homepage.
**Expected / Actual:** Expected one apostrophe style, one quote style, one spelling standard. Actual: both glyph styles, sometimes on the same word, with the two case-study pages diverging from every other page.
**Why it matters:** Typography-level polish a careful reader registers as inconsistency without being able to name it. A dictionary pass over the same corpus surfaced no actual misspellings, so this is the only copy-quality defect on the site.
**Fix:** Normalise to one convention throughout and change "prioritised" to "prioritized" to match the site's otherwise-American spelling. Single find-and-replace pass. **(30 minutes)**
**Confidence:** high.
---

### 3.3 Data correctness and internal consistency

### [P0 · inconsistent] Answer Engine Insights relabels the window and redraws the chart axis to 7 days while every metric stays at its 30-day value

**Where:** `/app/insights` and all four sibling tabs (`/sentiment`, `/regions`, `/audiences`, `/shopping`); filter plumbing in `lib/filters/context.tsx`, `lib/filters/windows.ts`.
**Steps:** Log in, go to `/app/insights/sentiment`. Note "Positive sentiment 74%", "Answers analyzed 186", x-axis "Jul 7 / Jul 14 / Jul 21 / Jul 28 / Aug 5". Click the topbar pill and choose "Last 7 days · vs prev". Repeat on `/app/insights` and `/app/insights/regions`.
**Expected / Actual:** Expected either the numbers to re-slice (as they do on Overview, Citations and Agent Analytics) or the pill to stay visibly inert. Actual: the pill relabels **and** the x-axis redraws to "Jul 30 / Jul 31 / Aug 1 / Aug 2 / Aug 3 / Aug 4", while every KPI and table value is byte-identical — sentiment 74% / 186 answers / 34 answers unchanged; topics 312 answers / 64 prompts / 58 prompts unchanged; regions 45/35/25/15% unchanged. A multiset diff of all rendered numbers before and after shows the only changes are the axis labels themselves plus one delta caption (↑3pt → ↑1pt).
**Why it matters:** This is affirmative misrepresentation, not omission: the screen draws a 7-day axis and plots 30-day data against it, so a client reads "74% positive over the last 7 days" for a 30-day figure. The app contradicts itself twice — the CSV export writes "Workspace filter at export time: Last 7 days · vs prev. It is NOT applied to this file", and the inert-pill toast on `/app/reports` states "The date range re-slices Overview, Insights, Citations and Agent Analytics". Overview, Citations and Agent Analytics genuinely do re-slice (verified: citations 1,284→324, crawler events 48,231→12,399), so Insights is the only liar. The axis relabeling is the part that turns an omission into a misstatement.
**Fix:** Either wire the AEI data files to the active window the way overview/evidence/infra already are, or make the AEI pill non-selectable using the inert "?" variant already used on `/app/reports`, with the honest note. Whichever is chosen, the chart x-axis must not relabel independently of the series. Also correct the `/app/reports` toast, which currently names Insights as re-slicing. **(4 hours for the inert route; ~3 days for a real re-slice across 5 tabs)**
**Confidence:** high.

### [P1 · inconsistent] Nike's visibility trend is a different series on Overview and on Insights — +2.8pt vs +10.7pt, same metric, same window

**Where:** `/app/overview` and `/app/insights`; `lib/data/overview.ts:285-317` (`visibilityTrend`) vs `lib/data/insights.ts:33-58` (`visibilityByBrandSeries`).
**Steps:** `/app/overview` at the default 30 days: KPI "Visibility score 34.2% ↑2.8"; the Visibility % chart starts Jul 7 at 31.4 and ends Aug 5 at 34.2. `/app/insights`: the card "Visibility — all tracked prompts · % of AI answers where each brand is mentioned" starts Jul 7 at **23.5** and ends Aug 5 at 34.2. Export both. Overview CSV row 48: `Aug 5,34.2,28.9,22.8`; Insights CSV row 48: `Aug 5,34.2,24.9,18.8,13.1`. Both sections are titled "Visibility — daily trend" with the identical note.
**Expected / Actual:** Expected one visibility series per brand per window. Actual: Nike Jul 7 = 31.4% (Overview) vs 23.5% (Insights); Adidas Aug 5 = 28.9% vs 24.9%; Puma 22.8% vs 18.8%. The two exported executive summaries state headline growth as "+2.8pt" and "+10.7pt over the window (23.5% → 34.2%)".
**Why it matters:** This is the product's headline number, restated by the two screens a client opens first, off by 3.8×, and both versions leave the building in downloadable CSVs — so two stakeholders reading two reports for the same month quote different growth. The Insights CSV compounds it by labelling Visibility with the share-of-voice gloss ("Your slice of brand mentions versus rivals"), a second definition mismatch inside the same row.
**Fix:** Make `visibilityByBrandSeries` import the Overview series rather than carry its own endpoints, or rename the Insights card to what its data actually is (the file's own header comment calls it "Share of voice — all tracked prompts") and re-derive Nike's line so its start matches the metric it claims. One series per (brand, metric, window), read by both screens. **(4 hours)**
**Confidence:** high.

### [P1 · broken] Avg. answer position is scored backwards — an improvement is painted red and the exported report calls it "worse"

**Where:** `/app/overview` KPI 4 (`OverviewKpis.tsx:106-114` via `lib/filters/windows.ts:377` `deltaTone`) and `app/(dash)/app/overview/report.ts:44-45`.
**Steps:** `/app/overview`: the fourth KPI reads "Avg. answer position 2.4 ↓ 0.2", rendered with `color:var(--bad)` and the bad-tone sparkline (confirmed in the served HTML). The series at `lib/data/overview.ts:143` runs 2.6 → 2.4. Export and open `nike-overview-30d.csv`: `Avg. answer position,2.4,"-0.2 (worse — lower is better)","How early AI names you in answers. Slipping while visibility rises: Nike appears in more answers but later inside them."`
**Expected / Actual:** `METRICS.md` / `lib/metrics.ts:82` define the metric as "Lower is better", and the value moved 2.6 → 2.4, i.e. Nike is named *earlier*. Expected green. Actual: a red delta on the card and a CSV cell that says "-0.2 (worse — lower is better)" — self-contradictory in five words — plus a narrative claiming Nike appears "later inside" answers, the reverse of the data. The same red "↓ 0.2" is repeated on `/product/answer-engine-insights`.
**Why it matters:** The one KPI on the Overview whose polarity is inverted, so the executive summary a client forwards to their VP says their answer position got worse when it improved. The code comment at `OverviewKpis.tsx:104` shows this was a deliberate choice to preserve the design frame's colour, which means it will not self-correct.
**Fix:** Give `KpiCard` a `lowerIsBetter` flag, pass it for `avg_answer_position`, and rewrite the CSV delta and note to "-0.2 (better — lower is better)" with a matching read. **(30 minutes)**
**Confidence:** high.

### [P1 · inconsistent] Sidebar count badges contradict the pages they link to — Actions says 12, four other surfaces say 24 open

**Where:** `components/app/Sidebar.tsx:39-50` (five hardcoded string literals) vs `/app/actions`, `/app/actions/92`, `/app/overview`, `/app/conversations`, `/app/reports`. *Reported by both the data-integrity and UX auditors — merged.*
**Steps:** Sidebar "Actions 12" → `/app/actions` KPI strip reads "Open 24 · In progress 6 · Shipped·90d 38"; `/app/overview` says "Review actions · 24 open"; `/app/actions/92` says "1 of 24 open"; the Overview CSV executive summary row reads "Action queue, 24 open". Sidebar "Conversations 38" → `/app/conversations` shows "2,841 conversations · sampled from consented panels", and 38 appears nowhere in `lib/`. Sidebar "Reports 3" → `/app/reports` shows 4 recent plus 2 scheduled. Only Citations (1,284) and Prompts (412) reconcile — and Citations only at the default range: switch to YTD and the page reads 5,964 while the badge still says 1,284.
**Expected / Actual:** Expected the badge to equal the count on its destination. Actual: 12 vs 24 (a hard contradiction restated four ways), 38 vs 2,841 (a 75× gap with no source anywhere), 3 vs 4+2.
**Why it matters:** The chrome contradicts the content on every screen simultaneously, so the discrepancy is visible from anywhere in the product rather than needing a comparison — and Actions-open is the number an AEO buyer actually acts on. Because the badges have no data source they also cannot follow the date filter, which is why Citations self-contradicts at YTD.
**Fix:** Derive all five from the same fixtures the pages read, decide explicitly whether "Actions" means open (24) or open+in-progress (30) and use that everywhere including the Overview chip and the CSV summary row, and either recompute on the active range or suffix with "30d". **(4 hours)**
**Confidence:** high.

### [P1 · inconsistent] Insights "Best platform" contradicts the heatmap directly above it for 3 of 5 topics

**Where:** `/app/insights` — the "Visibility by topic × platform" heatmap vs the Topics table; `lib/data/insights.ts:65-116` and `app/(dash)/app/insights/page.tsx:48`.
**Steps:** Read the heatmap row "Sneaker releases": ChatGPT 38, Perplexity 34, AI Overviews 24, Claude 29, Gemini 18. The Topics table for the same topic says Best platform = **Perplexity**. Sustainability: heatmap ChatGPT 26 > Perplexity 21 > Claude 19; table says **Claude**. Basketball gear: heatmap ChatGPT 22 … Gemini 8 (the lowest cell in the row); table says **Gemini**. Only Running shoes and Training apparel agree. The same wrong pairs ship in the exported CSV.
**Expected / Actual:** Expected Best platform = the highest cell in that topic's heatmap row — the column's own tooltip says "The AI where you show up most". Actual: three of five name a platform the heatmap shows as weaker, and one names the single worst cell in its row.
**Why it matters:** Two adjacent cards on one screen, one telling you where you are strongest and the other showing you are weakest there — catchable in seconds by a client reading left to right. It also mis-routes the recommendation the screen exists to produce ("Sustainability × AI Overviews" is called the weakest cell on the marketing page while the app names Claude as its best platform).
**Fix:** Derive the cell from `aeiHeatRows` (argmax of `row.cells[].visibility`) instead of hardcoding it in the table markup; same for the CSV row builder in `app/(dash)/app/insights/reports.ts`. **(30 minutes)**
**Confidence:** high.

### [P1 · inconsistent] Page health reports 2× the citations and 2× the crawls that Citations, Agents and the GPTBot page report for the same URL

**Where:** `/app/page-health` ("Platform breakdown") vs `/app/citations`, `/app/agents`, `/app/agents/bots/gptbot`; `app/(dash)/app/page-health/page.tsx:109-146`, `app/(dash)/app/citations/reports.ts:87`.
**Steps:** `/app/citations` → "Most cited pages": `nike.com/running/marathon-training-guide — 84 citations · 31 prompts`. `/app/page-health` for the same URL → ChatGPT 84, Perplexity 51, AI Overviews 38. `/app/agents` → "Most crawled paths": `/running/marathon-training-guide 2,214`, and the exported Agents CSV repeats "2,214 requests". `/app/page-health` same row → ChatGPT crawls 2,214, Perplexity 1,108, AI Overviews 846. `/app/agents/bots/gptbot` → that path shows **486 visits**.
**Expected / Actual:** Citations for that URL: 84 total (Citations page) vs 173 (page-health sum), with the 84 that Citations calls the *total* assigned to ChatGPT alone. Crawls: 2,214 total across all agents vs 4,168 (page-health sum), and page-health credits ChatGPT with 2,214 while the GPTBot detail page says OpenAI's crawlers fetched it 486 times.
**Why it matters:** Three screens in the same flow give three answers about one URL, and the page a client is most likely to drill into is the one that doubles. The "Humans referred" column on the same table *is* correct (512+231+169 = 912 = the Referrals landing-page row), which shows the breakdown was built row-by-row rather than derived — so the two wrong columns are fixable the same way the right one was.
**Fix:** Make the platform breakdown a decomposition of the totals it drills into: citations must sum to 84, crawls to 2,214, and the ChatGPT crawl figure must reconcile with the GPTBot page's 486. **(4 hours)**
**Confidence:** high.

### [P1 · inconsistent] Prompt quota is reported three different ways: 412/1,000, 412/550, and an unstated pooled 772/1,000

**Where:** `/app/assets` (`lib/brands.ts:53-54`, `promptQuota "/550"`) vs `/app/overview`, `/app/prompts` (`lib/data/prompts.ts:287`), `/app/settings/platforms`, `/app/settings/billing`.
**Steps:** `/app/overview` → "Manage prompts · 412/1,000 used". `/app/settings/billing` → "Tracked prompts 412 / 1,000". `/app/settings/platforms` → "SCALE PLAN 412 of 1,000 tracked prompts". `/app/assets` → Nike "Prompts 412 /550"; Nike SNKRS 120 /200; Jordan Brand 240 /250; footer "Plan quota is pooled across assets."
**Expected / Actual:** Expected one quota model. Actual: Nike's quota is 550 on Assets and 1,000 everywhere else; the three per-brand quotas partition 1,000 (550+200+250), which is the opposite of "pooled"; and if it really is pooled, workspace usage is 412+120+240 = **772** of 1,000, not the 412 shown on three screens.
**Why it matters:** Quota is what the customer is buying — Pricing sells "1,000 prompts · 3 brands" on Scale, so a prospect who opens Assets sees their headroom cut almost in half and their real consumption understated by 360 prompts.
**Fix:** Pick one model. Pooled: drop the per-brand denominators or show "412 of 772 used", and make the workspace counter sum all brands. Per-brand: change the Overview/Billing/Platforms counters to name the brand they are scoped to. **(4 hours; do it with the plan-limits finding below — same root cause)**
**Confidence:** high.

### [P1 · inconsistent] Plan limits in the app contradict the pricing page — seats, brands and competitors are all different numbers

**Where:** `/pricing` vs `/app/settings/team`, `/app/settings/billing`, `/app/assets`, `/product/answer-engine-insights`.
**Steps:** `/pricing` → "Every plan: unlimited seats"; comparison table "Seats: Unlimited / Unlimited / Unlimited"; "Competitors tracked: 3 / 3 / 3"; "Multi-brand workspaces: — / 3 brands / Unlimited". `/app/settings/team` → "Members 4 · of 10 seats used on the Scale plan"; `/app/settings/billing` → "Team seats 4 / 10" and "Tracked brands 3 / 5". `/app/assets` → Nike "Competitors 4", Jordan Brand "Competitors 6". `/product/answer-engine-insights` → "Up to 10 competitors per brand".
**Expected / Actual:** Seats: unlimited (pricing) vs a 10-seat cap shown twice in-app. Brands on Scale: 3 vs "3 / 5". Competitors: 3 (pricing, all plans) vs 4 and 6 in-app vs "up to 10" on the product page. Secondary: Billing says "$1,290/mo · billed annually" yet lists monthly invoices of $1,290.00 on Jun 1, Jul 1 and Aug 1.
**Why it matters:** These are the commercial terms. A prospect who signs on "3 competitors" and sees a demo tracking 6 has been shown something they cannot buy, and the 10-seat cap contradicts the headline benefit printed above the pricing cards.
**Fix:** One `PLANS` constant read by `/pricing`, Settings › Billing, Settings › Team and the assets quotas; reconcile the competitor cap with the demo fixtures and the product page. **(4 hours)**
**Confidence:** high.

### [P1 · inconsistent] Live logs claim the stream is filtered to `/help` while 4 of the 6 rows are not `/help` paths

**Where:** `/app/agents/logs`; `app/(dash)/app/agents/logs/page.tsx` (path chip ~line 58, footer note at end of file).
**Steps:** Open the page. The active filter chip reads "path: /help" and the footer reads "Filtered to /help — the 403 pattern is action #87's evidence, live." The six rows: `/help/size-guide` 403, `/help/returns` 403, `/running/shoe-fitting-101` 200, `/pricing` 200, `/w/womens-running-shoes` 200, `/running/marathon-training-guide` 403.
**Expected / Actual:** Expected every row to be a `/help` path with a path filter pinned. Actual: only 2 of 6 are — including the 403 the footer attributes to `/help` evidence, which is actually Bytespider on `/running/marathon-training-guide`.
**Why it matters:** The claim is load-bearing: the footer uses this list as the evidence for action #87 ("unblock /help"), and half the evidence is about other paths. A screen claiming a scope it does not honor is a defect regardless of fixture policy.
**Fix:** Either filter the fixture rows to `/help` paths and re-derive the "3 of 6 blocked" line, or drop the pinned chip and the "Filtered to /help" footer and label the list as an unfiltered recent-requests sample. **(30 minutes)**
**Confidence:** high.

### [P1 · inconsistent] The marketing homepage restates three dashboard figures wrongly, including calling an in-progress action shipped

**Where:** `/` ("How it works" steps 02/03/04, `app/(marketing)/page.tsx`) vs `/app/citations`, `/app/actions`.
**Steps:** Step 02 · TRACE shows the split "31% OWNED / 69% EARNED"; `/app/citations` reads "Owned sources 38% ↑4pt" with a donut of Owned 38 / Editorial 30 / Community 20 / Reference 12 (488/1,284 in the export). Step 03 · ACT shows "#87 · Unblock ClaudeBot on /help — IMPACT 8.4 · EFFORT LOW · 214 URLs affected"; `/app/actions` card #87 reads "Impact +1.9pt · Effort S · Prompts affected 28". Step 04 · PROVE shows "Visibility score 34.2% ↑2.8 — since action #87 shipped · Jul 18"; `/app/actions` shows #87 as IN PROGRESS, and the only shipped card on the board is #64 (Jul 22).
**Expected / Actual:** Owned share 31% vs 38%; #87 impact "8.4" on no stated scale vs "+1.9pt" effort S; #87 shipped Jul 18 with the whole +2.8pt attributed to it vs in progress, unshipped. The runnersworld/nike.com counts (248/201) do match.
**Why it matters:** The homepage is what a prospect sees before login and the dashboard is what they see after; three of the four "How it works" panels quote the app and get it wrong, and the fourth attributes the product's headline result to an action the product says has not shipped. Same class as `/product/answer-engine-insights`, which prints the competitor table's 30-day deltas under a "Δ 7d" header and shows sentiment 58% positive against the app's 74%.
**Fix:** Drive the marketing mock panels from the same `lib/data` fixtures the dashboard reads (they are already importable), or at minimum correct 31%→38%, the #87 impact/effort chips, and the "shipped Jul 18" attribution to a genuinely shipped action. **(4 hours)**
**Confidence:** high.

### [P2 · inconsistent] The two AI-referral platform mixes disagree — AI Overviews is #2 on Overview and absent from Referrals, which lists a Copilot the product tracks nowhere

**Where:** `/app/overview` → Performance over time → Clicks tab (`lib/data/overview.ts:108-123`) vs `/app/agents/referrals` "Referring platform".
**Steps:** Overview Clicks legend: ChatGPT 1,842 · Perplexity 926 · AI Overviews 1,204 · Claude 388 · Gemini 512 (total 4,872) → 37.8 / 19.0 / 24.7 / 8.0 / 10.5%. Referrals: ChatGPT 55% ↑4, Perplexity 24% ↓2, Gemini 10% ↑1, **Copilot 6%**, Claude 5% ↑1 — summing to 100%, against "Human referrals from AI 3,412".
**Expected / Actual:** Expected one platform mix for AI referral traffic in the window. Actual: AI Overviews — the second-largest source on Overview — is missing entirely, and Copilot appears though it is not one of the five platforms in Settings › Platforms, the platform filter, or `METRICS.md`.
**Why it matters:** Both cards answer "which assistant sends me people" and they disagree on the single biggest planning question — is Google AI Overviews worth 1,204 clicks a month or nothing. Note also that the Overview Clicks chart under a 30-day filter plots Jun 30–Aug 3 (5 weekly points), disclosed in its footnote, but that makes its "30-day totals" legend a 35-day total.
**Fix:** Reconcile `clicksTrend`/`clicksLegend` with the Referrals share table: same platform set, same denominator, and state whether clicks and referred humans differ by de-duplication. **(4 hours)**
**Confidence:** high.

### [P2 · inconsistent] "Answers sampled" is 1,312 in one export and 1,306 in another, and both are ~2% of the sampling cadence the product advertises

**Where:** `/app/insights` topbar + `app/(dash)/app/insights/reports.ts:66` vs `app/(dash)/app/citations/reports.ts:95` vs `/app/settings/platforms`.
**Steps:** `/app/insights` → topbar "Export 1,312 answers"; the CSV row reads `Answers sampled,"1,312 answers"`. `/app/citations` → the CSV section "Raw answers — preview" is noted "First rows of the **1,306** answers in scope for this window." `/app/settings/platforms` → four platforms at "412 prompts / day", AI Overviews "388 prompts trigger an overview", "One run per day on the Scale plan", "Last: Aug 5, 02:00 · 412 prompts · 5 platforms ✓".
**Expected / Actual:** Expected one figure for `data_quality_sample` over the window. Actual: 1,312 vs 1,306. Expected from the stated cadence: (412×4 + 388) × 30 = 61,080 answers; reported ~1,310, about 2% of what the schedule implies.
**Why it matters:** "Answers sampled" is the evidence-quality number a skeptical buyer checks first; two exports giving two values undermines it, and either value read against the Platforms screen implies the daily runs are not happening. `METRICS.md` also promises for both `data_quality_sample` and `answers_with_citation_rate` that "the Data-quality screen breaks it out per platform" — `/app/settings/data-quality` contains no such breakdown.
**Fix:** Put the sample size in one constant in `lib/data/`, reference it from both report specs and the topbar label, and set it to a value consistent with Settings › Platforms (or change the Platforms copy to describe the sampling that actually produced ~1,310 answers). **(4 hours)**
**Confidence:** medium.

### [P2 · inconsistent] Blocked requests = 312 while Bytespider is marked BLOCKED with 1,914 requests and 388 pages crawled

**Where:** `/app/agents`; `lib/data/infra.ts:84-85`, `app/(dash)/app/agents/page.tsx:206`, `agents/reports.ts`.
**Steps:** KPI at 30 days: "Blocked requests 312 · 214 on /help". Same screen, Agents table: `Bytespider · ByteDance · 1,914 requests · 388 pages · BLOCKED`. The exported CSV repeats both.
**Expected / Actual:** `METRICS.md` defines blocked as requests answered 403/robots-disallowed and pages_crawled as distinct paths with 2xx, so a fully BLOCKED agent should contribute 1,914 to blocked and 0 to pages crawled. Actual: total blocked is 312 — less than a fifth of Bytespider's traffic alone — and Bytespider is credited with 388 successfully crawled pages. The Live-logs screen shows Bytespider receiving a 403, confirming the intent.
**Why it matters:** The blocked-requests KPI is the evidence for action #87 and for the whole "what are you locking AI out of" pitch; a number smaller than one blocked agent's traffic invites exactly the arithmetic a technical buyer will do. On the same screen, "Pages crawled ↑ 214" and "312 · 214 on /help" reuse 214 for two unrelated quantities, and the `/help` alert text stays "214 blocked /help URLs" even at 7 days where the KPI says 55.
**Fix:** Either recompute `BLOCKED_REQUESTS_30D` to include Bytespider's requests and zero its pages-crawled cell, or change its robots status to something the numbers support (e.g. "IGNORES ROBOTS") and say so in the CSV. Make the `/help` alert read from `BLOCKED_ON_HELP_30D` through the active window. **(4 hours)**
**Confidence:** medium.

### [P2 · inconsistent] Overview "Top cited sources" is not the top 5 — it skips the #4 and #6 domains in the table it links to

**Where:** `/app/overview` "Top cited sources" (`lib/data/overview.ts:211-217`) vs `/app/citations` "Cited domains" (`citations/reports.ts:72-80`).
**Steps:** Overview card: runnersworld.com 248, nike.com/running 201, reddit.com 164, wirecutter.com 97, wikipedia.org 61, with "View all →". Follow it: Citations ranks 248, 201, 164, **help.nike.com 122**, wirecutter.com 97, **letsrun.com 88**, wikipedia.org 61.
**Expected / Actual:** Expected top 5 by citations: 248, 201, 164, 122, 97. Actual: help.nike.com (122, the workspace's second-biggest *owned* source) and letsrun.com (88) are dropped, and wikipedia.org at 61 is promoted into the top five over both.
**Why it matters:** The card's descending bar widths (86/70/57/34/21%) assert a ranking that is wrong one click away. It also hides the owned domain that the Overview digest and action #87 are both about, so the screen's narrative and its data point at different sources. The same five rows ship in the Overview CSV.
**Fix:** Build `topCitedSources` by slicing the Citations domain list rather than maintaining a second literal array, and recompute the bar widths from the counts. **(30 minutes)**
**Confidence:** high.

### [P2 · inconsistent] `adidas.com/compare` is cited 24 times on Watched URLs and 31 times in action #92, both labelled 30d

**Where:** `/app/citations/watched` (`citations/reports.ts:151,173`) vs `/app/actions` and `/app/actions/92`.
**Steps:** Watched URLs row: `adidas.com/compare · 24 citations 30d · ↓ 7 · ChatGPT`. Action #92: "Adidas's own comparison page is cited in 31 answers where Nike is absent", repeated in "Why this matters" and in the References card as "cited in 31 answers · 30d".
**Expected / Actual:** Expected one 30-day count for one URL. Actual: 24 vs 31. Note 24 + 7 = 31 — the action quotes the *previous* window's value as current.
**Why it matters:** Action #92 is the top item in the queue and its business case rests on that 31; the screen monitoring the same URL says it is already down to 24. A client comparing the two concludes the action's evidence is stale, which is exactly what it is. Same class as `/app/workflows` claiming "letsrun.com cited Nike for the first time" 2h ago while Citations shows letsrun.com with 88 citations ↑24 in the window.
**Fix:** Point the action's reference count at the watched-URL fixture (24), or label it explicitly as the pre-window baseline the action was written against. **(30 minutes)**
**Confidence:** high.

### [P2 · inconsistent] The Insights heatmap rolls up to the Topics table for deltas but not for levels — Training apparel is off by 2.5pt

**Where:** `/app/insights`; `lib/data/insights.ts:65-116` (`aeiHeatRows`) vs the Topics table in `insights/page.tsx:48`.
**Steps:** Average each heatmap row's five deltas: Running shoes 6.2, Training apparel 3.8, Sneaker releases 1.4, Sustainability −2.1, Basketball gear −0.7 — **all five match the table's Δ 30d exactly**, so the intended aggregation is the simple mean. Apply the same mean to the visibilities: Running shoes 42.6 (table 42.6 ✓); Training apparel 35.6 (table **38.1** ✗); Sneaker releases 28.6 (table 29.4 ✗); Sustainability 18.6 (table 18.7 ✗); Basketball gear 14.4 (table 14.2 ✗).
**Expected / Actual:** Expected level and change to aggregate the same way. Actual: the deltas were tuned to the mean for all five topics while the levels were not for four of five.
**Why it matters:** The two cards cannot both be right: if the topic's visibility is 38.1% the cells composing it are wrong, and if the cells are right the Δ clients trend against was computed over a different base. This is the arithmetic layer under the "Best platform" contradiction — fixing the levels alone will not fix that column.
**Fix:** Compute the Topics table's Visibility (and its bar width) from `aeiHeatRows` with the same mean already used for the deltas, in both the page and `insights/reports.ts`. **(30 minutes)**
**Confidence:** high.

### [P2 · inconsistent] Demand keyword: the per-platform deltas sum to +10.8K while the headline claims ↑ 12K

**Where:** `/app/demand/keyword`; `app/(dash)/app/demand/keyword/page.tsx:90-131`.
**Steps:** Headline: "Prompt volume 128K · ↑ 12K vs prev." By-platform rows: ChatGPT 61K ↑7.2K, Gemini 28K ↑2.1K, Perplexity 22K ↑1.9K, Claude 17K ↓0.4K. Sum of levels: 128K (matches the headline exactly, so the four rows are the full decomposition). Sum of deltas: **+10.8K**.
**Expected / Actual:** Expected the deltas to sum to the headline delta since the levels do. Actual: a 1.2K gap with no unaccounted platform to absorb it. (The trend fixture agrees with the headline: `lib/data/demand.ts:28` has Jul 1 = 116, Aug 1 = 128.)
**Why it matters:** The decomposition adds up for the level, which invites the reader to add the deltas too. Two smaller issues on the same card: Claude's checkbox ships unchecked (`PlatformCheck initialChecked={false}`) although its 17K is inside the 128K total, and the chart's last data point is Aug 1 while the last axis label is "Jul".
**Fix:** Adjust one platform delta so the four sum to 12.0K (e.g. ChatGPT ↑8.4K, which also keeps its "grew 13%" note true), and either check Claude by default or exclude it from the headline. **(30 minutes)**
**Confidence:** high.

### [P2 · inconsistent] "Topic movers · 7d" prints the same five deltas the Topics table on the same screen labels "Δ 30d"

**Where:** `/app/insights`, both cards in `insights/page.tsx:48`.
**Steps:** "Topic movers · 7d": Running shoes ↑6.2pt, Training apparel ↑3.8pt, Sneaker releases ↑1.4pt, Sustainability ↓2.1pt, Basketball gear ↓0.7pt. The Topics table's "Δ 30d" column, same five topics: ↑6.2, ↑3.8, ↑1.4, ↓2.1, ↓0.7.
**Expected / Actual:** Expected a 7-day mover list and a 30-day change column to be different measurements. Actual: byte-identical values under two different window labels on one screen — and the heatmap's per-cell deltas average to these same numbers and are documented there as 30-day deltas, so "· 7d" is the wrong label.
**Why it matters:** Any client told the platform runs daily who then sees a 7-day and a 30-day change agree to the decimal across five topics reads it as neither window being real. Cheapest credibility fix on the screen.
**Fix:** Rename the card "Topic movers · 30d", or add a genuine 7-day delta array and use it. **(15 minutes)**
**Confidence:** high.

### [P2 · inconsistent] Regions claims 8 tracked regions while every list on the screen enumerates 6

**Where:** `/app/insights/regions` (`regions/page.tsx:36`) vs `components/app/RegionMap.tsx:17-29`.
**Steps:** Subtitle: "% of answers mentioning Nike, by answer locale · **8 regions**, 5 languages tracked"; the World-view card header repeats "8 REGIONS TRACKED". "Region rank" lists 6 entries (US, UK, DACH, France, Brazil, Japan) with no truncation affordance; the "By region" table lists the same 6, with languages English, English, German, French, Portuguese, Japanese = 5 distinct, matching the "5 languages" claim. `RegionMap.tsx:17` shades 8 country codes — 840, 826, 276, 40, 756, 250, 76, 392 — where 276/40/756 (DE/AT/CH) all carry DACH's single 27.4% value.
**Expected / Actual:** Expected the tracked-region count to match the rows. Actual: "8 regions" is a count of shaded *countries*, three of which are one region; the product's region set is 6, which is what both lists and the language count assert.
**Why it matters:** A client counting six rows under a header promising eight assumes two regions are missing from their report — the opposite of the intended message. Unambiguous, because the language count only reconciles with 6.
**Fix:** Change both strings to "6 regions, 5 languages tracked", or add "· 8 countries" if the shaded-country count is worth surfacing. **(15 minutes)**
**Confidence:** high.

### [P2 · inconsistent] Referrals "Analytics connection" compares referrals to sessions and lands on +4.2% when the page's own like-for-like gap is +56%

**Where:** `/app/agents/referrals`; `lib/data/infra.ts:118-134`.
**Steps:** KPIs: "Human referrals from AI 3,412 ↑22%" and "Sessions from AI 5,108 ↑18%". The card: "Answr's edge logs count 4.2% more AI referrals than GA4 sessions — mostly agent browsers GA4 drops." The series: `analyticsComparisonSeries` sums to 3,412 (Answr) and 3,274 (GA4); 3,412 ÷ 3,274 = 1.042.
**Expected / Actual:** Expected Answr sessions vs GA4 sessions. Actual: Answr *referrals* (3,412) vs GA4 *sessions* (3,274). Like for like against the page's own sessions figure, Answr counts 5,108 vs 3,274 = **+56%**.
**Why it matters:** The card's job is to explain why Answr's numbers won't match the client's GA4, and it is the number a data team checks first. As written the two figures are different units and the honest gap is thirteen times the one advertised. The Overview CSV footnote also describes 3,412 as "deduplicated sessions", conflicting with this page labelling 3,412 humans and 5,108 sessions.
**Fix:** Either compare 5,108 Answr sessions to a GA4 sessions series and restate the percentage, or relabel the GA4 series "GA4 AI referrals" so both sides are the same unit; align the Overview CSV footnote with whichever wins. **(4 hours)**
**Confidence:** medium.

### [P2 · inconsistent] `METRICS.md` was never regenerated after the rebrand and documents a different workspace than the in-app ⓘ text

**Where:** `METRICS.md` (generated by `tools/gen-metrics-doc.mjs`) vs `lib/metrics.ts`, which the KPI hints read. *Reported by both the data-integrity and code-health auditors — merged; see also the generator finding in §3.8, which is why this could not be fixed by regenerating.*
**Steps:** `METRICS.md:8` "The demo workspace (**Solara**) ships fixture values" vs `lib/metrics.ts:8` "(Nike)". `topic_visibility` example "(e.g. Revenue forecasting)" vs `lib/metrics.ts:98` "(e.g. Running shoes)". `audience_visibility` "for a RevOps lead at a 200-person SaaS" vs "for a marathon runner logging 40 miles a week". `cited_source_count` "e.g. g2.com" vs "e.g. runnersworld.com". `crawler_events` "214 blocked /docs URLs" vs "214 blocked /help URLs". `ai_referrals` goals "demo form, signup" vs "signup, purchase".
**Expected / Actual:** Expected `METRICS.md` to be a faithful dump of `lib/metrics.ts` — its own header says so. Actual: at least six entries carry the pre-rebrand B2B-SaaS workspace, so the document every exported CSV footer points a client at describes a product monitoring a company called Solara. Two entries also promise a per-platform breakdown on the Data-quality screen that does not exist.
**Why it matters:** Every export footer sends the reader here, and the audit brief treats it as the definition of intended behavior — but it no longer matches the code driving the UI, so it cannot be used to adjudicate anything else. Low effort, high leverage for the rest of this list.
**Fix:** Fix the generator first (§3.8), correct the two stale prose lines in its template, regenerate, commit, and add it to CI so it cannot drift again. Then either build the per-platform table on `/app/settings/data-quality` or drop that sentence from the two definitions. **(1 hour, after the generator fix)**
**Confidence:** high.

### [P3 · inconsistent] Prompt detail sparkline is dated Jul 5 – Aug 2 while the workspace window and its own run history end Aug 5

**Where:** `/app/prompts` detail panel; `app/(dash)/app/prompts/PromptDetail.tsx:101`.
**Steps:** Open "best running shoes for marathon training". The "Mention rate · 30d" sparkline's axis endpoints read "Jul 5" and "Aug 2". `lib/data/dates.ts:9` puts every other 30-day window at Jul 7 – Aug 5, and the same panel's "View all runs" sheet has its newest run on Aug 5.
**Expected / Actual:** Expected Jul 7 – Aug 5. Actual: hardcoded Jul 5 – Aug 2, three days off at both ends, so the sparkline excludes the three most recent runs the same panel lists.
**Why it matters:** Small, but it is the only chart in the product whose window disagrees with the workspace window, and a client cross-reading the run sheet against the sparkline notices the missing runs.
**Fix:** Replace the two literals with `lastDays(30)[0]` and `lastDays(30)[29]`. **(10 minutes)**
**Confidence:** high.

### [P3 · inconsistent] Workflows says it created action #94, but the queue tops out at #92 and the create-action flow assigns #93

**Where:** `/app/workflows` "Recent runs" vs `/app/actions` and `lib/data/prompts.ts:281` (`ACTION_DRAFT.queueId = 93`).
**Steps:** `/app/workflows`: "Weekly content audit — 2 pages lost citations week-over-week → created action **#94** · Aug 3". `/app/actions`: the board's highest id is 92; #94 appears nowhere. `/app/prompts` → "Create action": the draft is numbered #93 with the comment "next id after the queue's highest (#92 on the Actions board)".
**Expected / Actual:** Expected an action a workflow created on Aug 3 to exist, and ids to be monotonic. Actual: #94 exists only as a log line, while #93 is simultaneously offered as the "next" id — so completing the flow creates an action numbered below one that supposedly already exists.
**Why it matters:** Only visible to someone who reads the workflow log and then looks for the action — but that is exactly what a technical buyer does when deciding whether workflows really write to the queue.
**Fix:** Renumber the log entry to an id that exists (or add #93/#94 to the fixture) and derive `ACTION_DRAFT.queueId` from `max(id)+1`. **(15 minutes)**
**Confidence:** high.
---

### 3.4 Functional completeness, flows and exports

### [P0 · broken] Every marketing lead-capture form confirms the lead, transmits nothing, and accepts junk

**Where:** `app/(marketing)/demo/DemoForm.tsx` (Book your demo), `app/(marketing)/SnapshotForm.tsx` (homepage), `app/(marketing)/blog/BlogClient.tsx` (newsletter). *Three findings from two auditors merged: the dead destination, the missing email validation, and the prefilled snapshot field.*
**Steps:** (1) `/demo` — fill first name, last name, work email, company website, click "Pick a time" with the network tab open. (2) `/` — submit "Get my free snapshot". (3) `/blog` — submit the newsletter email. (4) `/demo` again with `notanemail` in Work email. (5) `/` again without touching the field.
**Expected / Actual:** Expected the lead to reach someone, and malformed input to be rejected. Actual: **zero** network requests fire on any of the three submits (verified by capturing all non-asset requests — empty array every time), and no fetch/action/sendBeacon exists in any of the three files. `/demo` swaps to "Thanks — we'll be in touch within one business day." The homepage swaps to "Queued — we're sampling yourcompany.com now… Your snapshot lands in your inbox within the hour" **despite the form having no email field at all**. `/blog` swaps to "Subscribed". On `/demo` the firstName and lastName inputs are uncontrolled with no onChange and are never read even client-side. Validation: `DemoForm.tsx:57` sets `noValidate` and submit only checks `!email.trim()`, so `notanemail` succeeds and is echoed back ("Your pick-a-time link goes to notanemail"). `SnapshotForm.tsx:22` ships the placeholder as state (`useState("yourcompany.com")`), so the empty check can never fire and an untouched submit returns a confident success for a domain the visitor never entered; `!!! not a domain !!!` is accepted too.
**Why it matters:** `useanswr.com` is live and publicly reachable, and "Book your demo" is the primary conversion path on every marketing page. A prospect who fills it in is told a human will contact them within one business day and never hears back — lost revenue plus a broken promise on the record. The homepage variant is structurally unkeepable: it promises an emailed snapshot without collecting an email address. This is distinct from the dashboard's read-only demo toasts, which are honest by design; marketing forms make affirmative commitments.
**Fix:** Point all three at a real destination before the site takes traffic — a POST to a route handler forwarding to the CRM/inbox, or at minimum a form service. Until a destination exists, change the copy to what actually happens rather than shipping a false confirmation. Bind or remove the dead firstName/lastName inputs; add an email-shape check reusing the existing `invalid` state and drop `noValidate`; move `yourcompany.com` from `useState` to `placeholder` and validate a plausible hostname. The homepage form needs an email field if it is going to promise an emailed snapshot. **(4 hours)**
**Confidence:** high.

### [P1 · broken] ⌘K palette: prefilled query, no filtering, 2 of ~36 screens reachable, and a false claim that search is fuzzy

**Where:** `components/app/CommandK.tsx:124-129` (input), `:133-134` (static rows), `:182` (footer copy). *Reported by both the functional and UX auditors — merged.*
**Steps:** Press ⌘K anywhere in the dashboard. Read the input. Type `prompts`, then `zzzz-nonexistent`. Read the footer. Press Escape and reopen.
**Expected / Actual:** Expected an empty box that filters as you type, with a zero-results state. Actual: the input opens with `defaultValue="citations"` — a query the user never typed — with no onChange and no state, so typing appends (`citationszzzz-nonexistent`) and the result list never changes. The list is four hardcoded rows (Citations, Watched URLs, Export citations (1,284), What's new), so only 2 of ~36 routes are navigable. Permanently visible beneath the results is the shipped frame artifact: *"No results for 'citatons'? Search is fuzzy — typos still match."* The Citations row is hardcoded `active={true}`, so it renders as the current screen even from `/app/overview`. Reopening discards what was typed.
**Why it matters:** The palette is advertised in the sidebar with a visible ⌘K affordance, so it is the first thing a power user reaches for in a demo. It opens correctly, autofocuses, and closes on Escape and backdrop — which makes the dead input *more* damaging, because everything around it works and invites typing. The footer line is a specific false claim about a capability that does not exist. It is also the only entry point to the What's-new panel.
**Fix:** Make the input controlled and filter a route list built from the sidebar's own nav config (which already enumerates every screen) plus the existing action rows, with a real zero-results row; derive the active row from `usePathname()`; delete the "fuzzy" footer line. If a real search is not in budget, drop the `defaultValue`, mark the input `readOnly` and use the standing honest-note pattern the rest of the app uses. **(6 hours real / 1 hour honest)**
**Confidence:** high.

### [P1 · broken] The Prompts search box accepts text and does nothing — no filter, no toast, no feedback

**Where:** `app/(dash)/app/prompts/page.tsx:30`.
**Steps:** `/app/prompts` → click the search box (placeholder "⌕ Search 412 prompts…") → type `adidas` → press Enter.
**Expected / Actual:** Expected the table to filter, or the control to say it cannot. Actual: `<input type="search">` with no value, no onChange, no onKeyDown and no enclosing form. Text is accepted, the 8 rows are unchanged, "Showing 8 of 412" is unchanged, Enter does nothing, no toast appears.
**Why it matters:** Prompts is the second sidebar item and the placeholder explicitly promises to search 412 prompts. The sibling Conversations screen has a *working* search on the same visual pattern (typing `adidas` takes it from 6 rows to 3), so a client who tries one and then the other sees the inconsistency directly. Every other unimplemented control in the dashboard emits an honest toast — this one is silent, which reads as a bug rather than a demo limitation.
**Fix:** Filter `PROMPT_ROWS` client-side on the input value (the fixture is 8 rows — a one-line filter), or route it through `FilterPill`'s honest-note pattern like the adjacent "Intent: All" pill. Silence is the only unacceptable option. **(15 minutes)**
**Confidence:** high.

### [P1 · broken] Reports "Download ↓" returns a 4-row table of contents instead of the report, bypassing the export envelope every other download uses

**Where:** `app/(dash)/app/reports/ReportsControls.tsx:54-70` (`DownloadButton`), `app/(dash)/app/reports/page.tsx:64-70`.
**Steps:** `/app/reports` → under "Recent reports" click "Download ↓" on "Board pack — AI visibility appendix" → **open** the resulting `nike-report-board-pack-q2-2026.csv`.
**Expected / Actual:** Expected the report. Actual: a 339-byte file with a single header row `Report,Range,Created,Format,Section` and four rows repeating the report name and listing its table of contents — "Board pack — AI visibility appendix,Q2 2026,Jul 8,PDF,Executive summary" and three more. No metric appears anywhere. All four recent reports behave identically (267–355 bytes). `DownloadButton` hand-rolls the CSV rather than calling `buildExecutiveCsv`/`csvBlob`, so it also omits the header block, the executive summary, the footnotes and the UTF-8 BOM every other export carries.
**Why it matters:** `lib/export/report.ts` states the contract in its own docstring — "no export is ever a bare dump" — and Reports is the one module whose entire purpose is delivering reports, and the only place that violates it. The other 20 exports are genuinely excellent, which makes this one conspicuous. The missing BOM additionally mojibakes the em-dash in "Weekly AEO summary — exec team" in Excel on Windows. **Auditor disagreement, resolved:** one auditor logged this same button in its *good* list because a real file does download with an honest PDF-vs-CSV toast; the defect is the file's contents, which that auditor did not open.
**Fix:** Route `DownloadButton` through `ReportCsvButton`/`buildExecutiveCsv` with a real `ReportSpec` per recent report, assembled from the module fixtures its sections name (overview, evidence, insights are all already typed and exported). The PDF-vs-CSV mismatch is already disclosed honestly and needs no change. **(4 hours)**
**Confidence:** high.

### [P1 · broken] Settings › Workspace has no Save control — the workspace name and slug silently eat what you type

**Where:** `/app/settings/workspace`; `app/(dash)/app/settings/workspace/page.tsx`.
**Steps:** Enumerate the buttons on the page: two select pills, a date-range pill, and "Delete workspace" — no Save, no Apply, no Cancel. Change "Workspace name" from `Nike` to `Acme Corporation Global`, click Team in the settings rail, then back to Workspace.
**Expected / Actual:** Expected a Save affordance, or explicit read-only treatment. Actual: the field accepts the edit, the value is discarded on navigation, and the field reads `Nike` again. No toast, no dirty-state indicator, no confirmation — indistinguishable from a working input. The same applies to Primary region / Time zone / Default date range, none of which persist (and "Default date range" is read by no code — the workspace always boots at 30 days).
**Why it matters:** The only destructive control on the screen is present while the constructive one is missing, so the page looks complete and quietly loses data. Every other unwired control in this app at least toasts; this and the Prompts search box are the two silent ones, which teaches the user that silence means saved.
**Fix:** Add a Save affordance firing the codebase's existing honest toast ("Workspace settings save on live workspaces"), or mark the fields `readOnly` with the note the surrounding chips already use. **(2 hours)**
**Confidence:** high.

### [P1 · inconsistent] Export controls state a window they do not honor — stale topbar counts, hardcoded `-30d` filenames, a wrong modal scope line, and a fake "last export" receipt

**Where:** `components/ui/ExportButton.tsx:28` (default `window = "Last 30 days (vs previous 30 days)"`); 15 hardcoded `exportFilename` values (e.g. `overview/page.tsx:33`); `Topbar.tsx` `exportLabel` props (e.g. `insights/page.tsx:43`); `app/(dash)/app/citations/ExportModal.tsx:112`. *Three findings from two auditors merged.*
**Steps:** `/app/agents` at the default range: KPI "AI crawler requests 48,231", topbar "Export 48,231 events" — agree. Switch to 7 days: the KPI becomes 12,399 while the topbar still reads "Export 48,231 events"; same at 90d (126,672) and YTD (231,717). On `/app/citations`, set 90 days — KPI becomes "Total citations 3,327 ↑1,263", unique domains 86→141 — then click Export: the modal's scope line is the hardcoded literal "1,306 answers in scope · Last 30 days · all platforms", the file is `nike-citations-30d.csv`, and its executive summary reads "Citations · 30d, 1,284, +212". The same modal ships a green chip reading "✓ Last export ready — answers-jul-2026.csv (1.2 MB)" for a file that does not exist and was never produced.
**Expected / Actual:** Expected a control labelled with a count either to follow the active window or to name its window. Actual: at three of four ranges the export button asserts a number 4–19× away from the KPI directly below it; the modal describes a window the user is not on; and a fabricated receipt implies a prior download. The downloaded file itself *is* honest — it carries "Note on window: Workspace filter at export time: … It is NOT applied to this file" — but every control that produced it is not.
**Why it matters:** The window model is otherwise the strongest part of this build, so a stale label is the one thing that makes a working filter look broken. Citations is one of only nine screens where the pill is genuinely live, i.e. exactly where a user trusts the number. The fake 1.2 MB receipt makes the modal read as a screenshot rather than a tool.
**Fix:** Thread `useFilters()` into the report specs so exported rows, the modal scope line and the filename suffix derive from the active window; drop the hardcoded `-30d` from the 15 call sites. If an export genuinely cannot re-slice, say so in the scope line and drop the count from the button label ("Export events"), leaving the CSV's window note to disclose. Delete the "Last export ready" chip or drive it from the download that just happened. **(1.5 days for the full thread; 3 hours for the honest-label interim)**
**Confidence:** high.

### [P1 · inconsistent] The brand switcher changes the sidebar label only — the breadcrumb hardcodes "Nike" and every number stays Nike's

**Where:** `components/app/Topbar.tsx:85` (a literal `Nike{" "}` in the crumb); `components/app/BrandSwitcher.tsx`.
**Steps:** `/app/overview` → click the sidebar workspace row → the panel lists Nike 34.2%, Nike SNKRS 11.8%, Jordan Brand 22.4% → pick "Jordan Brand" → read the sidebar, breadcrumb, KPI row and competitor table.
**Expected / Actual:** Expected either the whole screen to switch or the selection to be refused. Actual: the sidebar reads "J Jordan Brand", the breadcrumb still reads "Nike / Overview", Visibility is still 34.2% (the panel just said Jordan is 22.4%), the competitor table's first row still reads "Nike — You — 28.6%", and the sidebar counts still say 1,284/412 (the panel says Jordan has 240 prompts). The honest read-only toast fires once and vanishes after 3.6s, leaving a workspace permanently labelled Jordan and populated entirely with Nike.
**Why it matters:** A prospect who tries the one obviously multi-tenant control in the product lands in a state where the label and the data disagree on every screen, with no standing explanation. The hardcoded "Nike" means the breadcrumb is wrong on all 36 dashboard screens, not just Overview.
**Fix:** Have `Topbar` read `useSelectedBrand()` for the crumb. Then either render an explicit read-only banner above the content for as long as a non-live brand is selected, or render those brands `aria-disabled` in the switcher panel with an inline reason — a scope that cannot be honored should not be selectable. **(4 hours)**
**Confidence:** high.

### [P1 · missing] The metric-provenance popover is dead code — the metric dictionary is unreachable from 35 of 36 screens

**Where:** `components/app/MetricInfo.tsx` (imported by zero files); `components/app/KpiCard.tsx:3-4,42`; 36 `metricId=` props across `app/(dash)`; the duplicate `app/(dash)/app/content-score/ScoreInfo.tsx`. *Reported by both the UX and code-health auditors — merged.*
**Steps:** `grep -rn 'MetricInfo' app components` → the only hit is its own definition. `KpiCard` imports `METRICS` and `Hint`, computes `const def = metricId ? METRICS[metricId] : null`, and uses it solely for `def?.plain`; `<MetricInfo>` is never rendered. Live: `button[aria-label^="About "]` count is **0** on `/app/overview`, `/app/citations`, `/app/insights/sentiment`, `/app/demand`, `/app/agents`, `/app/live`, `/app/actions`. Only `/app/content-score` has one, via a local near-identical copy (diffing the two files yields 8 hunks, all cosmetic). `grep -rn '\.source\b|\.calculation\b|\.cadence\b'` hits only those two files.
**Expected / Actual:** Expected, per `KpiCard`'s own docstring ("Pass `metricId` to get the ⓘ provenance popover: definition, real data source, and calculation") and `READINESS.md` §5 ("consistently across all 36 screens"): every KPI exposes source and calculation. Actual: zero do; the 36 `metricId=` props read as wired and supply nothing but a one-line hint.
**Why it matters:** 31 metrics × source + calculation + cadence — the entire "here is why you should believe this number" layer, the thing `METRICS.md` and `INTEGRATIONS.md` exist to support and the product's stated differentiator — is authored, maintained, documented in three places, and reachable on one screen that nothing links to. A skeptical buyer asking "where does 34.2% come from?" has no in-product answer. It is simultaneously the largest block of dead code in the repo and a credibility feature that was built and disconnected; the duplicate is what kept the dead original from being noticed.
**Fix:** Render `<MetricInfo metricId={metricId} />` inside `KpiCard` next to the value (it already has `position:relative`) and delete `ScoreInfo.tsx` in favour of the shared component. Re-check the 300px absolutely-positioned panel for right-edge clipping once it is actually on screen — `Hint`'s portal approach is the proven pattern. If the popover was deliberately dropped instead, delete `MetricInfo.tsx` and fix the four places that claim it ships. **(4 hours)**
**Confidence:** high.

### [P1 · missing] No client state is in the URL — a refresh silently changes the numbers on screen and no view is shareable

**Where:** `lib/filters/context.tsx:38-39` (`useState`, no `searchParams`); `app/(dash)/app/prompts/PromptsBody.tsx`; `app/(dash)/app/insights/audiences/AudiencesBoard.tsx:87`.
**Steps:** `/app/overview` → date pill → "Last 90 days". KPI reads "Citations · 90d 3,327 ↑1,263", visibility delta ↑7.4, axis May 8→Aug 5. Navigate away and back — the selection survives (correct). Press F5. Separately, open a prompt detail or select an audience segment and check `location.href`.
**Expected / Actual:** Expected reload to preserve the window, or at minimum to warn. Actual: reload silently reverts to 30 days — Citations flips to 1,284 ↑212, delta to ↑2.8, axis to Jul 7→Aug 5 — with no indication anything changed. `location.href` never changes for the range, the platform, the selected prompt or the selected segment, so a pasted link always opens on the 30-day all-platform default.
**Why it matters:** An analyst cannot send "Perplexity share of voice over 90 days" to anyone, cannot bookmark it, and cannot use Back as undo. Worse, a mid-session refresh moves every number on the page without saying so — the failure mode is silently reading the wrong window. One root cause, four surfaces.
**Fix:** Initialise `FilterProvider` from `searchParams` and mirror range/platform into the URL with `router.replace` (or nuqs); do the same for the prompt id and segment id. Add a Reset control that appears when any filter is off-default. **(1.5 days)**
**Confidence:** high.

### [P2 · broken] The Citations export modal's format selector is inert — all three modes produce the identical file and preview

**Where:** `app/(dash)/app/citations/ExportModal.tsx`.
**Steps:** `/app/citations` → Export. Note the preview table, click "Export CSV" on the default "Raw answers". Reopen, select "Citations only", export. Reopen, select "Summaries", export. Compare.
**Expected / Actual:** Expected three different payloads. Actual: all three download `nike-citations-30d.csv` at exactly 2,960 bytes with identical content — the same aggregate report the topbar Export button produces — and the preview table inside the modal never changes (same DATE / PROMPT / MENTIONED / POSITION rows under all three modes). The "Include competitor mentions" checkbox in the same modal *does* work (output grows to 3,158 bytes), confirming the wiring pattern exists and the mode tabs simply were not connected.
**Why it matters:** The mode tabs are the modal's primary control and the reason it exists rather than a plain export button. Because the neighbouring checkbox does change the output, a client experimenting with both concludes the export is unreliable rather than unfinished.
**Fix:** Bind the three tabs to distinct `ReportSpec`s (raw per-answer rows / summary sections / citation rows) and drive both the preview table and the export from the selected mode, the way the competitor-mentions checkbox already branches. **(4 hours)**
**Confidence:** high.

### [P2 · inconsistent] Row-level exports are silently truncated — "Export 412 prompts" yields 8 rows, "1,306 answers in scope" yields 3 JSON records

**Where:** `app/(dash)/app/prompts/Controls.tsx:44-67`; `app/(dash)/app/citations/ExportModal.tsx` (Export JSON path).
**Steps:** `/app/prompts` → "Export 412 prompts" → open `nike-prompts-30d.csv`. `/app/citations` → Export (header reads "1,306 answers in scope") → "Export JSON" → open `nike-answers-30d.json`.
**Expected / Actual:** Expected the stated count, or an explicit truncation note. Actual: the CSV's "TRACKED PROMPTS" section has exactly 8 data rows and footnotes that say "Figures are the values shown on screen" — nothing states that 404 prompts are missing. The JSON is a bare 357-byte array of 3 objects with no metadata block at all, and its values are scraped from the rendered table, so they carry UI artifacts: `"prompt": "best running shoes for…"` (a literal ellipsis, not the real prompt) and `"position": "—"` instead of null.
**Why it matters:** Distinct from the aggregate exports, where "Export 48,231 events" reasonably names the population of a summary report. Here the file's rows are the same unit as the label's count, so 8-of-412 and 3-of-1,306 are straightforwardly wrong, and the exported prompt strings are unusable because they contain display truncation. The Prompts toast does say "8 rows", so the app knows the real number and simply does not put it in the file.
**Fix:** Add a truncation line to the executive header when `rows.length` is below the stated population ("Rows in this file: 8 of 412 tracked prompts — demo fixture"), export source values rather than rendered strings, and give the JSON path the same metadata envelope as the CSV path (or drop the JSON option). **(4 hours)**
**Confidence:** high.

### [P2 · broken] Two dashboard URLs 404 into the public marketing 404, dropping a signed-in user out of the app shell

**Where:** `app/(dash)/app/agents/bots/` and `app/(dash)/app/insights/topics/` (child routes exist, no `page.tsx` at that level); only `app/not-found.tsx` exists. *Reported by both the functional and UX auditors — merged.*
**Steps:** Signed in, visit `/app/agents/bots` and `/app/insights/topics`. Both return HTTP 404 over the wire.
**Expected / Actual:** Expected an index page, a redirect to the parent tab, or at minimum a dashboard-framed not-found. Actual: both render the **marketing** 404 — marketing top nav with "Log in" and "Get a demo →", the marketing footer, and recovery links to Pricing, Customers, Blog. The sidebar disappears entirely and there is no link back into the workspace. Both directories contain a working child route (`/app/agents/bots/gptbot`, `/app/insights/topics/running-shoes`), and `AgentsTabs.tsx:14` and `InsightsTabs.tsx:35` both reference these paths in their `isActive()` predicates, so the code treats them as real destinations.
**Why it matters:** A signed-in customer who trims a URL, follows a stale bookmark or mistypes is ejected from the product, shown a logged-out page with a "Log in" button, and sold to — it reads as a session drop. This is also the generic failure mode for *any* mistyped `/app/*` URL, because there is no dashboard-scoped not-found boundary at all.
**Fix:** Add `app/(dash)/app/not-found.tsx` with the dashboard shell and workspace-relative recovery links (the copy already exists). Separately, add index pages for the two paths or redirect them to `/app/agents` and `/app/insights` so the tab predicates match reachable URLs. **(4 hours)**
**Confidence:** high.

### [P2 · missing] `/app/content-score` is a complete, working feature that no user can reach, and Overview's two natural entry points toast instead of opening it

**Where:** `app/(dash)/app/content-score/` (zero inbound links anywhere in `app/` or `components/`); entry points on `/app/overview`.
**Steps:** Try to reach Content score from any nav, tab, menu or CTA. Then navigate directly. Then click "Optimize a page →" and "Create content →" on `/app/overview`.
**Expected / Actual:** Expected it to be reachable. Actual: `grep` for `/app/content-score` returns nothing, and it is absent from the sidebar and every tab strip — yet direct navigation renders a fully built screen (URL / Paste text / Upload file tabs, a "Score it" button, "68 OF 100 — Likely to be cited" against a 54 median, four subscores, three scored recommendations, and an Export button producing a proper executive CSV). Meanwhile the two Overview CTAs that obviously belong to it fire toasts reading "Optimizing pages needs a live workspace — this demo is read-only."
**Why it matters:** Finished work that is invisible in the demo, and the toast copy actively misinforms: it tells the user the capability requires a live workspace when a working version is one URL away.
**Fix:** Add Content score to the OPTIMIZE group in the sidebar and repoint the two Overview CTAs at `/app/content-score` instead of toasting. **(30 minutes)**
**Confidence:** high.

### [P2 · broken] Onboarding shows "DETECTED ✓ Nike" before you type anything, ignores what you enter, and the three steps share no state

**Where:** `/onboarding/brand` → `/onboarding/competitors` → `/onboarding/prompts` (public; `lib/gate.ts` `isGated` covers only `/app`).
**Steps:** Open `/onboarding/brand` logged out and read the panel *before typing*. Then enter `acme.com` and click Continue twice. Separately, load `/onboarding/prompts` directly.
**Expected / Actual:** Expected the detection panel to appear after input and reflect it. Actual: on first paint the card already shows "N · Nike · Athletic footwear & apparel · Sportswear · DETECTED ✓ · Nike Running · help.nike.com · nikeinc". Entering `acme.com` changes nothing. Step 2 offers Adidas / Puma / Under Armour as "your" competitors; step 3 reports "412 prompts across 5 topics". `/onboarding/prompts` deep-links straight to a completed step 3.
**Why it matters:** The first three screens a prospect touches visibly contradict their own input, on a publicly reachable route. Showing "DETECTED ✓" *before* any input is worse than showing stale results after it — it reveals the whole flow as a static frame in under two seconds.
**Fix:** At minimum, hide the detection panel until the field has a value and gate Continue on it. Better: derive the panel from the entered domain, carry the value forward in a draft record or the URL, and echo the real domain on steps 2–3. **(1 day for the real version; 2 hours for the minimum)**
**Confidence:** high.

### [P2 · broken] The onboarding funnel dead-ends at a login wall — "Start monitoring" lands on "Welcome back"

**Where:** `app/(auth)/onboarding/prompts/PromptSet.tsx:114` → `/app/welcome`; gate in `lib/gate.ts:38` + `proxy.ts`.
**Steps:** With no `answr_demo_access` cookie: `/signup` → submit → `/onboarding/brand` → Continue → `/onboarding/competitors` → Continue → `/onboarding/prompts` → "Start monitoring".
**Expected / Actual:** Expected the funnel to end inside the product. Actual: `/signup` and all three onboarding steps return 200 to anonymous visitors (verified by curl with no cookie), but the final CTA targets `/app/welcome`, which 307s to `/login?next=%2Fapp%2Fwelcome`. The login card renders its standard "Welcome back — Log in to your workspace" with no explanation and no acknowledgement that the user just completed signup.
**Why it matters:** The funnel is publicly reachable, so this is the path any prospect follows from the marketing site's "Start a 14-day free trial" links. Being told to "log in to your workspace" immediately after creating one — with no workspace and no credential but the demo passphrase printed on the card — is the worst possible last impression of signup. The gate itself is intentional; the defect is that a public funnel terminates inside the gated area without handling it.
**Fix:** Cheapest correct fix: gate `/onboarding` and `/signup` alongside `/app` in `isGated()` so the funnel is coherent end to end. Alternatively have the final step set the gate cookie, or pass a flag so `/login?next=/app/welcome` renders "You're almost in — enter the demo passphrase". **(2 hours)**
**Confidence:** high.

### [P2 · inconsistent] Reports "Generate now" reports success, produces nothing, and adds no row to the table beside it

**Where:** `/app/reports`; `app/(dash)/app/reports/ReportBuilder.tsx`.
**Steps:** Note "Recent reports" has 4 rows. Click "Generate now". Wait, then re-read the table and the downloads folder.
**Expected / Actual:** Expected a file, a new row, or copy saying neither is coming. Actual: a persistent inline confirmation — "✓ Weekly AEO summary — exec team generated — 4 sections · PDF · 2 recipients" — plus a toast, no file, and the same 4 rows. Clicking again re-shows the same confirmation.
**Why it matters:** The persistent-inline-confirmation pattern is the right one and is used well elsewhere, which makes this instance more misleading, not less — it looks like the flows that do work. The adjacent table is the obvious place a user looks for the artifact and it does not change.
**Fix:** `ReportBuilder.generate` can be made genuinely real in about an hour by reusing `lib/export/report.ts`, which 12 other buttons already use — build the selected sections, download them, then append a row to Recent reports. Otherwise change "generated" to copy that does not promise an artifact. **(2 hours)**
**Confidence:** high.

### [P2 · inconsistent] The empty-state screen shows the Overview breadcrumb and sits beside a sidebar asserting a full workspace

**Where:** `/app/welcome`; `app/(dash)/app/welcome/page.tsx:16` (`<Topbar crumb="Overview" …>`).
**Steps:** Visit `/app/welcome` (reachable from onboarding step 3).
**Expected / Actual:** Expected a first-run screen that says what it is, beside chrome agreeing no data exists. Actual: the breadcrumb reads "Nike / Overview" on a screen that is not Overview; the four KPIs correctly render em-dashes and the body says "Your first prompt run starts tonight"; and the sidebar 30px away asserts Citations 1,284, Prompts 412, Conversations 38, Actions 12 with an amber dot, Reports 3. The body also says "412 prompts across 5 platforms" while its own Prompts KPI is a dash. Content ends at ~620px of a 900px viewport.
**Why it matters:** This is the one screen whose entire job is to say "nothing has been collected yet", and the navigation beside it contradicts that in five places. It is also the first screen a newly onboarded customer lands on.
**Fix:** Set `crumb="Getting started"`. Suppress or zero the sidebar counts when the workspace has no data — the same derive-the-badges change as §3.3, plus an empty-workspace flag. **(2 hours, with the sidebar-badge fix)**
**Confidence:** high.

### [P3 · missing] Support chat has no send affordance — Enter works but nothing indicates it

**Where:** `components/app/SupportChat.tsx:138-153`.
**Steps:** Click the "?" button on any dashboard screen, type a message, look for a way to send it.
**Expected / Actual:** Expected a send button. Actual: the input row contains only a non-interactive `<span>⊕</span>` and the input; there is no form and no button whose label matches send (enumerating the dialog's buttons returns only "✕" and "Show robots.txt"). Enter *does* work correctly (`onKeyDown` at `:145`) — the message appends, a canned reply follows, the input clears.
**Why it matters:** The behaviour is implemented and correct; only the affordance is missing. "⊕" reads as attach, not send, so a user who types and pauses has no visible next step. Included because the chat is offered on every dashboard screen.
**Fix:** Add a send button to the right of the input wired to the existing `send()`, or make the ⊕ a real button. No logic change. **(15 minutes)**
**Confidence:** high.

### [P3 · inconsistent] Login: an empty form returns "That email and password don't match", and Back after signing in re-shows the login card

**Where:** `app/(auth)/login/LoginForm.tsx:40-58`; `app/api/session/route.ts:26-29`.
**Steps:** `/login` → clear both fields → Log in. Then sign in successfully and press browser Back.
**Expected / Actual:** Expected "Enter your email and password", and a signed-in visitor to be redirected away from `/login`. Actual: an empty submit makes a network round-trip to `/api/session`, gets 401, and renders the mismatch error for a form that was never filled; neither input carries `required`. With a valid cookie, `/login` renders normally, offering to sign in a user who already is.
**Why it matters:** Both are small, but the first screen of a client demo is where polish is read as competence, and the empty-form case wastes a request to say something untrue about the input.
**Fix:** Add `required` to both inputs and a client-side empty check with its own message before the fetch. Add a server-side redirect to `next` (or `/app/overview`) from `/login` when the gate cookie is already valid. **(30 minutes)**
**Confidence:** high.
---

### 3.5 Accessibility

All measurements were taken from the Chrome accessibility tree (CDP `Accessibility.getFullAXTree`), real Tab keypresses and computed styles at 1440×900. No screen reader was driven — see §6.

### [P1 · missing] The product has no headings — 2 `<h1>` in the whole repo, 0 usable ones on any route

**Where:** repo-wide. The only two hits are `app/(dash)/app/live/page.tsx:22` and `components/app/SmallScreenGate.tsx:119`. *Reported by both the accessibility and SEO auditors, with an apparent conflict resolved below.*
**Steps:** `grep -rn "<h1\|<h2\|<h3" app components` → 2 hits total, both `h1`. Live on `/login`: the AX role histogram is `{RootWebArea:1, StaticText:19, button:4, form:1, LabelText:2, textbox:2, link:2, alert:1}` — no heading. Same on `/app/citations`: 190 exposed nodes, no heading role. `document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role=heading]')` returns 0 on 33 of 34 routes probed live. Every visible title — page names, KPI labels, section headers, modal titles — is a styled `<div>`/`<span>`.
**Expected / Actual:** Expected one `h1` naming each screen and `h2`/`h3` for card and section titles. Actual: none. A screen-reader user pressing H on any page hears "no headings"; the Next.js route announcer only reads `document.title`, so the title tag is the only orientation cue that exists.
**Auditor conflict, resolved:** the SEO auditor parsed saved HTML and reported that all 35 `/app/*` routes each carry exactly one `h1` while all 33 public routes carry zero. That `h1` is `SmallScreenGate.tsx:119` — the hidden "Built for a wide screen" interstitial, present in every dashboard page's SSR HTML with inline `display:none`. It is not a page title. Both auditors are describing the same repo; the correct reading is that **no route has a usable heading**, and the dashboard's inversion is an artifact of a hidden element.
**Why it matters:** WCAG 2.4.6 (AA) and 1.3.1 (A). With no headings and no landmarks (next finding — same root cause: frames converted verbatim as unsemantic divs) there is literally no structure to navigate by, across 60+ routes. It is also an SEO and AEO defect: headings are the primary on-page structure signal for crawlers and for the answer engines this product exists to optimize for, so an AEO platform whose own marketing site is structurally unreadable to answer engines is the first thing a technical buyer checks. Any enterprise buyer asking for a VPAT fails the product on this alone.
**Fix:** A heading pass per route group, keeping the existing inline styles so nothing shifts visually. Dashboard: the Topbar crumb's last segment becomes the page `h1`; card and section titles become `h2`/`h3`. Marketing: the hero headline on each page becomes `h1`, section titles `h2`. Auth: "Welcome back" / "Create your account" become `h1`. Enforce with an `eslint-plugin-jsx-a11y` rule or a build check that every route renders exactly one `h1`. **(1.5–2 days — mechanical, but touches ~64 route files)**
**Confidence:** high.

### [P1 · missing] No `<main>`, no landmarks on marketing at all, and no skip link — 11–16 tab presses to reach content on every page

**Where:** `app/layout.tsx`, `app/(marketing)/layout.tsx:11-20`, `app/(dash)/app/layout.tsx`, `app/(auth)/layout.tsx:5-23`. `grep -rn "<main" app components` → 0 hits.
**Steps:** On `/`, `document.querySelectorAll('header,nav,main,footer,aside,[role=banner],[role=main],[role=contentinfo],[role=navigation]')` → **empty array**. The marketing nav is `<div className="mkt-nav">` with `<span>` wrappers (`Nav.tsx:121,157`) and the footer is a div. On `/app/overview` the same query returns exactly one node: `<nav aria-label="Main">` (the sidebar). Tab from page load: the first stop inside page content is **tab #11** on `/` (logo + 7 section links + Log in + Get a demo first) and **tab #16** on `/app/overview`. No skip link exists on any route.
**Expected / Actual:** Expected `<main id="main">` in all three layouts, `<header>`/`<footer>` on marketing, and a visually-hidden "Skip to content" link as the first tab stop. Actual: zero landmarks on the whole marketing site, one nav on the dashboard, no bypass mechanism anywhere.
**Why it matters:** WCAG 2.4.1 Bypass Blocks is Level A — a baseline failure, not a polish item, and it costs every keyboard or switch user 11–16 redundant presses per page. Note the dashboard sidebar *does* get `aria-label="Main"` and `aria-current="page"` right, so the pattern is understood, just not applied.
**Fix:** Wrap `{children}` in `<main id="main">` in each layout; change the marketing shell's nav div to `<header><nav aria-label="Main">…</nav></header>` and the footer div to `<footer>`; add `<a href="#main" class="skip">Skip to content</a>` as the first child of `<body>` with an off-screen/`:focus` rule in `globals.css`. **(4 hours)**
**Confidence:** high.

### [P1 · broken] No dialog traps or restores focus — including the ⌘K palette, and the report wizard is unreachable by keyboard from its own trigger

**Where:** all 12 `role="dialog"` nodes: `components/app/CommandK.tsx:112-120`, `components/app/AddBrandModal.tsx:80`, `app/(dash)/app/prompts/AddPromptsModal.tsx:33,106-108`, `prompts/CreateActionModal.tsx`, `prompts/RunHistoryModal.tsx`, `citations/ExportModal.tsx:50-53,111`, `reports/ReportWizardModal.tsx:141-152`, `insights/audiences/NewSegmentModal.tsx:72`, `components/app/AccountMenu.tsx:27-41`, `components/app/BrandSwitcher.tsx`, `components/app/SupportChat.tsx`. *Three findings from three auditors merged.*
**Steps, measured per dialog:** **⌘K** — opens and focuses its input (correct); Tab 5× reaches "Open support chat" *outside* the dialog; Shift+Tab from the input goes straight to a page link; Escape closes and leaves `document.activeElement` on `BODY`. **Citations Export** — focus moves to Close (correct), Tab 8× leaves the dialog into the page's Hint buttons, Escape leaves focus on `BODY`, **and the backdrop does not close it** (verified at two separate corner coordinates — the only one of the six that ignores backdrop clicks). **Add prompts** — focus is never moved in (activeElement stays `BODY`); Tab escapes at stop 6; 56 focusables reachable outside. **Add a brand** — 7 focusables inside, 38 outside, focus escapes to the sidebar. **New segment** — 5 in / 38 out. **Report wizard** — opens but focus stays on the topbar trigger, and **14 consecutive Tab presses never enter the dialog at all**, because the modal is rendered after the page body in DOM order. In all cases `aria-modal="true"` is set, `document.body.inert` is false, and no sibling carries `inert` or `aria-hidden`.
**Expected / Actual:** Expected `aria-modal="true"` to be honored — focus moves in on open, Tab cycles within, Escape returns focus to the trigger. Actual: no dialog cycles focus, two of the four measured in depth do not move focus in at all, one is unreachable by keyboard entirely, and both that do take focus dump it on `<body>` on dismiss.
**Why it matters:** WCAG 2.4.3 (A) and 2.1.2. `aria-modal="true"` is a promise to assistive tech that the rest of the page is unavailable, and nothing here honors it — so focus moves into a page dimmed under a backdrop and nothing announces that a dialog opened. Every create/edit path in the product (Add brand, Add prompts, New segment, Export, Create action, Run history, Report wizard) is uncompletable by keyboard alone. The marketing hamburger sheet (`Nav.tsx:101-118`) already implements focus-in, Escape and focus-restore correctly, so the pattern exists in the codebase — it was simply never shared.
**Fix:** One `useDialog(ref, {open, onClose, returnFocusTo})` hook — store `activeElement`, focus the first tabbable node, keydown-capture Tab to wrap at the boundaries, set `inert` on the app shell, restore focus and clear `inert` on close — applied to all 12, replacing each hand-rolled Escape effect. Give `ReportWizardModal` the same hook so DOM order stops mattering, and add the missing backdrop `onClick` to `ExportModal`. Prefer native `<dialog>` + `showModal()` where the markup allows. **(1 day)**
**Confidence:** high.

### [P1 · broken] Marketing nav dropdowns are mouse-hover only — `aria-expanded` advertises a control keyboard can never expand, and 4 marketing pages have no other inbound link

**Where:** `components/marketing/Nav.tsx:157-181` (`onMouseEnter`/`onMouseLeave` on the wrapping `<span>`, no `onFocus`/`onKeyDown`) and `:167` (`aria-expanded` on the `<Link>`). Affects the `/product/*`, `/solutions/*`, `/industries/*` and `/resources/*` menus at ≥901px.
**Steps:** Load `/` at 1440px, Tab twice to the "Product" link. `document.activeElement.getAttribute('aria-expanded')` → `"false"`, and `document.querySelector('.dd-item')` → `null`. ArrowDown, Enter and Space do nothing. Dispatch `mouseenter` on the same wrapper: 6 `.dd-item` links appear and `aria-expanded` flips to `"true"`. Reachability: fetching all 17 keyboard-reachable marketing pages and grepping their SSR HTML shows `/industries/ecommerce`, `/industries/fintech`, `/industries/healthcare` and `/industries/travel` appear in **no** page's HTML except the hover-only dropdown (the footer covers only `/industries/b2b-saas`).
**Expected / Actual:** Expected the section trigger to open on Enter/Space/ArrowDown and close on Escape, or not to claim `aria-expanded` at all. Actual: `aria-expanded="false"` is announced as "collapsed" on a control with no expand path, and four live marketing routes are unreachable by keyboard at desktop widths.
**Why it matters:** WCAG 2.1.1 (A), 2.4.5 (AA), 4.1.2 (A). The mobile hamburger sheet below 900px does list every dropdown item, so this is desktop-only — which is where nearly all traffic to a B2B marketing site lands.
**Fix:** Make the section a real disclosure: keep the `<Link>` for navigation and add a sibling `<button aria-expanded aria-controls>` carrying the caret, opening on click/Enter/Space plus focus-within and closing on Escape with focus restored — the mobile sheet at `Nav.tsx:101-118` already does exactly this, so reuse that effect. Independently, add the four missing industry pages to the footer's Industries column so they are never dropdown-only. **(4 hours)**
**Confidence:** high.

### [P1 · inconsistent] White text on the accent purple is 3.33:1 in 41 places — the repo's own CSS documents this exact value as the bug it fixed

**Where:** 41 occurrences across 33 files, contradicting `app/globals.css:60-61`. Examples: `pricing/PricingTiers.tsx` ("Annual", "MOST POPULAR"), `prompts/PromptDetail.tsx:24` (active platform tab), `prompts/PromptsBody.tsx:45` (checked checkbox ✓), `citations/CitedDomainsCard.tsx:67`, `citations/watched/Controls.tsx:25`, `insights/regions/ByRegionTable.tsx:52`, `insights/sentiment/ThemesTable.tsx:55`, `agents/referrals/ReferringPlatformCard.tsx:19`, `demand/keyword/ExactPhraseToggle.tsx:15`, `demand/keyword/PlatformCheck.tsx:24`, `actions/92/ChecklistStep.tsx:23`, `reports/ReportBuilder.tsx:271`, `reports/ReportWizardModal.tsx:165`, `citations/ExportModal.tsx` (×3), `customers/CustomerStories.tsx`, `app/(marketing)/page.tsx` (×3). *Reported by both the UX and accessibility auditors — merged; the 41-site count is the more thorough of the two.*
**Steps:** Read `globals.css:60-61`: *"Audit fix A2: primary buttons use a dark label on accent (5.77:1) instead of white (3.33:1). `.btn-ac` is the canonical primary button treatment."* The fix was applied to `.btn-ac` only. `grep -rn 'color: *"#fff"' app components | grep 'var(--ac)'` → 41 lines across 33 files. Measured live by compositing real computed colours against real backdrops: `/` → "Export", "Export 1,284 citations" both **3.33**; `/pricing` → "Annual", "MOST POPULAR" 3.33; `/customers` → "All industries" 3.33; `/app/prompts` → "ChatGPT" tab and the "✓" glyph 3.33. Arithmetic: `#ffffff` on `#8E7CF2` = 3.33:1; `#0e0f11` on the same = 5.77:1.
**Expected / Actual:** Expected every label on `--ac` to use the dark treatment `.btn-ac` already codifies. Actual: only `.btn-ac` got it; every active segment pill, tab, badge and checked-checkbox glyph still paints white at 3.33:1, below the 4.5:1 AA floor for text under 18.66px.
**Why it matters:** WCAG 1.4.3 (AA), and it is the flagged "implemented inconsistently" case — the codebase asserts in a comment that a specific ratio was fixed and 41 sites still ship the pre-fix value. In every one of these patterns the accent fill marks the *currently selected* option, so the one label a user most needs to read is the least legible, and the inconsistency is visible side by side (dark Export label, white active tab, same purple).
**Fix:** Add `--on-ac: #0e0f11` in `globals.css` plus a `.seg-on { background: var(--ac); color: var(--on-ac); }` class, and replace the 41 inline `color:"#fff"` declarations that sit alongside `background:"var(--ac)"`. Mechanical, no layout change. Add a lint rule or CI grep so `#fff` next to `var(--ac)` fails the build. **(4 hours)**
**Confidence:** high.

### [P2 · broken] Prompt table rows are click-only divs — 70 Tab presses never reach one, so the prompt detail panel is keyboard-unreachable

**Where:** `app/(dash)/app/prompts/PromptsBody.tsx:98-104`.
**Steps:** `[...document.querySelectorAll('.row-hover')]` → 8 rows, 0 with `tabIndex >= 0`, 0 with a role, computed cursor `pointer`. Source line 99-103 is `<div className="row-hover" onClick={…} style={{…cursor:"pointer"}}>` — no role, no tabIndex, no onKeyDown. Blur, then press Tab 70 times: focus never lands on a `.row-hover`. The nested checkboxes (`role="checkbox"`, correctly implemented) *are* reachable; the row is not.
**Expected / Actual:** Expected the row to be activatable with Enter or Space, as it is with a mouse. Actual: keyboard and switch users cannot open the prompt detail panel or trigger any row.
**Why it matters:** WCAG 2.1.1 (A) and 4.1.2. Narrow rather than systemic — a React-fiber scan across 34 routes for onClick handlers on non-native, non-roled, non-tabbable elements found *exactly* these 8 rows and nothing else — which makes it a cheap, high-value fix on the primary drill-down of a core Monitor screen.
**Fix:** Change the wrapper to `<button type="button">` retaining `display:grid`, or keep the div and add `role="button" tabIndex={0}` plus an onKeyDown for Enter and Space. The nested checkbox buttons already call `e.stopPropagation()`, so nesting stays safe with `role=button`. **(30 minutes)**
**Confidence:** high.

### [P2 · missing] Every data table is a grid of divs — screen readers get an unassociated stream of numbers with no column context

**Where:** `app/(dash)/app/prompts/PromptsBody.tsx:91-112`, `app/(dash)/app/citations/*`, and the same `display:grid` + `gridTemplateColumns` pattern across ~15 dashboard screens. `grep -rn "<table" app` → the dashboard renders none.
**Steps:** Dump the AX tree for `/app/citations`. Role histogram for the whole page: `{RootWebArea:1, navigation:1, button:25, StaticText:149, link:12, image:1, alert:1}` — **zero** `table`, `row`, `columnheader`, `rowheader` or `grid` roles. The Cited-domains table serialises as a flat run: "DOMAIN", "TYPE", "CITATIONS", "SHARE", "Δ 30D", then "runnersworld.com", "EDITORIAL", "248", "19.3%", "↑ 41", … with no relationship between header and cell.
**Expected / Actual:** Expected `<table>` with `<th scope="col">` so a screen-reader user hears "Citations, 248" rather than a bare "248", or ARIA roles on the existing grid divs. Actual: an unpunctuated list of 149 text fragments; the user must remember column order to interpret any number.
**Why it matters:** WCAG 1.3.1 (A). For a product whose entire value proposition is tables of AEO metrics, this is the difference between usable and unusable for a blind analyst, and it is what a procurement accessibility review tests first. Distinct from the headings finding: even with headings added, the tables remain unreadable.
**Fix:** Cheapest path preserving the pixel layout: keep the divs and add `role="table"` / `role="row"` / `role="columnheader"` / `role="cell"` (CSS `display:grid` does not conflict with these roles). Better: a real `<table>` with `display:grid` on `<tbody>`/`<tr>`. Do it once in a shared `<DataTable>` and swap the ~15 hand-rolled grids over. **(1.5 days)**
**Confidence:** high.

### [P2 · broken] Ten inputs have no focus indicator, and the login password box looks permanently focused

**Where:** inline `outline:"none"` in 10 files: `app/(auth)/login/LoginForm.tsx:110`, `app/(marketing)/SnapshotForm.tsx:58`, `app/(marketing)/demo/DemoForm.tsx:84`, `components/app/CommandK.tsx:128`, `components/app/SupportChat.tsx:151`, `app/(dash)/app/assets/AssetsBody.tsx:73`, `app/(auth)/onboarding/brand/BrandField.tsx:36`, `components/app/AddBrandModal.tsx:25`, `app/(dash)/app/settings/workspace/page.tsx:40`, `app/(dash)/app/insights/audiences/NewSegmentModal.tsx:131`. Plus `LoginForm.tsx:101` (unconditional accent border). *Reported by both the UX and accessibility auditors — merged.*
**Steps:** Tab through `/login` reading `getComputedStyle(document.activeElement)` at each stop: Continue with Google → `solid 2px rgb(142,124,242)`; SSO → same; Email → same; **Password → `none`**; Show → solid 2px; Log in → solid 2px. Cause: `globals.css:47-58` sets the ring via `input:focus-visible`, but an inline `outline:"none"` outranks any selector. Separately, `getComputedStyle(passwordWrapper).borderTopColor` at rest is `rgb(142,124,242)` — the accent — while the email field is `rgba(255,255,255,0.067)`, because `LoginForm.tsx:100` is `error ? var(--bad) : var(--ac)` unconditionally.
**Expected / Actual:** Expected the documented 2px accent ring on every focusable control (`globals.css:47` calls this "Audit fix A3: focus visibility — all interactive elements"), and a resting field not painted in the focus colour. Actual: 10 inputs show no indicator — including the password field on the one screen every client passes through, the homepage lead-capture field and the single onboarding field — while the password box shows a permanent false-focus border.
**Why it matters:** WCAG 2.4.7 (AA) plus a false affordance. A keyboard user cannot tell which field they are typing into on the first screen a customer ever sees. Another "documented fix defeated by leftover inline declarations" case: the global rule demonstrably works everywhere else.
**Fix:** Delete the ten inline `outline:"none"` declarations. For the three composite wrappers whose inputs are borderless by design (login password, snapshot form, command palette), add `:focus-within{outline:2px solid var(--ac);outline-offset:2px}` on the wrapper instead, and change `LoginForm.tsx:101` so the wrapper border is `var(--brd)` at rest, `var(--ac)` on focus-within and `var(--bad)` on error, matching the email field. **(3 hours)**
**Confidence:** high.

### [P2 · broken] Toasts are never announced — the live region is created at the same instant as its text

**Where:** `components/ui/Toaster.tsx:26` (`if (!msg) return null;`) then `:28` (`<div role="status">`). Mounted in all three layouts. `grep -rn 'aria-live' app components` → 0 hits.
**Steps:** On `/app/prompts` before any action: `document.querySelectorAll('[role="status"],[aria-live]').length` → **0**; there is no live region in the document. Click "Assign topic" in the bulk bar, re-query → one node appears with `role:"status"`, `live:null` and the message text. Region and content entered the DOM in the same commit.
**Expected / Actual:** Expected an empty `<div role="status" aria-live="polite">` present from first paint, with only its text content changing — which is what NVDA/JAWS/VoiceOver need to announce. Actual: the region is mounted together with its text, so assistive tech that snapshots live regions at load has nothing to observe and the announcement is dropped or unreliable.
**Why it matters:** WCAG 4.1.3 (AA), and it matters more here than in most apps: toasts are this demo's entire feedback vocabulary — "needs a live workspace", export confirmations, "Select prompts first — nothing to export". A screen-reader user pressing those buttons gets silence and cannot tell whether anything happened.
**Fix:** Render the Toaster wrapper unconditionally with `role="status" aria-live="polite" aria-atomic="true"` and visually-hidden-when-empty styling, swapping only the inner text; use `role="alert"`/`assertive` for error toasts. ~10 lines. **(30 minutes)**
**Confidence:** medium — inferred from the AX tree and DOM timing; no screen reader was driven.

### [P2 · broken] Checkbox and help-dot boundaries are 1.16–1.19:1 — an unchecked checkbox is effectively invisible

**Where:** `components/ui/Hint.tsx:79` (`border: 1px solid var(--brd)` on a transparent 13px circle, used on essentially every metric on every dashboard screen); `prompts/PromptsBody.tsx:46` (unchecked 14×14 checkbox); `citations/ExportModal.tsx`; outline segment buttons on `/app/citations`, `/app/insights/sentiment`, `/demo`, `/customers`. Token: `globals.css:10` `--brd: rgba(255,255,255,0.065)`.
**Steps:** Measured live by compositing the computed border colour over the composited backdrop. `/app/prompts` select-all and per-row checkboxes: **1.16:1**. Hint buttons and outline segment buttons on `/app/overview`, `/app/citations`, `/app/agents`, `/app/actions`, `/app/settings/billing`, `/app/insights/sentiment`, `/demo`, `/customers`: **1.19:1** (1.11 on one `/app/actions` card that also carries opacity 0.65). Arithmetic: white at alpha 0.065 over `#151619` = 1.18:1; WCAG 1.4.11 requires 3.0:1.
**Expected / Actual:** Expected ≥3:1 for the boundary of any control whose shape is the only thing identifying it. Actual: roughly a fifth of the requirement — the unchecked checkbox reads as an empty gap and the (i) dot as a faint smudge.
**Why it matters:** WCAG 1.4.11 (AA). `--brd` at 0.065 alpha is correct for decorative card edges (which are exempt) but is being reused as the boundary of interactive controls, where it is not. Separate from the text-contrast findings: the text tokens themselves all pass, which is why this slipped through. It compounds badly with the target-size finding — a 12px target the user can barely see.
**Fix:** Add a second token, e.g. `--brd-ui: rgba(255,255,255,0.28)` (~3.1:1 on `--bg1`), for the borders of `Hint`, the unchecked `Checkbox` and outline/segmented buttons; leave `--brd` for dividers and card edges. One token plus ~8 component edits. **(3 hours)**
**Confidence:** high.

### [P2 · broken] Dimmed UI drops below 4.5:1 — the inert filter pill reads at 2.35–2.88:1 and the shipped-action card at 2.80:1

**Where:** `components/ui/FilterPill.tsx:148-149` (`opacity: 0.55` on the inert chip, rendered on most dashboard screens); `app/(dash)/app/actions/*` (shipped-action card at `opacity: 0.65`).
**Steps:** Measured live, compositing element opacity into the effective foreground. `/app/citations`, `/app/insights/sentiment` — inert platform pill: label "All platforms" `#9b9ca3` at 0.55 = **2.88:1** (needs 4.5 at 12px/500); the "?" affordance inside it = **2.35:1** at 8px. `/app/actions` — "Shipped Jul 22" and "Measured vs +0.4 est." = **2.80:1**; "+0.6pt" and "SHIPPED ✓" = 3.04:1; the score "64" at 14px/600 = 3.39:1.
**Expected / Actual:** Expected 4.5:1 — none of this text is 24px or 18.66px bold. Actual: 2.35–3.39:1; the opacity multiplier silently eats the headroom the tokens were tuned for.
**Why it matters:** WCAG 1.4.3 (AA), and self-defeating in the inert-pill case: `FilterPill`'s own comment (lines 27-35) explains the dimming is a deliberate honesty fix so a screen never claims a scope it does not honour — and the explanation is the least legible text on the screen. Distinct from the white-on-accent finding: that is a colour pair, this is an opacity multiplier.
**Fix:** Stop using `opacity` to express disabled/complete states. Set explicit dimmed colours — a `--mut-disabled` token computed to clear 4.5:1 on `--bg1`/`--bg2` (around `#7a7b82`) — and drop the opacity declarations at `FilterPill.tsx:148` and on the shipped-action card. Re-measure with compositing afterwards. **(3 hours)**
**Confidence:** high.

### [P2 · missing] Sub-nav tab rows convey the active tab by colour and an underline only — no `aria-current`, no `aria-selected`

**Where:** `app/(dash)/app/insights/InsightsTabs.tsx:48-59`, `agents/AgentsTabs.tsx:39-45`, the settings rail, `app/(marketing)/solutions/SolutionsTabs.tsx`, and the modal tab strip in `citations/ExportModal.tsx:112`.
**Steps:** `grep -rn 'aria-selected\|aria-current\|role="tab"' app components` → exactly 4 `aria-current` (3 in Sidebar/content-score/conversations) and exactly **1** `aria-selected`, in `overview/OverviewTrend.tsx:166` — the only correctly-built tablist in the product. `InsightsTabs.tsx:52-54`: the active tab differs from an inactive one only by `color: var(--tx)` + `fontWeight: 500` + a 2px accent bottom border — nothing in the accessibility tree. Confirmed in the `/app/citations` AX dump: the All/Owned/Earned strip exposes `aria-pressed` correctly (that one is fine), but the Insights and Agents route-tab rows expose only `link "Topics"`, `link "Regions"` with no state.
**Expected / Actual:** Expected route-based tab rows to mark the active link with `aria-current="page"` (which `Sidebar.tsx:192` already does) and in-page tab strips to use `role=tablist`/`tab`/`aria-selected` (which `OverviewTrend` already does). Actual: on Insights, Agents, Settings and the marketing Solutions strip, a screen-reader user cannot tell which tab they are on.
**Why it matters:** WCAG 1.3.1 (A) and 1.4.1 Use of Colour (A). The correct pattern already exists twice in this codebase, so this is unfinished rather than hard.
**Fix:** Add `aria-current={active ? "page" : undefined}` to the `<Link>` in each tab component — one line each, since `active` is already computed. For the in-modal strip, make the three tabs `role="tab"` inside a `role="tablist"` with `aria-selected`, mirroring `OverviewTrend.tsx:157-166`. **(2 hours)**
**Confidence:** high.

### [P2 · risky] Help affordances are 11–13px targets — 12 to 29 controls per dashboard screen fall under the 24×24 minimum

**Where:** `components/ui/Hint.tsx:76-77` (`width/height = size`, default 13, passed as 11 in table headers); `prompts/PromptsBody.tsx:45-46` (14×14 checkbox); `components/app/BrandSwitcher.tsx` collapse control (22×22).
**Steps:** `getBoundingClientRect` on every button/link/input/`role=button`/checkbox/switch at 1440px, excluding `display:inline`. `/app/prompts`: **29** controls under 24px — 10 checkboxes at 14×14, 4 Hints at 11×11, 7 more at 12×12, plus 4×17 and 7×17 pager buttons. `/app/citations`: 15. `/app/overview`: 14 (12 Hints at 13×13). `/app/settings/team`: 9, including four "Remove" buttons at 44×17.
**Expected / Actual:** Expected the 24×24 CSS-px minimum (WCAG 2.2 AA 2.5.8) or an equivalent spacing offset. Actual: 11–14px for the app's single most-repeated control, the (i) help dot — which is simultaneously the lowest-contrast element on the page.
**Why it matters:** Lower severity than the keyboard failures because the dashboard is a mouse-driven desktop surface, but it affects anyone with a tremor or imprecise pointing, and it compounds with the near-invisible border. The Hint buttons *are* keyboard-focusable and correctly labelled, so this is purely pointer ergonomics.
**Fix:** Keep the painted dot but give the button a 24×24 hit area — `width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center` with the visible circle as an inner span, plus a negative margin so layout is unchanged. Same for the Checkbox and the 17px-tall inline action buttons. **(3 hours)**
**Confidence:** high.

### [P2 · risky] The small-screen interstitial does not take or trap focus, and it is what a desktop user at 200% browser zoom gets

**Where:** `components/app/SmallScreenGate.tsx:64-67` (`role="dialog"` with no `aria-modal` and no focus management); `components/app/small-screen-gate.css` (reveals at `max-width: 899px`).
**Steps:** Emulate a 720px CSS viewport — exactly what a 1440px laptop reports at 200% browser zoom — and load `/app/overview` signed in. `getComputedStyle('.ssg').display` → `flex`; the card reads "Built for a wide screen". `.ssg.getAttribute('aria-modal')` → **null**, and no sibling carries `aria-hidden` or `inert`. Press Tab six times: **every stop is behind the gate** — brand switcher, collapse button, sidebar links — none visible, because the gate covers them at z-index 200. Focus is never moved into the gate.
**Expected / Actual:** Expected the element that declares itself a dialog to behave like one — `aria-modal="true"`, focus in the card, Tab confined to "Continue anyway" / "Back to answr.io", the dashboard behind marked `inert`. And a user zooming to 200% on a normal laptop should not be locked out at all. Actual: keyboard focus walks invisible controls under a full-screen overlay, and 200% zoom on any display up to ~1798px wide trips the gate.
**Why it matters:** WCAG 1.4.4 Resize Text (AA) for the zoom half, 2.4.3/4.1.2 for the focus half. The desktop-only dashboard itself is documented as intentional and is **not** reported here; what the carve-out does not cover is (a) zoom being treated as a small screen — 1.4.4 is about zoom, not device width — and (b) the interstitial's own focus behaviour, which is a plain bug regardless of the product decision.
**Fix:** Two independent changes. Focus: add `aria-modal="true"`, move focus to the heading or primary button when visible, apply the shared focus-trap hook, and set `inert` on the dash shell while it shows. Zoom: switch the media query from `max-width` in px to a coarse-pointer or `em`-based test (e.g. `@media (max-width: 56em) and (pointer: coarse)`) so a zoomed desktop keeps the dashboard. **(4 hours)**
**Confidence:** medium — the zoom equivalence is inferred from CSS-viewport arithmetic, not from a real zoomed browser session.

### [P3 · missing] Charts expose `role="img"` with a label that carries no data

**Where:** `components/app/charts/BarChart.tsx:64` (`aria-label="Bar chart"`), `charts/TrendChart.tsx:103` (`aria-label={`Trend chart: ${series labels}`}`). `components/ui/Sparkline.tsx:42` is correctly `aria-hidden`.
**Steps:** `grep -n 'role="img"\|aria-label' components/app/charts/*.tsx`. BarChart's entire accessible name is the literal "Bar chart"; TrendChart's is series names only — no values, no range, no direction. Confirmed in the `/app/citations` AX tree: one `image` node with no data beneath it.
**Expected / Actual:** Expected a short text alternative stating the takeaway and range ("Visibility trend, Jul 8 to Aug 6: 29.4% rising to 34.2%"), or an adjacent visually-hidden data table. Actual: the user learns a chart exists and nothing about what it shows.
**Why it matters:** WCAG 1.1.1 (A). P3 rather than higher because the numbers behind most charts are also printed as KPI text nearby, so the information is not entirely lost — unlike the data tables, where it is.
**Fix:** Build the label from the data the chart already receives: series name, first and last value with dates, min/max. Two components, one templated string each. **(2 hours)**
**Confidence:** high.
---

### 3.6 Responsive behaviour and performance

The desktop-only dashboard is documented as intentional and is not reported as a defect. What follows is the band the carve-out does not cover (900–1418px, above the interstitial), plus payload and polling items.

### [P1 · broken] The dashboard forces a horizontal page scrollbar on any laptop narrower than ~1418px, including 1366 and 1280

**Where:** `/app/insights`, `/app/overview`, `/app/insights/{audiences,regions,sentiment,shopping}`, `/app/demand/keyword`, `/app/agents/referrals` — root cause `components/app/charts/TrendChart.tsx:103`.
**Steps:** Sign in, set the viewport to 1366×820 (or 1280×800) and open `/app/insights`. A horizontal scrollbar appears; scrolling right cuts off the sidebar labels ("wer Engine Insights", "tions 1,284") with dead space on the right.
**Expected / Actual:** Expected `document.scrollWidth <= clientWidth` at every desktop width the dashboard claims to support. Actual at 1366 (clientWidth 1351): `scrollWidth` 1418 on `/app/insights` = 67px of horizontal scroll, 1372 on `/app/overview` = 21px. At 1280: **8 of 35** dashboard routes overflow, by 92–138px. At 1024: **10 of 35**, by up to 394px. Only 1440 is clean (0/35).
**Why it matters:** `TrendChart` measures its container with a ResizeObserver and then renders `<svg width={W} …>`; the numeric width **attribute** sets the grid item's min-content, so the `1fr` column can never shrink below the initial `width` prop (690 on Insights, 700 on referrals/keyword, 656 on Overview). At 1280 the grid computes to `766px 380px` instead of `1fr 380px`. Proven live: removing the width attribute from the large SVGs dropped `document.scrollWidth` from 1418 to exactly 1280. This is the 900–1366 band — above the interstitial, so it gets no protection at all, and 1366 and 1280 are the two most common business-laptop widths.
**Fix:** In `TrendChart.tsx:103` drop the numeric width attribute and render `<svg viewBox={"0 0 " + W + " " + height} width="100%" height={height} style={{display:'block'}}>`; add `min-width:0` to the chart wrapper so the ResizeObserver can report a shrinking container. Re-check `components/app/RegionMap.tsx:96`, which uses the same pattern. Then re-run the 900/1024/1280/1366 sweep targeting `scrollWidth == clientWidth` on all 35 routes. **(4 hours)**
**Confidence:** high.

### [P2 · inconsistent] `SmallScreenGate` cuts off at 899px but the dashboard needs ~1420px, so 900–1023px gets neither the interstitial nor the scroll container

**Where:** `components/app/small-screen-gate.css:18` (`@media max-width:899px`) and `:31` (`.dash-main{overflow-x:auto}`, scoped *inside* that block); worst non-chart routes `/app/settings`, `/app/workflows`, `/app/actions`, `/app/settings/api-keys`, `/app/settings/workspace`, `/app/reports`.
**Steps:** Sign in, set the viewport to exactly 900×900, open `/app/settings`. No "Built for a wide screen" card appears (the query stops at 899) and `.dash-main` is not a scroll container above 899, so the whole document scrolls sideways.
**Expected / Actual:** Expected that at any width the dashboard cannot honour, the user gets either the interstitial or contained scrolling inside `.dash-main`. Actual at 900px, **15 of 35** dashboard routes push the *document* sideways — `/app/settings` 1030 (over by 130), `/app/workflows` 1000, `/app/actions` 991, `/app/settings/api-keys` 984, `/app/settings/workspace` 940, `/app/reports` 925, plus the chart-driven ones. At 1024, `/app/settings` still overflows by 6px.
**Why it matters:** Both the reveal rule and the containment rule live inside the same `max-width:899px` block, so the moment the gate stops applying the containment stops too. The gate's own comment says the design is a 1440px handoff — the threshold is ~520px below that. Distinct from the TrendChart bug: these six routes have no wide chart and overflow purely on their own fixed-width layout.
**Fix:** (1) Move `.dash-main{overflow-x:auto; overscroll-behavior-x:contain}` out of the media query so containment is unconditional. (2) Raise the gate breakpoint to the real minimum usable width (~1200px once the TrendChart fix lands, ~1440px before it) or state the supported minimum on the card. Verify by re-running the 35-route sweep at 900/1024. **(4 hours)**
**Confidence:** high.

### [P2 · broken] Auth and onboarding controls are 10–20px tall on phones — they sit outside the marketing tap-target rule

**Where:** `app/(auth)/onboarding/competitors/CompetitorPicker.tsx:92-97`; `app/(auth)/login/LoginForm.tsx:112`, `:126`; the "← Back" links on all three onboarding steps.
**Steps:** At 375×812, open `/onboarding/competitors` and try to tap the ✕ that removes "Adidas". Then open `/login` and try to tap "Show" inside the password field.
**Expected / Actual:** Expected ≥40px tap targets. Measured: the ✕ remove buttons are **9.9 × 13 px** (three of them); "Show" is 31.6 × 18; "Forgot password?" is 101.5 × 18; "← Back" is 48 × 19.5; the Suggested chips are 32px tall; "Continue →" is 39.5px. Marketing, by contrast, has exactly one sub-40px control across all 28 routes.
**Why it matters:** The 40px floor lives in `components/marketing/marketing.css:241-242`, scoped to `.mkt [class*="frame-"]`. The `(auth)` layout never sets `.mkt`, so no rule reaches these screens — and `/login` is the mobile entry point to the entire product, linked from the mobile nav sheet, while `/onboarding/*` is public.
**Fix:** `CompetitorPicker.tsx:96` — replace `padding:"0"` with `padding:8px; margin:-8px` (keeps the visual position, gives a 26px+ box) or set an explicit 40×40 with a centred glyph. `LoginForm.tsx:112` — `padding:10px 8px; margin:-10px -8px`. Give "Forgot password?" and "← Back" `display:inline-flex; min-height:40px; align-items:center`. Alternatively add an `.auth` scope to the auth layout and mirror the marketing rule. **(3 hours)**
**Confidence:** high.

### [P2 · risky] Every Answer Engine Insights tab downloads a 50.7KB world-atlas chunk it never renders

**Where:** `components/app/RegionMap.tsx:15` (`import world from "world-atlas/countries-110m.json"`); routes `/app/insights`, `/app/insights/{sentiment,audiences,shopping}`.
**Steps:** Load `/app/insights` with cache disabled. Chunk `0ce3e9u94ls4r.js` arrives at 50.7KB brotli / 136.7KB raw. It is not referenced in the served document — it is pulled by Next's `<Link>` prefetch of the Regions tab.
**Expected / Actual:** Expected the choropleth payload only on the one route that draws a map. Actual: it is fetched on four sibling tabs that render no map. For scale, it is the single largest non-framework asset in the app (the React/Next runtime chunk is 73KB br) and it exists to colour **8** country IDs. Whole-page on `/app/insights`: 165KB initial JS + 223KB prefetched + 85KB RSC across 34 fetches ≈ 473KB per view, vs 142 + 25 + 62KB on the marketing homepage.
**Why it matters:** `countries-110m.json` is imported at module scope in a client component, so it is inlined into that component's chunk and cannot be code-split away. The build gives no signal either — Next 16.3 + Turbopack no longer prints the per-route size table.
**Fix:** `const RegionMap = dynamic(() => import("@/components/app/RegionMap"), { ssr: false })` in the regions page so the chunk is fetched only when the map mounts. Better: pre-bake the ~50 country paths actually drawn, or use `land-110m` (55KB), instead of shipping the full topology. **(3 hours)**
**Confidence:** high.

### [P3 · inconsistent] A single "Δ" glyph pulls a 19.3KB Greek font subset on ~20 routes

**Where:** `app/(dash)/app/insights/HeatCell.tsx:77` ("Δ 30d"); also `/app/overview`, `/app/citations`, `/app/insights/regions`, `/product/answer-engine-insights` — 26 source files contain the character.
**Steps:** Load `/app/overview` with the network panel filtered to Font. Two files arrive: the preloaded 48.7KB latin subset and `5476f68d60460930-s.woff2` at 19.3KB with `unicode-range U+370-377,U+37A-37F,…` — Greek. Scanning the served HTML for U+0370–U+03FF finds exactly one character per page: Δ (U+0394).
**Expected / Actual:** Expected one font file per page (`subsets: ["latin"]` in `app/layout.tsx:6`). Actual: two — 19.3KB of Greek Inter to draw one delta symbol.
**Why it matters:** `next/font` emits a separate `@font-face` per Google subset with a `unicode-range`; U+0394 is outside latin, so the browser fetches the Greek file. Adding `greek` to `subsets` would make it worse — it would then be preloaded.
**Fix:** Replace Δ with a glyph inside the latin subset — U+2191/U+2193 (↑ ↓) are explicitly in its range and already used in the same cards — or with "chg", or an inline SVG triangle. 26 files, mechanical. **(1 hour)**
**Confidence:** high.

### [P3 · inconsistent] `/public` assets ship `max-age=0, must-revalidate`

**Where:** `next.config.ts` (empty config, no `headers()`); `/logos/mty-food-group.svg`, `/logos/bell.svg`, `/favicon.ico`.
**Steps:** `curl -sI https://useanswr.com/logos/mty-food-group.svg` → `cache-control: public, max-age=0, must-revalidate`. Re-requesting with the returned ETag yields 304, 0 bytes. Both logos are `<link rel="preload" as="image">` in the homepage head, so they are high-priority on every load.
**Expected / Actual:** Expected long-lived caching for brand marks that never change, matching `/_next/static` (`public, max-age=31536000, immutable`). Actual: three conditional requests per homepage navigation, ~1 RTT each (~150ms on a 3G-class link) even though every response is a 304.
**Why it matters:** Next's default for `/public`. The assets themselves are fine — the 10.7KB SVG compresses to 2.7KB on the wire — so the cost is round-trips, not bytes.
**Fix:** Add a `headers()` entry for `/logos/:path*` and `/favicon.ico` with `Cache-Control: public, max-age=31536000, immutable` (version the filename when a mark changes). Leave `/snippet.js` short-lived — customers embed it. **(30 minutes, same change as the security-headers finding)**
**Confidence:** high.

### [P3 · risky] `/app/live` polls every 10s forever and never pauses on a hidden tab

**Where:** `app/(dash)/app/live/LiveTelemetry.tsx:217`.
**Steps:** Open `/app/live`, switch to another tab, watch the network panel — GETs to `/api/telemetry` keep firing on a 10s interval indefinitely.
**Expected / Actual:** Expected polling to stop or back off when `document.visibilityState !== 'visible'`. Actual: `setInterval(load, 10_000)` with `cache: "no-store"` runs for the life of the tab — ~8,640 serverless invocations per 24h for one forgotten tab. `grep -rn "visibilitychange|visibilityState|document.hidden" app components lib` returns nothing; no visibility gating exists anywhere.
**Why it matters:** Serverless cost and battery drain rather than a rendering problem — but `/app/live` is the one screen advertised as real-time, so it is the one people leave open.
**Fix:** Wrap `load()` in a `visibilityState === "visible"` check and add a `visibilitychange` listener firing one immediate refresh on re-show; optionally back off to 30s after N idle cycles. **(30 minutes)**
**Confidence:** high.

### [P3 · broken] The dashboard topbar does not join the small-screen horizontal-scroll strategy

**Where:** `components/app/Topbar.tsx:83` with `components/app/small-screen-gate.css:31`; reproduced on `/app/overview` and `/app/insights`.
**Steps:** At 375×812, open `/app/overview`, tap "Continue anyway", then scroll the content right.
**Expected / Actual:** Expected the header row to scroll with the body. Actual: the topbar shrinks to the 319px column — "Last 30 days · vs prev" wraps to four lines and "All platforms" to two, crowding the crumb — while the body keeps a 1,140px scroll width, so scrolling right leaves an empty header band above the content.
**Why it matters:** `.dash-main{overflow-x:auto}` makes the column the scroll container, so the topbar's flex row shrinks while the body sets the scroll width. The general below-900px degradation is documented intent and genuinely degrades safely (document `scrollWidth` stayed 375 on all 12 routes tested), but the header is the first thing a visitor sees after continuing.
**Fix:** Inside the existing `@media (max-width:899px)` block, add `min-width: max-content` to the Topbar root so the header scrolls in lockstep with the body. **(30 minutes)**
**Confidence:** high.

### [P3 · broken] CLS 0.197 on the first cold dashboard load at phone widths

**Where:** `components/app/Sidebar.tsx:70-80`; measured on `/app/overview`.
**Steps:** 390×844 with 4× CPU throttling and 1.6 Mbps / 150ms RTT, cold load with a `PerformanceObserver` on `layout-shift` registered at document start.
**Expected / Actual:** Expected CLS ≤ 0.1. Actual **0.1972**, reproducible across 3 runs, from a single shift at t≈2.6s whose source node is `DIV.dash-main` — the rail renders at 232px from SSR and drops to 56px once the effect runs. Unthrottled the effect lands before paint and CLS is 0; the 1440px desktop control is 0.0001; marketing is 0 everywhere.
**Why it matters:** `Sidebar.tsx:70` initialises `collapsed` to false and only calls `matchMedia("(max-width: 899px)")` inside `useEffect`, so the small-screen default is a post-hydration decision. Not visible to a human — the opaque interstitial covers the shift — but it is what field CWV (CrUX) records, and it becomes visible for anyone with `answr:sidebar` set to "0" from a desktop session who then opens on a phone.
**Fix:** Express the small-screen default in CSS: add a `@media (max-width: 899px)` rule pinning the rail to the collapsed width, with the stored preference applied via a data attribute stamped by the same inline boot script the gate already uses (`SmallScreenGate.tsx:33`). **(3 hours)**
**Confidence:** medium.

### [P3 · inconsistent] Possible 1px hole between the marketing nav's two media queries (900 < w < 901)

**Where:** `components/marketing/marketing.css:31` (`@media max-width:900px`) vs `:136` (`@media min-width:901px and max-width:1000px`).
**Steps:** Any layout viewport strictly between 900 and 901 CSS px — reachable via browser zoom on certain window sizes, where the layout viewport is fractional even though `window.innerWidth` reports an integer.
**Expected / Actual:** Expected exactly one of the two rules to apply at every width. Read from the CSS: at e.g. 900.5px neither matches, so the desktop nav renders at its 48px gutters / 26px gap; its measured intrinsic width is 985.3px, which would exceed the viewport by ~85px and scroll the page sideways.
**Why it matters:** The 901–1000px tightening this audit was asked to verify **does hold** everywhere measurable: 0 overflow at 895/899/900/901/905/920/950/984/985/1000/1001/1010, burger correctly on at ≤900 and off at ≥901. The boundary is the only gap. Separately and cosmetically, at 1001–1033px the nav content encroaches on its own 48px right padding (CTA right edge 985.3 vs a 953px content edge at 1001), so the CTA sits 15.7px from the viewport edge while the logo sits 48px from the left — nothing is clipped.
**Fix:** Change `min-width: 901px` to `min-width: 900.02px` (or make the burger query `max-width: 900.01px`) so the two ranges abut. **(15 minutes)**
**Confidence:** **LOW — DO NOT SPEND TIME CHASING THIS WITHOUT REPRODUCING IT FIRST.** It could not be reproduced in headless Chrome: device-metrics emulation only accepts integer widths and `--force-device-scale-factor` did not produce a fractional layout width. This is read from the CSS, not observed. The fix is a one-character change, so apply it defensively if you are already in that file; do not open an investigation for it.

---

### 3.7 SEO, metadata and link sharing

### [P1 · missing] Zero Open Graph and Twitter Card tags site-wide — no og:image, so every shared link previews as a bare URL

**Where:** all 68 routes; `app/layout.tsx` metadata export and every per-page `export const metadata`.
**Steps:** Extract head tags from all 68 routes: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`, `twitter:card`, `twitter:title`, `twitter:image` are each missing on **68/68**. Headless-Chrome render of `/`, `/customers`, `/customers/mty-food-group`, `/security`, `/pricing`, `/resources/answr-index`, `/demo`, `/app/overview` reports the complete meta key set as exactly `viewport, description, next-size-adjust` on every one. `curl /og.png` → 404; `/opengraph-image` → 404; no `opengraph-image` or `twitter-image` file convention anywhere under `app/`. `grep -rn 'openGraph|twitter:|metadataBase' app lib components` → no matches.
**Expected / Actual:** Expected a link pasted into Slack, LinkedIn, X or iMessage to render a card with a title, description and image. Actual: no tags exist and there is no image asset to serve, so scrapers fall back to the bare URL and the generic description.
**Why it matters:** Every founder-to-investor DM, every sales email and every social post of this URL renders as naked text next to competitors' cards. It is also the cheapest high-impact fix on the list — one `metadataBase` plus an `openGraph` block in the root layout covers all 68 routes by inheritance.
**Fix:** Add `metadataBase: new URL('https://useanswr.com')` plus `openGraph` (title/description/url/siteName/type/images) and `twitter` (`card: 'summary_large_image'`) to the root metadata, and add an `app/opengraph-image.tsx` or a static 1200×630 asset. Override `og:title`/`description` per page alongside the description work below. **(4 hours)**
**Confidence:** high.

### [P1 · broken] Three hostnames serve byte-identical copies of the whole site with no canonical tags — including the old `answr-ruby.vercel.app` origin, still live

**Where:** `https://useanswr.com`, `https://www.useanswr.com`, `https://answr-ruby.vercel.app`.
**Steps:** `curl -o /dev/null -w '%{http_code} %{redirect_url}' https://www.useanswr.com/` → 200, no redirect; same for `/pricing`. `curl https://answr-ruby.vercel.app/` → 200, `<title>Answr — Know what AI says about your brand · Answr</title>`, no robots meta; `/pricing`, `/security`, `/customers/mty-food-group` all 200 there too. Byte-compare the homepage: both origins serve exactly 148,069 bytes. `<link rel="canonical">` is missing on 68/68 routes, confirmed post-hydration as well.
**Expected / Actual:** Expected one canonical origin, with www and the Vercel alias 301/308ing to it, or every page declaring `rel=canonical`. Actual: three fully browsable, indexable copies of all ~33 public pages, none declaring a canonical, so a crawler has no signal which is authoritative.
**Why it matters:** The audit asked specifically whether anything still references the old preview origin. Nothing does in shipped markup (zero matches for `answr-ruby.vercel.app` and zero for `localhost:3000` across all 68 pages) — but the origin itself is still serving the complete production site, which is the more consequential version of that question. Search engines can split authority across three hostnames, and a stale Vercel URL can outrank or be shared in place of the brand domain. The gate still works on the old origin, so this is duplicate content and origin leak, not an access-control hole. http→https and trailing-slash redirects are already correct (both 308), so only these two hostnames were missed.
**Fix:** In Vercel project settings, redirect `www.useanswr.com` → apex (308) and disable or password-protect the `answr-ruby.vercel.app` alias. Independently add `alternates: { canonical: … }` per route via `metadataBase`. **(30 minutes for the domain config; 3 hours for canonical metadata)**
**Confidence:** high.

### [P1 · missing] `robots.txt` and `sitemap.xml` both return 404

**Where:** no `app/robots.ts`, `app/sitemap.ts` or `public/robots.txt` exists; `lib/gate.ts:1-13` states the dashboard must be "not browsable by direct URL **and not indexable**". *Reported by both the security and SEO auditors — merged.*
**Steps:** `curl -D- https://useanswr.com/robots.txt` → 404, `x-matched-path: /404`, serving 37,723 bytes of HTML with `content-type: text/html`. `/sitemap.xml`, `/sitemap`, `/manifest.webmanifest` → same. `curl -I 'https://useanswr.com/%61pp/overview' | grep -i x-robots` → no header; no `<meta name="robots">` on the dashboard HTML fetched that way (the marketing 404 page, by contrast, *does* carry `content="noindex"`, so the pattern works where it is used).
**Expected / Actual:** Expected `robots.txt` to exist and point at a sitemap, a sitemap listing the ~33 public routes, and `noindex` on dashboard routes per the gate's own docstring. Actual: both 404 with an HTML error page, and the dashboard carries neither a robots meta tag nor an `X-Robots-Tag`.
**Why it matters:** Two consequences. SEO: with no sitemap, discovery of the deeper marketing routes (five industries, five product, two solutions, resources) depends entirely on internal linking, and several are footer-only — while four are dropdown-only and keyboard-unreachable (§3.5). Security: this is the second layer that would have contained the gate bypass — with the percent-encoding hole, any crawler that encounters an encoded link indexes the full dashboard and nothing tells it not to. Worth fixing in the same change as the gate. Note also the irony for a product selling crawler-access diagnostics whose own action-queue example is "#87 · Unblock ClaudeBot on /help — robots.txt".
**Fix:** Add `app/robots.ts` returning `{ rules: [{ userAgent: '*', allow: '/', disallow: ['/app/','/onboarding/'] }], sitemap: 'https://useanswr.com/sitemap.xml' }` and `app/sitemap.ts` enumerating the public routes with `lastModified`. Export `metadata: { robots: { index: false, follow: false } }` from the dashboard layout so every dashboard page carries noindex regardless of how it was reached, and set an `X-Robots-Tag` on `/app` in the proxy for non-HTML cases. **(3 hours)**
**Confidence:** high.

### [P2 · missing] All 68 routes share one identical meta description

**Where:** `app/layout.tsx:14-16` — the only `description` in the codebase; no per-page metadata export sets one.
**Steps:** Extract `<meta name="description">` from all 68 routes: all 68 return the identical string ("Answr monitors what AI assistants say about your brand, traces the citations behind those answers, and turns visibility gaps into a scored action queue."). Grouping by value gives one group of 68 and zero unique descriptions. Per-page exports set only `title` — e.g. `pricing/page.tsx:11-13` is `{ title: "Pricing — Answr" }`. Even the 404 page carries it.
**Expected / Actual:** Expected each indexable page to describe its own content. Actual: `/pricing`, `/security`, `/customers`, both case studies, all five industry pages and all five product pages describe themselves to search engines with the same company boilerplate.
**Why it matters:** The description is the snippet a searcher reads before clicking, and identical descriptions across a whole site are a well-known duplicate-content signal. It also wastes the strongest differentiators the site has — the industry and product pages have genuinely distinct positioning no search result will ever show. The titles were done properly (68/68 unique, all under 60 chars), which makes this the odd gap rather than systemic neglect.
**Fix:** Add a 140–160 character `description` to each per-page metadata export, starting with the ~15 highest-intent marketing routes; keep the root default as the fallback. Batch with the Open Graph and title fixes — same files. **(4 hours)**
**Confidence:** high.

### [P2 · missing] No structured data anywhere — zero JSON-LD blocks across all 68 routes

**Where:** all 68 routes; no `application/ld+json` in the repo.
**Steps:** Count `<script type="application/ld+json">` across all 68 routes → 0 on every one; confirmed post-hydration on `/`, `/customers/mty-food-group`, `/blog/what-50k-prompts-taught-us`, `/pricing`, `/resources/answr-index`. `grep -rn 'ld+json\|schema.org' app components lib` → no matches.
**Expected / Actual:** Expected at minimum `Organization` on the homepage, `Article` on the blog post, `Product`/`Offer` on `/pricing`, `BreadcrumbList` on nested routes. Actual: none anywhere.
**Why it matters:** An ordinary SEO gap on its own — but this product's core pitch is that structured data is how you win AI answers. `/customers/bell-media` sells "TVSeries, Movie and BroadcastEvent schema per title"; `/customers/mty-food-group` sells "Restaurant, Menu and MenuItem schema per banner"; `/industries/b2b-saas` says "schema markup matters more than anyone admits". Shipping zero schema on your own site while charging for schema advice is what a technical buyer checks in thirty seconds. Highest credibility-per-hour fix in this section.
**Fix:** Add an `Organization` block to the root layout, `Article` to the blog post, `Product`/`Offer` to `/pricing`, `BreadcrumbList` to the nested routes. Static JSON-LD, no library. **(3 hours)**
**Confidence:** high.

### [P2 · inconsistent] The title template double-brands 18 routes — "Pricing — Answr · Answr"

**Where:** `app/layout.tsx:11` (`template: "%s · Answr"`) combined with per-page titles that already contain "Answr".
**Steps:** Extract `<title>` from all 68 routes and count "Answr" per title: 18 contain it twice. Verbatim: `/` → "Answr — Know what AI says about your brand · Answr"; `/pricing` → "Pricing — Answr · Answr"; `/login` → "Log in — Answr · Answr"; `/onboarding/brand` → "Onboarding — Brand — Answr · Answr"; `/app/demand/keyword` → "best running shoes · Demand — Answr · Answr"; plus `/app/actions`, `/app/capability-map`, `/app/content-score`, `/app/live`, `/app/reports`, `/app/workflows`, `/signup`, `/reset-password`, `/resources/answr-index` and others.
**Expected / Actual:** Expected the brand once per title, supplied by the template. Actual: 18 titles end "— Answr · Answr", the homepage most visibly, since its title is what shows in a bookmark and a browser tab.
**Why it matters:** Cosmetic, but it appears in the tab, in search results and in bookmarks, and it reads as carelessness on first impression. It also wastes ~8 characters of the ~60-char budget. The underlying work is otherwise good — all 68 titles are unique, descriptive and within length — so this is one systematic slip.
**Fix:** Strip the trailing "— Answr" from the 18 offending title strings and let the template supply the brand; for the homepage, use `title: { absolute: 'Answr — Know what AI says about your brand' }`. **(1 hour)**
**Confidence:** high.
---

### 3.8 Code health and maintainability

### [P1 · risky] The production application is under no version control at all

**Where:** repo root `/Users/arman_usman/Desktop/PROJECTS/answr`.
**Steps:** `git rev-parse --show-toplevel` → *"fatal: not a git repository (or any of the parent directories)"*. `ls -a | grep '^\.git$'` → no match. `.vercel/project.json` exists (`prj_aKoes4UaQtFTNrxBvDk1ouyarDtJ`), so deploys go straight from this working directory via the Vercel CLI.
**Expected / Actual:** Expected a live client-facing application to have a git history and a reviewed path to production. Actual: no `.git` anywhere in the tree or any parent; a `.gitignore` exists with nothing to ignore for. Every deploy is an untracked upload of whatever is on disk.
**Why it matters:** No rollback, no history, no diff, no blame, no branch and no review gate for a site that is live at useanswr.com. Combined with the absence of lint and tests, and with `lib/filters/windows.ts` being a 450-line file 21 others depend on, one careless edit is unrecoverable except by rewriting it from memory. It is also why the staging drift and the doc drift below were invisible: nothing records when anything changed. **This should be done before any of the fixes in this document are applied**, so that the remediation itself is attributable and reversible.
**Fix:** `git init`; add `.gitignore` entries for `staging/` (or remove it first), `tsconfig.tsbuildinfo`, `.next/`, `.vercel/`; commit the current tree as the baseline; push to a remote and connect the Vercel project to it so `git push` deploys and every deploy is attributable. **(4 hours including deciding what to exclude)**
**Confidence:** high.

### [P1 · risky] `staging/` is declared the "source of truth" but is pre-rebrand, triplicated, and cannot be regenerated

**Where:** `staging/` (296 files, 2.9 MB); `BUILD_CONVENTIONS.md:3-6`; `tools/convert.mjs:1-25`.
**Steps:** `grep -rl 'Solara' staging | wc -l` → **104**. `diff -rq staging/dashboard staging/dashboard-v2` → only `_manifest.json` and `overview.*` differ; `diff -rq staging/dashboard-v2 staging/dashboard-v3` → the same two files plus a stray `2a.tsx/2a.css`. `find / -name '*.dc.html'` → no results anywhere on the machine.
**Expected / Actual:** Expected either a live source pipeline or no pipeline. Actual: `BUILD_CONVENTIONS.md:3-6` states *"The staged frames in `staging/<canvas>/<frame-id>.tsx` … are the **source of truth** for markup, copy, and data. Keep body markup and copy verbatim…"* — but 104 of those files still name the retired demo brand, three near-identical copies exist with nothing recording which is current, and the `.dc.html` canvases `tools/convert.mjs` takes as input do not exist, so nothing can be regenerated or verified against them.
**Why it matters:** This is the single largest trap for the next person to touch the repo. A contributor — human or agent — who follows the repo's own top-level build doc will re-derive pages from frames that predate the Nike rebrand, the live filters, the server-side gate, the KPI wiring and the export engine, silently regressing months of work. `staging/` is not in `.gitignore` and there is no `.vercelignore`, so the 2.9 MB also rides along on every `vercel --prod` upload.
**Fix:** Move `staging/` out of the repo into an archive, or delete it — it is unreachable from any import (the dead-file scan resolves zero imports into it). Then rewrite `BUILD_CONVENTIONS.md` so its premise is "the built routes under `app/` are the source of truth" — the conversion phase is over. If it must stay, collapse the three dashboard copies to one and add a README stating it is a frozen historical artifact that must never be copied from. **(3 hours)**
**Confidence:** high.

### [P2 · missing] No lint, no tests, no CI — and the one gate that exists (`tsc`) skips `tools/` and `staging/`

**Where:** `package.json:5-9`; `tsconfig.json` exclude; repo-wide.
**Steps:** `package.json` scripts are only dev/build/start; no `lint`, no `test`, no eslint dependency and no `eslint-config-next`; `ls node_modules | grep -i eslint` → nothing. `find . -path ./node_modules -prune -o \( -name '*.test.*' -o -name '*.spec.*' -o -name '__tests__' \) -print` → nothing. `tsconfig.json` exclude = `["node_modules","staging","tools"]`.
**Expected / Actual:** Expected at minimum `next lint` in the build path and a smoke test over the route table. Actual: the only automated check anywhere is `npx tsc --noEmit` (which passes, as does `npx next build`), configured to ignore both `tools/` and `staging/`.
**Why it matters:** The `tools/` exclusion is not theoretical — it is exactly why the broken `METRICS.md` generator below has been shipping silently. And with 36 dashboard routes whose numbers must agree across page JSX, report specs, sidebar badges and CSV exports, there is no mechanism that notices when they stop agreeing; every cross-check in this audit had to be done by hand.
**Fix:** Add eslint + `eslint-config-next` and an `npm run lint` script; drop `'tools'` from the tsconfig exclude so the `.mjs` tools are type-aware under `allowJs`. Add one smoke test hitting every route in `tools/routes.mjs` asserting 200, plus one unit test pinning the `windows.ts` invariant below. **(1 day for all three)**
**Confidence:** high.

### [P2 · broken] `tools/gen-metrics-doc.mjs` silently regenerates `METRICS.md` as an empty document and exits 0

**Where:** `tools/gen-metrics-doc.mjs:12` (the entry regex) vs `lib/metrics.ts:29-40`.
**Steps:** Copy the regex from line 12 into a scratch script and run it against the current `lib/metrics.ts` without writing: `let n=0,m; while((m=re.exec(src))) n++;` → prints **0**. For comparison, `lib/metrics.ts` contains 31 entries (`grep -cE '^  [a-z_]+: \{'` → 31) and `METRICS.md` currently has 31 `##` headings. (Tested in a temp dir rather than by running the generator, which would have destroyed the doc.)
**Expected / Actual:** Expected `node tools/gen-metrics-doc.mjs` — the command `METRICS.md`'s own header instructs you to run — to reproduce the 289-line dictionary. Actual: the regex requires `label: "…",` to be immediately followed by `definition:`, but `lib/metrics.ts` now has a `plain:` field between them (added for the KPI hint bubbles). It matches 0 of 31, so the generator writes the 8-line header and nothing else, and exits 0 printing "METRICS.md written — 0 metrics".
**Why it matters:** The documented way to update the metrics dictionary destroys it, and the exit code says success. It went unnoticed because `tools/` is excluded from tsc and there is no lint or test. It is also the root cause of the stale `METRICS.md` in §3.3 — the doc is out of date precisely because nobody could safely regenerate it.
**Fix:** Insert `plain:\s*"(?:[^"\\]|\\.)*",\s*` between the label and definition groups — or better, replace the regex parse with a dynamic `import()` of the object so the doc cannot drift from its shape again. Then add a guard: `if (!entries.length) { console.error('parsed 0 metrics — refusing to overwrite'); process.exit(1); }`. **(30 minutes)**
**Confidence:** high.

### [P2 · risky] Every screen's fixture numbers are written twice — once in the page JSX, once in its export report spec

**Where:** `app/(dash)/app/page-health/page.tsx:66-146` vs `page-health/report.ts:24-70`; the same pattern in all seven cluster report files.
**Steps:** `grep -n '"84"\|"51"\|"38"\|3\.4s\|2,214\|1,108\|846' 'app/(dash)/app/page-health/page.tsx'` → lines 81, 109, 110, 127, 128, 145, 146. The identical values appear again in `report.ts` at lines 27, 32, 37, 41, 46 and 59-68. Neither file imports the other or any shared constant.
**Expected / Actual:** Expected the CSV a client downloads to be generated from the same values the screen renders. Actual: the screen renders string literals in JSX and the exporter renders a second hand-copied set. They agree today (page-health was checked value by value); nothing enforces it. `insights/reports.ts` alone carries 45 such literals and `agents/reports.ts` 29.
**Why it matters:** For a product whose value proposition is "the number you show your VP is the number we measured", a silent divergence between the dashboard and the CSV is the most damaging bug class available. Edit a KPI on screen and the exported executive report keeps the old figure with no error, no type failure and no test. This is also the mechanism behind several §3.3 findings.
**Fix:** Hoist the shared values into `lib/data/<module>.ts` as named consts imported by both `page.tsx` and `report(s).ts`. The pattern already exists and works — `citations/reports.ts` imports `CITATIONS_TOTAL` and `sourceMix` from `lib/data/evidence`, and `overview/report.ts` imports its series — so this extends an established convention to the clusters that skipped it. **(1 day per cluster for the six that need it — do this incrementally alongside the §3.3 fixes rather than as a separate project)**
**Confidence:** high.

### [P2 · missing] The fixture data layer holds ~12% of the fixture numbers, is synchronous-only, and has no tenant dimension — a real API swap is not a drop-in

**Where:** `lib/data/*.ts` (12 files, 1,932 lines) vs `app/(dash)/app/**`.
**Steps:** Strict scan for fixture-shaped literals (comma-thousands, bare percentages, ↑/↓ deltas; CSS values excluded) across `app/`, `components/`, `lib/`: **387** in `app/(dash)` route files vs **53** in `lib/data/*`. Top offenders: `insights/reports.ts` 45, `agents/reports.ts` 29, `insights/page.tsx` 25, `insights/regions/ByRegionTable.tsx` 23. 27 of the 36 dashboard `page.tsx` files import neither `@/lib/data` nor `@/lib/filters`. `grep -rn 'async \|Promise' lib/data/` → zero hits. `grep -rni 'workspaceId\|brandId\|tenant' lib/data lib/export` → zero hits. `grep -rn '@/components' lib` → 6 files in `lib/` import chart types from `components/app/charts/*`.
**Expected / Actual:** Expected, per `WIRING_CONVENTIONS.md` ("Data goes in `lib/data/<module>.ts`"), the fixture layer to be the seam, so wiring a real API means replacing `lib/data` and nothing else. Actual: roughly seven of every eight fixture numbers live in route files; the seam is synchronous module constants every consumer destructures at import time; and the data layer's own types are imported *from* the chart components, so the shape of the data is defined by the shape of the chart.
**Why it matters:** This is the answer to "how painful is the real build". Replacing `lib/data/*` moves about 12% of the numbers; the other 88% require editing ~30 route files. Because nothing is async, every consumer of a real API becomes an async server component or a Suspense boundary — and there is no `loading.tsx` or `error.tsx` anywhere in `app/` to land on. Because nothing takes a workspace argument, there is no parameter to thread a tenant through (see also the telemetry tenant-prefix finding). Because `lib/` depends on `components/`, the data layer cannot be extracted or reused by an API route without dragging React components with it. Together these mean the real build is a rewrite of the presentation layer, not a swap behind an interface. (The absence of persistence, auth and multi-tenancy itself is documented in `READINESS.md` §2 and belongs there; this finding is about the code's *shape* making the swap expensive.)
**Fix:** Three moves, in order. (1) Move `TrendSeries`/`Bar` from `components/app/charts/*` into `lib/data/types.ts` and have the charts import from `lib` — inverts the dependency, one afternoon. (2) Give each module an accessor rather than bare consts: `export async function getOverview(ctx: {workspaceId: string; range: RangeId}): Promise<OverviewData>` returning today's fixture, and migrate consumers — the signature is then already API-shaped. (3) Sweep the 387 literals out of the route files into those modules, cluster by cluster, starting with the six that already have a `report(s).ts` since they need the same hoist anyway. **(Weeks — but it is the work that has to happen before any real data lands; not a P0/P1 blocker for a demo)**
**Confidence:** high.

### [P2 · risky] Riskiest file to change: `lib/filters/windows.ts` — 21 dependents, an unpinned invariant, and no test

**Where:** `lib/filters/windows.ts` (450 lines).
**Steps:** Import-graph scan across `app/`, `components/`, `lib/` and `proxy.ts`, ranking fan-in by (importers × log2(lines + branch-points)): `components/ui/Hint.tsx` (48 importers), `components/app/Topbar.tsx` (35 importers, 16 props, 127 lines), `lib/filters/windows.ts` (21 importers, 450 lines, ~55 branch points), `lib/metrics.ts` (18), `settings/DemoControls.tsx` (11, all cross-cluster). `windows.ts` exports the seeded-PRNG history synthesis (`hashSeed`, `mulberry32`, `extendCount`, `extendLevel`, `accrued`, `sliceWindow`, `levelStat`, `countStat`, `accruedStat`, `fmtDelta`, `deltaTone`) that every date-range-aware number flows through.
**Expected / Actual:** Expected the file determining every KPI value, delta and chart endpoint on Overview, all six Insights tabs, Citations and Agent Analytics to be the best-tested file in the repo. Actual: no test, and the invariant it exists to guarantee — stated in its own header, *"THE LAST 30 POINTS OF EVERY EXTENDED HISTORY ARE THE SHIPPED FIXTURE, BYTE FOR BYTE"* — is enforced by nothing but that comment.
**Why it matters:** Change a constant in the PRNG, the damping curve or the saturating accrual and every headline number on eight screens moves at once, in a way that still type-checks, still builds, and still renders *plausible* numbers — so the regression is invisible until a client notices the CSV disagrees with a screenshot. `Topbar.tsx` is the runner-up for a different reason: 16 optional props across 35 call sites, where the semantics of `rangeLive`/`platformLive`/`rangeNote`/`platformNote` are the app's entire honesty story, and an omitted prop silently produces a screen claiming a scope it does not honor.
**Fix:** Write the invariant as a test **before touching anything else in this document**: for each series in `lib/data/*`, assert that `sliceWindow(extend*(points, seed), 30)` deep-equals the shipped 30-point fixture, and that `levelStat`/`countStat` at 30d reproduce the shipped headline and delta. That single test file makes `windows.ts` safe to edit and is the highest-value test in the repo. Separately, split Topbar's 16 props into a discriminated union so a screen must *declare* live-vs-inert rather than defaulting to it. **(4 hours for the test; 4 hours for the Topbar prop union)**
**Confidence:** high.

### [P2 · inconsistent] Four near-identical toast-button wrappers with three different prop names, imported across route clusters by relative path

**Where:** `app/(dash)/app/actions/ToastButton.tsx`, `app/(dash)/app/insights/ToastButton.tsx`, `app/(dash)/app/settings/DemoControls.tsx:13`, `app/(dash)/app/overview/DemoActionButton.tsx`, `components/ui/DemoActionButton.tsx`.
**Steps:** `grep -rn 'ToastButton\|DemoActionButton' app components`. `actions/ToastButton.tsx` (prop `message`) has 8 importers including `demand/keyword/page.tsx:7` (`"../../actions/ToastButton"`) and `workflows/page.tsx:5`; `settings/DemoControls.tsx#ToastButton` (prop `note`) has 11 importers including `agents/logs/page.tsx:5` (`"../../settings/DemoControls"`) and `page-health/page.tsx:5`; `insights/ToastButton.tsx` (prop `message`) has 3; `overview/DemoActionButton.tsx` (prop `note`) has 1; `components/ui/DemoActionButton.tsx` (props `label` + `message`) has 1.
**Expected / Actual:** Expected one shared primitive for "clickable control whose click fires the honest-demo toast" — `INTERACTIVITY_CONVENTIONS.md` frames these as shared primitives. Actual: five implementations of the same ~12-line component differing only in the prop name, and route folders reaching into each other's private component files by relative path.
**Why it matters:** The cross-cluster relative imports are the real cost: `/app/page-health` and `/app/agents/logs` break if anyone reorganises `/app/settings`, and `/app/demand` and `/app/workflows` break if anyone reorganises `/app/actions` — coupling no directory boundary suggests exists. The same "no shared primitive" pattern repeats in the seven modals (1,213 lines total, each hand-rolling its own Escape handler, backdrop and dialog shell); they happen to agree today but nothing keeps them in step, which is why the focus-trap finding in §3.5 has to be fixed in seven places.
**Fix:** Create `components/ui/ToastButton.tsx` with one prop name, repoint all 24 call sites, delete the four copies. Then extract `components/ui/Modal.tsx` (backdrop + Escape + role/aria-modal + focus trap + focus restore) and reduce the seven modals to their bodies — that also gives one place to land the §3.5 fix. **(4 hours for the buttons; 1 day for the modal extraction, which doubles as the accessibility fix)**
**Confidence:** high.

### [P2 · inconsistent] Machine-generated JSX was never reformatted — 37 single lines exceed 2,000 characters, the longest 18,530

**Where:** 34 of 172 `.tsx` files under `app/` and `components/`. Worst: `product/answer-engine-insights/page.tsx` 18,530 · `product/agent-analytics/page.tsx` 15,672 · `product/citations/page.tsx` 13,920 · `app/(dash)/app/insights/page.tsx` 13,456 · `insights/shopping/page.tsx` 12,347 · the five `industries/*/page.tsx` files 10,452–10,792 each. `citations/ExportModal.tsx:112` is the entire dialog on one line.
**Steps:** Scan every `.tsx` for line length: 65 lines exceed 500 characters, 37 exceed 2,000.
**Expected / Actual:** Expected source formatted so a change can be read and reviewed. Actual: each of these files contains one line that is an entire page body — a direct artifact of `tools/convert.mjs` emitting canvas markup unformatted, never cleaned up.
**Why it matters:** These are precisely the files holding the marketing copy and the dashboard fixture numbers, i.e. the files most likely to be edited by the remediation this document describes. Any edit is a blind search-and-replace inside an 18,000-character line, any diff is one changed line, and no reviewer can see what moved. It is the practical reason the duplicate-fixture and stale-number problems are hard to catch by reading.
**Fix:** Add prettier as a devDependency and run it once over `app/` and `components/` (JSX only, no rule changes). Verify with `npx tsc --noEmit` and `npx next build`, screenshot-compare two or three pages since inline styles are unaffected by reflow, and commit it as a single formatting commit — **immediately after `git init` and before any content fixes** — so it never pollutes a real diff. **(4 hours including the eyeball check)**
**Confidence:** high.

### [P2 · inconsistent] `READINESS.md`'s headline security assessment is materially out of date and reads as current

**Where:** `READINESS.md:7`, `:23`, `:30`, `:58-64`, `:83-86`.
**Steps:** Each claim checked against the repo and the live site. (a) `:58-64` "Authentication does not exist at any layer: `LoginForm.tsx` … compares them in the browser and calls `router.push()`, with no fetch, no cookie and no server call; `proxy.ts` has zero session logic" — but `app/api/session/route.ts` exists and sets an httpOnly cookie server-side, `LoginForm.tsx:44-53` POSTs to it, and `proxy.ts:56-60` enforces the gate. (b) `:30` "`/app/overview` and `/app/settings/billing` return HTTP 200 to anyone with the URL" — both now 307 to `/login?next=…`. (c) `:83-86` "a 90-day export ships stamped 30 days under a footnote claiming the figures match the selected window" — `lib/export/active-window.ts` now stamps an honest "Note on window" row. (d) `:23` "grep for `process.env` returns exactly three sites" — the actual count is 5. (e) `:7` audits `answr-ruby.vercel.app`; the live site is `useanswr.com`.
**Expected / Actual:** Expected a document opening "Every claim below traces to a finding … or to a check re-run against this repo and the live deployment" to be current, or dated as a snapshot. Actual: at least five load-bearing claims describe a build that no longer exists, with no "as of" marker and no record of what has since been fixed.
**Why it matters:** This is the document an investor, a new engineer or a future agent reads first to decide what is real. Its security claims are now *inverted* — it says the dashboard is wide open when it is gated (though see the percent-encoding bypass, which is a different hole) — and acting on that, either by "fixing" something already fixed or by trusting its other claims uncritically, is expensive. Much of the rest is still accurate and genuinely valuable, which makes the stale parts harder to spot. It cannot be corrected against history because there is no git.
**Fix:** Add a dated header ("Snapshot: 7 Aug 2026") and a short "§0 Fixed since this was written" section listing the server-side gate, the export window note and the `process.env` count, each with the file that resolved it; retarget the deployment URL. Re-verify the remaining claims rather than rewriting from scratch. **(3 hours)**
**Confidence:** high.

### [P3 · inconsistent] Three agent-facing convention docs still instruct against the retired Solara brand; `NAVIGATION.md` is missing entirely

**Where:** `INTERACTIVITY_CONVENTIONS.md:24,26,65`; `WIRING_CONVENTIONS.md:16,34`; `INTEGRATIONS.md:305`; repo root (`NAVIGATION.md`).
**Steps:** `INTERACTIVITY_CONVENTIONS.md:24` mandates the export filename pattern `solara-<module>-30d.csv` (every shipped call site uses `nike-…`); `:26` gives "Mentions: Solara ▾" as the example pill; `:65` mandates the OAuth toast read "dana@solara.io / answr-demo" (`LoginForm.tsx:17` correctly says `dana@nike.com`). `WIRING_CONVENTIONS.md:34` names the competitor series "Beacon / Klarity / Wavemetric / Optivo" (retired to Adidas/Puma/Under Armour/New Balance per `REBRAND_MAP.md`) and `:16` says the dictionary has "24 entries" (it has 31). `INTEGRATIONS.md:305` "to distinguish it from the Solara fixture". `find . -name NAVIGATION.md` → no result, though it is cited as a key spec.
**Expected / Actual:** Expected the operating instructions to match the product after the rebrand `REBRAND_MAP.md` documents. Actual: three convention docs still teach the retired brand, and one referenced spec does not exist.
**Why it matters:** These are executable instructions, not prose — a contributor following the interactivity playbook verbatim would ship a login toast advertising a credential (`dana@solara.io`) that does not work, and one following the export-filename rule would name files inconsistently with the other 30 screens. Lower severity than `METRICS.md` only because these are not client-facing. The missing `NAVIGATION.md` means the sidebar spec the sidebar was rebuilt against cannot be checked against the sidebar.
**Fix:** Apply `REBRAND_MAP.md`'s own token table to the three docs (six line edits), correct "24 entries" to 31, and either restore `NAVIGATION.md` or remove the references to it. **(1 hour)**
**Confidence:** high.

### [P3 · inconsistent] Dead exports and four comments that describe behavior the code no longer has

**Where:** `lib/export/reports.ts:163` (`moduleReport`, 29 lines, no consumers — all seven clusters wrote their own spec); `settings/DemoControls.tsx#CsvButton` (37 lines, and `DemoControls.tsx:10` documents it as an active primitive); `lib/filters/windows.ts#countSeriesForRange` (15 lines); `Topbar.tsx#DATE_RANGE_ITEMS` and `#PLATFORM_ITEMS` (bare re-export aliases with no consumers). Stale comments: `LoginForm.tsx:7` "Demo credential gate — no backend" directly above a `submit()` that POSTs `/api/session`; `content-score/ScoreInfo.tsx:7` "applies the KpiCard ⓘ provenance popover pattern" when `KpiCard` has no such popover; `CommandK.tsx:20` narrating a since-fixed export-filename bug.
**Steps:** Export-usage scan across `app/`, `components/`, `lib/` and `proxy.ts`, each candidate verified by grep.
**Expected / Actual:** Expected exported symbols to have callers and comments to describe the code beneath them. Actual: ~80 lines of exported-but-unreachable code and four comments asserting the opposite of the code they head.
**Why it matters:** Small individually, but two actively mislead — `DemoControls.tsx:10` tells you `CsvButton` is the sanctioned CSV primitive when the real one is `components/ui/ExportButton.tsx`, and `LoginForm.tsx:7` tells you there is no backend when there is. Worth noting the credit here: the list is this short because there are **zero** `any` types, zero `@ts-ignore`/`@ts-expect-error`/`@ts-nocheck`, zero `eslint-disable` and zero TODO/FIXME/HACK markers anywhere in `app/`, `components/`, `lib/` or `tools/`.
**Fix:** Delete the four unused exports, downgrade the two Topbar aliases to non-exported locals, correct the four comments. Best done as one commit right after `git init` so it is attributable. **(1 hour)**
**Confidence:** high.

### [P3 · inconsistent] The canonical series-colour token exists but was never adopted — the same six hexes are retyped ~150 times across 42 files

**Where:** `lib/data/overview.ts:23` (`PLATFORM_COLORS`) vs 42 files across `app/` and `components/`.
**Steps:** `grep -rn 'PLATFORM_COLORS' app components lib` → all 18 references are inside `lib/data/overview.ts` itself; nothing outside that file imports it. `grep -rno '#7fa7d9|#b98ed9|#d9b679|#d985a8|#8E7CF2|#6ec9b8' app components lib` → ~150 occurrences across 42 files: `overview.ts` 18, `onboarding/CompetitorPicker.tsx` 9, `actions/page.tsx` 7, `lib/data/infra.ts` 6, `marketing/page.tsx` 6, `insights/page.tsx` 6, `demand/page.tsx` 6, `lib/data/insights.ts` 5, `charts/TrendChart.tsx` 4, `globals.css` 4, and 32 more with 1–4 each.
**Expected / Actual:** Expected one exported palette consumed everywhere, as `WIRING_CONVENTIONS.md`'s series-colour rule implies. Actual: the const exists, is used only by the file declaring it, and every other file re-types the raw hex — including the chart component and the global stylesheet.
**Why it matters:** Changing a competitor's colour, or reusing the palette for a new platform, is a 42-file find-and-replace with no way to verify completeness, and the design tokens in `globals.css` can drift from the data-layer palette silently. The code-health point is specifically that the token was built and then not adopted, and that its home inside a fixture data file is why nobody found it.
**Fix:** Move `PLATFORM_COLORS` and the four competitor hues into `lib/theme.ts` (or CSS custom properties exposed via `var()`), export both, and sweep the 42 files. Pairs naturally with the Prettier pass, since both touch the same files. **(1 day)**
**Confidence:** medium.

---

## 4. What is genuinely good

This section is not a courtesy. The findings above are severe, but they sit on top of work that is materially better than most shipping SaaS, and knowing which parts are solid tells you where *not* to spend remediation time.

**Interactivity is genuinely complete.** Every button, link, input and `cursor:pointer` element was enumerated per route across all 37 dashboard routes and checked for an attached React handler or href. After excluding child spans of clickable parents, the count of handler-less clickable elements was **zero on every route**. The "activate every control" work landed. A separate React-fiber scan across 34 routes found exactly one screen with non-keyboard div click targets (the 8 Prompts rows); every other control — 41 clickers on `/app/overview` alone — is a real `<button>` or `<a>`.

**The date-window engine is correct, not decorative.** Driving the range pills at 7d/30d/90d/YTD over CDP on `/app/overview` and `/app/citations`: every KPI is the endpoint of the series drawn beneath it, and every delta equals endpoint minus window start. At 7d, Citations reads 324 ↑3 — and `citationsDaily`'s last 7 entries sum to exactly 324 with the prior 7 at 321. Count metrics use window sum vs previous window sum; distinct counts (unique domains, unique agents, pages crawled) use a documented saturating accrual rather than being summed. `lib/filters/windows.ts` guarantees a KPI and its chart resolve the same back-history key, so they cannot drift apart.

**Every fixture sum that was checked is exact.** `citationsDaily` sums to 1,284; `sourceMix` 488+385+257+154 = 1,284 with shares 38/30/20/12 = 100; all seven cited-domain shares match count ÷ 1,284 to 0.1pt; the four crawler series sum to 21,408/11,872/8,455/4,206 exactly as the Agents table prints; the three referral series sum to the 55/24/10% shares of 3,412; the competitor share-of-voice table sums to exactly 100.0%; topic prompt counts sum to exactly 412. The prompt-level platform model actually works: each platform's 14-run history reproduces its own headline, and the platform-weighted roll-up (.55/.25/.12/.08) gives 78.0% and 1.43 — exactly the 78% / 1.4 the prompts table prints. Content score 68 equals the mean of its four subscores and the donut arc is 231/339 = 68% of the circumference.

**The executive CSV envelope is real and unusually good.** All 24 exports were downloaded and opened: 20 carry a titled header block (brand, reporting window, generated timestamp, source), an EXECUTIVE SUMMARY table with values, deltas and plain-English "what it means" prose, detail sections, and footnotes. `nike-overview-30d.csv` is 5.2KB across 81 rows and 7 sections. One engine (`lib/export/report.ts`) handles escaping, arrow normalization, the em-dash edge case and the UTF-8 BOM for Excel; no cluster re-implements CSV escaping. The sentiment CSV even discloses that its theme shares round to 99.9% and that occurrences exceed the answers analysed.

**Export window honesty is implemented at the file level.** When the workspace filter is off default, every CSV emits "Note on window: Workspace filter at export time: … It is **NOT** applied to this file" — the export layer refuses to let a mislabeled file leave the building, verified by exporting `/app/overview` at YTD and `/app/agents` at 7d. (The controls that produce those files do not yet meet that standard — §3.4 — but the file itself does.)

**Serverless promise hygiene is correct, which is rare.** `proxy.ts:44` hands the ingest POST to `event.waitUntil()` rather than leaving it floating; both `/api/ingest:65` and `/api/collect:54` await the store write. `grep -rn '.then(|void fetch' app lib components` returns **zero matches** across the whole codebase — not a single floating promise. HTTP method routing is correct everywhere (405 on every unimplemented verb), oversized input is rejected at 413 by the platform and truncated to 200 chars in the route, and the test-hit idempotency design is sound: both writers carry the same id, both stores dedupe on it, and the route reports the status code the deployment actually returned rather than assuming 200.

**No secrets reach the browser, and there is almost no XSS surface.** Every JS chunk referenced by the marketing pages (584KB) and the dashboard (688KB) was concatenated and scanned for API-key shapes, the KV/Upstash env var names, `ANSWR_INGEST_SECRET`, `DEMO_PASSWORD`, the passphrase string and internal hostnames — **zero hits** in either bundle. There are no `NEXT_PUBLIC_*` variables at all, and all 7 `process.env` reads are in server-only code. The codebase contains exactly one `dangerouslySetInnerHTML` and its payload is a build-time constant. There are no Server Actions. The telemetry event model stores no IP address and no user identifier — data minimisation is right by construction.

**Zero runtime errors across the entire application.** A headless Chrome session visited all 36 dashboard routes plus 7 marketing routes with console, exception and network listeners attached: no console errors or warnings, no uncaught exceptions, no 4xx/5xx subresource responses, no failed loads. A separate 37-route sweep found no rendered `NaN`, `undefined`, `null` or `[object Object]`, and a crawl of every in-dashboard href found 33 distinct in-app links and zero broken ones.

**Marketing responsive is clean.** 28 routes × 11 widths (320–1920) = 308 measurements, **zero** horizontal document overflow in every one; a separate clipping probe found zero clipped boxes at 320, 375 and 768. The 901–1000px nav fix this audit was asked to verify holds at every integer width measured. The mobile menu is properly built: 44×44px burger, all 26 links ≥44px tall, body scroll locked and restored, Escape closes and returns focus to the trigger, and a matchMedia listener drops it past 900px — it is the one place in the codebase that does focus management correctly. The attribute-selector responsive layer survives client-side navigation across ten SPA navigations at 375px. Core Web Vitals under Slow-4G + 4× CPU throttling: LCP 1.1–2.3s and CLS 0 on `/`, `/pricing`, `/customers` and `/product/answer-engine-insights`.

**Performance architecture is disciplined.** No render-blocking third-party anything; every stylesheet, script and font is same-origin, with Inter self-hosted via `next/font` and `font-display: swap`. Initial JS is 142–176KB brotli across all 42 routes, ~115KB of it the shared runtime. Zero of the 72 `page.tsx` files and zero of the 4 `layout.tsx` files carry `"use client"` — all 93 client components are leaves, and the six that looked gratuitous were checked and are legitimate.

**The honesty layer, where it is implemented, is excellent.** The read-only demo toasts are specific rather than generic and applied consistently across Actions, Workflows, Settings, Team, Alerts and API keys — "Adding a step needs a live workspace — this demo is read-only.", "Paused here only — schedule delivery runs on live workspaces." Pagination toasts "The demo ships the first page of fixture rows" rather than pretending to page. The inert `FilterPill` renders the screen's own fixed scope rather than the workspace selection, verified live at 90 days + Perplexity, with `aria-disabled`, `cursor:not-allowed` and a `?` tooltip whose `aria-describedby` IDREF correctly resolves. `lib/gate.ts` is unusually honest about what it is not ("Do NOT mistake this for authentication").

**Three flows are exemplary and should be the template for the rest.** `AddPromptsModal`: empty submit toasts a useful message, blank and whitespace lines are trimmed, already-tracked prompts are deduped with "2 already tracked — skipped", the quota math is live ("412 of 1,000 → 452 · 40 new prompts · 548 left"), the button relabels, a 700-line paste is blocked with an actionable message, and a 900-character single line counts as one prompt. Bulk-select on Prompts: header checkbox toggles all, the count chip tracks live, "Export selection" exports exactly the selected rows and refuses at zero selection with "Select prompts first — nothing to export." `/app/live`: the "Send a test crawler hit" button really works (events incremented 3 → 4 live), the page states its own limits in print ("Capture is real; retention is not yet… Counts here are a floor, never a total"), it is the only screen carrying a freshness stamp, and it degrades honestly under network failure — emulating offline for 14s swaps the panel to a specific diagnostic and it recovers automatically on reconnect.

**Toggle-state ARIA and form labelling are correct everywhere they exist.** 21 `aria-pressed`, 14 `aria-checked`, 7 `role=checkbox`, 2 `role=switch` — no incorrect or stale state value was found. Settings toggles are real, not decorative (`aria-checked` and the computed background both flip). Zero inputs without an accessible name across `/login`, `/signup`, `/reset-password`, `/demo`, `/onboarding/*` and every dashboard search input. The text-colour token palette itself passes AA comfortably (`--tx` 14.65–17.20:1, `--mut` 6.16–7.23:1, `--fnt` 4.52–5.31:1) — nearly every contrast failure found comes from opacity multipliers or hardcoded `#fff`, not from the tokens. `globals.css` ships a `prefers-reduced-motion` block, `<html lang="en">` is set, and zero images lack alt attributes across 34 routes.

**The Hint tooltip portal works, including the two cases it was rebuilt for.** Hovering every `i` trigger (90+ across ten routes) with real CDP mouse events at 1440×900, 940×560 and 1440×420: every bubble was parented to `document.body`, none was clipped by an `overflow:hidden` ancestor, none ran off any viewport edge, and the near-top flip fired correctly. Zero problems found.

**Type discipline is clean and not an accident of loose settings.** `tsconfig` has `strict: true`, and across `app/`, `components/`, `lib/`, `types/` and `tools/` there are zero `any`, zero `as any`, zero `@ts-ignore`/`@ts-expect-error`/`@ts-nocheck`, zero `eslint-disable` and zero TODO/FIXME/HACK markers. `npx tsc --noEmit` exits 0 and `npx next build` completes in ~21s with no errors and no warnings on Next 16.3.0, generating 72/72 static pages. A full import-resolution scan over 172 source files found exactly **one** never-imported non-entry file (`MetricInfo.tsx` — itself a finding), no duplicate or backup files, and no commented-out page bodies.

**The fixture data that does live in `lib/data` carries explicit provenance.** Each series is headed by a comment stating the endpoint constraints it honors and why ("Nike ends 34.2 … and starts 31.4 so the KPI's ↑2.8 delta is true"), and `lib/filters/windows.ts` documents its byte-for-byte invariant in prose. That discipline is what made this audit's cross-checks possible at all. Similarly, `lib/telemetry` is structured for the real world already — a `TelemetryStore` interface with memory and KV implementations, automatic selection on env presence, a URL validated before use, and a singleton parked on `globalThis` so dev hot-reload does not wipe captured events. It is the one module where swapping the backing store is genuinely a drop-in.

**The rebrand left no residue in shipped output.** Across all 68 rendered pages: zero occurrences of "Solara" or "solara.io", zero `localhost:3000`, zero references to the old preview origin. The vocabulary swap is complete and internally coherent — topics, prompts, citation sources and demand keywords all sit in the right category. No placeholder text survived anywhere (zero matches for lorem/ipsum/TODO/TBD/"coming soon"/`{{`), and a dictionary pass over the full 10,024-word marketing corpus surfaced no misspellings. All 68 `<title>` tags are unique, hand-written and within the display budget. The 404 handler returns a real HTTP 404 and is the only page carrying `noindex`. Real-brand logo handling is done properly at the code level whatever one concludes about the copy around it: licensed SVGs, correct alt text, a three-tier fallback, and comments naming the official asset sources and forbidding hand-drawing a trademarked mark.
---

## 5. Effort summary

Estimates are engineering hours for one competent developer familiar with this codebase, at 8h/day. They assume the two enablers below are done **first**, because they change the cost of everything after them.

**Enablers — 1 day, do these before touching anything else**

| Task | Effort |
|---|---|
| `git init`, `.gitignore`, baseline commit, connect Vercel to the remote | 4h |
| Prettier pass over `app/` + `components/` as a single formatting commit (37 lines currently exceed 2,000 chars, including most of the files the fixes below touch) | 4h |
| *Optional but high-leverage:* pin the `windows.ts` byte-for-byte invariant as a test before editing any data file | +4h |

**Clearing all nine P0s — ~4 engineering days, plus a parallel legal track**

| P0 | Effort |
|---|---|
| Gate bypass: normalize the path in `isGated`, fail closed, add a server-side check in the dashboard layout, add the encoded-variant guard test | 4h |
| Delete `/app/capability-map` | 0.25h |
| Marketing lead forms: real destination for all three, email-shape validation, remove the prefilled snapshot value, bind or remove the dead name inputs | 4h |
| Fabricated customer proof: remove or replace MTY/Bell + the two logo files; delete both G2 pills | 4h |
| Compliance claims: strip SOC 2 / pen-test / AES-256 / 99.9% SLA / GDPR-CCPA badges from the footer and 5 pages; remove the trust-center and status-page references; remove the signup consent sentence until documents exist | 6h |
| `/api/ingest` + `/api/collect`: per-workspace bearer token, fail closed, per-IP rate limit, and either drop the "Real data" badge or disclose the open endpoint | 12h |
| AEI date pill: make it inert with the honest note and stop the axis relabeling *(the full re-slice across 5 tabs is ~3 days — not required to clear P0)* | 4h |
| **Total engineering** | **~34h ≈ 4.5 days** |
| **Parallel, non-engineering:** draft and publish `/privacy`, `/terms`, `/dpa` (counsel or a template service), then 4h to wire the footer, signup consent and DPA badge | 2–5 days elapsed |

So: **one developer clears the P0 engineering work in about a week including the enablers**, gated on the legal copy arriving. Two developers working in parallel (one on security/telemetry, one on marketing claims and forms) clear it in three days.

**Clearing P0 + P1 — ~19–21 engineering days ≈ 4 calendar weeks for one developer**

| Group | P1 scope | Effort |
|---|---|---|
| Security | Open redirect (0.25h), KV write-failure honesty, tenant key prefix, referral snippet path | 2 days |
| Claims | `/security` rewrite, 8 testimonials, fabricated research stats + Answr Index, 11 integrations, sample-data markers on public marketing | 1.5 days |
| Data consistency | 9 findings, most of them single-source-of-truth hoists (visibility series, sidebar badges, best-platform argmax, page-health decomposition, prompt quota, plan limits, live-logs scope, homepage figures, position polarity) | 3 days |
| Functional | ⌘K, Prompts search, Reports download, Settings save, export-window threading, brand switcher, MetricInfo, URL state | 5 days |
| Accessibility | Headings (2d), landmarks + skip link (0.5d), focus-trap hook across 12 dialogs (1d), nav dropdown disclosure (0.5d), 41-site contrast sweep (0.5d) | 4.5 days |
| Responsive | `TrendChart` viewBox fix + 35-route × 4-width re-sweep | 0.5 day |
| SEO | Open Graph + og image, canonical + domain redirects, robots + sitemap | 1 day |
| Code health | Remove/archive `staging/` and rewrite `BUILD_CONVENTIONS.md` | 0.5 day |
| **Total P1** | | **~18 days** |
| **P0 + P1 + enablers** | | **~23 days ≈ 4.5 weeks for one developer, ~2.5 weeks for two** |

**P2 and P3** add roughly a further 12–15 days if taken wholesale, but most are 15–60 minute items that are cheapest to batch into whichever file a P1 fix already opens. Three P2s are genuinely large and should be scoped separately rather than absorbed: real data-table semantics (~1.5 days), the AEI true re-slice (~3 days), and the `lib/data` accessor refactor (weeks — it is the pre-work for a real backend, not demo remediation, and should not be scheduled against a client date).

**The one sequencing rule:** do not start the data-consistency group before the `windows.ts` invariant test exists. Eight screens' headline numbers flow through that file, and a regression there type-checks, builds, and renders plausible wrong numbers.

---

## 6. Explicitly not audited

Listed so nobody assumes coverage that does not exist. Grouped by why it was not reached.

**Not reachable from outside the deployment**

- **The durable KV/Upstash code path.** `GET /api/telemetry` reports `{"kind":"memory","durable":false}`, confirming no KV env pair is set. The silent-write-failure and tenant-prefix findings are therefore code-read only — no real Redis outage, LTRIM eviction, or `claim()`/`push()` race between concurrent instances was observed.
- **The `ANSWR_INGEST_SECRET`-configured behaviour.** The variable is provably unset in production, so the analysis of what happens when it *is* set (including the dead second header block) is a code trace, not an observation.
- **Vercel function logs.** No access, so what the five 500-producing payloads emit server-side, whether the proxy's `waitUntil` ingest ever fails silently in normal operation, and what proportion of requests land on cold instances are all unknown.
- **Whether the operator holds any claimed artifact** — a SOC 2 Type II attestation, an annual pen test, a DPA, a 99.9% SLA contract — or any permission relationship with MTY Food Group, Bell Media or G2. The claims are reported exactly as shipped; substantiation is the business owner's to confirm or deny.
- **Ownership of `answr.io`.** DNS only was checked: MX points at Google Workspace (so mail may be delivered) but there is no A record, so `app.answr.io` and `mcp.answr.io` definitively do not resolve.
- **The CDN log-drain and npm-package ingest paths** described in `INTEGRATIONS.md` §2.2 — they do not exist in the repo, so there was nothing to test.

**Deliberately not exercised**

- **Load and concurrency.** Testing was capped at a 15-request burst against a live production site whose billing this audit does not own. The rate at which the open ingest and telemetry endpoints degrade the deployment was not established, the 500-event buffer was not filled, and no sustained traffic was run.
- **Long-string and high-volume rendering on `/app/live`.** Untrusted request paths do render raw in the "Most-crawled paths" table (an external probe's `/%61pp/overview` was visible during testing); layout robustness for a very long attacker-supplied path is untested.
- **The dashboard below 900px, beyond confirming `SmallScreenGate` is present in SSR HTML with an inline `display:none` and a sessionStorage dismissal.** Desktop-only is documented intent; the 900–1418px band above the interstitial *was* audited and is reported in §3.6.

**Requires tooling or an environment not available**

- **Real assistive technology.** Everything in §3.5 comes from the Chrome accessibility tree, real Tab keypresses, computed styles and focusable-node counts — which is what NVDA/JAWS/VoiceOver consume — but no screen reader was driven, so actual announcement behaviour is unverified. This is why the toast live-region finding is marked medium confidence.
- **Windows High Contrast / `forced-colors` mode.** Not tested. Given a UI of inline styles with hardcoded rgba values and no `forced-colors` query anywhere, problems are likely, but there is no evidence.
- **Non-Chromium rendering (Safari, Firefox), print stylesheets, viewports above 1920px.** Not exercised. Note the mobile menu uses `max-height: calc(100vh - 74px)`, which on iOS Safari extends under the browser chrome, and its measured bottom edge is already 1px past the viewport at 375×812 — flagged as a hypothesis, not a finding.
- **Real devices.** Every responsive measurement is headless Chrome with device-metrics emulation, so iOS/Android dynamic-toolbar behaviour is unverified.
- **Fractional viewport widths.** CDP emulation only accepts integer widths, which is why the 900–901px media-query hole is reported at low confidence from CSS alone.
- **Per-route bundle sizes from the build.** Next 16.3 + Turbopack no longer prints the Route / Size / First Load JS table and emits no `app-build-manifest.json`, so all payload figures come from CDP network measurement of the live deployment instead.
- **INP / interaction latency.** No synthetic input timing was run. Long-task totals under 4× CPU throttle were captured (marketing home 502–1251ms, `/app/overview` 127–1634ms across three runs) but not attributed to specific handlers.
- **Reduced-motion enforcement in JS.** The CSS rule exists; whether chart transitions, the sidebar width transition and the live ticker honour it was not confirmed.
- **Colour-blindness simulation** for the up/down delta indicators. They carry ↑/↓ glyphs alongside the colour, so they are probably 1.4.1-compliant, but not every delta site was checked.

**Out of reach without a write path or more time**

- **Anything requiring persisted state.** `/app/welcome` beyond confirming it renders em-dashes, any numbers seeded during onboarding, and the `AddBrandModal` "Add brand" flow to completion (the switcher was confirmed to route to `/app/assets`, but no brand was submitted).
- **Conversation Explorer filter permutations.** The default view and one expanded conversation were read; the "N matching · 2,841 in the sample" counter is unverified against each dropdown option.
- **Per-cell chart hover tooltips and the d3 choropleth on `/app/insights/regions`.** The map's `<path>` elements carry `cursor:pointer` with no React handler (d3 attaches listeners directly), so static probes could not classify them and no real mouse-move events were driven over the map. Keyboard operability of the map is likewise unverified.
- **Four of the ten dialogs** (Report wizard, Run history, Create action, What's new) got a structural pass only — z-index, role, Escape — not full empty/long-input/double-submit testing.
- **Dashboard modals, exports and overlays at narrow widths.** The 35-route sweep at 900/1024/1180/1280/1366/1440 covers page loads only; opening the export modal, report wizard, ⌘K palette or brand switcher at those widths may add overflow beyond what §3.6 reports.
- **Deep content correctness of the 20 good CSVs.** Structure, envelope, row counts and window notes were verified; not every figure in every file was cross-checked against its on-screen source.
- **Marketing routes beyond `/`, `/pricing`, `/security`, `/customers`, `/integrations`, `/enterprise`, `/blog`, `/changelog`, `/resources/*` and the five `/industries/*` pages** were crawled for link integrity but not exercised control by control. The ~25 marketing pages carry restated metrics and case-study figures; **the three sampled in depth each contained a mismatch, so that set is likely to hold more.**
- **The six unlinked `/blog` entries** have no destination, so their body copy could not be reviewed for claims, attributions or typos. If those pages are wired up, they need a content pass of their own — the one post that does exist contains fabricated research statistics.
- **Embedded document metadata in the CSV/PDF exports.** Export mechanics were exercised and the envelope read, but the exports were not checked for whether they carry the SOC 2 badge, the wrong company domain, or case-study figures into a document that outlives the web page.
- **Historical or attribution analysis of any kind.** With no git repository there is no history, no blame and no dates, so when the staging drift, doc drift and dead code were introduced — and by which change — could not be determined.
- **`node_modules` and dependency health** beyond the `package.json` manifest: no audit of transitive dependencies, licences or known CVEs.
- **How far `staging/` has drifted from the shipped routes.** It is excluded from tsc and the `.dc.html` canvases it was generated from do not exist on this machine, so comparison was limited to brand-vocabulary grep and directory diff. The full semantic delta is unmeasured.
- **Whether `staging/` and `tsconfig.tsbuildinfo` actually upload on `vercel --prod`.** Inferred from the absence of a `.vercelignore`; not confirmed against a deploy log.
- **Whether the proxy runs for `/public` assets.** Its matcher excludes `_next/static`, `api/ingest`, `favicon.ico` and `snippet.js` but **not** `/logos/*`, so every uncached logo request likely invokes the edge function. Proving it would have required injecting fake bot traffic into the one real telemetry path, which was judged out of bounds.
- **The app was never run locally.** All verification was `npx tsc --noEmit`, `npx next build`, static source analysis, and HTTP/CDP against the production deployment at useanswr.com.
