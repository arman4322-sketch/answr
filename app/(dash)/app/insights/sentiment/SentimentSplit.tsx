"use client";

import { useFilters } from "@/lib/filters/context";
import { statFor } from "../RangeStat";
import { sentimentSeries } from "@/lib/data/insights";

/* The positive/negative split bar reads the same series as the "Positive
   sentiment" headline, so it moves with the window instead of freezing at
   74/26. Negative is the remainder of positive, which is how the frame's two
   numbers relate. */

export default function SentimentSplit() {
  const { range } = useFilters();
  const positive = Math.round(statFor(sentimentSeries, "insights:sentiment", range).value);
  const negative = 100 - positive;

  return (
    <>
      <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", marginTop: "14px" }}>
        <div style={{ width: `${positive}%`, background: "#4cb782" }} />
        <div style={{ width: `${negative}%`, background: "#e5636e" }} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "11px",
          color: "var(--fnt)",
          marginTop: "6px",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span>{`${positive}% positive`}</span>
        <span>{`${negative}% negative`}</span>
      </div>
    </>
  );
}
