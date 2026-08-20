import { NextResponse } from "next/server";
import { runSampler } from "@/lib/sampler/run";
import { anyProviderConfigured, providerStatuses } from "@/lib/providers/registry";

/* Sampler trigger — the endpoint Vercel Cron (or a manual call) hits to run the
   nightly answer sample. See lib/sampler/run.ts and vercel.json.

   Safety: this can spend real provider credits, so it only runs when a secret is
   configured AND presented. Set CRON_SECRET (Vercel Cron sends it automatically
   as `Authorization: Bearer <CRON_SECRET>`); ANSWR_INGEST_SECRET is accepted as
   a fallback for manual calls. With no secret set, it never samples — it just
   reports readiness, so scheduling it on a fresh deployment is harmless. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readSecret(): string | undefined {
  return (process.env.CRON_SECRET ?? process.env.ANSWR_INGEST_SECRET)?.trim() || undefined;
}

function presented(req: Request): string | undefined {
  const h = req.headers.get("authorization") ?? "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return (m?.[1] ?? req.headers.get("x-cron-secret") ?? "").trim() || undefined;
}

async function handle(req: Request) {
  const secret = readSecret();
  const providersReady = anyProviderConfigured();

  if (!secret) {
    return NextResponse.json({
      ok: false,
      reason: "no-secret",
      message:
        "Set CRON_SECRET (or ANSWR_INGEST_SECRET) to enable the sampler. Until then it will not run, to avoid unattended provider spend.",
      providersReady,
      providers: providerStatuses().map((p) => ({ id: p.id, configured: p.configured })),
    });
  }

  if (presented(req) !== secret) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const report = await runSampler();
  return NextResponse.json(report, { status: report.ok ? 200 : 200 });
}

// Vercel Cron issues GET; manual triggers may POST.
export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
