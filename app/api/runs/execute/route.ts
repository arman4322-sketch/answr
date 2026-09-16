import { NextResponse } from "next/server";
import { startJob, stepJob } from "@/lib/sampler/job";
import { anyProviderConfigured, providerStatuses } from "@/lib/providers/registry";
import { isWorkspaceId, DEMO_WORKSPACE_ID } from "@/lib/tenant";

/* Sampler trigger — the endpoint Vercel Cron (or a manual call) hits to run the
   nightly answer sample. See lib/sampler/job.ts and vercel.json.

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
   reports readiness, so scheduling it on a fresh deployment is harmless.

   Tenancy: this route is authenticated by the SECRET, never by a cookie, so
   there is no session to resolve a workspace from — Vercel Cron issues a bare
   GET. It therefore samples the DEMO workspace explicitly, which is the tracked
   showcase the nightly schedule exists for. An operator holding the secret can
   point a manual call at another tenant with `?workspaceId=`, validated with
   isWorkspaceId. It is never inferred: an unattended job must not guess whose
   provider credits it is about to spend. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Three stages across every configured lane; the sample alone can take minutes.
// Vercel caps a serverless function at 300s on the Hobby plan, and a value
// above the plan limit fails the DEPLOY, not the build — the build succeeds and
// then "Deploying outputs" errors with invalid_max_duration. 300 is the ceiling
// here; anything that needs longer has to be stepped across requests (see
// lib/sampler/job.ts and /api/runs/step), not given a bigger timeout.
export const maxDuration = 300;

/* Stop stepping with room to spare so the response is actually returned rather
   than the function being killed holding an unreported result. */
const BUDGET_MS = 240_000;

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

  // Resolve the tenant once; every step operates on the SAME workspace.
  const named = new URL(req.url).searchParams.get("workspaceId");
  const workspaceId = isWorkspaceId(named) ? named : DEMO_WORKSPACE_ID;

  /* Drive the stepped job engine against a clock rather than running the whole
     pass in one call. A full pass is prompts x lanes plus two enrichment
     stages, which on this plan's 300s ceiling would simply be killed part way
     through, losing the enrichment and leaving no record of how far it got.
     Stepping means each unit of work is committed as it completes, and an
     invocation that runs out of time returns an honest partial report. */
  const started = await startJob(workspaceId);
  if (!started.ok) {
    return NextResponse.json({ ok: false, workspaceId, reason: "cannot-start", error: started.error }, { status: 400 });
  }

  const deadline = Date.now() + BUDGET_MS;
  let job = started.job;
  let done = job.status !== "running";
  let steps = 0;
  let error: string | undefined;

  while (!done && Date.now() < deadline) {
    const result = await stepJob(workspaceId, job.id);
    steps += 1;
    if (!result.ok) {
      error = result.error;
      if (result.job) job = result.job;
      break;
    }
    job = result.job;
    done = result.done;
  }

  return NextResponse.json({
    ok: !error,
    workspaceId,
    steps,
    complete: done,
    job,
    ...(error ? { error } : {}),
    ...(done
      ? {}
      : {
          note:
            "Ran out of time before finishing. Each completed step is saved, so the next scheduled run " +
            "continues from here, and opening the dashboard finishes it immediately. A pass that will not " +
            "fit in one invocation needs either fewer tracked prompts or a plan with a longer function timeout.",
        }),
  });
}

// Vercel Cron issues GET; manual triggers may POST.
export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
