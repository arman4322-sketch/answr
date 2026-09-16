import type { UserLocation } from "@/lib/providers/types";

/* Segments — the slices a brand is measured in besides "overall".
 *
 * Two kinds, and they are measured differently on purpose:
 *
 *   region   WHERE the question is asked from. Answer engines localise, so a
 *            regional figure is only meaningful if the question was actually
 *            asked from that region. Lanes with a located search API do that;
 *            the rest are told the location in the prompt, which is a weaker
 *            measurement and is recorded as such.
 *
 *   audience WHO is asking. No engine exposes a "searcher persona" parameter,
 *            so this is always prompt framing — the same question asked the way
 *            that buyer would ask it. That is a real and repeatable
 *            measurement, but it is framing, and the UI says so.
 *
 * Both reuse the whole sampling and scoring pipeline: a segmented run is an
 * ordinary PromptRun carrying a `segment` tag, so every existing metric works
 * on it unchanged. */

export type SegmentKind = "region" | "audience";

/** The tag stored on a sampled run. Kept small — it is written per run.
 *  How the segment reached each engine varies by lane, so that is recorded on
 *  the answer (SampledAnswer.applied), not here. */
export interface SegmentTag {
  kind: SegmentKind;
  id: string;
  label: string;
}

export interface RegionSegment {
  kind: "region";
  id: string;
  label: string;
  location: UserLocation;
}

export interface AudienceSegment {
  kind: "audience";
  id: string;
  label: string;
  /** one sentence describing who is asking, prefixed to every prompt */
  persona: string;
  /** what makes this buyer different, shown in the UI */
  note?: string;
}

export type Segment = RegionSegment | AudienceSegment;

/** Frame a prompt as a given persona would ask it. */
export function personaPrompt(persona: string, prompt: string): string {
  return `${persona.trim()}\n\n${prompt}`;
}

/**
 * Frame a prompt for a location, for lanes with no located search.
 * Used only when `supportsLocation` is false, and the run records that the
 * location was stated rather than searched from.
 */
export function locationPrompt(label: string, prompt: string): string {
  return `I'm in ${label}. ${prompt}`;
}
