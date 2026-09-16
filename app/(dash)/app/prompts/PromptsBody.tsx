"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "@/lib/toast";
import Hint from "@/components/ui/Hint";
import { METRICS } from "@/lib/metrics";
import { downloadPromptCsv } from "./Controls";
import PromptDetail from "./PromptDetail";
import { fmtDate, historyLabel, rankLabel, slugify, statusLabel, type PromptsScreen, type ScreenPromptRow } from "./rows";

/* Prompts body — table + bulk bar + detail panel, now reading live rows.

   The columns are the ones the live pipeline can actually fill. Intent and
   Volume are gone: nothing in the sampling pipeline classifies a prompt's
   intent or measures monthly demand, so those two columns could only ever have
   been fixture values. What replaced them is real per-prompt output: whether
   the latest answers named the brand, how early they named it, how many engines
   answered, and when the prompt last ran.

   Search, bulk-select and pagination all run against the live rows. Selection
   is keyed by prompt text so it survives filtering and paging. */

const PAGE_SIZE = 25;

const STATUS_STYLE = {
  Mentioned: { color: "#4cb782", border: "1px solid rgba(76,183,130,.35)" },
  "Not mentioned": { color: "#e5636e", border: "1px solid rgba(229,99,110,.35)" },
  "Awaiting run": { color: "var(--fnt)", border: "1px dashed var(--brd)" },
} as const;

const GRID = "2.4fr .9fr .7fr .8fr .7fr";
const HEAD = { display: "inline-flex", alignItems: "center", gap: "6px" } as const;

function Checkbox({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      style={
        checked
          ? {width:"14px",height:"14px",flex:"none",borderRadius:"4px",background:"var(--ac)",border:"none",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"9px",fontWeight:700,padding:0,cursor:"pointer",fontFamily:"inherit"}
          : {width:"14px",height:"14px",flex:"none",borderRadius:"4px",background:"transparent",border:"1px solid var(--brd)",display:"inline-block",padding:0,cursor:"pointer",fontFamily:"inherit"}
      }
    >
      {checked ? "✓" : ""}
    </button>
  );
}

