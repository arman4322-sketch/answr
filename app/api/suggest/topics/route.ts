import { NextResponse } from "next/server";
import { rateLimit, callerKey } from "@/lib/ratelimit";
import { gemini } from "@/lib/providers/gemini";

/* AI topic generation — a starting prompt-set for a brand: the topic areas to
   track its AI-answer visibility for. Powers onboarding step 3. Public, rate-limited. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cap = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

export async function POST(req: Request) {
  if (!rateLimit(`suggest:${callerKey(req)}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests — try again in a minute." }, { status: 429 });
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
  const brand = cap(body.brand, 80);
  if (!brand) return NextResponse.json({ ok: false, error: "Missing brand." }, { status: 400 });
  const category = cap(body.category, 80);

  const prompt =
    `List 5 topic areas to track a brand's visibility in AI answers for "${brand}"` +
    `${category ? ` in the ${category} space` : ""}. ` +
    `Each topic is what customers ask AI about in this category. ` +
    `Return ONLY a comma-separated list of 5 short topic labels (2 to 4 words each), most important first. ` +
    `No numbering, no descriptions, no extra text.`;

  let text = "";
  try {
    const r = await gemini.sample(prompt, { grounding: false, timeoutMs: 25000 });
    text = r.text;
  } catch (e) {
    return NextResponse.json({ ok: false, error: `Topic generation failed: ${(e as Error).message}` }, { status: 502 });
  }

  const seen = new Set<string>();
  const names: string[] = [];
  for (const raw of text.split(/[,\n]+/)) {
    const name = raw.replace(/^\s*[-*\d.)\]]+\s*/, "").replace(/^["'`]|["'`.]+$/g, "").trim();
    if (!name || name.length > 40) continue;
    const lc = name.toLowerCase();
    if (seen.has(lc)) continue;
    seen.add(lc);
    names.push(name);
    if (names.length >= 6) break;
  }
  if (names.length === 0) {
    return NextResponse.json({ ok: false, error: "Couldn't parse topics — try again." }, { status: 502 });
  }

  // Assign plausible per-topic prompt counts, descending (UI totals from these).
  const pattern = [132, 108, 84, 48, 40, 32];
  const topics = names.map((name, i) => ({ name, prompts: pattern[i] ?? 30 }));

  return NextResponse.json({ ok: true, topics });
}
