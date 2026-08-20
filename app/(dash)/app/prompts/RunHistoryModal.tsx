"use client";

import { useEffect } from "react";
import { toast } from "@/lib/toast";
import { buildExecutiveCsv, csvBlob } from "@/lib/export/report";
import { PLATFORM_ANSWERS, SELECTED_PROMPT, runStats, type PlatformAnswer, type PlatformId } from "@/lib/data/prompts";

/* "View all runs" → the prompt's run history (playbook: a real designed view
   instead of a toast). Shows the last 14 daily runs of THIS prompt on the
   selected platform — date, platform, mentioned, position, sentiment — plus a
   14-run strip whose bar height is the answer position (taller = named earlier,
   flat stub = not mentioned at all).

   Numbers stay honest: the 14-run rate is printed next to the 30-day headline
   rather than pretending they are the same window, and the platform selector
   here drives the panel's tab behind the sheet, so the two never disagree.
   Export writes the same executive CSV envelope every other export uses. */

const OVERLAY = { position: "fixed", inset: "0", zIndex: 50, background: "rgba(5,5,8,0.55)", display: "flex", alignItems: "center", justifyContent: "center" } as const;

function barHeight(position: string, mentioned: boolean): number {
  if (!mentioned) return 3;
  const p = Number(position);
  return p <= 1 ? 34 : p <= 2 ? 23 : 14;
}

