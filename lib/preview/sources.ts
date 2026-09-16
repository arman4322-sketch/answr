/* Where the data for each not-yet-collecting capability could come from.

   Each entry answers, for a capability Answr does not yet measure: what it would
   measure, whether it can be built with the keys already connected, the concrete
   data sources (real vendors/APIs with pricing and trade-offs), the recommended
   path, and the build effort.

   Surfaced in-app by <LockedPreview>: a hover tooltip shows the headline, and
   "What's needed" opens the full detail. Nothing here is a measured figure — it
   describes how a capability would be enabled. */

export type Feasibility =
  | "buildable-with-existing-keys"
  | "needs-new-api-key"
  | "needs-commercial-contract"
  | "build-only-no-data-needed";

export interface DataSource {
  /** vendor / API / technique */
  name: string;
  /** what data it actually provides */
  what: string;
  /** concretely how Answr would integrate it */
  how: string;
  /** real pricing where published */
  cost: string;
  /** limits, ToS risk, accuracy caveats */
  tradeoff: string;
}

export interface CapabilitySource {
  key: string;
  /** screen/feature name as shown in the UI */
  title: string;
  /** one line: what this would measure */
  whatItMeasures: string;
  feasibility: Feasibility;
  /** one-line headline used in the hover tooltip */
  headline: string;
  sources: DataSource[];
  /** the single best path and why */
  recommended: string;
  /** S (hours) / M (days) / L (1–3 weeks) / XL (month+) */
  effort: "S" | "M" | "L" | "XL";
  notes?: string;
}

export const FEASIBILITY_LABEL: Record<Feasibility, string> = {
  "buildable-with-existing-keys": "Buildable with the keys already connected",
  "needs-new-api-key": "Needs an additional API key",
  "needs-commercial-contract": "Needs a commercial data contract",
  "build-only-no-data-needed": "No external data needed — engine to build",
};

export const EFFORT_LABEL: Record<CapabilitySource["effort"], string> = {
  S: "Hours",
  M: "Days",
  L: "1–3 weeks",
  XL: "A month or more",
};

