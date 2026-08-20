# Audit prompt — Answr (useanswr.com)

Paste everything below the line into a fresh agent session with repo access.

---

You are auditing a production web application to determine what must be fixed before it
is put in front of paying clients. Your output is a defect list an engineer can work
through, not an essay. Assume the people reading it are busy and skeptical.

## 1. The system

**Live:** https://useanswr.com (apex; `www` also resolves). Hosted on Vercel.
**Repo:** `~/Desktop/PROJECTS/answr` — Next.js 16 (App Router, React 19, TypeScript,
Tailwind v4 present but most styling is inline styles + per-page CSS).
**Dashboard access:** the app is behind a shared-passphrase gate. Sign in at `/login`
with `dana@nike.com` / `answr-demo`. The credential is printed on the login card by
design. Gate logic: `lib/gate.ts`, enforced in `proxy.ts` (Next 16 renamed
Middleware → Proxy), session issued by `app/api/session/route.ts`.

**What the product claims to be:** an Answer Engine Optimization (AEO) platform. It
monitors what AI assistants (ChatGPT, Perplexity, Google AI Overviews, Claude, Gemini)
say about a brand, traces the citations behind those answers, quantifies demand, watches
AI crawler traffic, and turns gaps into a scored action queue.

**Surfaces:** ~28 marketing routes under `app/(marketing)`, ~36 dashboard routes under
`app/(dash)/app`, auth/onboarding under `app/(auth)`.

**Key docs in-repo** — read these before you start, they define intended behavior:
`METRICS.md` (31-metric data dictionary), `INTEGRATIONS.md` (how each metric would be
fed by real data), `READINESS.md`, `BUILD_CONVENTIONS.md`,
`INTERACTIVITY_CONVENTIONS.md`, `WIRING_CONVENTIONS.md`, `NAVIGATION.md`.

## 2. What is intentional — do not report these as defects

Report anything that *deviates* from these, but not the design decisions themselves:

- **All product metrics are fixtures.** There is no database and no live sampling. The
  demo workspace is "Nike" with competitors Adidas / Puma / Under Armour / New Balance.
  Numbers are hardcoded in `lib/data/*`. That is known.
- **The passphrase gate is not authentication.** No accounts, no per-user session, no
  authorization. Known and documented in `lib/gate.ts`.
- **The dashboard is desktop-only** below 900px, guarded by a deliberate interstitial
  (`SmallScreenGate`). Marketing *is* fully responsive and must stay that way.
- **`/app/live` is the one real data path** — first-party AI-crawler and referral capture
  on this deployment. Storage is an in-process ring buffer, so a cold serverless instance
  legitimately shows zero. Durable storage activates automatically if KV env vars appear.
- Certain screens intentionally render date/platform filter pills as **inert** because
  they cannot re-slice; that is a deliberate honesty fix, not a bug.

**However:** if any of the above is implemented *inconsistently* — e.g. a screen claims a
scope it doesn't honor, a "real data" badge sits on fixture data, the gate can be bypassed
— that IS a defect and is high severity.

## 3. Method — evidence, not assumption

This is the part that matters most. A finding without evidence is noise.

- **Actually exercise the app.** Log in, click every control, submit every form, open
  every modal, switch every tab, toggle every toggle, download every export and *open the
  file*. Do not infer behavior from reading source alone; do not infer it from a
  screenshot either.
- **Verify claims in both directions.** If a page says "412 prompts tracked", find where
  that number comes from and check every other place it appears. If a chart says a metric
  ends at 34.2%, check the KPI card above it agrees.
- **Prove each defect reproduces.** Give exact route, exact steps, expected vs actual.
- **Distinguish "unfinished" from "broken."** Both belong in the list; they are triaged
  differently.
- **When you are unsure, say so.** Mark confidence. Do not pad the list.
- Run the real gates yourself: `npx tsc --noEmit`, `npm run build`, and check the
  browser console and network tab on every route you visit.

## 4. Dimensions to audit

### A. Functional completeness
Every interactive control: does it do something real, something honest-but-simulated, or
nothing? Enumerate dead controls, controls whose effect is invisible, forms that accept
input and discard it silently, and flows that dead-end. Pay attention to: search inputs,
the ⌘K palette, pagination, bulk-select, modals (do they close on Escape / backdrop /
after submit?), and anything that says "create", "add", "run", "generate" or "save".

### B. Data integrity and internal consistency
The fixture data tells a story; find where the story contradicts itself. Cross-check every
number that appears in more than one place (KPI vs chart endpoint vs table vs export vs
sidebar count). Check that deltas equal the arithmetic they claim (endpoint − start).
Check that percentage tables sum correctly. Check dates are internally coherent. Check the
sidebar counts match the pages they point at. **Report every mismatch with both values and
both locations.**

### C. Backend and technical
API routes under `app/api/**`: correctness, error handling, input validation, status codes,
and what happens on malformed input. The telemetry pipeline (`proxy.ts`, `lib/telemetry/**`,
`app/api/ingest`, `app/api/collect`, `app/api/telemetry/**`): does it capture correctly,
handle failure, and avoid unbounded memory growth? Look for: unhandled promise rejections,
floating promises that a serverless instance could tear down mid-flight, missing `await`,
race conditions, and anything that would break under concurrency.

