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
// Current Flash model recommended by the API for new keys (2.5-flash and older
// pinned names are deprecated). "gemini-flash-latest" is the auto-updating alias
// but can transiently 503; the explicit version is steadier. Override with GEMINI_MODEL.
const DEFAULT_MODEL = "gemini-3.6-flash";

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

    const call = (grounding: boolean) => {
      const body: Record<string, unknown> = { contents: [{ parts: [{ text: prompt }] }] };
      if (grounding) body.tools = [{ google_search: {} }];
      return postJson("gemini", url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        timeoutMs: opts.timeoutMs,
        signal: opts.signal,
      }) as Promise<GeminiResponse>;
    };

    // Retry transient errors (503 high-demand, 429/5xx) with backoff.
    const isTransient = (e: unknown) =>
      /HTTP (429|500|502|503|504)|UNAVAILABLE|high demand|overloaded/i.test(String((e as Error)?.message));
    const callRetry = async (grounding: boolean): Promise<GeminiResponse> => {
      let last: unknown;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          return await call(grounding);
        } catch (e) {
          last = e;
          if (!isTransient(e)) throw e;
          await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
        }
      }
      throw last;
    };

    // Default to grounded (paid keys get citations); free-tier keys reject the
    // google_search tool (429/403), so fall back to a plain call automatically.
    const wantGrounding = opts.grounding !== false;
    let data: GeminiResponse;
    try {
      data = await callRetry(wantGrounding);
    } catch (err) {
      if (!wantGrounding) throw err;
      data = await callRetry(false);
    }

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