/* One centred panel used by both honest empty states. */
function EmptyState({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div style={{flex:"1",display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 20px"}}>
      <div style={{maxWidth:"440px",textAlign:"center"}}>
        <div style={{fontSize:"15px",fontWeight:600}}>{title}</div>
        <div style={{fontSize:"12.5px",lineHeight:"1.6",color:"var(--mut)",marginTop:"8px"}}>{body}</div>
        {children && <div style={{display:"flex",gap:"8px",justifyContent:"center",marginTop:"16px"}}>{children}</div>}
      </div>
    </div>
  );
}

function pageNumbers(total: number, current: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  if (from > 2) out.push("…");
  for (let i = from; i <= to; i++) out.push(i);
  if (to < total - 1) out.push("…");
  out.push(total);
  return out;
}

export default function PromptsBody({ data }: { data: PromptsScreen }) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [active, setActive] = useState<string | null>(data.rows[0]?.prompt ?? null);
  const [page, setPage] = useState(1);

  const query = (useSearchParams().get("q") ?? "").trim().toLowerCase();
  const visible = useMemo(
    () => data.rows.filter((r) => !query || r.prompt.toLowerCase().includes(query)),
    [data.rows, query],
  );

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const pageRows = visible.slice(start, start + PAGE_SIZE);

  const count = selected.size;
  const allVisibleSelected = visible.length > 0 && visible.every((r) => selected.has(r.prompt));
  const activeRow: ScreenPromptRow | null = active ? (data.rows.find((r) => r.prompt === active) ?? null) : null;

  function toggleRow(prompt: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(prompt)) next.delete(prompt);
      else next.add(prompt);
      return next;
    });
  }
  function toggleAllVisible() {
    setSelected((s) => {
      const next = new Set(s);
      if (allVisibleSelected) visible.forEach((r) => next.delete(r.prompt));
      else visible.forEach((r) => next.add(r.prompt));
      return next;
    });
  }
  function toggleAny() {
    setSelected((s) => (s.size > 0 ? new Set() : new Set(visible.map((r) => r.prompt))));
  }

  function exportSelection() {
    if (count === 0) {
      toast("Select prompts first — nothing to export.");
      return;
    }
    downloadPromptCsv(
      data,
      data.rows.filter((r) => selected.has(r.prompt)),
      { filename: `${slugify(data.brand)}-prompts-selection.csv`, sectionTitle: "Selected prompts" },
    );
  }

  /* ── state 1: no workspace ─────────────────────────────────────────────── */
  if (!data.configured) {
    return (
      <div style={{flex:"1",display:"flex",minHeight:"0"}}>
        <EmptyState
          title="Set up your brand to start collecting data"
          body="Prompts are the questions Answr asks the AI engines on your behalf. Name the brand, its domain and its competitors, and the tracked prompt set is generated for you — the first sample runs on the next scheduled run."
        >
          <Link href="/onboarding/brand" className="btn-ac" style={{display:"inline-block",fontSize:"12.5px",fontWeight:600,borderRadius:"7px",padding:"8px 16px",textDecoration:"none"}}>{"Set up brand"}</Link>
          <Link href="/app/settings" style={{display:"inline-block",fontSize:"12.5px",fontWeight:500,color:"var(--tx)",border:"1px solid var(--brd)",borderRadius:"7px",padding:"8px 16px",textDecoration:"none"}}>{"Open settings"}</Link>
        </EmptyState>
      </div>
    );
  }

  /* ── state 2: workspace, but no prompts tracked at all ─────────────────── */
  if (data.rows.length === 0) {
    return (
      <div style={{flex:"1",display:"flex",minHeight:"0"}}>
        <EmptyState
          title="No prompts tracked yet"
          body={`${data.brand} has no tracked prompts, so there is nothing for the sampler to run. Add the questions you want asked with “+ Add prompts” above — they go into the next scheduled sample.`}
        >
          <Link href="/app/settings" style={{display:"inline-block",fontSize:"12.5px",fontWeight:500,color:"var(--tx)",border:"1px solid var(--brd)",borderRadius:"7px",padding:"8px 16px",textDecoration:"none"}}>{"Open settings"}</Link>
        </EmptyState>
      </div>
    );
  }

  const unsampled = data.rows.filter((r) => !r.sampled).length;

  return (
    <div style={{flex:"1",display:"flex",minHeight:"0"}}>
      <div style={{flex:"1",minWidth:"0",borderRight:"1px solid var(--brd)"}}>
        {/* ── state 3: configured, nothing sampled yet — zeros, never fake data ── */}
        {!data.hasData && (
          <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 20px",borderBottom:"1px solid var(--brd)",background:"color-mix(in oklab,var(--ac) 8%,var(--bg1))",fontSize:"12px",lineHeight:1.5}}>
            <span style={{color:"var(--ac)",fontWeight:700}}>◆</span>
            <span style={{color:"var(--mut)"}}>
              {`Collecting — first sample runs tonight. ${data.rows.length} prompt${data.rows.length === 1 ? "" : "s"} tracked, 0 answers sampled so far.`}
            </span>
          </div>
        )}
        {data.hasData && unsampled > 0 && (
          <div style={{padding:"9px 20px",borderBottom:"1px solid var(--brd)",fontSize:"11.5px",color:"var(--fnt)",lineHeight:1.5}}>
            {`${unsampled} prompt${unsampled === 1 ? "" : "s"} added since the last run — they show “—” until the next sample.`}
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:GRID,padding:"10px 20px",fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",letterSpacing:".12em",textTransform:"uppercase",color:"var(--fnt)",borderBottom:"1px solid var(--brd)"}}>
          <span style={{display:"flex",alignItems:"center",gap:"8px"}}><Checkbox checked={allVisibleSelected} onToggle={toggleAllVisible} label="Select all prompts" />{"Prompt"}</span>
          <span style={HEAD}>{"Mentioned"}<Hint text={METRICS.visibility_score.plain} size={11} /></span>
          <span style={HEAD}>{"Rank"}<Hint text={METRICS.avg_answer_position.plain} size={11} /></span>
          <span style={HEAD}>{"Engines"}<Hint text="How many AI engines answered this prompt in its latest run" size={11} /></span>
          <span style={HEAD}>{"Last run"}<Hint text="When this prompt was last sampled" align="right" size={11} /></span>
        </div>

        {visible.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--mut)", fontSize: "13px" }}>
            {`No prompts match “${query}”. Clear the search to see all ${data.rows.length} tracked.`}
          </div>
        )}

        {pageRows.map((r, i) => {
          const status = statusLabel(r);
          const isActive = r.prompt === active;
          return (
            <div
              key={r.prompt}
              className="row-hover"
              onClick={() => setActive(r.prompt)}
              style={{display:"grid",gridTemplateColumns:GRID,alignItems:"center",padding:"13px 20px",fontSize:"13px",cursor:"pointer",...(isActive ? {background:"color-mix(in oklab,var(--ac) 6%,transparent)",borderLeft:"2px solid var(--ac)"} : { borderTop: i === 0 && !isActive ? "none" : "1px solid var(--brd)" })}}
            >
              <span style={{display:"flex",alignItems:"center",gap:"8px",...(isActive ? {fontWeight:"500"} : {color:"var(--mut)"})}}>
                <Checkbox checked={selected.has(r.prompt)} onToggle={() => toggleRow(r.prompt)} label={`Select "${r.prompt}"`} />
                <span style={{lineHeight:"1.4"}}>{r.prompt}</span>
              </span>
              <span><span style={{fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:STATUS_STYLE[status].color,border:STATUS_STYLE[status].border,borderRadius:"4px",padding:"2px 6px"}}>{status.toUpperCase()}</span></span>
              <span style={{fontSize:"12.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums"}}>{rankLabel(r)}</span>
              <span style={{fontSize:"12.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{r.sampled ? r.providersAnswered : "—"}</span>
              <span style={{fontSize:"12.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)"}}>{fmtDate(r.ts)}</span>
            </div>
          );
        })}

        <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderTop:"1px solid var(--brd)",fontSize:"12px",background:"var(--bg1)"}}>
          <Checkbox checked={count > 0} onToggle={toggleAny} label="Toggle selection" />
          <span style={{color:"var(--mut)",fontVariantNumeric:"tabular-nums"}}>{`${count} selected`}</span>
          <button type="button" onClick={() => toast("Topics aren’t part of the live workspace yet — prompts carry no topic field.")} style={{marginLeft:"8px",border:"1px solid var(--brd)",borderRadius:"6px",padding:"4px 10px",fontWeight:500,background:"transparent",color:"var(--tx)",fontSize:"12px",fontFamily:"inherit",cursor:"pointer"}}>{"Assign topic"}</button>
          <button type="button" onClick={() => toast("Tags aren’t part of the live workspace yet — prompts carry no tag field.")} style={{border:"1px solid var(--brd)",borderRadius:"6px",padding:"4px 10px",fontWeight:500,background:"transparent",color:"var(--tx)",fontSize:"12px",fontFamily:"inherit",cursor:"pointer"}}>{"Assign tag"}</button>
          <button type="button" onClick={() => toast("Archiving isn’t wired up yet — remove prompts in Settings › Brand.")} style={{color:"var(--mut)",border:"1px solid var(--brd)",borderRadius:"6px",padding:"4px 10px",background:"transparent",fontSize:"12px",fontWeight:400,fontFamily:"inherit",cursor:"pointer"}}>{"Archive"}</button>
          <button type="button" onClick={exportSelection} style={{marginLeft:"auto",color:"var(--ac)",fontWeight:500,background:"none",border:"none",padding:0,fontSize:"12px",fontFamily:"inherit",cursor:"pointer"}}>{"Export selection"}</button>
        </div>

        <div style={{padding:"14px 20px",borderTop:"1px solid var(--brd)",fontSize:"11.5px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)",display:"flex",justifyContent:"space-between",gap:"12px"}}>
          <span>
            {visible.length === 0
              ? `0 of ${data.rows.length} tracked`
              : `Showing ${start + 1}–${start + pageRows.length} of ${visible.length}${query ? ` matching “${query}”` : ""} · ${data.rows.length} tracked · ${historyLabel(data.days)}`}
          </span>
          {totalPages > 1 && (
            <span style={{display:"inline-flex",gap:"6px",alignItems:"center"}}>
              <button type="button" aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)} style={{background:"none",border:"none",padding:0,color:current === 1 ? "var(--fnt)" : "var(--tx)",fontSize:"11.5px",fontFamily:"inherit",cursor:current === 1 ? "default" : "pointer"}}>{"‹"}</button>
              {pageNumbers(totalPages, current).map((p, i) =>
                p === "…" ? (
                  <span key={`gap-${i}`}>{"…"}</span>
                ) : (
                  <button key={p} type="button" aria-current={p === current} onClick={() => setPage(p)} style={{background:"none",border:"none",padding:0,color:p === current ? "var(--tx)" : "inherit",fontWeight:p === current ? 600 : 400,fontSize:"11.5px",fontFamily:"inherit",cursor:"pointer"}}>{p}</button>
                ),
              )}
              <button type="button" aria-label="Next page" disabled={current === totalPages} onClick={() => setPage(current + 1)} style={{background:"none",border:"none",padding:0,color:current === totalPages ? "var(--fnt)" : "var(--tx)",fontSize:"11.5px",fontFamily:"inherit",cursor:current === totalPages ? "default" : "pointer"}}>{"›"}</button>
            </span>
          )}
        </div>
      </div>
      {activeRow && <PromptDetail row={activeRow} screen={data} onClose={() => setActive(null)} />}
    </div>
  );
}
