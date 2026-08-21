# Answr — Launch Roadmap (What Remains Before Launch)

_What a new owner needs to do to take Answr from a built, deployed platform to a live product
that operates on real data and can sign up, serve, and bill customers. Sequenced, prioritized,
with effort and cost. Prepared for acquisition diligence._
_Last updated: 21 Aug 2026._

---

## How to read this

**Launch** here means the product is live and operable: it runs on real data, a customer can sign
up, use it, and pay. Everything below is the remaining work to reach that point. Once launched, the
platform is the new owner's to run.

The work splits into three tracks that partly run in parallel:

- **A · Activate** — turn the built engine on (mostly configuration; days).
- **B · Complete the payable product** — the few things a live SaaS must have that aren't built yet (engineering; weeks).
- **C · Legal & trust** — what businesses require before they'll buy (parallel; light).

Effort tags: **S** = hours · **M** = days · **L** = 1–3 weeks · **XL** = 1–2 months.
Priority: **P0** = required to launch · **P1** = required to scale/retain · **P2** = later.

None of it is a rebuild — every item plugs into the engine that's already there. Full technical
mechanics are in `HANDOFF.md`.

---

## Track A — Activate the platform (mostly configuration)

The engine is built; this turns it on. Almost all of it is setting environment variables and
verifying.

| # | Task | Priority | Effort | Cost |
|---|------|----------|--------|------|
| A1 | Deploy under the buyer's own **Vercel account** + connect **useanswr.com** DNS; set a commercial plan (Vercel Pro) | P0 | M | $20/mo |
| A2 | Provision a **durable store** (Upstash/Redis) and set `KV_REST_API_URL/TOKEN` — makes persistence, telemetry, leads, and sessions durable across restarts | P0 | S | free tier → ~$10/mo |
| A3 | Set `DEMO_PASSWORD`, `ANSWR_INGEST_SECRET`, `CRON_SECRET` — rotate the demo gate, harden ingest, arm the sampler | P0 | S | $0 |
| A4 | Add **provider API keys** (`PERPLEXITY_API_KEY`, `GEMINI_API_KEY`, `DATAFORSEO_LOGIN/PASSWORD`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) and verify each via Settings → Integrations → Test connection | P0 | M | ~$25–80/mo pilot |
| A5 | **Verify the provider clients** against each provider's current API (they target documented endpoints but were written without live keys — confirm request/response shapes) | P0 | M | $0 (dev time) |
| A6 | Let the **nightly sampler** run (cron → `/api/runs/execute`) and confirm answer runs accumulate in the store | P0 | S | included in A4 |
| A7 | Connect an **email provider** (`RESEND_API_KEY` + `LEAD_NOTIFY_EMAIL`) so transactional and lead email work | P1 | S | free tier |

**Exit of Track A:** the telemetry pipeline, sampler, integrations, and lead capture all run on
durable storage with real provider data flowing in.

---

## Track B — Complete the payable product (engineering)

These are the pieces a live, multi-customer SaaS needs that are not yet built. They plug into the
existing engine (persistence, auth, scoring) rather than starting from scratch.

