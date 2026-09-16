import { NextResponse } from "next/server";
import { runSampler } from "@/lib/sampler/run";
import { runEntityVerification } from "@/lib/live/entity";
import { runClassification } from "@/lib/live/classify";
import { anyProviderConfigured, providerStatuses } from "@/lib/providers/registry";

/* Sampler trigger — the endpoint Vercel Cron (or a manual call) hits to run the
   nightly answer sample. See lib/sampler/run.ts and vercel.json.

   The nightly pass is the whole pipeline, not just the sample, so a deployment
   left alone keeps producing complete numbers:

     1. sample       ask every configured lane the tracked prompts
     2. verify       for a shared brand name, decide which company each new
                     answer is about (no-ops when the name is not shared)
     3. classify     sentiment + topics over what survived

   Stages 2 and 3 are idempotent and only touch answers that are new, so the
   nightly cost is a few cents beyond the sample itself.

   Safety: this can spend real provider credits, so it only runs when a secret is
   configured AND presented. Set CRON_SECRET (Vercel Cron sends it automatically
   as `Authorization: Bearer <CRON_SECRET>`); ANSWR_INGEST_SECRET is accepted as
   a fallback for manual calls. With no secret set, it never samples — it just
   reports readiness, so scheduling it on a fresh deployment is harmless. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Three stages across every configured lane; the sample alone can take minutes.
export const maxDuration = 800;

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
  if (!report.ok) return NextResponse.json(report);

  // Enrich what was just collected. Failures here must not lose the sample, so
  // each stage is reported separately rather than allowed to throw.
  const entity = await runEntityVerification().catch((e) => ({ ok: false, error: String(e?.message ?? e) }));
  const classified = await runClassification().catch((e) => ({ ok: false, error: String(e?.message ?? e) }));

  return NextResponse.json({ ...report, entity, classified });
}

// Vercel Cron issues GET; manual triggers may POST.
export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
