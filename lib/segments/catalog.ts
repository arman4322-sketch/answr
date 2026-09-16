import { db } from "@/lib/db";
import { pickProvider } from "@/lib/providers/registry";
import { getWorkspace } from "@/lib/workspace";
import type { AudienceSegment, RegionSegment } from "./types";

/* What gets tracked, and where it is stored.
 *
 * Regions come from a fixed catalogue: the location a lane needs is an ISO
 * country code plus, for the Google AI Overviews lane, Google's numeric
 * location criterion. Those are facts, not preferences, so they live in code.
 * Which of them a deployment tracks is a preference, so that lives in the db.
 *
 * Audiences are brand-specific — "a procurement lead at a 5,000-person
 * retailer" means nothing for a running-shoe brand — so they are generated
 * from the workspace's own category and then stored and editable. */

/* ------------------------------------------------------------------ */
/* regions                                                             */
/* ------------------------------------------------------------------ */

/** Google location criterion ids are 2000 + the ISO-3166 numeric code. */
export const REGION_CATALOG: RegionSegment[] = [
  { kind: "region", id: "us", label: "United States", location: { country: "US", language: "en", locationCode: 2840, timezone: "America/New_York", label: "the United States" } },
  { kind: "region", id: "gb", label: "United Kingdom", location: { country: "GB", language: "en", locationCode: 2826, timezone: "Europe/London", label: "the United Kingdom" } },
  { kind: "region", id: "ca", label: "Canada", location: { country: "CA", language: "en", locationCode: 2124, timezone: "America/Toronto", label: "Canada" } },
  { kind: "region", id: "au", label: "Australia", location: { country: "AU", language: "en", locationCode: 2036, timezone: "Australia/Sydney", label: "Australia" } },
  { kind: "region", id: "de", label: "Germany", location: { country: "DE", language: "de", locationCode: 2276, timezone: "Europe/Berlin", label: "Germany" } },
  { kind: "region", id: "fr", label: "France", location: { country: "FR", language: "fr", locationCode: 2250, timezone: "Europe/Paris", label: "France" } },
  { kind: "region", id: "in", label: "India", location: { country: "IN", language: "en", locationCode: 2356, timezone: "Asia/Kolkata", label: "India" } },
  { kind: "region", id: "jp", label: "Japan", location: { country: "JP", language: "ja", locationCode: 2392, timezone: "Asia/Tokyo", label: "Japan" } },
  { kind: "region", id: "br", label: "Brazil", location: { country: "BR", language: "pt", locationCode: 2076, timezone: "America/Sao_Paulo", label: "Brazil" } },
  { kind: "region", id: "nl", label: "Netherlands", location: { country: "NL", language: "nl", locationCode: 2528, timezone: "Europe/Amsterdam", label: "the Netherlands" } },
  { kind: "region", id: "es", label: "Spain", location: { country: "ES", language: "es", locationCode: 2724, timezone: "Europe/Madrid", label: "Spain" } },
  { kind: "region", id: "sg", label: "Singapore", location: { country: "SG", language: "en", locationCode: 2702, timezone: "Asia/Singapore", label: "Singapore" } },
];

/** Tracked out of the box: the largest English-speaking answer-engine markets. */
const DEFAULT_REGION_IDS = ["us", "gb", "ca", "au"];

const SETTINGS = "segment_settings";
const REGION_SETTING_ID = "regions";

interface TrackedRegions {
  id: string;
  ids: string[];
  updatedAt: number;
}

export function regionById(id: string): RegionSegment | undefined {
  return REGION_CATALOG.find((r) => r.id === id);
}

/** The regions this deployment tracks. */
export async function trackedRegions(): Promise<RegionSegment[]> {
  const saved = await db().get<TrackedRegions>(SETTINGS, REGION_SETTING_ID).catch(() => null);
  const ids = saved?.ids?.length ? saved.ids : DEFAULT_REGION_IDS;
  return ids.map(regionById).filter((r): r is RegionSegment => !!r);
}

