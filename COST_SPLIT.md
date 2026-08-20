# Answr — what costs money, and what doesn't

Every remaining item from `AUDIT_FINDINGS.md`, split by whether it needs a budget.
Pricing verified against vendor sites, 8 Aug 2026. Re-check before purchasing — these move.

## The one-line answer

**All nine P0 blockers can be cleared for $0.** Six of them are fabricated claims, and the fix
is deletion, not substantiation. Telling the truth is free; making the claims true is where the
money is — and in one case (SOC 2) no amount of money makes it true this year.

**The only genuinely unavoidable spend is $20/month for Vercel Pro**, and that is a licence
requirement, not a performance one. See §3.

---

## 1. Free — engineering time only

Nothing below needs a credit card. This is the bulk of the audit.

### All nine P0s
| Item | Fix | Effort |
|---|---|---|
| Gate bypassed by `/%61pp/overview` | Normalize the path, fail closed, add a server-side check in the dashboard layout | 4h |
| `/app/capability-map` ships an internal competitor teardown | Delete the route | 15m |
| `/api/ingest` accepts anonymous forged events | Bearer token + rate limit, or drop the "Real data" badge until it has one | 1–2d |
| Lead forms confirm and transmit nothing | Point at a destination (free options, §2) | 4h |
| SOC 2 / pen test / 99.9% SLA / GDPR claimed with no evidence | **Delete the claims** | 6h |
| MTY + Bell asserted as customers with invented results | Remove or replace | 4h |
| G2 4.8 rating and "Leader" badge | Delete both pills | 30m |
| No Privacy/Terms/DPA, but signup binds users to them | Remove the consent sentence now; publish real docs later (§2) | 1h |
| AEI relabels the window and redraws the axis without re-slicing | Make the pill inert with the honest note | 4h |

### Every P1 data-integrity bug
Sidebar counts vs their pages (12 vs 24) · Overview vs Insights visibility (+2.8pt vs +10.7pt) ·
inverted avg-position polarity · "Best platform" vs the heatmap · page-health double counting ·
prompt quota reported three ways · plan limits contradicting the pricing page · live-logs filter
claim · homepage restating dashboard figures wrongly.

### Every accessibility fix
Headings and landmarks · skip link · modal focus traps · keyboard-operable nav dropdowns ·
the 3.33:1 white-on-accent contrast in 41 places (the repo's own CSS documents this as a bug
it already fixed once).

### Everything else free
`robots.txt` · `sitemap.xml` · Open Graph + `og:image` · canonical tags across the three live
hostnames · open redirect on `/login?next=` · ⌘K and Prompts search · Reports "Download ↓" ·
Settings › Workspace save control · URL-persisted filter state · the 1418px horizontal scrollbar.

### Free and urgent, though the audit rates it P1
**`git init`.** The production app is under no version control at all. Zero dollars, and it is
currently the single largest risk to the work already done.

---

## 2. Free *enough* — real free tiers that permit commercial use

These have free tiers you can genuinely ship a commercial product on. Limits that actually bite
are stated; ignore the headline numbers.

| Need | Free option | The limit that bites |
|---|---|---|
| **Auth** | **Better Auth** (self-host, MIT) | None. No MAU metering, no branding, no licence restriction. Cost is engineering time. |
| | Supabase Auth | 50,000 MAU free — but free projects **pause after 7 days idle** |
| **Database** | Neon / Supabase free tier | Both **suspend or pause idle databases** — fine for a demo, wrong for a product with real users |
| **Telemetry store (KV)** | Upstash free tier | Command-count capped; enough for the current ring-buffer replacement |
| **Lead forms** | Web3Forms / Formspree / Tally free tiers | Submission caps; adequate for demo-request volume |
| **Transactional email** | Resend free tier | ~3k emails/mo, requires domain verification |
| **Error monitoring** | Sentry free tier | Event volume + short retention |
| **Analytics** | Umami / Plausible (self-host), PostHog free tier | Self-hosting is free but is engineering time |
| **Uptime** | UptimeRobot / BetterStack free | Check frequency |
| **Legal documents** | **Basecamp's open-source policies (CC BY 4.0)** | None — genuinely commercial-safe, better than any $15/mo generator |

