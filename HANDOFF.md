# Answr — Buyer Handoff & Activation Guide

_Last updated: 20 Aug 2026._

This document is the activation guide for a new owner. It says exactly what to plug in,
in what order, what each step unlocks, and what still needs to be built before Answr is a
fully live product. It is deliberately honest — the same discipline as the in-app "runs on
live workspaces" copy.

---

## 1. What you're buying (one honest paragraph)

Answr is a **complete, polished, type-clean Next.js 16 front-end** for an Answer Engine
Optimization platform — 68 routes, a 31-metric dictionary (`lib/metrics.ts`), a real CSV
export engine, a working demo across the whole product, **one genuinely live data pipeline**
(first-party AI-crawler telemetry: `proxy.ts → /api/ingest → lib/telemetry → /app/live`), and
a **wire-up layer** (`lib/providers`, `lib/sampler`, Settings › Integrations) that activates the
answer-sampling engine the moment you add API keys. Today the dashboard runs on demo fixtures
(a "Nike" workspace). Making it a live product for real customers means (a) adding provider keys,
(b) provisioning a durable store, and (c) building the persistence + auth + scoring layer
described in §4. Steps (a) and (b) are configuration; step (c) is engineering.

---

## 2. What the sale-readiness pass already did (all $0, done)

These are committed on `main`:

- **Removed unsubstantiated marketing claims** — SOC 2 / GDPR-compliant / "pen-tested" /
  99.9% contractual SLA / the G2 "4.8 · Leader" badge / a fabricated Fortune-500 testimonial /
  a fake 2.1M-conversation panel and AWS/Cloudflare/Postmark subprocessor list. The `/security`
  page was rewritten to describe the product's real, defensible data model, with compliance
  framed honestly as a roadmap.
- **Deleted `/app/capability-map`** — an internal competitor teardown that was reachable by URL.
- **Rewrote 6 misleading toasts** (reports request/generate/schedule, add-prompts, create-action)
  to the app's honest demo-vs-live pattern.
- **SEO baseline** — added `robots.txt`, `sitemap.xml`, a branded Open Graph image, and full
  social/canonical metadata (all were missing/404).
- **Accessibility** — `<main>` landmarks + a skip link in every layout, and restored the keyboard
  focus ring on the login/signup/demo/onboarding forms.
- **Telemetry** — wired the referral snippet into the site (it was never loaded), fixed its stale
  host, and added an honest "Demo data" badge on `/app/agents` pointing to the real `/app/live`.
- **Engine scaffolding** — the provider layer, sampler, answer store, cron endpoint, and the
  Settings › Integrations page (see §3).
- **Build hygiene** — pinned Node (`engines` + `.nvmrc`).

`next build` and `tsc --noEmit` are clean.

---

## 3. Activation checklist (configuration — mostly a buyer, some already possible)

Set these in your host's environment (Vercel → Project → Settings → Environment Variables),
then redeploy. **Settings › Integrations** in the app reflects live status for each. Order is by
value-per-effort.

| # | Set | Unlocks | Cost |
|---|-----|---------|------|
| 1 | `DEMO_PASSWORD` | Rotates the demo gate off the default passphrase. | $0 |
| 2 | `ANSWR_INGEST_SECRET` | Hardens `/api/ingest` + `/api/collect` against forged telemetry. | $0 |
| 3 | `KV_REST_API_URL` + `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` + `_TOKEN`) | Durable telemetry **and** durable sampled-answer storage (no code change — both stores auto-activate). | Free tier → ~$10/mo |
| 4 | `PERPLEXITY_API_KEY` | Primary answer-sampling lane (visibility, citations, share-of-voice). | ~$2–5/mo pilot |
| 5 | `GEMINI_API_KEY` | Grounded Gemini lane. | Free at pilot volume |
| 6 | `DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD` | Google AI Overviews + demand prior. | $50 min funding |
| 7 | `ANTHROPIC_API_KEY` | Claude lane + Haiku sentiment. | <$1/mo pilot |
| 8 | `OPENAI_API_KEY` | ChatGPT lane. | usage-based |
| 9 | `CRON_SECRET` | Arms the nightly sampler (`vercel.json` cron → `/api/runs/execute`). Without it the sampler stays inert even though the cron is scheduled — deliberate, so it never spends unattended. | $0 |

After 3–9: open **Settings › Integrations**, click **Test connection** on each provider to confirm
the key works, then let the daily cron run (or `POST /api/runs/execute` with the bearer secret to
run it now). Sampled runs land in the answer store.

