import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { getWorkspace, saveWorkspace, defaultPromptsFor, identityOf } from "@/lib/workspace";
import { resolveIdentity, hostOf, identitySummary, type BrandIdentity } from "@/lib/brand/identity";

/* The active workspace — which brand this deployment tracks. Configured here
   (or via onboarding); every dashboard reads it. Replaces the hard-coded demo
   brand entirely.

   Saving resolves the brand's identity from the name AND the website, because
   the name on its own does not identify a company: tracking "Answr" by name
   alone counted answers about an unrelated hair-care brand. The resolved
   profile is what every metric matches against from then on. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const cap = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

export async function GET() {
  const ws = await getWorkspace();
  return NextResponse.json({
    ok: true,
    configured: !!ws,
    workspace: ws,
    identity: ws ? identityOf(ws) : null,
    summary: ws ? identitySummary(identityOf(ws)) : null,
  });
}

export async function POST(req: Request) {
  const jar = await cookies();
  if (!isUnlocked(jar.get(GATE_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

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
  const existing = await getWorkspace();
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

  const ws = await saveWorkspace({ brand, domain, category, competitors, prompts, identity });
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
        .map((c) => ({ name: cap(c?.name, 80), what: cap(c?.what, 140), domain: hostOf(cap(c?.domain, 160)) || undefined }))
        .filter((c) => c.name && c.what)
        .slice(0, 6)
    : [];
  return {
    name,
    domain: dom,
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
