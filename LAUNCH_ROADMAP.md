# Answr — Launch Roadmap (What Remains to Turn It On)

_A high-level view of what a new owner does to activate Answr and make it live for customers.
The engine is built — this is activation and a short remaining build, not a rebuild. Full technical
detail is in `HANDOFF.md`._
_Last updated: 21 Aug 2026._

---

## 1. Activate the platform (configuration)

Mostly setting keys and verifying — the built engine turns on:

- **Deploy** the app under the new owner's own hosting account and connect the domain.
- **Add a storage key** (Redis / Upstash) so everything persists — telemetry, leads, sessions, and sampled data.
- **Set the app secrets** (`DEMO_PASSWORD`, `ANSWR_INGEST_SECRET`, `CRON_SECRET`) to secure the app and arm the sampler.
- **Add the provider API keys** — Perplexity, Gemini, DataForSEO, Anthropic, OpenAI — and verify each in **Settings → Integrations → Test connection**.
- **Verify the provider clients** against each provider's current API (they're written and wired; confirm the request/response shapes with a live key).
- **Turn on the nightly sampler** (the scheduled job that runs the prompts and collects answers).
- **Connect an email provider** for transactional and notification email.

---

## 2. Make it live for customers (build)

The remaining engineering to go from a working demo to a live, multi-customer product. Each item
plugs into the engine that's already built:

- **Switch real accounts to govern the app** — turn on the built authentication so customers sign in with their own accounts.
- **Feed the scoring engine into the dashboards** — replace the sample figures with each customer's real, computed metrics.
- **Per-customer workspaces from onboarding** — the brand and prompts a new customer enters create and drive their own workspace.
- **Add billing / payments** — integrate a payment provider so customers can subscribe and pay.
- **Persist the remaining dashboard actions** — wire the rest of the create/edit controls to save.
- **Add monitoring and a support path** — error monitoring, uptime, and a working support inbox before customers depend on it.

---

None of this is a rebuild — it activates and extends the engine that's already in place. Once these
are done, the platform is live and ready for the new owner to run.
