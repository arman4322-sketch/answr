import type { Citation } from "@/lib/providers/types";
import type { BrandIdentity } from "./identity";

/* Entity-aware mention matching.
 *
 * Replaces `text.includes(brand)` everywhere a metric depends on "did this
 * answer mention the brand". A bare string match cannot tell the AEO platform
 * at useanswr.com from the hair-care brand of the same name, so it counted
 * both. This asks a narrower question: the name appears — is the answer about
 * OUR entity?
 *
 * Evidence, strongest first:
 *   1. The answer cites the owned domain, or writes it out. Decisive.
 *   2. The vocabulary around the mention matches the entity profile
 *      (includeTerms) or one of its name-collisions (excludeTerms).
 *   3. Nothing either way. When the name has no known collision that is a
 *      match; when it does, it is genuinely unclear and gets escalated to a
 *      model (lib/live/entity).
 *
 * Pure and synchronous: no keys, no network. Deterministic for the same input,
 * which is what lets the scorer and the dashboards agree. */

export type MentionVerdict =
  /** the name appears and the answer is about this entity */
  | "brand"
  /** the name appears but the answer is about something else of the same name */
  | "other-entity"
  /** the name never appears */
  | "absent"
  /** the name appears and the evidence does not settle it */
  | "unclear";

export interface MentionResult {
  verdict: MentionVerdict;
  /** index of the first occurrence of the name/alias, -1 when absent */
  index: number;
  /** the name or alias that matched */
  matched: string | null;
  include: number;
  exclude: number;
  reason: string;
}

const ABSENT: MentionResult = {
  verdict: "absent", index: -1, matched: null, include: 0, exclude: 0, reason: "name not present",
};

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** First case-insensitive, word-bounded index of `name` in `text`, or -1. */
export function firstIndex(text: string, name: string): number {
  if (!name) return -1;
  const m = new RegExp(`\\b${esc(name)}\\b`, "i").exec(text);
  return m ? m.index : -1;
}

function countTerms(haystack: string, terms: string[]): number {
  let n = 0;
  for (const t of terms) if (t && haystack.includes(t)) n += 1;
  return n;
}

function domainOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function citesOwned(citations: Citation[] | undefined, domain: string): boolean {
  if (!domain) return false;
  const d = domain.toLowerCase();
  return (citations ?? []).some((c) => {
    const h = domainOf(c.url);
    return !!h && (h === d || h.endsWith(`.${d}`));
  });
}

/** Window of text around the mention — where disambiguating words actually sit. */
function window(text: string, index: number, radius = 400): string {
  const start = Math.max(0, index - radius);
  return text.slice(start, index + radius).toLowerCase();
}

/**
 * Decide whether `text` mentions the entity described by `identity`.
 *
 * `citations` are the answer's own citations; a citation of the owned domain is
 * treated as proof the answer is about this entity.
 */
export function matchBrand(
  text: string,
  citations: Citation[] | undefined,
  identity: BrandIdentity,
): MentionResult {
  if (!text) return ABSENT;

  // 1. Locate the name, or any alias for the same entity.
  const candidates = [identity.name, ...identity.aliases].filter(Boolean);
  let index = -1;
  let matched: string | null = null;
  for (const c of candidates) {
    const i = firstIndex(text, c);
    if (i >= 0 && (index < 0 || i < index)) {
      index = i;
      matched = c;
    }
  }
  if (index < 0) return ABSENT;

  const base = { index, matched };

  // 2. Owned domain cited or written out — decisive.
  if (citesOwned(citations, identity.domain)) {
    return { ...base, verdict: "brand", include: 0, exclude: 0, reason: "answer cites the owned domain" };
  }
  if (identity.domain && text.toLowerCase().includes(identity.domain.toLowerCase())) {
    return { ...base, verdict: "brand", include: 0, exclude: 0, reason: "answer names the owned domain" };
  }

  // 3. Vocabulary. Weigh the text near the mention first, then the whole answer.
  const near = window(text, index);
  const whole = text.toLowerCase();
  const include = countTerms(near, identity.includeTerms) * 2 + countTerms(whole, identity.includeTerms);
  const exclude = countTerms(near, identity.excludeTerms) * 2 + countTerms(whole, identity.excludeTerms);

  const otherIs = () => {
    const what = identity.conflicts[0]?.what;
    return what
      ? `reads as ${what.slice(0, 80)} (${exclude} vs ${include})`
      : `matches a name-collision's vocabulary (${exclude} vs ${include})`;
  };

  if (!identity.ambiguous) {
    // Unshared name: any lean decides it, and a tie still counts as the brand,
    // because there is no other candidate the mention could be about.
    if (exclude > include) return { ...base, verdict: "other-entity", include, exclude, reason: otherIs() };
    return {
      ...base,
      verdict: "brand",
      include,
      exclude,
      reason: include > 0 ? `matches this entity's vocabulary (${include} vs ${exclude})` : "name is not shared with another entity",
    };
  }

  /* Contested name. Vocabulary can rule a mention OUT here, but never in.
     Being in the right industry is not being the right company: an answer full
     of category words may still be about a rival of the same name, or about the
     category itself. So a positive verdict for a shared name always traces back
     to hard evidence (the owned domain, handled above) or to an explicit model
     judgement — never to a word count. */
  if (include === 0 && exclude > 0) {
    return { ...base, verdict: "other-entity", include, exclude, reason: otherIs() };
  }
  if (exclude > include * 2) {
    return { ...base, verdict: "other-entity", include, exclude, reason: otherIs() };
  }

  // 4. Everything else about a shared name goes to the model.
  return {
    ...base,
    verdict: "unclear",
    include,
    exclude,
    reason:
      include > 0 && exclude > 0
        ? `describes more than one "${identity.name}" (${include} vs ${exclude})`
        : include > 0
          ? `in this entity's category, but the name is shared (${include} hits)`
          : "name is shared and the answer gives no signal either way",
  };
}

/**
 * The boolean the metrics need. `unclear` counts as a mention only when the
 * caller opts in — the scorer does not, so a contested answer never inflates a
 * score on the strength of a coincidence.
 */
export function mentionsBrand(
  text: string,
  citations: Citation[] | undefined,
  identity: BrandIdentity,
  opts: { countUnclear?: boolean } = {},
): boolean {
  const r = matchBrand(text, citations, identity);
  return r.verdict === "brand" || (r.verdict === "unclear" && !!opts.countUnclear);
}
