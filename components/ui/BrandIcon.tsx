import * as si from "simple-icons";

/* Real brand logos, rendered from the `simple-icons` package (CC0 icon set; the
   marks themselves remain their owners' trademarks — fair nominative use).

   Coverage note, verified against the installed package: Nike, Adidas, Puma,
   Notion, Looker, Jira, Zapier, Webflow, Contentful and Shopify are present.
   Slack, HubSpot, Salesforce and Google Analytics are NOT — those companies had
   their icons removed from the set at their own request, so they must come from
   an official press-kit file dropped into /public/logos (see <LogoWall>), never
   from a hand-drawn approximation.

   `mono` renders the mark in the surrounding text color (the wall/row treatment);
   omit it to use the brand's own hex. */

export function hasBrandIcon(name: string): boolean {
  return Boolean(lookup(name));
}

function lookup(name: string): { path: string; title: string; hex: string } | null {
  const key = "si" + name.replace(/[^A-Za-z0-9]/g, "");
  const icon = (si as unknown as Record<string, { path: string; title: string; hex: string }>)[key];
  return icon ?? null;
}

export default function BrandIcon({
  name,
  size = 22,
  mono = true,
  color,
}: {
  /** brand name, e.g. "Nike", "Adidas", "Notion" */
  name: string;
  size?: number;
  /** render in currentColor rather than the brand hex */
  mono?: boolean;
  /** explicit override */
  color?: string;
}) {
  const icon = lookup(name);
  if (!icon) return null;
  return (
    <svg
      role="img"
      aria-label={name}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color ?? (mono ? "currentColor" : `#${icon.hex}`)}
      style={{ display: "block", flex: "none" }}
    >
      <title>{icon.title}</title>
      <path d={icon.path} />
    </svg>
  );
}
