import type { ReportSpec } from "./report";
import {
  DEFAULT_PLATFORM,
  DEFAULT_RANGE,
  platformMeta,
  rangeMeta,
  type PlatformId,
  type RangeId,
} from "@/lib/filters/windows";

/* Keeping downloaded reports honest about their window.
   ============================================================================

   Every module's ReportSpec is a fixed snapshot of the shipped fixture — its
   `window` string states exactly what the rows cover ("Last 30 days (vs
   previous 30 days)"), and that is the ONLY window a downloaded file ever
   claims. Nothing here rewrites it from the topbar pill: the header must
   describe the data, not the control.

   What the topbar pill adds is context. If someone has the workspace on "Last
   90 days" and exports, the file still ships the 30-day sample — so we stamp a
   "Note on window" row naming the filter that was active and stating plainly
   that it is not applied. A stakeholder opening the CSV can then never mistake
   it for a 90-day report, which is the failure mode this exists to prevent. */

/** The active filter as a human phrase, or null when it is at the defaults. */
export function activeFilterLabel(range: RangeId, platform: PlatformId): string | null {
  const bits: string[] = [];
  if (range !== DEFAULT_RANGE) bits.push(rangeMeta(range).label);
  if (platform !== DEFAULT_PLATFORM) bits.push(platformMeta(platform).label);
  return bits.length ? bits.join(" · ") : null;
}

/** The CSV header note, or undefined when the filter is at the defaults. */
export function windowNote(range: RangeId, platform: PlatformId): string | undefined {
  const active = activeFilterLabel(range, platform);
  if (!active) return undefined;
  return `Workspace filter at export time: ${active}. It is NOT applied to this file — downloaded reports ship the fixed sample named under Reporting window above.`;
}

/** Stamp the note onto a spec (no-op at the default filter). */
export function withWindowNote(spec: ReportSpec, range: RangeId, platform: PlatformId): ReportSpec {
  const note = windowNote(range, platform);
  return note ? { ...spec, windowNote: note } : spec;
}

/** The extra sentence the download toast carries when the filter is off-default. */
export function windowToastSuffix(range: RangeId, platform: PlatformId): string {
  return activeFilterLabel(range, platform)
    ? " The workspace filter isn't applied to downloads — the file states the window it covers."
    : "";
}
