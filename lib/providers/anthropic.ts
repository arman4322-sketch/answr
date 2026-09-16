import {
  type AnswerProvider,
  type SampleOptions,
  type SampleResult,
  type Citation,
  envVar,
  postJson,
} from "./types";

/* Anthropic (Claude) Messages API + web_search tool — the Claude sampling lane
   and the Haiku sentiment classifier (INTEGRATIONS.md §2.1 / §2.6).
   Endpoint: POST https://api.anthropic.com/v1/messages.
   Key: ANTHROPIC_API_KEY. Docs: https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool
   Best-structured citations of the lot (web_search_result_location blocks). */

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

export const anthropic: AnswerProvider = {
  id: "anthropic",
  label: "Anthropic (Claude)",
  blurb: "Claude answer lane + cheap Haiku sentiment classification.",
  envVars: ["ANTHROPIC_API_KEY"],
  powers: ["visibility_score", "share_of_voice", "platform_appearances", "citations_count", "sentiment_mix"],
  docsUrl: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool",
  pilotCost: "<$1/mo",
  supportsLocation: true,

  isConfigured(env = process.env) {
    return !!envVar("ANTHROPIC_API_KEY", env);
  },

  async sample(prompt: string, opts: SampleOptions = {}): Promise<SampleResult> {
    const key = envVar("ANTHROPIC_API_KEY");
    if (!key) throw new Error("anthropic: ANTHROPIC_API_KEY not set");
    const model = opts.model ?? process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;

    // The web_search tool accepts an approximate searcher location, so a
    // regional run really is searched from that region.
    const loc = opts.userLocation;
    const searchTool: Record<string, unknown> = { type: "web_search_20250305", name: "web_search", max_uses: 5 };
    if (loc?.country) {
      searchTool.user_location = {
        type: "approximate",
        country: loc.country,
        ...(loc.city ? { city: loc.city } : {}),
        ...(loc.region ? { region: loc.region } : {}),
        ...(loc.timezone ? { timezone: loc.timezone } : {}),
      };
    }

    const data = (await postJson("anthropic", ENDPOINT, {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": API_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
        tools: [searchTool],
      }),
      timeoutMs: opts.timeoutMs,
      signal: opts.signal,
    })) as AnthropicResponse;

    const { text, citations } = extract(data);
    return { provider: "anthropic", model, text, citations, raw: data };
  },
};

type AnthropicBlock = {
  type?: string;
  text?: string;
  citations?: { url?: string; title?: string }[];
};
type AnthropicResponse = { content?: AnthropicBlock[] };

function extract(data: AnthropicResponse): { text: string; citations: Citation[] } {
  let text = "";
  const citations: Citation[] = [];
  const seen = new Set<string>();
  for (const block of data.content ?? []) {
    if (block.type === "text" && block.text) text += block.text;
    for (const c of block.citations ?? []) {
      if (c.url && !seen.has(c.url)) {
        seen.add(c.url);
        citations.push({ url: c.url, title: c.title });
      }
    }
  }
  return { text, citations };
}
