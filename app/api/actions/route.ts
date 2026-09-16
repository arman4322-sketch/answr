import { NextResponse } from "next/server";
import { authorizedTenant } from "@/lib/tenant";
import { createAction, listActions } from "@/lib/db/entities";
import { db } from "@/lib/db";

/* Action-item write path. Persists actions created from prompts/insights
   (durable once KV is set).

   Tenancy: scoped to the CALLER'S workspace, resolved once per request by
   lib/tenant. The previous hardcoded "demo" bucket put every account's saved
   actions — their titles, their own impact and effort notes — into one list
   that every other account read back.

   An unidentified caller gets 401, not the demo workspace. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const tenant = await authorizedTenant();
  if (!tenant) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  let title = "";
  let impact = "";
  let effort = "";
  try {
    const body = (await req.json()) as { title?: string; impact?: string; effort?: string };
    title = (body.title ?? "").trim().slice(0, 200);
    impact = (body.impact ?? "").trim().slice(0, 60);
    effort = (body.effort ?? "").trim().slice(0, 60);
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }
  if (!title) return NextResponse.json({ ok: false, error: "A title is required." }, { status: 400 });

  const action = await createAction(tenant.workspaceId, { title, impact, effort });
  const total = (await listActions(tenant.workspaceId)).length;
  return NextResponse.json({ ok: true, id: action.id, total, durable: db().durable });
}

export async function GET() {
  const tenant = await authorizedTenant();
  if (!tenant) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const actions = await listActions(tenant.workspaceId);
  return NextResponse.json({ ok: true, count: actions.length, actions, durable: db().durable });
}
