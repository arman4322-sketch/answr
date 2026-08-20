"use client";

import type { TrendSeries } from "@/components/app/charts/TrendChart";
import { useFilters } from "@/lib/filters/context";
import { statFor } from "./RangeStat";

/* Bare windowed value — for the places where a card restates a headline metric
   (e.g. the "Rank in topic" row for Nike) and would otherwise disagree with the
   chart above it once the window changes. */

export default function RangeValue({
  series,
  seed,
  decimals = 1,
  unit = "%",
}: {
  series: TrendSeries[];
  seed: string;
  decimals?: number;
  unit?: string;
}) {
  const { range } = useFilters();
  const stat = statFor(series, seed, range);
  return <>{`${stat.value.toFixed(decimals)}${unit}`}</>;
}
