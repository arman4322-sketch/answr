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
  supportsLocation: true,

  isConfigured(env = process.env) {
    return !!envVar("OPENAI_API_KEY", env);
  },

  async sample(prompt: string, opts: SampleOptions = {}): Promise<SampleResult> {
    const key = envVar("OPENAI_API_KEY");
    if (!key) throw new Error("openai: OPENAI_API_KEY not set");
    const model = opts.model ?? process.env.OPENAI_MODEL ?? DEFAULT_MODEL;

    // web_search takes an approximate searcher location, so a regional sample
    // is searched from that region. It rides on the tool, so a plain
    // (ungrounded) call cannot be located at all.
    const loc = opts.userLocation;
    const searchTool = loc?.country
      ? {
          type: "web_search",
          user_location: {
            type: "approximate",
            country: loc.country,
            ...(loc.city ? { city: loc.city } : {}),
            ...(loc.region ? { region: loc.region } : {}),
            ...(loc.timezone ? { timezone: loc.timezone } : {}),
          },
        }
      : { type: "web_search" };

    const call = (grounding: boolean) => {
      const body: Record<string, unknown> = { model, input: prompt };
      if (grounding) body.tools = [searchTool];
      return postJson("openai", ENDPOINT, {
        method: "POST",
        headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify(body),
        timeoutMs: opts.timeoutMs,
        signal: opts.signal,
      }) as Promise<OpenAiResponse>;
    };

    // Grounded by default (citations); fall back to a plain call if the key/model
    // can't use web_search, so the lane still returns an answer.
    const wantGrounding = opts.grounding !== false;
    let data: OpenAiResponse;
    try {
      data = await call(wantGrounding);
    } catch (err) {
      if (!wantGrounding) throw err;
      data = await call(false);
    }

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