/* Populated from the data-source research (Sept 2026). Keyed by capability. */
export const CAPABILITY_SOURCES: Record<string, CapabilitySource> = {
  "conversations": {
    key: "conversations",
    title: "Conversations",
    whatItMeasures: "What real people actually ask assistants in your category, and how often.",
    feasibility: "needs-commercial-contract",
    headline: "No self-serve API sells real AI conversations (Sep 2026) — the one productized panel is owned by a direct competitor whose terms bar it. A modeled substitute is buildable from DataForSEO AI Keyword Data, which you already pay for.",
    effort: "M",
    sources: [
      {
        name: "DataForSEO AI Optimization API — AI Keyword Data + LLM Mentions (Answr ALREADY has this key)",
        what: "ai_search_volume per keyword, returned separately for ChatGPT and for Google, plus ai_monthly_searches with 12 months of trend. Separately, an LLM Mentions index of 370,546,496 prompt records across ChatGPT and Google AI Overviews back to 2025, exposing mention counts, cited domains/pages, top-mentioned brands and…",
        how: "Extend the existing lib/providers/dataforseo.ts client — identical Basic auth and the same postJson helper already in the file — with POST https://api.dataforseo.com/v3/ai_optimization/ai_keyword_data/keywords_search_volume/live (up to 1,000 keywords per request, 250 chars per keyword, platform_type toggles ChatGPT…",
        cost: "$0.0001 per keyword plus ~$0.01 per task — roughly $0.11 per 1,000 keywords, $110 per 1,000,000. LLM…",
        tradeoff: "It is NOT real conversations, and DataForSEO's own help center is explicit: for AI Overviews \"the ai_search_volume values are derived directly from the Google Search Volume,\" and the ChatGPT figure is produced by counting Google People-Also-Ask questions containing the keyword. It is a…",
      },
      {
        name: "Profound — \"Prompt Volumes\" (tryprofound.com)",
        what: "The only genuinely productized consented-panel dataset in the category: licensed double-opt-in consumer panels, 400M+ anonymized conversations growing ~150M/month (1.5B+ prompts in the research corpus), covering ChatGPT, Gemini, Claude and Perplexity across the US, UK, Canada, Germany, France, Italy, Spain, Brazil,…",
        how: "It cannot be integrated, and an acquirer should hear that plainly. There is no self-serve API — API access and Prompt Volumes are both Enterprise-tier only. More decisively, Profound's Master Subscription Agreement §2.4 bars customers from \"provid[ing] access to, distribut[ing], sell[ing], or sublicens[ing] the…",
        cost: "Self-serve Starter $99/mo and Growth $399/mo, both displayed as annual commitments (~$1,188 and ~$4,788/yr).…",
        tradeoff: "Legally closed to Answr. It is also the clearest single reason Profound sustains enterprise pricing, so it is precisely the capability an acquirer is evaluating. The realistic read: this is a moat built on a data-licensing relationship, reproducible only by a buyer with their own panel contract or…",
      },
      {
        name: "Datos (a Semrush company) / Semrush AI Visibility Toolkit",
        what: "Semrush's toolkit runs on a proprietary database of 317M+ prompts and responses across ChatGPT, Gemini, Google AI Overviews and AI Mode, over 117 regional databases, updated daily, with prompt volumes computed at topic level by combining third-party clickstream with Semrush ML models. Their 2026 AI Visibility Index…",
        how: "Only route is a direct Datos data-licensing agreement (warehouse/S3 style delivery) with a nightly ETL into Answr's Postgres/Redis, or a Semrush enterprise agreement with custom API entitlements negotiated into the contract. Semrush's public API, Looker Studio connector and MCP server do not expose the AI Visibility…",
        cost: "Unpublished and contract-only — the Datos page offers nothing but \"Book a demo.\" No self-serve tier, no…",
        tradeoff: "Contract-only with a long procurement cycle, and Semrush owns Datos while competing directly in AI visibility, so terms offered to a rival SaaS are genuinely uncertain. Critically, the Datos AI feed is clickstream AROUND AI platforms — journeys, referred URLs, destination traffic — not…",
      },
      {
        name: "Similarweb — AI Traffic & Insights add-on",
        what: "AI chatbot referral traffic by destination site and by AI platform (ChatGPT, Perplexity, Claude, Copilot), with prompt-pattern insight surfaced in the UI.",
        how: "No programmatic path exists for the prompt data. I checked their developer portal and their llms.txt endpoint index directly: API V5 (launched March 2026, unified REST/Batch keys, hosted MCP server at mcp.similarweb.com) contains no Gen-AI, prompt, or LLM-traffic endpoint family — only general traffic-source and…",
        cost: "Web Intelligence Starter from $199/mo or $1,500/yr; Team and Business tiers $14,000–$35,000+/yr, which is…",
        tradeoff: "Nothing to wire a provider client to. And what it measures — traffic AI sends to websites — is close to what Answr's own proxy and snippet already capture first-party and for free. It duplicates an existing strength rather than filling the Conversations gap.",
      },
      {
        name: "LLM-synthesized conversation trees on Answr's existing model keys (the SparkToro method)",
        what: "Realistic multi-turn conversation trees per category: opening prompt, clarifying follow-up, comparison turn, objection turn, purchase-intent turn — clustered into topics with affinity scores, generated from the customer's real keyword and citation data.",
        how: "One new sampler step. Feed seed terms (DataForSEO ai_search_volume set + the workspace's tracked prompts + the customer's GSC queries + domains already appearing in Answr's citation data) to an existing Gemini/OpenAI/Anthropic key, ask for topic clusters and representative multi-turn threads, then push those…",
        cost: "Marginal token spend on keys already funded and live in production. Effectively free relative to any…",
        tradeoff: "Inferred, not observed, and the screen must say so. The precedent is strong and public: SparkToro shipped exactly this in March 2026 and states openly that it does not come from a clickstream panel — \"we fed search keywords... into the AI and requested, via API, a list of likely topics, scored by…",
      },
      {
        name: "Google Search Console API (customer-authorized, first-party)",
        what: "Real query strings with impressions and clicks for the customer's own site, including generative-AI surfaces. Google's generative-AI performance reports finished rolling out to every Search Console property on 31 August 2026.",
        how: "Add a per-workspace Google OAuth connection and call searchanalytics.query. Fits Answr's existing first-party telemetry story cleanly — customer-consented, customer-owned. Feed question-shaped long-tail queries into the tracked prompt set and render them on Conversations as genuinely real user language with genuinely…",
        cost: "Free, self-serve OAuth, no new paid vendor and no contract.",
        tradeoff: "Google combines AI Overviews and AI Mode into a single number in that report, and the queries behind AI Mode clicks are almost entirely anonymized, so you cannot isolate \"prompts asked in AI Mode.\" It is also only the customer's own capture — it says nothing about category demand the customer…",
      },
    ],
    recommended: "Ship a two-layer answer. LAYER 1 (no new contracts, weeks not quarters): DataForSEO AI Keyword Data for the volume axis — Answr already holds those credentials and lib/providers/dataforseo.ts already does Basic auth + postJson, so it is one new endpoint and one sampler step; plus LLM-synthesized multi-turn conversation trees from seed keywords using the Gemini/OpenAI/Anthropic keys already in production, run through the existing nightly sampler so every synthetic thread carries REAL answers and REAL citations; plus an optional per-workspace Google Search Console OAuth for the customer's own genuine query…",
    notes: "THE HONEST HEADLINE FOR AN ACQUIRER: as of September 2026 there is still NO self-serve API anywhere that sells real consumer AI conversations. Every genuine consented-panel dataset is a bespoke enterprise contract, and the single best one is owned by Answr's most direct competitor and contractually closed to Answr. Everything self-serve on the market — DataForSEO's ai_search_volume, Ahrefs' 218M-prompt Brand Radar corpus, SparkToro's prompt topics — is modeled from Google keyword/People-Also-Ask data or generated by an LLM. This is a structural feature of the market, not a gap in Answr's shopping list. WHY THAT…",
  },
  "demand": {
    key: "demand",
    title: "Demand",
    whatItMeasures: "How much demand exists behind the topics and keywords in your category.",
    feasibility: "buildable-with-existing-keys",
    headline: "Buildable now: DataForSEO's Keywords Data and AI Optimization endpoints — you already hold that key. Google Search Console adds the customer's own real queries for free.",
    effort: "M",
    sources: [
      {
        name: "DataForSEO Keywords Data API — Google Ads (keywords_data/google_ads/search_volume)",
        what: "Real Google Keyword Planner monthly search volume, 12-month monthly_searches history, CPC and competition, for up to 1,000 keywords per request. Also keywords_for_keywords (expansion) and keywords_for_site on the same billing model. This is the industry-standard hard number for traditional search demand.",
        how: "Answr ALREADY has DataForSEO credentials — this is a new client method, not a new vendor. Add a provider client alongside the existing DataForSEO usage and a nightly sampler step: batch the customer's tracked prompt set into 1,000-keyword POSTs against…",
        cost: "Published: $0.09 per task in Live mode, $0.06 per task in Standard queue; a task = up to 1,000 keywords, so…",
        tradeoff: "Measures Google web search, not AI prompts — an acquirer will push on this, so it must be labelled as such in the UI. Keyword Planner volumes are bucketed/rounded by Google and are averages, not exact counts. Long conversational prompts (the thing Answr actually tracks) frequently return volume 0…",
      },
      {
        name: "DataForSEO AI Optimization API — AI Keyword Data…",
        what: "An 'ai_search_volume' metric plus a 12-month AI-volume trend per keyword — DataForSEO's estimate of how often a term appears in questions people ask AI tools. Currently the only programmatically available AI-leaning demand metric that is self-serve.",
        how: "Same credentials, same pattern as above. POST to /v3/ai_optimization/ai_keyword_data/keywords_search_volume/live, up to 1,000 keywords per call, live-only (no task/get split), ~2s turnaround, rate limit 2,000 calls/min. Slots straight into the existing nightly sampler as one more step and writes one more column next…",
        cost: "$0.01 per task + $0.0001 per keyword — roughly $110 per 1M keywords. Cheapest AI-demand signal on the market…",
        tradeoff: "HONESTY FLAG — this is NOT observed LLM prompt data. DataForSEO's own help centre states ai_search_volume is computed by a proprietary algorithm over the 'People Also Ask' element of their Google SERP index; for Google AI Overview targets it is literally derived from Google search volume. It is a…",
      },
      {
        name: "DataForSEO AI Optimization API — LLM Mentions (ai_optimization/llm_mentions/search/live)",
        what: "Searchable index of 280M+ question/answer records across ChatGPT and Google AI Overview. Each row returns the actual question text, the model's answer, ai_search_volume, monthly_searches, sources (title/domain/url/snippet), brand_entities and fan_out_queries. You can filter by keyword or domain (up to 10 targets),…",
        how: "Existing credentials again. This is the highest-value call for a Demand screen: query the customer's category terms, sort rows by ai_search_volume desc, and you get a ranked list of real question phrasings people ask in AI contexts — which doubles as automated prompt-set discovery feeding Answr's existing sampler.…",
        cost: "$0.10 per task + $0.001 per returned row, max 1,000 rows per request. A 1,000-row pull costs $0.20. A weekly…",
        tradeoff: "Same provenance caveat: DataForSEO describes the corpus as records of Google AI Overviews, PAA questions and ChatGPT responses that they collect — i.e. queries they ran and SERP elements they crawled, not a consumer panel of prompts real users typed. 'Real prompts' in their marketing means real…",
      },
      {
        name: "Google Search Console Search Analytics API (searchanalytics.query) + Generative AI report",
        what: "The customer's own real query demand: exact queries, impressions, clicks, CTR, position for their verified property, 16 months of history. Separately, Google shipped Search Generative AI performance reports in Search Console on 3 June 2026 (rolled out to all sites by 31 Aug 2026), showing impressions inside AI…",
        how: "Add a Google OAuth flow to the Answr onboarding — the customer is already installing a proxy/snippet, so asking for a read-only GSC grant is a natural extra step and a strong retention hook. Nightly job pulls query-level rows, joins them to the tracked prompt set, and gives the Demand screen a first-party 'this is…",
        cost: "Free. Standard Google API quotas. Only cost is the OAuth/consent-screen work and a Google Cloud project.",
        tradeoff: "Self-serve OAuth client, but the consent screen needs verification for a sensitive scope — budget a week of Google review. Critical limitation to state plainly: the new Generative AI report is UI-only. The Search Analytics API `type` parameter still accepts only web, image, video, news, discover…",
      },
      {
        name: "Build-only: prompt-demand synthesis from DataForSEO SERP/Labs + Answr's existing LLM keys",
        what: "A defensible Demand estimate assembled entirely from things Answr already pays for: PAA questions and related_searches from the Google Organic SERP API, keyword expansion and search_intent from DataForSEO Labs, and LLM clustering to roll thousands of long-tail phrasings into a handful of demand topics with a weighted…",
        how: "Sampler step: (1) DataForSEO Labs keyword_ideas / related_keywords / keyword_suggestions to expand the seed category, (2) SERP API advanced results to harvest PAA + related searches per head term, (3) Google Ads volume on the head terms, (4) Gemini or Claude to cluster the long tail into topics and map each tracked…",
        cost: "DataForSEO Labs: $0.012 per task + $0.00012 per row (~$132 per 1M keywords). Google Organic SERP:…",
        tradeoff: "It is an estimate built on Google signals, and you own the methodology — which is both the weakness (no external validation, a buyer can question it) and the strength (no vendor dependency, no per-seat licence, full margin, and it is differentiated IP rather than a resold number). Should be…",
      },
      {
        name: "DataForSEO Google Trends API (keywords_data/google_trends/explore) and Clickstream Data API",
        what: "Trends: relative interest-over-time, geo breakdown and rising/breakout queries across Search, News, Images, Shopping and YouTube — the direction-of-travel signal Google Ads volume lacks. Clickstream: DataForSEO Search Volume and Global Search Volume derived from clickstream panels rather than Keyword Planner, useful…",
        how: "Existing credentials. Trends gives the Demand screen its sparkline and its 'rising topics' module; clickstream volume gives a cross-check column. Both are ordinary POST calls slotted into the nightly sampler.",
        cost: "Google Trends: $0.0027/task standard (~45 min), $0.011/task live (~32s) — max 5 keywords per task, so…",
        tradeoff: "Trends is relative (0–100 index), never absolute, and the 5-keyword-per-request cap makes it expensive per keyword — use it for a curated top-20 topic list, not the whole prompt set. Clickstream volumes are panel-extrapolated and will disagree with Google Ads numbers; showing both without…",
      },
    ],
    recommended: "Ship a two-column Demand module on the DataForSEO credentials Answr already holds, and label the columns honestly. Column 1 — 'Search demand': keywords_data/google_ads/search_volume/live, real Keyword Planner volume plus 12-month history, ~$0.09 per 1,000 keywords, cached 30 days in the Redis that is already in the stack. Column 2 — 'AI demand (estimated)': ai_optimization/ai_keyword_data/keywords_search_volume/live at $0.0001 per keyword, with ai_optimization/llm_mentions/search/live ($0.10 + $0.001/row) layered on to surface the actual question phrasings ranked by ai_search_volume — which simultaneously…",
    notes: "The single most important thing to tell an acquirer: traditional search volume and genuine AI-prompt volume are different products, and only the first is solved. Traditional volume is a commodity — real Google Keyword Planner data costs about nine cents per thousand keywords through a key Answr already owns. Genuine AI-prompt volume — a count of what humans actually typed into ChatGPT — can only be obtained by observing users, which means a consumer clickstream panel. Nobody sells that as a self-serve API in September 2026. Profound licenses 400M+ conversations from double-opt-in panels and sells the result as…",
  },
  "regions": {
    key: "regions",
    title: "Regional visibility",
    whatItMeasures: "How your visibility differs by country and locale.",
    feasibility: "buildable-with-existing-keys",
    headline: "Buildable now: your existing Anthropic, Perplexity, OpenAI and Gemini keys all accept a user_location parameter, and DataForSEO returns AI Overviews per location_code.",
    effort: "M",
    sources: [
      {
        name: "Anthropic web_search tool — user_location (Answr already has this key)",
        what: "Localizes the retrieval layer of Claude's server-side web search. Accepts user_location: {type: \"approximate\", city, region, country (ISO 3166-1 alpha-2), timezone (IANA)}; at least one of city/region/country/timezone required. Unsupported country codes are rejected with a 400. Three tool versions exist as of 2026:…",
        how: "Add an optional `location` argument to Answr's existing Anthropic provider client; when a run has a region, inject the user_location block into the tool definition. No new client, no new key. Note: on web_search_20260209+ you must set allowed_callers: [\"direct\"] if you want raw un-filtered results back for citation…",
        cost: "$10 per 1,000 searches, plus standard token cost for search content (search citation fields…",
        tradeoff: "Geo-conditions what Claude *retrieves*, not its parametric knowledge and not the Claude.ai consumer product. A buyer should be told plainly: this measures geo-conditioned grounded answers, not a literal replay of what a person in Berlin sees in the Claude app. Also, prompts that don't trigger a…",
      },
      {
        name: "DataForSEO AI Optimization API — LLM Responses (Answr already has this key)",
        what: "Unified prompt-to-answer API across ChatGPT, Claude, Gemini and Perplexity. Request fields include user_prompt, model_name, max_output_tokens, web_search, **web_search_country_iso_code**, and **system_message**. ChatGPT/Claude/Gemini support both Standard (queued) and Live; Perplexity is Live-only. Sister endpoints:…",
        how: "This is the single highest-leverage option: `web_search_country_iso_code` covers Regions and `system_message` covers Audiences in the *same* call, through a provider Answr already integrates. Add a DataForSEO LLM-Responses step to the nightly sampler as a cross-check / fallback lane alongside the direct provider…",
        cost: "LLM Responses: Live $0.0006 + the underlying LLM's own pass-through charge; Standard queue $0.0002 + a…",
        tradeoff: "It is a single-vendor dependency sitting between Answr and four model providers — an acquirer will see concentration risk and a margin stack (DataForSEO markup on top of LLM tokens). It also only exposes a *country* ISO code, not city/region granularity. Avoid the adjacent **LLM Scraper API**…",
      },
      {
        name: "Perplexity Sonar / Search API — web_search_options.user_location (Answr already has this key)",
        what: "The richest geo controls of any direct LLM API. Chat completions accept web_search_options.user_location: {country (ISO 3166-1 alpha-2), region, city, latitude (-90..90), longitude (-180..180)} — lat/long must be accompanied by country. Plus search_language_filter (ISO 639-1, up to 10 codes), search_domain_filter (up…",
        how: "Extend Answr's Perplexity client with a location arg mapping region → {country, region, city}, and optionally pass search_language_filter for locale runs. City/lat-long granularity means Answr could credibly ship a city-level region tier on Perplexity alone, which no competitor in the sub-enterprise tier advertises.",
        cost: "Standard Sonar per-token pricing plus per-request search fee (varies by model tier — verify current rates on…",
        tradeoff: "Perplexity's community forum has open reports of the user_location filter not visibly changing results for some query classes — validate empirically per market before selling the metric, and consider a QA check that flags regions whose answers are byte-identical across locales.",
      },
      {
        name: "OpenAI Responses API — web_search tool user_location",
        what: "user_location: {type: \"approximate\", country (two-letter ISO), city (free text), region (free text), timezone (IANA)}. Also search_context_size (low/medium/high) and allowed_domains / blocked_domains up to 100 entries each. Supported on the 2026 search-capable models (gpt-6-astra, gpt-5.5, gpt-5-search-api).",
        how: "Same shape as the Anthropic change: thread an optional location into Answr's existing OpenAI client. search_context_size is worth exposing as a sampler config — `high` gives more citations per answer and therefore a denser citation-share signal, at higher token cost.",
        cost: "Web search tool calls are billed per call on top of tokens; OpenAI's current guide page does not print the…",
        tradeoff: "Same core caveat as Anthropic: this is ChatGPT-the-API, not ChatGPT-the-product. The consumer app personalizes on account history, memory and actual IP; the API does not. If Answr's UI says \"ChatGPT\" next to a region number, the methodology page needs to say which surface that is.",
      },
      {
        name: "Google Gemini — googleSearch grounding + toolConfig.retrievalConfig",
        what: "Grounding with Google Search accepts toolConfig.retrievalConfig with latLng {latitude, longitude} and an optional language_code (e.g. \"en_US\"). Maps grounding uses the same retrievalConfig shape.",
        how: "Map each Answr region to a representative lat/long centroid (capital city or largest metro) plus a language_code, and pass retrievalConfig on grounded Gemini runs.",
        cost: "Grounded-prompt pricing per 1,000 grounded requests on top of tokens — confirm the current rate on Google's…",
        tradeoff: "The weakest of the four. There is no country-code parameter, only coordinates, so a centroid is a modelling choice Answr has to defend. Gemini also does not allow combining search tools with non-search tools in one generateContent call, which constrains how Answr composes the sampler step. Expect…",
      },
      {
        name: "DataForSEO Google AI Mode SERP API (Answr already has this key)",
        what: "POST /v3/serp/google/ai_mode/live/advanced. Required: keyword (≤700 chars) + one of location_code / location_name / location_coordinate + one of language_code / language_name. Optional: device (desktop/mobile), os, tag, calculate_rectangles, browser_screen_*. Returns AI answer text in plain and markdown form,…",
        how: "Cleanest true geo surface Answr can reach today: Google's own AI Mode and AI Overviews genuinely vary by location_code, and the endpoint hands back parsed references ready for Answr's citation scorer. Add it as a sampler step keyed by (prompt, location_code, language_code). Use Standard queue for the nightly batch…",
        cost: "Standard $0.0012, Priority $0.0024, Live $0.004 per SERP page. Pay-as-you-go.",
        tradeoff: "Covers Google's AI surfaces only — it says nothing about ChatGPT or Claude. AI Mode/AI Overview language coverage has been English-heavy and the AI Overview block does not render for every gl/hl pair, so some region cells will legitimately come back empty and the UI must distinguish \"not…",
      },
    ],
    recommended: "Ship Regions and Audiences as one schema change — add `region` and `persona` to the prompt-run key — and fan the existing nightly sampler out across that grid. For Regions, use each provider's native localization parameter on the clients Answr already owns (Anthropic user_location, OpenAI user_location, Perplexity web_search_options.user_location, Gemini retrievalConfig.latLng + language_code), and add DataForSEO /v3/serp/google/ai_mode/live/advanced with location_code/language_code for the Google AI Mode and AI Overview surface at $0.0012/page on the standard queue. For Audiences, use persona system prompts…",
    notes: "Four things to put in front of a buyer rather than let them find. 1. **The geo parameters localize retrieval, not the model.** user_location changes which web results the model sees; it does not change the model's parametric knowledge and it does not replay the consumer product's personalization (account memory, real IP, history). Any prompt that doesn't trigger a search returns a geo-invariant answer. Answr should ship a per-region QA check that flags regions whose answers are byte-identical across locales — that both protects the metric and makes a good demo. 2. **Coverage is uneven across providers.**…",
  },
  "audiences": {
    key: "audiences",
    title: "Audience visibility",
    whatItMeasures: "How your visibility differs by audience segment or persona.",
    feasibility: "buildable-with-existing-keys",
    headline: "Buildable now: persona-conditioned prompt runs through the LLM keys you already have — the same method competitors use, with accuracy caveats stated.",
    effort: "M",
    sources: [
      {
        name: "Anthropic web_search tool — user_location (Answr already has this key)",
        what: "Localizes the retrieval layer of Claude's server-side web search. Accepts user_location: {type: \"approximate\", city, region, country (ISO 3166-1 alpha-2), timezone (IANA)}; at least one of city/region/country/timezone required. Unsupported country codes are rejected with a 400. Three tool versions exist as of 2026:…",
        how: "Add an optional `location` argument to Answr's existing Anthropic provider client; when a run has a region, inject the user_location block into the tool definition. No new client, no new key. Note: on web_search_20260209+ you must set allowed_callers: [\"direct\"] if you want raw un-filtered results back for citation…",
        cost: "$10 per 1,000 searches, plus standard token cost for search content (search citation fields…",
        tradeoff: "Geo-conditions what Claude *retrieves*, not its parametric knowledge and not the Claude.ai consumer product. A buyer should be told plainly: this measures geo-conditioned grounded answers, not a literal replay of what a person in Berlin sees in the Claude app. Also, prompts that don't trigger a…",
      },
      {
        name: "DataForSEO AI Optimization API — LLM Responses (Answr already has this key)",
        what: "Unified prompt-to-answer API across ChatGPT, Claude, Gemini and Perplexity. Request fields include user_prompt, model_name, max_output_tokens, web_search, **web_search_country_iso_code**, and **system_message**. ChatGPT/Claude/Gemini support both Standard (queued) and Live; Perplexity is Live-only. Sister endpoints:…",
        how: "This is the single highest-leverage option: `web_search_country_iso_code` covers Regions and `system_message` covers Audiences in the *same* call, through a provider Answr already integrates. Add a DataForSEO LLM-Responses step to the nightly sampler as a cross-check / fallback lane alongside the direct provider…",
        cost: "LLM Responses: Live $0.0006 + the underlying LLM's own pass-through charge; Standard queue $0.0002 + a…",
        tradeoff: "It is a single-vendor dependency sitting between Answr and four model providers — an acquirer will see concentration risk and a margin stack (DataForSEO markup on top of LLM tokens). It also only exposes a *country* ISO code, not city/region granularity. Avoid the adjacent **LLM Scraper API**…",
      },
      {
        name: "Perplexity Sonar / Search API — web_search_options.user_location (Answr already has this key)",
        what: "The richest geo controls of any direct LLM API. Chat completions accept web_search_options.user_location: {country (ISO 3166-1 alpha-2), region, city, latitude (-90..90), longitude (-180..180)} — lat/long must be accompanied by country. Plus search_language_filter (ISO 639-1, up to 10 codes), search_domain_filter (up…",
        how: "Extend Answr's Perplexity client with a location arg mapping region → {country, region, city}, and optionally pass search_language_filter for locale runs. City/lat-long granularity means Answr could credibly ship a city-level region tier on Perplexity alone, which no competitor in the sub-enterprise tier advertises.",
        cost: "Standard Sonar per-token pricing plus per-request search fee (varies by model tier — verify current rates on…",
        tradeoff: "Perplexity's community forum has open reports of the user_location filter not visibly changing results for some query classes — validate empirically per market before selling the metric, and consider a QA check that flags regions whose answers are byte-identical across locales.",
      },
      {
        name: "OpenAI Responses API — web_search tool user_location",
        what: "user_location: {type: \"approximate\", country (two-letter ISO), city (free text), region (free text), timezone (IANA)}. Also search_context_size (low/medium/high) and allowed_domains / blocked_domains up to 100 entries each. Supported on the 2026 search-capable models (gpt-6-astra, gpt-5.5, gpt-5-search-api).",
        how: "Same shape as the Anthropic change: thread an optional location into Answr's existing OpenAI client. search_context_size is worth exposing as a sampler config — `high` gives more citations per answer and therefore a denser citation-share signal, at higher token cost.",
        cost: "Web search tool calls are billed per call on top of tokens; OpenAI's current guide page does not print the…",
        tradeoff: "Same core caveat as Anthropic: this is ChatGPT-the-API, not ChatGPT-the-product. The consumer app personalizes on account history, memory and actual IP; the API does not. If Answr's UI says \"ChatGPT\" next to a region number, the methodology page needs to say which surface that is.",
      },
      {
        name: "Google Gemini — googleSearch grounding + toolConfig.retrievalConfig",
        what: "Grounding with Google Search accepts toolConfig.retrievalConfig with latLng {latitude, longitude} and an optional language_code (e.g. \"en_US\"). Maps grounding uses the same retrievalConfig shape.",
        how: "Map each Answr region to a representative lat/long centroid (capital city or largest metro) plus a language_code, and pass retrievalConfig on grounded Gemini runs.",
        cost: "Grounded-prompt pricing per 1,000 grounded requests on top of tokens — confirm the current rate on Google's…",
        tradeoff: "The weakest of the four. There is no country-code parameter, only coordinates, so a centroid is a modelling choice Answr has to defend. Gemini also does not allow combining search tools with non-search tools in one generateContent call, which constrains how Answr composes the sampler step. Expect…",
      },
      {
        name: "DataForSEO Google AI Mode SERP API (Answr already has this key)",
        what: "POST /v3/serp/google/ai_mode/live/advanced. Required: keyword (≤700 chars) + one of location_code / location_name / location_coordinate + one of language_code / language_name. Optional: device (desktop/mobile), os, tag, calculate_rectangles, browser_screen_*. Returns AI answer text in plain and markdown form,…",
        how: "Cleanest true geo surface Answr can reach today: Google's own AI Mode and AI Overviews genuinely vary by location_code, and the endpoint hands back parsed references ready for Answr's citation scorer. Add it as a sampler step keyed by (prompt, location_code, language_code). Use Standard queue for the nightly batch…",
        cost: "Standard $0.0012, Priority $0.0024, Live $0.004 per SERP page. Pay-as-you-go.",
        tradeoff: "Covers Google's AI surfaces only — it says nothing about ChatGPT or Claude. AI Mode/AI Overview language coverage has been English-heavy and the AI Overview block does not render for every gl/hl pair, so some region cells will legitimately come back empty and the UI must distinguish \"not…",
      },
    ],
    recommended: "Ship Regions and Audiences as one schema change — add `region` and `persona` to the prompt-run key — and fan the existing nightly sampler out across that grid. For Regions, use each provider's native localization parameter on the clients Answr already owns (Anthropic user_location, OpenAI user_location, Perplexity web_search_options.user_location, Gemini retrievalConfig.latLng + language_code), and add DataForSEO /v3/serp/google/ai_mode/live/advanced with location_code/language_code for the Google AI Mode and AI Overview surface at $0.0012/page on the standard queue. For Audiences, use persona system prompts…",
    notes: "Four things to put in front of a buyer rather than let them find. 1. **The geo parameters localize retrieval, not the model.** user_location changes which web results the model sees; it does not change the model's parametric knowledge and it does not replay the consumer product's personalization (account memory, real IP, history). Any prompt that doesn't trigger a search returns a geo-invariant answer. Answr should ship a per-region QA check that flags regions whose answers are byte-identical across locales — that both protects the metric and makes a good demo. 2. **Coverage is uneven across providers.**…",
  },
  "sentiment": {
    key: "sentiment",
    title: "Sentiment",
    whatItMeasures: "How favourably AI answers describe your brand when they mention it.",
    feasibility: "build-only-no-data-needed",
    headline: "Buildable now with keys you already hold: classify the brand mention in each stored answer via a batch LLM call — cents per thousand answers.",
    effort: "M",
    sources: [
      {
        name: "OpenAI Batch API + gpt-5-nano (or gpt-5-mini), /v1/batches with strict JSON-schema structured…",
        what: "Per-answer, per-entity sentiment labels. One call per stored answer returns a JSON array of {entity, label(positive|neutral|negative|not_mentioned), confidence 0-1, evidence_quote} covering the tracked brand AND its competitors in a single pass — so sentiment, share-of-voice and the evidence receipt stay consistent…",
        how: "New module lib/classify/sentiment.ts reusing the existing OPENAI_API_KEY from lib/providers/openai.ts. After lib/sampler/run.ts writes each PromptRun, emit one JSONL line per answer (custom_id = runId:provider) to POST /v1/files then POST /v1/batches {endpoint:'/v1/chat/completions', completion_window:'24h'}; store…",
        cost: "Published, self-serve. gpt-5-nano $0.05/$0.40 per 1M in/out standard, $0.025/$0.20 batch; gpt-5-mini…",
        tradeoff: "24h latency means sentiment lags the run by a day — acceptable for a nightly sampler, but the UI must show 'classifying' state or you sync-classify the current day and batch the backfill. Nano-tier models are weak on the case that actually matters here: hedged comparative prose ('X is solid but…",
      },
      {
        name: "Anthropic Message Batches API + Claude Haiku 4.5 (claude-haiku-4-5-20251001), POST…",
        what: "Same per-entity sentiment classification, at the quality tier the codebase already advertises. lib/providers/anthropic.ts line 11/23/25 literally says 'the Haiku sentiment classifier' and declares powers:['...','sentiment_mix'] — this source makes the existing claim true rather than adding a new dependency.",
        how: "Extend the AnswerProvider interface in lib/providers/types.ts with an optional classify() and implement it in lib/providers/anthropic.ts (the client, postJson helper and ANTHROPIC_API_KEY plumbing already exist). Submit up to 100,000 requests / 256MB per batch to /v1/messages/batches; poll and pull the .jsonl…",
        cost: "Published, self-serve. Haiku 4.5 = $1/MTok in, $5/MTok out; Batch = $0.50/$2.50 (flat 50% off both…",
        tradeoff: "~17x the token cost of gpt-5-nano batch for the same job — but $9.50/mo at 10k answers is still immaterial next to a single seat of revenue, and it is the strongest cheap classifier of the three for hedged comparative text. Real risk is provider self-scoring: using Claude to grade how Claude…",
      },
      {
        name: "Gemini Batch API + Gemini 2.5 / 3.5 Flash-Lite (batches.create, inline or File API JSONL)",
        what: "Third classification lane on the key Answr already has (GEMINI_API_KEY), with responseSchema for constrained JSON. Also the cheapest way to run the classifier in a region/residency configuration if a buyer's customer demands Google-only processing.",
        how: "Add classify() to lib/providers/gemini.ts mirroring the Anthropic/OpenAI implementations; lib/providers/registry.ts already picks whichever provider is configured (see pickProvider() used by app/api/suggest/topics/route.ts), so the classifier can inherit the same fallback order and degrade gracefully when one key is…",
        cost: "Published, self-serve, free tier available. gemini-2.5-flash-lite $0.10/$0.40 per 1M (batch $0.05/$0.20);…",
        tradeoff: "Google has published that all Gemini 3.x prices roughly double on 1 Jan 2027 — model the classifier's unit cost on the post-increase number, not today's, or pin to 2.5 Flash-Lite. Flash-Lite tiers vary noticeably in instruction-following on nuanced rubrics; whichever lane wins should be locked and…",
      },
      {
        name: "OpenAI text-embedding-3-small + k-means/HDBSCAN in TypeScript (hdbscan-ts,…",
        what: "Topic DISCOVERY: embed each tracked prompt, cluster the vectors, and get natural subject groupings out of the customer's actual prompt set rather than a guessed taxonomy. Then name each cluster by handing its 8-10 nearest-centroid prompts to an LLM.",
        how: "POST /v1/embeddings (or the same endpoint via /v1/batches for 50% off) on every prompt in lib/db/entities listPrompts(); cluster in-process — hdbscan-ts or clusternova (zero-dep TS HDBSCAN, auto-picks cluster count and flags outliers) with cosine distance, or ml-kmeans with k-means++ seeding if you want a fixed k;…",
        cost: "Published, self-serve. text-embedding-3-small $0.02 per 1M tokens ($0.01 batch); text-embedding-3-large…",
        tradeoff: "Re-clustering nightly makes topic labels and their membership drift, which makes every topic trend chart jump and destroys the metric's credibility — the honest design is: cluster once at onboarding (or on explicit 'rebuild topics'), freeze the taxonomy, then ASSIGN new prompts to the frozen…",
      },
      {
        name: "LLM taxonomy assignment reusing the existing app/api/suggest/topics/route.ts pattern",
        what: "Topic ASSIGNMENT: given a fixed topic list, tag every tracked prompt. This is the piece that is actually missing — the route already GENERATES 5-6 topic labels for a brand at onboarding; nothing ever assigns prompts to them, which is why /app/insights/topics/running-shoes renders a 'not collecting' panel.",
        how: "One call can classify ~200 prompts at once: send the frozen taxonomy plus the numbered prompt list, get back a JSON array of {prompt_index, topic, confidence} under a strict schema. Persist topic_id on the prompt entity (lib/db/entities.ts), then group the existing scoring output in lib/scoring/index.ts by that tag —…",
        cost: "Uses keys Answr already has. A 200-prompt workspace = ~4,200 input + ~1,600 output tokens = ~$0.001 per full…",
        tradeoff: "Quality depends entirely on the taxonomy, and the onboarding generator produces exactly 5-6 labels from the brand name alone — too coarse for a customer tracking 300 prompts. Let customers rename/merge/split topics and re-run assignment; treat the LLM output as a default, not a verdict. Also, a…",
      },
      {
        name: "Google Cloud Natural Language API — analyzeSentiment / analyzeEntitySentiment",
        what: "Dedicated managed sentiment. Returns score (-1..1) and magnitude at document level, or per-entity with analyzeEntitySentiment, which is nominally the right shape (sentiment of the brand ENTITY inside the answer).",
        how: "Would need a new GCP project, service account and the language.googleapis.com API enabled — a genuinely new credential, not covered by the existing GEMINI_API_KEY. POST to language.googleapis.com/v1/documents:analyzeEntitySentiment per stored answer, map score to positive/neutral/negative by threshold.",
        cost: "Published, self-serve, but billed per 1,000-Unicode-character unit: first 5k units/mo free, then…",
        tradeoff: "Not worth it. It costs 3-45x more than the LLM options for a strictly worse output: a bare polarity score with no rubric, no evidence quote, no reason string, no ability to resolve 'the brand' vs a similarly-named competitor, and no handling of the comparative hedging that dominates AI answers. It…",
      },
    ],
    recommended: "Build it in-house with keys Answr already has — this capability needs no new vendor, no new contract and no new data. Concretely: one classification pass, one model, one JSON schema, run through a batch API. Default to Claude Haiku 4.5 via the Message Batches API ($0.50/$2.50 per MTok batch = ~$9.50/mo at 10k answers, ~$0.95 per 1k classifications), because lib/providers/anthropic.ts already declares this exact capability and Haiku is the most reliable of the cheap tiers on hedged comparative prose; make the classifier model an env var so a cost-sensitive buyer can switch to gpt-5-nano batch ($0.57/mo, ~$0.057…",
    notes: "COST MODEL (state the assumptions to a buyer, they are the whole argument): 10,000 stored answers/month, average answer ~3,000 characters (~800 tokens), classification prompt = ~500-token rubric + the answer = ~1,300 input tokens, output = ~120 tokens of JSON (per-entity label + confidence + evidence quote). Monthly totals at that shape: gpt-5-nano batch $0.57 | gemini-2.5-flash-lite batch $0.89 | gpt-5-mini batch $2.83 | gemini-3.5-flash-lite batch $3.45 | Claude Haiku 4.5 batch $9.50 | Claude Haiku 4.5 sync $19 | Azure ~$30 | AWS Comprehend $30 | Google Cloud NL ~$25-60. Classifying only the +/-2 sentence…",
  },
  "topics": {
    key: "topics",
    title: "Topics",
    whatItMeasures: "Your tracked prompts grouped into subject areas, with visibility per topic.",
    feasibility: "build-only-no-data-needed",
    headline: "Buildable now with keys you already hold: tag or cluster prompts by subject using an LLM taxonomy pass or embeddings clustering.",
    effort: "M",
    sources: [
      {
        name: "OpenAI Batch API + gpt-5-nano (or gpt-5-mini), /v1/batches with strict JSON-schema structured…",
        what: "Per-answer, per-entity sentiment labels. One call per stored answer returns a JSON array of {entity, label(positive|neutral|negative|not_mentioned), confidence 0-1, evidence_quote} covering the tracked brand AND its competitors in a single pass — so sentiment, share-of-voice and the evidence receipt stay consistent…",
        how: "New module lib/classify/sentiment.ts reusing the existing OPENAI_API_KEY from lib/providers/openai.ts. After lib/sampler/run.ts writes each PromptRun, emit one JSONL line per answer (custom_id = runId:provider) to POST /v1/files then POST /v1/batches {endpoint:'/v1/chat/completions', completion_window:'24h'}; store…",
        cost: "Published, self-serve. gpt-5-nano $0.05/$0.40 per 1M in/out standard, $0.025/$0.20 batch; gpt-5-mini…",
        tradeoff: "24h latency means sentiment lags the run by a day — acceptable for a nightly sampler, but the UI must show 'classifying' state or you sync-classify the current day and batch the backfill. Nano-tier models are weak on the case that actually matters here: hedged comparative prose ('X is solid but…",
      },
      {
        name: "Anthropic Message Batches API + Claude Haiku 4.5 (claude-haiku-4-5-20251001), POST…",
        what: "Same per-entity sentiment classification, at the quality tier the codebase already advertises. lib/providers/anthropic.ts line 11/23/25 literally says 'the Haiku sentiment classifier' and declares powers:['...','sentiment_mix'] — this source makes the existing claim true rather than adding a new dependency.",
        how: "Extend the AnswerProvider interface in lib/providers/types.ts with an optional classify() and implement it in lib/providers/anthropic.ts (the client, postJson helper and ANTHROPIC_API_KEY plumbing already exist). Submit up to 100,000 requests / 256MB per batch to /v1/messages/batches; poll and pull the .jsonl…",
        cost: "Published, self-serve. Haiku 4.5 = $1/MTok in, $5/MTok out; Batch = $0.50/$2.50 (flat 50% off both…",
        tradeoff: "~17x the token cost of gpt-5-nano batch for the same job — but $9.50/mo at 10k answers is still immaterial next to a single seat of revenue, and it is the strongest cheap classifier of the three for hedged comparative text. Real risk is provider self-scoring: using Claude to grade how Claude…",
      },
      {
        name: "Gemini Batch API + Gemini 2.5 / 3.5 Flash-Lite (batches.create, inline or File API JSONL)",
        what: "Third classification lane on the key Answr already has (GEMINI_API_KEY), with responseSchema for constrained JSON. Also the cheapest way to run the classifier in a region/residency configuration if a buyer's customer demands Google-only processing.",
        how: "Add classify() to lib/providers/gemini.ts mirroring the Anthropic/OpenAI implementations; lib/providers/registry.ts already picks whichever provider is configured (see pickProvider() used by app/api/suggest/topics/route.ts), so the classifier can inherit the same fallback order and degrade gracefully when one key is…",
        cost: "Published, self-serve, free tier available. gemini-2.5-flash-lite $0.10/$0.40 per 1M (batch $0.05/$0.20);…",
        tradeoff: "Google has published that all Gemini 3.x prices roughly double on 1 Jan 2027 — model the classifier's unit cost on the post-increase number, not today's, or pin to 2.5 Flash-Lite. Flash-Lite tiers vary noticeably in instruction-following on nuanced rubrics; whichever lane wins should be locked and…",
      },
      {
        name: "OpenAI text-embedding-3-small + k-means/HDBSCAN in TypeScript (hdbscan-ts,…",
        what: "Topic DISCOVERY: embed each tracked prompt, cluster the vectors, and get natural subject groupings out of the customer's actual prompt set rather than a guessed taxonomy. Then name each cluster by handing its 8-10 nearest-centroid prompts to an LLM.",
        how: "POST /v1/embeddings (or the same endpoint via /v1/batches for 50% off) on every prompt in lib/db/entities listPrompts(); cluster in-process — hdbscan-ts or clusternova (zero-dep TS HDBSCAN, auto-picks cluster count and flags outliers) with cosine distance, or ml-kmeans with k-means++ seeding if you want a fixed k;…",
        cost: "Published, self-serve. text-embedding-3-small $0.02 per 1M tokens ($0.01 batch); text-embedding-3-large…",
        tradeoff: "Re-clustering nightly makes topic labels and their membership drift, which makes every topic trend chart jump and destroys the metric's credibility — the honest design is: cluster once at onboarding (or on explicit 'rebuild topics'), freeze the taxonomy, then ASSIGN new prompts to the frozen…",
      },
      {
        name: "LLM taxonomy assignment reusing the existing app/api/suggest/topics/route.ts pattern",
        what: "Topic ASSIGNMENT: given a fixed topic list, tag every tracked prompt. This is the piece that is actually missing — the route already GENERATES 5-6 topic labels for a brand at onboarding; nothing ever assigns prompts to them, which is why /app/insights/topics/running-shoes renders a 'not collecting' panel.",
        how: "One call can classify ~200 prompts at once: send the frozen taxonomy plus the numbered prompt list, get back a JSON array of {prompt_index, topic, confidence} under a strict schema. Persist topic_id on the prompt entity (lib/db/entities.ts), then group the existing scoring output in lib/scoring/index.ts by that tag —…",
        cost: "Uses keys Answr already has. A 200-prompt workspace = ~4,200 input + ~1,600 output tokens = ~$0.001 per full…",
        tradeoff: "Quality depends entirely on the taxonomy, and the onboarding generator produces exactly 5-6 labels from the brand name alone — too coarse for a customer tracking 300 prompts. Let customers rename/merge/split topics and re-run assignment; treat the LLM output as a default, not a verdict. Also, a…",
      },
      {
        name: "Google Cloud Natural Language API — analyzeSentiment / analyzeEntitySentiment",
        what: "Dedicated managed sentiment. Returns score (-1..1) and magnitude at document level, or per-entity with analyzeEntitySentiment, which is nominally the right shape (sentiment of the brand ENTITY inside the answer).",
        how: "Would need a new GCP project, service account and the language.googleapis.com API enabled — a genuinely new credential, not covered by the existing GEMINI_API_KEY. POST to language.googleapis.com/v1/documents:analyzeEntitySentiment per stored answer, map score to positive/neutral/negative by threshold.",
        cost: "Published, self-serve, but billed per 1,000-Unicode-character unit: first 5k units/mo free, then…",
        tradeoff: "Not worth it. It costs 3-45x more than the LLM options for a strictly worse output: a bare polarity score with no rubric, no evidence quote, no reason string, no ability to resolve 'the brand' vs a similarly-named competitor, and no handling of the comparative hedging that dominates AI answers. It…",
      },
    ],
    recommended: "Build it in-house with keys Answr already has — this capability needs no new vendor, no new contract and no new data. Concretely: one classification pass, one model, one JSON schema, run through a batch API. Default to Claude Haiku 4.5 via the Message Batches API ($0.50/$2.50 per MTok batch = ~$9.50/mo at 10k answers, ~$0.95 per 1k classifications), because lib/providers/anthropic.ts already declares this exact capability and Haiku is the most reliable of the cheap tiers on hedged comparative prose; make the classifier model an env var so a cost-sensitive buyer can switch to gpt-5-nano batch ($0.57/mo, ~$0.057…",
    notes: "COST MODEL (state the assumptions to a buyer, they are the whole argument): 10,000 stored answers/month, average answer ~3,000 characters (~800 tokens), classification prompt = ~500-token rubric + the answer = ~1,300 input tokens, output = ~120 tokens of JSON (per-entity label + confidence + evidence quote). Monthly totals at that shape: gpt-5-nano batch $0.57 | gemini-2.5-flash-lite batch $0.89 | gpt-5-mini batch $2.83 | gemini-3.5-flash-lite batch $3.45 | Claude Haiku 4.5 batch $9.50 | Claude Haiku 4.5 sync $19 | Azure ~$30 | AWS Comprehend $30 | Google Cloud NL ~$25-60. Classifying only the +/-2 sentence…",
  },
  "shopping": {
    key: "shopping",
    title: "Shopping visibility",
    whatItMeasures: "Product-level visibility in AI shopping and purchase-intent answers.",
    feasibility: "buildable-with-existing-keys",
    headline: "Buildable now: purchase-intent prompt sampling through your existing LLM lanes, plus DataForSEO's ai_overview_shopping element and a catalog match.",
    effort: "L",
    sources: [
      {
        name: "DataForSEO SERP API — `ai_overview_shopping` element (Google Organic Advanced + Google AI…",
        what: "Structured product cards embedded inside Google AI Overviews and AI Mode answers. Each shopping item returns product_id, title, url, domain, seller, rating (value/votes/max), price (current, regular, currency, displayed), image_url, plus snippet/marketplace fields. Desktop and mobile, geo-targetable by location_code.…",
        how: "Zero new credentials. `lib/providers/dataforseo.ts` ALREADY calls POST https://api.dataforseo.com/v3/serp/google/organic/live/advanced with `load_async_ai_overview: true` — it walks `items[].items[]` for `.text` and `.references` and silently discards everything else. Add a branch that captures `type:…",
        cost: "Already inside the existing DataForSEO balance; standard SERP Advanced live pricing, no new minimum. Account…",
        tradeoff: "Google surface only — says nothing about ChatGPT or Claude. Products shown are Shopping Graph / Merchant Center entries, so a customer with no Merchant Center feed will legitimately show zero and that has to be explained in the UI, not treated as a bug. Parsing is vendor-dependent: if Google…",
      },
      {
        name: "Purchase-intent prompt sampling through Answr's four existing LLM lanes + an LLM extraction…",
        what: "Ranked product mentions (brand, model, approximate price, why-recommended, position in list) extracted from answers to prompts like \"best waterproof hiking boots under $200\" or \"what running shoe should I buy for flat feet\".",
        how: "No new vendor at all. Reuse the existing sampler: OpenAI Responses API with the `web_search` tool, Perplexity Sonar / Sonar Pro (supports `response_format` JSON schema, live search + citations on every SKU), Gemini with Google Search grounding, Anthropic with its web search tool. Then a second cheap call (Gemini…",
        cost: "Token cost only. Perplexity Sonar ~$1/$1 per 1M tokens, Sonar Pro $3/$15 per 1M, Sonar Pro Search adds a…",
        tradeoff: "THE key honesty point for an acquirer: the API is not the consumer surface. `web_search` in the Responses API is not ChatGPT Shopping — it returns prose product mentions, not the merchandised product carousel that is backed by OpenAI's approved merchant feed. Numbers from this lane are a…",
      },
      {
        name: "DataForSEO Merchant API — Google Shopping (Products / Product Info / Product Spec / Sellers /…",
        what: "The product-identity and competitive-price layer. Products returns ranked Google Shopping listings per keyword (title, rank, price, rating, seller domain, and a `product_availability` stock field added in 2026). Product Spec returns brand, part numbers, parameters and GTIN — the join keys. Product Info returns…",
        how: "Same DataForSEO credentials, different namespace: the `task_post` / `task_get/advanced` pattern under `/v3/merchant/google/{products|product_info|product_spec|sellers|reviews}/`. Use it for two jobs: (1) resolve an AI-answer product string to a canonical product_id + GTIN, (2) build the competitor SKU set for…",
        cost: "$0.001 per product/seller standard queue (up to 45 min), $0.002 priority (up to 1 min); billed per 40…",
        tradeoff: "Scraped Google Shopping data, not Google-sanctioned — accuracy is high but it is a vendor-mediated view and DataForSEO's ToS, not Google's, is what governs it. Adds a second billing line that scales with catalog size; a 5,000-SKU customer re-resolved weekly is a real cost to model before pricing…",
      },
      {
        name: "Google Merchant API v1 — Reports service (customer's own Merchant Center)",
        what: "First-party Google impression data. Report views queryable with a SQL-like language: product_view, product_performance_view (impressions, clicks, CTR, conversions), price_competitiveness_product_view, price_insights_product_view (suggested price with predicted impression/click/conversion delta),…",
        how: "POST https://merchantapi.googleapis.com/reports/v1/accounts/{account}/reports:search. New OAuth connector, same pattern as any other per-customer integration: Google Cloud project, OAuth consent screen, customer grants read access to their Merchant Center. Doubles as free, structured CATALOG INGESTION so Answr never…",
        cost: "API itself is free. Cost is the build: a Google Cloud project, OAuth consent screen verification, and…",
        tradeoff: "Per-customer OAuth, not an Answr-wide key — a buyer must stand up their own Google Cloud project, and every customer must have a Merchant Center account. It measures Google Shopping/AI Mode surfaces only and never attributes an impression specifically to an AI answer. HARD DATE: Content API for…",
      },
      {
        name: "Catalog ingestion via open feed standards (Google Merchant feed XML, schema.org Product/Offer…",
        what: "The catalog side of \"matched to a catalog\", with no vendor in the loop. Google Merchant RSS 2.0/Atom feed with the `g:` namespace (g:id, g:gtin, g:mpn, g:brand, g:title, g:price, g:availability); schema.org Product/Offer JSON-LD already on the customer's PDPs; and OpenAI's ChatGPT product feed spec (stable version…",
        how: "Ask for one feed URL in onboarding, fetch and parse nightly into a `products` table keyed on GTIN/MPN/brand+title. Most ecommerce customers already maintain a Merchant feed, so this is a paste-a-URL step, not an integration. Reusing the ChatGPT feed field names as Answr's internal schema is free…",
        cost: "$0. Parsing only.",
        tradeoff: "Feed quality varies wildly; missing GTINs on private-label and handmade goods force fallback to fuzzy/embedding matching. Nothing here measures visibility — it only gives you the entity set to match against.",
      },
      {
        name: "Matching layer — GTIN-first join, then embeddings in Upstash Vector, then LLM adjudication",
        what: "Resolving \"the Hoka Clifton 9\" in an AI answer to SKU HK-CL9-M-10-BLK in the customer's catalog, including brand-only mentions and paraphrased model names.",
        how: "Three tiers, all on keys Answr already holds. (1) Deterministic: GTIN/MPN exact match from feed or DataForSEO Product Spec, plus normalized-title exact match — resolves the large majority cheaply. (2) Embedding: OpenAI `text-embedding-3-small` over \"brand + title + key attributes\", stored in Upstash Vector (Answr…",
        cost: "text-embedding-3-small ~$0.02 per 1M tokens — a 10,000-SKU catalog embeds for well under a dollar. Upstash…",
        tradeoff: "This is where the metric's credibility lives or dies. Variant collapse (colour/size) and near-identical competitor SKUs are the failure modes, and an over-eager embedding threshold silently inflates visibility numbers. Needs a labelled eval set and a visible confidence column, or a technical…",
      },
    ],
    recommended: "Ship a two-lane v1 entirely on existing keys, then add one OAuth connector. Lane A: extend `lib/providers/dataforseo.ts` to capture `ai_overview_shopping` items (product_id, title, price, seller, rating, image) from the call it already makes, and add the Google AI Mode SERP endpoint — this is a few hours of parser work for the first genuinely product-level metric in the product. Lane B: tag a subset of prompts `intent: 'purchase'` in the existing sampler and run them through the four LLM lanes already wired, with a cheap second LLM call coercing answers into a `ProductMention[]` schema. Join both to a catalog…",
    notes: "Architecture fit is unusually clean and worth pointing out to a buyer: `lib/providers/dataforseo.ts` already declares `powers: [\"shopping_visibility\", \"region_visibility\", \"demand_volume\", \"citations_count\"]`, so the Shopping metric slot exists in the registry and is simply unpopulated — this is a wiring gap, not a missing subsystem. Two concrete code changes: `SampleResult` in `lib/providers/types.ts` carries only `text` + `citations[]`, so it needs an optional `products?: ProductMention[]`; and `answerProviders()` in `registry.ts` deliberately excludes dataforseo from the conversational lanes, so the…",
  },
  "page-health": {
    key: "page-health",
    title: "Page health",
    whatItMeasures: "Whether AI crawlers can actually read and index your own pages.",
    feasibility: "buildable-with-existing-keys",
    headline: "Buildable now: you already hold the DataForSEO On-Page key, and Google PageSpeed Insights is free. The check that matters is whether AI crawlers see your content without JavaScript.",
    effort: "L",
    sources: [
      {
        name: "DataForSEO On-Page API (Answr ALREADY holds this key)",
        what: "Per-URL crawl returning 60-120 on-page metrics, raw HTML, parsed content (headings/anchors/text), JSON-LD + microdata validation, Lighthouse scores, Core Web Vitals, resource list, page timings, redirect/canonical/meta-robots state. Endpoints: on_page/instant_pages, on_page/content_parsing/live, on_page/microdata,…",
        how: "New sampler step reusing the credentials already in lib/providers/dataforseo.ts — zero procurement. The AI-specific move: call on_page/instant_pages TWICE per URL, once with enable_javascript:false (exactly what GPTBot/ClaudeBot see) and once with enable_javascript:true or enable_browser_rendering:true, then diff…",
        cost: "Pay-as-you-go, no subscription, $50 min deposit (account already funded). Base crawl $0.00015/page;…",
        tradeoff: "Concentration risk — page health would then lean on the same vendor as the SERP lane, which an acquirer will notice. Rate limits: max 30 simultaneous requests, 20 tasks/request, 2,000 req/min. Lighthouse output is LAB data measured in a rendering browser: it grades human UX, not AI-crawler…",
      },
      {
        name: "Answr's own fetch-based crawler (no vendor at all)",
        what: "robots.txt, llms.txt, sitemap.xml, HTTP status + redirect chain, canonical, meta-robots, X-Robots-Tag header, JSON-LD extraction, heading tree, main-content text, sitemap lastmod freshness, and per-AI-bot allow/deny evaluation.",
        how: "Plain Node fetch inside the existing nightly sampler (lib/sampler/run.ts), behind a provider entry in lib/providers/registry.ts so it follows the isConfigured(env) pattern. npm: robots-parser (evaluate the customer's robots.txt against each AI user agent individually), cheerio or linkedom to parse,…",
        cost: "$0 beyond compute and egress.",
        tradeoff: "No JS rendering on its own, so it cannot compute the JS-delta — must pair with option 1 or 4. Must obey robots.txt and rate-limit politely even on a customer's own site. Cloudflare or a WAF in front of the customer's site will 403 an unknown UA, so Answr needs a documented user agent plus an…",
      },
      {
        name: "Google PageSpeed Insights API v5 + Chrome UX Report (CrUX) API",
        what: "PSI: a full Lighthouse lab run (performance/SEO/accessibility/best-practices audits, LCP, CLS, TBT, render-blocking resources) plus field data. CrUX: real-Chrome-user field LCP / INP / CLS at URL and origin level.",
        how: "Thin provider client, no browser to operate: GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=...&strategy=mobile&category=performance&category=seo&key=... and POST https://chromeuxreport.googleapis.com/v1/records:queryRecord. Both accept a plain Google API key from the same Cloud project as the…",
        cost: "Free. PSI: 25,000 requests/day and 100 queries/100 seconds; there is no paid tier and no way to buy…",
        tradeoff: "PSI measures a JS-executing browser, so it answers a human-UX question, not the AI question — shipping it as the page-health score would be the same overclaim competitors make. The real constraint is 100 queries per 100 seconds, not the daily cap. CrUX returns nothing for URLs/origins below its…",
      },
      {
        name: "Headless rendering for the JS-delta: self-hosted Playwright, or Firecrawl / ScrapingBee /…",
        what: "Fetch the same URL twice — raw HTML with JS off (the AI crawler's view) and the fully rendered DOM — to compute precisely which content disappears for non-rendering crawlers. Firecrawl also gives /v2/map for fast URL discovery across the customer's site.",
        how: "(a) Self-host Playwright/Chromium in a small container or worker. Note this cannot sit cleanly in a Vercel request handler: the 50 MB function limit vs a ~280 MB Chromium binary means @sparticuz/chromium-min plus an externally hosted tarball, and it runs 4-8x slower than local with 1 GB memory on Hobby / ~3 GB on…",
        cost: "Firecrawl: 1 credit per page — free 1,000 credits/mo, Hobby $19 (~5,000), Standard $99 (~100,000,…",
        tradeoff: "Largely redundant if option 1 is already in the stack — its value is independence from DataForSEO and full control of the render. The stealth/anti-bot proxy features these vendors sell are irrelevant and inappropriate here: Answr is crawling a consenting customer's own site and should use an…",
      },
      {
        name: "Google Search Console API (per-customer OAuth, not an Answr-held key)",
        what: "URL Inspection API: Google's own verdict on a URL — indexed or not, chosen canonical, last crawl, robots.txt state, mobile usability, and detected rich-result types. Search Analytics API: impressions/clicks/position per URL and query.",
        how: "OAuth connector added to onboarding; each customer grants Answr read access to their verified property. POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect and POST .../sites/{siteUrl}/searchAnalytics/query. This is the only source that gives a page-health verdict from an actual engine rather…",
        cost: "API is free. Quotas: URL Inspection 2,000 queries/day per property and 600/minute; Search Analytics 50,000…",
        tradeoff: "Buyer-must-provide, per tenant: not a key Answr can ship with, so coverage is whatever share of customers connect. Google's OAuth verification for the webmasters scope is a review process with a lead time, not an instant toggle. It reports Google's view — the best available proxy for Gemini and AI…",
      },
      {
        name: "Structured-data / JSON-LD validation",
        what: "Extraction and validation of JSON-LD and microdata, plus rich-result type eligibility.",
        how: "Cheapest path: DataForSEO on_page/microdata with validate_micromarkup:true — already paid for inside option 1's credits. Zero-vendor path: extract JSON-LD with cheerio and validate shape in-house against schema.org types and Google's documented required/recommended fields. Third-party: SchemaCheck REST API (accepts a…",
        cost: "DataForSEO: included in the on-page call. SchemaCheck: free tier, cached responses free. Apify actors ~$0.50…",
        tradeoff: "There is no authoritative Google endpoint: Google deprecated the Structured Data Testing Tool API and never shipped a Rich Results Test API, so every option here reimplements Google's published rules and will drift when Google changes them. Be honest in the UI on two counts — valid schema is…",
      },
    ],
    recommended: "Build it on the keys Answr already has — no new vendor contract is required to ship a credible v1. Concretely: DataForSEO On-Page instant_pages called twice per URL (enable_javascript false vs true) is the whole page-health engine, at roughly $0.0017/page, using a key that is already live and already wired in lib/providers/dataforseo.ts; the diff between those two responses is the one metric in this category that is both true and differentiated (\"this much of your page does not exist for GPTBot/ClaudeBot\"), and it is backed by the Vercel/MERJ analysis of 500M+ crawler fetches showing no major AI crawler…",
    notes: "REPO STATE (good news for an acquirer): the screens already exist and are honestly stubbed, not faked. /Users/arman_usman/Desktop/PROJECTS/answr/app/(dash)/app/page-health/ and /content-score/ each ship a page.tsx, a NotAvailable.tsx and a report.ts whose exports state in plain language why no figure is shown — page-health/report.ts says outright \"nothing in the pipeline crawls your pages\". So this is wiring a data source into finished UI and finished export plumbing (lib/export/report.ts), not building a feature from zero. The integration seam is already conventionalised: add a provider to…",
  },
  "content-score": {
    key: "content-score",
    title: "Content score",
    whatItMeasures: "How likely a given page is to be cited in AI answers.",
    feasibility: "buildable-with-existing-keys",
    headline: "Buildable now: grade a page against the answers it competes with, using your existing LLM keys and Answr's own citation corpus.",
    effort: "L",
    sources: [
      {
        name: "DataForSEO On-Page API (Answr ALREADY holds this key)",
        what: "Per-URL crawl returning 60-120 on-page metrics, raw HTML, parsed content (headings/anchors/text), JSON-LD + microdata validation, Lighthouse scores, Core Web Vitals, resource list, page timings, redirect/canonical/meta-robots state. Endpoints: on_page/instant_pages, on_page/content_parsing/live, on_page/microdata,…",
        how: "New sampler step reusing the credentials already in lib/providers/dataforseo.ts — zero procurement. The AI-specific move: call on_page/instant_pages TWICE per URL, once with enable_javascript:false (exactly what GPTBot/ClaudeBot see) and once with enable_javascript:true or enable_browser_rendering:true, then diff…",
        cost: "Pay-as-you-go, no subscription, $50 min deposit (account already funded). Base crawl $0.00015/page;…",
        tradeoff: "Concentration risk — page health would then lean on the same vendor as the SERP lane, which an acquirer will notice. Rate limits: max 30 simultaneous requests, 20 tasks/request, 2,000 req/min. Lighthouse output is LAB data measured in a rendering browser: it grades human UX, not AI-crawler…",
      },
      {
        name: "Answr's own fetch-based crawler (no vendor at all)",
        what: "robots.txt, llms.txt, sitemap.xml, HTTP status + redirect chain, canonical, meta-robots, X-Robots-Tag header, JSON-LD extraction, heading tree, main-content text, sitemap lastmod freshness, and per-AI-bot allow/deny evaluation.",
        how: "Plain Node fetch inside the existing nightly sampler (lib/sampler/run.ts), behind a provider entry in lib/providers/registry.ts so it follows the isConfigured(env) pattern. npm: robots-parser (evaluate the customer's robots.txt against each AI user agent individually), cheerio or linkedom to parse,…",
        cost: "$0 beyond compute and egress.",
        tradeoff: "No JS rendering on its own, so it cannot compute the JS-delta — must pair with option 1 or 4. Must obey robots.txt and rate-limit politely even on a customer's own site. Cloudflare or a WAF in front of the customer's site will 403 an unknown UA, so Answr needs a documented user agent plus an…",
      },
      {
        name: "Google PageSpeed Insights API v5 + Chrome UX Report (CrUX) API",
        what: "PSI: a full Lighthouse lab run (performance/SEO/accessibility/best-practices audits, LCP, CLS, TBT, render-blocking resources) plus field data. CrUX: real-Chrome-user field LCP / INP / CLS at URL and origin level.",
        how: "Thin provider client, no browser to operate: GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=...&strategy=mobile&category=performance&category=seo&key=... and POST https://chromeuxreport.googleapis.com/v1/records:queryRecord. Both accept a plain Google API key from the same Cloud project as the…",
        cost: "Free. PSI: 25,000 requests/day and 100 queries/100 seconds; there is no paid tier and no way to buy…",
        tradeoff: "PSI measures a JS-executing browser, so it answers a human-UX question, not the AI question — shipping it as the page-health score would be the same overclaim competitors make. The real constraint is 100 queries per 100 seconds, not the daily cap. CrUX returns nothing for URLs/origins below its…",
      },
      {
        name: "Headless rendering for the JS-delta: self-hosted Playwright, or Firecrawl / ScrapingBee /…",
        what: "Fetch the same URL twice — raw HTML with JS off (the AI crawler's view) and the fully rendered DOM — to compute precisely which content disappears for non-rendering crawlers. Firecrawl also gives /v2/map for fast URL discovery across the customer's site.",
        how: "(a) Self-host Playwright/Chromium in a small container or worker. Note this cannot sit cleanly in a Vercel request handler: the 50 MB function limit vs a ~280 MB Chromium binary means @sparticuz/chromium-min plus an externally hosted tarball, and it runs 4-8x slower than local with 1 GB memory on Hobby / ~3 GB on…",
        cost: "Firecrawl: 1 credit per page — free 1,000 credits/mo, Hobby $19 (~5,000), Standard $99 (~100,000,…",
        tradeoff: "Largely redundant if option 1 is already in the stack — its value is independence from DataForSEO and full control of the render. The stealth/anti-bot proxy features these vendors sell are irrelevant and inappropriate here: Answr is crawling a consenting customer's own site and should use an…",
      },
      {
        name: "Google Search Console API (per-customer OAuth, not an Answr-held key)",
        what: "URL Inspection API: Google's own verdict on a URL — indexed or not, chosen canonical, last crawl, robots.txt state, mobile usability, and detected rich-result types. Search Analytics API: impressions/clicks/position per URL and query.",
        how: "OAuth connector added to onboarding; each customer grants Answr read access to their verified property. POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect and POST .../sites/{siteUrl}/searchAnalytics/query. This is the only source that gives a page-health verdict from an actual engine rather…",
        cost: "API is free. Quotas: URL Inspection 2,000 queries/day per property and 600/minute; Search Analytics 50,000…",
        tradeoff: "Buyer-must-provide, per tenant: not a key Answr can ship with, so coverage is whatever share of customers connect. Google's OAuth verification for the webmasters scope is a review process with a lead time, not an instant toggle. It reports Google's view — the best available proxy for Gemini and AI…",
      },
      {
        name: "Structured-data / JSON-LD validation",
        what: "Extraction and validation of JSON-LD and microdata, plus rich-result type eligibility.",
        how: "Cheapest path: DataForSEO on_page/microdata with validate_micromarkup:true — already paid for inside option 1's credits. Zero-vendor path: extract JSON-LD with cheerio and validate shape in-house against schema.org types and Google's documented required/recommended fields. Third-party: SchemaCheck REST API (accepts a…",
        cost: "DataForSEO: included in the on-page call. SchemaCheck: free tier, cached responses free. Apify actors ~$0.50…",
        tradeoff: "There is no authoritative Google endpoint: Google deprecated the Structured Data Testing Tool API and never shipped a Rich Results Test API, so every option here reimplements Google's published rules and will drift when Google changes them. Be honest in the UI on two counts — valid schema is…",
      },
    ],
    recommended: "Build it on the keys Answr already has — no new vendor contract is required to ship a credible v1. Concretely: DataForSEO On-Page instant_pages called twice per URL (enable_javascript false vs true) is the whole page-health engine, at roughly $0.0017/page, using a key that is already live and already wired in lib/providers/dataforseo.ts; the diff between those two responses is the one metric in this category that is both true and differentiated (\"this much of your page does not exist for GPTBot/ClaudeBot\"), and it is backed by the Vercel/MERJ analysis of 500M+ crawler fetches showing no major AI crawler…",
    notes: "REPO STATE (good news for an acquirer): the screens already exist and are honestly stubbed, not faked. /Users/arman_usman/Desktop/PROJECTS/answr/app/(dash)/app/page-health/ and /content-score/ each ship a page.tsx, a NotAvailable.tsx and a report.ts whose exports state in plain language why no figure is shown — page-health/report.ts says outright \"nothing in the pipeline crawls your pages\". So this is wiring a data source into finished UI and finished export plumbing (lib/export/report.ts), not building a feature from zero. The integration seam is already conventionalised: add a provider to…",
  },
  "workflows": {
    key: "workflows",
    title: "Workflows",
    whatItMeasures: "Automation rules: when something changes, do something about it.",
    feasibility: "build-only-no-data-needed",
    headline: "No external data needed — this is an engine. Your existing Upstash Redis plus Vercel Cron covers it with zero new vendors.",
    effort: "M",
    sources: [
      {
        name: "Existing stack only — Upstash Redis + Vercel Cron (ZERO new vendors)",
        what: "Rule storage, rule evaluation and delivery with no account Answr doesn't already have. Rules and run history become two more collections in the generic document store at /Users/arman_usman/Desktop/PROJECTS/answr/lib/db/index.ts, which already exposes list/get/put/remove and auto-selects memory → local filestore →…",
        how: "1) Persist `workflows` and `workflow_runs` collections via the existing `Db` interface — no schema migration, no new client. 2) After runSampler() in lib/sampler/run.ts, diff the new run against the prior one and emit typed events (new_citing_domain, visibility_delta, position_change, competitor_overtake,…",
        cost: "$0 incremental. Vercel Cron is included on every plan (100 jobs/project) and billed only as function…",
        tradeoff: "Trigger latency is bounded by the nightly sample, not by the engine — \"when a new domain cites us\" fires the next morning, not within minutes. Honest framing for a buyer: that's a data-freshness limit inherent to LLM sampling, not an engineering gap. Also, Vercel Hobby crons run once per day…",
      },
      {
        name: "Slack — customer-pasted Incoming Webhook URL (delivery)",
        what: "Post a formatted message (Block Kit) into a customer's Slack channel. The customer creates the webhook in their own workspace and pastes the https://hooks.slack.com/services/... URL into Answr settings.",
        how: "Store the URL on the workspace record, POST JSON with plain fetch. No SDK, no OAuth, no Slack app to build or maintain — same dependency-free fetch pattern already used in /Users/arman_usman/Desktop/PROJECTS/answr/lib/telemetry/kv.ts. This is the day-one path and costs nothing.",
        cost: "Free. No fee from Slack for incoming webhooks.",
        tradeoff: "Setup friction sits with the customer (they must create a Slack app in their workspace). The polished alternative — one-click install via OAuth with the `incoming-webhook` scope — is also free to build, but note two 2026 realities: Slack discontinues classic apps in November 2026 (must be a modern…",
      },
      {
        name: "Generic outbound webhook (delivery)",
        what: "POST the event payload to any URL the customer supplies, HMAC-signed so they can verify it. Covers Zapier/Make/n8n/Teams/Discord/internal tooling in one code path.",
        how: "Sign the body with a per-workspace secret (`X-Answr-Signature: sha256=...`), send with fetch, timeout ~5s, log the status into `workflow_runs`. Mirrors the Bearer-secret verification Answr already implements on its own cron endpoint.",
        cost: "$0.",
        tradeoff: "Real SSRF surface — an arbitrary customer-supplied URL must be validated against private/link-local ranges and cloud metadata endpoints (169.254.169.254), redirects capped, DNS re-resolved after validation. Flag this to a buyer as a security requirement, not a nice-to-have. Note also that…",
      },
      {
        name: "Upstash QStash (durable scheduling, retries, DLQ)",
        what: "Managed message queue + cron scheduler over plain HTTP. Gives per-workspace schedules, automatic retries with backoff, a dead-letter queue, delays up to a year, and request signing — things a single Vercel cron cannot provide.",
        how: "Zero new dependencies: it's a REST API on the same Upstash account and the same Bearer-token shape Answr already speaks. `POST https://qstash.upstash.io/v2/schedules/<encoded-url>` with `Authorization: Bearer $QSTASH_TOKEN` and `Upstash-Cron: 0 7 * * *` to register a schedule; `POST…",
        cost: "Free tier: 1,000 messages/day, 10 active schedules, max delay 7 days, DLQ 3 days, parallelism 10.…",
        tradeoff: "Free tier caps active schedules at 10 — that's 10 customer workspaces on per-workspace crons before a paid tier is forced. The fix is to keep one global cron and fan out per-rule publishes instead of per-workspace schedules, which keeps you on pay-as-you-go economics. Upstash Workflow (the…",
      },
      {
        name: "Vercel Workflows / Workflow Development Kit (`\"use workflow\"`)",
        what: "First-party durable execution on Vercel — durable steps, deterministic replay across deploys and crashes, `sleep` of unlimited duration, human-in-the-loop hooks, and traces in the Vercel dashboard. GA since April 2026 (100M+ runs, 1,500+ customers per Vercel's own numbers).",
        how: "Mark an async function `\"use workflow\"`; each awaited step is checkpointed. A rule becomes: await event → evaluate → step(deliver to Slack) → step(record run). Runs on the deployment Answr already has, orchestrated by Vercel Queues underneath.",
        cost: "Billed on three axes: Workflow Events ($0.02 per 1K; Hobby includes 50,000/mo), Workflow Data Written…",
        tradeoff: "Genuinely the most architecturally native option and the least code — but it is the most vendor-locked and the pricing is event-metered, which is a poor fit when the unit of work is \"send one Slack message\". A plain step function emits 3 events (step_created/started/completed), so cost scales…",
      },
      {
        name: "Inngest",
        what: "Hosted event-driven durable functions — fan-out, concurrency control, throttling, step retries, replay UI. The most mature \"workflow engine as a service\" for Next.js.",
        how: "Install the SDK, expose /api/inngest, send events from the sampler, define functions with steps. Works on Vercel serverless without changing the deploy model.",
        cost: "Free/Hobby: 50,000 executions/mo, 5 concurrent steps, 24-hour trace retention, 500K events ingested, 100K…",
        tradeoff: "$99/mo Pro is likely more than Answr's entire current infra bill — hard to justify to an acquirer for a feature with no customers on it yet. The Hobby tier pauses execution once the quota is exhausted, which is a silent-failure mode for an alerting product. Adds a vendor an acquirer must take…",
      },
    ],
    recommended: "Build it in-house on what Answr already has, and add exactly one vendor later. Phase 1 (no new accounts, no new dependencies, $0): store rules as `workflows` and `workflow_runs` collections in the existing generic `Db` at lib/db/index.ts — it already does memory → filestore → Upstash REST selection, so rule storage is free and durable the moment the KV env vars are set. Emit typed events at the end of runSampler() by diffing the new run against the prior one. Evaluate rules in-process. Deliver over plain fetch to (a) a customer-pasted Slack incoming-webhook URL and (b) an HMAC-signed generic webhook. All of it…",
    notes: "Honest framing for an acquirer. (1) This is the cheapest un-built capability on the board: no data licensing, no commercial contract, no new API key required for a working v1. Everything needed is already provisioned. (2) The routes are pre-built and honest — app/(dash)/app/workflows/page.tsx and its NotAvailable.tsx explicitly document that no rule store, trigger runner or delivery path exists, and app/(dash)/app/settings/alerts/page.tsx does the same. Nothing has to be un-faked first; the work is additive. (3) Trigger latency is the real constraint, and it is a data constraint, not an engine one: rules fire…",
  },
};

export function capabilitySource(key: string): CapabilitySource | null {
  return CAPABILITY_SOURCES[key] ?? null;
}
