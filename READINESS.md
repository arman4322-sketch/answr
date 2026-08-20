# Answr — Readiness Assessment

**What remains to get live data and a genuinely functional dashboard.**
Synthesized from six specialist audits (data pipeline, backend architecture, UX heuristics,
functional completeness, accessibility/quality, data integrity), August 2026.
Every claim below traces to a finding in that dossier or to a check re-run against this repo
and the live deployment at `answr-ruby.vercel.app`.

---

## 1. Verdict

Answr is a complete, polished, type-clean **rendering** of an AEO platform — 68 page routes,
35 dashboard screens, a metric dictionary, a CSV export engine and an unusually disciplined
honesty layer — sitting on top of almost no product. Of the 31 metrics defined in
`lib/metrics.ts`, 27 have no data-producing code of any kind and resolve to hand-authored
constants in `lib/data/*`; the remaining four (`crawler_events`, `unique_agents`,
`pages_crawled`, `ai_referrals`) have a genuinely real capture path — `proxy.ts` →
`/api/ingest` → `lib/telemetry` — that today feeds only `/app/live`, while the Agents
dashboard renders invented totals under the identical metric IDs. There is no database, no
session, no server action, no scheduler, no LLM or SERP client, and no tenant dimension
anywhere: `grep` for `process.env` across the whole repo returns exactly three sites
(`ANSWR_INGEST_SECRET` and the KV/Upstash pair), so every API key in INTEGRATIONS.md §4 is
read by zero lines of code. The single biggest blocker is that **nothing persists** — no
schema, no write path, not even `localStorage` beyond the sidebar-collapse key — which
simultaneously gates authentication (no user table), multi-tenancy (no row to scope),
the sampler (no prompt set to run or answer store to write to), and every create/edit
journey in the product, all of which currently terminate in a 3.6-second toast.
This is a demo with a real telemetry prototype bolted on, roughly five to seven months of
focused engineering away from a product a customer could be onboarded onto — and in its
current state it is not merely incomplete but actively misleading in several places, since
`/app/overview` and `/app/settings/billing` return HTTP 200 to anyone with the URL, and
`/app/agents` reports 48,231 crawler requests that never happened.

---

## 2. The three gaps

### Data — fixtures → live

The product's core promise is unbuilt, not half-built. There is no scheduler (no
`vercel.json`, no cron route, no cron dependency — the only recurring timer in the repo is a
10-second UI poll at `app/(dash)/app/live/LiveTelemetry.tsx:141`), no LLM or SERP client
(`package.json` ships eight runtime dependencies: next, react, react-dom, d3-geo,
topojson-client, world-atlas, simple-icons, @types/d3-geo), no answer store
(`lib/telemetry/types.ts` defines only `CrawlerEvent` and `ReferralEvent` — no `Answer`,
`Run`, `Citation` or `Mention` type exists anywhere), and no citation parser or entity
extractor (no public-suffix library, which `owned_citation_share` and
`unique_cited_domains` definitionally require). The one real pipeline is running on a
non-durable in-process ring buffer: `GET /api/telemetry` reports
`{"kind":"memory","durable":false}`, and re-checking it during this synthesis returned
`crawlerEvents:0` — the events the auditors fired hours earlier are already gone. Worse,
that pipeline accepts forged writes: `/api/collect` has no auth at all, and `/api/ingest`'s
gate treats a **missing** Origin header as same-origin, so the shared secret can never be
reached by the server-to-server path it exists to stop. The honest summary is that Answr's
live-data readiness is one narrow, unauthenticated, non-retaining slice.

### Platform — demo → multi-tenant product

Three of the four things that separate a demo from a product are absent rather than partial.
**Authentication does not exist at any layer**: `app/(auth)/login/LoginForm.tsx` hardcodes
`DEMO_EMAIL`/`DEMO_PASSWORD` as module constants in a `"use client"` file — they ship in the
browser bundle — and `submit()` compares them in the browser and calls `router.push()`, with
no fetch, no cookie and no server call; `proxy.ts` has zero session logic, and `grep` for
`cookies()`, `next/headers`, `getServerSession` or `redirect(` across `app/` and `lib/`
returns nothing. **Persistence does not exist**: no ORM, no driver, no schema, no migration,
no seed directory; every export in `lib/data/*` is a module-level constant or a pure
transform, and `settings/api-keys/page.tsx` hardcodes pre-masked display strings with no key
material behind them. **Multi-tenancy does not exist**: not one exported function in
`lib/data/` takes a workspace or brand argument, `lib/brands.ts` implements brand selection
as a module-level mutable `let` that resets on reload, and `lib/telemetry/kv.ts` uses three
globally-fixed Redis keys with no tenant prefix — two customers installing the snippet would
write into the same list. A second customer cannot exist, and there is no test or lint script
to catch it when one leaks into another.

### Experience — mock-feel → tool-feel

