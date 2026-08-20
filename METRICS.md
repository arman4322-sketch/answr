# Answr — Metrics dictionary

What every number in the dashboard means, where its real data comes from once
production pipelines are connected, and how it is calculated. Generated from
`lib/metrics.ts` (canonical) by `tools/gen-metrics-doc.mjs` — the same entries
power the ⓘ popovers on the dashboard's KPI cards.

The demo workspace (Solara) ships fixture values; every fixture number is chosen
to be internally consistent with these definitions.

## Visibility score

_Share of sampled AI answers, across the workspace's tracked prompt set, in which the brand appears — weighted by platform and by how prominently it appears._

- **Source:** Daily automated prompt runs: each tracked prompt is executed against every enabled platform (ChatGPT, Perplexity, Google AI Overviews, Claude, Gemini) via official APIs where available and consented headless sampling elsewhere; answers are stored with full text + citations.
- **Calculation:** Σ over answers( brand_present × position_weight × platform_weight ) ÷ Σ( position_weight × platform_weight ). Position weight decays with mention rank (1st mention = 1.0, halving per rank); platform weight = platform's share of tracked-prompt volume. Paused platforms are excluded from both sums.
- **Cadence:** Daily run (one per day on Scale); 30-day rolling window for the headline number.
- **Dictionary id:** `visibility_score` · unit: pct

## Share of voice

_Of all brand mentions in sampled answers for the category's prompt set, the percentage that are this brand rather than a tracked competitor._

- **Source:** The same daily answer corpus as the visibility score, plus the workspace's competitor list (Settings › Brand & competitors) with alias matching (brand names, product names, domains).
- **Calculation:** brand_mentions ÷ (brand_mentions + Σ competitor_mentions) over the selected window. Mentions are deduplicated per answer (an answer naming the brand three times counts once). The competitor table's rows always sum to 100%.
- **Cadence:** Recomputed after every daily run; 30-day window by default.
- **Dictionary id:** `share_of_voice` · unit: pct

## Citations

_Number of times AI answers cited a URL on a domain the workspace owns (or watches) during the window._

- **Source:** Citation links parsed from stored answer payloads — Perplexity and AI Overviews expose source lists directly; ChatGPT/Claude/Gemini citations are captured when browsing or retrieval surfaces them.
- **Calculation:** Count of (answer, cited_url) pairs where cited_url's registrable domain ∈ owned/watched domains. One answer citing two owned pages counts twice; the same page cited in two answers counts twice.
- **Cadence:** Updated per daily run; headline is 30-day rolling.
- **Dictionary id:** `citations_count` · unit: count

## Owned-source share

_Of all citations behind answers to tracked prompts, the share pointing at domains the brand controls (site, docs, blog) versus third-party sources._

- **Source:** Same parsed-citation corpus, with domains classified owned / earned / competitor / neutral in Settings › Watched URLs.
- **Calculation:** owned_citations ÷ total_citations over the window, per prompt topic and overall.
- **Cadence:** Per daily run; 30-day window.
- **Dictionary id:** `owned_citation_share` · unit: pct

## Avg. answer position

_When the brand appears in an answer, the average rank of its first mention (1 = the answer leads with the brand)._

- **Source:** Mention-rank extraction over the stored answer corpus (ordered entity extraction on each answer).
- **Calculation:** Mean of first-mention rank across all answers where the brand appears, weighted by platform weight. Lower is better; answers where the brand is absent are excluded (they affect visibility, not position).
- **Cadence:** Per daily run; 30-day window.
- **Dictionary id:** `avg_answer_position` · unit: position

## #1 mentions

_Count of tracked prompts where the brand is currently the FIRST brand mentioned or recommended._

- **Source:** Latest run's answers per prompt, first-mention extraction.
- **Calculation:** Count of prompts whose most recent answer, on the prompt's primary platform, mentions the brand before any competitor.
- **Cadence:** Per daily run (point-in-time, not windowed).
- **Dictionary id:** `answer_rank_first` · unit: count

## Topic visibility

_The visibility score restricted to one prompt topic (e.g. Revenue forecasting)._

