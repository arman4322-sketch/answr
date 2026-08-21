# Answr — Listing Kit (marketplace fields + buyer FAQ)

Ready answers for the fields Acquire.com / Flippa / marketplaces ask for, plus a buyer FAQ.
Pair with SALE_LISTING.md (copy) and the acquisition prospectus (the polished shareable page).

---

## Marketplace field answers

| Field | Answer |
|---|---|
| **Business name** | Answr |
| **URL** | https://useanswr.com |
| **Category / industry** | SaaS · Marketing/SEO · AI |
| **Business model** | Subscription SaaS (planned tiered pricing; not yet monetized) |
| **Asking price** | Low-to-mid five figures (open to offers; higher with demand proof) |
| **Revenue (TTM / MRR)** | $0 — pre-revenue |
| **Profit / TTM** | $0 |
| **Customers / users** | Pre-launch (0 paying; waitlist if run — cite the number) |
| **Traffic** | Pre-launch; organic only (cite analytics if connected) |
| **Tech stack** | Next.js 16, React 19, TypeScript, Tailwind v4; deployed on Vercel |
| **Team / employees** | Solo founder-built; no staff to transfer |
| **Time to run per week** | Low — no ops burden until launched; scales with go-to-market effort |
| **Reason for selling** | Built the platform; selling as an asset for an operator who can take it to market |
| **What's included** | Source repo, useanswr.com domain, brand + design system, deploy pipeline, all docs |
| **Financing** | N/A (asset sale) |
| **Competitors** | Profound, Peec AI, and the broader AEO/GEO tooling space |
| **Growth opportunities** | Agency reseller channel; launch pricing; the AEO category is early and expanding |

**Assets transferred at close:** the private Git repository, the `useanswr.com` domain
(registrar transfer), the Answr name/logo/design system, and all documentation
(INTEGRATIONS.md, METRICS.md, READINESS.md, HANDOFF.md, the prospectus). The Vercel project
is redeployed under the buyer's own account.

**Not included / buyer provides:** API keys (Perplexity, Gemini, DataForSEO, Anthropic,
OpenAI), a storage/database key, a hosting account, and any paid legal review of the
starter legal docs. All documented in HANDOFF.md.

---

## Buyer FAQ

**Is it generating revenue?**
No — it's pre-revenue and pre-launch. You're buying a built, deployed platform and the
months of engineering, design, and category work already done, not a cash flow.

**What exactly works today vs. what do I finish?**
Working now: the full marketing site, a 36-screen dashboard, a real AI-crawler telemetry
pipeline, and a real engine (persistence, scrypt-hashed auth, answer-scoring, write paths,
lead capture) — all tested, running in-memory. Your last mile: add a storage key (makes it
durable), add provider API keys, switch scoring into the dashboards, and go to market. Full
detail in HANDOFF.md.

**How long until I can launch?**
The scaffolding is built, so it's activation and go-to-market, not a rebuild. A technical
operator can have keys connected and a durable store live in days; making it a polished paid
product depends on how much of the "last mile" you want before charging.

**What will it cost me to run?**
At pilot scale: roughly $25–80/mo in AI provider usage, ~$20/mo for a commercial hosting
plan, and a free-tier storage key. Costs scale with sampling volume and customers.

**Is the code any good?**
Yes — it's type-clean (`tsc` passes), builds clean, and is unusually well-documented,
including an honesty layer that labels every demo-only control. Nothing is obfuscated.

**Why are you selling something you built?**
It's an asset sale — the platform is built; it needs an operator with the go-to-market focus
to take it to market. That's a different job than building it.

**Are the metrics on the dashboard real?**
The dashboard runs on a realistic sample workspace so you can see the full product. Real
numbers appear once you connect providers and feed the (already-built) scoring engine into
the views. The AI-crawler telemetry screen shows genuinely captured data today.

**What about the compliance badges / customers I might have seen?**
Unsubstantiated compliance claims were deliberately removed before listing — the site only
states what's true, with compliance framed as a roadmap. Two illustrative case studies
remain; confirm permission or replace them before relying on them.

**Can I see it before buying?**
Yes. Review useanswr.com and the demo dashboard (login walkthrough in the prospectus /
SALE_LISTING.md), and request the repo for technical diligence.

**Is the domain included?**
Yes — useanswr.com transfers with the sale.

**What support do I get post-sale?**
Define this in your terms — a common structure is a short handoff window (e.g. 2–4 weeks of
email support) to walk through activation. The docs are thorough enough to activate solo.
