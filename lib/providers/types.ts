/* Provider abstraction — the "wire-up layer" that turns Answr's integration spec
   (INTEGRATIONS.md) into code a buyer activates by pasting an API key.

   Each provider is a thin, uniform client that:
     - declares the env var(s) that configure it and the metrics it feeds,
     - reports isConfigured() from the environment (no key → inert, never throws),
     - implements sample(prompt) returning a normalized answer + citations.

   Nothing here runs until the relevant key is set: the registry and the
   Settings › Integrations page render "Not connected" and the sampler no-ops.
   These clients target the endpoints documented in INTEGRATIONS.md (Aug 2026);
   a live key is required to verify them against each provider's current API. */

export type ProviderId = "perplexity" | "openai" | "anthropic" | "gemini" | "dataforseo";

export interface Citation {
  url: string;
  title?: string;
}

export interface SampleResult {
  provider: ProviderId;
  /** the model / engine that produced the answer */
  model: string;
  /** the answer text */
  text: string;
  /** normalized citations extracted from the provider's native payload */
  citations: Citation[];
  /** provider-specific raw payload, for debugging / future parsing */
  raw?: unknown;
}

export interface SampleOptions {
  /** override the provider's default model */
  model?: string;
  /** hard timeout for the request (default 30s) */
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface AnswerProvider {
  id: ProviderId;
  label: string;
  /** one-line description of what this lane contributes */
  blurb: string;
  /** env var names that configure this provider (all required unless noted) */
  envVars: string[];
  /** metric ids (see lib/metrics.ts) this provider helps make real */
  powers: string[];
  /** docs link a buyer follows to get a key */
  docsUrl: string;
  /** rough pilot-scale cost, for the Integrations UI */
  pilotCost: string;
  /** true when the required env var(s) are present and non-empty */
  isConfigured(env?: NodeJS.ProcessEnv): boolean;
  /** run one prompt. Throws ProviderError if not configured or on API failure. */
  sample(prompt: string, opts?: SampleOptions): Promise<SampleResult>;
}

export class ProviderError extends Error {
  constructor(
    public provider: ProviderId,
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

/** Small fetch helper: JSON POST with a timeout and uniform error surfacing. */
export async function postJson(
  provider: ProviderId,
  url: string,
  init: RequestInit & { timeoutMs?: number },
): Promise<unknown> {
  const { timeoutMs = 30_000, signal, ...rest } = init;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  if (signal) signal.addEventListener("abort", () => ctrl.abort(), { once: true });
  try {
    const res = await fetch(url, { ...rest, signal: ctrl.signal });
    const body = await res.text();
    let parsed: unknown;
    try {
      parsed = body ? JSON.parse(body) : null;
    } catch {
      parsed = body;
    }
    if (!res.ok) {
      const detail = typeof parsed === "string" ? parsed : JSON.stringify(parsed);
      throw new ProviderError(provider, `HTTP ${res.status}: ${detail.slice(0, 300)}`, res.status);
    }
    return parsed;
  } catch (err) {
    if (err instanceof ProviderError) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    throw new ProviderError(provider, msg);
  } finally {
    clearTimeout(timer);
  }
}

/** Reads a trimmed env var (defaults to process.env). */
export function envVar(name: string, env: NodeJS.ProcessEnv = process.env): string | undefined {
  const v = env[name];
  return v && v.trim() ? v.trim() : undefined;
}