export async function saveTrackedRegions(ids: string[]): Promise<RegionSegment[]> {
  const valid = [...new Set(ids)].filter((id) => !!regionById(id)).slice(0, 12);
  await db().put<TrackedRegions>(SETTINGS, { id: REGION_SETTING_ID, ids: valid, updatedAt: Date.now() });
  return trackedRegions();
}

/* ------------------------------------------------------------------ */
/* audiences                                                           */
/* ------------------------------------------------------------------ */

const AUDIENCES = "audiences";

interface StoredAudience extends AudienceSegment {
  createdAt: number;
}

export async function listAudiences(): Promise<AudienceSegment[]> {
  const rows = await db().list<StoredAudience>(AUDIENCES).catch(() => []);
  return rows
    .sort((a, b) => a.createdAt - b.createdAt)
    .map(({ kind, id, label, persona, note }) => ({ kind, id, label, persona, note }));
}

export async function saveAudiences(list: Omit<AudienceSegment, "kind">[]): Promise<AudienceSegment[]> {
  const now = Date.now();
  let i = 0;
  for (const a of list.slice(0, 8)) {
    const id = slug(a.id || a.label);
    if (!id || !a.label || !a.persona) continue;
    await db().put<StoredAudience>(AUDIENCES, {
      kind: "audience",
      id,
      label: a.label.slice(0, 60),
      persona: a.persona.slice(0, 400),
      note: a.note?.slice(0, 160),
      createdAt: now + i++,
    });
  }
  return listAudiences();
}

export async function clearAudiences(): Promise<void> {
  for (const a of await listAudiences()) await db().remove(AUDIENCES, a.id);
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

function firstJson<T>(text: string): T | null {
  const cleaned = text.replace(/```(?:json)?/gi, "");
  const start = cleaned.search(/[[{]/);
  if (start < 0) return null;
  for (let end = cleaned.length; end > start; end--) {
    try {
      return JSON.parse(cleaned.slice(start, end)) as T;
    } catch {
      /* keep shrinking */
    }
  }
  return null;
}

/**
 * Propose the buyer segments worth tracking for the configured brand.
 *
 * Generated rather than fixed, because the segments that matter are a property
 * of the category. Returns [] when there is nothing to base them on — an empty
 * Audiences screen is better than four invented personas.
 */
export async function suggestAudiences(): Promise<AudienceSegment[]> {
  const ws = await getWorkspace();
  const provider = pickProvider();
  if (!ws || !provider) return [];

  const identity = ws.identity;
  const prompt =
    `A brand wants to know how AI assistants describe it to DIFFERENT KINDS OF BUYER.\n\n` +
    `Brand: ${ws.brand}${ws.domain ? ` (${ws.domain})` : ""}\n` +
    (identity?.description ? `What it is: ${identity.description}\n` : "") +
    `Category: ${ws.category || "unknown"}\n` +
    (ws.competitors.length ? `Competitors: ${ws.competitors.join(", ")}\n` : "") +
    `\nPropose 4 distinct buyer segments for this brand — the kinds of people who would ask an ` +
    `AI assistant for a recommendation in this category, and who would weigh the answer differently ` +
    `(different budget, scale, expertise or priorities).\n\n` +
    `For each, write a "persona" line in the FIRST PERSON, as that buyer would set the scene before ` +
    `asking a question. One or two sentences. It must not name ${ws.brand} or any competitor, and it ` +
    `must not ask a question — it is only the framing.\n\n` +
    `Return ONLY minified JSON: [{"id":"kebab-case","label":"3-5 words","persona":"","note":"what makes this buyer different, under 12 words"}]`;

  try {
    const r = await provider.sample(prompt, { grounding: false, timeoutMs: 45_000 });
    const parsed = firstJson<Record<string, unknown>[]>(r.text);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((a) => ({
        kind: "audience" as const,
        id: slug(String(a?.id ?? a?.label ?? "")),
        label: String(a?.label ?? "").trim().slice(0, 60),
        persona: String(a?.persona ?? "").trim().slice(0, 400),
        note: String(a?.note ?? "").trim().slice(0, 160) || undefined,
      }))
      .filter((a) => a.id && a.label && a.persona)
      .slice(0, 6);
  } catch {
    return [];
  }
}
