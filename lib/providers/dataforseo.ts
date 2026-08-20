import {
  type AnswerProvider,
  type SampleOptions,
  type SampleResult,
  type Citation,
  envVar,
  postJson,
} from "./types";

/* DataForSEO SERP Advanced — the only path to Google AI Overviews (no official
   Google API) plus the demand-volume prior (INTEGRATIONS.md §2.2).
   Endpoint: POST https://api.dataforseo.com/v3/serp/google/organic/live/advanced
   Auth: HTTP Basic (DATAFORSEO_LOGIN:DATAFORSEO_PASSWORD).
   Here `sample(keyword)` returns the AI Overview text + its structured references. */

const ENDPOINT = "https://api.dataforseo.com/v3/serp/google/organic/live/advanced";

export const dataforseo: AnswerProvider = {
  id: "dataforseo",
  label: "DataForSEO",
  blurb: "Google AI Overviews + demand-volume prior (SERP API).",
  envVars: ["DATAFORSEO_LOGIN", "DATAFORSEO_PASSWORD"],
  powers: ["shopping_visibility", "region_visibility", "demand_volume", "citations_count"],
  docsUrl: "https://dataforseo.com/apis/serp-api",
  pilotCost: "$50 min funding, then usage",

  isConfigured(env = process.env) {
    return !!envVar("DATAFORSEO_LOGIN", env) && !!envVar("DATAFORSEO_PASSWORD", env);
  },

  async sample(prompt: string, opts: SampleOptions = {}): Promise<SampleResult> {
    const login = envVar("DATAFORSEO_LOGIN");
    const password = envVar("DATAFORSEO_PASSWORD");
    if (!login || !password) throw new Error("dataforseo: DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD not set");
    const auth = Buffer.from(`${login}:${password}`).toString("base64");

    const data = (await postJson("dataforseo", ENDPOINT, {
      method: "POST",
      headers: { authorization: `Basic ${auth}`, "content-type": "application/json" },
      body: JSON.stringify([
        {
          keyword: prompt,
          language_code: process.env.DATAFORSEO_LANGUAGE ?? "en",
          location_code: Number(process.env.DATAFORSEO_LOCATION ?? 2840), // 2840 = United States
          load_async_ai_overview: true,
        },
      ]),
      timeoutMs: opts.timeoutMs ?? 60_000,
      signal: opts.signal,
    })) as DfsResponse;

    const items = data.tasks?.[0]?.result?.[0]?.items ?? [];
    const aio = items.find((i) => i.type === "ai_overview");
    const parts: string[] = [];
    const citations: Citation[] = [];
    const seen = new Set<string>();
    for (const el of aio?.items ?? []) {
      if (el.text) parts.push(el.text);
      for (const ref of el.references ?? []) {
        if (ref.url && !seen.has(ref.url)) {
          seen.add(ref.url);
          citations.push({ url: ref.url, title: ref.title ?? ref.source });
        }
      }
    }
    return { provider: "dataforseo", model: "google-ai-overview", text: parts.join("\n"), citations, raw: data };
  },
};

type DfsRef = { url?: string; title?: string; source?: string };
type DfsElement = { text?: string; references?: DfsRef[] };
type DfsItem = { type?: string; items?: DfsElement[] };
type DfsResponse = { tasks?: { result?: { items?: DfsItem[] }[] }[] };
