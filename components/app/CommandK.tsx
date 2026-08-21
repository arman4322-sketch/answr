"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { sourceMix, CITATIONS_TOTAL } from "@/lib/data/evidence";
import { buildExecutiveCsv, csvBlob, wrapRows } from "@/lib/export/report";
import { withWindowNote, windowToastSuffix } from "@/lib/export/active-window";
import { useFilters } from "@/lib/filters/context";

/* ⌘K command palette — from canvas frame #m-surfaces. Opens on Cmd/Ctrl+K anywhere
   and on the window CustomEvent "answr:cmdk" (dispatched by the Sidebar search
   button); closes on Esc / backdrop click.

   Sale-readiness pass: the search box is now real. It filters a full index of
   dashboard screens (case-insensitive, matches label or group) plus the palette
   actions, with a genuine empty state — replacing the previously inert input and
   the false "fuzzy — typos still match" footer. */

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

const ACTIONS = [
  { key: "export-citations", label: "Export citations (1,284)", group: "Citations" },
  { key: "whats-new", label: "What's new", group: "Answr" },
];

export default function CommandK() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
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

  const query = q.trim().toLowerCase();
  const screens = useMemo(
    () => SCREENS.filter((s) => !query || s.label.toLowerCase().includes(query) || s.group.toLowerCase().includes(query)),
    [query],
  );
  const actions = useMemo(
    () => ACTIONS.filter((a) => !query || a.label.toLowerCase().includes(query) || a.group.toLowerCase().includes(query)),
    [query],
  );

  if (!open) return null;

  const close = () => setOpen(false);

  const exportCitations = () => {
    const rows: string[][] = [
      ["Source class", "Citations · 30d", "Share %"],
      ...sourceMix.map((s) => [s.label, String(s.count), String(s.pct)]),
      ["Total", String(CITATIONS_TOTAL), "100"],
    ];
    const filename = "nike-citations-source-mix-30d.csv";
    const csv = buildExecutiveCsv(
      withWindowNote(
        wrapRows(rows, {
          module: "Citations — source mix",
          brand: "Nike",
          window: "Last 30 days (vs previous 30 days)",
          sectionTitle: "Source mix",
        }),
        range,
        platform,
      ),
    );
    const url = URL.createObjectURL(csvBlob(csv));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast(`${filename} downloaded — 1,284 citations across 4 source classes.${windowToastSuffix(range, platform)}`);
    close();
  };

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
