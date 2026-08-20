/* AI crawler / assistant user-agent catalog.

   UA patterns follow the published operator docs and the community catalog at
   github.com/ai-robots-txt/ai.robots.txt (MIT). Full verification (the promise
   behind `unique_agents`) additionally requires reverse-DNS / IP-range checks
   against each operator's published JSON:
     https://openai.com/gptbot.json
     https://claude.com/crawling/bots.json
     https://www.perplexity.com/perplexitybot.json
     https://developers.google.com/search/apis/ipranges/googlebot.json
   Those are fetched by the verifier job (see INTEGRATIONS.md §2); UA matching
   alone is treated as "declared", not "verified". */

export type BotKind = "crawler" | "assistant-fetch";

export type BotDef = {
  id: string;
  label: string;
  operator: string;
  /** case-insensitive substring of the User-Agent */
  ua: string;
  kind: BotKind;
  /** the metric-facing platform this bot rolls up to */
  platform: "openai" | "anthropic" | "perplexity" | "google" | "microsoft" | "other";
};

export const BOTS: BotDef[] = [
  { id: "gptbot", label: "GPTBot", operator: "OpenAI", ua: "GPTBot", kind: "crawler", platform: "openai" },
  { id: "oai-searchbot", label: "OAI-SearchBot", operator: "OpenAI", ua: "OAI-SearchBot", kind: "crawler", platform: "openai" },
  { id: "chatgpt-user", label: "ChatGPT-User", operator: "OpenAI", ua: "ChatGPT-User", kind: "assistant-fetch", platform: "openai" },
  { id: "claudebot", label: "ClaudeBot", operator: "Anthropic", ua: "ClaudeBot", kind: "crawler", platform: "anthropic" },
  { id: "claude-user", label: "Claude-User", operator: "Anthropic", ua: "Claude-User", kind: "assistant-fetch", platform: "anthropic" },
  { id: "claude-searchbot", label: "Claude-SearchBot", operator: "Anthropic", ua: "Claude-SearchBot", kind: "crawler", platform: "anthropic" },
  { id: "perplexitybot", label: "PerplexityBot", operator: "Perplexity", ua: "PerplexityBot", kind: "crawler", platform: "perplexity" },
  { id: "perplexity-user", label: "Perplexity-User", operator: "Perplexity", ua: "Perplexity-User", kind: "assistant-fetch", platform: "perplexity" },
  { id: "google-extended", label: "Google-Extended", operator: "Google", ua: "Google-Extended", kind: "crawler", platform: "google" },
  { id: "googleother", label: "GoogleOther", operator: "Google", ua: "GoogleOther", kind: "crawler", platform: "google" },
  { id: "google-cloudvertexbot", label: "Google-CloudVertexBot", operator: "Google", ua: "Google-CloudVertexBot", kind: "crawler", platform: "google" },
  { id: "bingbot", label: "Bingbot", operator: "Microsoft", ua: "bingbot", kind: "crawler", platform: "microsoft" },
  { id: "meta-externalagent", label: "Meta-ExternalAgent", operator: "Meta", ua: "meta-externalagent", kind: "crawler", platform: "other" },
  { id: "bytespider", label: "Bytespider", operator: "ByteDance", ua: "Bytespider", kind: "crawler", platform: "other" },
  { id: "amazonbot", label: "Amazonbot", operator: "Amazon", ua: "Amazonbot", kind: "crawler", platform: "other" },
  { id: "applebot-extended", label: "Applebot-Extended", operator: "Apple", ua: "Applebot-Extended", kind: "crawler", platform: "other" },
  { id: "ccbot", label: "CCBot", operator: "Common Crawl", ua: "CCBot", kind: "crawler", platform: "other" },
  { id: "cohere-ai", label: "cohere-ai", operator: "Cohere", ua: "cohere-ai", kind: "crawler", platform: "other" },
  { id: "mistralai-user", label: "MistralAI-User", operator: "Mistral", ua: "MistralAI-User", kind: "assistant-fetch", platform: "other" },
  { id: "diffbot", label: "Diffbot", operator: "Diffbot", ua: "Diffbot", kind: "crawler", platform: "other" },
];

/** Longest UA pattern first so "Claude-SearchBot" wins over a bare "ClaudeBot" prefix match. */
const ORDERED = [...BOTS].sort((a, b) => b.ua.length - a.ua.length);

export function identifyBot(userAgent: string | null | undefined): BotDef | null {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  return ORDERED.find((b) => ua.includes(b.ua.toLowerCase())) ?? null;
}

/* ---- AI referral sources (human clicked through from an assistant) ----
   Referrer hostnames plus the utm_source convention assistants now decorate
   outbound links with. Field measurements show a large share of AI clicks
   arrive referrer-stripped, so counts are a floor, never a ceiling — the
   ai_referrals metric says so in its provenance tooltip. */

export type ReferralSource = { id: string; label: string; hosts: string[]; utm: string[] };

export const AI_REFERRERS: ReferralSource[] = [
  { id: "chatgpt", label: "ChatGPT", hosts: ["chatgpt.com", "chat.openai.com"], utm: ["chatgpt.com", "openai"] },
  { id: "perplexity", label: "Perplexity", hosts: ["perplexity.ai", "www.perplexity.ai"], utm: ["perplexity"] },
  { id: "gemini", label: "Gemini", hosts: ["gemini.google.com", "bard.google.com"], utm: ["gemini", "google-gemini"] },
  { id: "claude", label: "Claude", hosts: ["claude.ai", "claude.com"], utm: ["claude", "anthropic"] },
  { id: "copilot", label: "Copilot", hosts: ["copilot.microsoft.com", "bing.com/chat"], utm: ["copilot"] },
  { id: "grok", label: "Grok", hosts: ["grok.com", "x.ai"], utm: ["grok"] },
];

export function identifyReferral(referrer: string | null | undefined, utmSource: string | null | undefined): ReferralSource | null {
  if (referrer) {
    let host = "";
    try {
      host = new URL(referrer).hostname.toLowerCase();
    } catch {
      host = referrer.toLowerCase();
    }
    const byHost = AI_REFERRERS.find((s) => s.hosts.some((h) => host === h || host.endsWith("." + h) || host.includes(h)));
    if (byHost) return byHost;
  }
  if (utmSource) {
    const u = utmSource.toLowerCase();
    const byUtm = AI_REFERRERS.find((s) => s.utm.some((t) => u.includes(t)));
    if (byUtm) return byUtm;
  }
  return null;
}
