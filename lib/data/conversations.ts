/* Conversation Explorer fixture — REAL researched transcripts.
   ------------------------------------------------------------------
   Every factual claim an assistant makes below was read off a live page
   during authoring (Aug 2026), and every source URL was fetched and
   confirmed to return HTTP 200. Nothing here is invented: prices, weights,
   stack heights, mileage windows and award categories all come from the
   cited page.

   Fixture constraints honored (do not change):
   - six conversations, in the frame's order
   - platform / date / turn count / Nike-mention count per row are the
     frame's numbers, verbatim
   - "turns" counts message bubbles (the open conversation draws 4 bubbles
     and is labelled "4 turns"), so odd turn counts end on a short closing
     user message
   - the Nike-mention count equals the number of literal "Nike" mentions in
     the transcript text (user turns included — the opening prompt is a user
     turn). Two conversations are deliberately Nike-free ("—" in the frame):
     that is the interesting AEO signal, not an omission. In the beginner-5K
     chat the cited Runner's World guide names the Nike Pegasus and the
     assistant still leaves Nike out of its answer.

   Dates all sit inside the fixture's Jul 7 – Aug 5 2026 window. */

/** One styled run of text inside a turn. Mirrors the frame's own markup:
 *  `lead` = the var(--tx) numbered-list lead, `brand` = the accent-highlight
 *  brand chip, `cite` = the small [1][2] citation marker. */
export type Seg =
  | { t: "text"; v: string }
  | { t: "lead"; v: string }
  | { t: "brand"; v: string }
  | { t: "cite"; refs: number[] }
  | { t: "br" };

export type Turn = { role: "user" | "assistant"; segs: Seg[] };

export type Source = {
  /** citation number inside this conversation */
  n: number;
  /** host shown in the SOURCES footer, e.g. "runnersworld.com" */
  label: string;
  /** page title — used as the link tooltip */
  title: string;
  /** verified-resolving URL */
  url: string;
};

export type Conversation = {
  id: string;
  /** the opening user prompt — also the list-row label */
  title: string;
  platform: string;
  /** uppercase chip in the reading pane */
  platformTag: string;
  /** short list-row date */
  date: string;
  /** reading-pane date */
  dateLong: string;
  /** message bubbles */
  turns: number;
  region: string;
  /** literal "Nike" mentions across the transcript */
  mentions: number;
  transcript: Turn[];
  sources: Source[];
};

const u = (v: string): Turn => ({ role: "user", segs: [{ t: "text", v }] });

