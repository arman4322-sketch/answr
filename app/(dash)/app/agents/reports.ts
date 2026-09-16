import type { ReportSpec, ReportSection } from "@/lib/export/report";
import { seriesSection } from "@/lib/export/reports";
import { METRICS } from "@/lib/metrics";
import { PIPELINE } from "@/lib/telemetry/pipeline";
import { ago, clockTime, dateTime, fmtInt, type AgentsView } from "./telemetryView";

/* Agent Analytics → executive CSVs, built from captured telemetry.

   Every row in these reports is a count of requests this deployment actually
   observed (lib/telemetry). There is no modelled window and no "vs previous 30
   days" column, because the pipeline has no such history: the reporting window
   is simply "since the store started collecting", and it says so in the header.
   A screen with nothing captured exports its zero state rather than a table. */

function windowOf(view: AgentsView, days: number): string {
  const span = days === 0 ? "no days with traffic yet" : `${days} ${days === 1 ? "day" : "days"} with traffic`;
  return `Captured on this deployment since ${dateTime(view.since)} (${span})`;
}

function brandOf(view: AgentsView): string {
  return view.metrics.workspace?.brand ?? "Workspace not configured";
}

function pipelineFootnotes(view: AgentsView, source: string): string[] {
  return [
    source,
    `Store: ${view.store.label}. ${view.store.durable ? "Events are durable." : "In-process buffer — a redeploy or cold start resets the counts."} Retention: last ${PIPELINE.retention} events.`,
    view.store.degraded ? `Store degraded at export time: ${view.store.degraded}` : "",
    "Counts are what this deployment captured, never a sample or a projection. Zero means no such traffic arrived.",
    "Full metric definitions: METRICS.md, or the ⓘ beside each figure in-app.",
  ].filter(Boolean);
}

const CRAWLER_SOURCE = `Source: first-party capture on this deployment — proxy.ts matches every request against ${PIPELINE.uaPatterns} published AI user-agent patterns and posts to /api/ingest. UA matching alone is recorded as "declared"; IP-range verification is a separate job.`;
const REFERRAL_SOURCE = `Source: public/snippet.js → /api/collect. Referrer hostnames and utm_source tags for ${PIPELINE.referralSources} assistants. Referrer-stripped clicks cannot be attributed, so referral counts are a floor.`;

const NOTHING = (what: string): ReportSection => ({
  title: "Nothing captured yet",
  note: `No ${what} had been captured when this file was exported. The capture path is installed and listening; this export carries no rows rather than placeholder data.`,
  columns: ["Status"],
  rows: [["0 events captured"]],
});

/* ---------------------------------------------------------------- crawlers */

export function agentsReport(view: AgentsView): ReportSpec {
  const { metrics } = view;
  const top = view.agents[0];
  const topPath = view.crawledPaths[0];

  const sections: ReportSection[] = [];
  if (view.dayKeys.length >= 2) {
    sections.push(
      seriesSection("Crawl activity by agent — daily", view.botSeries, view.dayLabels, {
        unit: "requests",
        note: "Only days with captured traffic appear. Each series sums to that agent's total in the Agents table.",
      })
    );
  }
  if (view.agents.length) {
    sections.push({
      title: "Agents",
      note: "Every AI crawler captured on this deployment, with the requests this site answered it.",
      columns: ["Agent", "Operator", "Requests", "Pages", "Blocked (4xx/5xx)", "Last seen"],
      rows: view.agents.map((a) => [a.label, a.operator, fmtInt(a.requests), fmtInt(a.pages), fmtInt(a.blocked), dateTime(a.lastSeen)]),
    });
  }
  if (view.crawledPaths.length) {
    sections.push({
      title: "Most crawled paths",
      note: "Where captured crawl traffic actually went.",
      columns: ["Path", "Requests", "% of requests", "Last crawled"],
      rows: view.crawledPaths.slice(0, 25).map((p) => [p.key, fmtInt(p.count), `${p.share}%`, dateTime(p.lastSeen)]),
    });
  }
  if (!sections.length) sections.push(NOTHING("AI-crawler requests"));

  return {
    module: "Agent Analytics · Crawlers",
    brand: brandOf(view),
    window: windowOf(view, view.dayKeys.length),
    windowNote: "This screen is not sliced by the dashboard date range — telemetry counts everything captured since the store started.",
    summary: [
      {
        label: METRICS.crawler_events.label,
        value: `${fmtInt(metrics.crawlerEvents)} requests`,
        note: `${METRICS.crawler_events.plain}. Captured first-party on this deployment.`,
      },
      {
        label: METRICS.unique_agents.label,
        value: fmtInt(metrics.uniqueAgents),
        note: `${METRICS.unique_agents.plain}. Distinct bots that actually arrived.`,
      },
      {
        label: METRICS.pages_crawled.label,
        value: fmtInt(metrics.pagesCrawled),
        note: `${METRICS.pages_crawled.plain}. Distinct paths fetched by those bots.`,
      },
      {
        label: "Blocked requests",
        value: fmtInt(view.blockedRequests),
        note: "Captured requests this deployment answered 4xx/5xx. Derived from the response status, not from robots.txt.",
      },
      {
        label: "Busiest crawler",
        value: top ? `${top.label} — ${fmtInt(top.requests)} requests, ${fmtInt(top.pages)} pages` : "None captured yet",
        note: top ? `${top.operator}. Last seen ${ago(top.lastSeen)}.` : "No AI crawler has reached this deployment yet.",
      },
      {
        label: "Most crawled page",
        value: topPath ? `${topPath.key} — ${fmtInt(topPath.count)} requests` : "None captured yet",
        note: topPath ? `${topPath.share}% of all captured crawler requests.` : "No path has been fetched by an AI crawler yet.",
      },
    ],
    sections,
    footnotes: pipelineFootnotes(view, CRAWLER_SOURCE),
  };
}

