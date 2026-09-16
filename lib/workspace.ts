import { db, newId } from "@/lib/db";
import { domainIdentity, hostOf, type BrandIdentity } from "@/lib/brand/identity";
import { currentWorkspaceId, DEMO_WORKSPACE_ID } from "@/lib/tenant";

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

/** The demo workspace's record id — what everything used before tenancy. */
const ACTIVE_ID = DEMO_WORKSPACE_ID;

/**
 * The caller's workspace, or null when it hasn't been set up.
 *
 * With no id it resolves the one belonging to this request: a signed-in
 * account's own, or the demo workspace for a passphrase visitor. Background
 * work has no request, so it passes an id.
 */
export async function getWorkspace(workspaceId?: string): Promise<Workspace | null> {
  const id = workspaceId ?? (await currentWorkspaceId());
  return db().get<Workspace>(COLLECTION, id);
}

/** Create or update a workspace. Defaults to the caller's own. */
export async function saveWorkspace(input: {
  brand: string;
  domain?: string;
  category?: string;
  competitors?: string[];
  prompts?: string[];
  identity?: BrandIdentity;
  workspaceId?: string;
}): Promise<Workspace> {
  const id = input.workspaceId ?? (await currentWorkspaceId());
  const existing = await getWorkspace(id);
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
    id,
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
  const base = ws.identity ?? domainIdentity(ws.brand, ws.domain);
  const brand = ws.brand?.trim();
  if (!brand) return base;

  // Detection returns the LEGAL name — "Notion Labs, Inc." for a workspace whose
  // brand is "Notion" — and answers never use it. The name the operator typed is
  // the one engines actually write, so it is always a candidate. Without this a
  // whole workspace can silently match nothing.
  const known = [base.name, ...base.aliases].map((n) => n.toLowerCase());
  if (known.includes(brand.toLowerCase())) return base;
  return { ...base, aliases: [brand, ...base.aliases] };
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
    `Which of the ${c} is best for someone who wants the highest quality?`,
    `What are the top alternatives to ${b}?`,
    `Is ${b} worth it?`,
  ];
}

/** Seed a workspace id for records that are tenant-scoped. */
export function newWorkspaceId(): string {
  return newId("ws");
}
