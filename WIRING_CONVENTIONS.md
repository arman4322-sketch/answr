# Dashboard wiring conventions — metrics, data layer, hover charts

You are upgrading built dashboard pages from painted numbers to a real metrics
system. Read BUILD_CONVENTIONS.md first for repo shape and ownership rules —
everything there still applies. This file adds the wiring rules.

## The three upgrades (apply to every page you own)

### 1. KPI cards → `<KpiCard>` with provenance

Replace hand-built KPI stat cards with `@/components/app/KpiCard`:

    <KpiCard label="Visibility score" value="34.2%" metricId="visibility_score"
             delta="↑ 2.8pt vs prev" deltaGood sub="…optional caption…" />

- `metricId` keys into `lib/metrics.ts` (24 entries) and renders the ⓘ popover
  with definition / source / calculation. Match each card to the right id; if a
  card has no matching metric, omit metricId (no popover) and note it in your
  report. Do NOT invent new dictionary entries — request them instead.
- Keep the frame's exact label text, value, delta text and delta direction.
- A small sparkline that lived inside the card may be passed as `children`
  (keeps rendering right of the value) or dropped if it was purely decorative.
- Grid wrappers (repeat(4,1fr) etc.) stay in the page.

### 2. Charts → hoverable components

Replace each page's PRIMARY hand-drawn SVG charts with the shared components:

- Line/area/stepped trends → `@/components/app/charts/TrendChart`
- Vertical or stacked bars → `@/components/app/charts/BarChart`

Rules:
- **Series colors follow the design:** you/brand = `"var(--ac)"`; competitors
  keep their assigned hues (Beacon #7fa7d9, Klarity #b98ed9, Wavemetric #d9b679, Optivo #d985a8); semantic green/red only for good/bad, never as a series color.
- **Data goes in `lib/data/<module>.ts`** (you create it): typed exported consts,
  30 daily points for 30-day windows with `xLabels: last30Days()` from
  `@/lib/data/dates` (weekly windows: `lastWeeks(n)`).
- **Endpoints must match the fixture story.** The series' last point equals the
  headline number on the page (e.g. visibility ends at 34.2 with the window's
  start ≈ 31.4 so the +2.8pt delta is true; competitor endpoints match the
  share-of-voice table). Shape the in-between points plausibly (gentle noise,
  visible inflections where the digest mentions events). Add a comment in the
  data file stating each endpoint constraint you honored.
- Size the chart to the box it replaces (width/height props); keep surrounding
  card markup, titles, and captions verbatim.
- Tiny row/table sparklines (≤80px wide) are decorative — leave them as static
  SVG. Only the page's real charts get the hover layer.
- Heatmap-style grids: add a per-cell hover tooltip using a small local
  component in your cluster (same tooltip styling as TrendChart's: bg2, brd
  border, radius 8, shadow, 10px uppercase title, tabular values).

### 3. Consistency sweep (audit leftovers) on your pages

- **Export labels**: full comma-formatted numbers everywhere —
  "Export 1,284 citations", "Export 48,231 events" (no 1.3k / 48.2K forms).
- **Table row hover**: interactive-looking table/list rows that lack a hover get
  `className="row-hover"` (global class, already defined).
- Buttons/links/inputs semantics per BUILD_CONVENTIONS.md if you touch them.

## Don'ts

- Don't restyle anything beyond these swaps; pixel fidelity still rules.
- Don't edit lib/metrics.ts, the shared components, other clusters' pages, or
  marketing pages. Request changes in your report instead.
- Don't run dev servers. Verify with `npx tsc --noEmit` (ignore errors outside
  your files).

## Report

Return per page: charts converted (count), KPI cards converted (count), metric
ids used, data files created, leftovers fixed, anything skipped + why.
