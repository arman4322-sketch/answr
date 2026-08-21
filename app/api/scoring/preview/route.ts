import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";
import { answerStore, type PromptRun } from "@/lib/sampler/store";
import { scoreRuns } from "@/lib/scoring";

/* Scoring preview — shows the scoring engine working today, with no keys.
   If the answer store has real sampler runs, it scores those; otherwise it
   scores a small built-in synthetic example so the math is demonstrable
   immediately. Gated behind the demo access cookie. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYNTHETIC: PromptRun[] = [
  {
    id: "demo-1",
    prompt: "What are the best running shoes for marathon training?",
    ts: 0,
    answers: [
      { provider: "perplexity", model: "sonar", text: "Nike leads for race-day speed; Adidas is a solid alternative and Brooks is great for stability.", citations: [{ url: "https://nike.com/running" }, { url: "https://runnersworld.com/x" }] },
      { provider: "gemini", model: "gemini-2.5-flash", text: "Adidas and Brooks are popular; Nike also appears frequently for cushioning.", citations: [{ url: "https://adidas.com/y" }] },
    ],
  },
  {
    id: "demo-2",
    prompt: "Which brands make the most sustainable athletic wear?",
    ts: 0,
    answers: [
      { provider: "perplexity", model: "sonar", text: "Allbirds and Adidas lead on sustainability; Nike has its Move to Zero program.", citations: [{ url: "https://adidas.com/z" }] },
      { provider: "anthropic", model: "claude-haiku", text: "Nike, Adidas and Patagonia are frequently cited for sustainable materials.", citations: [] },
    ],
  },
];

export async function GET() {
  const jar = await cookies();
  if (!isUnlocked(jar.get(GATE_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const stored = await answerStore().recentRuns(200);
  const usingReal = stored.length > 0;
  const runs = usingReal ? stored : SYNTHETIC;

  const scores = scoreRuns(runs, {
    brand: "Nike",
    brandDomain: "nike.com",
    competitors: ["Adidas", "Brooks", "Asics", "New Balance", "Saucony"],
  });

  return NextResponse.json({
    ok: true,
    source: usingReal ? "sampler-runs" : "synthetic-example",
    runsScored: runs.length,
    scores,
  });
}
