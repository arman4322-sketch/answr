# Answr — Real-Data Integration Plan

How each number in `lib/metrics.ts` (31 metrics, mirrored in `METRICS.md`) gets fed by
real production data. Synthesized from the five-pipeline research dossier (answer
sampling, crawler analytics, referrals, demand/conversations, connected workspace),
verified August 2026. Feasibility tags used throughout:
**now** (works today, no key) · **needs-key** (API key/OAuth only) ·
**needs-contract** (sales cycle or approval gate) · **build-required** (Answr-side engineering).

---

## 1. Executive summary

Answr becomes real fastest with three moves, none of which require a contract:

**Move 1 — Turn on answer sampling via official APIs (needs-key).**
Every LLM platform now has a citation-bearing API: Perplexity Sonar returns native
`citations` + `search_results` ([docs.perplexity.ai/getting-started/pricing](https://docs.perplexity.ai/getting-started/pricing)),
Gemini's Google Search grounding is free at Answr's volume on the 2.5 family
(1,500 grounded requests/day, [ai.google.dev/gemini-api/docs/pricing](https://ai.google.dev/gemini-api/docs/pricing)),
and DataForSEO returns Google AI Overviews with structured references for ~$1.20/1k
queries ([dataforseo.com/apis/serp-api/pricing](https://dataforseo.com/apis/serp-api/pricing)).
This one pipeline lights up 15 of the 31 metrics — the entire visibility/citations core.
Start Perplexity + DataForSEO + Gemini (~$100/mo proves `visibility_score` end-to-end at
full scale), add OpenAI Responses `web_search` and Anthropic web search as waves 2–3.

**Move 2 — Ship first-party capture on the deployed site (build-required, $0 external).**
A `proxy.ts` server-side one-liner (Next 16 renamed Middleware→Proxy — this repo's own
convention) POSTs UA/path/status to an Answr ingest route: that is the only way
snippet-tier customers ever see AI crawlers, since GPTBot/ClaudeBot/PerplexityBot never
execute JavaScript. Pair it with a ~1KB client snippet + `/api/collect` for referrer/UTM
capture. Bot verification data is all free unauthenticated JSON
([openai.com/gptbot.json](https://openai.com/gptbot.json),
[claude.com/crawling/bots.json](https://claude.com/crawling/bots.json),
[perplexity.com/perplexitybot.json](https://www.perplexity.com/perplexitybot.json),
UA catalog: [github.com/ai-robots-txt/ai.robots.txt](https://github.com/ai-robots-txt/ai.robots.txt)).
Dogfood on the answr deployment today; Vercel Drains ($0.50/GB, Pro plan,
[vercel.com/docs/drains](https://vercel.com/docs/drains)) and a "Connect Cloudflare"
AI Crawl Control integration (free on all Cloudflare plans,
[developers.cloudflare.com/ai-crawl-control](https://developers.cloudflare.com/ai-crawl-control/))
are the CDN-scale versions of the same ingest endpoint.

**Move 3 — Cheap classification + free demand priors (needs-key).**
Claude Haiku 4.5 via the Batch API classifies sentiment at ~$2–4 per 10K mentions
([platform.claude.com/docs/en/build-with-claude/batch-processing.md](https://platform.claude.com/docs/en/build-with-claude/batch-processing.md));
DataForSEO Keywords Data feeds `demand_volume`'s search prior at ~$0.06 per 1,000
keywords ([dataforseo.com/pricing/keywords-data/google-ads](https://dataforseo.com/pricing/keywords-data/google-ads));
and two free OAuth clicks inside the already-connected Supermetrics MCP (GA4 + Google
Search Console) plus zero-auth Google Trends light up `ai_referrals` and demand
corroboration at $0 ([docs.supermetrics.com/docs/supermetrics-mcp-server](https://docs.supermetrics.com/docs/supermetrics-mcp-server)).

**Rough monthly cost at pilot scale** (10 prompts × 3 platforms nightly + first-party
capture + Haiku sentiment): **≈ $25–80/mo** — Perplexity ~$2–5, Gemini $0 (free grounding
quota), DataForSEO under $1 usage against a one-time $50 minimum funding, Haiku <$1,
optional Vercel Pro $20/seat for the log drain. Full production scale (412 prompts ×
5 platforms daily) is ≈ **$600–1,100/mo** per the dossier's per-platform breakdown.

What no key can buy: `conversation_mentions`' "2.1M conversations/mo opt-in panel" has
no self-serve equivalent anywhere in 2026 — it requires a bespoke Datos-class licensing
contract (months, five-to-six figures). Label it modeled/beta until then (§5).

---

## 2. Pipeline-by-pipeline plan

### 2.1 Answers (prompt sampling)

- **Primary:** Perplexity Sonar API — same engine as the consumer product, native
  `citations`/`search_results`, zero tool config. $1/$1 per MTok + $5–12/1k requests;
  ~$90–180/mo at full scale, the cheapest LLM lane
  ([docs.perplexity.ai/getting-started/pricing](https://docs.perplexity.ai/getting-started/pricing)).
  Then Gemini 2.5 Flash with Google Search grounding — 412/day fits entirely inside the
  1,500/day free grounding quota; ~$50/mo tokens
  ([ai.google.dev/gemini-api/docs/google-search](https://ai.google.dev/gemini-api/docs/google-search)).
  Then OpenAI Responses + `web_search` (~$200–330/mo,
  [developers.openai.com/api/docs/guides/tools-web-search](https://developers.openai.com/api/docs/guides/tools-web-search))
  and Anthropic web search tool (~$250–370/mo on Haiku-class; best-structured citations,
  plus `user_location` for region runs,
  [platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool)).
- **Fallback:** none needed — all four are official first-party APIs. The ruled-out
  alternative is consumer-UI automation, which violates OpenAI/Google/Anthropic terms
  ([openai.com/policies/row-terms-of-use](https://openai.com/policies/row-terms-of-use/)); see §5.
- **Auth/cost:** API keys only. Full pipeline ≈ $600–1,100/mo at 412 × 5 daily.
- **Metrics lit:** `visibility_score`, `share_of_voice`, `platform_appearances`,
  `topic_visibility`, `region_visibility`, `audience_visibility`, `shopping_visibility`,
  `avg_answer_position`, `answer_rank_first`, `data_quality_sample` (+ all citation
  metrics below, from the same payloads).

### 2.2 Citations (parsing the answer corpus + AI Overviews)

- **Primary:** structured citation payloads already in every 2.1 response —
  `url_citation` annotations + `sources` (OpenAI), `web_search_result_location` blocks
  (Anthropic), `groundingMetadata` (Gemini), native `search_results` (Perplexity) — plus
  **DataForSEO SERP Advanced** for Google AI Overviews (`ai_overview` block with
  structured references; `load_async_ai_overview:true` → ~$1.20/1k, auto-refunded when
  no AIO; ~$15/mo standard queue at full scale,
  [dataforseo.com/help-center/how-to-scrape-google-ai-overviews-with-serp-api](https://dataforseo.com/help-center/how-to-scrape-google-ai-overviews-with-serp-api)).
  DataForSEO's `gl`/`hl`/location params also serve `region_visibility` runs.
- **Fallback:** SerpApi Google AI Overview API — cleanest reference schema
  (`reference_indexes` per text block) and a US legal-shield posture, at ~10× the price
  ($150–275/mo, [serpapi.com/google-ai-overview-api](https://serpapi.com/google-ai-overview-api));
  Bright Data SERP API (~$19–43/mo) as the second-vendor resilience swap if an AIO
  parser breaks ([keyword.com/blog/bright-data-serp-api-vs-datafor-seo](https://keyword.com/blog/bright-data-serp-api-vs-datafor-seo/)).
- **Auth/cost:** API keys; DataForSEO is pay-as-you-go, no contract.
- **Metrics lit:** `citations_count`, `owned_citation_share`, `cited_source_count`,
  `unique_cited_domains`, `answers_with_citation_rate`.

### 2.3 Crawlers (bot visibility on customer sites)

- **Primary:** Answr's own capture: (a) `proxy.ts` npm package for snippet-tier
  customers — fire-and-forget POST of UA/path/status to `/api/ingest`; must ship both
  `proxy.ts` and legacy `middleware.ts` conventions (Next 16 rename, verified in this
  repo's `node_modules` docs); OSS precedents: CrawlerToll, Cairrot, Arcjet
  ([github.com/charthouse-ltd/crawlertoll-core-js](https://github.com/charthouse-ltd/crawlertoll-core-js));
  (b) **Vercel Drains** for Vercel Pro customers — schema includes `proxy.userAgent`,
  `proxy.path`, `proxy.statusCode`, `proxy.clientIp`, incl. static requests; $0.50/GB
  ([vercel.com/docs/drains/reference/logs](https://vercel.com/docs/drains/reference/logs));
  (c) **Connect Cloudflare** — AI Crawl Control GraphQL dataset, free on all Cloudflare
  plans since April 2026, customer pastes a read-only Analytics token
  ([developers.cloudflare.com/ai-crawl-control/reference/graphql-api](https://developers.cloudflare.com/ai-crawl-control/reference/graphql-api)).
  All three feed one generic ingest endpoint + a bot-verifier table built from the free
  published IP-range JSONs (§1 Move 2). Note: Google-Extended is a robots.txt token
  only, not a UA ([developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers)).
- **Fallback:** Fastly / Akamai enterprise log streaming into the same endpoint
  (needs-contract on the customer's side, $0 to Answr — defer until demand).
- **Auth/cost:** $0 external for the proxy path; Vercel Pro $20/seat + $0.50/GB;
  Cloudflare free (referral analytics + detection-ID filtering may be plan-gated — verify
  per plan during build).
- **Metrics lit:** `crawler_events`, `unique_agents`, `pages_crawled`, and inputs to
  `page_health` and `ai_referrals` (server-side referrer capture).

### 2.4 Referrals (human click-throughs)

- **Primary:** first-party snippet + `/api/collect` — classify by referrer hostname
  (chatgpt.com, perplexity.ai, gemini.google.com, claude.ai, copilot.microsoft.com…)
  AND by `utm_source=chatgpt.com` decoration, which survives referrer-stripping app
  contexts ([utm.new/platforms/chatgpt](https://utm.new/platforms/chatgpt)). Only
  first-party capture streams hourly (the metric's stated cadence) and applies one
  consistent signature list across all customers. Field-validated regex:
  `(^|\.)(chatgpt\.com|chat\.openai\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com|deepseek\.com|grok\.com|meta\.ai|you\.com)$`.
- **Fallback / connectors:** **GA4 Data API** first (free, 200k tokens/day/property,
  OAuth or service-account invite; `pageReferrer`/`manualSource` dimensions + the new
  "AI Assistants" channel — which omits Perplexity/Claude and routes AI Overviews to
  Organic Search, [developers.google.com/analytics/devguides/reporting/data/v1/quotas](https://developers.google.com/analytics/devguides/reporting/data/v1/quotas));
  then Plausible Stats API v2 (Business plan $19+/mo), Fathom ($15+/mo), Umami
  (free self-host / $20 cloud), and the Vercel Web Analytics API — which can feed
  Answr's own numbers today ([vercel.com/docs/analytics/web-analytics-api](https://vercel.com/docs/analytics/web-analytics-api)).
  HubSpot's free-tier MCP/OAuth supplies the conversion join
  ([developers.hubspot.com/ai-tools/mcp](https://developers.hubspot.com/ai-tools/mcp)).
- **Auth/cost:** snippet $0; GA4 free + OAuth; others per customer's existing plan.
- **Metrics lit:** `ai_referrals` (conversion column via GA4 goals or HubSpot).
- **Honesty requirement:** every referrer count is a floor — 35–70% of AI clicks arrive
  referrer-stripped (Loamly, 446k visits: 70.6% land as Direct,
  [loamly.ai/blog/ai-traffic-attribution-crisis](https://www.loamly.ai/blog/ai-traffic-attribution-crisis)).
  Say so in the provenance tooltip.

### 2.5 Demand & conversations

- **Primary (demand):** DataForSEO Keywords Data (Google Ads volume, $0.06/1k-keyword
  task) + AI Keyword Search Volume endpoint (~$110/1M keywords — modeled from
  People-Also-Ask, so label it a prior, not panel data,
  [dataforseo.com/pricing/ai-optimization/ai-keyword-search-volume](https://dataforseo.com/pricing/ai-optimization/ai-keyword-search-volume)).
  Corroborate with zero-auth Google Trends via the connected Supermetrics MCP and
  GSC query counts after one free OAuth click.
- **Primary (conversations):** none exists off the shelf. Open a Datos-class panel
  licensing conversation now (five-to-six figures, months); until it closes,
  `conversation_mentions` is fed from Answr's own prompt-run corpus + WildChat-4.8M
  (ODC-BY, real ChatGPT conversations through Aug 2025 — classifier calibration and
  honest `data_quality_sample` provenance, never "our panel",
  [huggingface.co/datasets/allenai/WildChat-4.8M](https://huggingface.co/datasets/allenai/WildChat-4.8M)).
  Profound's Prompt Volumes proves such panels exist but is a competitor's moat
  ([tryprofound.com/features/prompt-volumes](https://www.tryprofound.com/features/prompt-volumes)).
- **Fallback:** Google Ads Keyword Planner API (free per-call but gated on Basic Access
  review, [developers.google.com/google-ads/api/docs/api-policy/access-levels](https://developers.google.com/google-ads/api/docs/api-policy/access-levels));
  Glimpse $99/mo tier for trend enrichment; Similarweb (~$15k+/yr, quote-based) for the
  `platform_usage_scalar` — defer, approximate with public per-platform usage stats.
  LMSYS-Chat-1M is R&D-only (deletion/termination clauses,
  [huggingface.co/datasets/lmsys/lmsys-chat-1m](https://huggingface.co/datasets/lmsys/lmsys-chat-1m)).
- **Auth/cost:** DataForSEO Basic auth, $50 minimum funding, ~$3–10/mo at 10k tracked
  keywords weekly. Panel: needs-contract.
- **Metrics lit:** `demand_volume` (real, labeled modeled); `conversation_mentions`
  (modeled/beta until contract).

### 2.6 Sentiment

- **Primary:** Claude Haiku 4.5 via the Message Batches API (50% off, ~1h turnaround —
  matches the daily cadence). ~$2–4 per 10K mentions with prompt-cached rubric; even
  100K mentions/mo ≈ $30–60 ([platform.claude.com/docs/en/pricing.md](https://platform.claude.com/docs/en/pricing.md)).
  Keep the human-audited calibration set `sentiment_mix` already promises; WildChat
  bootstraps the calibration corpus for free.
- **Fallback:** same classification on any of the other sampling keys already in hand
  (Gemini 2.5 Flash is the cheap alternative); no new vendor needed.
- **Auth/cost:** `ANTHROPIC_API_KEY`, pay-as-you-go — the cheapest, most certain
  integration in the whole plan.
- **Metrics lit:** `sentiment_mix` (+ enriches `data_quality_sample`).

---

## 3. Coverage table — all 31 metrics

| Metric id | Recommended real source | Feasibility |
|---|---|---|
| `visibility_score` | Official-API prompt runs: Perplexity Sonar + Gemini grounding + OpenAI web_search + Anthropic web search + DataForSEO AIO | needs-key |
| `share_of_voice` | Same answer corpus + workspace competitor/alias matching | needs-key |
| `citations_count` | Structured citation payloads from all five sampling lanes | needs-key |
| `owned_citation_share` | Same citation corpus + owned/watched domain classification | needs-key |
| `avg_answer_position` | Ordered entity extraction over the stored answer corpus | needs-key |
| `answer_rank_first` | First-mention extraction, latest run per prompt | needs-key |
| `topic_visibility` | Answer corpus filtered by prompt topic | needs-key |
| `region_visibility` | Anthropic `user_location` runs + DataForSEO `gl`/`hl` AIO queries | needs-key |
| `audience_visibility` | Persona-variant prompts on the same sampling APIs | needs-key |
| `sentiment_mix` | Claude Haiku 4.5 Batch API classification of mention spans | needs-key |
| `shopping_visibility` | Purchase-intent prompt slice on the same sampling APIs (+ catalog feed) | needs-key |
| `cited_source_count` | Citation corpus grouped by registrable domain | needs-key |
| `prompts_tracked` | First-party workspace records (app DB) | now |
| `conversation_mentions` | Datos-class licensed conversation panel; interim: own prompt-run corpus + WildChat-4.8M, labeled modeled/beta | needs-contract |
| `demand_volume` | DataForSEO Keywords Data + AI Keyword Volume (prior) + Google Trends (Supermetrics, zero-auth) + GSC (one OAuth) | needs-key |
| `action_score` | Answr recommendation engine over own gap analysis | build-required |
| `impact_estimate` | Cohort priors from shipped-action lift history | build-required |
| `projected_visibility` | Internal projection model over own visibility series | build-required |
| `measured_lift` | Internal diff-in-diff over own prompt-run corpus | build-required |
| `crawler_events` | `proxy.ts` ingest package + Vercel Drains + Cloudflare AI Crawl Control, verified against published bot IP JSONs | build-required |
| `ai_referrals` | First-party snippet + `/api/collect` (referrer + UTM); GA4 Data API connector | build-required |
| `page_health` | Answr's own weekly crawler (robots/schema/llms.txt checks) + crawler-events + citation corpus | build-required |
| `content_score` | Internal scorer trained on the category's cited-page corpus | build-required |
| `platform_appearances` | Same daily prompt-run corpus, split by platform | needs-key |
| `unique_cited_domains` | Citation corpus, `COUNT(DISTINCT registrable_domain)` | needs-key |
| `answers_with_citation_rate` | Run logs: per-answer parse status from the sampler | needs-key |
| `actions_queue` | First-party workspace records (app DB) | now |
| `unique_agents` | Crawler ingest + bot-verifier table (free published IP/UA JSONs — data itself is `now`) | build-required |
| `pages_crawled` | Crawler ingest joined to canonical URL inventory | build-required |
| `page_speed` | Answr's own headless crawler probes (weekly re-crawl) | build-required |
| `data_quality_sample` | Sampling-pipeline run logs (arrives free with Move 1) | needs-key |

---

## 4. "Wire this week" pilot spec

Smallest real slice that replaces fixtures with live data end-to-end:

**Scope:** 10 tracked prompts × 3 platforms nightly (Perplexity `sonar`, Gemini 2.5
Flash with grounding, Google AI Overviews via DataForSEO standard queue) + first-party
referral middleware on the deployed site + Vercel bot visibility.

1. **Nightly sampler** (cron route or GitHub Action): for each prompt, one POST to
   Perplexity (`citations` parsed as-is), one to Gemini `generateContent` with
   `google_search` (parse `groundingMetadata`), one DataForSEO SERP Advanced task with
   `load_async_ai_overview:true` (parse `ai_overview.references`; standard-queue
   minutes-latency is fine nightly). Store answer text + citations + parse status →
   lights `visibility_score`, `share_of_voice`, `platform_appearances`,
   `citations_count`, `owned_citation_share`, `cited_source_count`,
   `unique_cited_domains`, `answers_with_citation_rate`, `avg_answer_position`,
   `answer_rank_first`, `topic_visibility`, `data_quality_sample`.
2. **Sentiment batch**: after each run, submit brand-mention spans to
   `POST /v1/messages/batches` with `claude-haiku-4-5` → `sentiment_mix`. Sub-dollar.
3. **`proxy.ts` + `/api/ingest`** in this repo (Next 16: Proxy, not Middleware):
   fire-and-forget POST of UA/path/status on every request; verify against cached bot
   IP JSONs (GPTBot/OAI-SearchBot/ChatGPT-User, ClaudeBot family, PerplexityBot/
   Perplexity-User, Googlebot ranges) → `crawler_events`, `unique_agents`,
   `pages_crawled`. Works on the current plan; a Pro-plan Vercel Drain to the same
   endpoint adds static-request coverage.
4. **Snippet + `/api/collect`**: read `document.referrer` + `utm_source` on first touch,
   classify with the §2.4 regex → `ai_referrals`. Optionally corroborate via the Vercel
   Web Analytics API (`referrerHostname` grouping) with a Vercel token.
5. **Free OAuth clicks** (no code): authorize GA4 and Google Search Console inside the
   connected Supermetrics MCP; query zero-auth Google Trends for the pilot keywords →
   `demand_volume` prior corroboration.

**Env vars / keys the user must provide:**

```
PERPLEXITY_API_KEY        # perplexity.ai settings → API
GEMINI_API_KEY            # Google AI Studio (2.5 Flash free grounding tier)
DATAFORSEO_LOGIN          # dataforseo.com — $50 one-time minimum funding
DATAFORSEO_PASSWORD
ANTHROPIC_API_KEY         # Haiku 4.5 batch sentiment (wave 2: Claude sampling lane)
ANSWR_INGEST_SECRET       # shared secret authenticating proxy.ts / snippet → ingest routes
# optional, wave 2:
OPENAI_API_KEY            # Responses API + web_search lane
VERCEL_TOKEN              # Web Analytics API dogfood (with VERCEL_PROJECT_ID / VERCEL_TEAM_ID)
```

Plus two non-env actions: Vercel Pro upgrade if the log drain is wanted this week
($20/seat + $0.50/GB), and the two Supermetrics OAuth clicks (GA4, GSC).

**Pilot cost:** ≈ $25–80/mo (§1). One copy edit rides along: change
`visibility_score.source` in `lib/metrics.ts` from "consented headless sampling
elsewhere" to "official APIs with web grounding" (§5).

---

## 4b. Shipped — first-party capture is LIVE (Move 2, pilot steps 3–4)

The zero-key half of Move 2 is built and running on this deployment. No API keys,
no contracts, no external services:

| File | Role |
|---|---|
| `proxy.ts` | Next 16 Proxy at the project root. Matches every request's UA against the published AI-crawler patterns and fires a non-blocking POST to the ingest route. Non-bot traffic costs one string scan. |
| `app/api/ingest/route.ts` | Crawler-event ingest. Same payload shape accepts CDN log drains (Vercel Drains, Cloudflare AI Crawl Control) later. Optional `ANSWR_INGEST_SECRET` gates external senders. |
| `public/snippet.js` | ~1KB first-touch referral snippet for customer sites (`sendBeacon`, no cookies, session-deduped). |
| `app/api/collect/route.ts` | Referral ingest — classifies `document.referrer` + `utm_source` against the assistant hostname/decoration table. |
| `lib/bots.ts` | 20-bot UA catalog (operator, kind, platform) + AI-referrer table. |
| `lib/telemetry.ts` | `TelemetryStore` interface + in-process ring buffer (last 500) and the aggregation used by the UI. |
| `app/(dash)/app/live` | **Live telemetry** screen — the one dashboard view fed by real captured data, badged "Real data" to distinguish it from the Solara fixture. |

Metrics now fed by genuinely observed data on this deployment: `crawler_events`,
`unique_agents`, `pages_crawled`, `ai_referrals`.

Verified end-to-end: requests with `GPTBot/1.2`, `ClaudeBot/1.0` and
`PerplexityBot/1.0` user-agents were captured with their real paths, and
ChatGPT/Perplexity referrals classified correctly, all surfacing in `/app/live`.

**Two honest limits, stated in the UI:**
1. *Retention* — the default store is in-process, so a serverless cold start
   resets the window. Durable retention is one `TelemetryStore` implementation
   (Postgres / Vercel KV / Upstash); nothing else in the app changes.
2. *Verification* — a UA match is labelled **declared**, not **verified**.
   Promoting to verified needs the reverse-DNS / IP-range check against the
   operators' published JSON (§2.2); the chip in the events table shows which
   level each event has.

Remaining pilot work still needs keys: the nightly sampler (step 1) and Haiku
sentiment batch (step 2) — see §4 for the exact env vars.

---

## 5. Honest constraints

- **Consumer-UI automation is ruled out, permanently.** OpenAI's Terms of Use prohibit
  any "automated or programmatic method to extract data or output from the Services"
  outside the API ([openai.com/policies/row-terms-of-use](https://openai.com/policies/row-terms-of-use/)),
  with equivalent bars in Anthropic/Google consumer terms. All sampling is therefore
  API-surface sampling: answers approximate but do not equal the consumer UI — the
  standard fidelity caveat the whole AEO category (Profound, Peec) operates under.
  `lib/metrics.ts`'s "consented headless sampling" wording must change.
- **AI Overviews are structurally fragile.** No official Google API for AIOs exists;
  every provider scrapes SERPs, which breaches Google's ToS on paper — the provider
  absorbs that risk (industry-standard posture), but there is no ToS-clean path at all,
  so DataForSEO is a documented known-risk dependency with SerpApi/Bright Data as
  parser-break fallbacks. AIOs appear on only ~48% of queries and their structure can
  change with any Google UI update.
- **The conversation panel is a moat, not a purchase.** Profound's Prompt Volumes runs
  on a licensed double-opt-in panel that is not resold; the only real path is a bespoke
  Datos-class licensing contract (five-to-six figures, months). Until signed,
  `conversation_mentions` cannot honestly show panel-derived numbers — label it
  modeled/beta. WildChat-4.8M (ODC-BY; confirm the repo LICENSE before commercial use)
  is calibration data, not a live panel; LMSYS-Chat-1M's deletion/termination clauses
  make it R&D-only.
- **Referral counts are floors.** 70.6% of 446k measured AI-referred visits arrived
  referrer-stripped ([loamly.ai/blog/ai-traffic-attribution-crisis](https://www.loamly.ai/blog/ai-traffic-attribution-crisis));
  Google AI Overviews clicks arrive as plain google.com and are permanently
  indistinguishable from organic search — excluded even from GA4's own "AI Assistants"
  channel, which also omits Perplexity and Claude.
- **DataForSEO's AI keyword volume is modeled** from People-Also-Ask statistics, not
  observed AI conversations — usable as `demand_volume`'s prior, never as panel evidence.
- **llms.txt is a checkbox, not a signal.** ~10.1% adoption; Google explicitly does not
  support it and measured crawler demand is near zero
  ([presenc.ai/research/state-of-llms-txt-2026](https://presenc.ai/research/state-of-llms-txt-2026)).
  Keep it in `page_health` as a low-weight informational check only.
- **Plan gates to verify during build:** Vercel Drains are Pro/Enterprise-only;
  Cloudflare referral analytics require a paid plan and detection-ID filtering may be
  gated to Bot Management tier; Gemini's terms attach display requirements to
  `search_suggestions` when showing grounded results to end users (fine for internal
  scoring, review before rendering answers in-app).
