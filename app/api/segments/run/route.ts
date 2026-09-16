import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { runSegmentSampler } from "@/lib/sampler/segments";
import { getSegmentMetrics } from "@/lib/live/segments";
import { runEntityVerification } from "@/lib/live/entity";
import {
  trackedRegions,
  saveTrackedRegions,
  listAudiences,
  saveAudiences,
  suggestAudiences,
  REGION_CATALOG,
} from "@/lib/segments/catalog";
import type { SegmentKind } from "@/lib/segments/types";

/* Segmented sampling — Regions and Audiences.
 *
 *   GET  ?kind=region|audience    current figures + what is configured
 *   POST {kind, action}           "sample" runs a pass; "suggest" proposes
 *                                 audiences; "save" stores the tracked set
 *
 * A sampling pass costs real provider calls: prompts × segments × lanes. It is
 * capped by promptLimit (default 3) and by the tracked-segment list, and the
 * response reports exactly how many calls it made.
 *
 * Auth: the dashboard cookie, or the cron/ingest secret. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 800;

function secret(): string | undefined {
  return (process.env.CRON_SECRET ?? process.env.ANSWR_INGEST_SECRET)?.trim() || undefined;
}
function presented(req: Request): string | undefined {
  const m = (req.headers.get("authorization") ?? "").match(/^Bearer\s+(.+)$/i);
  return (m?.[1] ?? req.headers.get("x-cron-secret") ?? "").trim() || undefined;
}
async function authorized(req: Request): Promise<boolean> {
  const jar = await cookies();
  if (isUnlocked(jar.get(GATE_COOKIE)?.value)) return true;
  const s = secret();
  return !!s && presented(req) === s;
}

function kindOf(v: unknown): SegmentKind | null {
  return v === "region" || v === "audience" ? v : null;
}

export async function GET(req: Request) {
  if (!(await authorized(req))) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const kind = kindOf(new URL(req.url).searchParams.get("kind")) ?? "region";
  const [metrics, configured] = await Promise.all([
    getSegmentMetrics(kind),
    kind === "region" ? trackedRegions() : listAudiences(),
  ]);
  return NextResponse.json({
    ok: true,
    kind,
    metrics,
    configured,
    ...(kind === "region" ? { catalog: REGION_CATALOG.map((r) => ({ id: r.id, label: r.label })) } : {}),
  });
}

export async function POST(req: Request) {
  if (!(await authorized(req))) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    /* an empty body is fine: defaults to sampling regions */
  }

  const kind = kindOf(body.kind) ?? "region";
  const action = typeof body.action === "string" ? body.action : "sample";

  if (action === "suggest") {
    if (kind !== "audience") {
      return NextResponse.json({ ok: false, error: "Only audiences are generated." }, { status: 400 });
    }
    const suggested = await suggestAudiences();
    if (suggested.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Couldn't propose audiences. Check that a model key is connected and the workspace has a category." },
        { status: 400 },
      );
    }
    const saved = await saveAudiences(suggested);
    return NextResponse.json({ ok: true, kind, audiences: saved });
  }

  if (action === "save") {
    if (kind === "region") {
      const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
      return NextResponse.json({ ok: true, kind, regions: await saveTrackedRegions(ids) });
    }
    const list = Array.isArray(body.audiences) ? (body.audiences as Record<string, unknown>[]) : [];
    const saved = await saveAudiences(
      list.map((a) => ({
        id: String(a?.id ?? ""),
        label: String(a?.label ?? ""),
        persona: String(a?.persona ?? ""),
        note: a?.note ? String(a.note) : undefined,
      })),
    );
    return NextResponse.json({ ok: true, kind, audiences: saved });
  }

  // action === "sample"
  const report = await runSegmentSampler({
    kind,
    ids: Array.isArray(body.ids) ? body.ids.map(String) : undefined,
    promptLimit: Number.isFinite(Number(body.promptLimit)) ? Math.max(1, Math.min(10, Number(body.promptLimit))) : undefined,
  });

  if (!report.ok) {
    return NextResponse.json({ ok: false, kind, report, error: reasonText(report.reason, kind) }, { status: 400 });
  }

  // Fresh answers need judging before they can be scored against a shared name.
  const verification = await runEntityVerification();
  return NextResponse.json({ ok: true, kind, report, verification, metrics: await getSegmentMetrics(kind) });
}

function reasonText(reason: string | undefined, kind: SegmentKind): string {
  switch (reason) {
    case "no-providers":
      return "No answer-engine keys are connected. Add one in Settings › Integrations.";
    case "no-workspace":
      return "No brand is configured yet. Finish onboarding first.";
    case "no-segments":
      return kind === "region"
        ? "No regions are being tracked. Choose some first."
        : "No audiences are defined yet. Generate them first.";
    case "no-prompts":
      return "The workspace has no tracked prompts to run.";
    default:
      return "The sampling pass could not run.";
  }
}
