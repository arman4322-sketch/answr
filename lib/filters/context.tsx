"use client";

import { createContext, useContext, useMemo, useState } from "react";
import {
  DEFAULT_PLATFORM,
  DEFAULT_RANGE,
  platformMeta,
  rangeMeta,
  type PlatformId,
  type PlatformMeta,
  type RangeId,
  type RangeMeta,
} from "./windows";

/* Workspace filter state — the topbar's date-range and platform pills.

   Mounted once in app/(dash)/app/layout.tsx, so the selection survives
   client-side navigation between dashboard screens: pick "Last 90 days" on
   Overview and Citations is already on 90 days when you get there.

   Server and client both start on the shipped defaults (30 days · all
   platforms), so first paint is identical and hydration is clean. */

type FilterState = {
  range: RangeId;
  platform: PlatformId;
  setRange: (r: RangeId) => void;
  setPlatform: (p: PlatformId) => void;
  /** convenience: the active window's metadata (days, weeks, labels) */
  window: RangeMeta;
  /** convenience: the active platform's metadata */
  platformInfo: PlatformMeta;
};

const FilterContext = createContext<FilterState | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [range, setRange] = useState<RangeId>(DEFAULT_RANGE);
  const [platform, setPlatform] = useState<PlatformId>(DEFAULT_PLATFORM);

  const value = useMemo<FilterState>(
    () => ({ range, platform, setRange, setPlatform, window: rangeMeta(range), platformInfo: platformMeta(platform) }),
    [range, platform]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

/**
 * Read the active filters. Safe outside the provider (marketing pages, tests):
 * it falls back to the shipped defaults with no-op setters, so a component can
 * be reused anywhere without crashing.
 */
export function useFilters(): FilterState {
  const ctx = useContext(FilterContext);
  if (ctx) return ctx;
  return {
    range: DEFAULT_RANGE,
    platform: DEFAULT_PLATFORM,
    setRange: () => {},
    setPlatform: () => {},
    window: rangeMeta(DEFAULT_RANGE),
    platformInfo: platformMeta(DEFAULT_PLATFORM),
  };
}
