# Answr — Platform Build Description

_A complete inventory of what has been built: every feature, capability, and its technical depth._  
_Prepared for acquisition diligence. Last updated: 21 Aug 2026._

---

## At a glance

| | |
|---|---|
| **Product** | Answr — an Answer Engine Optimization (AEO/GEO) analytics platform |
| **Live at** | useanswr.com (deployed on Vercel, GitHub auto-deploy) |
| **Stack** | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 |
| **Pages / routes** | 73 page routes — 31 marketing, 36 dashboard, 6 auth/onboarding |
| **API routes** | 16 server routes (`app/api/**`) |
| **Library modules** | 38 (`lib/**`) — data layer, auth, scoring, sampler, providers, telemetry, export, filters |
| **Components** | 28 shared React components |
| **Codebase** | ~26,600 lines of application code; `tsc` clean, `next build` clean (78 static pages) |
| **Runtime deps** | 8 (next, react, react-dom, d3-geo, topojson-client, world-atlas, simple-icons) — deliberately lean, no bloat |
| **Features enumerated below** | 171 distinct features across 4 surfaces |

### How to read the 'status' of each feature
Answr is honest about what is production-real versus a working demonstration. Three statuses recur:

- **Real** — genuinely functional in production (e.g., CSV export, the telemetry capture pipeline, auth, scoring, lead capture, all client-side interactivity).
- **Working demo on fixtures** — the feature works end to end, but on a curated sample 'Nike' workspace; it shows real numbers once providers are connected. This is most of the analytics dashboard.
- **Scaffolding (activates with keys)** — the code is written and wired, and turns on when the buyer adds an API key or storage credential (e.g., the provider clients, the durable store, the nightly sampler).

Every item's technical note states which applies.

---

## Marketing site & public pages

_40 features._

**Home page (/)**  
Primary landing page: hero ('Know what AI says about your brand'), dual CTAs (Get a demo / Explore the product), inline fixture dashboard cards (visibility score, avg answer position, answer-visibility-over-time sparklines), a 4-step 'answer to action to proof' explainer, feature strip, the free-snapshot form, the customer logo wall, and closing trust chips (5 engines, first-party data / no scraping).  
_Technical:_ app/(marketing)/page.tsx (server component, ~44KB of inline-styled JSX converted from a design canvas frame) + app/(marketing)/page.css. Imports LogoWall and SnapshotForm. Real page; the embedded charts/sparklines are hard-coded SVG fixtures (decorative). Metadata title override set inline.

**Product — Answer Engine Insights (/product/answer-engine-insights)**  
Pillar product page for the core measurement surface: topic × platform visibility heatmap mock, daily prompt runs, position & sentiment scoring, competitive share-of-voice context, 'view sample report' CTA.  
_Technical:_ app/(marketing)/product/answer-engine-insights/page.tsx + page.css. Static server component, real marketing copy; dashboard visuals are fixtures. Linked as the canonical Product landing (Nav 'Product' href).

**Product — Citations (/product/citations)**  
Explains citation tracking: cited-domains list (30d) with export-count affordance, owned-vs-earned split over time, watched-URLs, and new-domain alerts.  
_Technical:_ app/(marketing)/product/citations/page.tsx + page.css. Static server component; sample citation rows and counts are fixtures.

**Product — Conversations & Demand (/product/conversations-demand)**  
Multi-turn conversation explorer mock (ChatGPT 3-turn thread), commercial-intent watchlists, monthly prompt-volume demand quantification, and a consented-panel explainer ('opt-in, compensated, no private-session scraping').  
_Technical:_ app/(marketing)/product/conversations-demand/page.tsx + page.css. Static server component; conversation transcript and volume numbers are fixtures.

**Product — Agent Analytics (/product/agent-analytics)**  
AI-crawler analytics story: real-edge-request logs by agent/path/status/day, robots.txt & llms.txt misconfiguration flagging with the exact rule, AI referral attribution, and a 'live in minutes' edge-snippet install path (Cloudflare/Vercel/Fastly/nginx).  
_Technical:_ app/(marketing)/product/agent-analytics/page.tsx + page.css. Static marketing page; the underlying crawler-capture mechanism it describes is actually implemented in proxy.ts + public/snippet.js + /api/ingest, but the numbers shown (48.2K requests, 14 agents) are fixtures.

**Product — Actions & Workflows (/product/actions-workflows)**  
Positions the product around shipping fixes, not dashboards: impact-scored action queue (24 open, sorted by impact), briefs-with-receipts, trigger→action→notify workflow automation, 'see a shipped action' CTA.  
_Technical:_ app/(marketing)/product/actions-workflows/page.tsx + page.css. Static server component; queue items are fixtures.

**Pricing page (/pricing)**  
Three-tier pricing (Growth / Scale-most-popular / Enterprise) with a working Annual/Monthly billing toggle that swaps real prices ($490↔$612, $1,290↔$1,612, SAVE 20% badge), a 13-row plan comparison table, an agency cross-sell banner, a 6-item FAQ, and a closing trial CTA.  
_Technical:_ app/(marketing)/pricing/page.tsx composes two client components: PricingTiers.tsx (useState toggle re-renders prices across cards + compare table) and PricingFaq.tsx (accordion, item 2 open by default). Fully real client interactivity; prices are static constants.

**Solutions — In-house teams (/solutions/in-house)**  
Solution page for brand-owning teams: plan sprints from losing prompts, catch misinformation early (stale-fact alerts), report AEO as a channel with scheduled Monday exec summaries, plus a 'fits your stack' brand strip.  
_Technical:_ app/(marketing)/solutions/in-house/page.tsx + page.css. Renders SolutionsTabs (active=in-house) and uses BrandLockup from LogoWall for the stack strip (simple-icons + wordmark fallback). Static content.

**Solutions — Agencies (/solutions/agencies)**  
Agency solution page: pooled prompt quota across client workspaces, white-label reports (scheduled PDFs + live dashboards under agency brand), 7-day prospect pitch mode, client seats/roles. Links to pricing #compare.  
_Technical:_ app/(marketing)/solutions/agencies/page.tsx + page.css. Renders SolutionsTabs (active=agencies). Static content; the 'Compare plans' anchor is satisfied by the pricing table.

**Industries — B2B SaaS (/industries/b2b-saas)**  
Vertical page: win the AI shortlist, benchmark stats (evals starting with AI, comparison-vs-feature-page citation ratio, brands named per answer), links to a case study.  
_Technical:_ app/(marketing)/industries/b2b-saas/page.tsx + page.css. Static server component built on a shared industry template; stats are fixtures cited to 'consented panels'/'50K sampled prompts'. Metadata title set inline.

**Industries — E-commerce & DTC (/industries/ecommerce)**  
Vertical page: be the product AI recommends — products-per-shopping-answer, review/affiliate citation share, stale-pricing staleness metric, product-page-to-top-3-answer path.  
_Technical:_ app/(marketing)/industries/ecommerce/page.tsx + page.css. Static; same template, e-commerce-specific fixtures and copy.

