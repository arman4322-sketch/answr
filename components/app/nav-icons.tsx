/* Nav glyphs — 14px box, 1.4 stroke, currentColor, per NAVIGATION.md.
   Geometry lifted verbatim from the canvas frame "Nav option A". */

const ICONS: Record<string, React.ReactNode> = {
  overview: (
    <>
      <rect x="1.5" y="7.5" width="3" height="5" rx="1" />
      <rect x="5.5" y="4.5" width="3" height="8" rx="1" />
      <rect x="9.5" y="1.5" width="3" height="11" rx="1" />
    </>
  ),
  insights: (
    <>
      <circle cx="7" cy="7" r="5.2" />
      <circle cx="7" cy="7" r="1.4" />
    </>
  ),
  citations: (
    <>
      <path d="M2 4.5h4v4H2zM8 4.5h4v4H8" />
      <path d="M2 8.5c0 2 1 2.6 2 3M8 8.5c0 2 1 2.6 2 3" />
    </>
  ),
  prompts: (
    <>
      <rect x="1.8" y="2.5" width="10.4" height="7.5" rx="2" />
      <path d="M4.5 12l1.8-2" />
    </>
  ),
  conversations: (
    <>
      <rect x="1.5" y="2" width="8" height="6" rx="2" />
      <path d="M5 10.2h5.2a2 2 0 002-2V5.6" />
    </>
  ),
  demand: (
    <>
      <path d="M2 10.5l3.4-3.8 2.6 2.2 4-5.4" />
      <path d="M9.4 3.5H12v2.6" />
    </>
  ),
  actions: (
    <>
      <rect x="1.8" y="1.8" width="10.4" height="10.4" rx="2.4" />
      <path d="M4.6 7.2l1.8 1.8 3.2-3.6" />
    </>
  ),
  workflows: (
    <>
      <circle cx="3.4" cy="3.4" r="1.6" />
      <circle cx="10.6" cy="10.6" r="1.6" />
      <path d="M3.4 5v3.6a2 2 0 002 2h3.6" />
    </>
  ),
  reports: (
    <>
      <rect x="2.6" y="1.6" width="8.8" height="10.8" rx="2" />
      <path d="M5 5h4M5 7.4h4M5 9.8h2.4" />
    </>
  ),
  agents: (
    <>
      <rect x="1.8" y="2.2" width="10.4" height="3.6" rx="1.4" />
      <rect x="1.8" y="8.2" width="10.4" height="3.6" rx="1.4" />
    </>
  ),
  live: <path d="M1.5 7.6h2.6l1.6-4.2 2.2 7 1.5-2.8h3.1" />,
  search: (
    <>
      <circle cx="6.2" cy="6.2" r="4" />
      <path d="M9.2 9.2L12.4 12.4" />
    </>
  ),
};

export type NavIconName = keyof typeof ICONS;

export default function NavIcon({ name, size = 14 }: { name: string; size?: number }) {
  const glyph = ICONS[name];
  if (!glyph) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flex: "none", opacity: 0.9 }}
    >
      {glyph}
    </svg>
  );
}