/* --------------------------------------------------------------- referrals */

export function referralsReport(view: AgentsView): ReportSpec {
  const { metrics } = view;
  const top = view.referralSources[0];

  const sections: ReportSection[] = [];
  if (view.referralDayKeys.length >= 2) {
    sections.push(
      seriesSection("Referred humans by platform — daily", view.referralSeries, view.referralDayLabels, {
        unit: "humans",
        note: "Only days with captured referrals appear.",
      })
    );
  }
  if (view.referralSources.length) {
    sections.push({
      title: "Referring platform",
      note: "Which assistant sent the visitor, by captured click.",
      columns: ["Platform", "Referred", "Share", "Last referral"],
      rows: view.referralSources.map((s) => [s.key, fmtInt(s.count), `${s.share}%`, dateTime(s.lastSeen)]),
    });
  }
  if (view.landingPages.length) {
    sections.push({
      title: "Landing pages",
      note: "Where AI-referred visitors arrived first.",
      columns: ["Page", "Referred", "% of AI referrals", "Last referral"],
      rows: view.landingPages.slice(0, 25).map((p) => [p.key, fmtInt(p.count), `${p.share}%`, dateTime(p.lastSeen)]),
    });
  }
  if (!sections.length) sections.push(NOTHING("AI referrals"));

  return {
    module: "Agent Analytics · Referrals",
    brand: brandOf(view),
    window: windowOf(view, view.referralDayKeys.length),
    windowNote: "Referrals are counted from captured click-throughs, not sliced by the dashboard date range.",
    summary: [
      {
        label: METRICS.ai_referrals.label,
        value: `${fmtInt(metrics.aiReferrals)} visits`,
        note: `${METRICS.ai_referrals.plain}. Captured by the first-party snippet; referrer-stripped clicks are missed, so this is a floor.`,
      },
      {
        label: "Referring platforms",
        value: fmtInt(view.referralSources.length),
        note: "Distinct assistants that have sent a visitor here.",
      },
      {
        label: "Landing pages",
        value: fmtInt(view.landingPages.length),
        note: "Distinct pages AI-referred visitors arrived on.",
      },
      {
        label: "Top platform",
        value: top ? `${top.key} — ${fmtInt(top.count)} (${top.share}%)` : "None captured yet",
        note: top ? `Last referral ${ago(top.lastSeen)}.` : "No assistant has sent a visitor here yet.",
      },
    ],
    sections,
    footnotes: pipelineFootnotes(view, REFERRAL_SOURCE),
  };
}

/* ------------------------------------------------------------ bot detail */

