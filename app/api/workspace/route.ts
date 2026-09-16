import { NextResponse } from "next/server";
import { authorizedTenant, isWritableWorkspaceId } from "@/lib/tenant";
import { getWorkspace, saveWorkspace, defaultPromptsFor, identityOf } from "@/lib/workspace";
import { resolveIdentity, hostOf, hostOrNull, identitySummary, type BrandIdentity } from "@/lib/brand/identity";

/* The active workspace — which brand this deployment tracks. Configured here
   (or via onboarding); every dashboard reads it. Replaces the hard-coded demo
   brand entirely.

   Saving resolves the brand's identity from the name AND the website, because
   the name on its own does not identify a company: tracking "Answr" by name
   alone counted answers about an unrelated hair-care brand. The resolved
   profile is what every metric matches against from then on.

   Authorization: BOTH verbs require an identified caller. GET used to have
   none at all, so an anonymous request published the workspace's whole brand
   configuration — name, website, category, competitor list and the resolved
   identity with its conflicts — to anybody who asked for it. It now resolves
   the tenant exactly as POST does and answers only for that tenant's own
   workspace. The only caller is app/(dash)/app/scan/ScanRunner, a client
   component inside the gated dashboard whose same-origin fetch carries the
   cookies, so seeding the scan form is unaffected. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const cap = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

export async function GET() {
  const tenant = await authorizedTenant();
  if (!tenant) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const ws = await getWorkspace(tenant.workspaceId);
  return NextResponse.json({
    ok: true,
    configured: !!ws,
    workspace: ws,
    identity: ws ? identityOf(ws) : null,
    summary: ws ? identitySummary(identityOf(ws)) : null,
  });
}

export async function POST(req: Request) {
  const tenant = await authorizedTenant();
  /* A caller whose session no longer resolves lands on the reserved dataless
     id (lib/tenant NO_WORKSPACE_ID). That id must stay empty — it is what makes
     unresolved requests render "not set up yet" instead of another brand — so
     a write from one is refused rather than silently creating a shared record
     there. Before tenancy this same request would have overwritten the demo
     workspace's brand outright. */
  if (!tenant || !isWritableWorkspaceId(tenant.workspaceId)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const workspaceId = tenant.workspaceId;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const brand = cap(body.brand, 80);
  if (!brand) return NextResponse.json({ ok: false, error: "Brand is required." }, { status: 400 });
  const domain = hostOf(cap(body.domain, 160));
  const competitors = Array.isArray(body.competitors)
    ? body.competitors.map((c) => cap(c, 60)).filter(Boolean).slice(0, 10)
    : [];

  // Identity: reuse the profile onboarding already resolved when it was passed
  // back, keep the stored one while it still describes this brand + domain, and
  // otherwise resolve it now. Skipped entirely when no website was given —
  // there is nothing to disambiguate against.
  const existing = await getWorkspace(workspaceId);
  const passed = parseIdentity(body.identity);
  let identity: BrandIdentity | undefined = passed;

  if (!identity && domain) {
    const stillValid =
      existing?.identity &&
      existing.identity.domain === domain &&
      existing.identity.name.toLowerCase() === brand.toLowerCase();
    identity = stillValid ? existing!.identity : await resolveIdentity({ name: brand, url: domain, category: cap(body.category, 120) });
  }

  const category = cap(body.category, 120) || identity?.category || "";

  const prompts = Array.isArray(body.prompts) && body.prompts.length
    ? body.prompts.map((p) => cap(p, 300)).filter(Boolean).slice(0, 25)
    : defaultPromptsFor(brand, category, { domain, ambiguous: identity?.ambiguous });

  const ws = await saveWorkspace({ brand, domain, category, competitors, prompts, identity, workspaceId });
  return NextResponse.json({
    ok: true,
    workspace: ws,
    identity: identityOf(ws),
    summary: identitySummary(identityOf(ws)),
    ambiguous: !!ws.identity?.ambiguous,
  });
}

/** Accept an identity the client round-trips from /api/suggest/brand, but only
 *  after re-validating its shape — it arrives over the wire like any input. */
function parseIdentity(v: unknown): BrandIdentity | undefined {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Record<string, unknown>;
  const name = cap(o.name, 80);
  const dom = hostOf(cap(o.domain, 160));
  if (!name || !dom) return undefined;
  const list = (x: unknown, n: number, max: number) =>
    Array.isArray(x) ? x.map((i) => cap(i, n)).filter(Boolean).slice(0, max) : [];
  const conflicts = Array.isArray(o.conflicts)
    ? (o.conflicts as Record<string, unknown>[])
        .map((c) => ({ name: cap(c?.name, 80), what: cap(c?.what, 140), domain: hostOrNull(cap(c?.domain, 160)) }))
        .filter((c) => c.name && c.what)
        .slice(0, 6)
    : [];
  return {
    name,
    domain: dom,
    // Carry the owned-host list through the round trip, or the brand's own
    // citations stop counting as owned after onboarding saves the profile.
    ownedDomains: [...new Set([dom, ...list(o.ownedDomains, 160, 6).map((d) => hostOf(d)).filter(Boolean)])],
    aliases: list(o.aliases, 60, 6),
    description: cap(o.description, 300),
    category: cap(o.category, 80),
    includeTerms: list(o.includeTerms, 48, 14).map((s) => s.toLowerCase()),
    excludeTerms: conflicts.length ? list(o.excludeTerms, 48, 14).map((s) => s.toLowerCase()) : [],
    conflicts,
    ambiguous: conflicts.length > 0,
    resolvedAt: Date.now(),
    source: o.source === "site+llm" || o.source === "llm" ? o.source : "domain",
    note: cap(o.note, 300) || undefined,
  };
}
