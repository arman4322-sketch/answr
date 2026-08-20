import {
  type AnswerProvider,
  type SampleOptions,
  type SampleResult,
  type Citation,
  envVar,
  postJson,
} from "./types";

/* OpenAI Responses API + web_search tool — the ChatGPT sampling lane
   (INTEGRATIONS.md §2.1, wave 2). Endpoint: POST https://api.openai.com/v1/responses.
   Key: OPENAI_API_KEY. Docs: https://developers.openai.com/api/docs/guides/tools-web-search
   Citations arrive as url_citation annotations on the output text blocks. */

const ENDPOINT = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4o";

export const openai: AnswerProvider = {
  id: "openai",
  label: "OpenAI (ChatGPT)",
  blurb: "ChatGPT answer lane via the Responses API + web search.",
  envVars: ["OPENAI_API_KEY"],
  powers: ["visibility_score", "share_of_voice", "platform_appearances", "citations_count"],
  docsUrl: "https://developers.openai.com/api/docs/guides/tools-web-search",
  pilotCost: "usage-based",

  isConfigured(env = process.env) {
    return !!envVar("OPENAI_API_KEY", env);
  },

  async sample(prompt: string, opts: SampleOptions = {}): Promise<SampleResult> {
    const key = envVar("OPENAI_API_KEY");
    if (!key) throw new Error("openai: OPENAI_API_KEY not set");
    const model = opts.model ?? process.env.OPENAI_MODEL ?? DEFAULT_MODEL;

    const data = (await postJson("openai", ENDPOINT, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model, input: prompt, tools: [{ type: "web_search" }] }),
      timeoutMs: opts.timeoutMs,
      signal: opts.signal,
    })) as OpenAiResponse;

    const { text, citations } = extract(data);
    return { provider: "openai", model, text, citations, raw: data };
  },
};

type OpenAiResponse = {
  output_text?: string;
  output?: {
    type?: string;
    content?: { type?: string; text?: string; annotations?: { type?: string; url?: string; title?: string }[] }[];
  }[];
};

function extract(data: OpenAiResponse): { text: string; citations: Citation[] } {
  if (data.output_text) {
    // Convenience field present on some SDK responses; annotations still live in output[].
  }
  let text = data.output_text ?? "";
  const citations: Citation[] = [];
  const seen = new Set<string>();
  for (const item of data.output ?? []) {
    for (const block of item.content ?? []) {
      if (block.text && !data.output_text) text += block.text;
      for (const a of block.annotations ?? []) {
        if (a.type === "url_citation" && a.url && !seen.has(a.url)) {
          seen.add(a.url);
          citations.push({ url: a.url, title: a.title });
        }
      }
    }
  }
  return { text, citations };
}
