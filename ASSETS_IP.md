# Answr — Schedule of Assets & Intellectual Property

_The complete list of assets and IP that transfer to the buyer on sale, what stays with the seller,
and the third-party components and encumbrances a buyer should know. Prepared for acquisition
diligence._
_Last updated: 21 Aug 2026._

> Items marked **[confirm]** require the seller to verify before close. Nothing here is legal advice;
> the definitive list should be attached as a schedule to the purchase agreement.

---

## A. Software & source code (primary asset)

The complete, original source code of the Answr platform and all rights in it.

- The full private Git repository (~26,600 lines of application code) — all application code, build
  configuration, and history.
- All original TypeScript/React source: 73 page routes, 16 API routes, 38 library modules, 28
  shared components (see `PLATFORM_OVERVIEW.md` for the full feature inventory).
- The engine: persistence layer, authentication, answer-scoring, sampler, provider integration
  clients, and first-party telemetry pipeline — all original work.
- Build & deploy configuration: `package.json`, `tsconfig.json`, `next.config.ts`,
  `postcss.config.mjs`, `vercel.json` (cron), `.nvmrc`, `.gitignore`, `proxy.ts`.

**Ownership:** original work created for this project. Buyer receives full ownership and rights.

---

## B. Domain names

| Domain | Status | Transfers |
|--------|--------|-----------|
| **useanswr.com** | Primary production domain (live) | Yes — registrar transfer to buyer |
| **answr.io** / app.answr.io | Referenced in mockups and email addresses (`security@answr.io`, `privacy@answr.io`) | **[confirm]** whether the seller owns this; if owned, include; if not, buyer should register or the references are cosmetic |

The auto-generated Vercel URLs (`answr-*.vercel.app`) are not owned domains and do not transfer.

---

## C. Brand & trademarks

- The **"Answr" name** and word mark.
- The **Answr logo / lettermark** (the "A" glyph and gradient treatment used across the app,
  favicon, and social image).
- The complete **visual identity**: color system, typography choices, and design language.
- `app/favicon.ico` and the dynamic Open Graph image (`app/opengraph-image.tsx`).

**Trademark status: [confirm]** — whether "Answr" is a registered trademark or common-law/unregistered.
Include any registrations, applications, or usage evidence in the sale schedule. (Note: "Answr" is a
short, evocative name; the buyer may wish to run a clearance check.)

---

## D. Design assets

- The **design system** — CSS variable/token system in `app/globals.css`, the responsive layers
  (`marketing.css`, `sidebar.css`, `small-screen-gate.css`, `settings-rail.css`), and per-page CSS.
- The **original design canvases** — `staging/**`: 146 design frames (+146 CSS) across four canvas
  sets (dashboard, dashboard-v2, dashboard-v3, marketing) that are the pixel-source-of-truth the app
  was built from. Substantial, transferable design IP.
- The shared UI component library (`components/ui/**`, `components/app/**`, `components/marketing/**`).

---

## E. Content & copy

All original written content:

- All **marketing copy** across the 31 public pages.
- The **blog article** ("What 50k prompts taught us") and the changelog.
- The **AEO handbook** (`/resources/aeo-handbook`) and the **Answr Index** explorer + its dataset.
- The **31-metric dictionary** (`lib/metrics.ts` / `METRICS.md`) — the definitions, formulas,
  sources, and cadences. A genuinely valuable, original knowledge asset.
- All UI copy, tooltips, and the "honesty layer" copy.

---

## F. Data & fixtures

- The **demo dataset** — the curated "Nike" sample workspace fixtures (`lib/data/**`) that power the
  demo dashboard.
- The **researched conversation transcripts** (`lib/data/conversations.ts`) — assembled from real,
  URL-verified public pages.
- The **AI-bot / user-agent catalog** and AI-referrer table (`lib/bots.ts`) — a maintained mapping
  of AI crawlers and referrers.
- The **first-party referral snippet** (`public/snippet.js`).

_(No real customer or end-user personal data exists — the product is pre-launch. Nothing sensitive
transfers, and there is no data-privacy liability attached to the dataset.)_

---

## G. Documentation & collateral

Original documentation, transferring with the repo:

**Product / technical docs:** `PLATFORM_OVERVIEW.md`, `HANDOFF.md`, `LAUNCH_ROADMAP.md`,
`INTEGRATIONS.md`, `METRICS.md`, `READINESS.md`, `COST_SPLIT.md`, `README.md`, and the build-process
docs (`AGENTS.md`, `BUILD_CONVENTIONS.md`, `WIRING_CONVENTIONS.md`, `INTERACTIVITY_CONVENTIONS.md`,
`REBRAND_MAP.md`, `AUDIT_FINDINGS.md`, `AUDIT_PROMPT.md`).