- **Source:** Same answer corpus, filtered to the topic's prompts (topics are assigned at prompt creation, editable in Prompts).
- **Calculation:** Identical formula to the overall visibility score, over the topic's prompt subset only.
- **Cadence:** Per daily run; 30-day window.
- **Dictionary id:** `topic_visibility` · unit: pct

## Regional visibility

_Visibility score computed per tracked region, using region-localized prompt runs._

- **Source:** Prompt runs executed with region-pinned settings (Accept-Language + geo-routed egress per region, localized prompt translations where configured).
- **Calculation:** Per-region visibility formula over that region's localized runs. The choropleth shades tracked regions on a 0–45% domain; untracked regions render neutral.
- **Cadence:** Regional runs weekly by default (daily on Enterprise); 30-day window.
- **Dictionary id:** `region_visibility` · unit: pct

## Audience visibility

_Visibility when prompts are phrased the way a specific buyer persona asks them (e.g. 'for a RevOps lead at a 200-person SaaS')._

- **Source:** Persona-conditioned prompt variants generated from the base prompt set (beta) and run on the same platforms.
- **Calculation:** Visibility formula over the persona-variant answer corpus, reported per audience segment.
- **Cadence:** Weekly (beta); 30-day window.
- **Dictionary id:** `audience_visibility` · unit: pct

## Sentiment

_How AI answers talk about the brand when it appears: share of mentions classified positive / neutral / negative._

- **Source:** LLM classification of each brand-mention span in the stored answers, with human-audited calibration set (see Data quality).
- **Calculation:** Each mention span classified with a rubric-tuned model; shares = class_count ÷ total_mentions. Headline sentiment score = positive% − negative%.
- **Cadence:** Per daily run; 30-day window.
- **Dictionary id:** `sentiment_mix` · unit: pct

## Shopping visibility

_Presence of the brand's products in purchase-intent answers (comparisons, 'best X for Y', price questions)._

- **Source:** The purchase-intent slice of the prompt set (auto-tagged by intent classifier) plus product-catalog matching where a feed is connected.
- **Calculation:** Visibility formula over purchase-intent prompts only; product-level rollups match answers to catalog SKUs by name/alias.
- **Cadence:** Per daily run (beta); 30-day window.
- **Dictionary id:** `shopping_visibility` · unit: pct

## Cited source

_For one external domain (e.g. g2.com): how many sampled answers cited it in the window._

- **Source:** Parsed-citation corpus grouped by registrable domain.
- **Calculation:** Count of (answer, citation) pairs per domain; the source table ranks domains by this count.
- **Cadence:** Per daily run; 30-day window.
- **Dictionary id:** `cited_source_count` · unit: count

## Tracked prompts

_Number of prompts in the workspace's active tracking set, against the plan's quota (1,000 on Scale)._

- **Source:** Workspace configuration — prompts added at onboarding, imported, or promoted from Conversation Explorer.
- **Calculation:** Simple count of active (non-archived) prompts. Quota = plan limit; paused prompts still count until archived.
- **Cadence:** Real-time on edit.
- **Dictionary id:** `prompts_tracked` · unit: count

## Conversation mentions

_Appearances of the brand inside real multi-turn AI conversations from the research panel._

- **Source:** Answr's opt-in consumer research panel (2.1M conversations/mo): anonymized, consented conversation logs licensed from panel providers, entity-matched against the brand's aliases.
- **Calculation:** Count of conversations with ≥1 brand mention; drill-downs slice by turn position (first-ask vs follow-up), intent, and platform. Panel data is weighted to platform market share before rates are reported.
- **Cadence:** Weekly panel drops.
- **Dictionary id:** `conversation_mentions` · unit: count

## Demand

_Estimated monthly volume of AI-assistant questions matching a keyword/topic — the AI-era analog of search volume._

- **Source:** Modeled from the conversation panel (observed question frequency) blended with licensed search-volume data as a prior for long-tail stability.
- **Calculation:** panel_frequency × platform_usage_scalar, shrunk toward the search-volume prior for keywords with <30 panel observations (credible-interval shown in the detail view). Deltas compare 30-day windows.
- **Cadence:** Weekly model refresh.
- **Dictionary id:** `demand_volume` · unit: count

