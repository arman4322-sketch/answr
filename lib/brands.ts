/* Brand presentation helpers — types and derivations only, NO fixture data.
 *
 * This deployment tracks exactly ONE workspace (lib/workspace.ts): a brand, its
 * domain, its category, its competitors and its prompt set. There is no list of
 * brands to keep here, and no stats: every number belongs to lib/live/metrics.
 *
 * What is left is presentation: the square icon in the sidebar needs a letter
 * and a colour, and neither is data. The letter is the brand's first character
 * and the colour is picked deterministically from the name, so the same brand
 * always renders the same square without anything being written down.
 *
 * Server components build this from `getWorkspace()` / `getLiveMetrics().workspace`
 * and pass it down as props; client components never fetch a brand of their own.
 */

/** The minimum a caller needs to describe the tracked brand. Structurally a
 *  `Workspace`, so `brandIdentity(workspace)` just works. */
export type BrandSource = {
  brand: string;
  domain?: string;
  category?: string;
};

/** Everything the UI needs to draw the brand — derived, never stored. */
export type BrandIdentity = {
  name: string;
  /** "" when onboarding did not capture one */
  domain: string;
  /** "" when onboarding did not capture one */
  category: string;
  /** single letter for the square icon */
  initial: string;
  /** deterministic icon gradient, from the app's palette */
  gradient: string;
};

/* Palette taken from the app's own tokens (accent, info blue, gold, good green,
   rose). Which one a brand gets is a hash, not a fixture. */
const GRADIENTS = [
  "linear-gradient(135deg,#a394ff,#6d5ce6)",
  "linear-gradient(135deg,#7fd0e8,#3f8ab0)",
  "linear-gradient(135deg,#e8c47f,#b0823f)",
  "linear-gradient(135deg,#7fd6a8,#3f8a63)",
  "linear-gradient(135deg,#e89aa0,#b04f58)",
] as const;

/** Neutral square for the "nothing configured yet" state. */
export const UNCONFIGURED_GRADIENT = "linear-gradient(135deg,#3e4046,#26272b)";

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Stable icon gradient for a brand name. */
export function brandGradient(name: string): string {
  const key = name.trim().toLowerCase();
  if (!key) return UNCONFIGURED_GRADIENT;
  return GRADIENTS[hash(key) % GRADIENTS.length];
}

/** First letter of the brand name, uppercased. Falls back to "·" for names that
 *  start with something unprintable. */
export function brandInitial(name: string): string {
  const letter = name.trim().match(/[\p{L}\p{N}]/u)?.[0];
  return letter ? letter.toUpperCase() : "·";
}

/** Presentation identity for the configured workspace, or null when there is
 *  none — callers render an honest setup state rather than a placeholder. */
export function brandIdentity(ws: BrandSource | null | undefined): BrandIdentity | null {
  const name = ws?.brand?.trim();
  if (!name) return null;
  return {
    name,
    domain: ws?.domain?.trim() ?? "",
    category: ws?.category?.trim() ?? "",
    initial: brandInitial(name),
    gradient: brandGradient(name),
  };
}

/** "domain · category", with whichever halves exist. Empty when neither does. */
export function brandSubtitle(b: BrandIdentity): string {
  return [b.domain, b.category].filter(Boolean).join(" · ");
}
