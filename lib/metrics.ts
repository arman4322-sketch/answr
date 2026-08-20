/* The Answr metrics dictionary — single source of truth for what every number
   in the dashboard MEANS: its definition, where the real data comes from once the
   platform is wired to production pipelines, and exactly how it is calculated.

   Consumed by:
   - <KpiCard metricId=…> — the ⓘ provenance tooltip on every KPI
   - tools/gen-metrics-doc.mjs — generates METRICS.md from this file
   The demo workspace (Nike) ships fixture values; `source` and `calculation`
   describe the production data path each number is designed to be fed by. */

export type MetricDef = {
  /** Display name as it appears in the UI */
  label: string;
  /** Plain-language explanation, under 10 words, for a 15-year-old */
  plain: string;
  /** One-sentence definition of what the number means */
  definition: string;
  /** Where the real data comes from (production pipeline) */
  source: string;
  /** How the value is computed */
  calculation: string;
  /** How often the production pipeline refreshes it */
  cadence: string;
  /** Unit for formatting hints: pct | count | position | score | pt | currency */
  unit: "pct" | "count" | "position" | "score" | "pt";
};

export const METRICS = {
  visibility_score: {
    label: "Visibility score",
    plain: "How often AI mentions you when people ask",
    definition:
      "Share of sampled AI answers, across the workspace's tracked prompt set, in which the brand appears — weighted by platform and by how prominently it appears.",
    source:
      "Daily automated prompt runs: each tracked prompt is executed against every enabled platform via official APIs with web grounding (OpenAI Responses web_search, Anthropic web search, Gemini Google-Search grounding, Perplexity Sonar) and, for Google AI Overviews, a licensed SERP API; answers are stored with full text + citations.",
    calculation:
      "Σ over answers( brand_present × position_weight × platform_weight ) ÷ Σ( position_weight × platform_weight ). Position weight decays with mention rank (1st mention = 1.0, halving per rank); platform weight = platform's share of tracked-prompt volume. Paused platforms are excluded from both sums.",
    cadence: "Daily run (one per day on Scale); 30-day rolling window for the headline number.",
    unit: "pct",
  },
  share_of_voice: {
    label: "Share of voice",
    plain: "Your slice of brand mentions versus rivals",
    definition:
      "Of all brand mentions in sampled answers for the category's prompt set, the percentage that are this brand rather than a tracked competitor.",
    source:
      "The same daily answer corpus as the visibility score, plus the workspace's competitor list (Settings › Brand & competitors) with alias matching (brand names, product names, domains).",
    calculation:
      "brand_mentions ÷ (brand_mentions + Σ competitor_mentions) over the selected window. Mentions are deduplicated per answer (an answer naming the brand three times counts once). The competitor table's rows always sum to 100%.",
    cadence: "Recomputed after every daily run; 30-day window by default.",
    unit: "pct",
  },
  citations_count: {
    label: "Citations",
    plain: "How many times AI linked to your pages",
    definition:
      "Number of times AI answers cited a URL on a domain the workspace owns (or watches) during the window.",
    source:
      "Citation links parsed from stored answer payloads — Perplexity and AI Overviews expose source lists directly; ChatGPT/Claude/Gemini citations are captured when browsing or retrieval surfaces them.",
    calculation:
      "Count of (answer, cited_url) pairs where cited_url's registrable domain ∈ owned/watched domains. One answer citing two owned pages counts twice; the same page cited in two answers counts twice.",
    cadence: "Updated per daily run; headline is 30-day rolling.",
    unit: "count",
  },
  owned_citation_share: {
    label: "Owned-source share",
    plain: "How much AI quotes your site, not others",
    definition:
      "Of all citations behind answers to tracked prompts, the share pointing at domains the brand controls (site, product pages, blog) versus third-party sources.",
    source: "Same parsed-citation corpus, with domains classified owned / earned / competitor / neutral in Settings › Watched URLs.",
    calculation: "owned_citations ÷ total_citations over the window, per prompt topic and overall.",
    cadence: "Per daily run; 30-day window.",
    unit: "pct",
  },
  avg_answer_position: {
    label: "Avg. answer position",
    plain: "How early AI names you in answers",
    definition:
      "When the brand appears in an answer, the average rank of its first mention (1 = the answer leads with the brand).",
    source: "Mention-rank extraction over the stored answer corpus (ordered entity extraction on each answer).",
    calculation:
      "Mean of first-mention rank across all answers where the brand appears, weighted by platform weight. Lower is better; answers where the brand is absent are excluded (they affect visibility, not position).",
    cadence: "Per daily run; 30-day window.",
    unit: "position",
  },
  answer_rank_first: {
    label: "#1 mentions",
    plain: "Questions where AI names you first",
    definition: "Count of tracked prompts where the brand is currently the FIRST brand mentioned or recommended.",
    source: "Latest run's answers per prompt, first-mention extraction.",
    calculation: "Count of prompts whose most recent answer, on the prompt's primary platform, mentions the brand before any competitor.",
    cadence: "Per daily run (point-in-time, not windowed).",
    unit: "count",
  },
  topic_visibility: {
    label: "Topic visibility",
    plain: "Your visibility for one subject area",
    definition: "The visibility score restricted to one prompt topic (e.g. Running shoes).",
    source: "Same answer corpus, filtered to the topic's prompts (topics are assigned at prompt creation, editable in Prompts).",
    calculation: "Identical formula to the overall visibility score, over the topic's prompt subset only.",
    cadence: "Per daily run; 30-day window.",
    unit: "pct",
  },
  region_visibility: {
    label: "Regional visibility",
    plain: "Your visibility in one country or region",
    definition: "Visibility score computed per tracked region, using region-localized prompt runs.",
    source:
      "Prompt runs executed with region-pinned settings (Accept-Language + geo-routed egress per region, localized prompt translations where configured).",
    calculation:
      "Per-region visibility formula over that region's localized runs. The choropleth shades tracked regions on a 0–45% domain; untracked regions render neutral.",
    cadence: "Regional runs weekly by default (daily on Enterprise); 30-day window.",
    unit: "pct",
  },
  audience_visibility: {
    label: "Audience visibility",
    plain: "Your visibility when a specific buyer asks",
    definition:
      "Visibility when prompts are phrased the way a specific buyer persona asks them (e.g. 'for a marathon runner logging 40 miles a week').",
    source: "Persona-conditioned prompt variants generated from the base prompt set (beta) and run on the same platforms.",
    calculation: "Visibility formula over the persona-variant answer corpus, reported per audience segment.",
    cadence: "Weekly (beta); 30-day window.",
    unit: "pct",
  },
  sentiment_mix: {
    label: "Sentiment",
    plain: "Whether AI describes you kindly or harshly",
    definition: "How AI answers talk about the brand when it appears: share of mentions classified positive / neutral / negative.",
    source: "LLM classification of each brand-mention span in the stored answers, with human-audited calibration set (see Data quality).",
    calculation:
      "Each mention span classified with a rubric-tuned model; shares = class_count ÷ total_mentions. Headline sentiment score = positive% − negative%.",
    cadence: "Per daily run; 30-day window.",
    unit: "pct",
  },
  shopping_visibility: {
    label: "Shopping visibility",
    plain: "How often AI suggests your products to shoppers",
    definition: "Presence of the brand's products in purchase-intent answers (comparisons, 'best X for Y', price questions).",
    source: "The purchase-intent slice of the prompt set (auto-tagged by intent classifier) plus product-catalog matching where a feed is connected.",
    calculation: "Visibility formula over purchase-intent prompts only; product-level rollups match answers to catalog SKUs by name/alias.",
    cadence: "Per daily run (beta); 30-day window.",
    unit: "pct",
  },
  cited_source_count: {
    label: "Cited source",
    plain: "How often AI quoted this one website",
    definition: "For one external domain (e.g. runnersworld.com): how many sampled answers cited it in the window.",
    source: "Parsed-citation corpus grouped by registrable domain.",
    calculation: "Count of (answer, citation) pairs per domain; the source table ranks domains by this count.",
    cadence: "Per daily run; 30-day window.",
    unit: "count",
  },
  prompts_tracked: {
    label: "Tracked prompts",
    plain: "Questions we ask AI for you daily",
    definition: "Number of prompts in the workspace's active tracking set, against the plan's quota (1,000 on Scale).",
    source: "Workspace configuration — prompts added at onboarding, imported, or promoted from Conversation Explorer.",
    calculation: "Simple count of active (non-archived) prompts. Quota = plan limit; paused prompts still count until archived.",
    cadence: "Real-time on edit.",
    unit: "count",
  },
  conversation_mentions: {
    label: "Conversation mentions",
    plain: "Real chats where people mentioned your brand",
    definition: "Appearances of the brand inside real multi-turn AI conversations from the research panel.",
    source:
      "Answr's opt-in consumer research panel (2.1M conversations/mo): anonymized, consented conversation logs licensed from panel providers, entity-matched against the brand's aliases.",
    calculation:
      "Count of conversations with ≥1 brand mention; drill-downs slice by turn position (first-ask vs follow-up), intent, and platform. Panel data is weighted to platform market share before rates are reported.",
    cadence: "Weekly panel drops.",
    unit: "count",
  },
  demand_volume: {
    label: "Demand",
    plain: "How many people ask AI this monthly",
    definition: "Estimated monthly volume of AI-assistant questions matching a keyword/topic — the AI-era analog of search volume.",
    source:
      "Modeled from the conversation panel (observed question frequency) blended with licensed search-volume data as a prior for long-tail stability.",
    calculation:
      "panel_frequency × platform_usage_scalar, shrunk toward the search-volume prior for keywords with <30 panel observations (credible-interval shown in the detail view). Deltas compare 30-day windows.",
    cadence: "Weekly model refresh.",
    unit: "count",
  },
  action_score: {
    label: "Action score",
    plain: "Priority rank: bigger win, less work",
    definition: "0–100 priority score ranking each recommended action by expected visibility return per unit of effort.",
    source: "Computed by the recommendation engine from the workspace's own gap analysis (which prompts/topics the brand loses and why).",
    calculation:
      "score = 100 × normalized( estimated_impact_pt × confidence ÷ effort_cost ). Impact is estimated from measured lift of similar shipped actions across cohort workspaces (see Impact model); effort S/M/L maps to 1/2/4.",
    cadence: "Re-ranked after every daily run.",
    unit: "score",
  },
  impact_estimate: {
    label: "Est. impact",
    plain: "Visibility points this fix should add",
    definition: "Expected visibility-score gain (in points) if this action ships.",
    source: "Cohort priors: measured before/after lift of the same action type on comparable workspaces, adjusted to this workspace's gap size.",
    calculation:
      "prior_lift × gap_ratio × confidence. Reported as +X.Xpt; the Impact model card sums open actions' estimates with diminishing returns applied.",
    cadence: "Recomputed with each re-rank.",
    unit: "pt",
  },
  projected_visibility: {
    label: "Projected visibility",
    plain: "Where you land if you ship everything",
    definition: "Where the visibility score is modeled to land if all open actions ship, based on measured lift from already-shipped actions.",
    source: "Workspace's shipped-action history (38 shipped) + open queue estimates.",
    calculation:
      "current_visibility + Σ open_action_impacts × diminishing_returns(k). The chart plots the projection curve; measured lift to date validates the model (shipped-action before/after deltas).",
    cadence: "Daily.",
    unit: "pct",
  },
  measured_lift: {
    label: "Measured lift",
    plain: "Actual gain after a fix went live",
    definition: "Actual visibility-score change attributed to shipped actions, measured before vs after shipping.",
    source: "Per-action measurement windows: 14-day pre-ship baseline vs 14-day post-index reading on the action's target prompts.",
    calculation:
      "Difference-in-differences: (target_prompt_visibility_change) − (control_prompt_visibility_change) to strip market-wide drift; summed across shipped actions for the headline (+9.4pt median across customers).",
    cadence: "Per action, closing 14 days after ship.",
    unit: "pt",
  },
  crawler_events: {
    label: "Crawler events",
    plain: "Times AI bots visited your website",
    definition: "Requests to the brand's site from verified AI crawlers and assistants (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…).",
    source:
      "Server-side ingestion: CDN/edge log drain (Cloudflare, Fastly, Vercel) or the 1-line tracking snippet; bots verified by UA string + published IP-range reverse-DNS to filter spoofing.",
    calculation:
      "Count of verified-bot requests in the window, segmented by bot, path, and status. Blocked = requests answered 403/robots-disallowed (e.g. 214 blocked /help URLs).",
    cadence: "Streaming; dashboards aggregate hourly.",
    unit: "count",
  },
  ai_referrals: {
    label: "AI referrals",
    plain: "People who clicked to you from AI",
    definition: "Human visits that arrived from an AI assistant — a person clicked through to the site from an answer.",
    source:
      "Referrer headers + link-decoration params captured by the tracking snippet (chatgpt.com, perplexity.ai, gemini.google.com referrers; utm_source=chatgpt.com-style tags).",
    calculation:
      "Sessions whose first touch matches a known AI referrer signature. Conversion column joins the workspace's goal events (signup, purchase) attributed last-touch.",
    cadence: "Streaming; hourly rollups.",
    unit: "count",
  },
  page_health: {
    label: "Page health",
    plain: "Whether AI can read this page properly",
    definition: "Per-URL readiness score for AI consumption: can crawlers fetch it, is it structured, is it being cited.",
    source: "Answr's own crawler (respecting robots.txt) + the crawler-events log + citation corpus for the URL.",
    calculation:
      "Weighted checklist: fetchability (robots/llms.txt/status), structure (schema.org, headings, freshness date), and observed outcomes (crawl frequency, citations). Scored 0–100 with per-check breakdown.",
    cadence: "Weekly re-crawl, or on-demand.",
    unit: "score",
  },
  content_score: {
    label: "Content score",
    plain: "How likely AI is to quote this draft",
    definition: "Pre-publish grade of a draft against the patterns AI answers actually cite in this category.",
    source: "The category's cited-page corpus (what already wins citations for these prompts) as the training reference.",
    calculation:
      "Similarity of the draft's structure to winning patterns: direct-answer density, comparison tables, FAQ schema, citable claims with sources, freshness signals. Each sub-check contributes weighted points to 0–100.",
    cadence: "On-demand at edit time.",
    unit: "score",
  },
  platform_appearances: {
    label: "Appearances",
    plain: "Questions where you show up, per AI",
    definition:
      "Per platform: the count of tracked prompts (of the workspace's 412) whose most recent answer on that platform mentions the brand.",
    source: "The same daily prompt-run corpus as the visibility score, split by platform.",
    calculation:
      "Per platform, count of prompts whose latest answer contains ≥1 brand mention. A prompt can appear on several platforms at once, so per-platform counts overlap and need not sum to the prompt total. Unlike the visibility score, appearances are unweighted counts — no position or platform weighting.",
    cadence: "Per daily run (point-in-time per day; the trend plots the daily counts).",
    unit: "count",
  },
  unique_cited_domains: {
    label: "Unique domains",
    plain: "Different websites AI quoted for these questions",
    definition: "Number of distinct registrable domains cited across sampled answers in the window.",
    source: "Parsed-citation corpus grouped by registrable domain (same pipeline as the citations count).",
    calculation: "COUNT(DISTINCT registrable_domain) over all citations in the window; owned and third-party domains both count.",
    cadence: "Per daily run; 30-day window.",
    unit: "count",
  },
  answers_with_citation_rate: {
    label: "Answers with ≥1 citation",
    plain: "Share of answers that linked any source",
    definition: "Share of sampled answers whose payload contained at least one parseable citation — a coverage indicator for citation-based metrics.",
    source: "Run logs: per-answer parse status from the citation extractor.",
    calculation: "answers_with_parsed_citations ÷ total_sampled_answers over the window. Platforms that rarely expose sources (some chat surfaces) pull this down; the Data-quality screen breaks it out per platform.",
    cadence: "Per daily run; 30-day window.",
    unit: "pct",
  },
  actions_queue: {
    label: "Action queue",
    plain: "Fixes waiting, started, and already shipped",
    definition: "Counts of recommended actions by status: open, in progress, and shipped (trailing 90 days).",
    source: "The workspace's action records — statuses change as teammates assign, start, and ship actions.",
    calculation: "Simple status counts; 'shipped 90d' counts actions whose ship date falls in the trailing 90 days. Measured lift attaches to each shipped action 14 days after ship.",
    cadence: "Real-time on status change.",
    unit: "count",
  },
  unique_agents: {
    label: "Unique agents",
    plain: "Different AI bots that visited your site",
    definition: "Distinct verified AI crawlers and assistant fetchers seen on the site in the window.",
    source: "Crawler-events pipeline (CDN/edge log drain), bots verified by UA + published IP-range reverse-DNS.",
    calculation: "COUNT(DISTINCT verified_bot_identity) over the window; unverified/spoofed UAs are excluded and reported separately in Live logs.",
    cadence: "Streaming; hourly rollups.",
    unit: "count",
  },
  pages_crawled: {
    label: "Pages crawled",
    plain: "How many of your pages bots read",
    definition: "Distinct owned URLs fetched by verified AI crawlers in the window.",
    source: "Crawler-events pipeline, joined against the site's canonical URL inventory.",
    calculation: "COUNT(DISTINCT normalized_path) among verified-bot requests with 2xx responses; blocked (403/robots) fetches are counted separately as blocked requests.",
    cadence: "Streaming; hourly rollups.",
    unit: "count",
  },
  page_speed: {
    label: "Render timing",
    plain: "How fast your page loads for bots",
    definition: "Fetch-and-render timings (FCP/LCP/TTI) for a page, as experienced by Answr's crawler probes — slow pages get truncated or skipped by AI crawlers.",
    source: "Answr's own headless crawler probes (respecting robots.txt), timing each render pass during the weekly re-crawl.",
    calculation: "Median of the probe's paint/interactive timings across the window's crawls; thresholds follow web-vitals bands (good/needs-work/poor).",
    cadence: "Weekly re-crawl, or on-demand.",
    unit: "score",
  },
  data_quality_sample: {
    label: "Answers sampled",
    plain: "How many AI answers we checked",
    definition: "Volume of AI answers collected and parsed for this workspace's scores in the window (quality-of-evidence indicator).",
    source: "Run logs: every stored answer with platform, prompt, timestamp, and parse status.",
    calculation: "Count of successfully parsed answers; the Data-quality screen breaks out parse failures and platform coverage so score confidence is inspectable.",
    cadence: "Per run.",
    unit: "count",
  },
} as const satisfies Record<string, MetricDef>;

export type MetricId = keyof typeof METRICS;
