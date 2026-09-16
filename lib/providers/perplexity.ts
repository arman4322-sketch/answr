import {
  type AnswerProvider,
  type SampleOptions,
  type SampleResult,
  type Citation,
  envVar,
  postJson,
} from "./types";

/* Perplexity Sonar — the primary answer-sampling lane (INTEGRATIONS.md §2.1).
   Same engine as the consumer product, returns native citations + search_results.
   Endpoint: POST https://api.perplexity.ai/chat/completions (OpenAI-compatible).
   Key: PERPLEXITY_API_KEY. Docs: https://docs.perplexity.ai */

const ENDPOINT = "https://api.perplexity.ai/chat/completions";
const DEFAULT_MODEL = "sonar";

export const perplexity: AnswerProvider = {
  id: "perplexity",
  label: "Perplexity Sonar",
  blurb: "Primary answer-sampling lane with native citations.",
  envVars: ["PERPLEXITY_API_KEY"],
  powers: ["visibility_score", "share_of_voice", "platform_appearances", "avg_answer_position", "citations_count"],
  docsUrl: "https://docs.perplexity.ai/getting-started/pricing",
  pilotCost: "~$2–5/mo",
  supportsLocation: true,

  isConfigured(env = process.env) {
    return !!envVar("PERPLEXITY_API_KEY", env);
  },

  async sample(prompt: string, opts: SampleOptions = {}): Promise<SampleResult> {
    const key = envVar("PERPLEXITY_API_KEY");
    if (!key) throw new Error("perplexity: PERPLEXITY_API_KEY not set");
    const model = opts.model ?? process.env.PERPLEXITY_MODEL ?? DEFAULT_MODEL;

    const body: Record<string, unknown> = { model, messages: [{ role: "user", content: prompt }] };
    // Sonar searches from the given location, so a regional run really is run
    // from that region rather than merely told about it.
    const loc = opts.userLocation;
    if (loc?.country) {
      body.web_search_options = {
        user_location: {
          country: loc.country,
          ...(loc.city ? { city: loc.city } : {}),
          ...(loc.region ? { region: loc.region } : {}),
        },
      };
    }

    const data = (await postJson("perplexity", ENDPOINT, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify(body),
      timeoutMs: opts.timeoutMs,
      signal: opts.signal,
    })) as {
      choices?: { message?: { content?: string } }[];
      citations?: string[];
      search_results?: { url?: string; title?: string }[];
    };

    const text = data.choices?.[0]?.message?.content ?? "";
    const citations: Citation[] = [];
    for (const url of data.citations ?? []) if (url) citations.push({ url });
    for (const r of data.search_results ?? []) if (r?.url) citations.push({ url: r.url, title: r.title });

    return { provider: "perplexity", model, text, citations: dedupe(citations), raw: data };
  },
};

function dedupe(list: Citation[]): Citation[] {
  const seen = new Set<string>();
  return list.filter((c) => (seen.has(c.url) ? false : (seen.add(c.url), true)));
}
