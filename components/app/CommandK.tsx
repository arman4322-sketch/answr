"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { buildExecutiveCsv, csvBlob, type ReportSpec } from "@/lib/export/report";
import { withWindowNote, windowToastSuffix } from "@/lib/export/active-window";
import { useFilters } from "@/lib/filters/context";
import { fmtInt } from "@/lib/filters/windows";
import type { LiveMetrics } from "@/lib/live/metrics";

/* ⌘K command palette — from canvas frame #m-surfaces. Opens on Cmd/Ctrl+K anywhere
   and on the window CustomEvent "answr:cmdk" (dispatched by the Sidebar search
   button); closes on Esc / backdrop click.

   Sale-readiness pass: the search box is real — it filters a full index of
   dashboard screens (case-insensitive, matches label or group) plus the palette
   actions, with a genuine empty state.

   Live-data pass: "Export citations" used to dump a hard-coded fixture — a
   demo-branded source-mix table of 1,284 citations that no sampled answer ever
   produced. It now loads /api/live/metrics when the palette opens and exports
   the real cited-domain table for the configured workspace. When nothing has
   been sampled the action says so and downloads nothing, rather than handing
   someone a CSV of numbers the pipeline never measured. */

type Screen = { label: string; group: string; href: string };

const SCREENS: Screen[] = [
  { label: "Overview", group: "Home", href: "/app/overview" },
  { label: "Live telemetry", group: "Agents", href: "/app/live" },
  { label: "Citations", group: "Monitor", href: "/app/citations" },
  { label: "Watched URLs", group: "Citations", href: "/app/citations/watched" },
  { label: "Prompts", group: "Monitor", href: "/app/prompts" },
  { label: "Conversations", group: "Insights", href: "/app/conversations" },
  { label: "Demand", group: "Insights", href: "/app/demand" },
  { label: "Answer Engine Insights", group: "Insights", href: "/app/insights" },
  { label: "Regions", group: "Insights", href: "/app/insights/regions" },
  { label: "Audiences", group: "Insights", href: "/app/insights/audiences" },
  { label: "Sentiment", group: "Insights", href: "/app/insights/sentiment" },
  { label: "Shopping", group: "Insights", href: "/app/insights/shopping" },
  { label: "Agent Analytics", group: "Agents", href: "/app/agents" },
  { label: "Referrals", group: "Agents", href: "/app/agents/referrals" },
  { label: "Crawler logs", group: "Agents", href: "/app/agents/logs" },
  { label: "Actions", group: "Optimize", href: "/app/actions" },
  { label: "Workflows", group: "Optimize", href: "/app/workflows" },
  { label: "Reports", group: "Optimize", href: "/app/reports" },
  { label: "Assets", group: "Optimize", href: "/app/assets" },
  { label: "Content score", group: "Optimize", href: "/app/content-score" },
  { label: "Page health", group: "Optimize", href: "/app/page-health" },
  { label: "Settings", group: "Account", href: "/app/settings" },
  { label: "Integrations", group: "Settings", href: "/app/settings/integrations" },
  { label: "Team", group: "Settings", href: "/app/settings/team" },
  { label: "Billing", group: "Settings", href: "/app/settings/billing" },
  { label: "API keys", group: "Settings", href: "/app/settings/api-keys" },
];

/** Filename stem from the real workspace brand — never a fixture brand. */
function stem(m: LiveMetrics): string {
  const base =
    (m.workspace?.brand ?? "workspace")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "workspace";
  return `${base}-cited-domains`;
}

/** The window the rows actually cover: the days that were genuinely sampled. */
function windowLabel(m: LiveMetrics): string {
  if (!m.hasData) return "No samples collected yet";
  const days = `${m.days} day${m.days === 1 ? "" : "s"} of sampled history`;
  return m.lastRunAt ? `${days} (last run ${new Date(m.lastRunAt).toISOString().slice(0, 10)})` : days;
}

