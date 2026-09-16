import KpiCard from "@/components/app/KpiCard";
import { fmtInt, type AgentsView } from "./telemetryView";

/* Agent Analytics KPI row — first-party telemetry, exactly as captured.

   Values come straight from the live metrics layer (crawlerEvents,
   uniqueAgents, pagesCrawled) plus the blocked count derived from the HTTP
   status this deployment actually returned to each bot. They are counts of real
   requests, so they start at zero and stay there until an AI crawler arrives.

   No deltas: a "vs previous 30 days" comparison needs 60 days of history this
   pipeline does not have. Each card's caption states the window it really
   covers — the days that genuinely have captured events. */

export default function AgentKpis({ view }: { view: AgentsView }) {
  const { metrics } = view;
  const days = view.dayKeys.length;
  const span = days === 0 ? "no traffic captured yet" : `${days} ${days === 1 ? "day" : "days"} with captured traffic`;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
      <KpiCard label="AI crawler requests" value={fmtInt(metrics.crawlerEvents)} metricId="crawler_events" sub={span} />
      <KpiCard label="Unique agents" value={fmtInt(metrics.uniqueAgents)} metricId="unique_agents" sub={days ? "distinct bots seen" : "none seen yet"} />
      <KpiCard label="Pages crawled" value={fmtInt(metrics.pagesCrawled)} metricId="pages_crawled" sub={days ? "distinct paths fetched" : "none fetched yet"} />
      <KpiCard
        label="Blocked requests"
        value={fmtInt(view.blockedRequests)}
        metricId="crawler_events"
        hint="Bot visits your site turned away"
        sub={metrics.crawlerEvents ? `answered 4xx/5xx of ${fmtInt(metrics.crawlerEvents)} requests` : "none to block yet"}
      />
    </div>
  );
}
