import type { ReportSpec } from "@/lib/export/report";
import { WINDOW_30D, seriesSection } from "@/lib/export/reports";
import { METRICS } from "@/lib/metrics";
import { analyticsComparisonSeries, crawlerActivitySeries, infraDays, referredHumansSeries } from "@/lib/data/infra";

/* Agent Analytics → executive CSVs.

   Crawlers, Referrals, the GPTBot detail and Live logs each export the whole
   screen: headline metrics with deltas and a plain-English read, the daily
   series behind them as a dated table, every supporting table, and footnotes
   naming the log pipeline the numbers come from. */

const FOOTNOTE_CRAWLERS =
  "Source: server-side crawler-event ingestion (CDN/edge log drain — Cloudflare, Fastly, Vercel — or the 1-line snippet). Bots are verified by user-agent plus published IP-range reverse-DNS, so spoofed traffic is excluded.";
const FOOTNOTE_REFERRALS =
  "Source: referrer headers and link-decoration params captured by the tracking snippet (chatgpt.com, perplexity.ai, gemini.google.com referrers; utm_source=chatgpt.com-style tags).";
const FOOTNOTE_METRICS = "Full metric definitions: METRICS.md, or the ⓘ beside each figure in-app.";

/* ---------------------------------------------------------------- crawlers */

export const agentsSpec: ReportSpec = {
  module: "Agent Analytics · Crawlers",
  brand: "Nike",
  window: WINDOW_30D,
  summary: [
    {
      label: METRICS.crawler_events.label,
      value: "48,231 requests",
      delta: "+18%",
      note: `${METRICS.crawler_events.plain}. Across nike.com, from 14 verified AI crawlers.`,
    },
    {
      label: METRICS.unique_agents.label,
      value: "14",
      delta: "+2",
      note: `${METRICS.unique_agents.plain}. Two new operators started crawling this window.`,
    },
    {
      label: METRICS.pages_crawled.label,
      value: "1,846",
      delta: "+214",
      note: `${METRICS.pages_crawled.plain}. Distinct owned URLs fetched successfully.`,
    },
    {
      label: "Blocked requests",
      value: "312",
      delta: "214 of them on /help",
      note: "Bot visits your site turned away. ClaudeBot is only PARTIAL and Bytespider fully BLOCKED; action #87 unblocks /help.",
    },
    {
      label: "Busiest crawler",
      value: "GPTBot — 21,408 requests, 1,412 pages",
      note: "44% of all crawl volume, and the only agent with its own detail screen in this workspace.",
    },
    {
      label: "Most crawled page",
      value: "/running/marathon-training-guide — 2,214 requests",
      note: "Also the most-cited owned page and the top AI-referral landing page. Keep it fresh.",
    },
  ],
  sections: [
    seriesSection("Crawl activity by agent — daily trend", crawlerActivitySeries, infraDays, {
      unit: "requests",
      note: "Verified-bot requests per day. Each series sums to that agent's 30-day total in the Agents table below.",
    }),
    {
      title: "Agents",
      note: "Every verified AI crawler seen on the site, with what robots.txt currently allows it.",
      columns: ["Agent", "Operator", "Requests", "Pages", "Robots"],
      rows: [
        ["GPTBot", "OpenAI", "21,408", "1,412", "ALLOWED"],
        ["PerplexityBot", "Perplexity", "11,872", "986", "ALLOWED"],
        ["ClaudeBot", "Anthropic", "8,455", "743", "PARTIAL"],
        ["Google-Extended", "Google", "4,206", "612", "ALLOWED"],
        ["Bytespider", "ByteDance", "1,914", "388", "BLOCKED"],
        ["Applebot-Extended", "Apple", "347", "129", "ALLOWED"],
      ],
    },
    {
      title: "Most crawled paths",
      note: "Where crawl budget actually goes.",
      columns: ["Path", "Requests"],
      rows: [
        ["/running/marathon-training-guide", "2,214"],
        ["/pricing", "1,876"],
        ["/w/mens-running-shoes", "1,433"],
        ["/running/shoe-fitting-101", "1,187"],
        ["/w/womens-running-shoes", "904"],
      ],
    },
  ],
  footnotes: [
    "Alert: ClaudeBot hit 214 blocked /help URLs in this window — see action #87 to unblock.",
    "The six agents listed cover 45,941 of 48,231 requests; the remaining 2,290 are spread across the eight smaller verified agents.",
    FOOTNOTE_CRAWLERS,
    FOOTNOTE_METRICS,
  ],
};

