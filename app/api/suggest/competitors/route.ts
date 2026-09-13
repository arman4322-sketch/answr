import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { gemini } from "@/lib/providers/gemini";

/* AI competitor suggestions — given a brand (+ website + category), ask the LLM
   for its main competitors. Powers the "Suggest with AI" button in the
   Add-a-brand modal. Gated behind the demo cookie so the key isn't burned. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cap = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

export async function POST(req: Request) {
  const jar = await cookies();
  if (!isUnlocked(jar.get(GATE_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  if (!gemini.isConfigured()) {
    return NextResponse.json(
      { ok: false, error: "No LLM key configured. Set GEMINI_API_KEY on the deployment." },
      { status: 400 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const brand = cap(body.brand, 80);
  if (!brand) return NextResponse.json({ ok: false, error: "Enter the brand name first." }, { status: 400 });
  const domain = cap(body.domain, 120);
  const category = cap(body.category, 120);

  const ctx = [domain && `website ${domain}`, category && `in the ${category} space`].filter(Boolean).join(", ");
  const prompt =
    `Name the main competitor brands of "${brand}"${ctx ? ` (${ctx})` : ""}. ` +
    `Return ONLY a comma-separated list of 5 to 7 real competitor brand names, most relevant first. ` +
    `No numbering, no descriptions, no extra text, and do not include "${brand}" itself.`;

  let text: string;
  try {
    const r = await gemini.sample(prompt, { grounding: false, timeoutMs: 25000 });
    text = r.text;
  } catch (e) {
    return NextResponse.json({ ok: false, error: `Suggestion failed: ${(e as Error).message}` }, { status: 502 });
  }

  // Parse the model output robustly: split on commas/newlines, strip bullets/numbers.
  const brandLc = brand.toLowerCase();
  const seen = new Set<string>();
  const competitors: string[] = [];
  for (const raw of text.split(/[,\n]+/)) {
    const name = raw
      .replace(/^\s*[-*\d.)\]]+\s*/, "") // leading bullets / "1." / "1)"
      .replace(/^["'`]|["'`.]+$/g, "")
      .trim();
    if (!name || name.length > 40) continue;
    const lc = name.toLowerCase();
    if (lc === brandLc || seen.has(lc)) continue;
    seen.add(lc);
    competitors.push(name);
    if (competitors.length >= 7) break;
  }

  if (competitors.length === 0) {
    return NextResponse.json({ ok: false, error: "Couldn't parse suggestions — try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, competitors });
}