### D. Security
Assume an adversarial visitor. Can the gate be bypassed (direct route access, API routes,
static assets, `_next/data` payloads, RSC payloads)? Are the API routes authenticated at
all — can an unauthenticated caller POST to the ingest/collect/session endpoints, and what
damage does that do? Is the session cookie set with the right flags? Any secrets, tokens,
internal URLs or PII in client bundles? Any XSS surface via `dangerouslySetInnerHTML` or
unsanitized input reflected into the DOM? Rate limiting anywhere? Note that this is a demo
— but state clearly which findings become critical the moment real client data exists.

### E. Correctness under real conditions
What breaks when the happy path doesn't hold: empty states, zero values, very long strings,
missing data, slow network, offline, double-clicks, rapid navigation, browser back/forward,
direct deep-links to sub-routes, and page refresh mid-flow. Check that client-side state
that *should* persist does, and state that shouldn't, doesn't.

### F. UI/UX quality
Visual consistency against the design system (tokens in `app/globals.css`); spacing and
alignment; hover/focus/active/disabled states; loading and error states (the app has very
few — flag where their absence is felt); information hierarchy; whether a first-time user
can understand what each screen is for. Check the tooltip layer (`components/ui/Hint.tsx`)
renders correctly everywhere including near viewport edges and inside `overflow:hidden`
cards. Note anything that reads as unfinished.

### G. Accessibility
Keyboard traversal of every interactive element with a visible focus indicator; logical
focus order; focus trapping and restoration in modals; semantic landmarks and heading
order; form labels; ARIA correctness (especially `aria-expanded`, `aria-selected`,
`aria-disabled`, `role="tooltip"`); color contrast against WCAG AA for both text and UI
elements; screen-reader sanity on at least the login, overview and one data-table screen.
Flag any interactive element that is a `div` with no role.

### H. Responsive and cross-device
Marketing at 320 / 375 / 414 / 768 / 900 / 1024 / 1440 / 1920: no horizontal scrolling,
no clipped content, tap targets ≥ 40px. Confirm the 901–1000px band specifically (a
previous fix addressed a nav-width hole there). Dashboard: confirm the small-screen
interstitial appears and that "Continue anyway" degrades gracefully. Test at least one
real mobile browser engine if you can.

### I. Performance
Bundle sizes per route, largest client components, unnecessary client-side JS
(`"use client"` on things that could be server components), image/SVG weight, render
blocking, Core Web Vitals on the marketing home and the dashboard overview. Flag any route
whose JS payload is disproportionate.

### J. SEO, metadata and sharing
Per-route `<title>` and meta description quality and uniqueness; Open Graph and Twitter
card tags (does a shared link preview correctly?); `robots.txt` and `sitemap.xml` presence
and correctness; canonical URLs — confirm nothing still references the old
`answr-ruby.vercel.app` origin; structured data; whether the gated dashboard is correctly
excluded from indexing.

### K. Content, copy and legal exposure
Typos, grammar, inconsistent terminology, and placeholder text that survived. Naming
consistency for product modules across marketing and app. **Specifically flag:** any claim
presented as fact that the product cannot substantiate; any third-party attribution
(review platforms, certifications, compliance badges); and any use of a real company's
name or mark. Report these plainly with location and exact wording — the business owner
will decide what to do, your job is to make sure nothing is invisible to them.

### L. Code health and maintainability
Dead code and unused files; duplicated logic that should be shared; `any` types and
suppressed errors; TODO/FIXME comments; stale or contradictory documentation; leftover
scratch or duplicate files; inconsistent patterns between sibling modules. Note the
riskiest files to change (highest complexity × highest coupling).

## 5. Severity

- **P0 — Blocker.** Broken for clients, data-losing, or a security/legal exposure. Do not
  ship client-facing until fixed.
- **P1 — Major.** Materially damages credibility or usability; a client will notice.
- **P2 — Minor.** Worth fixing; a client might notice.
- **P3 — Polish.** Improves quality; nobody will notice if it slips.

Also tag each finding: `broken` (works incorrectly) · `missing` (never built) ·
`inconsistent` (contradicts itself elsewhere) · `risky` (works now, will break later).

## 6. Output format

Deliver a single markdown document, `AUDIT_FINDINGS.md`, with:

1. **Verdict** — three sentences: is this client-ready, and if not, what is the shortest
   path to yes.
2. **Top 10 by priority** — the list to work through first, each with a one-line why.
3. **Full findings**, grouped by dimension, each as:

```
### [P1 · broken] Short title
**Where:** route and/or file:line
**Steps:** how to reproduce
**Expected / Actual:**
**Why it matters:**
**Fix:** concrete suggestion, with effort estimate (minutes / hours / days)
**Confidence:** high / medium / low
```

4. **What is genuinely good** — be specific and honest; this calibrates the rest.
5. **Effort summary** — total estimated work to clear P0s, then P0+P1.
6. **Explicitly not audited** — anything you could not reach, and why.

## 7. Rules

- Do not fix anything. This is an audit; report only.
- Do not report the same underlying defect in multiple dimensions — cross-reference.
- Do not inflate the count. Fifteen real defects beat sixty speculative ones.
- If a whole dimension is clean, say so in one line and move on.
- Where you assert a number, show where you got it.