/* --------------------------------------------------------------- referrals */

export const referralsSpec: ReportSpec = {
  module: "Agent Analytics · Referrals",
  brand: "Nike",
  window: WINDOW_30D,
  summary: [
    {
      label: METRICS.ai_referrals.label,
      value: "3,412 humans",
      delta: "+22%",
      note: `${METRICS.ai_referrals.plain}. Real people who clicked through to nike.com from an AI answer.`,
    },
    {
      label: "Share of all referral traffic",
      value: "8.4%",
      delta: "+1.2pt",
      note: "Slice of the site's referred visitors that AI assistants sent — now approaching one visitor in twelve.",
    },
    {
      label: "Sessions from AI",
      value: "5,108",
      delta: "+18%",
      note: "Visits that started from an AI answer. Growing slower than people, so repeat visits per person are rising.",
    },
    {
      label: "Purchases from AI",
      value: "61",
      delta: "+14",
      note: "Sales attributed last-touch to an AI-referred session — a 1.8% conversion rate on 3,412 referred humans.",
    },
    {
      label: "Dominant source",
      value: "ChatGPT — 55% (1,876 humans)",
      delta: "+4pt",
      note: "Perplexity is second at 24% and slipping 2pt; Gemini, Copilot and Claude split the remaining 21%.",
    },
    {
      label: "Measurement gap vs GA4",
      value: "Answr counts 4.2% more",
      note: "3,412 edge-log referrals against 3,274 GA4 sessions — mostly agent browsers GA4 drops.",
    },
  ],
  sections: [
    seriesSection("Referred humans by platform — daily trend", referredHumansSeries, infraDays, {
      unit: "humans",
      note: "People per day arriving from each assistant. Series sum to the platform totals below.",
    }),
    seriesSection("Answr edge logs vs GA4 sessions — daily trend", analyticsComparisonSeries, infraDays, {
      unit: "referrals",
      note: "The same traffic counted two ways: Answr's edge logs (3,412) against the connected GA4 property (3,274).",
    }),
    {
      title: "Referring platform",
      note: "Which assistant sent the people, by share and by count.",
      columns: ["Platform", "Share", "Referred humans", "Change vs previous"],
      rows: [
        ["ChatGPT", "55%", "1,876", "+4"],
        ["Perplexity", "24%", "819", "-2"],
        ["Gemini", "10%", "341", "+1"],
        ["Copilot", "6%", "205", "—"],
        ["Claude", "5%", "171", "+1"],
      ],
    },
    {
      title: "Landing pages",
      note: "Where AI-referred visitors arrive first.",
      columns: ["Page", "Referred", "% of AI referrals", "Change vs previous"],
      rows: [
        ["/running/marathon-training-guide", "912", "26.7%", "+84"],
        ["/pricing", "746", "21.9%", "+61"],
        ["/w/mens-running-shoes", "418", "12.3%", "+22"],
        ["/w/womens-running-shoes", "296", "8.7%", "-12"],
        ["/ (homepage)", "288", "8.4%", "+9"],
      ],
    },
  ],
  footnotes: [
    FOOTNOTE_REFERRALS,
    "Analytics connection: nike.com GA4 property, last sync 6 min before this export. Other supported methods: edge snippet · Cloudflare · Vercel · WordPress.",
    "Referrals are deduplicated humans; the Overview module's AI-referral clicks are raw click events, so the two figures differ by design.",
    FOOTNOTE_METRICS,
  ],
};

/* ------------------------------------------------------------ bot: GPTBot */

