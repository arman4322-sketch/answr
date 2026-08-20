import { AI_REFERRERS, BOTS } from "@/lib/bots";
import { MAX_EVENTS } from "./types";

/* Always-true facts about the capture pipeline.

   /app/live is the one screen with no fixture behind it, so on a cold instance
   it can legitimately have zero events to show. These numbers give it substance
   at zero WITHOUT inventing data: every one of them is derived at build time
   from the catalog the pipeline actually uses (lib/bots.ts) and the retention
   constant every store implementation obeys (MAX_EVENTS). Nothing here is a
   fixture and nothing here is a claim about traffic.

   Drift note: proxy.ts carries its own copy of the UA pattern strings (it runs
   in the proxy runtime and must stay import-light). The two lists are identical
   today; `uaPatterns` below describes the catalog, and PIPELINE_STEPS says the
   proxy matches against it. If a bot is ever added to one list only, fix the
   other — or export the list from lib/bots and have proxy.ts import it. */

const operators = new Set(BOTS.map((b) => b.operator));

export const PIPELINE = {
  /** AI user-agent patterns in the catalog the proxy matches against */
  uaPatterns: BOTS.length,
  /** distinct operators represented (OpenAI, Anthropic, Perplexity, …) */
  operators: operators.size,
  /** patterns classified as training/search crawlers */
  crawlerPatterns: BOTS.filter((b) => b.kind === "crawler").length,
  /** patterns classified as live assistant fetches (a user asked, the model fetched) */
  assistantPatterns: BOTS.filter((b) => b.kind === "assistant-fetch").length,
  /** assistants recognised as referral sources on the human side */
  referralSources: AI_REFERRERS.length,
  /** events retained per store, identical across memory and Redis */
  retention: MAX_EVENTS,
  /** poll cadence of the /app/live view, in seconds */
  refreshSeconds: 10,
} as const;

export type PipelineStep = { name: string; detail: string };

/** The capture path, in the order a request travels it. */
export const PIPELINE_STEPS: PipelineStep[] = [
  { name: "Request", detail: "any hit on this deployment" },
  { name: "proxy.ts", detail: `UA matched against ${PIPELINE.uaPatterns} patterns` },
  { name: "POST /api/ingest", detail: "classified, non-blocking" },
  { name: "TelemetryStore", detail: `last ${PIPELINE.retention} events` },
  { name: "/api/telemetry", detail: "this view" },
];

/** What one captured crawler event carries — mirrors CrawlerEvent in ./types. */
export const EVENT_FIELDS = ["agent", "operator", "path", "HTTP status", "verification", "timestamp"];