> **Note on the provider clients** (`lib/providers/*.ts`): these target the endpoints documented in
> `INTEGRATIONS.md` (Aug 2026). They typecheck and are structured for each provider's response
> shape, but they were written without a live key — **verify each against the provider's current API
> docs** when you connect it. The interface (`sample() → { text, citations }`) is stable; only the
> per-provider request/parse details may need a tweak.

---

## 4. Remaining engineering to be a fully live product (build — the real work)

This is the "~5–7 months" part. None of it is blocked by the scaffolding — it plugs into it.

1. **Persistence layer.** No database yet. Add Postgres (Neon/Supabase/Vercel) + an ORM
   (Drizzle/Prisma). Minimum schema in `READINESS.md` §3 (blocker #1): `users`, `workspaces`,
   `workspace_members`, `brands`, `prompts`, `prompt_runs`, `answers`, `citations`, `competitors`,
   `watched_domains`, `platform_config`, `actions`. Port `lib/data/*` from constants to query
   functions (keep the fixtures as seed data). The answer store (`lib/sampler/store.ts`) is a
   landing zone; back it with (or migrate it into) this schema.
2. **Authentication + multi-tenancy.** Today it's one shared passphrase (`lib/gate.ts`). Add a
   real identity provider (Better Auth self-host is $0; Clerk/Auth0/WorkOS are managed) issuing an
   httpOnly session; guard `/app/*` in `proxy.ts` (keep the bot branch ahead of it) **and** in the
   dashboard layout. Thread a `workspace_id` through every query, resolved server-side from the
   session — never from a client value.
3. **Scoring.** Turn accumulated `prompt_runs` + `answers` into the 31 metrics using the formulas
   already written verbatim in `lib/metrics.ts` (e.g. `visibility_score`, `share_of_voice`). This is
   the step that replaces the fixtures on Overview/Insights/Citations with real numbers.
4. **Prompt-set management + write paths.** Wire the existing modals (Add prompts, Create action,
   team invites, etc.) to server actions that persist. The UI is built; the mutations are not.
5. **Lead capture.** The demo/snapshot/signup forms don't send anything. Add an `/api/lead` route +
   an email/CRM key (Resend free tier ~3k/mo; HubSpot free) so inbound leads are delivered/stored.

---

## 5. Before you go public (compliance, legal, references)

- **Legal documents** — Privacy Policy, Terms, DPA. Signup currently references docs that don't
  exist. Start from Basecamp's open-source (CC-BY) policies ($0), then get a lawyer review
  (~CAD 760) — the **DPA is the part you can't cheaply fake** and is what enterprise procurement reads.
- **Reinstating the removed claims** — only if you make them true: SOC 2 (~$25–80k **plus** a
  months-long observation window, earliest ~Q2 2027), penetration test (~$2.5–15k), a real status
  page for any SLA. Until then, leave them off.
- **Customer references** — the Bell Media and MTY Food Group case studies (kept per owner
  direction) name real companies with specific results. Confirm you have written permission and
  true numbers, or replace them, before selling — named-logo + invented-result pages carry
  trademark / false-endorsement risk that transfers to a buyer.
- **Vercel Pro ($20/mo)** — required for commercial use on Vercel (Hobby is non-commercial only);
  also unlocks log drains that scale crawler telemetry beyond edge-proxy capture.

---

## 6. Optional $0 demo polish (deferred — nice-to-have, not blocking)

These make the demo more credible to a sharp prospect but are fixture edits a buyer replaces with
real data anyway once §3–4 are done:

- **Topic prompt mix** — `/app/insights` shows Sustainability (139) and Basketball (104) ahead of
  Running shoes (64) for a running brand; the five counts total 412. Re-derive so Running leads,
  keeping the sum and the onboarding split consistent (hoist the `{topic, prompts}` pairs into one
  array in `lib/data/insights.ts`).
- **Competitor set** — the dashboard tracks Adidas/Puma/Under Armour, but the (researched)
  Conversation Explorer cites Brooks/Asics/New Balance. Align them across the ~15 files carrying the
  names so the story is coherent.
- **⌘K palette + Prompts search** — the search inputs look functional but don't filter; either wire
  them to the existing arrays or make them honestly read-only, and drop the "typos still match" line.
- **Soft social proof** — "2,400+ teams" (customers page) is unverified; replace with a real number
  or soften before launch.

---

## 7. Deploy & version control (already set up)

- Repo: `github.com/arman4322-sketch/answr` (private). `main` auto-deploys to **useanswr.com** via
  Vercel. Push to `main` → production in ~30s; feature branches get preview URLs.
- Local: `npm run dev` (or the `answr-web` launch config on port 3201). `npm run build` + `tsc
  --noEmit` must stay clean before pushing.
