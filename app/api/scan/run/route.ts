import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { answerProviders } from "@/lib/providers/registry";
import { scoreRuns } from "@/lib/scoring";
import type { PromptRun, SampledAnswer } from "@/lib/sampler/store";

/* Live scan — the real-numbers demo endpoint. Given a brand + competitors, it
   queries the connected LLM(s) live for a set of prompts, then runs the real
   scoring engine (lib/scoring) over the answers. Returns genuine visibility /
   share-of-voice / position metrics computed from live model output.

   Free-tier Gemini can't ground (no citations), so we call without grounding;
   the core visibility metrics don't need it. Gated behind the demo cookie so
   the API key isn't burned by anonymous traffic. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const cap = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");
const wordIn = (text: string, name: string) => {
  if (!name) return false;
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${esc}\\b`, "i").test(text);
};

function defaultPrompts(brand: string, category: string): string[] {
  const c = category || `${brand}'s category`;
  return [
    `What are the best ${c}?`,
    `Which ${c} would you recommend, and why?`,
    `What do you think of ${brand}?`,
    `How does ${brand} compare to its main competitors?`,
    `Recommend a ${c} for someone who wants the best quality.`,
  ];
}

export async function POST(req: Request) {
  const jar = await cookies();
  if (!isUnlocked(jar.get(GATE_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const providers = answerProviders();
  if (providers.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No LLM key configured. Add a provider key (e.g. GEMINI_API_KEY or OPENAI_API_KEY) on the deployment." },
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
  if (!brand) return NextResponse.json({ ok: false, error: "Enter a brand to scan." }, { status: 400 });
  const domain = cap(body.domain, 120) || undefined;
  const category = cap(body.category, 120);
  const competitors = Array.isArray(body.competitors)
    ? body.competitors.map((c) => cap(c, 60)).filter(Boolean).slice(0, 8)
    : [];
  const prompts = (Array.isArray(body.prompts) && body.prompts.length
    ? body.prompts.map((p) => cap(p, 300)).filter(Boolean)
    : defaultPrompts(brand, category)
  ).slice(0, 8);

  // Query every configured provider for every prompt, in parallel. One failure
  // (a rate-limited or misconfigured lane) doesn't sink the batch.
  const runs: PromptRun[] = await Promise.all(
    prompts.map(async (prompt, i): Promise<PromptRun> => {
      const answers: SampledAnswer[] = await Promise.all(
        providers.map(async (p): Promise<SampledAnswer> => {
          try {
            const r = await p.sample(prompt, { grounding: false, timeoutMs: 30000 });
            return { provider: r.provider, model: r.model, text: r.text, citations: r.citations };
          } catch (e) {
            return { provider: p.id, model: p.id, text: "", citations: [], error: (e as Error).message };
          }
        }),
      );
      return { id: `scan-${Date.now()}-${i}`, prompt, ts: Date.now(), answers };
    }),
  );

  const scores = scoreRuns(runs, { brand, brandDomain: domain, competitors });

  // Per-prompt breakdown for the UI — combined across every provider's answer.
  const perPrompt = runs.map((run) => {
    const ok = run.answers.filter((a) => !a.error && a.text);
    const combined = ok.map((a) => a.text).join("  ");
    const firstText = ok[0]?.text ?? "";
    return {
      prompt: run.prompt,
      error: ok.length === 0 ? (run.answers[0]?.error ?? "no answer") : null,
      mentioned: wordIn(combined, brand),
      competitorsMentioned: competitors.filter((c) => wordIn(combined, c)),
      excerpt: firstText.slice(0, 240).replace(/\s+/g, " ").trim(),
    };
  });

  const answered = runs.filter((r) => r.answers.some((a) => a.text)).length;

  // Aggregate mention counts for a share-of-voice bar (brand vs each competitor).
  const brandMentions = perPrompt.filter((p) => p.mentioned).length;
  const competitorMentions: Record<string, number> = {};
  for (const c of competitors) {
    competitorMentions[c] = perPrompt.filter((p) => p.competitorsMentioned.includes(c)).length;
  }

  return NextResponse.json({
    ok: true,
    brand,
    domain: domain ?? null,
    competitors,
    model: providers.map((p) => p.label).join(", "),
    providersUsed: providers.map((p) => p.label),
    ranAt: Date.now(),
    promptsRun: prompts.length,
    promptsAnswered: answered,
    grounded: false, // free tier — citations require a paid (grounded) key
    scores,
    brandMentions,
    competitorMentions,
    perPrompt,
  });
}