## Action score

_0–100 priority score ranking each recommended action by expected visibility return per unit of effort._

- **Source:** Computed by the recommendation engine from the workspace's own gap analysis (which prompts/topics the brand loses and why).
- **Calculation:** score = 100 × normalized( estimated_impact_pt × confidence ÷ effort_cost ). Impact is estimated from measured lift of similar shipped actions across cohort workspaces (see Impact model); effort S/M/L maps to 1/2/4.
- **Cadence:** Re-ranked after every daily run.
- **Dictionary id:** `action_score` · unit: score

## Est. impact

_Expected visibility-score gain (in points) if this action ships._

- **Source:** Cohort priors: measured before/after lift of the same action type on comparable workspaces, adjusted to this workspace's gap size.
- **Calculation:** prior_lift × gap_ratio × confidence. Reported as +X.Xpt; the Impact model card sums open actions' estimates with diminishing returns applied.
- **Cadence:** Recomputed with each re-rank.
- **Dictionary id:** `impact_estimate` · unit: pt

## Projected visibility

_Where the visibility score is modeled to land if all open actions ship, based on measured lift from already-shipped actions._

- **Source:** Workspace's shipped-action history (38 shipped) + open queue estimates.
- **Calculation:** current_visibility + Σ open_action_impacts × diminishing_returns(k). The chart plots the projection curve; measured lift to date validates the model (shipped-action before/after deltas).
- **Cadence:** Daily.
- **Dictionary id:** `projected_visibility` · unit: pct

## Measured lift

_Actual visibility-score change attributed to shipped actions, measured before vs after shipping._

- **Source:** Per-action measurement windows: 14-day pre-ship baseline vs 14-day post-index reading on the action's target prompts.
- **Calculation:** Difference-in-differences: (target_prompt_visibility_change) − (control_prompt_visibility_change) to strip market-wide drift; summed across shipped actions for the headline (+9.4pt median across customers).
- **Cadence:** Per action, closing 14 days after ship.
- **Dictionary id:** `measured_lift` · unit: pt

## Crawler events

_Requests to the brand's site from verified AI crawlers and assistants (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…)._

- **Source:** Server-side ingestion: CDN/edge log drain (Cloudflare, Fastly, Vercel) or the 1-line tracking snippet; bots verified by UA string + published IP-range reverse-DNS to filter spoofing.
- **Calculation:** Count of verified-bot requests in the window, segmented by bot, path, and status. Blocked = requests answered 403/robots-disallowed (e.g. 214 blocked /docs URLs).
- **Cadence:** Streaming; dashboards aggregate hourly.
- **Dictionary id:** `crawler_events` · unit: count

## AI referrals

_Human visits that arrived from an AI assistant — a person clicked through to the site from an answer._

- **Source:** Referrer headers + link-decoration params captured by the tracking snippet (chatgpt.com, perplexity.ai, gemini.google.com referrers; utm_source=chatgpt.com-style tags).
- **Calculation:** Sessions whose first touch matches a known AI referrer signature. Conversion column joins the workspace's goal events (demo form, signup) attributed last-touch.
- **Cadence:** Streaming; hourly rollups.
- **Dictionary id:** `ai_referrals` · unit: count

## Page health

_Per-URL readiness score for AI consumption: can crawlers fetch it, is it structured, is it being cited._

- **Source:** Answr's own crawler (respecting robots.txt) + the crawler-events log + citation corpus for the URL.
- **Calculation:** Weighted checklist: fetchability (robots/llms.txt/status), structure (schema.org, headings, freshness date), and observed outcomes (crawl frequency, citations). Scored 0–100 with per-check breakdown.
- **Cadence:** Weekly re-crawl, or on-demand.
- **Dictionary id:** `page_health` · unit: score

## Content score

_Pre-publish grade of a draft against the patterns AI answers actually cite in this category._

- **Source:** The category's cited-page corpus (what already wins citations for these prompts) as the training reference.
- **Calculation:** Similarity of the draft's structure to winning patterns: direct-answer density, comparison tables, FAQ schema, citable claims with sources, freshness signals. Each sub-check contributes weighted points to 0–100.
- **Cadence:** On-demand at edit time.
- **Dictionary id:** `content_score` · unit: score

