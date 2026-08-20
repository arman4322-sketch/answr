"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { sourceMix, CITATIONS_TOTAL } from "@/lib/data/evidence";
import { buildExecutiveCsv, csvBlob, wrapRows } from "@/lib/export/report";
import { withWindowNote, windowToastSuffix } from "@/lib/export/active-window";
import { useFilters } from "@/lib/filters/context";

/* ⌘K command palette — from canvas frame #m-surfaces. Opens on Cmd/Ctrl+K anywhere
   and on the window CustomEvent "answr:cmdk" (dispatched by the Sidebar search
   button); closes on Esc / backdrop click. Static command list from the frame.
   Audit fix: "Export citations (11.4k)" → "Export citations (1,284)" to match the
   Citations KPI. A "What's new" row is appended — it opens the WhatsNew panel via
   the "answr:whatsnew" CustomEvent.
   Every row executes (INTERACTIVITY_CONVENTIONS playbook 11): screen rows
   router.push their target, "Export citations" downloads a real CSV built from
   the citations fixture (lib/data/evidence.ts), and the palette closes after.
   Export pass: the download was still named "solara-…" from the pre-Nike
   workspace and shipped a bare table; it is now "nike-citations-source-mix-30d
   .csv" in the shared executive envelope (lib/export/report.ts). */
export default function CommandK() {
  const [open, setOpen] = useState(false);
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

  if (!open) return null;

  const close = () => setOpen(false);

  const exportCitations = () => {
    const rows: string[][] = [
      ["Source class", "Citations · 30d", "Share %"],
      ...sourceMix.map((s) => [s.label, String(s.count), String(s.pct)]),
      ["Total", String(CITATIONS_TOTAL), "100"],
    ];
    const filename = "nike-citations-source-mix-30d.csv";
    /* Same window honesty as every other export path: the header names the
       window the rows cover, and carries a "not applied" note when the
       workspace filter is somewhere else (lib/export/active-window.ts). */
    const csv = buildExecutiveCsv(
      withWindowNote(
        wrapRows(rows, {
          module: "Citations — source mix",
          brand: "Nike",
          window: "Last 30 days (vs previous 30 days)",
          sectionTitle: "Source mix",
        }),
        range,
        platform
      )
    );
    const url = URL.createObjectURL(csvBlob(csv));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast(
      `${filename} downloaded — 1,284 citations across 4 source classes.${windowToastSuffix(range, platform)}`
    );
    close();
  };

  const screenRow = (label: string, group: string, href: string, active: boolean) => (
    <button
      type="button"
      onClick={() => {
        close();
        router.push(href);
      }}
      style={{
        display: "flex",
        justifyContent: "space-between",
        margin: "0 8px",
        padding: "8px",
        borderRadius: "6px",
        background: active ? "rgba(255,255,255,0.05)" : "transparent",
        border: "none",
        fontSize: "12.5px",
        color: active ? "var(--tx)" : "var(--mut)",
        fontFamily: "inherit",
        cursor: "pointer",
        textAlign: "left",
        width: "calc(100% - 16px)",
      }}
    >
      <span>{label}</span>
      <span style={{ color: "var(--fnt)", fontSize: "11px" }}>{group}</span>
    </button>
  );

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
              defaultValue="citations"
              autoFocus
              style={{ flex: 1, fontSize: "13px", color: "var(--tx)", background: "transparent", border: "none", outline: "none", fontFamily: "inherit", padding: 0 }}
            />
            <span style={{ marginLeft: "auto", fontSize: "10px", color: "var(--fnt)", border: "1px solid var(--brd)", borderRadius: "4px", padding: "1px 5px", flex: "none" }}>{"ESC"}</span>
          </div>
          <div style={{ padding: "8px 8px 4px", fontSize: "10.5px", fontWeight: 500, color: "var(--fnt)", paddingLeft: "16px" }}>{"SCREENS"}</div>
          {screenRow("Citations", "Monitor", "/app/citations", true)}
          {screenRow("Watched URLs", "Citations", "/app/citations/watched", false)}
          <div style={{ padding: "8px 8px 4px", fontSize: "10.5px", fontWeight: 500, color: "var(--fnt)", paddingLeft: "16px" }}>{"ACTIONS"}</div>
          <button
            type="button"
            onClick={exportCitations}
            style={{
              display: "block",
              width: "calc(100% - 16px)",
              margin: "0 8px 4px",
              padding: "8px",
              borderRadius: "6px",
              fontSize: "12.5px",
              color: "var(--mut)",
              background: "transparent",
              border: "none",
              textAlign: "left",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            {"Export citations (1,284)"}
          </button>
          <button
            type="button"
            onClick={() => {
              close();
              window.dispatchEvent(new CustomEvent("answr:whatsnew"));
            }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "calc(100% - 16px)",
              margin: "0 8px 4px",
              padding: "8px",
              borderRadius: "6px",
              fontSize: "12.5px",
              color: "var(--mut)",
              background: "transparent",
              border: "none",
              textAlign: "left",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            <span>{"What's new"}</span>
            <span style={{ color: "var(--fnt)", fontSize: "11px" }}>{"Answr"}</span>
          </button>
          <div style={{ margin: "8px", borderTop: "1px solid var(--brd)", padding: "10px 8px 6px", fontSize: "11.5px", color: "var(--fnt)" }}>
            {"No results for \"citatons\"? Search is fuzzy — typos still match."}
          </div>
        </div>
      </div>
    </>
  );
}