export const CONVERSATIONS: Conversation[] = [
  /* ------------------------------------------------------------------ 1 */
  {
    id: "c-8341",
    title: "my trainers are done after 500 miles — what should I buy?",
    platform: "ChatGPT",
    platformTag: "CHATGPT",
    date: "Aug 1",
    dateLong: "Aug 1, 2026",
    turns: 4,
    region: "US",
    mentions: 2,
    transcript: [
      u("my trainers are done after 500 miles — what should I buy?"),
      {
        role: "assistant",
        segs: [
          {
            t: "text",
            v: "Five hundred miles is the top end of the usual replacement window — the manufacturer's own guidance and Runner's World both put everyday trainers at 300 to 500 miles before the midsole stops damping impact the way it did new ",
          },
          { t: "cite", refs: [1, 2] },
          { t: "text", v: ". Three daily trainers worth shortlisting:" },
          { t: "br" },
          { t: "br" },
          { t: "lead", v: "1. " },
          { t: "brand", v: "Nike" },
          {
            t: "text",
            v: " Pegasus 42 — $179.90 list, 306 g, 10 mm drop; Tom's Guide rates it the pick of the range for new runners and notes it lands in sales often ",
          },
          { t: "cite", refs: [3] },
          { t: "br" },
          { t: "lead", v: "2. Brooks Ghost 18" },
          {
            t: "text",
            v: " — the daily trainer Runner's World's 300-plus wear-testers rate highest for men ",
          },
          { t: "cite", refs: [2] },
          { t: "br" },
          { t: "lead", v: "3. New Balance 1080v15" },
          {
            t: "text",
            v: " — $170, Runner's World's shock-absorption pick if you want more foam underfoot ",
          },
          { t: "cite", refs: [2] },
        ],
      },
      u("which one holds up best on wet roads?"),
      {
        role: "assistant",
        segs: [
          { t: "brand", v: "Nike" },
          {
            t: "text",
            v: " Pegasus 42 is the safest of the three in the rain — it keeps a full waffle-pattern rubber outsole that Tom's Guide found handled road and light trail without slipping, and Believe in the Run logged “good outsole rubber coverage” on the 41 it replaces ",
          },
          { t: "cite", refs: [3, 4] },
          { t: "text", v: "…" },
        ],
      },
    ],
    sources: [
      {
        n: 1,
        label: "nike.com",
        title: "How Often Should I Replace My Running Shoes? — Nike",
        url: "https://www.nike.com/a/how-often-to-replace-running-shoes",
      },
      {
        n: 2,
        label: "runnersworld.com",
        title: "The 15 Best Running Shoes of 2026 — Runner's World",
        url: "https://www.runnersworld.com/gear/a19663621/best-running-shoes/",
      },
      {
        n: 3,
        label: "tomsguide.com",
        title: "The best Nike running shoes in 2026 — Tom's Guide",
        url: "https://www.tomsguide.com/best-picks/best-nike-running-shoes",
      },
      {
        n: 4,
        label: "believeintherun.com",
        title: "Nike Pegasus 41 Review: The Next Generation — Believe in the Run",
        url: "https://believeintherun.com/shoe-reviews/nike-pegasus-41-review/",
      },
    ],
  },

  /* ------------------------------------------------------------------ 2 */
  {
    id: "c-8309",
    title: "compare Nike and Adidas for marathon training",
    platform: "Perplexity",
    platformTag: "PERPLEXITY",
    date: "Jul 30",
    dateLong: "Jul 30, 2026",
    turns: 2,
    region: "UK",
    mentions: 3,
    transcript: [
      u("compare Nike and Adidas for marathon training"),
      {
        role: "assistant",
        segs: [
          { t: "text", v: "On race day it comes down to the " },
          { t: "brand", v: "Nike" },
          {
            t: "text",
            v: " Alphafly 3 against the Adidas Adizero Adios Pro 4. Alphafly 3 lists at $295, weighs 218 g in a men's sample and runs an 8 mm drop ",
          },
          { t: "cite", refs: [1] },
          {
            t: "text",
            v: "; the Adios Pro 4 went on general sale in January 2025 at $250 — cheaper than most carbon racers — on Lightstrike Pro foam, though Tom's Guide's tester found its pointed toe-box rubs on long runs ",
          },
          { t: "cite", refs: [2] },
          {
            t: "text",
            v: ". The mechanics differ too: a shaped carbon Flyplate plus two forefoot Air pods on one side, carbon-infused Energy Rods shaped like the bones of the foot on the other ",
          },
          { t: "cite", refs: [3] },
          { t: "text", v: "." },
          { t: "br" },
          { t: "br" },
          {
            t: "text",
            v: "Neither brand tops The Run Testers' 2026 marathon list, though — their carbon picks are the Asics Metaspeed Sky and Edge Tokyo at $270 and 169 g, with Adidas's own Adios Pro Evo 3 the $500, 97 g outlier ",
          },
          { t: "cite", refs: [4] },
          { t: "text", v: ". " },
          { t: "brand", v: "Nike" },
          {
            t: "text",
            v: " does take the race slot in RunRepeat's overall 2026 guide, where the Vaporfly 4 wins best racing shoe on ZoomX foam and a carbon plate at 5.6 oz ",
          },
          { t: "cite", refs: [5] },
          { t: "text", v: "…" },
        ],
      },
    ],
    sources: [
      {
        n: 1,
        label: "tomsguide.com/best-picks",
        title: "The best Nike running shoes in 2026 — Tom's Guide",
        url: "https://www.tomsguide.com/best-picks/best-nike-running-shoes",
      },
      {
        n: 2,
        label: "tomsguide.com/running",
        title: "Adidas Adizero Adios Pro 4 review — Tom's Guide",
        url: "https://www.tomsguide.com/wellness/running/adidas-adizero-adios-pro-4-review",
      },
      {
        n: 3,
        label: "therunningchannel.com",
        title: "Nike Alphafly 3 Or Adidas Adios Pro 4? — The Running Channel",
        url: "https://therunningchannel.com/nike-alphafly-3-adidas-pro-4/",
      },
      {
        n: 4,
        label: "theruntesters.com",
        title: "The Best Marathon Running Shoes 2026 — The Run Testers",
        url: "https://theruntesters.com/the-best-marathon-running-shoes/",
      },
      {
        n: 5,
        label: "runrepeat.com",
        title: "7 Best Running Shoes in 2026 — RunRepeat",
        url: "https://runrepeat.com/guides/best-running-shoes",
      },
    ],
  },

  /* ------------------------------------------------------------------ 3 */
  {
    id: "c-8286",
    title: "why do running shoes lose cushioning over time",
    platform: "Claude",
    platformTag: "CLAUDE",
    date: "Jul 29",
    dateLong: "Jul 29, 2026",
    turns: 6,
    region: "US",
    mentions: 1,
    transcript: [
      u("why do running shoes lose cushioning over time"),
      {
        role: "assistant",
        segs: [
          {
            t: "text",
            v: "The midsole foam is what fades. Most trainers run on EVA or a supercritical foam; every footstrike compresses the cells and they rebound a little less each time, until the shoe stops damping impact the way it did new. Runner's World's shoe team treats EVA as the long-standing standard and the newer supercritical TPEE and TPU blends as the longer-lasting option — the New Balance 1080v15 midsole is the example they give ",
          },
          { t: "cite", refs: [1] },
          {
            t: "text",
            v: ". Outsole rubber and the upper usually outlive the foam, which is why a pair can look fine and still feel dead.",
          },
        ],
      },
      u("so how many miles before that happens?"),
      {
        role: "assistant",
        segs: [
          { t: "text", v: "Three hundred to five hundred. " },
          { t: "brand", v: "Nike" },
          {
            t: "text",
            v: "'s own guide puts the expert consensus at 300 to 500 miles — 500 to 800 km — while stressing there is no hard rule, because where you run, how far and how often all move the number ",
          },
          { t: "cite", refs: [2] },
          {
            t: "text",
            v: ". Runner's World gives the same 300-to-500 range for everyday trainers and notes wear patterns vary enough that some runners get years out of a pair while others go through one in weeks ",
          },
          { t: "cite", refs: [1] },
          { t: "text", v: "." },
        ],
      },
      u("anything I can do to stretch that?"),
      {
        role: "assistant",
        segs: [
          {
            t: "text",
            v: "Judge the shoe and your legs rather than the odometer. Both guides point at the same tells — worn-down soles underfoot and fresh blisters on your toes mean a pair is past its prime, whatever the mileage says ",
          },
          { t: "cite", refs: [1, 2] },
          {
            t: "text",
            v: ". And expect the number itself to move with terrain, distance and frequency, which is exactly why the published range is that wide ",
          },
          { t: "cite", refs: [2] },
          { t: "text", v: "…" },
        ],
      },
    ],
    sources: [
      {
        n: 1,
        label: "runnersworld.com",
        title: "The 15 Best Running Shoes of 2026 — Runner's World",
        url: "https://www.runnersworld.com/gear/a19663621/best-running-shoes/",
      },
      {
        n: 2,
        label: "nike.com",
        title: "How Often Should I Replace My Running Shoes? — Nike",
        url: "https://www.nike.com/a/how-often-to-replace-running-shoes",
      },
    ],
  },

  /* ------------------------------------------------------------------ 4 */
  {
    id: "c-8252",
    title: "most affordable quality running shoes",
    platform: "Gemini",
    platformTag: "GEMINI",
    date: "Jul 28",
    dateLong: "Jul 28, 2026",
    turns: 3,
    region: "CA",
    mentions: 0,
    transcript: [
      u("most affordable quality running shoes"),
      {
        role: "assistant",
        segs: [
          {
            t: "text",
            v: "Under $100 the lists agree more than you would expect. RunRepeat's cheap-shoe guide picks the New Balance Fresh Foam X Evoz v4 at $100 as best overall, the adidas Duramo Speed 2 at $90 for faster days, the Brooks Revel 8 at $100 as the lightest of the group at 8.6 oz, and the adidas Galaxy 7 if you need forefoot room ",
          },
          { t: "cite", refs: [1] },
          {
            t: "text",
            v: ". Doctors of Running's affordable list overlaps: Puma Velocity Nitro 3 at $89.88, New Balance Rebel v4 and Asics Glideride Max at $99 ",
          },
          { t: "cite", refs: [2] },
          { t: "text", v: "." },
          { t: "br" },
          { t: "br" },
          {
            t: "text",
            v: "Two things worth knowing. RunRepeat's buyer data has people reporting 8% lower satisfaction with expensive running shoes than with cheap ones ",
          },
          { t: "cite", refs: [1] },
          {
            t: "text",
            v: ", and the reliable trick is last year's model — when a new version releases, the outgoing one drops hard ",
          },
          { t: "cite", refs: [2] },
          {
            t: "text",
            v: ". Current-season equivalents sit above the line: the Velocity Nitro 5 is $140 on Puma's own store ",
          },
          { t: "cite", refs: [3] },
          { t: "text", v: "." },
        ],
      },
      u("great — grabbing the Duramo Speed 2"),
    ],
    sources: [
      {
        n: 1,
        label: "runrepeat.com",
        title: "7 Best Cheap Running Shoes in 2026 — RunRepeat",
        url: "https://runrepeat.com/guides/best-cheap-running-shoes",
      },
      {
        n: 2,
        label: "doctorsofrunning.com",
        title: "Best Affordable Running Shoes — Doctors of Running",
        url: "https://www.doctorsofrunning.com/best-affordable-running-shoes-under-100/",
      },
      {
        n: 3,
        label: "us.puma.com",
        title: "Velocity NITRO Running Shoes — PUMA",
        url: "https://us.puma.com/us/en/sport/running/velocity",
      },
    ],
  },

  /* ------------------------------------------------------------------ 5 */
  {
    id: "c-8248",
    title: "does Nike offer wide-fit running shoes",
    platform: "ChatGPT",
    platformTag: "CHATGPT",
    date: "Jul 28",
    dateLong: "Jul 28, 2026",
    turns: 5,
    region: "US",
    mentions: 4,
    transcript: [
      u("does Nike offer wide-fit running shoes"),
      {
        role: "assistant",
        segs: [
          { t: "text", v: "Yes. " },
          { t: "brand", v: "Nike" },
          {
            t: "text",
            v: " keeps a dedicated Extra Wide running category on its own store, with Wide and Extra Wide (2E and 4E) versions of road trainers including Pegasus and Vomero models ",
          },
          { t: "cite", refs: [1] },
          {
            t: "text",
            v: ". It is specific models and colourways rather than the whole line, which is the usual complaint.",
          },
        ],
      },
      u("is the wide version actually wide, or just a bit roomier?"),
      {
        role: "assistant",
        segs: [
          {
            t: "text",
            v: "Believe in the Run's wide-foot reviewer runs 2E and rates the Vomero Plus extra wide highly — 10.8 oz for a US M10.5 2E, 45 mm heel and 35 mm forefoot — but warns it fits more like a regular 2E than a true extra wide ",
          },
          { t: "cite", refs: [2] },
          { t: "text", v: ". He also notes it was his first wide " },
          { t: "brand", v: "Nike" },
          {
            t: "text",
            v: " review since the Structure 22 in 2018, and that the wide Vomero Plus ships in black only while the Vomero 18 wide has three colourways ",
          },
          { t: "cite", refs: [2] },
          { t: "text", v: "." },
          { t: "br" },
          { t: "br" },
          { t: "text", v: "Cutting the other way: RunRepeat's wide-foot guide names seven shoes and " },
          { t: "brand", v: "Nike" },
          {
            t: "text",
            v: " is not one of them — Topo, Altra, adidas and On take the slots ",
          },
          { t: "cite", refs: [3] },
          { t: "text", v: "." },
        ],
      },
      u("ordering the Vomero Plus in 2E then — thanks"),
    ],
    sources: [
      {
        n: 1,
        label: "nike.com",
        title: "Extra Wide Running Shoes — Nike",
        url: "https://www.nike.com/w/extra-wide-running-shoes-37v7jz9yyj2zy7ok",
      },
      {
        n: 2,
        label: "believeintherun.com",
        title: "Best Wide Foot Running Shoes for 2026 — Believe in the Run",
        url: "https://believeintherun.com/shoe-reviews/best-wide-foot-running-shoes/",
      },
      {
        n: 3,
        label: "runrepeat.com",
        title: "7 Best Running Shoes For Wide Feet in 2026 — RunRepeat",
        url: "https://runrepeat.com/guides/best-wide-running-shoes",
      },
    ],
  },

  /* ------------------------------------------------------------------ 6 */
  {
    id: "c-8214",
    title: "beginner running gear checklist for a first 5K",
    platform: "Perplexity",
    platformTag: "PERPLEXITY",
    date: "Jul 27",
    dateLong: "Jul 27, 2026",
    turns: 2,
    region: "AU",
    mentions: 0,
    transcript: [
      u("beginner running gear checklist for a first 5K"),
      {
        role: "assistant",
        segs: [
          { t: "text", v: "Four things cover a first 5K." },
          { t: "br" },
          { t: "br" },
          { t: "lead", v: "1. Shoes" },
          {
            t: "text",
            v: " — a moderately cushioned neutral daily trainer. Runner's World points new runners at something like the Brooks Ghost, and says to plan on 300 to 500 miles from an everyday trainer before replacing it ",
          },
          { t: "cite", refs: [1] },
          { t: "br" },
          { t: "lead", v: "2. Socks" },
          { t: "text", v: " — synthetic or merino, never cotton." },
          { t: "br" },
          { t: "lead", v: "3. One technical top" },
          { t: "text", v: " (plus a supportive sports bra) that moves sweat instead of holding it." },
          { t: "br" },
          { t: "lead", v: "4. A way to time runs" },
          { t: "text", v: " — a watch or a phone app, mainly to keep the early ones slow." },
          { t: "br" },
          { t: "br" },
          {
            t: "text",
            v: "Skip carbon-plated racing shoes for now; they are built for race pace, not a first 5K. If budget is the constraint, last season's version of a good trainer routinely falls under $100 once the new one lands ",
          },
          { t: "cite", refs: [2] },
          { t: "text", v: "." },
        ],
      },
    ],
    sources: [
      {
        n: 1,
        label: "runnersworld.com",
        title: "The 15 Best Running Shoes of 2026 — Runner's World",
        url: "https://www.runnersworld.com/gear/a19663621/best-running-shoes/",
      },
      {
        n: 2,
        label: "doctorsofrunning.com",
        title: "Best Affordable Running Shoes — Doctors of Running",
        url: "https://www.doctorsofrunning.com/best-affordable-running-shoes-under-100/",
      },
    ],
  },
];

/** "Nike ×2" / "—" — the frame's right-hand list-row label. */
export function mentionLabel(c: Conversation): string {
  return c.mentions > 0 ? `Nike ×${c.mentions}` : "—";
}

/** Flattened transcript text — used by the page's search box. */
export function transcriptText(c: Conversation): string {
  return c.transcript
    .flatMap((t) => t.segs.map((s) => ("v" in s ? s.v : "")))
    .join(" ");
}

/** Topbar CSV — same five columns the page shipped with. */
export function conversationExportRows(): string[][] {
  return [
    ["Conversation", "Platform", "Date", "Turns", "Nike mentions"],
    ...CONVERSATIONS.map((c) => [
      c.title,
      c.platform,
      c.date,
      String(c.turns),
      String(c.mentions),
    ]),
  ];
}
