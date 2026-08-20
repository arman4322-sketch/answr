import {
  type AnswerProvider,
  type SampleOptions,
  type SampleResult,
  type Citation,
  envVar,
  postJson,
} from "./types";

/* Google Gemini + Google Search grounding — free grounded lane at pilot volume
   (INTEGRATIONS.md §2.1: 1,500 grounded requests/day free on the 2.5 family).
   Endpoint: POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
   Key: GEMINI_API_KEY (passed as ?key=). Citations come from groundingMetadata. */

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash";

export const gemini: AnswerProvider = {
  id: "gemini",
  label: "Google Gemini",
  blurb: "Grounded Gemini lane — free at pilot volume.",
  envVars: ["GEMINI_API_KEY"],
  powers: ["visibility_score", "share_of_voice", "platform_appearances", "citations_count"],
  docsUrl: "https://ai.google.dev/gemini-api/docs/google-search",
  pilotCost: "free at pilot volume",

  isConfigured(env = process.env) {
    return !!envVar("GEMINI_API_KEY", env);
  },

  async sample(prompt: string, opts: SampleOptions = {}): Promise<SampleResult> {
    const key = envVar("GEMINI_API_KEY");
    if (!key) throw new Error("gemini: GEMINI_API_KEY not set");
    const model = opts.model ?? process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
    const url = `${BASE}/${model}:generateContent?key=${encodeURIComponent(key)}`;

    const data = (await postJson("gemini", url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
      }),
      timeoutMs: opts.timeoutMs,
      signal: opts.signal,
    })) as GeminiResponse;

    const cand = data.candidates?.[0];
    const text = (cand?.content?.parts ?? []).map((p) => p.text ?? "").join("");
    const citations: Citation[] = [];
    const seen = new Set<string>();
    for (const chunk of cand?.groundingMetadata?.groundingChunks ?? []) {
      const url2 = chunk.web?.uri;
      if (url2 && !seen.has(url2)) {
        seen.add(url2);
        citations.push({ url: url2, title: chunk.web?.title });
      }
    }
    return { provider: "gemini", model, text, citations, raw: data };
  },
};

type GeminiResponse = {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    groundingMetadata?: { groundingChunks?: { web?: { uri?: string; title?: string } }[] };
  }[];
};