| # | Task | Priority | Effort | Notes |
|---|------|----------|--------|-------|
| B1 | **Switch real sessions to govern `/app`** — today the demo passphrase still gates the dashboard; make `lib/auth` sessions the access path (JWT-at-edge or node layout guard) and retire the shared passphrase for real customers | P0 | M | Auth system is built + tested; this is the last wiring step |
| B2 | **Feed scoring into the dashboards** — compute the 31 metrics from accumulated sampler runs (the `lib/scoring` engine exists) and render them in place of the `lib/data/*` fixtures on Overview / Insights / Citations | P0 | L | The single biggest "make it real" task; formulas already specified |
| B3 | **Billing / payments** — integrate Stripe (or similar): products for the pricing tiers, checkout, subscription state, plan gating, customer portal. Set the real prices (the tiers + comparison are already designed on `/pricing`). *Required to take money.* | P0 | L | Pricing UI already built |
| B4 | **Multi-tenancy hardening** — thread each request's `workspaceId` from the session through every query (entities are already workspace-scoped; write paths currently use a single "demo" workspace) | P0 | M | Data model already carries `workspaceId` |
| B5 | **Onboarding that persists** — the brand / competitors / prompts a new customer enters should create their real workspace and drive their dashboard (currently discarded, shows the Nike demo) | P0 | M | Onboarding UI is built |
| B6 | **Remaining write paths** — wire the rest of the dashboard mutations (team invites, alerts, watched URLs, saved reports, API-key issuance) to persist via the data layer | P1 | L | Modals are built; a few already persist (prompts, actions) |
| B7 | **Transactional email flows** — signup verification, password reset (UI exists, currently mocked), alert notifications, scheduled report delivery | P1 | M | Depends on A7 |
| B8 | **Conversation / demand panel data** — the conversation-mentions + panel-grade demand metrics need a licensed data panel (Datos-class contract) or must stay clearly labeled "modeled / beta" | P2 | XL / contract | Category-standard constraint; five-to-six-figure licensing if pursued |
| B9 | **Error monitoring + uptime** — Sentry (or similar) + an uptime monitor before real customers depend on it | P1 | S | free tiers |
| B10 | **Support path** — a working support inbox or the existing in-app chat wired to a real destination | P1 | S | SupportChat UI stub exists |

**Exit of Track B:** a real customer can sign up, get their own workspace with their own real
metrics, and be billed.

---

## Track C — Legal, compliance & trust (parallel, light)

Businesses won't buy without these; most are cheap or free.

| # | Task | Priority | Effort | Cost |
|---|------|----------|--------|------|
| C1 | **Finalize the legal docs** — the starter Privacy / Terms / DPA pages exist; have counsel review and complete the bracketed items (entity, jurisdiction, subprocessors, SCCs) | P0 | M | $0 self → ~CAD 760 review → ~$4,500 full |
| C2 | **Confirm or replace customer references** — the Bell Media / MTY case studies name real companies; get written permission + true numbers, or replace with real early customers | P0 | S | $0 (decision) |
| C3 | **Complete the subprocessor list + DPA annex** once real providers are connected (the DPA is what enterprise procurement reads) | P1 | S | $0 |
| C4 | **Security review of the auth system** before production reliance (it's real and tested, but hand-rolled) | P0 | M | $0–low |
| C5 | **Compliance roadmap** — if selling to enterprise, begin SOC 2 (tooling + a months-long observation window) and a penetration test; the site already frames these as roadmap, not claimed | P2 | XL | SOC 2 $25–80k; pen test $2.5–15k |

---

## The minimum path to launch

The fastest honest route to a **live, billable product**. Everything else can follow:

1. **A1–A6** — deploy on your account, durable store, provider keys, sampler running _(days)_
2. **B1** — real sessions govern the app _(days)_
3. **B2** — scoring feeds the dashboards so a customer sees their real numbers _(1–3 weeks)_
4. **B4 + B5** — per-customer workspaces from onboarding _(days)_
5. **B3** — Stripe billing + real prices _(1–3 weeks)_
6. **C1 + C2 + C4** — finalized legal docs, honest customer references, auth security review _(days)_

Realistic elapsed time for a focused technical operator: **roughly 4–8 weeks to a live, billable
product**, front-loaded on B2 (scoring → dashboards) and B3 (billing). Everything in Track A is days.

---

## Cost summary (recurring, once live at pilot scale)

| Item | Cost |
|------|------|
| Hosting (Vercel Pro) | ~$20/mo |
| Durable store (Upstash/Redis) | free tier → ~$10/mo |
| AI provider usage (Perplexity / Gemini / DataForSEO / Anthropic / OpenAI) | ~$25–80/mo pilot → $600–1,100/mo at full production scale |
| Email provider | free tier → ~$15–50/mo |
| Error monitoring / uptime | free tiers |
| Payments (Stripe) | % of revenue, no fixed cost |
| **Optional** — legal review, SOC 2, pen test, conversation-panel license | one-time / as pursued |

**Bottom line:** a few hundred dollars a month in tooling to operate at pilot scale, and roughly one
to two months of focused engineering — dominated by scoring → dashboards and billing — to reach a
live, billable product. None of it is a rebuild; it plugs into the engine that's already there. Once
launched, the platform is ready for the new owner to run.
