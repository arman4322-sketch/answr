# Button-activation conventions — every control does something

Goal: NO dead buttons anywhere. Every element styled as clickable must have a
real effect when clicked. Read BUILD_CONVENTIONS.md for ownership rules; this
doc defines what "active" means per control type. Pixel fidelity still rules —
activating a control must not restyle it.

## Shared primitives (built — import, don't rebuild)

- `@/lib/toast` → `toast("message")` — global toast (Toaster is mounted in both
  layouts). Client code only.
- `@/components/ui/FilterPill` — working dropdown pill with selection state and
  optional honest-demo toast. The shared Topbar already uses it for date-range
  and platform filters.
- `@/components/ui/ExportButton` — downloads rows as a real CSV + toast.
- Topbar now takes `exportFilename` + `exportRows: string[][]` — pass the
  page's fixture table so its Export button downloads real CSV. Build rows from
  the visible fixture data (header row first).

## Control-type playbook

1. **Export buttons** (topbar or in-card): wire to real CSV via Topbar's
   exportRows or a local <ExportButton>. Filename pattern:
   `solara-<module>-30d.csv`.
2. **Filter/sort pills with ▾** (page-local ones like "All categories ▾",
   "Sort: Impact ▾", "All topics ▾", "Mentions: Solara ▾",
   "Shopping-capable platforms ▾"): replace the static div with <FilterPill
   label items note> — items = the plausible option set for that control (read
   the page's own data for values, e.g. categories present in the queue). Keep
   the demo-honesty note: "Demo workspace ships a fixed 30-day fixture —
   filters apply on live workspaces." EXCEPTION: pills inside depicted
   product-screenshot mockups on marketing pages stay static (they're imagery).
3. **Primary action buttons that imply creation** ("+ New action", "+ New
   watchlist", "+ New report", "+ Add brand", "+ Add competitor", "Create
   action", "New prompt set"): onClick → toast
   "Creating <thing> needs a live workspace — this demo is read-only." via a
   small client wrapper (or convert the button itself to a client component).
   If a designed modal already exists for it (report wizard, export), open that
   instead.
4. **Status/workflow buttons** ("Mark in progress", "Done", "Dismiss",
   "Assign", "Run now instead", "Pause", "Re-run"): toast the honest demo line
   ("Action statuses update on live workspaces.") — except where flipping local
   visual state is trivial and self-contained (a toggle): then flip it.
5. **Toggles** (Settings platforms/alerts/quality): make them real client
   toggles that flip visually; flipping also toasts "Platform toggles apply on
   live workspaces." Do NOT change any other page content when flipped.
6. **Accordions** (pricing FAQ, marketing FAQs): real expand/collapse, chevron
   rotates; first item may default open if the frame drew it open.
7. **Pricing Annual/Monthly toggle**: actually swap displayed prices — Annual
   (current values $490/$1,290 stay, they're the annual rate) ↔ Monthly shows
   $612/$1,612 (25% higher, consistent with "SAVE 20%" on annual, rounded to
   real-looking numbers). Keep the SAVE 20% badge on the Annual side.
8. **"Load more" / pagination** ("Load 12 more", "Showing 8 of 412", ‹ ›):
   toast "The demo ships the first page of fixture rows — full history lives
   on live workspaces." (unless the extra rows already exist in the fixture,
   then actually page).
9. **Forms that submit** (demo request, newsletter subscribe, report builder
   "Generate", support-chat send): prevent default, validate non-empty where
   sensible, then show a real success state — inline confirmation swap or
   toast ("Thanks — a strategist will reach out within one business day." /
   "Subscribed — first issue lands Monday." etc. — match the page's copy
   voice). Support-chat send appends the message to the thread + canned reply
   after 600ms.
10. **OAuth-style buttons** ("Continue with Google", "Continue with SSO /
    SAML"): toast "This demo uses the credential login below — dana@solara.io /
    answr-demo." (auth pages only).
11. **⌘K palette rows**: every row executes — navigation rows router.push to
    their target; action rows ("Export citations (1,284)") trigger the real
    thing where it exists (CSV download) or the honest toast otherwise; palette
    closes after execution.
12. **In-page anchor CTAs already linking somewhere**: leave them.
13. **Marketing CTAs** that have no page (e.g. "Read the methodology",
    "Responsible disclosure policy", "security@answr.io"): mailto: for emails;
    for missing docs link to the closest real page (/security) — never a toast
    on marketing (marketing buttons must never say "demo").

## Marketing vs dashboard tone

Dashboard toasts may say "demo workspace". Marketing pages NEVER show
demo-honesty toasts — marketing controls either navigate, expand, or submit
with a success state.

## Conversions

Converting a static div/span to <button>/<Link> keeps its exact inline styles
(plus border:none/background where <button> needs resets), and adds
cursor:pointer. Client conversion: if a page is a server component, extract the
smallest possible client child (e.g. `QueueControls.tsx` in the page folder) —
do not convert whole pages to "use client" unless they already are.

## Verify

`npx tsc --noEmit` clean for your files. Report per page: controls activated
(count + list), anything left intentionally static + why.