export const gptbotSpec: ReportSpec = {
  module: "Agent Analytics · GPTBot",
  brand: "Nike",
  window: WINDOW_30D,
  summary: [
    {
      label: "GPTBot requests",
      value: "21,408",
      delta: "+18%",
      note: `${METRICS.crawler_events.plain}. OpenAI's crawler is 44% of all AI crawl volume on nike.com.`,
    },
    {
      label: METRICS.pages_crawled.label,
      value: "1,412",
      note: `${METRICS.pages_crawled.plain}. GPTBot alone reaches 76% of the 1,846 pages any AI crawler touched.`,
    },
    {
      label: "Robots status",
      value: "ALLOWED (except /help/*)",
      note: "Your site lets this bot in everywhere but the help centre, which robots.txt still disallows.",
    },
    {
      label: "Last seen",
      value: "2 min ago",
      note: "Continuous crawling — the freshness of any page change is measured in minutes, not days.",
    },
    {
      label: "Why it visits",
      value: "65% crawling · 24% search fetch · 11% live browse",
      note: "Search-fetch traffic doubled since July: GPTBot re-reads /pricing before answering cost questions.",
    },
  ],
  sections: [
    seriesSection("GPTBot requests — daily trend", [crawlerActivitySeries[0]], infraDays, {
      unit: "requests",
      note: "Daily verified GPTBot requests; the series sums to the 21,408 headline.",
    }),
    {
      title: "Visits by user agent · 30d",
      note: "Why the bot came — reading for training, fetching for a search, or browsing live for one user.",
      columns: ["Purpose", "Share of 21,408 requests"],
      rows: [
        ["Crawling", "65%"],
        ["Search fetch", "24%"],
        ["Live browse", "11%"],
      ],
    },
    {
      title: "User-agent strings seen",
      note: "The identities OpenAI's fetchers presented, all verified by IP-range reverse-DNS.",
      columns: ["User agent"],
      rows: [["GPTBot/1.2"], ["OAI-SearchBot/1.0"], ["ChatGPT-User/2.0"]],
    },
    {
      title: "Pages indexed",
      note: "Your pages this bot has read, and when it last did.",
      columns: ["Path", "Visits", "Last visit"],
      rows: [
        ["/running/marathon-training-guide", "486", "2 min ago"],
        ["/pricing", "402", "18 min ago"],
        ["/w/mens-running-shoes", "311", "1 h ago"],
        ["/help/* (BLOCKED)", "—", "robots.txt"],
      ],
    },
  ],
  footnotes: [
    "Note: search-fetch traffic doubled since July — GPTBot re-reads /pricing before answering cost questions. Keep that page fresh.",
    FOOTNOTE_CRAWLERS,
    FOOTNOTE_METRICS,
  ],
};

/* ------------------------------------------------------------- live logs */

export const logsSpec: ReportSpec = {
  module: "Agent Analytics · Live logs",
  brand: "Nike",
  window: "Live stream snapshot · path filter /help · 30-day window Jul 7 – Aug 5",
  summary: [
    {
      label: "Stream rate",
      value: "48 requests/min",
      note: "Verified AI-bot requests arriving right now across nike.com, before any filter.",
    },
    {
      label: "Snapshot scope",
      value: "6 requests, 14:01:19 – 14:02:11",
      note: "The filtered slice below: only paths matching /help plus their neighbouring requests.",
    },
    {
      label: "Blocked in this snapshot",
      value: "3 of 6 requests (403)",
      note: "GPTBot and ClaudeBot both turned away on /help, Bytespider on the marathon guide. This is action #87's evidence, live.",
    },
    {
      label: "Operators seen",
      value: "OpenAI · Anthropic · Perplexity · Google · ByteDance",
      note: "Five operators inside one minute — crawl traffic is continuous, not batched.",
    },
  ],
  sections: [
    {
      title: "Request log",
      note: "Newest first. Status 200 = let in, 403 = blocked by robots.txt.",
      columns: ["Time", "Operator", "User agent", "Path", "Status"],
      rows: [
        ["14:02:11", "OpenAI", "GPTBot/1.2", "/help/size-guide", "403"],
        ["14:02:08", "Anthropic", "ClaudeBot/1.0", "/help/returns", "403"],
        ["14:01:59", "Perplexity", "PerplexityBot/1.1", "/running/shoe-fitting-101", "200"],
        ["14:01:44", "OpenAI", "OAI-SearchBot/1.0", "/pricing", "200"],
        ["14:01:31", "Google", "Google-Extended", "/w/womens-running-shoes", "200"],
        ["14:01:19", "ByteDance", "Bytespider", "/running/marathon-training-guide", "403"],
      ],
    },
  ],
  footnotes: [
    "Filtered to /help — the 403 pattern is action #87's evidence, live. 214 blocked /help URLs across the full 30-day window.",
    "The demo ships a fixed log snapshot; live workspaces stream continuously and export the full window.",
    FOOTNOTE_CRAWLERS,
    FOOTNOTE_METRICS,
  ],
};
