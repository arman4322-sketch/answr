import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { gemini } from "@/lib/providers/gemini";

/* AI brand detection — given a website URL, identify the brand name, category,
   and a few aliases/owned domains. Powers onboarding step 1. Gated. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cap = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

function hostOf(url: string): string {
  return url.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "").toLowerCase();
}
function nameFromHost(host: string): string {
  const base = host.split(".")[0] || host;
  return base.charAt(0).toUpperCase() + base.slice(1);
}
function parseJson(text: string): Record<string, unknown> | null {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const jar = await cookies();
  if (!isUnlocked(jar.get(GATE_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  if (!gemini.isConfigured()) {
    return NextResponse.json({ ok: false, error: "No LLM key configured. Set GEMINI_API_KEY." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }
  const url = cap(body.url, 160);
  if (!url) return NextResponse.json({ ok: false, error: "Enter a website." }, { status: 400 });
  const host = hostOf(url);

  const prompt =
    `Identify the company or brand at the website "${host}". ` +
    `Return ONLY strict minified JSON (no markdown, no code fences) of the form ` +
    `{"name":"<brand name>","category":"<short descriptor e.g. 'fast food restaurants'>","aliases":["<sub-brand, product line, or owned domain>","..."]}. ` +
    `Give 2 to 4 aliases. If the brand is unknown, infer a sensible name from the domain.`;

  let text = "";
  try {
    const r = await gemini.sample(prompt, { grounding: false, timeoutMs: 25000 });
    text = r.text;
  } catch (e) {
    // Graceful fallback: still return a domain-derived name so onboarding proceeds.
    return NextResponse.json({
      ok: true,
      fallback: true,
      name: nameFromHost(host),
      category: "",
      aliases: [host],
      note: `Detection unavailable (${(e as Error).message}); used the domain.`,
    });
  }

  const parsed = parseJson(text);
  const name = cap(parsed?.name, 80) || nameFromHost(host);
  const category = cap(parsed?.category, 80);
  const aliases = Array.isArray(parsed?.aliases)
    ? (parsed!.aliases as unknown[]).map((a) => cap(a, 60)).filter(Boolean).slice(0, 4)
    : [host];

  return NextResponse.json({ ok: true, name, category, aliases, host });
}