/** Cited domains, straight off the live metrics — no source taxonomy invented. */
function citedDomainsReport(m: LiveMetrics): ReportSpec {
  const owned = m.citedDomains.filter((d) => d.owned).reduce((s, d) => s + d.count, 0);
  const total = m.citedDomains.reduce((s, d) => s + d.count, 0);
  return {
    module: "Citations — cited domains",
    brand: m.workspace?.brand ?? "Not configured",
    window: windowLabel(m),
    summary: [
      {
        label: "Citations in the sample",
        value: fmtInt(total),
        note: "Citation links parsed from the latest sampled run of each tracked prompt.",
      },
      {
        label: "Unique domains",
        value: fmtInt(m.citedDomains.length),
        note: "Distinct domains appearing in those citations.",
      },
      {
        label: "Owned citations",
        value: total ? `${Math.round((owned / total) * 100)}%` : "not measured",
        note: total
          ? `Citations pointing at ${m.workspace?.domain || "the workspace domain"}; everything else counts as earned.`
          : "No citations parsed yet, so the owned share has no denominator.",
      },
    ],
    sections: [
      {
        title: "Cited domains",
        note: "Every domain the sampled answers drew on, ranked by citations.",
        columns: ["Domain", "Type", "Citations", "Share of sampled citations"],
        rows: m.citedDomains.map((d) => [d.domain, d.owned ? "Owned" : "Earned", String(d.count), `${d.share}%`]),
      },
    ],
    footnotes: [
      "Source: citation links parsed from stored answer payloads by the Answr sampling pipeline.",
      "Owned versus earned is the only source classification available: the live engine flags a citation by whether its domain belongs to the workspace, and keeps no editorial / community / reference taxonomy.",
      "No change-vs-previous column: the engine keeps no previous-window citation total, so a delta would have been fabricated.",
      "Full metric definitions: METRICS.md, or the ⓘ beside each figure in-app.",
    ],
  };
}

