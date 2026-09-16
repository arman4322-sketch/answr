import { db } from "@/lib/db";
import { listActions } from "@/lib/db/entities";
import { getLiveMetrics, type LiveMetrics } from "@/lib/live/metrics";
import type { ReportSpec } from "@/lib/export/report";
import { overviewSpec } from "../overview/report";
import { topicsSpec } from "../insights/reports";
import { citationsReport } from "../citations/reports";
import { actionsScreen } from "../actions/rows";
import { actionsReport } from "../actions/reports";
import { getAgentsView } from "../agents/telemetryView";
import { currentWorkspaceId } from "@/lib/tenant";
import { agentsReport } from "../agents/reports";

/* The reports this workspace can actually produce.

   The Reports screen used to list four saved reports (names, ranges, created
   dates, formats) and two schedules with recipient counts. None of that was
   ever stored: there is no report store, no scheduler and no mail sender in
   this product, so every one of those rows was a fixture.

   What IS real is the export pipeline. Every wired screen builds a ReportSpec
   from live metrics and lib/export/report.ts renders it as an executive CSV.
   This catalog collects those same specs so the Reports screen lists what can
   genuinely be downloaded right now — built from the same live metrics the
   screens themselves render, so a file and a screen can never disagree.

   Counts below are counted off each built spec, not declared: they describe the
   file the button will actually write. */


export type ExportableReport = {
  id: string;
  /** the module this report covers */
  name: string;
  /** what the file contains — its sections, never a figure */
  detail: string;
  /** the screen this report is the export of */
  href: string;
  filename: string;
  spec: ReportSpec;
  /** metrics in the file's EXECUTIVE SUMMARY block */
  summaryCount: number;
  sectionCount: number;
  /** data rows across every section */
  rowCount: number;
};

function slugOf(m: LiveMetrics): string {
  return (
    (m.workspace?.brand ?? "workspace")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "workspace"
  );
}

function entry(
  id: string,
  name: string,
  detail: string,
  href: string,
  filename: string,
  spec: ReportSpec
): ExportableReport {
  return {
    id,
    name,
    detail,
    href,
    filename,
    spec,
    summaryCount: spec.summary?.length ?? 0,
    sectionCount: spec.sections.length,
    rowCount: spec.sections.reduce((n, s) => n + s.rows.length, 0),
  };
}

/** Live metrics plus every report that can be built from them today. */
export async function reportCatalog(): Promise<{ metrics: LiveMetrics; reports: ExportableReport[] }> {
  // Resolve the tenant once so every read below describes the same workspace.
  const wsId = await currentWorkspaceId();
  const [metrics, saved, agents] = await Promise.all([
    getLiveMetrics(wsId),
    listActions(wsId).catch(() => []),
    getAgentsView(wsId),
  ]);

  const slug = slugOf(metrics);
  const actions = actionsScreen(
    metrics,
    saved.map((a) => ({
      id: a.id,
      title: a.title,
      impact: a.impact,
      effort: a.effort,
      status: a.status,
      createdAt: a.createdAt,
    })),
    db().durable
  );

  const reports: ExportableReport[] = [
    entry(
      "overview",
      "Executive overview",
      "Headline visibility and share of voice, the trend across every sampled day, brand comparison and platform split.",
      "/app/overview",
      `${slug}-overview.csv`,
      overviewSpec(metrics)
    ),
    entry(
      "insights",
      "Answer Engine Insights",
      "The same headline metrics with per-platform visibility and one row per tracked prompt from its latest sampled answer.",
      "/app/insights",
      `${slug}-insights.csv`,
      topicsSpec(metrics)
    ),
    entry(
      "citations",
      "Citations",
      "Owned versus earned source mix, cited domains by share, and the sampled answers the citations were parsed from.",
      "/app/citations",
      `${slug}-citations.csv`,
      citationsReport(metrics)
    ),
    entry(
      "actions",
      "Actions queue",
      "Every tracked prompt whose latest answers leave the brand out or name a competitor first, worst-first, with the evidence.",
      "/app/actions",
      `${slug}-actions.csv`,
      actionsReport(actions)
    ),
    entry(
      "agents",
      "Agent analytics",
      "AI crawler requests captured on this deployment: agents, paths, response statuses and the daily crawl trend.",
      "/app/agents",
      `${slug}-agents.csv`,
      agentsReport(agents)
    ),
  ];

  return { metrics, reports };
}