## Appearances

_Per platform: the count of tracked prompts (of the workspace's 412) whose most recent answer on that platform mentions the brand._

- **Source:** The same daily prompt-run corpus as the visibility score, split by platform.
- **Calculation:** Per platform, count of prompts whose latest answer contains ≥1 brand mention. A prompt can appear on several platforms at once, so per-platform counts overlap and need not sum to the prompt total. Unlike the visibility score, appearances are unweighted counts — no position or platform weighting.
- **Cadence:** Per daily run (point-in-time per day; the trend plots the daily counts).
- **Dictionary id:** `platform_appearances` · unit: count

## Unique domains

_Number of distinct registrable domains cited across sampled answers in the window._

- **Source:** Parsed-citation corpus grouped by registrable domain (same pipeline as the citations count).
- **Calculation:** COUNT(DISTINCT registrable_domain) over all citations in the window; owned and third-party domains both count.
- **Cadence:** Per daily run; 30-day window.
- **Dictionary id:** `unique_cited_domains` · unit: count

## Answers with ≥1 citation

_Share of sampled answers whose payload contained at least one parseable citation — a coverage indicator for citation-based metrics._

- **Source:** Run logs: per-answer parse status from the citation extractor.
- **Calculation:** answers_with_parsed_citations ÷ total_sampled_answers over the window. Platforms that rarely expose sources (some chat surfaces) pull this down; the Data-quality screen breaks it out per platform.
- **Cadence:** Per daily run; 30-day window.
- **Dictionary id:** `answers_with_citation_rate` · unit: pct

## Action queue

_Counts of recommended actions by status: open, in progress, and shipped (trailing 90 days)._

- **Source:** The workspace's action records — statuses change as teammates assign, start, and ship actions.
- **Calculation:** Simple status counts; 'shipped 90d' counts actions whose ship date falls in the trailing 90 days. Measured lift attaches to each shipped action 14 days after ship.
- **Cadence:** Real-time on status change.
- **Dictionary id:** `actions_queue` · unit: count

## Unique agents

_Distinct verified AI crawlers and assistant fetchers seen on the site in the window._

- **Source:** Crawler-events pipeline (CDN/edge log drain), bots verified by UA + published IP-range reverse-DNS.
- **Calculation:** COUNT(DISTINCT verified_bot_identity) over the window; unverified/spoofed UAs are excluded and reported separately in Live logs.
- **Cadence:** Streaming; hourly rollups.
- **Dictionary id:** `unique_agents` · unit: count

## Pages crawled

_Distinct owned URLs fetched by verified AI crawlers in the window._

- **Source:** Crawler-events pipeline, joined against the site's canonical URL inventory.
- **Calculation:** COUNT(DISTINCT normalized_path) among verified-bot requests with 2xx responses; blocked (403/robots) fetches are counted separately as blocked requests.
- **Cadence:** Streaming; hourly rollups.
- **Dictionary id:** `pages_crawled` · unit: count

## Render timing

_Fetch-and-render timings (FCP/LCP/TTI) for a page, as experienced by Answr's crawler probes — slow pages get truncated or skipped by AI crawlers._

- **Source:** Answr's own headless crawler probes (respecting robots.txt), timing each render pass during the weekly re-crawl.
- **Calculation:** Median of the probe's paint/interactive timings across the window's crawls; thresholds follow web-vitals bands (good/needs-work/poor).
- **Cadence:** Weekly re-crawl, or on-demand.
- **Dictionary id:** `page_speed` · unit: score

## Answers sampled

_Volume of AI answers collected and parsed for this workspace's scores in the window (quality-of-evidence indicator)._

- **Source:** Run logs: every stored answer with platform, prompt, timestamp, and parse status.
- **Calculation:** Count of successfully parsed answers; the Data-quality screen breaks out parse failures and platform coverage so score confidence is inspectable.
- **Cadence:** Per run.
- **Dictionary id:** `data_quality_sample` · unit: count