**Sale collateral:** the acquisition prospectus, `SALE_LISTING.md`, `LISTING_KIT.md`, `ASSETS_IP.md`
(this document), plus `GROWTH.md` and `OUTREACH_DRAFTS.md`.

_(The buyer may wish to keep the internal build docs private; they are included for completeness and
transferred with the repository.)_

---

## H. Deployment & configuration

- The **Vercel project configuration** (framework preset, build settings, cron schedule in
  `vercel.json`). The current project id/org (`.vercel/project.json`) is the seller's; the buyer
  redeploys the same codebase under **their own** Vercel account.
- The **GitHub repository** (`arman4322-sketch/answr`) — transferred to the buyer's GitHub, or the
  code re-hosted under their account.
- The **CI/deploy pipeline** — GitHub → Vercel auto-deploy on push (configuration reproduces under
  the buyer's accounts).
- The **environment-variable schema** — the full list of keys the app reads and what each enables
  (documented in `HANDOFF.md`). The keys/values themselves are the buyer's to supply.

---

## I. Accounts & handover mechanics

| Asset | How it transfers |
|-------|------------------|
| GitHub repository | Repo transfer to buyer's GitHub org/account (or re-push) |
| Vercel project | Buyer connects the repo under their own Vercel account and redeploys |
| Domain (useanswr.com) | Registrar-to-registrar transfer (auth code) to the buyer |
| Email addresses (e.g. security@ / privacy@ on the domain) | Transfer with the domain / buyer re-provisions |
| Env vars / secrets | Not transferred (buyer supplies their own — see §K) |

See the transition/handover plan (separate deliverable) for the step-by-step.

---

## J. Third-party components & licenses (all permissive)

The software depends only on permissively licensed open-source, which the buyer may freely use
commercially:

| Component | Purpose | License |
|-----------|---------|---------|
| Next.js, React, React-DOM | Framework / runtime | MIT |
| d3-geo, topojson-client | Region map rendering | ISC / BSD |
| world-atlas | Map topology data | (public-domain-derived Natural Earth) |
| simple-icons | Brand icons on the logo/tech strips | CC0 (icons themselves are third-party trademarks — see §L) |
| Tailwind CSS v4, PostCSS, TypeScript, parse5 | Build tooling (dev) | MIT |
| Inter (via `next/font`) | UI typeface | SIL Open Font License |

No copyleft (GPL/AGPL) dependencies are present in the shipped application. No paid or proprietary
libraries are bundled.

---

## K. Excluded — does NOT transfer / buyer provides

- **API keys and secrets** — Perplexity, Gemini, DataForSEO, Anthropic, OpenAI, and any storage/email
  keys are the buyer's to obtain; none are included or present in the repo.
- **Third-party accounts** — the seller's Vercel, provider, and registrar accounts (the buyer uses
  their own).
- **Real customer data** — none exists (pre-launch).
- **Default starter assets** — `public/next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`
  are Next.js/Vercel starter placeholders (Vercel/Next marks or generic icons), not Answr IP; the
  buyer can delete them.

---

## L. IP warranties & encumbrances to disclose

Stated plainly so the buyer is fully informed (and to protect the seller):

1. **Third-party trademarks appear in the demo content.** The sample workspace and marketing pages
   reference real brand **names** (e.g. Nike, Adidas, and running-shoe competitors) and render
   third-party **logos** (via `simple-icons`, and the `public/logos/bell.svg` /
   `mty-food-group.svg` case-study marks). These marks are the property of their owners, are **not**
   Answr IP, and do **not** transfer as owned IP. The buyer should confirm permission for, or replace,
   any named-customer references (Bell Media, MTY Food Group) before relying on them — see
   `LAUNCH_ROADMAP.md` C2.
2. **Originality.** The application source, design canvases, metric dictionary, and written content
   are original work created for this project (assisted by AI tooling); no third-party proprietary
   code is copied in.
3. **Legal-document templates.** The starter Privacy / Terms / DPA pages are original drafts written
   for this product; they contain placeholders and should be finalized by counsel (they are not
   copied from a licensed generator).
4. **`answr.io` ownership** and **"Answr" trademark registration** status are **[confirm]** items —
   include the answer in the sale schedule.

---

## Summary

The sale transfers a complete, self-contained software asset: original source code and the engine,
the Answr brand and `useanswr.com` domain, the full design system and design canvases, all original
content and the metric dictionary, the demo dataset, and the full documentation set — built entirely
on permissively licensed open-source with no copyleft or proprietary encumbrances. The only items a
buyer supplies are their own API keys and accounts. The only disclosures of note are the third-party
marks used in demo content and the two **[confirm]** items above.
