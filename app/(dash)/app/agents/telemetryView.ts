import type { TrendSeries } from "@/components/app/charts/TrendChart";
import { getLiveMetrics, type LiveMetrics } from "@/lib/live/metrics";
import { telemetry, type CrawlerEvent, type ReferralEvent } from "@/lib/telemetry";

/* Agent Analytics — the screen's one read of REAL first-party telemetry.

   Headline figures come from the live metrics layer (crawlerEvents,
   uniqueAgents, pagesCrawled, aiReferrals, telemetryDurable). The breakdowns
   this screen draws — per-agent rows, crawled paths, the daily chart, referral
   sources and landing pages, the log stream — are derived here from the same
   captured events (lib/telemetry: proxy.ts → /api/ingest, snippet.js →
   /api/collect). Nothing is modelled, scaled or back-filled: every number is a
   count of requests this deployment actually observed.

   Consequences we render rather than hide:
   - Zero events is the normal state until an AI bot or a referred visitor
     arrives. Screens say the capture is listening; they never print a figure.
   - A trend needs at least two captured days. `dayKeys` only contains days that
     really have events, so a chart is drawn only when there are two of them.
   - robots.txt posture, GA4 parity, purchases and "vs previous 30 days" deltas
     are not observable from this pipeline, so they are not displayed at all. */

const SERIES_COLORS = ["var(--ac)", "#7fa7d9", "#b98ed9", "#d9b679", "#d985a8"];

export type AgentRow = {
  botId: string;
  label: string;
  operator: string;
  requests: number;
  /** distinct paths this agent fetched */
  pages: number;
  /** requests this deployment answered 4xx/5xx */
  blocked: number;
  lastSeen: number;
};

export type CountRow = {
  key: string;
  count: number;
  /** percentage of the parent total, 0–100 */
  share: number;
  /** most recent event for this key (0 when not tracked) */
  lastSeen: number;
};

export type AgentsView = {
  metrics: LiveMetrics;
  /** when this store started collecting */
  since: number;
  store: { kind: string; label: string; durable: boolean; degraded: string | null };
  /** newest first */
  crawlerEvents: CrawlerEvent[];
  referralEvents: ReferralEvent[];
  agents: AgentRow[];
  crawledPaths: CountRow[];
  blockedRequests: number;
  /** YYYY-MM-DD for every day that actually has crawler events, oldest first */
  dayKeys: string[];
  dayLabels: string[];
  /** per-agent daily requests over `dayKeys` — top agents only */
  botSeries: TrendSeries[];
  referralSources: CountRow[];
  referralSeries: TrendSeries[];
  referralDayKeys: string[];
  referralDayLabels: string[];
  landingPages: CountRow[];
};

export const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

const dayKey = (ts: number) => new Date(ts).toISOString().slice(0, 10);