export default function CommandK() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const router = useRouter();
  const { range, platform } = useFilters();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("answr:cmdk", onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("answr:cmdk", onOpen);
    };
  }, []);

  /* Reload the real metrics every time the palette opens, so the export action
     states the citation count it would actually download rather than one cached
     from earlier in the session. */
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/live/metrics")
      .then((r) => r.json())
      .then((j: LiveMetrics & { ok?: boolean }) => {
        if (cancelled) return;
        if (!j?.ok) {
          setMetrics(null);
          setFailed(true);
          return;
        }
        setMetrics(j);
        setFailed(false);
      })
      .catch(() => {
        if (cancelled) return;
        setMetrics(null);
        setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  /* The export label carries the live count once it is known — and nothing at
     all until then, so the palette never advertises a number it hasn't read. */
  const exportLabel = useMemo(() => {
    if (metrics) {
      if (!metrics.configured) return "Export citations — set up your brand first";
      if (!metrics.hasData) return "Export citations — nothing sampled yet";
      const n = metrics.citedDomains.reduce((s, d) => s + d.count, 0);
      return n > 0 ? `Export citations (${fmtInt(n)})` : "Export citations — none parsed yet";
    }
    if (failed) return "Export citations — live data unavailable";
    return "Export citations";
  }, [failed, metrics]);

  const actions = useMemo(() => {
    const all = [
      { key: "export-citations", label: exportLabel, group: "Citations" },
      { key: "whats-new", label: "What's new", group: "Answr" },
    ];
    const query = q.trim().toLowerCase();
    return all.filter((a) => !query || a.label.toLowerCase().includes(query) || a.group.toLowerCase().includes(query));
  }, [exportLabel, q]);

  const query = q.trim().toLowerCase();
  const screens = useMemo(
    () => SCREENS.filter((s) => !query || s.label.toLowerCase().includes(query) || s.group.toLowerCase().includes(query)),
    [query],
  );

  const close = useCallback(() => setOpen(false), []);

  const exportCitations = useCallback(() => {
    if (!metrics) {
      toast(
        loading
          ? "Still loading the live citation data — try again in a moment."
          : "Couldn't reach the live metrics API, so there is nothing to export.",
      );
      return;
    }
    if (!metrics.configured) {
      toast("No workspace configured yet — set up your brand and the sampler will start collecting citations.");
      close();
      router.push("/onboarding/brand");
      return;
    }
    if (!metrics.hasData) {
      toast("Nothing sampled yet — the first run collects the citations to export.");
      return;
    }
    const spec = citedDomainsReport(metrics);
    const rows = spec.sections[0].rows.length;
    if (rows === 0) {
      toast("No citations have been parsed from the sampled answers yet, so there is nothing to export.");
      return;
    }
    const filename = `${stem(metrics)}.csv`;
    const csv = buildExecutiveCsv(withWindowNote(spec, range, platform));
    const url = URL.createObjectURL(csvBlob(csv));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast(
      `${filename} downloaded — ${rows} cited domain${rows === 1 ? "" : "s"} from ${windowLabel(metrics).toLowerCase()}.${windowToastSuffix(range, platform)}`,
    );
    close();
  }, [close, loading, metrics, platform, range, router]);

  if (!open) return null;

  const runAction = (key: string) => {
    if (key === "export-citations") return exportCitations();
    if (key === "whats-new") {
      close();
      window.dispatchEvent(new CustomEvent("answr:whatsnew"));
    }
  };

  const rowBtn: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    margin: "0 8px",
    padding: "8px",
    borderRadius: "6px",
    background: "transparent",
    border: "none",
    fontSize: "12.5px",
    color: "var(--mut)",
    fontFamily: "inherit",
    cursor: "pointer",
    textAlign: "left",
    width: "calc(100% - 16px)",
  };

  const label = (l: string, group: string, onClick: () => void) => (
    <button key={l} type="button" onClick={onClick} style={rowBtn}>
      <span>{l}</span>
      <span style={{ color: "var(--fnt)", fontSize: "11px" }}>{group}</span>
    </button>
  );

  const empty = screens.length === 0 && actions.length === 0;

  return (
    <>
      <div onClick={close} style={{ position: "fixed", inset: 0, background: "rgba(5,5,8,0.55)", zIndex: 90 }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        style={{ position: "fixed", left: "50%", top: "56px", transform: "translateX(-50%)", width: "440px", zIndex: 91 }}
      >
        <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "12px", boxShadow: "0 30px 80px rgba(0,0,0,.5)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "12px 16px", borderBottom: "1px solid var(--brd)" }}>
            <span style={{ color: "var(--fnt)" }}>{"⌕"}</span>
            <input
              aria-label="Search screens and actions"
              placeholder="Search screens and actions…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
              style={{ flex: 1, fontSize: "13px", color: "var(--tx)", background: "transparent", border: "none", fontFamily: "inherit", padding: 0 }}
            />
            <span style={{ marginLeft: "auto", fontSize: "10px", color: "var(--fnt)", border: "1px solid var(--brd)", borderRadius: "4px", padding: "1px 5px", flex: "none" }}>{"ESC"}</span>
          </div>

          <div style={{ maxHeight: "min(60vh, 420px)", overflowY: "auto", paddingBottom: "6px" }}>
            {screens.length > 0 && (
              <>
                <div style={{ padding: "8px 8px 4px", fontSize: "10.5px", fontWeight: 500, color: "var(--fnt)", paddingLeft: "16px" }}>{"SCREENS"}</div>
                {screens.map((s) => label(s.label, s.group, () => { close(); router.push(s.href); }))}
              </>
            )}
            {actions.length > 0 && (
              <>
                <div style={{ padding: "8px 8px 4px", fontSize: "10.5px", fontWeight: 500, color: "var(--fnt)", paddingLeft: "16px" }}>{"ACTIONS"}</div>
                {actions.map((a) => label(a.label, a.group, () => runAction(a.key)))}
              </>
            )}
            {empty && (
              <div style={{ padding: "22px 16px", fontSize: "12.5px", color: "var(--fnt)", textAlign: "center" }}>
                {`No screens or actions match “${q.trim()}”.`}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
