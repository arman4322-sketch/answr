/* Optimize module chart data (Actions — Impact model).

   Endpoint constraints honored (fixture story):
   - impactHistory: 30 daily points, Jul 7 → Aug 5. Starts at 31.4 and ends at 34.2
     so today's headline visibility score (34.2%) and the workspace's +2.8pt 30-day
     delta are both true. Gentle noise, with a visible ~+0.6pt inflection after
     Jul 22 — action #64 "Consolidate duplicate help-center pages" shipped Jul 22
     with a measured +0.6pt lift.
   - impactProjection: 45 points. Indices 0–29 duplicate impactHistory exactly so
     the projected line continues from "today" (34.2) as one line, the way the
     design draws it; indices 30–44 rise with diminishing returns to 43.6 — the
     Impact model target if all open actions ship (34.2 + 9.4pt est. available).
   - impactXLabels: the 30 past days from last30Days() plus 15 projection points at
     6-day steps ("Proj +6d" … "Proj +90d") — the frame's +90d horizon. */

import { last30Days } from "@/lib/data/dates";

export const impactHistory: number[] = [
  31.4, 31.5, 31.3, 31.6, 31.8, 31.7, 31.9, 32.1, 32.0, 32.2,
  32.4, 32.3, 32.5, 32.4, 32.6, 32.5, 32.8, 33.1, 33.3, 33.2,
  33.4, 33.3, 33.5, 33.6, 33.5, 33.7, 33.9, 33.8, 34.0, 34.2,
];

export const impactProjection: number[] = [
  ...impactHistory,
  35.4, 36.5, 37.5, 38.4, 39.2, 39.9, 40.6, 41.2, 41.7, 42.2,
  42.6, 42.9, 43.2, 43.4, 43.6,
];

export const impactXLabels: string[] = [
  ...last30Days(),
  ...Array.from({ length: 15 }, (_, i) => `Proj +${(i + 1) * 6}d`),
];