The shell is genuinely good; the failures are the handful of controls that are inert and stay
silent about it, and the places where the chrome contradicts the content. The workspace
date-range and platform pills render as applied on screens that ignore them — 11 of 36
Topbar screens show the range pill without honoring it, 15 show the platform pill — warned
only by a toast that fires once at pick time and vanishes in 3.6 seconds, after which the UI
sits permanently claiming a scope it isn't using. That defect reaches the deliverable:
`components/ui/ExportButton.tsx` hardcodes `window = "Last 30 days (vs previous 30 days)"`
as a default no caller overrides, so a 90-day export ships stamped 30 days under a footnote
claiming the figures match the selected window. Below that: the ⌘K palette and the Prompts
search box accept keystrokes into a void (the palette even ships a frame artifact reading
`No results for "citatons"?` while results are visibly showing), the Overview names actions
and sources you cannot click and points at `/app/actions/87` which 404s onto the **marketing
site**, sidebar badges assert 1,284 citations on the empty-workspace screen that says no data
has been collected, and the whole 71-route application contains **one** heading element and
zero `<main>` landmarks — for a product whose pitch is that AI engines cite well-structured
sources.

---

## 3. Blockers

Every `blocker` and `high` finding, deduplicated across auditors, ordered by how much each
unlocks. "Unlocks" names what stays impossible until it lands.

