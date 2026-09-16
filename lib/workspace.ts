import { db, newId } from "@/lib/db";

/* The active workspace — the brand this deployment tracks.

   This replaces the hard-coded "Nike" demo fixture. Every dashboard reads its
   brand, competitors and prompt set from here, and every metric is computed
   from answers sampled for THIS brand. Configured through onboarding or
   Settings › Brand; until it is configured the dashboards render an honest
   "not set up yet" state rather than invented numbers. */

export interface Workspace {
  id: string;
  brand: string;
  domain: string;
  category: string;
  competitors: string[];
  /** the tracked prompt set the sampler runs each night */
  prompts: string[];
  createdAt: number;
  updatedAt: number;
}

const COLLECTION = "workspace";
const ACTIVE_ID = "active";

/** The configured workspace, or null when the platform hasn't been set up. */
export async function getWorkspace(): Promise<Workspace | null> {
  return db().get<Workspace>(COLLECTION, ACTIVE_ID);
}

/** Create or update the active workspace. */
export async function saveWorkspace(input: {
  brand: string;
  domain?: string;
  category?: string;
  competitors?: string[];
  prompts?: string[];
}): Promise<Workspace> {
  const existing = await getWorkspace();
  const now = Date.now();
  const ws: Workspace = {
    id: ACTIVE_ID,
    brand: input.brand.trim(),
    domain: (input.domain ?? existing?.domain ?? "").trim(),
    category: (input.category ?? existing?.category ?? "").trim(),
    competitors: (input.competitors ?? existing?.competitors ?? []).map((c) => c.trim()).filter(Boolean),
    prompts: (input.prompts ?? existing?.prompts ?? []).map((p) => p.trim()).filter(Boolean),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  return db().put(COLLECTION, ws);
}

/** Default prompt set generated for a brand — what the sampler runs nightly. */
export function defaultPromptsFor(brand: string, category: string): string[] {
  const c = category?.trim() || `${brand}'s category`;
  return [
    `What are the best ${c}?`,
    `Which ${c} would you recommend, and why?`,
    `What do you think of ${brand}?`,
    `How does ${brand} compare to its main competitors?`,
    `Recommend a ${c} for someone who wants the best quality.`,
    `What are the top alternatives to ${brand}?`,
    `Is ${brand} worth it?`,
  ];
}

/** Seed a workspace id for records that are tenant-scoped. */
export function newWorkspaceId(): string {
  return newId("ws");
}