**Two licence traps found — worth knowing before you adopt either:**

- **Automattic's "legalmattic" policies are CC BY-SA** (ShareAlike). The ShareAlike term
  propagates into your own legal documents. Basecamp's are plain CC BY — use those instead.
- **Comp AI** (open-source SOC 2 automation) is **AGPLv3**. Fine to run internally; the licence
  matters the moment it touches a product you distribute.

Also flagged: the "free" tiers at TermsFeed / FreePrivacyPolicy / PrivacyPolicies produce
policies **missing the GDPR and CCPA sections you are publicly claiming to comply with** — worse
than having no document, because it looks like diligence.

---

## 3. Must pay — unavoidable

### Vercel Pro — $20/user/month
**This is a licence requirement, not a performance one, and it is the one item you cannot avoid
while staying on Vercel.** Their Terms: *"You shall only use the Services under a Hobby plan for
your personal or non-commercial use."* The Fair Use Guidelines define commercial far more broadly
than most people assume — it explicitly includes *"Advertising the sale of a product or service"*
and *"Receiving payment to create, update, or host the site."* A SaaS marketing site is commercial
**before a single dollar is collected**. Enforcement is not a warning system: *"We may shut down
and terminate projects or deployments using the Hobby plan without notice."*

Two other Hobby gates you would hit anyway: log drains are Pro-only, and Hobby cannot connect to
a repo owned by a GitHub **organization**.

Realistic bill for Answr today: **$20/month flat** — the $20 included usage credit covers a
fixture-data app's consumption several times over.

*If you object to that:* **Netlify's free tier has no non-commercial restriction** (their staff
confirm it directly), and **Cloudflare Workers charges nothing for bandwidth, ever**. Netlify's
catch is credits — ~20 production deploys exhausts the monthly allowance before a visitor
arrives, and when credits hit zero **your site goes dark until the next billing cycle**.

---

## 4. Pay only if you want the capability

### Real data instead of fixtures — $25–80/mo pilot, $600–1,100/mo at full scale
Per `INTEGRATIONS.md`: Perplexity Sonar ~$2–5/mo pilot · Gemini grounding **free** at this volume ·
DataForSEO $50 one-time minimum funding · Anthropic Haiku batch sentiment <$1/mo. Optional wave 2
adds OpenAI and Anthropic sampling lanes.

### Real legal documents
| Path | Cost |
|---|---|
| Basecamp templates, self-adapted | **$0** |
| Basecamp templates + Canadian lawyer review | **~CAD $760** — best return per dollar in this whole document |
| Generator subscription (Termageddon $119/yr, GetTerms ~$199 one-time) | $119–199/yr |
| Full lawyer-drafted SaaS package | ~$4,500 |

**The DPA is the one you cannot cheaply fake.** Free templates give you 70% of the wording and 0%
of the accuracy about your own sub-processors and security controls — and that annex is exactly
what enterprise procurement reads.

### The three security claims currently on the site
| Claim | Cost to make true | Verdict |
|---|---|---|
| Penetration test | **$2,500–$15,000** | Cheapest of the three. $4–8k buys a real report in weeks. |
| SOC 2 Type II | **$25,000–$80,000+ all-in** first year (Vanta/Drata/Secureframe $5–28k/yr **plus** a separate CPA audit fee of $15–45k) | See below |
| 99.9% SLA | Free to write, expensive to honour | Don't publish. You'd assume uncapped uptime liability on a host that owes you nothing. |

**SOC 2 is a calendar problem, not a money problem.** A Type II requires an observation window.
Even if you wired $80,000 today, the claim could not become true before roughly **Q2 2027**.
Delete it now; there is no version of this where the current claim is defensible.

---

## 5. If you spent nothing at all

You could clear **all nine P0s and most P1s for $0**, and the only cheque you'd have written is
**$20/month to Vercel** — which you owe the moment the site advertises a product, which it
already does.

Everything else on this page is optional capability, not remediation.
