import type { BrandIdentity } from "@/lib/brand/identity";

/* Onboarding draft — carries the detected brand, its identity, competitors and
   topics across the three onboarding steps via sessionStorage (client-only).
   The last step writes it to the workspace through /api/workspace; until then
   nothing is persisted, so a half-finished onboarding leaves no trace.

   `identity` is the important one. It is resolved in step 1 from the website —
   the only thing the operator gives us that names exactly one company — and
   carrying it forward is what stops every later metric from measuring a
   different business that happens to share the name. */

export type DraftCompetitor = { name: string; domain: string };
export type DraftTopic = { name: string; prompts: number };

export interface OnboardingDraft {
  website?: string;
  brand?: string;
  category?: string;
  aliases?: string[];
  /** entity profile resolved from the website in step 1 */
  identity?: BrandIdentity;
  competitors?: DraftCompetitor[];
  topics?: DraftTopic[];
}

const KEY = "answr:onboarding";

export function readDraft(): OnboardingDraft {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "{}") as OnboardingDraft;
  } catch {
    return {};
  }
}

export function writeDraft(patch: Partial<OnboardingDraft>): OnboardingDraft {
  const next = { ...readDraft(), ...patch };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode / disabled storage — the in-page state still works */
  }
  return next;
}

/** Guess a display domain from a brand name (demo-grade). */
export function domainFromName(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return slug ? `${slug}.com` : "";
}
