import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import InsightsTabs from "../InsightsTabs";
import AudiencesBoard from "./AudiencesBoard";

export const metadata: Metadata = { title: "Audiences · Answer Engine Insights" };

/* Topbar export — the visible segment-comparison table, header row first (playbook 1). */
const EXPORT_ROWS: string[][] = [
  ["Segment", "Visibility", "Share of voice", "Sentiment", "Δ 30d"],
  ["Marathon runners", "44.6%", "36.2%", "Positive · 78", "↑ 3.1"],
  ["Gym / cross-training", "31.8%", "26.4%", "Positive · 71", "↑ 1.2"],
  ["Casual / lifestyle wearers", "18.2%", "15.9%", "Neutral · 55", "↓ 0.4"],
];

/* Answer Engine Insights — Audiences — converted from canvas frame #p2-audiences.
   Wired (W2): visibility trend → TrendChart with area fill; axis dates match the
   Jul 7 – Aug 5 window.
   Activated (F2): the three segment cards are real buttons and DRIVE the page —
   headline + delta, trend series + y-axis, "Rank in segment" and the highlighted
   comparison row all come from lib/data/audiences.ts. "+ New segment" opens a
   real describe → generate-prompt-set → add flow. Everything below the tabs
   therefore lives in the client child <AudiencesBoard>; this page stays a server
   component so it can export metadata. */
export default function Page() {
  return (
    <div className="frame-p2-audiences">
      <Topbar crumb={["Answer Engine Insights", "Audiences"]} rangeLive platformNote="Audience visibility is scored across all platforms here — the platform filter re-slices Overview." exportFilename="nike-insights-audiences-30d.csv" exportRows={EXPORT_ROWS} />
      <InsightsTabs />
      <AudiencesBoard />
    </div>
  );
}
