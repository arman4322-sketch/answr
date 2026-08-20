# Answr build conventions — read fully before touching any page

You are converting staged, pixel-faithful TSX frames into real Next.js routes.
The staged frames in `staging/<canvas>/<frame-id>.tsx` (+ sibling `.css` with hover
rules) were mechanically converted from the design canvases and are the **source of
truth for markup, copy, and data**. Keep body markup and copy verbatim unless a fix
listed in your assignment says otherwise.

## Repo shape

- Next 16.3 App Router, TS, Tailwind v4 (tokens live in `app/globals.css` as CSS vars —
  `--ac --bg0 --bg1 --bg2 --brd --tx --mut --fnt` plus semantic colors; the staged
  frames already reference these vars).
- Route groups: `app/(marketing)/…` (wrapped by shared Nav+Footer), `app/(dash)/app/…`
  (wrapped by shared 236px Sidebar), `app/(auth)/…` (centered dot-grid ground).
- Shared components (DO NOT EDIT; import them):
  - `@/components/marketing/Nav` — top nav with working dropdowns + active states
  - `@/components/marketing/Footer` — 4-column footer
  - `@/components/app/Sidebar` — dashboard sidebar (auto active-state via pathname)
  - `@/components/app/Topbar` — `<Topbar crumb="Citations" />`, optional
    `crumb={["Answer Engine Insights","Regions"]}`, `extra={<pills/>}`,
    `showDateRange` `showPlatforms` `exportLabel` props
- `tools/routes.mjs` maps every frame id → route. Your assignment lists yours.
- Next 16 may differ from your training data. If anything behaves oddly, read the
  relevant guide under `node_modules/next/dist/docs/` before fighting it.

## Page surgery (per frame)

1. Copy `staging/<canvas>/<id>.tsx` body into `app/<group>/<route>/page.tsx`.
2. **Strip canvas furniture**: the outer artboard div
   (`border:1px solid var(--brd); borderRadius:12px; overflow:hidden` wrapper) dies —
   layouts own page chrome now. Keep its CONTENT.
3. **Strip the embedded shell** and rely on the layout:
   - Marketing frames: delete the frame's own nav bar (first child with the logo +
     nav links + "Get a demo") and its footer region (from `borderTop` footer div with
     the 4-column grid to the end). The layout provides both.
   - Dashboard frames: delete the embedded 236px/232px sidebar div and the topbar row;
     replace the topbar with `<Topbar …/>` matching the frame's breadcrumb.
   - Auth frames: keep only the centered card (the layout provides the dot-grid ground).
4. Copy the frame's `.css` next to the page (e.g. `page.css`), import it, and keep the
   frame's scope wrapper `<div className="frame-<id>">` so hover rules keep working.
   Delete rules that referenced shell elements you removed. If the staged `.css` is
   empty, skip the import entirely (empty CSS files break `next build`).
5. Give the page a `metadata` export with a sensible `title`.

## Fidelity & fixes

- Pixel fidelity is the bar: do not "improve" spacing, sizes, colors, or copy beyond
  the explicit fixes in your assignment. The canvases are high-fidelity final intent.
- **Primary buttons** (accent bg + white label in frames): swap to
  `className="btn-ac"` and REMOVE the inline `color`/`background` (audit fix — dark
  label on accent, hover lift included). Keep other inline styles.
- **Interactive semantics**: real CTAs and controls become `<Link>` or
  `<button type="button">`; form fields become labeled `<input>` (use the frame's
  shown value as `defaultValue`, placeholder text as `placeholder`). Don't convert
  every decorative div — just things a user would click/type into.
- **Depicted-but-static controls** (date-range pills, filter dropdowns like
  "All platforms ▾", toggles): leave static. Working versions are out of scope.
- **Tabs / sub-navs** (AEI tabs, settings rail, agents tabs): every tab is a real
  `<Link>` to its route; the active tab keeps the frame's active styling. Build the
  tab row ONCE as a local component in your cluster (e.g.
  `app/(dash)/app/insights/InsightsTabs.tsx`) and reuse it across your pages.
- **Modals** (export, report wizard): client component in the parent page, opened by
  the real button that implies it (e.g. Citations "Export" → export modal), closed by
  its ✕ / Cancel / Esc. Add a close affordance if the frame lacks one.
- **Numbers/copy**: verbatim from frames except the data-coherence fixes in your
  assignment. When your assignment says a number changes, change every occurrence
  in YOUR pages and keep derived values consistent (sums, deltas, "showing X of Y").
- **Do not reproduce real-company branding.** If your frames contain real-company
  names/logos (Microsoft, Salesforce, Adobe, IBM, Cisco, G2 marks), your assignment
  says what replaces them.

## Verification (required before you report done)

Run from repo root:

    npx tsc --noEmit

Fix every error in files you own. Do NOT run `npm run dev`, `next dev`, or
`next build` (the orchestrator runs the full build; dev servers collide).

## Ownership

Touch ONLY the files in your assignment (+ your local page css / cluster components).
Never edit: `app/globals.css`, `app/layout.tsx`, any `layout.tsx` you don't own,
`components/marketing/*`, `components/app/Sidebar.tsx`, `components/app/Topbar.tsx`,
`tools/*`, `staging/*` (read-only), another agent's routes.
If something shared needs a change, put it in your final report instead of editing.

## Report format

Return: routes built (with any deviations), fixes applied, anything skipped + why,
and shared-file change requests.
