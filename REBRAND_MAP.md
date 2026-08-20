# Demo-workspace rebrand — Solara (B2B RevOps SaaS) → Nike (athletic brand)

The demo workspace becomes **Nike** so prospects see what their own dashboard would
look like. This is NOT a find-replace: Solara sold revenue-forecasting software, so
every topic, prompt, citation source and demand keyword must move to Nike's category
too, or the demo reads as nonsense ("Nike — best revenue forecasting software").

## THE ONE RULE: never change a number

Every figure is load-bearing — fixture math was verified across the app (visibility
34.2% ending the trend series, 412 prompts summing across 5 topics, SoV table summing
to 100.0%, citation counts agreeing between Overview and Citations, "Showing 8 of 412",
delta arithmetic). **Swap names and vocabulary only.** If a rename would make a number
wrong (e.g. a topic's prompt count), keep the number and adapt the words.

## Brand tokens

| Old | New |
|---|---|
| Solara | Nike |
| solara.io | nike.com |
| dana@solara.io | dana@nike.com |
| Beacon (competitor 1, #7fa7d9) | Adidas |
| Klarity (competitor 2, #b98ed9) | Puma |
| Wavemetric (competitor 3, #d9b679) | Under Armour |
| Optivo (competitor 4, #d985a8) | New Balance |

Persona stays **Dana Okafor** (fictional employee — do not invent a real Nike person).
Series colors, ordering and rank stay exactly as-is: Nike leads, Adidas second, etc.

## Topics — keep the prompt counts, change the subject

| Old topic | Prompt count (UNCHANGED) | New topic |
|---|---|---|
| Revenue forecasting | 64 | Running shoes |
| Pipeline analytics | 58 | Training apparel |
| CRM integrations | 47 | Sneaker releases |
| Sales commission tools | 39 | Sustainability |
| Quota planning | 31 | Basketball gear |

(64+58+47+39+31 = 239 in the AEI table; onboarding's "412 across 5 topics" copy stays.)

## Prompt text

Rewrite tracked prompts into the same *shape* (commercial / comparison / branded /
informational), in Nike's category. Keep each prompt's badge, metrics and row order.

| Old prompt | New prompt |
|---|---|
| best revenue forecasting software for B2B SaaS | best running shoes for marathon training |
| how do sales teams forecast pipeline accurately | how do runners choose shoes for long distances |
| Solara vs Beacon comparison | Nike vs Adidas running shoes |
| revenue operations tools with Salesforce integration | training apparel with moisture-wicking fabric |
| cheapest way to automate commission tracking | most affordable quality running shoes |
| does Solara integrate with HubSpot | does Nike offer wide-fit running shoes |
| why did our Q3 forecast miss by 18% | why do running shoes lose cushioning over time |
| compare Solara and Beacon for a mid-market team | compare Nike and Adidas for marathon training |

Same treatment for any prompt not listed: preserve intent/badge, move the subject.

## Citation sources — category-appropriate authorities

| Old | New | Notes |
|---|---|---|
| g2.com | runnersworld.com | the category's review authority |
| solara.io/blog | nike.com/running | owned domain |
| reddit.com/r/revops/... | reddit.com/r/running/... | keep the community-thread role |
| techradar.com | wirecutter.com | keep the roundup role |
| wikipedia.org | wikipedia.org | unchanged |
| capterra / softwareadvice (if present) | fleetfeet.com / believeintherun.com | specialist retail/review |

Keep every citation COUNT and rank position identical.

## Demand keywords

"revenue forecasting software" → "best running shoes"; "pipeline forecasting" →
"marathon training shoes"; keep volumes/deltas unchanged. The keyword-detail route
slug may stay as-is (URL only) if renaming it would break links — prefer updating the
route folder only if you also update every link to it.

## Audiences / regions / shopping

- Audience segments: "RevOps leads" → "Marathon runners"; "Sales leaders" → "Gym /
  cross-training"; "Finance teams" → "Casual / lifestyle wearers". Keep the numbers.
- Shopping products: rename SKU-ish rows to Nike-category products (e.g. "Pegasus 41",
  "Vaporfly 3", "Dri-FIT tee", "Metcon 9"). Keep prices/rates if shown.
- Regions: unchanged (they are geographies).

## Actions / workflows copy

Rewrite action titles to the new category while keeping score, impact, effort and
prompt counts: e.g. #92 'Publish a "Solara vs Beacon" comparison page' → 'Publish a
"Nike vs Adidas" running-shoe comparison page'; #87 llms.txt/docs action → keep the
technical substance but point at nike.com paths (/running, /help) instead of /docs if
that reads better; keep "214" and all other figures.

## Marketing site

Solara appears in marketing copy/screenshot mockups too — rename there as well so the
site and product agree. Those fictional customer brands (Kepler Systems, Northwind, Aster Payments, Marlow
Hotels, Meridian Cloud) have since been RETIRED site-wide: testimonials are now
anonymised by role + sector, and the case studies are the disclaimed illustrative
MTY Food Group and Bell Media scenarios. Do not reintroduce them.
The homepage logo wall (MTY Food Group, Bell) is separate — do not touch.

## Honesty guardrail (already handled centrally — do not duplicate)

Nike/Adidas/Puma are real companies and these numbers are invented. A "Sample data"
marker is being added centrally by the orchestrator; agents should not add their own
disclaimers, and must not delete the marker if they see it.