export function botReport(view: AgentsView, botLabel: string, operator: string): ReportSpec {
  const events = view.crawlerEvents.filter((e) => e.botLabel === botLabel);
  const row = view.agents.find((a) => a.label === botLabel);
  const paths = new Map<string, { count: number; lastSeen: number }>();
  for (const e of events) {
    const cur = paths.get(e.path) ?? { count: 0, lastSeen: 0 };
    cur.count += 1;
    cur.lastSeen = Math.max(cur.lastSeen, e.ts);
    paths.set(e.path, cur);
  }

  const sections: ReportSection[] = events.length
    ? [
        {
          title: "Pages fetched",
          note: "Paths this agent requested, and when it last did.",
          columns: ["Path", "Requests", "Last visit"],
          rows: [...paths.entries()]
            .sort((a, b) => b[1].count - a[1].count)
            .map(([path, v]) => [path, fmtInt(v.count), dateTime(v.lastSeen)]),
        },
        {
          title: "Requests by response status",
          note: "What this deployment answered the agent.",
          columns: ["Status", "Requests"],
          rows: [...events.reduce((m, e) => m.set(e.status, (m.get(e.status) ?? 0) + 1), new Map<number, number>()).entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([status, count]) => [String(status), fmtInt(count)]),
        },
      ]
    : [NOTHING(`${botLabel} requests`)];

  return {
    module: `Agent Analytics · ${botLabel}`,
    brand: brandOf(view),
    window: windowOf(view, new Set(events.map((e) => new Date(e.ts).toISOString().slice(0, 10))).size),
    summary: [
      {
        label: `${botLabel} requests`,
        value: fmtInt(row?.requests ?? 0),
        note: `${operator}'s agent, captured first-party. ${view.metrics.crawlerEvents ? `${Math.round(((row?.requests ?? 0) / view.metrics.crawlerEvents) * 100)}% of all captured AI-crawler requests.` : "No crawler traffic captured yet."}`,
      },
      {
        label: METRICS.pages_crawled.label,
        value: fmtInt(row?.pages ?? 0),
        note: `${METRICS.pages_crawled.plain}. Distinct paths this agent fetched.`,
      },
      {
        label: "Blocked (4xx/5xx)",
        value: fmtInt(row?.blocked ?? 0),
        note: "Requests this deployment turned away, read from the response status.",
      },
      {
        label: "Last seen",
        value: row?.lastSeen ? `${dateTime(row.lastSeen)} (${ago(row.lastSeen)})` : "Never",
        note: row?.lastSeen ? "Most recent captured request from this agent." : "This agent has not reached this deployment yet.",
      },
    ],
    sections,
    footnotes: pipelineFootnotes(view, CRAWLER_SOURCE),
  };
}

/* ------------------------------------------------------------- live logs */

export function logsReport(view: AgentsView): ReportSpec {
  const events = view.crawlerEvents.slice(0, 100);
  const operators = [...new Set(events.map((e) => e.operator))];

  return {
    module: "Agent Analytics · Live logs",
    brand: brandOf(view),
    window: windowOf(view, view.dayKeys.length),
    windowNote: "The log stream is the most recent captured requests, not a date window.",
    summary: [
      {
        label: "Requests captured",
        value: fmtInt(view.metrics.crawlerEvents),
        note: `Since ${dateTime(view.since)}. Retention is the last ${PIPELINE.retention} events.`,
      },
      {
        label: "In this export",
        value: `${fmtInt(events.length)} most recent requests`,
        note: events.length ? `Newest ${dateTime(events[0].ts)}, oldest ${dateTime(events[events.length - 1].ts)}.` : "Nothing captured yet.",
      },
      {
        label: "Blocked in these requests",
        value: fmtInt(events.filter((e) => e.status >= 400).length),
        note: "Requests answered 4xx/5xx by this deployment.",
      },
      {
        label: "Operators seen",
        value: operators.length ? operators.join(" · ") : "None yet",
        note: "Distinct crawler operators in the captured stream.",
      },
    ],
    sections: events.length
      ? [
          {
            title: "Request log",
            note: "Newest first. Status is what this deployment answered the agent.",
            columns: ["Time", "Date", "Operator", "Agent", "Path", "Status", "Verification"],
            rows: events.map((e) => [clockTime(e.ts), dateTime(e.ts), e.operator, e.botLabel, e.path, String(e.status), e.verification]),
          },
        ]
      : [NOTHING("AI-crawler requests")],
    footnotes: pipelineFootnotes(view, CRAWLER_SOURCE),
  };
}
