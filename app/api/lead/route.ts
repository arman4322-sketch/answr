import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { createLead, listLeads } from "@/lib/db/entities";
import { db } from "@/lib/db";

/* Lead capture — the endpoint the marketing forms (demo, snapshot, handbook,
   signup) POST to. Persists the lead to the data layer (durable once storage is
   configured, in-memory otherwise) and, when RESEND_API_KEY + LEAD_NOTIFY_EMAIL
   are set, emails a notification. Public by design; validates and caps input. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cap = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : undefined);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const email = cap(body.email, 200)?.toLowerCase();
  const company = cap(body.company, 160);
  // Some forms capture an email (demo), others only a domain (snapshot). Accept
  // either, but if an email is provided it must be well-formed.
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "That email doesn't look right." }, { status: 400 });
  }
  if (!email && !company) {
    return NextResponse.json({ ok: false, error: "An email or a domain is required." }, { status: 400 });
  }

  const lead = await createLead({
    email: email ?? "",
    name: cap(body.name, 120),
    company,
    source: cap(body.source, 40) ?? "web",
    message: cap(body.message, 2000),
  });

  await notify(lead.email, lead.source).catch(() => {});

  return NextResponse.json({ ok: true, id: lead.id });
}

/* Read side — captured leads for the owner. Gated behind the demo access cookie.
   Lives in the same route module as POST so the in-memory store is shared even
   in dev (RSC pages are a separate module graph); durable once KV is set. */
export async function GET() {
  const jar = await cookies();
  if (!isUnlocked(jar.get(GATE_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const leads = (await listLeads()).sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ ok: true, durable: db().durable, leads });
}

/* Optional email notification. No-op unless both env vars are set, so it never
   blocks lead capture and needs no account to run the rest of the flow. */
async function notify(email: string, source: string): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const to = process.env.LEAD_NOTIFY_EMAIL?.trim();
  const from = process.env.LEAD_FROM_EMAIL?.trim() || "leads@useanswr.com";
  if (!key || !to) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject: `New Answr lead (${source})`,
      text: `New lead from ${email} via ${source}.`,
    }),
  });
}