**Industries — Fintech (/industries/fintech)**  
Vertical page: accuracy as brand, daily monitoring — worked example of Gemini quoting a stale 2024 APR range from a cached page (Action #94 opened), regulator-filings/review sites as watched URLs.  
_Technical:_ app/(marketing)/industries/fintech/page.tsx + page.css. Static; fintech-specific fixtures.

**Industries — Healthcare (/industries/healthcare)**  
Vertical page: patients ask AI first — cited-sources by service line, share of condition answers citing pre-2024 guidance, consent explainer, watched-URL actions.  
_Technical:_ app/(marketing)/industries/healthcare/page.tsx + page.css. Static; healthcare-specific fixtures.

**Industries — Travel & Hospitality (/industries/travel)**  
Vertical page: own the itinerary answer — destination demand by portfolio, localization gap example (8% German vs 31% English answers, 4 localization actions), regional tracking.  
_Technical:_ app/(marketing)/industries/travel/page.tsx + page.css. Static; travel-specific fixtures.

**Customers index (/customers)**  
Case-study hub with a working industry filter (All / Restaurants / Media) over two full stories (MTY Food Group, Bell Media) rendered as featured cards with 2×2 stat grids, plus four summary stat cards (2,400+ teams, +9.4pt median lift, 41 days to first win, 5 engines) and a closing CTA.  
_Technical:_ app/(marketing)/customers/page.tsx + page.css wraps CustomerStories.tsx (client): useState chip filter, every chip returns a result. Story content and stats are curated fixtures presented as real customers.

**Customer story — MTY Food Group (/customers/mty-food-group)**  
Full case study: ~90 restaurant banners made machine-readable, +16pt answer coverage in 90 days, 90-day timeline (menu schema → hours/locations sync), 'how we measured it', links to the Bell story and Answer Engine Insights.  
_Technical:_ app/(marketing)/customers/mty-food-group/page.tsx + page.css. Static server component; official MTY logo present at public/logos/mty-food-group.svg.

**Customer story — Bell Media (/customers/bell-media)**  
Full case study: streaming-availability answers corrected for Canada, +21pt on title prompts naming Crave/CTV, −63% wrong-service answers, 90-day timeline, Agent Analytics crawler-access callout, links to MTY story.  
_Technical:_ app/(marketing)/customers/bell-media/page.tsx + page.css. Static; official Bell logo present at public/logos/bell.svg.

**Blog index (/blog)**  
Blog landing: a featured post with an inline citation-rate-by-page-type chart, working category filter pills (All / AEO research / Guides / Product) that filter 6 fixture cards + toggle the featured card, a 'Load 12 more' button that swaps to a caught-up caption, an Answr Index promo banner, and a newsletter subscribe form.  
_Technical:_ app/(marketing)/blog/page.tsx + page.css wraps BlogClient.tsx (client). Filter/load-more are real client state; load-more is a fixture (no extra posts exist). Newsletter subscribe validates non-empty email then swaps to an inline success line but does NOT persist (no fetch) — working demo only. All 6 cards link to the single blog post.

**Blog post — comparison pages (/blog/what-50k-prompts-taught-us)**  
Full long-form article ('Do comparison pages still win AI answers?') with a citation-rate chart, 2026 trend analysis, three takeaways, author bio (Rui Kimura, Head of Research), and 'next in research' links.  
_Technical:_ app/(marketing)/blog/what-50k-prompts-taught-us/page.tsx + page.css. Static server component; metadata title = article headline. Only one real post exists behind the blog index.

**Changelog (/changelog)**  
Release timeline: 9 dated entries (Aug 2 2026 back to Apr 8 2026) with NEW/IMPROVED/BETA tags, plus an 'Older releases' button that expands 4 more pre-April entries in place. 'Ships every Tuesday' + digest subscribe link.  
_Technical:_ app/(marketing)/changelog/page.tsx (static entries) + OlderReleases.tsx (client useState expander; entry markup byte-identical to the static entries). Real expand/collapse.

**About page (/about)**  
Company page: mission ('measure the layer between search and belief'), a founding timeline, three values (measure don't guess / consent everywhere / actions ship), remote-first culture note, and three open-role listings (Research, Design, GTM) with a 'see open roles' CTA.  
_Technical:_ app/(marketing)/about/page.tsx + page.css. Static server component; timeline and roles are content, not a live ATS.

**Enterprise page (/enterprise)**  
Enterprise sales page: 6 capability cards (SSO/SAML+SCIM via Okta/Entra/Google, audit log streamable to SIEM, data residency EU/US, priority support, DPA & procurement, named success engineer), a rollout timeline (Week 1 / Weeks 2–4 / Quarterly QBRs), Talk-to-sales and Security-overview CTAs.  
_Technical:_ app/(marketing)/enterprise/page.tsx. Static server component; describes capabilities as procurement-ready (framed as designed-in, not certified).

**Security & methodology page (/security)**  
Trust page: two first-party data sources (direct official-API sampling, first-party telemetry) vs an explicit 'never' (no scraping/gray-market logs), four posture cards (HTTPS, first-party only, region choice, compliance-on-roadmap), a data-lifecycle table (collect/process/store/delete, 30-day purge), a subprocessors table (Vercel + your-connected-providers), and a responsible-disclosure mailto.  
_Technical:_ app/(marketing)/security/page.tsx. Static server component. Notably rewritten in a sale-readiness pass to remove unsubstantiated SOC 2 / pen-test / GDPR-compliant claims and a fabricated subprocessor list; now frames compliance honestly as roadmap. This is the methodology page the Answr Index and blog cite.

**Integrations page (/integrations)**  
Integrations catalog: 8 connector cards (Looker Studio, GA4, Slack, Salesforce, HubSpot, Notion, Zapier, Webhooks) each with a hand-drawn inline-SVG brand glyph, a REST API card (with a sample GET /v1/visibility call, 'Scale+'), an MCP-server card ('NEW'), a request-an-integration CTA.  
_Technical:_ app/(marketing)/integrations/page.tsx + page.css. Static server component; brand glyphs are hand-coded SVGs inline (not simple-icons here), connectors are described capabilities, not wired live integrations.

**Resources — AEO Handbook (/resources/aeo-handbook)**  
Lead-gen resource: 6-chapter handbook where chapters 1–3 are free (open a teaser accordion) and 4–6 are email-gated; hero stats (50K prompts, 5 platforms, 14 charts, 64pp PDF), author byline, and a 'Get chapters 4–6' email-course capture that focuses on open of a gated chapter.  
_Technical:_ app/(marketing)/resources/aeo-handbook/page.tsx + page.css wraps HandbookBody.tsx (client): real accordions + scroll-to/focus of the email field. The 'Send it' capture validates non-empty email then swaps to inline confirmation but does NOT persist (no fetch) — working demo only, not wired to /api/lead.

**Resources — Answr Index explorer (/resources/answr-index)**  
Public benchmark: 'the 500 domains AI cites most', with platform chips (All / ChatGPT / Perplexity / AI Overviews / Claude / Gemini) that re-rank the table by that platform's citation share, a working domain search filter with an empty-state message, ranked rows with citations/mo, Δ30d and trend sparklines, and a methodology link to /security.  
_Technical:_ app/(marketing)/resources/answr-index/page.tsx + page.css wraps IndexExplorer.tsx (client): useMemo re-computes per-platform weights over 8 hard-coded fixture rows and re-sorts/filters. Real interactivity; the '500 domains / 1.2M citations' is a fixture of 8 rows. 'View the full index' routes to /demo.

**Demo request page (/demo)**  
Demo booking: value props, a booking card with first/last name, work-email (validated), company-website field, and multi-select 'what are you hoping to learn?' chips; submit swaps to an inline success state naming the email and site, and a 3-step process strip.  
_Technical:_ app/(marketing)/demo/page.tsx + page.css + DemoForm.tsx (client). Chips are real multi-select (useState array). Submit POSTs to /api/lead with source:'demo' (real capture) then shows inline success; email-format is only checked as non-empty client-side. No calendar is actually booked.

**Waitlist page (/waitlist)**  
Early-access capture: hero, benefit list, and a form (work email + optional company) that joins the waitlist; on load it fires a first-party view ping and captures UTM/referrer attribution, then submits and swaps to a confirmation.  
_Technical:_ app/(marketing)/waitlist/page.tsx + WaitlistForm.tsx (client). Real: POSTs to /api/lead with source:'waitlist' + {utmSource, utmCampaign, referrer} parsed from URL/document.referrer, and POSTs a view event to /api/waitlist/view on mount. Email validated by regex. This is the most fully-wired marketing form.

**Legal pages — Privacy / Terms / DPA (/privacy, /terms, /dpa)**  
Three legal documents: Privacy Policy (9 sections, GDPR/CCPA, no-model-training pledge), Terms of Service (10 sections), and a Data Processing Addendum (8 sections incl. subprocessor annex). Consistent layout, 'last updated 21 Aug 2026', contact mailto.  
_Technical:_ Three thin pages (app/(marketing)/{privacy,terms,dpa}/page.tsx) that pass structured section arrays into the shared components/marketing/LegalDoc.tsx renderer. Real, honest starter templates written for the product's actual data model, with [bracketed] placeholders (legal entity, jurisdiction, hosting regions) flagged for counsel — explicitly a customizable baseline, not finalized.

**Global 404 / not-found page**  
Branded error page ('This answer doesn\'t exist') with on-theme copy, primary + secondary CTAs, quick-links to Pricing/Customers/Blog/Demo, and a support mailto.  
_Technical:_ app/not-found.tsx + app/not-found.css. Sits outside the (marketing) route group so it manually renders Nav + Footer in the same 1440px 'mkt' shell. Static server component.

**Global navigation (Nav) with dropdowns + mobile sheet**  
Sticky top nav: logo, 7 sections (Product, Solutions, Industries, Resources with hover mega-dropdowns; Pricing, Enterprise, Customers as direct links), Log in link, 'Get a demo' CTA. Active-state logic per route. Below 900px it collapses to a hamburger that opens a full-screen accessible menu sheet listing every section and its dropdown items.  
_Technical:_ components/marketing/Nav.tsx (client) + marketing.css. Hover open/close with 120ms close timer, aria-expanded, Escape-to-close returning focus, body-scroll-lock, matchMedia auto-close above breakpoint, close-on-navigation via usePathname. Fully real.

**Global footer (Footer)**  
4-column footer (Product, Company, Resources, Legal) with 22 links, brand lockup + tagline, and a compliance/copyright line ('© 2026 Answr, Inc.').  
_Technical:_ components/marketing/Footer.tsx. Static server component; all links point to real routes including the starter legal pages.

**Home free-snapshot form**  
Domain-entry form in the hero ('Get my free snapshot'); on submit it validates a non-empty domain and swaps the field row in place to a queued-success state ('sampling yourcompany.com now… 25 starter prompts across five platforms').  
_Technical:_ app/(marketing)/SnapshotForm.tsx (client). Real: fire-and-forget POST to /api/lead with source:'snapshot' + the domain as company (errors swallowed), then inline success. Validation is non-empty only.

**Lead capture API + email notification (/api/lead)**  
The endpoint the snapshot, demo and waitlist forms POST to; captures email/company/name/message/source + UTM/referrer, and can email a notification to the operator per lead.  
_Technical:_ app/api/lead/route.ts (Node runtime, force-dynamic). POST validates + caps fields, persists via lib/db createLead (in-memory by default, durable when Upstash/Redis env is set — see lib/db/index.ts), then calls notify(). GET is gated behind the demo cookie and returns captured leads + db.durable. Real persistence path; the Resend email notification is scaffolding that no-ops unless RESEND_API_KEY + LEAD_NOTIFY_EMAIL are set (activates-with-keys).

**Waitlist funnel analytics (/api/waitlist/view)**  
Backs a real demand-validation funnel: records privacy-safe page-view events for the waitlist, and (for the owner) returns views, signups, conversion %, and a per-source (UTM/referrer) breakdown.  
_Technical:_ app/api/waitlist/view/route.ts. POST is public (called on waitlist mount) → recordView(); GET is gated by the demo cookie and joins views vs source:'waitlist' leads into a conversion funnel. Real; cookieless, buckets by utm_source/referrer only.

**Logo wall + brand lockups (LogoWall / BrandLockup / BrandIcon)**  
Renders customer/brand marks that never break: each slot resolves best-asset-first (official file → simple-icons glyph → styled wordmark). Used for the home 'leading Canadian brands' wall (MTY, Bell) and the solutions stack strip, with an honest qualifier note.  
_Technical:_ components/marketing/LogoWall.tsx (server component; checks filesystem at render via logoAsset()) + components/ui/BrandIcon.tsx (reads the installed simple-icons package; documents that Slack/HubSpot/Salesforce/GA are absent from the set by owner request and must come from /public/logos). Real 3-tier fallback; only bell.svg + mty-food-group.svg official files are present today.

**SEO — robots, sitemap, per-page metadata**  
Crawlability + search presence: robots.txt allows marketing and disallows the gated app/auth/API/onboarding; sitemap.xml lists all 31 public marketing routes with change-frequency/priority; every page sets a title (via the '%s · Answr' template) and the root sets description, keywords, canonical, OpenGraph and Twitter card metadata.  
_Technical:_ app/robots.ts + app/sitemap.ts (Next.js native MetadataRoute, absolute URLs at https://useanswr.com) + per-page `export const metadata` + app/layout.tsx root metadata (metadataBase, title template, keywords, alternates.canonical, openGraph, twitter, robots index/follow). Real and working.

**SEO — default social/OpenGraph share image**  
Every link to the site previews a branded 1200×630 card ('Know what AI says about your brand') instead of a blank preview; pages can override.  
_Technical:_ app/opengraph-image.tsx using next/og ImageResponse (nodejs runtime, edge-rendered PNG). Real.

**Site-wide first-party referral capture (snippet + /api/collect)**  
On every marketing page, a deferred first-party script reports document.referrer + utm_source on first touch of a session and classifies AI-assistant referrers (cookieless), feeding the 'ai_referrals' telemetry metric the product markets.  
_Technical:_ Injected in app/layout.tsx as `<script defer src="/snippet.js" data-endpoint="/api/collect">`; app/api/collect/route.ts classifies via lib/bots identifyReferral() and writes via lib/telemetry, guarded by a same-origin-or-ANSWR_INGEST_SECRET check. Complemented by proxy.ts (Next 16 Proxy/middleware) which fingerprints ~20 AI crawler UAs and POSTs to /api/ingest. Real mechanism; store is in-memory unless KV env is configured.

**Shared marketing shell, theme, responsive layer & a11y**  
All marketing routes share one frame (Nav + main + Footer + global Toaster) on a committed dark theme, with a skip-to-content link, small-screen layout collapse (multi-column grids → single column, nav sheet), and consistent design tokens.  
_Technical:_ app/(marketing)/layout.tsx (scopes a '.mkt' wrapper), app/globals.css (single :root dark palette: --bg0/--ac/--tx/--mut/--brd/--good/--bad, Inter font, skip-link), components/marketing/marketing.css (~300 lines of @media breakpoints at 900/600px driving the mobile menu + frame reflow), components/ui/Toaster.tsx (global event-driven toast — present but marketing forms deliberately use inline success states instead). Real.

---

## Dashboard application

_63 features._

**Dashboard app shell & access gate**  
The whole /app area sits behind a login gate and shares one persistent frame (sidebar + content) so filters and brand selection survive navigation between screens.  
_Technical:_ app/(dash)/app/layout.tsx wraps every screen in FilterProvider (lib/filters/context.tsx) + Sidebar + Overlays + Toaster + SmallScreenGate. Server-side guard validates EITHER the demo passphrase cookie (lib/gate.ts isUnlocked) OR a real lib/auth session, else redirect('/login'). Edge pre-check in proxy.ts. Gate is REAL; session auth exists but the demo passphrase still governs /app (documented last-mile in HANDOFF.md).

**36-screen route map**  
A full analytics product: 36 distinct dashboard screens across Monitor, Optimize, Infrastructure and Settings.  
_Technical:_ 36 page.tsx files under app/(dash)/app (verified count). Routes: welcome, overview, insights(+regions/audiences/sentiment/shopping/topics/running-shoes), citations(+watched), prompts, conversations, demand(+keyword), actions(+92), workflows, reports, agents(+referrals/logs/bots/gptbot), page-health, assets, content-score, live, settings(+workspace/data-quality/platforms/integrations/leads/team/alerts/api-keys/billing). Next.js 16 App Router, React 19, TypeScript; builds type-clean.

**Left navigation rail (collapsible)**  
Grouped icon sidebar with inline counts and attention badges; collapses to a 56px icon rail, toggled by button or keyboard, remembering the choice.  
_Technical:_ components/app/Sidebar.tsx + sidebar.css + nav-icons.tsx. Three groups (Monitor/Optimize/Infrastructure) with hardcoded counts (Citations 1,284, Prompts 412, Conversations 38, Actions 12 attention, NEW/live badges). ⌘\ toggles; localStorage 'answr:nav-collapsed'; default-collapsed under 900px. Active state derived from pathname. Counts are FIXTURE.

**Workspace topbar (breadcrumb + filters + export)**  
Every screen has a consistent header: brand breadcrumb, date-range and platform filter pills, and a context-appropriate Export or primary action.  
_Technical:_ components/app/Topbar.tsx. Brand hardcoded 'Nike'. Renders FilterPill(range/platform) live or inert per screen, plus ExportButton (report/rows) or DemoActionButton. Real, reused across all screens.

**Date-range & platform filter engine (shared, persistent)**  
Picking a date window (7d/30d/90d/YTD) or a single AI platform re-slices the wired screens for real, and the selection is remembered as you move between screens.  
_Technical:_ lib/filters/context.tsx (React context in layout) + lib/filters/windows.ts. RANGES/PLATFORMS metadata, DEFAULT 30d/all. REAL re-slicing on Overview, Insights cluster, Citations, Agent Analytics; other screens render the pill INERT with an honest tooltip.

**Deterministic multi-window derivation (the honest windowing)**  
Longer date windows show plausible back-history instead of blank space, while the last 30 days always render the exact shipped numbers, so today's headline never moves.  
_Technical:_ lib/filters/windows.ts: extendLevel (AR(1) wobble on the fixture's own damped slope), extendCount (weekday-shaped, prev-window pinned to published delta), accrued/accruedStat (saturating curve for distinct counts). Seeded mulberry32 PRNG (hashSeed) => identical server/client output; levelStat/countStat/windowAxis/axisTicks. Sophisticated REAL code over FIXTURE anchors.

**Inert-filter honesty layer**  
On screens that cannot honor a filter, the pill is shown as a plainly disabled chip explaining what the screen actually reports, instead of a live-looking control that does nothing.  
_Technical:_ components/ui/FilterPill.tsx inert mode: aria-disabled, cursor:not-allowed, '?' tooltip (pinned on tap for touch), shows the fixed default scope never the workspace selection. Topbar passes rangeNote/platformNote. Deliberate anti-dark-pattern per BUILD_CONVENTIONS.

**31-metric dictionary with provenance tooltips**  
Every KPI carries an info button opening its definition, real production data source, and exact calculation formula — a diligence-grade glossary of what each number means.  
_Technical:_ lib/metrics.ts: 31 typed MetricDef entries (visibility_score, share_of_voice, citations_count, owned_citation_share, avg_answer_position, answer_rank_first, topic/region/audience_visibility, sentiment_mix, shopping_visibility, cited_source_count, prompts_tracked, conversation_mentions, demand_volume, action_score, impact_estimate, projected_visibility, measured_lift, crawler_events, ai_referrals, page_health, content_score, platform_appearances, unique_cited_domains, answers_with_citation_rate, actions_queue, unique_agents, pages_crawled, page_speed, data_quality_sample). Surfaced by components/app/MetricInfo.tsx + KpiCard ⓘ; generates METRICS.md via tools/gen-metrics-doc.mjs. REAL, single source of truth.

**Canonical KPI card + plain-language hints**  
Uniform metric cards showing value, colored delta, and a moving sparkline, each with a jargon-free 'what am I looking at' bubble aimed at a 15-year-old.  
_Technical:_ components/app/KpiCard.tsx (value/delta/deltaGood/sparkline children) + components/ui/Hint.tsx (portal tooltip, <10 words, flips when no room). Hint text defaults to METRICS[id].plain. Delta tone green/red/muted via deltaTone. REAL.

**Executive CSV export engine**  
Every Export button downloads a VP-readable CSV: titled header block, an executive summary of headline metrics with deltas and plain-English reads, supporting detail tables, and source footnotes — never a bare table dump.  
_Technical:_ lib/export/report.ts buildExecutiveCsv(ReportSpec) — header/summary/sections/footnotes, arrow→+/- normalization, quote escaping, UTF-8 BOM for Excel. wrapRows wraps legacy single tables. components/ui/ExportButton.tsx builds a Blob + anchor download + toast. REAL and working on every wired screen.

**Per-module report builders**  
Each screen's export tells that screen's whole story (headline metrics, the trend behind them, and every supporting table), not just the one table next to the button.  
_Technical:_ lib/export/reports.ts (seriesSection, overviewReport, sentimentReport, moduleReport) + per-cluster reports.ts files (insights, citations, actions, agents, demand, page-health). Builders take the screen's own fixture facts as args so CSV and screen never drift. REAL.

**Export window-honesty stamping**  
A downloaded report always names the window its rows actually cover, and if the on-screen filter is set to something else, stamps a note saying that filter is NOT applied — so a CSV can never be mistaken for a 90-day report in a stakeholder's inbox.  
_Technical:_ lib/export/active-window.ts: activeFilterLabel/windowNote/withWindowNote/windowToastSuffix. Reports are fixed 30-day snapshots; exportWindow overrides the label on non-30d screens (rosters, key inventories). REAL.

**⌘K command palette**  
A keyboard-launched palette that searches every screen and a couple of actions, navigates on select, and can export citations or open What's New.  
_Technical:_ components/app/CommandK.tsx. Opens on Cmd/Ctrl+K or 'answr:cmdk' event (sidebar Search button); Esc/backdrop close. REAL case-insensitive filter over a 27-screen index + 2 actions with genuine empty state; export-citations builds the executive CSV. Navigates via next/router. REAL (search was previously inert, now genuine).

**Prompts search (shareable)**  
A working search box on the Prompts screen that filters the table and is reload/share-safe via the URL.  
_Technical:_ app/(dash)/app/prompts/PromptSearch.tsx writes ?q= param; PromptsBody.tsx reads useSearchParams to filter PROMPT_ROWS. REAL over FIXTURE rows.

**TrendChart (multi-series line/area with live hover)**  
Interactive line/area charts with a crosshair, per-series dots, and a tooltip showing every series' value at the hovered date — used across Overview, Insights, Demand, Actions, Referrals.  
_Technical:_ components/app/charts/TrendChart.tsx. Fluid width via ResizeObserver, SSR fallback width, gradient area fills, stepped mode, dashed projection series, y-domain/format props, SVG. REAL rendering of FIXTURE series (lib/data/*).

**BarChart (vertical/stacked with hover)**  
Bar and stacked-bar charts with per-bar hover tooltips and totals, e.g. the demand age-demographic and platform-split bars.  
_Technical:_ components/app/charts/BarChart.tsx (BarSegment/Bar), rounded data ends, 2px stacked gaps, ResizeObserver fluid width. REAL over FIXTURE.

**Regional visibility choropleth (world map)**  
An interactive world map shading tracked regions by AI visibility, with hover tooltips giving region, score and 30-day delta.  
_Technical:_ components/app/RegionMap.tsx: d3-geo geoNaturalEarth1 + topojson-client + world-atlas npm package (no CDN). Hand-rolled #232430→#8E7CF2 ramp on 0–45% domain, 8 tracked countries (VIS/NAMES/DELTAS maps), ResizeObserver. REAL component, FIXTURE region values.

**Source-mix donut, sparklines, sentiment split, heatmap cells**  
A family of smaller data visuals: a hover-enabled citation source donut, KPI sparklines that move with the window, a positive/negative sentiment split bar, and a topic×platform heatmap with per-cell hover.  
_Technical:_ citations/SourceMixDonut.tsx (SVG donut w/ hover, window-scaled), components/ui/Sparkline.tsx (path from the metric's own points), insights/sentiment/SentimentSplit.tsx, insights/HeatCell.tsx (live hover tooltips). REAL over FIXTURE (lib/data/evidence.ts, insights.ts).

**Global toast + honest demo-action pattern**  
Inert create/save/new buttons never sit dead — they fire a toast stating plainly what would happen on a live workspace; a single bottom-center toaster shows one message at a time.  
_Technical:_ components/ui/Toaster.tsx (listens on 'answr:toast', 3.6s auto-dismiss), lib/toast.ts, components/ui/DemoActionButton.tsx, settings/DemoControls.tsx (ToastButton/Toggle/SelectField/CsvButton), actions/ToastButton.tsx. The app-wide 'honesty layer' per INTERACTIVITY_CONVENTIONS. REAL.

**Support chat + What's-new overlays**  
A floating support chat panel with a live send box and canned reply, and a What's-new panel opened from the palette.  
_Technical:_ components/app/Overlays.tsx mounts CommandK + SupportChat + WhatsNew. SupportChat.tsx: Enter appends message, 600ms canned reply, 'Show robots.txt' snippet. WhatsNew.tsx opens on 'answr:whatsnew'. REAL interactivity, no backend.

**Small-screen gate**  
On phones the desktop-only dashboard shows a deliberate interstitial (continue anyway / go to marketing site) instead of a sideways-scrolling mess.  
_Technical:_ components/app/SmallScreenGate.tsx + small-screen-gate.css. Inline display:none overridden only under @media(max-width:899px); sessionStorage dismissal. REAL.

**Brand switcher & account menu**  
A sidebar brand switcher listing tracked brands with visibility stats and a bottom account menu (email, brand/workspace/billing/notifications, log out) that absorbs Settings.  
_Technical:_ components/app/BrandSwitcher.tsx (position:fixed anchored panel, reads lib/brands.ts, honest read-only toast on non-Nike), AccountMenu.tsx (USER hardcoded Dana Okafor). Selecting other brands is UI-only (FIXTURE); switcher/menu interactivity REAL.

**Welcome / day-zero screen**  
An empty-state Overview for a brand-new workspace: dashed KPIs, 'first run starts tonight', and a setup checklist.  
_Technical:_ app/(dash)/app/welcome/page.tsx + RunNowButton.tsx (honest toast). KpiCards with '—' values + provenance. Sidebar keeps Overview active. FIXTURE/empty-state.

**Overview screen**  
The flagship analytics surface: KPI row (visibility, share of voice, citations, avg position), competitor trend, per-platform visibility, competitor share-of-voice table, top cited sources, an auto-written weekly digest and quick actions.  
_Technical:_ app/(dash)/app/overview/{page.tsx,OverviewKpis,OverviewTrend,PlatformVisibilityCard,CompetitorSovCard,TopSourcesCard,report.ts}. rangeLive+platformLive; KPIs read endpoints of daily series (lib/data/overview.ts) keyed to match the charts; platform filter narrows two cards with an honest inline note. Export = full executive report. REAL windowing/export over FIXTURE.

**Answer Engine Insights — Topics (hub)**  
Share-of-voice trend vs competitors, a topic-movers list, a topic×platform visibility heatmap, and a topics league table with per-topic drill-down.  
_Technical:_ app/(dash)/app/insights/{page.tsx,InsightsTabs,RangeTrend,HeatCell,ToastButton,reports.ts}. Topic mix re-derived so Running shoes leads (132/108/84/48/40=412). rangeLive; heatmap = live-hover HeatCell; topicsSpec export. Sub-nav tabs w/ BETA badges. FIXTURE (lib/data/insights.ts).

**Insights — Regions sub-tab**  
Regional AI visibility: the live world map, a region-rank list, a language-filterable by-region table, and a translation-gap finding.  
_Technical:_ app/(dash)/app/insights/regions/{page.tsx,ByRegionTable.tsx}. RegionMap + RangeTrend(regionsSeries, endpoints match table). ByRegionTable = working All/English/German/French segmented filter over 6 rows. regionsSpec export. FIXTURE.

**Insights — Audiences sub-tab (segment-driven)**  
Buyer-persona visibility: clickable segment cards drive the headline, trend, rank board and comparison row, plus a real 'New segment' describe→generate-prompts→add flow.  
_Technical:_ app/(dash)/app/insights/audiences/{page.tsx,AudiencesBoard.tsx,NewSegmentModal.tsx}. Selection drives everything from lib/data/audiences.ts; NewSegmentModal generates 8 intent-tagged prompts (~700ms) and appends a pending segment. Export rows. REAL interactivity, FIXTURE data (in-session segments non-persistent).

**Insights — Sentiment sub-tab**  
How favorably AI describes the brand: positive-sentiment trend + headline, a positive/negative split, driving themes table with filters, and a full 'answer receipt' with highlighted spans, engine sub-queries, cited sources and its own export.  
_Technical:_ app/(dash)/app/insights/sentiment/{page.tsx,SentimentSplit,ThemesTable,ReceiptExport}. RangeStat headline (ends 74%), ThemesTable All/Positive/Negative/Trending filter, ReceiptExport = inline single-answer executive CSV. sentimentSpec export (186 answers). FIXTURE.

**Insights — Shopping sub-tab**  
Purchase-intent visibility: recommendation-rate trend + headline, a products table, attribute influence and head-to-head comparisons, scoped to shopping-capable platforms.  
_Technical:_ app/(dash)/app/insights/shopping/page.tsx. rangeLive, custom 'Shopping-capable platforms' FilterPill, RangeTrend/RangeStat (ends 31.4%), shoppingSpec export. FIXTURE (lib/data/insights.ts).

**Insights — Topic detail (Running shoes)**  
A single topic drilled down: topic-visibility trend + headline, topic-scoped brand rank, and a per-prompt table linking to Prompts.  
_Technical:_ app/(dash)/app/insights/topics/running-shoes/page.tsx. RangeStat/RangeValue/RangeTrend (ends 42.6% = topics-table row). Both topbar and in-page Export download runningShoesSpec. FIXTURE.

**Citations screen**  
Where AI quotes the brand: KPI row (total citations, unique domains, owned share, answers-with-citation rate), a hover source-mix donut, a filterable cited-domains league table, and a most-cited-pages table — all a coherent slice of one citation pile.  
_Technical:_ app/(dash)/app/citations/{page.tsx,CitationKpis,CitedDomainsCard,MostCitedPages,SourceMixDonut,ViewAllButton,citationWindow.ts,ExportModal,reports.ts}. citationWindow = single source of truth; KPIs use countStat/accruedStat; CitedDomains All/Owned/Earned filter. rangeLive. FIXTURE (lib/data/evidence.ts).

**Citations answer-export modal**  
An export dialog with include-checkboxes that really change the payload, CSV/JSON/Copy outputs and a raw-answer preview.  
_Technical:_ app/(dash)/app/citations/ExportModal.tsx. CSV = citationsReport executive envelope (checkboxes toggle sections), JSON = raw rows, Copy = clipboard CSV, format tabs toast honest line. Window-note stamped. REAL export over FIXTURE.

**Watched URLs & source gap**  
Pages the workspace watches with citation-shift alerts, plus a 'source gap' table of domains that cite the category but never the brand, each with a suggested play.  
_Technical:_ app/(dash)/app/citations/watched/{page.tsx,Controls.tsx}. WatchUrlButton/GapViewToggle/SuggestedPlay = honest toasts; watchedUrlsSpec export. FIXTURE.

**Prompts screen (table + bulk-select + detail)**  
The tracked-prompt manager: searchable/intent-filtered table with real bulk-select, an Export-selection CSV, and a master-detail panel where four platform tabs swap the answer, citations, sparkline and metrics for the same question.  
_Technical:_ app/(dash)/app/prompts/{page.tsx,PromptsBody,PromptSearch,PromptDetail,Controls}. Bulk checkboxes (header toggles all), pagination toasts, PromptDetail platform tabs from lib/data/prompts.ts. REAL interactivity; PROMPT_ROWS FIXTURE.

**Prompts — Add prompts flow (real write path)**  
An add-prompts modal: paste or auto-suggest category prompts, with a live quota against the 1,000-prompt plan that discounts blanks/dupes/already-tracked, then actually persists.  
_Technical:_ app/(dash)/app/prompts/AddPromptsModal.tsx POSTs to app/api/prompts/route.ts → lib/db/entities addPrompt (workspace 'demo'), feeds lib/sampler. SUGGESTED_PROMPTS from lib/data/prompts.ts. REAL persistence (in-memory now, durable with KV).

**Prompts — Create Action & Run History modals**  
From a prompt: a 'Create action' modal pre-filled from the prompt's gap that persists to the action queue, and a 'View all runs' sheet showing the last 14 daily runs with a position bar strip.  
_Technical:_ prompts/CreateActionModal.tsx POSTs to app/api/actions/route.ts (REAL persist, id #93); RunHistoryModal.tsx (14-run history, honest 14-run vs 30-day framing, executive CSV export). FIXTURE run data, REAL action write.

**Conversations explorer (master-detail)**  
A two-pane explorer of real researched consumer AI chats about running shoes: searchable list, mentions filter, transcript reading pane with citation markers and source links, and shareable deep links.  
_Technical:_ app/(dash)/app/conversations/{page.tsx,Explorer.tsx} + lib/data/conversations.ts (6 researched transcripts, resolving citation URLs). ?c=<id> deep link read on load, Copy link, FilterPill mentions, conversationExportRows CSV. REAL interactivity; transcripts are researched FIXTURE.

**Demand screen (watchlists)**  
The AI-era search-volume analog: keyword watchlists with volume, brand-gap and sparklines, a keyword search box, and an executive export.  
_Technical:_ app/(dash)/app/demand/{page.tsx,KeywordSearch,reports.ts}. FilterPill, demandSpec export, honest toasts on new-watchlist/view-all/ad-hoc search. Keyword rows link to detail. FIXTURE.

**Demand — Keyword detail**  
One keyword drilled down: a volume trend chart, age-demographic bars, a real Exact/Phrase toggle, per-platform inclusion checkboxes, an expandable long-tail keyword tree with star/watchlist toggles, and 'asked recently' quotes.  
_Technical:_ app/(dash)/app/demand/keyword/{page.tsx,KeywordCharts,KeywordTree,PlatformCheck,ExactPhraseToggle}. TrendChart+BarChart from lib/data/demand.ts; tree accordion + star toggles + honest toasts; demandKeywordSpec export. REAL interactivity, FIXTURE data.

**Actions screen (prioritized queue + impact model)**  
A scored optimization queue: KPI strip (open/in-progress/shipped counts, +9.4pt available), an impact-model chart plotting measured vs projected visibility, category/sort filters, and the action cards with evidence.  
_Technical:_ app/(dash)/app/actions/{page.tsx,reports.ts} + lib/data/optimize.ts (impactHistory 30pts ending 34.2 + impactProjection to 43.6). TrendChart dashed projection; KpiCards (actions_queue/impact_estimate); actionsSpec export. FIXTURE.

**Action detail (#92)**  
A single action worked up: a share-of-voice progress card (28.6→31.4), status controls, and a real implementation checklist you can tick off.  
_Technical:_ app/(dash)/app/actions/92/{page.tsx,ChecklistStep.tsx}. KpiCard w/ progress bar child; ChecklistStep local toggles; status/prev-next toasts; action92Spec 'Export brief'. FIXTURE + REAL local toggles.

**Workflows screen**  
An automation builder view: a workflows table, template chips, a step editor and recent-runs list.  
_Technical:_ app/(dash)/app/workflows/page.tsx. FilterPill status, '+ New workflow' as Topbar-extra ToastButton, template/step/save/run all honest toasts, row-hover tables. FIXTURE (no real automation engine).

**Reports screen (builder + wizard)**  
Report generation: a real 'Build a report' form (name, section checkboxes, format/schedule dropdowns, removable recipient chips), a concierge report-request wizard, downloadable recent-report CSVs, and toggleable scheduled rows.  
_Technical:_ app/(dash)/app/reports/{page.tsx,ReportBuilder,ReportWizardModal,ReportsControls}. Builder real form state + inline success; wizard opens via WIZARD_EVENT; DownloadButton builds CSV manifest per report; ScheduleToggle real flip. REAL form UX, FIXTURE manifests.

**Agent Analytics — Crawlers**  
AI-crawler traffic on the site: KPI row (crawler requests, unique agents, pages crawled, blocked), a per-agent crawl-activity chart, an agents table with robots status and most-crawled paths.  
_Technical:_ app/(dash)/app/agents/{page.tsx,AgentsTabs,AgentKpis,CrawlTrend,CrawlScaled,crawlWindow.ts,reports.ts} + lib/data/infra.ts. Own rangeLive pill; crawlWindow scales rows; agentsSpec 'Export 48,231 events'. Carries a 'Demo data' badge pointing to real /app/live. FIXTURE.

**Agents — Referrals**  
Human click-throughs from AI assistants: KPI row, referred-humans-by-platform and edge-logs-vs-GA4 trends, referring-platform split and landing-pages table.  
_Technical:_ app/(dash)/app/agents/referrals/{page.tsx,ReferringPlatformCard.tsx} + lib/data/infra.ts (referredHumansSeries, analyticsComparisonSeries). referralsSpec 'Export 3,412 referrals'. FIXTURE.

**Agents — Live logs**  
A crawler request stream (recent requests as they arrive) with blocked-request evidence tied to action #87.  
_Technical:_ app/(dash)/app/agents/logs/page.tsx. logsSpec export; honest range/platform notes ('stream, not a date window'). FIXTURE (distinct from the real /app/live).

**Agents — Bot detail (GPTBot)**  
One crawler drilled down: request/pages/robots headline, GPTBot's own request trend, visit-purpose split, user-agents seen and pages-indexed table.  
_Technical:_ app/(dash)/app/agents/bots/gptbot/page.tsx. gptbotSpec export. FIXTURE (route slug documented as claudebot in comments).

**Page health**  
Per-URL AI-readiness: render timings (FCP/LCP/TTI) with web-vitals bands, what the page earns per platform, and a TTI fix.  
_Technical:_ app/(dash)/app/page-health/{page.tsx,report.ts}. KpiCards (page_speed/page_health); shares AgentsTabs; pageHealthSpec export. FIXTURE.

**Assets (multi-brand)**  
A brand portfolio view: searchable brand cards with visibility/competitor stats and a real add-brand form.  
_Technical:_ app/(dash)/app/assets/{page.tsx,AssetsBody,AddBrandButton} + components/app/AddBrandModal.tsx + lib/brands.ts (shared with sidebar switcher). Search filters cards; AddBrandModal validates then honest toast. REAL UI, FIXTURE brands.

**Content score**  
A pre-publish grader: a 0–100 gauge with provenance, mode tabs (URL/paste/upload), a 'Score it' input that re-scores the fixture page, and expandable 'raise the score' recommendations.  
_Technical:_ app/(dash)/app/content-score/{page.tsx,ScoreInfo,ScoreControls,RaiseScoreRow}. ScoreInfo applies KpiCard provenance to content_score; ScoreControls real input (fixture URL returns 68, others honest toast); RaiseScoreRow accordions; CSV export. FIXTURE.

**Live telemetry (the one real-data screen)**  
Genuine AI-crawler traffic captured on this deployment, with a KPI row, event feed, the capture-pipeline explainer, and a 'send test crawler hit' button that fires a real GPTBot request and shows it flow through — explicitly not a fixture.  
_Technical:_ app/(dash)/app/live/{page.tsx,LiveTelemetry.tsx}. Polls read endpoint every 10s; proxy.ts→/api/ingest captures real bots, public/snippet.js→/api/collect captures human referrals, /api/telemetry/test-hit for on-demand proof. lib/telemetry (memory ring buffer now, Upstash/KV durable with one key). Zero-events is a legitimate state. REAL end-to-end.

**First-party AI-crawler capture pipeline**  
The mechanism that makes crawler telemetry possible: every request is scanned at the edge, and hits from ~20 known AI bot user-agents are recorded without slowing the crawler.  
_Technical:_ proxy.ts (Next 16 Proxy at root) matches BOT_UA_PATTERNS, event.waitUntil non-blocking POST to /api/ingest. lib/bots.ts catalog (crawler vs assistant-fetch, operator, platform), lib/telemetry/{index,kv,memory,pipeline,types}. Dedupe via seen keys, MAX_EVENTS retention. REAL, verified.

**Provider integration layer (activation surface)**  
Settings › Integrations lists every AI provider lane with the exact env var to set, what it powers, cost, live connected/not-connected status, and a real Test-connection button that makes one provider call.  
_Technical:_ app/(dash)/app/settings/integrations/{page.tsx,TestButton,ScoringPreview} + lib/providers/{registry,types,perplexity,openai,anthropic,gemini,dataforseo}. providerStatuses reads env server-side (secrets never sent to client); TestButton→/api/integrations/test makes a real sample() call when configured. SCAFFOLDING that activates with keys (clients written against documented endpoints, unverified without a live key per HANDOFF).

**Live scoring-engine preview**  
On the Integrations screen, a panel proving the metric math is real: it computes visibility/share-of-voice/citation metrics from actual sampler runs, or a synthetic example when none exist yet.  
_Technical:_ settings/integrations/ScoringPreview.tsx → app/api/scoring/preview/route.ts → lib/scoring/index.ts (exact lib/metrics.ts formulas: position_weight 0.5^(rank-1), platform weighting) over lib/sampler/store runs or SYNTHETIC. REAL, runs today with no keys.

**Nightly sampler + cron endpoint**  
The engine that would populate the dashboards: runs every tracked prompt against every configured provider, normalizes answers + citations, and stores runs — safe to schedule because it no-ops without keys.  
_Technical:_ lib/sampler/{run.ts,store.ts} (DEFAULT_PROMPTS, reads db prompts), app/api/runs/execute/route.ts armed by CRON_SECRET (vercel.json cron). Answer store mirrors telemetry (memory→Upstash/KV). SCAFFOLDING that activates with keys.

**Settings › Leads (real capture pipeline)**  
Captured demo/snapshot/signup leads plus a waitlist funnel (views, signups, conversion by source), read from the same store the marketing forms write to.  
_Technical:_ app/(dash)/app/settings/leads/{page.tsx,LeadsTable.tsx} reads /api/lead + /api/waitlist/view. app/api/lead/route.ts persists via lib/db/entities createLead (validated, capped; optional Resend email with RESEND_API_KEY). REAL (in-memory now, durable with KV; 'durable' badge reflects store).

**Account system (auth) backing the app**  
A complete scrypt-hashed account system (signup/login/session/logout) that exists and is exercised, ready to govern the dashboard.  
_Technical:_ lib/auth/index.ts (scryptSync, timingSafeEqual, opaque 30-day sessions) + app/api/auth/{signup,login,me,logout} + lib/db/entities (workspaces/users/sessions, tenant-scoped). REAL and end-to-end tested; not yet the /app gate (documented last-mile). Security review advised.

**Persistence layer (backend-agnostic)**  
A generic document store underpinning prompts, actions, leads, users and sessions that works in-memory today and becomes durable/shared with a single storage key.  
_Technical:_ lib/db/index.ts (Db interface, MemoryDb + KV/Upstash auto-select via readKvEnv) + lib/db/entities.ts (typed workspaceId-scoped records). REAL; Postgres drops into the same interface without touching callers.

**Settings — Brand & competitors**  
The workspace's tracked brand, aliases and competitor set configuration.  
_Technical:_ app/(dash)/app/settings/page.tsx + SettingsRail + DemoControls (chips, toggles, honest save toast). FIXTURE config UI.

**Settings — Workspace, Platforms, Data quality**  
Workspace preferences; per-platform enable/pause toggles that scope scoring; and data-quality controls (citation domain tagging owned/competitor/community, calibration).  
_Technical:_ app/(dash)/app/settings/{workspace,platforms,data-quality}/page.tsx. DemoControls Toggle/SelectField (real flip + honest toast); data-quality + platforms export CSV (TAG_ROWS/exportWindow states 'settings, not a window'). Gemini un-paused per audit. FIXTURE.

**Settings — Team, Notifications, API keys, Billing**  
Team roster with roles; notification/alert rules with cadence and channel; API-key inventory (masked, with the MCP server) and export; and a billing/usage/plan view (Scale plan, 412/1,000 prompts).  
_Technical:_ app/(dash)/app/settings/{team,alerts,api-keys,billing}/page.tsx. DemoControls toasts/toggles; alerts + api-keys export CSV with honest exportWindow; billing figures agree with the fixture story. FIXTURE.

**Design system & theming**  
A single cohesive dark visual language across all 36 screens — consistent cards, tables, tokens, row-hover, badges and typography — converted pixel-faithfully from a 1440px design canvas.  
_Technical:_ CSS variables (--bg0/1/2,--brd,--ac,--mut,--tx,--fnt,--good,--bad,--gold), per-cluster page.css, components/ui primitives (FilterPill, Hint, BrandIcon via simple-icons, ExportButton, Sparkline). Screens ported verbatim from canvas frames (comments cite frame ids). REAL.

**Real-vs-fixture honesty discipline (product-wide)**  
Throughout the dashboard, every inert control states what it would do on a live workspace and every export names its true window, so a buyer's diligence sees exactly what is real (telemetry, leads, scoring, auth, write paths, export) versus what runs on the realistic Nike demo workspace.  
_Technical:_ Encoded in INTERACTIVITY_CONVENTIONS.md playbooks, inert FilterPill, DemoActionButton/ToastButton toasts, export window-notes, the /app/agents 'Demo data'→/app/live badge, and the /app/live 'Real data' badge. HANDOFF.md documents activation order. Deliberate DESIGN choice, verified in code.

---

## Backend, data engine & integrations

_43 features._

**Persistence layer — generic document store (memory + KV)**  
A single database abstraction that everything writes through. Runs in-process with zero setup, and silently upgrades to a durable, shared store the moment Redis credentials exist — no code change.  
_Technical:_ lib/db/index.ts. Defines a `Db` interface (list/get/put/remove over named JSON collections). `MemoryDb` is a Map-of-Maps ring; `KvDb` speaks the Upstash REST `/pipeline` protocol via plain fetch using HSET/HGET/HVALS/HDEL. `db()` picks KvDb when `readKvEnv()` finds KV_REST_API_* or UPSTASH_REDIS_REST_* env, else MemoryDb; result cached. `newId(prefix)` mints ids. REAL and working today (memory path); the durable path is real code that activates-with-keys. Deliberately backend-agnostic so Postgres can be dropped in behind the same interface.

**Domain entities + typed accessors**  
The actual data tables of the product — workspaces, users, sessions, tracked prompts, action items, leads, and page-view events — each tenant-scoped where relevant.  
_Technical:_ lib/db/entities.ts. TypeScript interfaces (Workspace, User, Session, TrackedPrompt, ActionItem, Lead, ViewEvent) plus CRUD helpers: createLead/listLeads, recordView/listViews, addPrompt/listPrompts (filtered by workspaceId), createAction/listActions (workspaceId-scoped, status defaults todo), findUserByEmail/putUser, putSession/getSession/deleteSession. All persist through lib/db. REAL; multi-tenancy is threaded via workspaceId on every tenant record though the app currently uses a single 'demo' workspace.

**Authentication core — scrypt hashing + opaque sessions**  
A complete, from-scratch account system: password signup, login, session issuance, and logout, with securely hashed passwords. Runs today with no external identity provider or keys.  
_Technical:_ lib/auth/index.ts. Uses node:crypto only — hashPassword() = scrypt with 16-byte random salt, 64-byte key, stored as `scrypt$salt$key`; verifyPassword() recomputes and compares with timingSafeEqual (constant-time). signup() validates email/≥8-char password, rejects duplicates, creates User (with new workspace) + Session; login() verifies and creates a session; createSession() mints a 32-byte base64url token, 30-day TTL; sessionUser() looks up + rejects expired; logout() deletes the session. sessionCookie() returns httpOnly/lax/secure cookie opts. REAL and working; wired to /api/auth/* routes. Comment notes a security review is warranted before production and that it does not yet replace the demo gate at the edge.

**Auth route — signup**  
Create a real account with email + password; returns the user and sets a session cookie.  
_Technical:_ app/api/auth/signup/route.ts (POST, nodejs, force-dynamic). Parses JSON, calls lib/auth signup(); on success sets sessionCookie() and returns id/email/name/workspaceId; 400 on validation failure. REAL.

**Auth route — login**  
Sign in with email + password; sets a session cookie on success.  
_Technical:_ app/api/auth/login/route.ts (POST). Calls lib/auth login(); 401 with a deliberately vague message on mismatch; sets session cookie on success. REAL.

**Auth route — me (session identity)**  
Returns the currently signed-in user, or 401 if the session is missing/expired.  
_Technical:_ app/api/auth/me/route.ts (GET). Reads AUTH_COOKIE, calls sessionUser(); returns authenticated flag + user summary. REAL.

**Auth route — logout**  
Signs the user out and clears the session cookie.  
_Technical:_ app/api/auth/logout/route.ts (POST). Calls logout() to delete the session record, then expires AUTH_COOKIE (maxAge 0). REAL.

**Demo access gate (shared passphrase)**  
A single shared passphrase that keeps the dashboard un-browsable and un-indexable while leaving the marketing site public. Explicitly NOT authentication — no accounts.  
_Technical:_ lib/gate.ts. GATE_COOKIE constant, DEMO_EMAIL='dana@nike.com', demoPassword() from DEMO_PASSWORD env (fallback 'answr-demo'), gateToken() = base64url of `answr:<passphrase>` so rotating the passphrase invalidates stale cookies, isUnlocked() compares, isGated() protects /app*. Also exports SESSION_COOKIE name in this edge-safe (no node imports) module so proxy and lib/auth share it. REAL/working.

**Demo gate sign-in/sign-out route**  
Server-side verification of the demo passphrase; sets or clears the gate cookie. Fixes an earlier build that compared the passphrase in the browser.  
_Technical:_ app/api/session/route.ts. POST checks email===DEMO_EMAIL && password===demoPassword() server-side, sets httpOnly/lax/secure gate cookie (30-day maxAge); one vague error for both fields. DELETE clears it (used by the account menu Log out). REAL.

**Edge proxy — AI-crawler capture + /app access control**  
Runs on every request. Detects AI crawlers by user-agent and logs them without slowing the response, and blocks /app for anyone without the demo passphrase or an account session.  
_Technical:_ proxy.ts (Next 16 Proxy/middleware, project root). Matches UA against a 21-entry BOT_UA_PATTERNS list; on hit fires a non-blocking POST to /api/ingest wrapped in event.waitUntil() (so serverless doesn't tear down mid-flight), forwarding ua/path and an optional x-answr-probe idempotency id. Gate: for isGated() paths, redirects to /login?next=… unless the demo cookie (isUnlocked) or a session cookie is present (presence-only — the edge can't hit the DB). matcher excludes _next static, /api/ingest (no recursion), favicon, snippet.js. REAL/working. Note: UA list is duplicated from lib/bots.ts (documented drift risk).

**Server-side dashboard layout guard**  
The real access check behind /app: unlike the edge's presence-only check, this validates the account session against the database and bounces invalid/expired sessions to login.  
_Technical:_ app/(dash)/app/layout.tsx (server component). Reads cookies; grants if isUnlocked(demo cookie) OR sessionUser(AUTH_COOKIE) resolves a live user, else redirect('/login'). Mounts FilterProvider + shell. REAL. This is the node-runtime half of the two-layer gate the auth module references.

**Scoring engine**  
Turns sampled AI answers into the headline metrics — visibility score, share of voice, citation and ranking numbers — with the exact published formulas. This is the step that replaces fixture dashboards with real numbers once the sampler runs.  
_Technical:_ lib/scoring/index.ts. Pure functions over PromptRun[]. visibility_score = Σ(present × 0.5^(rank-1) × platformWeight) ÷ Σ(platformWeight), ×100; share_of_voice = brandMentions ÷ (brand + Σ competitor mentions); plus platformAppearances, citationsCount, uniqueCitedDomains, ownedCitationShare (brandDomain suffix match), answersWithCitationRate, avgAnswerPosition, answerRankFirst. Word-bounded case-insensitive regex matching; brandRank counts earlier-mentioned competitors; domainOf strips www. REAL and unit-testable today; needs no keys — feed it runs and it scores.

**Scoring preview route (works with zero keys)**  
Demonstrates the scoring math live: scores real sampler runs if any exist, otherwise scores a built-in synthetic Nike-vs-competitors example so a buyer sees the engine work immediately.  
_Technical:_ app/api/scoring/preview/route.ts (GET, gated by demo cookie). Reads answerStore().recentRuns(200); if empty, uses a 2-prompt SYNTHETIC fixture (perplexity/gemini/anthropic answers with citations); calls scoreRuns() with brand Nike + competitor set; returns source flag ('sampler-runs'|'synthetic-example'), runsScored, scores. REAL engine on real-or-fixture input.

**Nightly sampler (the engine core)**  
Runs every tracked prompt against every configured AI provider, normalizes answers + citations, and stores one record per prompt — the raw material the scoring engine consumes. Harmless to schedule with no keys.  
_Technical:_ lib/sampler/run.ts. runSampler(): gathers configuredProviders(); if none, returns {ok:false, reason:'no-providers'}. Prompt source priority: explicit arg → listPrompts('demo') persisted set → DEFAULT_PROMPTS smoke-test trio. For each prompt, Promise.all over providers via sampleOne() (catches per-provider errors into a SampledAnswer.error), builds a PromptRun with a deterministic runId hash, saveRun(). Returns SamplerReport (providers, store kind/durable, prompts/runs/answers/errors). REAL orchestration; produces real data once ≥1 provider key is set (scaffolding-that-activates-with-keys for live output).

**Answer store (memory + KV)**  
Durable landing zone where the sampler writes collected answers; readable by the scoring preview and future readers.  
_Technical:_ lib/sampler/store.ts. AnswerStore interface (saveRun/recentRuns). MemoryAnswerStore is an unshift-capped list (MAX_RUNS 500); KvAnswerStore uses Upstash REST LPUSH+LTRIM / LRANGE against key answr:sampler:runs. answerStore() selects KV when readKvEnv() succeeds (same env family as telemetry), else memory; cached. REAL; durable path activates-with-keys.

**Sampler trigger route + Vercel Cron**  
The scheduled endpoint that runs the nightly sample. Guarded so it can never spend provider credits unless a secret is configured and presented; with no secret it just reports readiness.  
_Technical:_ app/api/runs/execute/route.ts (GET for Vercel Cron, POST for manual). readSecret() = CRON_SECRET (or ANSWR_INGEST_SECRET fallback); presented() parses `Authorization: Bearer` or x-cron-secret. No secret → {ok:false, reason:'no-secret'} plus provider readiness; wrong secret → 401; else runSampler(). vercel.json schedules it at '0 7 * * *' (daily 07:00). REAL; safe-by-construction.

**Provider abstraction + fetch/error plumbing**  
A uniform contract for every AI answer engine so adding a provider is one file; each declares its env keys, what metrics it powers, cost, and docs, and reports whether it is configured without ever throwing when a key is missing.  
_Technical:_ lib/providers/types.ts. AnswerProvider interface (id/label/blurb/envVars/powers/docsUrl/pilotCost/isConfigured/sample). ProviderError class; postJson() helper does JSON POST with AbortController timeout (default 30s), uniform error surfacing, text-then-JSON parse; envVar() trims env reads. REAL.

**Provider client — Perplexity Sonar**  
Primary answer-sampling lane; same engine as the consumer product, returns native citations.  
_Technical:_ lib/providers/perplexity.ts. POST api.perplexity.ai/chat/completions (OpenAI-compatible), model 'sonar' (PERPLEXITY_MODEL override), Bearer PERPLEXITY_API_KEY. Parses choices[].message.content + merges citations[] and search_results[] (deduped). Powers visibility_score, share_of_voice, platform_appearances, avg_answer_position, citations_count. Scaffolding-that-activates-with-key; targets documented endpoint, needs live key to verify.

**Provider client — OpenAI (ChatGPT)**  
ChatGPT answer lane via the Responses API with web search.  
_Technical:_ lib/providers/openai.ts. POST api.openai.com/v1/responses, model 'gpt-4o' (OPENAI_MODEL override), tools:[{type:'web_search'}], Bearer OPENAI_API_KEY. extract() reads output_text and/or output[].content[].text, collects url_citation annotations (deduped). Activates-with-key.

**Provider client — Anthropic (Claude)**  
Claude answer lane plus cheap Haiku sentiment classification; best-structured citations of the set.  
_Technical:_ lib/providers/anthropic.ts. POST api.anthropic.com/v1/messages, x-api-key, anthropic-version 2023-06-01, default model claude-haiku-4-5-20251001, tools:[web_search_20250305 max_uses 5], max_tokens 1024. extract() concatenates text blocks + collects block.citations (deduped). Powers ...+sentiment_mix. Activates-with-key.

**Provider client — Google Gemini**  
Grounded Gemini lane, free at pilot volume, using Google Search grounding.  
_Technical:_ lib/providers/gemini.ts. POST generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key=…, default gemini-2.5-flash, tools:[{google_search:{}}]. Joins candidate parts text; citations from groundingMetadata.groundingChunks[].web.uri (deduped). Key passed as query param (GEMINI_API_KEY). Activates-with-key.

**Provider client — DataForSEO (Google AI Overviews)**  
The only path to Google AI Overviews (no official Google API) plus a demand-volume prior; here sample(keyword) returns the AI Overview text and its structured references.  
_Technical:_ lib/providers/dataforseo.ts. POST api.dataforseo.com/v3/serp/google/organic/live/advanced, HTTP Basic (DATAFORSEO_LOGIN:DATAFORSEO_PASSWORD), body carries keyword, language_code, location_code (default 2840 US), load_async_ai_overview:true, 60s timeout. Parses tasks[0].result[0].items → ai_overview item → text + references (url/title/source, deduped). Powers shopping_visibility, region_visibility, demand_volume, citations_count. Activates-with-keys.

**Provider registry + status snapshot**  
Single source of truth for which AI lanes exist, what each powers, and whether the deployment holds the key — powering the Settings › Integrations page and the sampler's gating.  
_Technical:_ lib/providers/registry.ts. PROVIDERS array (perplexity, gemini, dataforseo, anthropic, openai); getProvider(id), configuredProviders(env), anyProviderConfigured(env), and providerStatuses() returning a CLIENT-SAFE snapshot (labels/booleans only, never secret values). REAL.

**Integrations connection-test route**  
Lets the operator confirm a pasted API key works by making one real, minimal provider call. Gated so it can't be used anonymously to spend a configured key.  
_Technical:_ app/api/integrations/test/route.ts (POST, gated by demo cookie). Resolves provider by id; if !isConfigured returns which env vars to set; else provider.sample('Give a one-sentence test answer.', 20s timeout) and returns model, citation count, 160-char preview; surfaces provider errors. REAL; the live call activates-with-key.

**First-party crawler-event ingest**  
The write endpoint for AI-crawler sightings, fed by the edge proxy on this deployment and by CDN log drains or the server package for customer sites.  
_Technical:_ app/api/ingest/route.ts (POST). Write guard sameOriginOrSecret() accepts same-origin (Origin/Referer host match) or a caller holding ANSWR_INGEST_SECRET (x-answr-secret / x-answr-ingest); the proxy's header-less same-process call is allowed only when no secret is required. identifyBot(ua) classifies; unknown UA → recorded:false. Awaited telemetry.addCrawler() with declared verification and optional idempotency id. REAL/working (audit-hardened against forged events).

**AI-referral capture (human side)**  
Records when a real person clicks through from an AI assistant, classified from referrer/utm. Counts are honestly framed as a floor (many assistant clicks arrive referrer-stripped).  
_Technical:_ app/api/collect/route.ts (POST, same sameOriginOrSecret guard). identifyReferral(referrer, utm) against known assistant hostnames/utm conventions; on match telemetry.addReferral() with via:'utm'|'referrer'. Fed by public/snippet.js. REAL.

**Client referral snippet**  
A one-line drop-in script any site can add to attribute assistant-driven visits — no cookies, no fingerprinting.  
_Technical:_ public/snippet.js. IIFE reads document.currentScript data-endpoint (default /api/collect); first-touch-per-tab via sessionStorage; posts referrer + utm_source + path via navigator.sendBeacon (keepalive fetch fallback); wrapped so it never breaks the host page. REAL. (Crawlers don't run JS — that's the proxy's job, stated in the file.)

**Telemetry store contract + pluggable backends**  
Where captured crawler and referral events live — real observed data, never fixtures — with a backend that swaps from in-memory to durable Redis automatically.  
_Technical:_ lib/telemetry/types.ts (CrawlerEvent, ReferralEvent, TelemetrySnapshot, TelemetryStore, MAX_EVENTS=500, DEDUPE_TTL_SECONDS=600). lib/telemetry/memory.ts MemoryStore = ring buffer with id-dedup. lib/telemetry/index.ts selects createKvStore() ?? MemoryStore and parks it on globalThis so dev hot-reloads don't wipe events. REAL.

**Durable telemetry store (Upstash Redis) with degraded fallback**  
Production-grade durable event storage that activates itself from env vars, dedups repeat events, and — if the Redis backend is unreachable — transparently serves this instance's local mirror while flagging the read as degraded (honesty panel).  
_Technical:_ lib/telemetry/kv.ts. KvStore over Upstash REST /pipeline (Bearer). Two capped lists (answr:telemetry:crawlers/referrals, LPUSH+LTRIM 0 499), SET…NX 'since', SET…NX EX 600 idempotency claims. addCrawler mirrors locally first, claims id, pushes; snapshot() reverses to oldest→newest and on error returns the mirror with a `degraded` message. readKvEnv() reads KV_REST_API_* or UPSTASH_REDIS_REST_*. REAL; durable path activates-with-keys.

**Telemetry summary read route + aggregation**  
The read side that powers the live crawler dashboard: totals, per-bot and per-path and per-source breakdowns, and recent events, plus which backend answered (durable vs memory).  
_Technical:_ app/api/telemetry/route.ts (GET) → summarize() in lib/telemetry/index.ts. Aggregates snapshot into crawlerEvents, uniqueAgents, pagesCrawled, referrals, byBot (sorted), byPath (top 12), bySource, recent (last 25 reversed), and store honesty {kind,label,durable,degraded}. REAL.

**On-demand pipeline proof (test-hit)**  
A button that proves the capture pipeline works end-to-end by making this deployment fetch its own /pricing with a GPTBot user-agent and showing the resulting event — nothing fabricated; if the fetch fails, nothing is recorded.  
_Technical:_ app/api/telemetry/test-hit/route.ts (POST). Builds target from the request's own origin (no SSRF surface), stamps an idempotency id + x-answr-probe, fetches with GPTBot UA; polls telemetry.snapshot() with backoff [120,220,350,500]ms for the proxy's copy, and if not seen writes its own copy (same id → dedup, never double-count). Returns real HTTP status, observedVia ('proxy'|'route'), elapsedMs, and a fresh summary. REAL/working.

**AI bot + referral catalog**  
The knowledge base that classifies traffic: 21 AI crawler/assistant user-agents (with operator and platform rollup) and 6 assistant referral sources.  
_Technical:_ lib/bots.ts. BOTS[] (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, bingbot, Bytespider, etc.; kind crawler|assistant-fetch; platform rollup). identifyBot() matches longest-UA-first (so Claude-SearchBot beats ClaudeBot). AI_REFERRERS[] (ChatGPT, Perplexity, Gemini, Claude, Copilot, Grok) with host + utm lists; identifyReferral() matches host then utm. UA matching is treated as 'declared'; IP-range 'verified' checks are a documented separate job. REAL classification logic; verification tier is scaffolding.

**Pipeline facts (zero-fixture substance)**  
Build-time-derived facts about the capture pipeline so the live screen has real substance even at zero events, without inventing any traffic.  
_Technical:_ lib/telemetry/pipeline.ts. PIPELINE counts derived from lib/bots.ts (uaPatterns, operators, crawler vs assistant patterns, referralSources) + MAX_EVENTS retention + 10s refresh; PIPELINE_STEPS (Request→proxy.ts→/api/ingest→TelemetryStore→/api/telemetry); EVENT_FIELDS. REAL, derived not fabricated.

**Metrics dictionary (31 metrics)**  
The single source of truth for what every dashboard number means, where its real production data comes from, and exactly how it's computed — surfaced as the ⓘ provenance tooltip on every KPI.  
_Technical:_ lib/metrics.ts. METRICS object with 31 typed MetricDef entries (label/plain/definition/source/calculation/cadence/unit): visibility_score, share_of_voice, citations_count, owned_citation_share, avg_answer_position, answer_rank_first, topic_visibility, region_visibility, audience_visibility, sentiment_mix, shopping_visibility, cited_source_count, prompts_tracked, conversation_mentions, demand_volume, action_score, impact_estimate, projected_visibility, measured_lift, crawler_events, ai_referrals, page_health, content_score, platform_appearances, unique_cited_domains, answers_with_citation_rate, actions_queue, unique_agents, pages_crawled, page_speed, data_quality_sample. tools/gen-metrics-doc.mjs regex-generates METRICS.md from it. REAL as the definition/provenance layer; the scoring engine currently implements the visibility/SoV/citation family, the rest are specified for wiring.

**Executive CSV report engine**  
Every Export button produces a VP-readable report (titled header block, executive summary with deltas and plain-English reads, detail sections, source footnotes) — never a bare table dump.  
_Technical:_ lib/export/report.ts. Types ReportSpec/ReportSection/SummaryStat; buildExecutiveCsv() emits header (brand/window/generated/source), EXECUTIVE SUMMARY, detail sections, NOTES; normalizes arrow glyphs ↑/↓/▲/▼ to +/- for spreadsheets and turns a lone em/en dash into an empty cell (NO_CHANGE regex, carefully scoped). wrapRows() wraps legacy bare tables in the same envelope. REAL.

**Per-module report builders**  
Screen-specific report composers (overview, sentiment, and a generic topic/region/audience/shopping builder) so an export tells the whole story of a screen — headline metrics, the trend behind them, and every supporting table.  
_Technical:_ lib/export/reports.ts. seriesSection() turns chart TrendSeries into a dated table; sentimentReport(), overviewReport(), moduleReport() each return a ReportSpec fed by the screen's own rendered facts (no second source of truth). WINDOW_30D constant. REAL.

**Report window-honesty stamp**  
Keeps downloaded CSVs from lying about their time window: if the on-screen filter differs from the fixed sample the file ships, it stamps a 'Note on window' row saying the filter is not applied.  
_Technical:_ lib/export/active-window.ts. activeFilterLabel(), windowNote(), withWindowNote() (no-op at defaults), windowToastSuffix() for the download toast; reads DEFAULT_RANGE/DEFAULT_PLATFORM from lib/filters/windows. REAL.

**Filter/window engine (honest multi-window derivation)**  
Makes the date-range (7d/30d/90d/YTD) and platform pills actually re-slice the data instead of apologizing, while guaranteeing the last-30-days view is byte-for-byte the shipped fixture and today's numbers never move.  
_Technical:_ lib/filters/windows.ts. RANGES/PLATFORMS models; extendLevel() prepends deterministic back-history from the fixture's own damped slope + AR(1) wobble (seeded mulberry32 PRNG → identical server/client), extendCount() preserves weekday shape and scales the prior block to hit a published delta exactly, accrued()/accruedStat() handle distinct-entity counts on a saturating curve. Plus level/count/distinct KPI stats, delta formatting (± when flat), windowAxis() nice-axis, day/week labels, axisTicks(). REAL deterministic math over demo fixtures (this is the demo's fixture-windowing engine, not live sampled data).

**Filter provider (client state)**  
Holds the active range + platform selection so it survives navigation between dashboard screens.  
_Technical:_ lib/filters/context.tsx. FilterProvider (mounted once in the dash layout) + useFilters() hook that falls back to shipped defaults with no-op setters outside the provider (so components reuse safely on marketing pages/tests). REAL.

**Tracked-prompts write/read route**  
Persists the prompts a workspace tracks and feeds them to the sampler; lists them back.  
_Technical:_ app/api/prompts/route.ts (gated by demo cookie). POST accepts up to 500 prompts (trimmed, capped 400 chars each), addPrompt('demo', …); GET listPrompts('demo'). Returns durable flag from db(). REAL; consumed by lib/sampler/run.ts prompt-source priority.

**Action-items write/read route**  
Persists action items created from prompts/insights (title/impact/effort) and lists them.  
_Technical:_ app/api/actions/route.ts (gated). POST validates + caps fields, createAction('demo', …) with status 'todo'; GET listActions('demo') with count. Returns db().durable. REAL.

**Lead capture + email notification**  
The endpoint every marketing form (demo, snapshot, handbook, signup, waitlist) posts to; validates and caps input, persists the lead, and optionally emails a notification. Public by design; owner-only read.  
_Technical:_ app/api/lead/route.ts. POST accepts email and/or company/domain (email regex-validated), captures name/company/source/message + attribution (utmSource/utmCampaign/referrer), createLead(); fire-and-forget notify() posts to Resend API only when RESEND_API_KEY + LEAD_NOTIFY_EMAIL are set (from LEAD_FROM_EMAIL or leads@useanswr.com). GET is demo-cookie-gated, returns leads newest-first + durable flag. REAL capture/persist; email is scaffolding-that-activates-with-keys.

**Waitlist funnel analytics**  
Privacy-safe, first-party funnel: records page views and reports views, signups, conversion rate, and a per-source (utm/referrer) breakdown so a campaign sees which channel converted. No cookies, no cross-site tracking.  
_Technical:_ app/api/waitlist/view/route.ts. POST recordView('waitlist', source) (public, called on page load). GET (demo-cookie-gated) joins listViews() + listLeads() where source==='waitlist', buckets by source (utmSource||referrer, default 'direct'), computes conversion percentages and a sorted bySource array. REAL.

---

## Platform engineering & cross-cutting qualities

_25 features._

**Design token system (CSS custom properties)**  
A single named palette drives every color, surface, and accent across the whole product (marketing site, dashboard, auth) so the look is consistent and re-themeable from one place.  
_Technical:_ app/globals.css defines ~20 root CSS variables: accent (--ac / --ac-hover), three surface grounds (--bg0 frame, --bg1 card, --bg2 raised) plus --page canvas, border (--brd), a three-step text ramp (--tx / --mut / --fnt), and semantic hues (--good, --bad, --info, --gold, --gold2, --violet). Consumed via var() by both inline-styled marketing frames and dashboard components. Real/working. Note several values carry inline comments recording verified WCAG contrast fixes (e.g. --fnt raised from 3.35:1 to 4.85:1 on card).

**Committed dark theme (not a light/dark toggle)**  
The app ships one polished dark theme everywhere; there is no user-facing light mode or theme switcher.  
_Technical:_ Tokens are defined only on bare :root with dark values; there is no @media (prefers-color-scheme) or [data-theme] override block, and html/body paint --page explicitly. The OG card and all shells assume dark. Real/working, but single-theme by design — a buyer expecting a light-mode variant would have to build it (add a token override layer). Honest characterization: dark-committed, not dual-theme.

**Reusable interaction/utility classes**  
Shared hover, focus, and button treatments so every clickable surface behaves and animates the same way.  
_Technical:_ app/globals.css ships canonical classes: .btn-ac (accessible primary button — dark label on accent, lift+shadow on hover), .row-hover / .card-hover (table vs card-row hover), .cta-pill, .dd-item, .nav-item[data-active], and .skip-link. Transitions are all short (0.12–0.15s ease). Real/working.

**UI component library (components/ui/**)**  
A small set of shared building blocks used across screens: brand logos, export buttons, filter pills, tooltips, sparklines, toasts, and demo-action buttons.  
_Technical:_ components/ui/: BrandIcon (real logos from simple-icons CC0 set, with a documented coverage gap list), DemoActionButton (honest no-op toast button), ExportButton + ReportCsvButton (real CSV export via lib/export/report.ts), FilterPill (useId-based, ARIA), Hint (portal-rendered plain-language tooltip that flips when short on space), Sparkline (re-slices with date range), Toaster (window-event driven, role=status, single toast). All real/working.

**App shell + chart component set (components/app/**)**  
The dashboard frame — sidebar, topbar, command palette, account menu, KPI cards, metric-provenance popovers, region map, and responsive charts.  
_Technical:_ components/app/: Sidebar/Topbar/AccountMenu/CommandK/KpiCard/MetricInfo/WhatsNew/BrandSwitcher/AddBrandModal/SupportChat/Overlays/SmallScreenGate/RegionMap, plus charts/ (BarChart, TrendChart — ResizeObserver-backed, useId gradient ids; also RegionMap and demand KeywordCharts). Real/working shell; some controls (⌘K palette, per READINESS audit) are non-functional props.

**Marketing responsive layer (attribute-selector CSS)**  
The pixel-faithful 1440px marketing pages collapse gracefully to tablet and phone without rewriting each page.  
_Technical:_ components/marketing/marketing.css (300 lines) drives entirely off inline-style attribute selectors scoped to .mkt, with two breakpoints (900px nav→hamburger + column stacking + type clamps; 600px phone tightening). Documents its own invariants (every rule inside a max-width query, matches both React server and browser style serializations, wide tables/code scroll in their own box). Real/working; deliberately avoids touching desktop by construction.

**Dashboard small-screen gate + sidebar states**  
Opening the desktop-first dashboard on a phone shows a deliberate interstitial instead of a broken sideways layout; sidebar rows have proper hover/focus states.  
_Technical:_ components/app/SmallScreenGate.tsx + small-screen-gate.css: SSR-inlined display:none overlay revealed only under @media(max-width:899px) with !important, dismissed per-session via sessionStorage and a pre-parse inline BOOT script stamping data-answr-gate on <html> to avoid flash; role=dialog/aria-labelledby. sidebar.css adds nav-row hover/aria-current/focus-visible. dash-main becomes an overflow-x scroll container only under the mobile query. Real/working.

**TypeScript strict type-safety + clean build**  
The entire codebase type-checks with no errors and builds cleanly — a signal of maintainability for a buyer's engineers.  
_Technical:_ tsconfig.json has strict:true, noEmit, bundler resolution, @/* path alias; staging/ and tools/ excluded. Verified: npx tsc --noEmit exits 0. Codebase is 73 page.tsx + 16 route.ts + 97 client components. READINESS.md records npm run build clean at 71 static pages, ~2.2MB static, 224KB largest chunk, no page.tsx as a client component. Real/verified this session.

**Honesty layer (~110 demo-vs-live controls)**  
Every control that cannot do real work in the demo says so plainly (e.g. 'runs on a live workspace') instead of faking success or failing silently — the disclosure discipline that makes the demo trustworthy to buyers.  
_Technical:_ lib/toast.ts (window CustomEvent) + components/ui/DemoActionButton + inline onClick toasts across the dashboard. Measured 109 controls carrying explicit live-workspace copy; READINESS.md §5 documents '~110 controls' and 'zero dead controls' (verified across 158 onClick sites). Real/working pattern. Caveat per audit: a few silent dead controls (⌘K, prompts search) and six over-claiming toasts were flagged as exceptions.

**Accessibility — landmarks, skip link, focus, motion**  
Keyboard and screen-reader basics: a skip-to-content link, one main landmark per shell, visible focus rings, and full respect for reduced-motion preferences.  
_Technical:_ globals.css .skip-link (visually hidden until focus) targets <main id="main"> present in all three route-group layouts ((dash), (marketing), (auth)); focus-visible 2px accent ring on all interactive selectors; @media(prefers-reduced-motion:reduce) zeroes transitions/animations globally. Real/working.

**Accessibility — ARIA + modal/dialog semantics**  
Interactive widgets expose roles and states to assistive tech; every dialog is a proper modal with Escape and backdrop close.  
_Technical:_ Counted usage: 74 aria-label, 21 aria-pressed, 16 aria-expanded, 14 aria-checked, 11 aria-haspopup, 9 aria-modal, plus roles dialog(12)/alert(9)/status(8)/checkbox(7)/menu/tooltip/switch/tab. useId in FilterPill and TrendChart. Real/working. Known gap (READINESS finding #24): the MetricInfo/Hint provenance tooltips are largely unreachable by AT (aria-describedby appears once) and use hover geometry that fails WCAG 1.4.13 — flagged, not yet fixed.

**SEO & social metadata**  
The public site is fully crawlable and indexable with rich link previews, titles, canonical URLs, robots rules, and a sitemap.  
_Technical:_ app/layout.tsx sets metadataBase, title template, description, keywords, canonical, OpenGraph + Twitter summary_large_image, robots index/follow. app/robots.ts (allows marketing, disallows /app,/api,/login,/signup,/onboarding) and app/sitemap.ts (33 marketing routes, weekly/monthly changefreq) are native Next metadata routes. app/opengraph-image.tsx renders a branded 1200x630 card via next/og (nodejs runtime); pages carry per-route metadata. Real/working.

**Deploy pipeline — Vercel + GitHub auto-deploy**  
Push to GitHub and Vercel builds and ships it automatically; the project is already linked and live.  
_Technical:_ .vercel/project.json links project 'answr' (prj_/team_ ids); git remote origin is github.com:arman4322-sketch/answr on branch main. Deployed at useanswr.com / answr-ruby.vercel.app. .claude/launch.json defines a local dev server (npm run dev, port 3201). Real/working (live deployment).

**Scheduled sampler cron (vercel.json)**  
A nightly job is scheduled to run the answer-sampling pipeline automatically.  
_Technical:_ vercel.json declares a cron hitting /api/runs/execute daily at 07:00 UTC. The route (app/api/runs/execute/route.ts, nodejs runtime) is secret-gated: it only samples when CRON_SECRET (or ANSWR_INGEST_SECRET fallback) is set AND presented as Bearer auth — otherwise it returns a readiness report and never spends provider credits. Scaffolding-that-activates-with-keys: the schedule and guard are real; actual sampling requires provider keys (lib/providers/registry) + the secret.

**Node runtime pin**  
The build is pinned to a specific Node major so local, CI, and Vercel all run the same runtime.  
_Technical:_ .nvmrc = 22 and package.json engines.node = '22.x'. Real/working.

**Telemetry durability model (pluggable store)**  
Real observed crawler/referral events are captured and survive restarts once a durable backend is configured — with automatic, code-free upgrade from in-memory to Redis.  
_Technical:_ lib/telemetry/: a single TelemetryStore interface (kind/label/durable, addCrawler/addReferral/snapshot with idempotency return). MemoryStore = zero-dep 500-event ring buffer (works today, resets on cold start); KvStore = durable Upstash REST (LPUSH+LTRIM 0 499, SET NX for since, SET NX EX 600 idempotency claims, /pipeline fetch, no SDK). index.ts auto-selects KV when KV_REST_API_* or UPSTASH_REDIS_REST_* env pair is present else memory, and parks the store on globalThis to survive hot reloads. KvStore keeps a local mirror and returns a 'degraded' string when the backend is unreachable. Memory path real/working now; durable path is scaffolding-that-activates-with-keys, described as production-shaped in READINESS. summarize() aggregation is shared by /api/telemetry and /app/live.

**Generic persistence layer (lib/db)**  
A real document store underpins accounts, sessions, prompts, actions, and leads — in-memory today, durable Redis the moment env vars are set, swappable for Postgres later.  
_Technical:_ lib/db/index.ts defines a Db interface (list/get/put/remove) with MemoryDb and KvDb (Upstash HSET/HGET/HVALS/HDEL) implementations, auto-selected via readKvEnv (same pattern as telemetry) and cached. lib/db/entities.ts holds typed, workspaceId-scoped records (Workspace, User, Session, TrackedPrompt, ActionItem, Lead) — multi-tenancy threaded through the model. Memory real/working now; durable activates with KV keys. Documented as the answer to readiness blocker #1 (no persistence).

**Security — demo access gate**  
The dashboard is not browsable by URL or indexable; a shared passphrase unlocks it while the marketing site stays public.  
_Technical:_ lib/gate.ts: one shared passphrase (DEMO_PASSWORD env, fallback 'answr-demo'), verified server-side in app/api/session/route.ts, stored as an HTTP-only cookie whose value is base64url(answr:<pass>) so rotating the passphrase invalidates stale cookies. Vague single error message for both fields. Real/working. Explicitly documented as NOT authentication (no accounts, no per-user sessions).

**Security — edge proxy (gate + crawler capture)**  
Every request passes through one edge layer that both blocks unauthenticated dashboard access and observes AI crawlers that JavaScript can never see.  
_Technical:_ proxy.ts (Next 16 Proxy at repo root, matcher excludes _next static/image, /api/ingest, favicon, snippet.js): matches UA against a ~21-pattern AI-bot list (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, bingbot, meta-externalagent, Bytespider, Amazonbot, CCBot, etc.) and fires a non-blocking event.waitUntil() POST to /api/ingest on a hit; gates /app on either the demo cookie (isUnlocked) or presence of the session cookie, redirecting to /login otherwise. Non-bot traffic costs one string scan. Real/working (verified end-to-end in READINESS: observedVia proxy, recorded true).

**Security — ingest endpoint hardening**  
The public capture endpoints can't be spoofed with forged crawler/referral events.  
_Technical:_ app/api/ingest/route.ts and app/api/collect/route.ts share a sameOriginOrSecret guard: accept only same-origin (Origin/Referer host match) or a caller presenting ANSWR_INGEST_SECRET; the proxy's server-side fetch (no Origin/Referer) is allowed only when no secret is required. Payloads are clamped (path.slice(0,200), id.slice(0,64)), JSON parse is try/caught, and UA is classified via lib/bots before recording. Added in response to an audit that forged events. Real/working.

**Security — real account auth primitives + session cookies**  
A complete, security-hardened signup/login/session/logout system exists and runs today, ready to switch on.  
_Technical:_ lib/auth/index.ts: scrypt password hashing via node:crypto (no dependency), timingSafeEqual verification, 16-byte salts, opaque 32-byte base64url session tokens, 30-day TTL, records persisted through lib/db. sessionCookie() and gate's session cookie are httpOnly, sameSite:lax, secure in production, path:/. Exercised by app/api/auth/* routes. Real/working as a system, but deliberately NOT yet wired to the edge /app gate (documented final step: needs edge-verifiable JWT or node-runtime guard); a security review is advised before production.

**First-party referral capture snippet**  
A tiny, privacy-respecting script on the site records when visitors arrive from AI assistants.  
_Technical:_ public/snippet.js (~1KB), loaded deferred in app/layout.tsx with data-endpoint=/api/collect; cookieless, sendBeacon, session-deduped, reports document.referrer + utm_source, classified server-side against lib/bots' AI-referrer table. Counts are labeled a floor in-product (many assistant clicks strip the referrer). Real/working.

**Documentation set (buyer + engineering)**  
An unusually thorough paper trail: how to activate the product, what every metric means, what's real vs. fixture, integration economics, and the sale materials.  
_Technical:_ ~17 markdown docs at repo root. Activation/diligence: HANDOFF.md (buyer activation order), READINESS.md (392 lines, six-audit synthesis of what remains), AUDIT_FINDINGS.md (1230 lines) + AUDIT_PROMPT.md, COST_SPLIT.md (what needs budget). Product spec: METRICS.md (31-metric dictionary, generated from lib/metrics.ts by tools/gen-metrics-doc.mjs), INTEGRATIONS.md (365-line per-metric real-data plan with now/needs-key/needs-contract/build-required tags). Build discipline: BUILD_CONVENTIONS, WIRING_CONVENTIONS, INTERACTIVITY_CONVENTIONS, REBRAND_MAP, AGENTS.md. Go-to-market: SALE_LISTING, LISTING_KIT, GROWTH, OUTREACH_DRAFTS. Real/comprehensive. Note README.md is still the create-next-app default.

**Build tooling (canvas→route converter, metrics doc gen)**  
Custom scripts that turned design-canvas frames into real routes and keep the metrics doc in sync with code.  
_Technical:_ tools/: convert.mjs (257 lines — extracts frames from .dc.html canvases into staging/<canvas>/<frame>.tsx + .css, rewrites anchors to routes), routes.mjs (frame-id→Next route map), gen-metrics-doc.mjs (regex-parses lib/metrics.ts into METRICS.md). staging/ retains the source frames. Real/working (excluded from tsc/build).

**Tech stack + lean dependency footprint**  
Modern, current framework versions with a deliberately tiny dependency surface — low maintenance and audit burden for a buyer.  
_Technical:_ Next.js 16.3.0 (App Router, route groups, native Proxy/metadata/OG), React 19.2, Tailwind CSS v4 via @tailwindcss/postcss, TypeScript 5. Only 8 production dependencies (next, react, react-dom, d3-geo + @types, topojson-client, world-atlas for the region map, simple-icons for brand logos) and 7 devDeps; 111 total resolved packages in package-lock. Inter loaded via next/font/google (self-hosted, --font-inter variable). Real/working.

---

## Summary

Answr is a large, coherent, type-clean codebase implementing a full AEO platform end to end: a complete
public marketing site, a 36-screen analytics dashboard with a real export and filtering engine, a genuinely
working first-party AI-crawler telemetry pipeline, and a real backend engine (persistence, scrypt
authentication, answer-scoring, a nightly sampler, provider integration clients, and lead capture) built to
activate with credentials. The analytics dashboard runs on a curated demo workspace today and becomes live
per-customer data once providers and a durable store are connected — the scaffolding for which is already
in place and documented in HANDOFF.md.