| # | Blocker | Sev | Unlocks / blocks | Fix | Effort |
|---|---|---|---|---|---|
| 1 | **No persistence layer at all.** No DB, ORM, schema or migration; only `localStorage` for sidebar collapse and an in-process `let` for the brand switcher. `A1-2, A2-2` | blocker | Gates *everything*: no user table (→ no auth), no workspace row (→ no tenancy), no prompt set to run or answer store to write to (→ no sampler), no table for the 31 metrics to be computed from. Even the two metrics INTEGRATIONS.md §3 marks feasibility **now** (`prompts_tracked`, `actions_queue`) cannot be real. | Postgres (Neon/Vercel) + Drizzle or Prisma. Minimum schema: `users`, `workspaces`, `workspace_members`, `brands`, `prompts`, `prompt_runs`, `answers`, `citations`, `competitors`, `watched_domains`, `platform_config`, `actions`, `crawler_events`, `referral_events`. Port `lib/data/*` from constants to query functions, keeping fixtures as seed data. | weeks |
| 2 | **No answer-sampling pipeline.** No scheduler (no `vercel.json`, no cron route, no cron dep), no LLM/SERP client, no answer schema. `A1-1` | blocker | 10 of 31 metrics cannot produce a single true number: `visibility_score`, `share_of_voice`, `platform_appearances`, `topic_visibility`, `region_visibility`, `audience_visibility`, `shopping_visibility`, `avg_answer_position`, `answer_rank_first`, `data_quality_sample` — plus every citation and sentiment metric, which need the same corpus. | Build the sampler: answer schema + store; per-platform clients for Perplexity Sonar, Gemini `generateContent` with `google_search` grounding, DataForSEO SERP Advanced; a `vercel.json` cron hitting an authenticated `/api/runs/execute`; the scoring functions already specified verbatim in `lib/metrics.ts`. | weeks |
| 3 | **No authentication at any layer.** `curl /app/overview` → 200 and 92KB of rendered dashboard; same for `/settings/billing`, `/api-keys`, `/team`. Credentials ship in the client bundle. `A2-1, A4-2` | blocker | Nothing is private — billing, team roster, key names and every metric are readable by any URL guesser. No customer can be onboarded: there is no user, no session, no way to scope or deny access. The login screen and the Log out item are decorative. | Auth.js v5 or Clerk issuing an httpOnly session cookie from a server action; `LoginForm.submit` POSTs to it instead of `router.push`; delete the client-side constants. Guard in `proxy.ts` (session read → redirect `/login` for `/app/*`, keeping the bot branch ahead of it) **and** again in `app/(dash)/app/layout.tsx` via `await auth()`. | days (after #1) |
| 4 | **No multi-tenancy.** No `lib/data` function takes a workspace/brand arg; telemetry keys are global (`answr:telemetry:crawlers`); events carry no `workspaceId`. `A2-3, A1-6` | blocker | A second customer cannot exist. Brand switching is a label change — `lib/brands.ts:95` ships a `SWITCH_NOTE` saying so. Two customers installing the snippet write into one shared Redis list, so A's crawler traffic appears on B's dashboard. | `workspace_id` required on every domain table, threaded as the first parameter of every query function, resolved server-side from the session — never from a client value. Workspace in the URL segment or a server-read cookie. Namespace Redis to `answr:{workspaceId}:telemetry:*`. Per-workspace ingest tokens replacing the single shared secret. | weeks |
| 5 | **No write path anywhere.** Outside `/app/live` the entire app makes 3 network calls. No `'use server'`, no `revalidatePath`, no form POST. Every create/edit ends in a toast. `A4-1` | blocker | A customer cannot track a prompt, create an action, invite a teammate, issue an API key, add a competitor or save an alert. `settings/**` alone has 32 `ToastButton` + 19 `Toggle` + 5 `SelectField` — 56 controls persisting nothing. The find-gap → ship-fix → measure-lift loop is unwalkable. | Server actions behind the ~10 modals, which are already built and validated. Start with the four gating the core loop: `AddPromptsModal`, `CreateActionModal`, action status/assignee on `/app/actions/92`, team invites. Replace each `toast(...)` with a mutation. | weeks (after #1) |
| 6 | **Telemetry is non-durable in production; loss demonstrated.** `/api/telemetry` reports `{"kind":"memory","durable":false}`. Ten concurrent GETs returned `events=1` seven times and `events=0` three times — three cold-started instances with private empty buffers. `A1-3, A2-5, A4-5` | high | The only real data in the product is not retained. `/app/live` shows a different number per refresh; no historical trend can ever be built; `MAX_EVENTS = 500` with `LTRIM 0 499` and no time-based retention means the 7d/30d/90d windows `lib/metrics.ts` promises are uncomputable even once durable. `public/snippet.js` is correct but is not loaded by any layout, so the referral half is structurally always zero. | Provision Vercel Marketplace Redis / Upstash and set the env pair — `lib/telemetry/index.ts` swaps stores at boot with **zero code change**. Add `<script defer src="/snippet.js" data-endpoint="/api/collect">` to `app/layout.tsx`. Then replace the fixed-length list with a time-bucketed structure (per-day sorted sets or a Postgres events table). | hours for durability; days for windowed retention |
| 7 | **Ingest and collect accept forged events from anyone.** A POST from a foreign Origin with a fabricated path and a fabricated ChatGPT referrer both returned `{"ok":true,"recorded":true}` and became the only data the public read API served. `A2-4` | high | The one genuinely real signal is untrustworthy — anyone can inflate, deflate or fabricate a customer's AI-crawler and AI-referral numbers, the exact metrics Answr sells. `/api/telemetry` is an unauthenticated public GET on every deployment. | Drop the Origin heuristic — `const sameOrigin = !origin \|\| ...` treats a missing header as same-origin, and curl omits Origin by default, so the secret is unreachable by the attacker path it targets. Require a signed HMAC on `/api/ingest` and have `proxy.ts` send it. Rate-limit and origin-pin `/api/collect`. Put `/api/telemetry` behind the session, scoped to the caller's workspace. Then add the IP-range verification INTEGRATIONS.md §2.2 already specifies to upgrade events past `declared`. | days |
| 8 | **The Agents dashboard ignores real telemetry and renders fixtures under the same metric IDs.** `app/(dash)/app/agents/*` imports `@/lib/data/infra`, whose header documents invented totals. `A1-4` | high | A customer who installs the capture and opens Agent Analytics sees **48,231 requests that never happened** next to a Live screen showing their real, much smaller number. The product contradicts itself and the ⓘ provenance tooltip claims a real source for both. INTEGRATIONS.md §4b's claim is true only of `/app/live`. | Point `app/(dash)/app/agents/*` at `summarize()` from `lib/telemetry` (the aggregation already exists), delete the crawler/referral series from `lib/data/infra.ts`, render an honest empty state at zero events, and correct §4b to name `/app/live` specifically. | days |
| 9 | **Nothing consumes the pilot spec's env vars, and there is no UI to supply provider keys.** `grep process.env` returns exactly 3 sites. `A1-5` | high | An operator who follows "wire this week", funds DataForSEO and pastes all five keys into Vercel gets **exactly the same fixture dashboard** — steps 1, 2 and 5 of the five-step pilot have no landing zone in the codebase. `settings/api-keys` is a fixture table of Answr's own outbound keys; `settings/platforms` has toggles but no credential fields. | An env-driven provider config module, per-workspace credential storage, and a Settings › Integrations page where keys are entered and connection-tested. (Scoping §4 honestly to steps 3–4 is a minutes-long doc correction that should land immediately regardless.) | days |
| 10 | **"Share of voice" reports two different Nike numbers on the same day** — 28.6% on Overview (5 brands, sums to 100.0) and 34.2% on Answer Engine Insights (4 brands, sums to 91), where 34.2 is the **Visibility score** wearing a Share-of-voice title and a `share_of_voice` provenance popover. Both ship in downloadable executive CSVs. `A6-1` | blocker | A prospect clicking Overview → Insights watches their headline competitive metric move 5.6 points with no explanation, and Adidas move 24.1 → 24.9. Two executive CSVs disagree about the same metric, brand and window. It makes the metric dictionary — the thing meant to prove rigour — demonstrably false. | Re-author `lib/data/insights.ts` `sovSeries` as true share of voice: five brands (add New Balance), endpoints matching Overview, summing to 100 every day; update `insights/reports.ts:36-41`. Or retitle the chart "Visibility", swap `MetricInfo` to `visibility_score`, and rename the topics-table column to "Topic visibility". | 1–2 days |
| 11 | **Filters render as applied on screens that ignore them, and every CSV is hard-stamped "Last 30 days."** `ExportButton` never calls `useFilters()`; 15 `exportFilename` values hardcode `-30d`. `A3-1` | blocker | An analyst sets 90 days, reads 30-day data, and cannot tell. On screens where the range *is* live they then export a file whose header row and filename both say 30 days and hand it to a stakeholder. Neither error is detectable from inside the product. This is not a missing feature — it is the product silently reporting the wrong number. | Thread `useFilters()` into `ExportButton` so the window header and filename suffix derive from `filters.window.label`; drop the hardcoded `-30d` from the 15 call sites. Replace the fire-once toast with a persistent inline banner on non-live screens, or disable the pill so it cannot display a scope the page does not honor. | days (export half: hours) |
| 12 | **Six toasts assert that work happened when nothing did.** `A4-3` | high | A prospect believes they queued prompts ("N prompts queued for tracking — first run lands with tomorrow's sample"), filed action #93, and **sent a request to a human** ("A strategist scopes it within 2 business days" — `requestBuild()` contains no fetch). Nothing arrives. These break the honesty contract the rest of the app upholds well, and the trust cost lands on the first support conversation. | Six copy edits matching the codebase's existing honest pattern. `ReportBuilder.generate` can instead be made genuinely real in ~1 hour by reusing `lib/export/report.ts`, which 12 other buttons already use. | hours |
| 13 | **Onboarding collects brand, competitors and topics, then discards all three.** `A4-4` | high | Enter `acme.com` and you are shown Nike's competitors, Nike's running-shoe topics and "412 prompts across 5 platforms". The first three screens a new customer touches produce a result that visibly contradicts their input — the worst possible place for the illusion to break. | Persist a draft workspace record at step 1 and read it back on each step; derive step-2 suggestions and step-3 topics from the entered domain; have `/app/welcome` echo the real counts. | days (after #1) |
| 14 | **Topic prompt counts were forced to total 412 by making Sustainability Nike's biggest topic**, and onboarding ships a third, different split. `A6-2` | high | The demo asserts Nike tracks 139 Sustainability prompts and 104 Basketball-gear prompts against 64 for Running shoes — for a workspace whose every other surface is running-shoe content. Any athletic-brand prospect reads that as a system that does not understand their category. The CSV turns the artifact into prose: "Sustainability — the biggest single topic". | Re-derive five counts where Running shoes leads and the set still totals 412; hoist the `{topic, prompts}` pairs into `lib/data/insights.ts` so `insights/page.tsx`, `insights/reports.ts` and `onboarding/prompts/PromptSet.tsx` all read one array. | hours |
| 15 | **The tracked competitor set is a 1:1 positional find-replace, and the app's own researched corpus names different rivals.** `A6-3` | high | The competitor table shows Puma 18.9% and Under Armour 15.2% in running-shoe answers, while the Conversation Explorer two clicks away — the one genuinely researched module, HTTP-200-verified — names Brooks, Asics, Hoka, New Balance and Saucony. Under Armour appears **zero** times in all six transcripts, yet leads Sustainability and leads Japan. It reads as a template with the names swapped. | Replace Puma and Under Armour with Brooks and Asics (keep Adidas, New Balance) across the ~15 files carrying the four names, keeping each series/rank attached to the right colour. Reassign "leads Sustainability" to Adidas and Japan's leading brand to Asics. | 2–3 days |
| 16 | **In-app 404s eject a signed-in user onto the marketing site.** `app/not-found.tsx` is the only boundary and imports the marketing Nav/Footer. `A3-5` | high | Any mistyped or stale in-app URL — including `/app/actions/87`, which the product's own weekly summary **and** its support assistant both name — throws the user out of the application and offers "Get a demo" as recovery. No link back to the workspace exists. | One `not-found.tsx` inside the `app/(dash)` route group, reusing the existing shell with workspace-relative recovery links. The copy already exists. | hours |
| 17 | **The ⌘K palette and the Prompts search box are non-functional props that never admit it.** `A3-2` | high | The workspace advertises 412 prompts, 1,284 citations, 141 domains and 2,841 conversations, and "Search ⌘K" is the second sidebar item. Typing does nothing, and neither input toasts — this is the only class of dead control in the app that stays *silent*, so it teaches the user that silence no longer means success. The `WhatsNew` panel's only entry point in the entire app is behind the broken palette. | Controlled state over the existing fixture arrays plus a real zero-results state; delete the shipped `No results for "citatons"?` frame artifact. If real search is out of scope, make both inputs `readOnly` with an honest note. | days |
| 18 | **Filter and drill-down state lives only in React state — nothing is in the URL.** `A3-3` | high | An analyst cannot send a colleague "Perplexity share-of-voice over 90 days" — the link always opens on the 30-day all-platform default. No bookmarking, no Back-as-undo, and a reload silently changes the numbers on screen. There is no reset control anywhere. | Move range and platform into the URL via `useSearchParams`/`router.replace` (or nuqs), initialised from `searchParams` in `FilterProvider`. Add a Reset affordance when any non-default filter is active. | days |
| 19 | **The Overview is a read-only poster whose prose names things you cannot click.** 14 anchors total, 3 in content; `/app/actions/[id]` does not exist. `A3-4` | high | The core job — "what changed and what do I do about it" — dead-ends. The summary says "action #87 targets this"; #87 is unopenable and 404s. An analyst who sees "Claude 27.7% ↓0.8" cannot click through to find which prompts lost Claude visibility. | Add a generic `/app/actions/[id]` route so every queue card is a link, then wire the six Overview drill-downs (KPI cards, platform rows, competitor rows, cited-source rows, summary entity mentions) — which requires the target screens to accept an incoming scope. | weeks |
| 20 | **The application has one heading and zero landmarks.** Verified in served HTML: `/app/overview` returns `{headings: 0, mainLandmarks: 0, lists: 0, paragraphs: 0}`. `A5-1` | blocker | No screen-reader user can navigate any of the 71 routes: no heading list, no landmark list, no skip link, no document outline. Fails WCAG 1.3.1, 2.4.1 and 2.4.6 on every page, which makes the product unsellable to any buyer with a VPAT requirement. Commercially sharper: **Answr sells answer-engine optimization and its own marketing site ships zero headings, zero paragraphs and zero structured data** — a prospect can view-source in ten seconds. | `<main id="content">` in the dash/marketing/auth layouts plus a skip link; promote the Topbar crumb to `<h1>`, card titles to `<h2>` (styling is inline, so the tag swap is visually inert); convert the repeated grid-of-divs tables to `<table>` with `<th scope>`; add JSON-LD to marketing routes. | weeks |
| 21 | **None of the 10 dialogs trap focus, hide the background, or restore focus on close.** With the Export dialog open: 8 focusables inside, **40 still reachable outside**, `bodyInert: false`; Escape drops focus to `<body>`. `A5-2` | blocker | A keyboard user Tabs out of any dialog after 8 stops into a page hidden under a 60%-opacity backdrop. Because `aria-modal="true"` is set but the background is neither `inert` nor `aria-hidden`, screen-reader focus lands on nodes the AT is actively suppressing — focus moves, nothing is announced. Every write path in the product (Add brand, New segment, Add prompts, Create action, Run history, Export, Report wizard) is uncompletable by keyboard. | One `useDialog(ref, {open, onClose, returnFocusTo})` hook — store `activeElement`, focus the dialog, set `inert` on the layout wrapper, cycle Tab, restore focus and clear `inert` on close — applied to all 10, replacing each hand-rolled Escape effect. Prefer `<dialog>`+`showModal()` where markup allows. | days |
| 22 | **~30 selected-state controls ship white on accent at 3.32:1.** The A2 fix was applied only to `.btn-ac`. `A5-3` | high | In every one of these patterns the accent fill marks the **currently selected** option, so the one control a low-vision user most needs to read — which date range, which platform tab, which pricing plan — is the least legible text on the screen. On `/pricing` this is the monthly-vs-annual toggle that determines the prices being read. | One `.seg-on` / `.pill-on` class in `globals.css` using the same `color: #0e0f11` as `.btn-ac` (5.79:1), replacing ~30 inline `color:"#fff"` + `background:"var(--ac)"` pairs across ~25 files. | hours |
| 23 | **The global focus-ring fix is nullified on 10 form fields by inline `outline:"none"`.** Verified live: `login-password` matches `:focus-visible` and computes `outline: none, border: 0px none`. `A5-4` | high | A keyboard-only user cannot tell which field they are typing into on the login form, the signup and demo lead forms, the onboarding brand step, the ⌘K palette, the Add-brand and New-segment modals, workspace settings and support chat. WCAG 2.4.7 fails on the first screen a customer ever sees. On `/app/settings/workspace` the fields have no border, no background and no outline — indistinguishable from static text whether focused or not. | Delete the 10 inline declarations; add `:focus-within` rules on the three composite wrappers whose inputs are borderless by design. | hours |
| 24 | **The entire help and metric-provenance layer is unreachable by assistive tech and by hover.** `aria-describedby` appears **zero** times; five components render `role="tooltip"` and none is referenced by its trigger. `A5-5` | high | `lib/metrics.ts` is the product's honesty layer — where a buyer learns that Share of voice is volume-weighted and where the number comes from. A screen-reader user gets the promise ("About Share of voice: definition, data source and calculation") and never the content. A sighted mouse user cannot move the pointer into the 300px panel to read or copy it without it vanishing (fails WCAG 1.4.13). On `/app/overview`, 16 of 42 tab stops are affordances whose payload is invisible to AT. | `useId()`-derived panel ids + `aria-describedby` on triggers; drop `pointerEvents:"none"`; move open/close handlers to the wrapping span so the pointer can travel into the panel; add Escape-to-dismiss. Consider click-to-pin `role="dialog"` for MetricInfo. | days |

---

## 4. Sequenced roadmap

Four phases. Each blocker above appears in exactly one phase. Estimates assume one focused
full-time engineer; they are calendar weeks, not ideal-day sums.

### Phase 1 — One real metric end to end
**GOAL.** Prove a single metric is computed from a real sampled answer stored in a real
database, prove captured telemetry survives a cold start, and stop the product contradicting
itself.

**Contains:** #1 persistence layer · #2 sampler (pilot scope: 10 prompts × 3 platforms
nightly) · #6 durable telemetry + snippet loaded · #8 Agents dashboard → `summarize()` ·
#9 provider config module · #10 share-of-voice contradiction · #12 the six lying toasts ·
#14 topic counts · #15 competitor set · plus the §4b doc correction and applying
INTEGRATIONS.md §5's own requirement to badge `conversation_mentions` and `demand_volume`
as modeled/beta (today `Explorer.tsx:162` asserts a 2.1M/mo consented panel the company does
not have and cannot buy self-serve).

**EXIT CRITERION.** `visibility_score` for one brand on `/app/overview` is derived from
`prompt_runs`/`answers` rows written by last night's cron, its ⓘ tooltip names the real
source, and `/app/agents` and `/app/live` render the *same* `crawler_events` number from the
same durable store — unchanged after a forced cold start. No two screens report a different
value for the same metric ID.

**Calendar: 4–6 weeks.**
**Run cost: ≈ $25–80/mo** (INTEGRATIONS.md §1 pilot scale) — Perplexity ~$2–5, Gemini $0
(inside the 1,500 grounded requests/day free quota), DataForSEO under $1 usage against a
one-time **$50 minimum funding**, Haiku <$1, optional Vercel Pro $20/seat if the log drain is
wanted. Two line items INTEGRATIONS.md does **not** price and which must be budgeted
separately: the Postgres instance and the Redis/Upstash store.

### Phase 2 — Multi-tenant with auth
**GOAL.** A second customer can exist, sign in, see only their own data, and have what they
type survive the click.

**Contains:** #3 authentication · #4 multi-tenancy (incl. per-workspace ingest tokens and
Redis key namespacing) · #5 write paths behind the ~10 built modals · #7 ingest/collect
hardening and rate limiting · #11 filter honesty + `ExportButton` window threading ·
#13 onboarding persistence · #16 in-app 404 boundary · #21 dialog focus trap ·
#22 selected-state contrast · #23 focus-ring restoration. Also add the missing
`typecheck` and `lint` scripts and the two Playwright guard assertions — unauthenticated
`/app/overview` redirects to `/login`, and a session for workspace A cannot read workspace
B's rows — because this is the phase where that class of regression becomes possible.

**EXIT CRITERION.** Two workspaces exist. Unauthenticated `curl /app/overview` returns a
redirect, not 200. A prompt added by workspace A appears on reload for A and is invisible to
B, including in the telemetry read endpoint. No screen displays a filter scope it does not
honor, and an exported CSV's header row and filename match the selected window. CI runs both
guard tests on every push.

**Calendar: 4–6 weeks.**
**Run cost: unchanged ≈ $25–80/mo** external. The auth provider is not priced in
INTEGRATIONS.md; Auth.js is $0, a hosted provider is not.

### Phase 3 — Full pipeline
**GOAL.** All 31 metrics either resolve from real data or are explicitly and visibly labelled
as modeled — no fixture survives behind a provenance tooltip claiming a real source.

**Contains:** scale the sampler to 412 prompts × 5 platforms daily (adds the OpenAI Responses
`web_search` and Anthropic web-search lanes); the citation normalizer across all four
provider payload shapes plus a registrable-domain library and an alias-based first-mention
extractor (six metrics — `citations_count`, `owned_citation_share`, `cited_source_count`,
`unique_cited_domains`, `answers_with_citation_rate`, `sentiment_mix` — currently have no code
path at all); the Haiku Batch sentiment classifier; DataForSEO Keywords Data behind
`demand_volume`, labelled a prior; time-bucketed telemetry retention so 7d/30d/90d windows are
actually computable; bot IP-range verification to promote events past `declared`; #17 working
search · #18 URL filter state · #19 `/app/actions/[id]` and the Overview drill-downs; and
extending `lib/filters/windows.ts` to the 12 modules that still ignore the range.

**EXIT CRITERION.** Every metric ID rendered in the dashboard resolves through a query
function, not a module constant; `lib/data/*` retains only seed data. `data_quality_sample`
reports a real run-log figure. Every remaining modeled metric carries a visible modeled/beta
badge. A 90-day range selection re-slices every screen that shows the pill.

**Calendar: 6–10 weeks.**
**Run cost: ≈ $600–1,100/mo** at full production scale — Perplexity $90–180, Gemini ~$50
tokens, OpenAI $200–330, Anthropic web search $250–370, DataForSEO AI Overviews ~$15 on the
standard queue. Add sentiment at **$30–60/mo** for 100K mentions (~$2–4 per 10K), demand at
**$3–10/mo** for 10k keywords weekly, and optional Vercel Pro $20/seat + $0.50/GB for drains.
Cloudflare AI Crawl Control is free on all plans. Fallbacks if a parser breaks: SerpApi
$150–275/mo, Bright Data $19–43/mo.

### Phase 4 — Polish
**GOAL.** The product is operable by every user and defensible in front of an enterprise
procurement checklist.

**Contains:** #20 the semantic pass — landmarks, heading outline across 71 routes, table
conversions, skip link, JSON-LD · #24 accessible help/provenance popovers · responsive
breakpoints (no `@media` rule exists in the codebase beyond `prefers-reduced-motion`, and all
36 screens use per-element inline styles, so this needs a layout-primitive extraction pass
first) · `robots.ts`/`sitemap.ts`/OpenGraph — currently `/robots.txt` and `/sitemap.xml` both
404 · `loading.tsx`/`error.tsx` boundaries and a data-freshness stamp · 24×24px minimum target
sizes · `role="alert"` + `aria-invalid` on the two dashboard modals with silent validation ·
the six `role="menu"` widgets (either implement the ARIA pattern or drop `role="menu"` for an
honest disclosure) · derived sidebar counts · the seven unwired settings fields · surfacing
Content Score and Capability Map in navigation · Topbar crumb reading the selected brand.

**EXIT CRITERION.** An automated axe pass is clean on a representative 10 screens; the full
Add-brand → New-segment → Add-prompts → Create-action → Export flow is completable by keyboard
alone; the dashboard is usable at 768px; `/robots.txt` and `/sitemap.xml` return 200; and
Answr's own marketing site passes the `page_health` checks Answr sells.

**Calendar: 4–6 weeks.**
**Run cost: no new external spend.** The licensed conversation panel behind
`conversation_mentions` remains out of scope at any phase — five-to-six figures and months of
contracting, with no self-serve equivalent anywhere in 2026.

**Total: roughly 18–28 weeks — five to seven months — to a product a paying customer could be
onboarded onto.**

---

## 5. What is already genuinely done

This is a long list, and it matters for judging what remains. None of the following should be
re-litigated.

**The spec layer**
- `lib/metrics.ts` is a precise, honest 31-metric dictionary — source, calculation and cadence
  per metric, with the `position_weight × platform_weight` scoring formulas specified verbatim.
  A real pipeline can be built directly against it; it needs no redesign, only implementation.
- `INTEGRATIONS.md` is a researched, priced, source-cited integration plan with per-metric
  feasibility tags (`now` / `needs-key` / `needs-contract` / `build-required`), a costed pilot
  spec, and a §5 that names its own constraints — including the ones the product currently
  violates. The plan is sound; the code to execute it is what is missing.
- The fixture layer is unusually well documented *as* fixture, with header comments in
  `lib/data/*` stating what was reverse-engineered from design frames.

**The telemetry prototype — the one real thing**
- `proxy.ts` correctly uses `event.waitUntil()` with a matcher that excludes its own ingest
  route; non-bot traffic costs one string scan.
- `lib/telemetry/` has a clean `TelemetryStore` interface with memory and Upstash-REST
  implementations, correct pipelining, `LPUSH`/`LTRIM`, `SET NX EX` idempotency claims, a
  degraded-mirror fallback, and auto-activation on env vars. It is production-shaped and
  needs credentials, not code.
- The full `proxy.ts` → `/api/ingest` → store path is verified working end to end
  (`observedVia: 'proxy', recorded: true`).
- `public/snippet.js` is a real, correct ~1KB first-touch referral snippet — `sendBeacon`, no
  cookies, session-deduped. `lib/bots.ts` is a 20-bot UA catalog plus AI-referrer table.
- `/app/live` is genuinely excellent and is the model the rest of the product should copy: it
  polls every 10s, stamps "Listening · {store} · updated {ago}", sets an error flag on fetch
  failure, and is honest **in print** about its own durability limit.

**The build and the shell**
- `npx tsc --noEmit` exits 0; `npm run build` is clean — 71 static pages, 2.2 MB total static
  output, 224 KB largest chunk. No `page.tsx` is a client component (91 client leaves under
  server pages). The 11 ResizeObserver-backed charts are not a measurable render risk.
- **Zero dead controls** — verified by parsing every `<button>` opening tag for a handler
  across 158 `onClick` sites. That claim genuinely holds.
- The honesty layer is real and disciplined: ~110 controls carry specific, accurate
  "needs a live workspace" copy rather than failing silently. Its *delivery* needs rework
  (§6), but its existence and accuracy are an asset, not a liability.
- Correct modal semantics throughout: every dialog has Escape, `aria-modal` and backdrop
  close. A real empty state exists at `/app/welcome`. Prompts has a working master-detail.
- `lib/filters/windows.ts` is well built and honest about how it back-fills history; six
  modules re-slice correctly on the date range today.
- `lib/export/report.ts` is real CSV export machinery genuinely used by 12+ buttons, with
  per-module report specs already written — reusable for the "view as table" accessible chart
  alternative and for `ReportBuilder.generate`.
- `ReportBuilder`'s inline, persistent, specific confirmation is the correct pattern and is
  already shipped — it should be propagated, not invented.

**The help layer**
- Plain-English `Hint` tooltips plus ⓘ `MetricInfo` provenance popovers on every KPI,
  consistently across all 36 screens, backed by the metric dictionary. The content is right;
  only its accessibility and hover geometry need fixing.

**Data integrity within each screen** (verified programmatically, not by eye)
- Every daily series' last point equals the headline above it, and every delta equals
  endpoint − start, across `overview.ts`, `insights.ts`, `infra.ts`, `audiences.ts`,
  `evidence.ts` and `demand.ts`.
- Weekly clicks sum exactly to their legend totals (1,842 / 1,204 / 926 / 512 / 388); the four
  crawler series sum exactly to the Agents table; `citationsDaily` sums to exactly 1,284; the
  Citations share column is exactly count ÷ 1,284 for all seven rows; the heatmap's per-cell
  deltas average exactly to each topic's Δ30d; the SoV table sums to exactly 100.0 at every
  window; and appearances ÷ 412 reproduces platform visibility to the decimal.
- `lib/data/conversations.ts` is genuinely researched from live pages with HTTP-200-verified
  URLs and real product specifics — the strongest content in the app, and the reason the
  competitor-set mismatch (#15) is worth fixing rather than ignoring.
- No pre-rebrand fictional brand string survives in any shipped route; dates are canonical
  apart from one leftover axis label.

**Accessibility fixes that did hold**
- The faint-text contrast fix genuinely holds: `--fnt: #82848d` computes to 4.97:1 on `--bg1`,
  4.79:1 on `--bg2` and 5.16:1 on `--bg0` — AA on every surface it is used on, with no
  `#686a72` left in shipped code.
- The focus ring works correctly for buttons and links (verified with a real Tab press:
  `outline: solid 2px rgb(142,124,242)`). Only the 10 inline overrides defeat it.
- `role="alert"` on form errors is already used correctly in four auth/marketing forms — the
  pattern exists in-repo and only needs carrying into two dashboard modals.

---

## 6. UX priorities

Separate from infrastructure. Ordered by leverage — what most changes the product's *feel*
per unit of effort. Several are hours of work and should not wait for a phase.

1. **Never display a scope the screen does not honor.** The single highest-leverage change in
   the product. Either a persistent inline banner above the content on the 26 affected screens
   ("Showing the fixed 30-day sample — the 90-day range applies on Overview, Citations and
   Insights") or a disabled pill. A fire-once 3.6-second toast cannot explain a permanent
   state. Ship the `ExportButton` half first — one hook, one prop, 15 call sites, a few hours —
   because it is the one that leaves the building inside a stakeholder's CSV.

2. **Replace the toast-as-explanation layer with persistent banners.** ~108 controls across 67
   distinct messages currently deliver their explanation through one non-dismissable,
   non-queued, bottom-center toast that overwrites its predecessor and disappears in 3.6
   seconds. Four seconds after arrival, Settings (29 controls), Workflows (10), Demand (8) and
   Data quality (11) are indistinguishable from broken screens. One dismissable banner per
   read-only screen, plus `ReportBuilder`'s inline-confirmation pattern for flows that produce
   a result, and toasts reserved for things that actually happened (exports, downloads).

3. **Make the two silent dead controls honest or working.** The ⌘K palette and the Prompts
   search box are the only controls in the app that accept input and say nothing — everything
   else at least toasts, so silence currently reads as success. Client-side substring filtering
   over the existing fixture arrays plus a zero-results state is ~2 days; making them
   `readOnly` with the existing note is a few hours. Delete the shipped
   `No results for "citatons"?` frame artifact either way.

4. **Give the Overview somewhere to go.** Add `/app/actions/[id]` so every queue card opens —
   this alone fixes the 404 that the weekly summary and the support assistant both point at —
   then wire the KPI cards, platform rows, competitor rows and cited-source rows to
   pre-scoped destinations. "What changed and what do I do about it" is the core job, and it
   currently dead-ends in prose with 3 clickable things on the page.

5. **Add a dashboard-scoped `not-found.tsx`.** Hours of work. A signed-in user hitting a stale
   URL should not land on the marketing site being offered a demo.

6. **Add freshness, loading and error states.** No `loading.tsx`, `error.tsx` or `Suspense`
   exists anywhere; every time string outside `/app/live` is a frozen literal ("2h ago",
   "Next run in 6h 12m", "last sync 6 min ago") that never changes, and the Overview carries no
   freshness stamp at all. For a monitoring product this is the difference between a dashboard
   you act on and one you second-guess. `/app/live` already demonstrates the exact pattern.

7. **Stop the chrome contradicting the content.** Sidebar badges are five string literals that
   disagree with the pages they point at — most damningly on `/app/welcome`, where the empty
   state correctly renders em-dashes while the navigation beside it asserts 1,284 citations and
   412 prompts. Derive them, and suppress them on an empty workspace.

8. **Put filter state in the URL and add a Reset.** Shareability, bookmarking and Back-as-undo
   all come from one change, and it removes the silent scope-loss on reload.

9. **Make the page-local pills actually filter.** Most sit directly above 5–30 fixture rows in
   the same file. Where genuinely impossible, render the option disabled with an inline reason
   rather than letting it be selected and then lie.

10. **Fix the seven fields that eat input**, including the workspace's own display name — no
    Save control exists on the Settings page at all. Wire them to local state with an explicit
    Save that fires the existing honest toast, or mark them `readOnly` with the note the
    surrounding chips already use. Add a confirmation step to the tracked-platform toggles:
    turning off a platform stops data collection and deserves an are-you-sure even when live.

11. **Surface the two orphaned modules.** Content Score and Capability Map are fully built,
    return 200, and have zero inbound links from anywhere in the app. Add them to the sidebar
    and the ⌘K index. While there, replace the hardcoded `Nike` in the Topbar crumb so the
    brand switcher stops contradicting every page header.

12. **Expand hit areas to 24×24.** Eleven of 20 buttons on `/app/actions/92` are below the WCAG
    2.2 minimum, including the "Mark done" checklist toggles at 16×16 and the adjacent `?` and
    `i` glyphs in every KPI card. A transparent wrapper with `padding: 5px; margin: -5px`
    leaves the visual design untouched and inherits to every call site.
