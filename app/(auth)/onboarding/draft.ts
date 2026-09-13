/* Onboarding draft — carries the AI-detected brand, competitors, and topics
   across the three onboarding steps via sessionStorage (client-only). No DB
   needed; a real build would persist this to a workspace record. */

export type DraftCompetitor = { name: string; domain: string };
export type DraftTopic = { name: string; prompts: number };

export interface OnboardingDraft {
  website?: string;
  brand?: string;
  category?: string;
  aliases?: string[];
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