export function dayLabel(key: string): string {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/** "2 min ago" / "—" — real timestamps only. */
export function ago(ts: number, now = Date.now()): string {
  if (!ts) return "—";
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
}

export function dateTime(ts: number): string {
  return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function clockTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", { hour12: false });
}

/** A round y-axis top for a real maximum (never a fixed fixture domain). */
export function niceMax(max: number): number {
  if (max <= 0) return 4;
  /* small counts get an axis divisible by four, so the quarter ticks are whole
     requests rather than "1.5 requests" */
  if (max <= 20) return Math.max(4, Math.ceil(max / 4) * 4);
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  for (const step of [1, 2, 2.5, 5, 10]) {
    const top = step * pow;
    if (top >= max) return top;
  }
  return 10 * pow;
}

function shareOf(count: number, total: number): number {
  return total ? Math.round((count / total) * 1000) / 10 : 0;
}

function dailyCounts(dayKeys: string[], events: { ts: number }[]): number[] {
  const byDay = new Map<string, number>();
  for (const e of events) {
    const k = dayKey(e.ts);
    byDay.set(k, (byDay.get(k) ?? 0) + 1);
  }
  return dayKeys.map((k) => byDay.get(k) ?? 0);
}

/** One read: live metrics for the headline, captured events for the detail. */
export async function getAgentsView(): Promise<AgentsView> {
  const [metrics, snap] = await Promise.all([getLiveMetrics(), telemetry.snapshot()]);

  const crawlerEvents = [...snap.crawlers].sort((a, b) => b.ts - a.ts);
  const referralEvents = [...snap.referrals].sort((a, b) => b.ts - a.ts);

  // ---- agents actually seen ----
  const botMap = new Map<string, AgentRow & { paths: Set<string> }>();
  for (const e of crawlerEvents) {
    const cur =
      botMap.get(e.botId) ??
      ({ botId: e.botId, label: e.botLabel, operator: e.operator, requests: 0, pages: 0, blocked: 0, lastSeen: 0, paths: new Set<string>() } as AgentRow & {
        paths: Set<string>;
      });
    cur.requests += 1;
    cur.paths.add(e.path);
    if (e.status >= 400) cur.blocked += 1;
    cur.lastSeen = Math.max(cur.lastSeen, e.ts);
    botMap.set(e.botId, cur);
  }
  const agents: AgentRow[] = [...botMap.values()]
    .map(({ paths, ...row }) => ({ ...row, pages: paths.size }))
    .sort((a, b) => b.requests - a.requests);

  // ---- paths crawled ----
  const pathMap = new Map<string, { count: number; lastSeen: number }>();
  for (const e of crawlerEvents) {
    const cur = pathMap.get(e.path) ?? { count: 0, lastSeen: 0 };
    cur.count += 1;
    cur.lastSeen = Math.max(cur.lastSeen, e.ts);
    pathMap.set(e.path, cur);
  }
  const crawledPaths: CountRow[] = [...pathMap.entries()]
    .map(([key, v]) => ({ key, count: v.count, share: shareOf(v.count, crawlerEvents.length), lastSeen: v.lastSeen }))
    .sort((a, b) => b.count - a.count);

  // ---- days that genuinely have crawler traffic ----
  const dayKeys = [...new Set(crawlerEvents.map((e) => dayKey(e.ts)))].sort();
  const botSeries: TrendSeries[] = agents.slice(0, 4).map((a, i) => ({
    id: a.botId,
    label: a.label,
    color: SERIES_COLORS[i % SERIES_COLORS.length],
    points: dailyCounts(
      dayKeys,
      crawlerEvents.filter((e) => e.botId === a.botId)
    ),
    area: i === 0,
  }));

  // ---- referrals ----
  const srcMap = new Map<string, { label: string; count: number; lastSeen: number }>();
  for (const e of referralEvents) {
    const cur = srcMap.get(e.sourceId) ?? { label: e.sourceLabel, count: 0, lastSeen: 0 };
    cur.count += 1;
    cur.lastSeen = Math.max(cur.lastSeen, e.ts);
    srcMap.set(e.sourceId, cur);
  }
  const referralSources: CountRow[] = [...srcMap.values()]
    .map((v) => ({ key: v.label, count: v.count, share: shareOf(v.count, referralEvents.length), lastSeen: v.lastSeen }))
    .sort((a, b) => b.count - a.count);

  const landingMap = new Map<string, { count: number; lastSeen: number }>();
  for (const e of referralEvents) {
    const cur = landingMap.get(e.path) ?? { count: 0, lastSeen: 0 };
    cur.count += 1;
    cur.lastSeen = Math.max(cur.lastSeen, e.ts);
    landingMap.set(e.path, cur);
  }
  const landingPages: CountRow[] = [...landingMap.entries()]
    .map(([key, v]) => ({ key, count: v.count, share: shareOf(v.count, referralEvents.length), lastSeen: v.lastSeen }))
    .sort((a, b) => b.count - a.count);

  const referralDayKeys = [...new Set(referralEvents.map((e) => dayKey(e.ts)))].sort();
  const referralSeries: TrendSeries[] = [...srcMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 4)
    .map(([sourceId, v], i) => ({
      id: sourceId,
      label: v.label,
      color: SERIES_COLORS[i % SERIES_COLORS.length],
      points: dailyCounts(
        referralDayKeys,
        referralEvents.filter((e) => e.sourceId === sourceId)
      ),
      area: i === 0,
    }));

  return {
    metrics,
    since: snap.since,
    store: { kind: telemetry.kind, label: telemetry.label, durable: telemetry.durable, degraded: snap.degraded },
    crawlerEvents,
    referralEvents,
    agents,
    crawledPaths,
    blockedRequests: crawlerEvents.filter((e) => e.status >= 400).length,
    dayKeys,
    dayLabels: dayKeys.map(dayLabel),
    botSeries,
    referralSources,
    referralSeries,
    referralDayKeys,
    referralDayLabels: referralDayKeys.map(dayLabel),
    landingPages,
  };
}
