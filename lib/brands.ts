import { useSyncExternalStore } from "react";

/* The workspace's tracked brands ("assets").
 *
 * Single source of truth for the two surfaces that show them: the sidebar brand
 * switcher and /app/assets. Headline stats are the /app/assets fixtures verbatim
 * — never recomputed, never rounded, never re-derived.
 *
 * Demo honesty: this workspace ships fixtures for ONE brand (Nike). The other
 * properties are listed because a real workspace tracks several, but every
 * dashboard number you see belongs to Nike — selecting another brand says so
 * out loud rather than silently showing Nike's data under a different name.
 */

export type Brand = {
  id: string;
  name: string;
  domain: string;
  /** category shown after the domain, e.g. "athletic footwear" */
  category: string;
  /** single letter in the square icon */
  initial: string;
  /** icon gradient, verbatim from the assets frame */
  gradient: string;
  /** headline stats — fixtures from /app/assets, unchanged */
  visibility: string;
  /** signed delta glyph + value, e.g. "↑2.8" */
  delta: string;
  deltaUp: boolean;
  prompts: string;
  /** plan quota suffix, e.g. "/550" */
  promptQuota: string;
  competitors: string;
  /** named competitor set, where the workspace defines one */
  competitorNames?: string[];
  /** the one brand this demo actually has fixtures for */
  live?: boolean;
  /** lowercase haystack for the assets search box */
  search: string;
};

export const BRANDS: Brand[] = [
  {
    id: "nike",
    name: "Nike",
    domain: "nike.com",
    category: "athletic footwear",
    initial: "N",
    gradient: "linear-gradient(135deg,#a394ff,#6d5ce6)",
    visibility: "34.2%",
    delta: "↑2.8",
    deltaUp: true,
    prompts: "412",
    promptQuota: "/550",
    competitors: "4",
    competitorNames: ["Adidas", "Puma", "Under Armour", "New Balance"],
    live: true,
    search: "nike nike.com athletic footwear apparel running shoes",
  },
  {
    id: "snkrs",
    name: "Nike SNKRS",
    domain: "snkrs.nike.com",
    category: "sneaker releases",
    initial: "S",
    gradient: "linear-gradient(135deg,#7fd0e8,#3f8ab0)",
    visibility: "11.8%",
    delta: "↑1.2",
    deltaUp: true,
    prompts: "120",
    promptQuota: "/200",
    competitors: "3",
    search: "nike snkrs snkrs.nike.com sneaker releases drops",
  },
  {
    id: "jordan",
    name: "Jordan Brand",
    domain: "jordan.com",
    category: "basketball footwear",
    initial: "J",
    gradient: "linear-gradient(135deg,#e8c47f,#b0823f)",
    visibility: "22.4%",
    delta: "↓0.6",
    deltaUp: false,
    prompts: "240",
    promptQuota: "/250",
    competitors: "6",
    search: "jordan brand jordan.com basketball footwear sneakers",
  },
];

export const LIVE_BRAND: Brand = BRANDS.find((b) => b.live) ?? BRANDS[0];

/** Honest line shown when a read-only brand is picked in the switcher. */
export const SWITCH_NOTE =
  "Nike is the demo workspace's live brand — the others are read-only here.";

/** Honest line shown after the add-brand form validates. */
export const ADD_BRAND_NOTE =
  "Brand setup completes on live workspaces — this demo ships Nike's fixtures only.";

/* ---- selected-brand store -------------------------------------------------
   Deliberately tiny and in-memory: the sidebar (rendered by the dashboard
   layout) and /app/assets have no common React parent we own, so they share
   this module-level value instead. It survives client-side navigation and
   resets to the live brand on a hard reload — no persistence, no hydration
   mismatch (server and first client render both read BRANDS[0]).            */

let selectedId: string = LIVE_BRAND.id;
const listeners = new Set<() => void>();

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot() {
  return selectedId;
}

function getServerSnapshot() {
  return LIVE_BRAND.id;
}

export function setSelectedBrand(id: string) {
  if (id === selectedId) return;
  selectedId = id;
  listeners.forEach((fn) => fn());
}

export function brandById(id: string): Brand {
  return BRANDS.find((b) => b.id === id) ?? LIVE_BRAND;
}

/** Client components only. */
export function useSelectedBrand(): Brand {
  return brandById(useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot));
}