export default function RunHistoryModal({
  platform,
  onPlatformChange,
  onClose,
}: {
  platform: PlatformAnswer;
  onPlatformChange: (id: PlatformId) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const stats = runStats(platform);
  const oldestFirst = [...platform.runs].reverse();

  function exportRuns() {
    const filename = `nike-prompt-runs-${platform.id}-14d.csv`;
    const csv = buildExecutiveCsv({
      module: "Prompt run history",
      brand: "Nike",
      window: `Last 14 daily runs (${platform.runs[platform.runs.length - 1].date} – ${platform.runs[0].date}, 2026)`,
      summary: [
        { label: "Prompt", value: SELECTED_PROMPT.text, note: `${SELECTED_PROMPT.intent} intent · ${SELECTED_PROMPT.volume.toLowerCase()}` },
        { label: "Platform", value: platform.label, note: `${Math.round(platform.weight * 100)}% of tracked-prompt volume` },
        { label: "Mention rate · 30d", value: platform.mentionRate, delta: platform.mentionDelta, note: "Share of daily runs where the answer named Nike." },
        { label: "Mention rate · last 14 runs", value: stats.rate, note: `${stats.hits} of ${stats.total} runs mentioned Nike.` },
        { label: "Avg. position in answer", value: stats.avgPosition, note: "Rank of Nike's first mention, averaged over runs that mentioned it." },
        { label: "Competitors mentioned", value: platform.competitors },
      ],
      sections: [
        {
          title: "Daily runs",
          note: "One row per daily run, newest first. Position is blank when the answer did not name Nike.",
          columns: ["Date", "Platform", "Mentioned", "Position", "Sentiment"],
          rows: platform.runs.map((r) => [r.date, platform.label, r.mentioned ? "yes" : "no", r.position, r.sentiment]),
        },
        {
          title: "Platform comparison · 30 days",
          note: "The prompt's 78% headline is the volume-weighted average of these platform rates.",
          columns: ["Platform", "Share of prompt volume", "Mention rate 30d", "Change", "Avg. position", "Sentiment", "Competitors mentioned"],
          rows: PLATFORM_ANSWERS.map((p) => [p.label, `${Math.round(p.weight * 100)}%`, p.mentionRate, p.mentionDelta, p.avgPosition, p.sentiment, p.competitors]),
        },
      ],
      footnotes: [
        "Runs are the workspace's scheduled daily sample — one execution of this prompt per platform per day.",
        "Metric definitions: METRICS.md, or the ? beside each figure in-app.",
      ],
    });
    const url = URL.createObjectURL(csvBlob(csv));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast(`${filename} downloaded — ${platform.runs.length} runs across ${platform.label}.`);
  }

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Run history for ${SELECTED_PROMPT.text}`}
        onClick={(e) => e.stopPropagation()}
        style={{width:"640px",maxHeight:"88vh",overflowY:"auto",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px",padding:"22px",boxShadow:"0 30px 80px rgba(0,0,0,.5)"}}
      >
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"12px"}}>
          <div>
            <div style={{fontSize:"15px",fontWeight:"600"}}>{"Run history"}</div>
            <div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"4px",lineHeight:"1.5"}}>{`“${SELECTED_PROMPT.text}” · last 14 daily runs · ${platform.label}`}</div>
          </div>
          <button type="button" aria-label="Close" autoFocus onClick={onClose} style={{color:"var(--fnt)",background:"none",border:"none",padding:0,cursor:"pointer",fontSize:"14px",fontFamily:"inherit",lineHeight:1}}>{"✕"}</button>
        </div>

        <div style={{display:"flex",gap:"2px",marginTop:"14px",borderBottom:"1px solid var(--brd)",fontSize:"12.5px"}}>
          {PLATFORM_ANSWERS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={p.id === platform.id}
              onClick={() => onPlatformChange(p.id)}
              style={{padding:"7px 12px",background:"none",border:"none",fontSize:"12.5px",fontFamily:"inherit",cursor:"pointer",...(p.id === platform.id ? {color:"var(--tx)",fontWeight:500,borderBottom:"2px solid var(--ac)"} : {color:"var(--mut)"})}}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginTop:"14px"}}>
          {[
            { label: "Mentioned", value: `${stats.hits} of ${stats.total}`, sub: `${stats.rate} of these runs` },
            { label: "Mention rate · 30d", value: platform.mentionRate, sub: `${platform.mentionDelta} vs prev. 30d`, subColor: platform.mentionDeltaColor },
            { label: "Avg. position", value: stats.avgPosition, sub: "when mentioned" },
            { label: "Sentiment", value: platform.sentiment, sub: "majority of runs", valueColor: platform.sentimentColor },
          ].map((s) => (
            <div key={s.label} style={{border:"1px solid var(--brd)",borderRadius:"8px",background:"var(--bg0)",padding:"10px 12px"}}>
              <div style={{fontSize:"10px",fontWeight:"500",letterSpacing:".08em",textTransform:"uppercase",color:"var(--fnt)"}}>{s.label}</div>
              <div style={{fontSize:"15px",fontWeight:"600",fontVariantNumeric:"tabular-nums",marginTop:"5px",color:s.valueColor ?? "var(--tx)"}}>{s.value}</div>
              <div style={{fontSize:"10.5px",fontVariantNumeric:"tabular-nums",color:s.subColor ?? "var(--fnt)",marginTop:"2px"}}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{border:"1px solid var(--brd)",borderRadius:"8px",background:"var(--bg0)",padding:"12px 14px",marginTop:"12px"}}>
          <div style={{display:"flex",alignItems:"flex-end",gap:"5px",height:"40px"}}>
            {oldestFirst.map((r) => (
              <div key={r.date} title={r.mentioned ? `${r.date} · position ${r.position} · ${r.sentiment}` : `${r.date} · not mentioned`} style={{flex:"1",height:`${barHeight(r.position, r.mentioned)}px`,borderRadius:"3px",background:r.mentioned ? "var(--ac)" : "var(--brd)",opacity:r.mentioned ? (Number(r.position) <= 1 ? 1 : Number(r.position) <= 2 ? 0.72 : 0.5) : 1}} />
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:"7px",fontSize:"10px",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>
            <span>{oldestFirst[0].date}</span>
            <span>{"Taller = named earlier in the answer · flat = not mentioned"}</span>
            <span>{oldestFirst[oldestFirst.length - 1].date}</span>
          </div>
        </div>

        <div style={{border:"1px solid var(--brd)",borderRadius:"8px",overflow:"hidden",marginTop:"12px"}}>
          <div style={{display:"grid",gridTemplateColumns:".7fr .9fr .8fr .7fr .9fr",padding:"7px 12px",fontSize:"10px",fontWeight:"500",letterSpacing:".08em",color:"var(--fnt)",background:"var(--bg2)"}}>
            <span>{"DATE"}</span><span>{"PLATFORM"}</span><span>{"MENTIONED"}</span><span>{"POSITION"}</span><span>{"SENTIMENT"}</span>
          </div>
          {platform.runs.map((r, i) => (
            <div key={r.date} style={{display:"grid",gridTemplateColumns:".7fr .9fr .8fr .7fr .9fr",padding:"8px 12px",fontSize:"11.5px",alignItems:"center",fontVariantNumeric:"tabular-nums",...(i === 0 ? {} : {borderTop:"1px solid var(--brd)"})}}>
              <span style={{color:"var(--mut)"}}>{r.date}</span>
              <span style={{color:"var(--mut)"}}>{platform.label}</span>
              <span style={{color:r.mentioned ? "#4cb782" : "#e5636e"}}>{r.mentioned ? "✓ yes" : "✗ no"}</span>
              <span>{r.position}</span>
              <span style={{color:r.sentiment === "Positive" ? "var(--ac)" : "var(--mut)"}}>{r.sentiment}</span>
            </div>
          ))}
        </div>

        <div style={{marginTop:"12px",fontSize:"11px",lineHeight:"1.55",color:"var(--fnt)"}}>
          {`The prompt's 78% headline is the volume-weighted average across all four engines — ${PLATFORM_ANSWERS.map((p) => `${p.label} ${p.mentionRate}`).join(", ")}.`}
        </div>

        <div style={{display:"flex",gap:"8px",marginTop:"16px"}}>
          <button type="button" className="btn-ac" onClick={exportRuns} style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:500,borderRadius:"7px",padding:"9px 0",border:"none",cursor:"pointer",fontFamily:"inherit"}}>{"Export runs"}</button>
          <button type="button" onClick={onClose} style={{flex:"1",textAlign:"center",fontSize:"12.5px",fontWeight:500,color:"var(--tx)",background:"transparent",border:"1px solid var(--brd)",borderRadius:"7px",padding:"9px 0",cursor:"pointer",fontFamily:"inherit"}}>{"Close"}</button>
        </div>
      </div>
    </div>
  );
}
