/* KPI-card sparkline drawn from the metric's own window.

   The frames painted a fixed 76×26 path per card. Now that the KPI value and
   delta re-slice with the topbar's date range, the sparkline has to move with
   them or the card would contradict itself — so the path is generated from the
   same points the headline reads. Geometry (76×26, 1.25 stroke) and the
   good/bad stroke colors are the frame's, verbatim. */

export default function Sparkline({
  points,
  good,
  color,
  width = 76,
  height = 26,
}: {
  points: number[];
  /** true = green (the frame's #4cb782), false = red (#e5636e) */
  good: boolean;
  /** explicit stroke (series-coloured sparklines, e.g. the competitor table) */
  color?: string;
  width?: number;
  height?: number;
}) {
  const pad = 4;
  const n = points.length;
  const lo = Math.min(...points);
  const hi = Math.max(...points);
  const span = hi - lo || 1;

  const d =
    n < 2
      ? `M0 ${height / 2}L${width} ${height / 2}`
      : points
          .map((v, i) => {
            const x = (i / (n - 1)) * width;
            const y = pad + (1 - (v - lo) / span) * (height - pad * 2);
            return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join("");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ flex: "none" }} aria-hidden="true">
      <path d={d} fill="none" stroke={color ?? (good ? "#4cb782" : "#e5636e")} strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}
