# Answr — Sale Listing Copy & Demo Script

Copy-paste source for marketplace listings (Acquire.com, Flippa, MicroAcquire, etc.)
and a broker/buyer demo script. The polished buyer-facing version is the acquisition
prospectus (shared separately). Keep both honest — it's how serious buyers are won.

---

## Listing headline options

- **Answr — an Answer Engine Optimization (AEO) platform, built and ready to activate**
- **Turnkey AEO/GEO analytics SaaS — live product, real data engine, add your API keys**
- **Near-complete "what does AI say about your brand" platform (Next.js) + useanswr.com**

## One-line tagline

> A near-complete SaaS in one of software's fastest-growing categories — live product, real data engine, and an integration layer a buyer switches on with API keys. Sold as an asset, priced as a head start.

## Short description (marketplace summary field)

Answr is a polished, near-complete Answer Engine Optimization platform — the emerging
discipline of measuring and improving how a brand appears in AI answers (ChatGPT, Claude,
Gemini, Perplexity, Google AI Overviews). It ships a full marketing site, a 36-screen
analytics dashboard, a working first-party AI-crawler telemetry pipeline, and a real data
engine (persistence, authentication, answer-scoring, a nightly sampler, lead capture) that
runs today and becomes production-durable with a single storage key. Typed integration
clients for every major AI provider are written; a buyer pastes API keys in the Settings
screen and the pipeline activates. Pre-revenue: sold as an asset and a head start, not on
an earnings multiple.

## Full description (long field)

**The opportunity.** Buyers increasingly ask AI assistants instead of clicking search
results. Answer Engine Optimization (AEO / GEO) is where SEO budgets are shifting, and
Answr is built for it end to end.

**What it does.** Monitors what AI answers say about a brand, traces the citations behind
those answers, tracks the AI crawlers hitting the brand's site, and turns visibility gaps
into a scored action queue.

**What's built (verified this month):**
- Live marketing site — 27 pages, SEO (robots/sitemap/OpenGraph), starter legal docs.
- Full dashboard — 36 screens, a real CSV export engine, working filters, search, and a
  command palette.
- Real AI-crawler telemetry — capture pipeline + a live screen, verified end-to-end.
- The engine — a data layer, a scrypt-hashed account system (signup/login/sessions),
  answer-scoring that computes the real metrics from sampled answers, write paths that
  persist, and lead capture. Tested; runs in-memory today, durable with one Redis key.
- Integration scaffolding — typed clients for Perplexity, OpenAI, Anthropic, Gemini and
  DataForSEO, plus a Settings › Integrations screen to paste keys and test connections.
- Docs — an integration plan, a 31-metric dictionary, and a HANDOFF.md activation guide.

**Tech.** Next.js 16, React 19, TypeScript. Type-clean, builds clean. Deployed on Vercel
with GitHub auto-deploy. Domain useanswr.com included.

**The buyer's last mile.** Add a storage key (durability), add provider API keys, switch
on account-gated access, feed scoring into the dashboards, and go to market. Days and API
dollars, not quarters of engineering.

**Honest disclosures.** Pre-revenue and pre-launch; the dashboard runs on a realistic
sample workspace. Unsubstantiated compliance claims were deliberately removed. Two
illustrative case studies remain — confirm permission or replace before relying on them.

## What's included in the sale

- The full source repository (private Git repo, transferable)
- The useanswr.com domain
- The Answr brand, logo, and complete design system
- The Vercel deployment / auto-deploy pipeline (buyer connects their own account)
- All documentation: INTEGRATIONS.md, METRICS.md, READINESS.md, HANDOFF.md, and the
  acquisition prospectus

## Asking price framing

Pre-revenue asset sale — priced on the head start, not an earnings multiple. Illustrative
range: **low-to-mid five figures**, movable by proof of demand (a waitlist, trial users,
or a paying pilot can multiply it). Not financial advice; open to offers.

## Where to list

- **Acquire.com** — startup/SaaS acquirers, good fit for a built-but-pre-revenue product.
- **Flippa** — broadest reach, more bargain-hunters; good for domain + codebase asset sales.
- **MicroAcquire/other** — indie-hacker buyers who value a clean, activatable codebase.
- Consider a direct outreach to AEO/martech founders and agencies who'd want a head start.

---

## Demo script (for a live buyer walkthrough — ~10 minutes)

1. **Marketing site** — open useanswr.com. Point out product depth, the honest security
   page, and that pricing/blog/solutions are all real, not placeholder.
2. **Enter the dashboard** — /login, email `dana@nike.com`, passphrase `answr-demo` (or the
   DEMO_PASSWORD set). Note this is a simple demo gate, separate from the real account system.
3. **Overview** — the analytics surface: visibility, share of voice, citations, competitor
   table, per-platform breakdown. Note the honesty layer (every inert control says what it
   does on a live workspace).
4. **Live telemetry** (/app/live) — click "send test crawler hit"; a real event flows through
   capture and appears. Emphasize: this is genuine captured data, not a fixture.
5. **Settings › Integrations** — the buyer's activation surface: each provider, the exact env
   var, what it powers, and a Test-connection button. "This is where you paste your keys."
6. **Settings › Leads** — submit the homepage snapshot form in another tab, then show it appear
   here. The lead pipeline is real.
7. **The engine, briefly** — mention the account system (signup/login) is a real scrypt-hashed
   auth system, and the scoring engine computes real metrics from answers (show the scoring
   preview if technical). 
8. **Handoff** — open HANDOFF.md: the complete activation checklist. "Your path to live is
   this document plus your API keys."

Close on the head-start framing: months of build already done; the buyer's job is keys,
the last mile, and go-to-market.
