import type { AnswerProvider, ProviderId } from "./types";
import { perplexity } from "./perplexity";
import { openai } from "./openai";
import { anthropic } from "./anthropic";
import { gemini } from "./gemini";
import { dataforseo } from "./dataforseo";

/* The provider registry — the single source of truth for which answer-engine
   lanes exist, what each powers, and whether the deployment has the key to run
   it. Read server-side (env is never exposed to the client). Adding a lane is
   one import + one array entry. */

export const PROVIDERS: AnswerProvider[] = [perplexity, gemini, dataforseo, anthropic, openai];

export function getProvider(id: ProviderId): AnswerProvider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

/** Providers whose keys are present in the current environment. */
export function configuredProviders(env: NodeJS.ProcessEnv = process.env): AnswerProvider[] {
  return PROVIDERS.filter((p) => p.isConfigured(env));
}

export interface ProviderStatus {
  id: ProviderId;
  label: string;
  blurb: string;
  envVars: string[];
  powers: string[];
  docsUrl: string;
  pilotCost: string;
  configured: boolean;
}

/** A client-safe snapshot (booleans + labels only — never the secret values). */
export function providerStatuses(env: NodeJS.ProcessEnv = process.env): ProviderStatus[] {
  return PROVIDERS.map((p) => ({
    id: p.id,
    label: p.label,
    blurb: p.blurb,
    envVars: p.envVars,
    powers: p.powers,
    docsUrl: p.docsUrl,
    pilotCost: p.pilotCost,
    configured: p.isConfigured(env),
  }));
}

export function anyProviderConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return PROVIDERS.some((p) => p.isConfigured(env));
}
