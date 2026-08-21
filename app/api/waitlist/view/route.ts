import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { recordView, listViews, listLeads } from "@/lib/db/entities";

/* Waitlist funnel analytics — privacy-safe, first-party.
   POST: records a page-view event (public; called by the waitlist page on load).
   GET (gated): returns the funnel — views, waitlist signups, conversion, and a
   per-source breakdown so a campaign can see which channel converted.
   No cookies, no cross-site tracking; only utm_source/referrer buckets. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cap = (s: unknown, n: number) => (typeof s === "string" && s.trim() ? s.trim().slice(0, n) : undefined);

export async function POST(req: Request) {
  let source: string | undefined;
  try {
    const body = (await req.json()) as { source?: string };
    source = cap(body.source, 80);
  } catch {
    /* view with no source is fine */
  }
  await recordView("waitlist", source);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const jar = await cookies();
  if (!isUnlocked(jar.get(GATE_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const [views, leads] = await Promise.all([listViews(), listLeads()]);
  const waitlistViews = views.filter((v) => v.page === "waitlist");
  const signups = leads.filter((l) => l.source === "waitlist");

  const bySource: Record<string, { views: number; signups: number }> = {};
  const bucket = (s?: string) => s || "direct";
  for (const v of waitlistViews) {
    const k = bucket(v.source);
    (bySource[k] ??= { views: 0, signups: 0 }).views += 1;
  }
  for (const s of signups) {
    const k = bucket(s.utmSource || s.referrer);
    (bySource[k] ??= { views: 0, signups: 0 }).signups += 1;
  }

  const totalViews = waitlistViews.length;
  const totalSignups = signups.length;
  return NextResponse.json({
    ok: true,
    views: totalViews,
    signups: totalSignups,
    conversion: totalViews > 0 ? Math.round((totalSignups / totalViews) * 1000) / 10 : 0,
    bySource: Object.entries(bySource)
      .map(([source, v]) => ({ source, ...v, conversion: v.views > 0 ? Math.round((v.signups / v.views) * 1000) / 10 : 0 }))
      .sort((a, b) => b.signups - a.signups || b.views - a.views),
  });
}
