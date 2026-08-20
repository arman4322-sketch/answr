import fs from "node:fs";
import path from "node:path";
import BrandIcon, { hasBrandIcon } from "@/components/ui/BrandIcon";

/* Customer logo wall + inline brand lockups.

   Every brand slot resolves in three tiers, best asset first:
     1. the official brand file at /public/logos/<file>, if it has been dropped in
     2. the `simple-icons` glyph, when that brand is in the set (see <BrandIcon>)
     3. a styled wordmark — always correct, never a hand-drawn logo

   So the page is never broken by a missing asset and no code change is needed once
   a licensed file lands in /public/logos (this is a server component; it checks the
   filesystem at render).

   Use each brand's REVERSED / WHITE logo variant: the wall sits on a near-black
   ground (#0e0f11). Official assets:
   - Bell — brand/media centre (bce.ca press-room / Bell brand guidelines)
   - MTY Food Group — investor-relations media kit (mtygroup.com)
   - Slack, HubSpot, Google Analytics — press kits; these brands are deliberately
     absent from simple-icons, so tier 2 can never cover them.
   Trademarked marks: use the licensed file, don't recreate it by hand. */

export type LogoSlot = {
  /** brand name — also the wordmark fallback and the img alt text */
  name: string;
  /** filename inside /public/logos, e.g. "bell.svg" */
  file: string;
  /** rendered height in px (width auto) — tune per mark's aspect ratio */
  height?: number;
  /** styles for the wordmark fallback, to match the design's muted treatment */
  fallbackStyle?: React.CSSProperties;
  /**
   * simple-icons brand name when it differs from the label (e.g. "Jira Software"
   * → "Jira"). Pass `false` to force the wordmark — use that whenever the label
   * names a different product than the available mark.
   */
  icon?: string | false;
};

const WORDMARK_BASE: React.CSSProperties = {
  fontSize: "16.5px",
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: "var(--fnt)",
};

/** Path under /logos for a dropped-in official asset, or null when absent. */
export function logoAsset(file?: string): string | null {
  if (!file) return null;
  return fs.existsSync(path.join(process.cwd(), "public", "logos", file)) ? `/logos/${file}` : null;
}

function iconNameFor(slot: { name: string; icon?: string | false }): string | null {
  if (slot.icon === false) return null;
  const candidate = slot.icon ?? slot.name;
  return hasBrandIcon(candidate) ? candidate : null;
}

/**
 * Inline mark + label, for integration rows and stack strips. Inherits the
 * surrounding font size and color, so it drops into existing copy untouched.
 */
export function BrandLockup({
  name,
  file,
  icon,
  size = 14,
  gap = 7,
  style,
}: {
  name: string;
  file?: string;
  icon?: string | false;
  size?: number;
  gap?: number;
  style?: React.CSSProperties;
}) {
  const src = logoAsset(file);
  const iconName = iconNameFor({ name, icon });
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: `${gap}px`, ...style }}>
      {src ? (
        <img src={src} alt="" height={size + 4} style={{ height: `${size + 4}px`, width: "auto", display: "block", opacity: 0.82 }} />
      ) : iconName ? (
        <BrandIcon name={iconName} size={size} />
      ) : null}
      <span>{name}</span>
    </span>
  );
}

export default function LogoWall({
  eyebrow,
  logos,
  gap = 64,
  note,
}: {
  eyebrow: string;
  logos: LogoSlot[];
  gap?: number;
  /** honest qualifier printed under the wall, in the muted footnote style */
  note?: string;
}) {
  return (
    <div className="mkt-logowall" style={{ padding: "44px 48px 40px", borderTop: "1px solid var(--brd)", textAlign: "center" }}>
      <div
        style={{
          fontSize: "10.5px",
          fontWeight: 500,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: ".18em",
          textTransform: "uppercase",
          color: "var(--fnt)",
        }}
      >
        {eyebrow}
      </div>
      <div className="mkt-logowall-row" style={{ display: "flex", justifyContent: "center", gap: `${gap}px`, marginTop: "24px", alignItems: "center", flexWrap: "wrap" }}>
        {logos.map((l) => {
          const src = logoAsset(l.file);
          if (src) {
            return (
              <img
                key={l.name}
                src={src}
                alt={l.name}
                height={l.height ?? 26}
                style={{
                  height: `${l.height ?? 26}px`,
                  width: "auto",
                  display: "block",
                  /* Sits the mark into the muted wall without altering brand color
                     on hover-free static display; drop this line to show full color. */
                  opacity: 0.82,
                }}
              />
            );
          }
          const iconName = iconNameFor(l);
          if (iconName) {
            return (
              <span key={l.name} style={{ display: "inline-flex", alignItems: "center", gap: "10px", ...WORDMARK_BASE, ...l.fallbackStyle }}>
                <BrandIcon name={iconName} size={Math.round((l.height ?? 26) * 0.8)} />
                {l.name}
              </span>
            );
          }
          return (
            <span key={l.name} style={{ ...WORDMARK_BASE, ...l.fallbackStyle }}>
              {l.name}
            </span>
          );
        })}
      </div>
      {note ? (
        <div style={{ fontSize: "10.5px", color: "var(--fnt)", marginTop: "18px", lineHeight: 1.5 }}>{note}</div>
      ) : null}
    </div>
  );
}
