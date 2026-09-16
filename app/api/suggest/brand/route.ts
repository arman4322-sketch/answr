import { NextResponse } from "next/server";
import { rateLimit, callerKey } from "@/lib/ratelimit";
import { resolveIdentity, hostOf, nameFromHost, identitySummary } from "@/lib/brand/identity";

/* AI brand detection — given a website URL, work out who owns it.
 *
 * Powers onboarding step 1. The website is the only unambiguous thing the
 * operator gives us, so this reads it and builds the entity profile every
 * downstream metric matches against: the canonical name, what the company
 * actually does, and anything else that shares its name.
 *
 * Public (onboarding helper), rate-limited. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const cap = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

export async function POST(req: Request) {
  if (!rateLimit(`suggest:${callerKey(req)}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests — try again in a minute." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const url = cap(body.url, 200);
  if (!url) return NextResponse.json({ ok: false, error: "Enter a website." }, { status: 400 });
  const host = hostOf(url);
  if (!host || !host.includes(".")) {
    return NextResponse.json({ ok: false, error: "That doesn't look like a website address." }, { status: 400 });
  }

  const identity = await resolveIdentity({
    url,
    name: cap(body.name, 80) || undefined,
    category: cap(body.category, 120) || undefined,
  });

  return NextResponse.json({
    ok: true,
    host,
    // Onboarding's existing fields, unchanged.
    name: identity.name || nameFromHost(host),
    category: identity.category,
    aliases: identity.aliases,
    // The entity profile, so onboarding can warn about a contested name and
    // the workspace can be saved with matching already configured.
    identity,
    ambiguous: identity.ambiguous,
    conflicts: identity.conflicts,
    summary: identitySummary(identity),
    fallback: identity.source === "domain",
    note: identity.note,
  });
}
