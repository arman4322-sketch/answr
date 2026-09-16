import { NextResponse } from "next/server";
import { authorizedTenant } from "@/lib/tenant";
import { addPrompt, listPrompts } from "@/lib/db/entities";
import { db } from "@/lib/db";

/* Tracked-prompt write path. Persists prompts a user adds (durable once KV is
   set) and feeds them to the sampler (lib/sampler/run + lib/sampler/job read
   these through listPrompts(workspaceId)).

   Tenancy: every read and write is scoped to the CALLER'S workspace, resolved
   once per request by lib/tenant. This route used to hardcode a single "demo"
   bucket, which meant one account's prompt text was readable by every other
   account — and, because the sampler reads `listPrompts(workspaceId)` with the
   real id, prompts added here were never sampled for anyone. Both follow from
   the same constant, and both are fixed by resolving the tenant instead.

   An unidentified caller gets 401, not the demo workspace. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const tenant = await authorizedTenant();
  if (!tenant) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  let texts: string[] = [];
  try {
    const body = (await req.json()) as { prompts?: unknown };
    if (Array.isArray(body.prompts)) {
      texts = body.prompts.map((p) => String(p).trim()).filter(Boolean).slice(0, 500);
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }
  if (texts.length === 0) {
    return NextResponse.json({ ok: false, error: "No prompts provided." }, { status: 400 });
  }
  const added = [];
  for (const t of texts) added.push(await addPrompt(tenant.workspaceId, t.slice(0, 400)));
  const total = (await listPrompts(tenant.workspaceId)).length;
  return NextResponse.json({ ok: true, added: added.length, total, durable: db().durable });
}

export async function GET() {
  const tenant = await authorizedTenant();
  if (!tenant) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const prompts = await listPrompts(tenant.workspaceId);
  return NextResponse.json({ ok: true, count: prompts.length, prompts, durable: db().durable });
}
