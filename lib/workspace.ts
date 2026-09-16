import { db, newId } from "@/lib/db";
import { domainIdentity, hostOf, type BrandIdentity } from "@/lib/brand/identity";

/* The active workspace — the brand this deployment tracks.

   This replaces the hard-coded "Nike" demo fixture. Every dashboard reads its
   brand, competitors and prompt set from here, and every metric is computed
   from answers sampled for THIS brand. Configured through onboarding or
   Settings › Brand; until it is configured the dashboards render an honest
   "not set up yet" state rather than invented numbers.

   The workspace also carries the brand's resolved identity (lib/brand/identity),
   built from the name AND the website. That is what lets scoring tell this
   company apart from anything else sharing its name. */

export interface Workspace {
  id: string;
  brand: string;
  domain: string;
  category: string;
  competitors: string[];
  /** the tracked prompt set the sampler runs each night */
  prompts: string[];
  /** entity profile resolved from brand + domain; absent on older workspaces */
  identity?: BrandIdentity;
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
  identity?: BrandIdentity;
}): Promise<Workspace> {
  const existing = await getWorkspace();
  const now = Date.now();
  const domain = (input.domain ?? existing?.domain ?? "").trim();
  const brand = input.brand.trim();

  // Keep a stored identity only while it still describes this brand + domain;
  // changing either means the old profile describes a different entity.
  const carried =
    input.identity ??
    (existing?.identity &&
    existing.identity.name.toLowerCase() === brand.toLowerCase() &&
    existing.identity.domain === hostOf(domain)
      ? existing.identity
      : undefined);

  const ws: Workspace = {
    id: ACTIVE_ID,
    brand,
    domain,
    category: (input.category ?? existing?.category ?? "").trim(),
    competitors: (input.competitors ?? existing?.competitors ?? []).map((c) => c.trim()).filter(Boolean),
    prompts: (input.prompts ?? existing?.prompts ?? []).map((p) => p.trim()).filter(Boolean),
    identity: carried,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  return db().put(COLLECTION, ws);
}

/**
 * The identity every scorer should match against.
 *
 * Returns the resolved profile when the workspace has one, and otherwise a
 * name+domain identity with strict matching off — so a workspace saved before
 * identity resolution existed keeps behaving exactly as it did.
 */
export function identityOf(ws: Pick<Workspace, "brand" | "domain" | "identity">): BrandIdentity {
  return ws.identity ?? domainIdentity(ws.brand, ws.domain);
}

/** Default prompt set generated for a brand — what the sampler runs nightly.
 *
 *  Category prompts stay generic on purpose: the point is to find out whether
 *  the brand surfaces unprompted. Brand-named prompts, though, have to identify
 *  WHICH company they mean — asking "Is Answr worth it?" of a contested name
 *  gets an answer about whichever Answr the engine picked. When the name is
 *  shared, those prompts carry the domain. */
export function defaultPromptsFor(
  brand: string,
  category: string,
  opts: { domain?: string; ambiguous?: boolean } = {},
): string[] {
  const c = category?.trim() || `${brand}'s category`;
  const host = hostOf(opts.domain ?? "");
  // Qualify the brand only when the name is genuinely contested — an
  // unnecessary qualifier makes the prompt less like a question a buyer asks.
  const b = opts.ambiguous && host ? `${brand} (${host})` : brand;
  return [
    `What are the best ${c}?`,
    `Which ${c} would you recommend, and why?`,
    `What do you think of ${b}?`,
    `How does ${b} compare to its main competitors?`,
    `Recommend a ${c} for someone who wants the best quality.`,
    `What are the top alternatives to ${b}?`,
    `Is ${b} worth it?`,
  ];
}

/** Seed a workspace id for records that are tenant-scoped. */
export function newWorkspaceId(): string {
  return newId("ws");
}
