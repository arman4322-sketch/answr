"use client";

import { useState } from "react";
import Hint from "@/components/ui/Hint";
import RangeTrend from "../RangeTrend";
import NewSegmentModal from "./NewSegmentModal";
import { METRICS } from "@/lib/metrics";
import { useFilters } from "@/lib/filters/context";
import { levelStatForRange } from "@/lib/filters/windows";
import { audienceSegments, draftSegment, INTENT_COLORS, type AudienceSegment, type GeneratedPrompt } from "@/lib/data/audiences";
import { toast } from "@/lib/toast";

/* Audiences board — the segment-driven half of the Audiences page.

   The frame drew three static segment cards with one marked "Selected"; here
   every card is a real button and the selection DRIVES the page: headline
   visibility + delta, the trend series and its axis, the "Rank in segment"
   board and the highlighted comparison row all come from the selected
   segment's record in lib/data/audiences.ts. Card styling is the frame's,
   verbatim, with only the resets a <button> needs.

   The dashed "+ New segment" card opens NewSegmentModal; adding appends a real
   (pending-first-run) segment card to this list. */

const GOOD = "#4cb782";
const BAD = "#e5636e";
const SEL_BG = "rgba(142,124,242,0.06)";

const BADGE: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 600,
  color: "#b3a7f8",
  background: "rgba(142,124,242,0.16)",
  borderRadius: "4px",
  padding: "2px 6px",
};

function deltaText(d: number) {
  return `${d >= 0 ? "↑" : "↓"} ${Math.abs(d).toFixed(1)}`;
}

function sentimentColor(tone: AudienceSegment["sentimentTone"]) {
  return tone === "positive" ? GOOD : tone === "negative" ? BAD : "var(--mut)";
}

export default function AudiencesBoard() {
  const [segments, setSegments] = useState<AudienceSegment[]>(audienceSegments);
  const [selectedId, setSelectedId] = useState(audienceSegments[0].id);
  const [modalOpen, setModalOpen] = useState(false);
  const { range, window } = useFilters();

  const seg = segments.find((s) => s.id === selectedId) ?? segments[0];

  /* Every segment's headline, delta and comparison row read the active window
     off its own series, so the number beside the chart is always that chart's
     endpoint. Segments created in-session have no history at all, so they stay
     pending regardless of window. */
  function windowStat(s: AudienceSegment) {
    if (s.pending || !s.series.length) return { value: s.headline, delta: s.delta };
    /* same key <RangeTrend> uses for this segment, so the headline is always
       the endpoint of the line drawn beside it */
    return levelStatForRange(s.series, range, `insights:audience:${s.id}`);
  }
  const segStat = windowStat(seg);

  function addSegment(description: string, prompts: GeneratedPrompt[]) {
    const draft = draftSegment(description, prompts);
    const id = segments.some((s) => s.id === draft.id) ? `${draft.id}-${segments.length}` : draft.id;
    const next = { ...draft, id };
    setSegments((prev) => [...prev, next]);
    setSelectedId(id);
    setModalOpen(false);
    toast(`Segment "${next.name}" added with ${prompts.length} prompts — it reports after its first daily run.`);
  }

  return (
    <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:"16px"}}>
      {/* ── Segment cards (real buttons; selection drives the whole page) ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px"}}>
        {segments.map((s) => {
          const active = s.id === seg.id;
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedId(s.id)}
              style={{
                background: "var(--bg1)",
                border: active ? "1px solid var(--ac)" : "1px solid var(--brd)",
                borderRadius: "10px",
                padding: "14px 16px",
                ...(active ? { boxShadow: "0 0 0 1px rgba(142,124,242,0.2)" } : null),
                display: "block",
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"8px"}}>
                <span style={{fontSize:"13px",fontWeight:"600"}}>{s.name}</span>
                {active && <span style={BADGE}>{"Selected"}</span>}
                {!active && s.pending && <span style={{...BADGE,color:"var(--mut)",background:"rgba(255,255,255,0.05)"}}>{"New"}</span>}
              </div>
              <div style={{fontSize:"11.5px",color:"var(--fnt)",lineHeight:"1.5",marginTop:"5px"}}>{s.description}</div>
              <div style={{fontSize:"11px",color:"var(--mut)",marginTop:"9px",fontVariantNumeric:"tabular-nums"}}>{`${s.promptCount} prompts`}</div>
            </button>
          );
        })}
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setModalOpen(true)}
          style={{background:"var(--bg1)",border:"1px dashed var(--brd)",borderRadius:"10px",padding:"14px 16px",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:"6px",textAlign:"center",cursor:"pointer",fontFamily:"inherit"}}
        >
          <div style={{fontSize:"13px",fontWeight:"500",color:"var(--mut)"}}>{"+ New segment"}</div>
          <div style={{fontSize:"11.5px",color:"var(--fnt)",lineHeight:"1.5"}}>{"Describe an audience — Answr generates its prompt set"}</div>
        </button>
      </div>

      {/* ── Visibility chart + rank board ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 372px",gap:"14px"}}>
        <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"17px 19px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>
            <div>
              <div style={{fontSize:"13.5px",fontWeight:"600",display:"flex",alignItems:"center",gap:"6px"}}>
                {`Visibility — ${seg.name}`}
                <Hint text={METRICS.audience_visibility.plain} size={12} />
              </div>
              <div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"3px"}}>{"how often Nike appears in this segment's answers"}</div>
            </div>
            <div style={{display:"flex",alignItems:"baseline",gap:"8px"}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
                <span style={{fontSize:"24px",fontWeight:"600",fontVariantNumeric:"tabular-nums",letterSpacing:"-0.01em"}}>
                  {seg.pending ? "—" : `${segStat.value.toFixed(1)}%`}
                </span>
                <Hint text={METRICS.audience_visibility.plain} align="right" />
              </span>
              {seg.pending ? (
                <span style={{fontSize:"12px",fontWeight:"500",color:"var(--mut)"}}>{"awaiting first run"}</span>
              ) : (
                <span style={{fontSize:"12px",fontWeight:"500",color:segStat.delta >= 0 ? GOOD : BAD}}>{deltaText(segStat.delta)}</span>
              )}
            </div>
          </div>

          {seg.pending ? (
            <div style={{marginTop:"14px",border:"1px dashed var(--brd)",borderRadius:"9px",padding:"14px 16px"}}>
              <div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.6"}}>
                {"No run history yet — this segment's prompt set is queued and reports its first visibility number after tonight's run. Its generated prompts:"}
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginTop:"11px"}}>
                {(seg.prompts ?? []).map((p) => {
                  const c = INTENT_COLORS[p.intent] ?? INTENT_COLORS.Support;
                  return (
                    <span key={p.text} style={{display:"inline-flex",alignItems:"center",gap:"7px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"7px",padding:"6px 9px",fontSize:"11.5px",color:"var(--mut)"}}>
                      {`"${p.text}"`}
                      <span style={{fontSize:"9.5px",fontWeight:600,color:c.fg,background:c.bg,borderRadius:"4px",padding:"1px 5px"}}>{p.intent}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <RangeTrend
                key={seg.id}
                series={seg.series}
                seed={`insights:audience:${seg.id}`}
                yLabels={seg.yLabels}
                yDomain={seg.yDomain}
                width={700}
                height={180}
              />
            </>
          )}
        </div>

        <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"17px 19px"}}>
          <div style={{fontSize:"13.5px",fontWeight:"600",display:"flex",alignItems:"center",gap:"6px"}}>
            {"Rank in segment"}
            <Hint text="Where you place against rivals in this segment" size={12} />
          </div>
          {seg.pending ? (
            <div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.6",marginTop:"10px"}}>
              {"Ranking appears once the segment has been run against every enabled platform."}
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",marginTop:"8px"}}>
              {seg.ranks.map((r, i) => (
                <div
                  key={r.brand}
                  style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 0",fontSize:"13px",...(i < seg.ranks.length - 1 ? { borderBottom: "1px solid var(--brd)" } : null)}}
                >
                  <span style={{color:"var(--fnt)",fontVariantNumeric:"tabular-nums",width:"16px"}}>{String(i + 1)}</span>
                  <span style={r.you ? {fontWeight:"600"} : undefined}>{r.brand}</span>
                  {r.you && <span style={BADGE}>{"You"}</span>}
                  <span style={{marginLeft:"auto",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{`${(r.you ? segStat.value : r.value).toFixed(1)}%`}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{marginTop:"14px",paddingTop:"12px",borderTop:"1px solid var(--brd)",fontSize:"12px",color:"var(--mut)",lineHeight:"1.55"}}>
            {"Segments are generated from your audience definitions and rerun daily like any prompt set."}
          </div>
        </div>
      </div>

      {/* ── Segment comparison (rows select too) ── */}
      {/* the frame's card had overflow:hidden purely to round the last row's
          background; that clipped the header Hint tooltips, so the radius moved
          onto the last row instead */}
      <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px"}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",padding:"15px 19px 11px"}}>
          <span style={{fontSize:"13.5px",fontWeight:"600",display:"inline-flex",alignItems:"center",gap:"6px"}}>
            {"Segment comparison"}
            <Hint text="Every segment's scores side by side" size={12} />
          </span>
          <span style={{fontSize:"10.5px",color:"var(--fnt)"}}>{"ⓘ sentiment = 0–100 favorability score"}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 1fr 1fr .8fr",padding:"7px 19px",fontSize:"11px",fontWeight:"500",color:"var(--fnt)",borderBottom:"1px solid var(--brd)"}}>
          <span>{"Segment"}</span>
          <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Visibility"}<Hint text={METRICS.visibility_score.plain} size={12} /></span>
          <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Share of voice"}<Hint text={METRICS.share_of_voice.plain} size={12} /></span>
          <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{"Sentiment"}<Hint text={METRICS.sentiment_mix.plain} size={12} /></span>
          <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}>{`Δ ${window.short}`}<Hint text="Change since the start of the window" size={12} /></span>
        </div>
        {segments.map((s, i) => {
          const active = s.id === seg.id;
          const stat = windowStat(s);
          return (
            <button
              key={s.id}
              type="button"
              className="row-hover"
              aria-pressed={active}
              onClick={() => setSelectedId(s.id)}
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr 1fr 1fr .8fr",
                alignItems: "center",
                padding: "10px 19px",
                fontSize: "13px",
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                /* left undefined when unselected so .row-hover's hover background
                   still wins (an inline background would beat the class) */
                ...(active ? { background: SEL_BG } : null),
                ...(i > 0 ? { borderTop: "1px solid var(--brd)" } : null),
                ...(i === segments.length - 1 ? { borderBottomLeftRadius: "9px", borderBottomRightRadius: "9px" } : null),
              }}
            >
              <span style={{fontWeight:"500"}}>{s.name}</span>
              <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{s.pending ? "—" : `${stat.value.toFixed(1)}%`}</span>
              <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{s.pending ? "—" : `${s.shareOfVoice.toFixed(1)}%`}</span>
              <span style={{color:s.pending ? "var(--mut)" : sentimentColor(s.sentimentTone),fontWeight:"500"}}>{s.pending ? "—" : s.sentimentLabel}</span>
              <span style={{fontSize:"12px",fontWeight:"500",color:s.pending ? "var(--mut)" : stat.delta >= 0 ? GOOD : BAD}}>
                {s.pending ? "pending" : deltaText(stat.delta)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Weakest-segment callout (workspace-level, not per selection) ── */}
      <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"14px 19px",display:"flex",gap:"10px",alignItems:"flex-start"}}>
        <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"var(--ac)",marginTop:"6px",flex:"none"}} />
        <div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:"1.6"}}>
          <span style={{color:"var(--tx)",fontWeight:"500"}}>{"Weakest segment:"}</span>
          {" Casual and lifestyle answers rarely cite the wide-fit and sizing-guide pages — the two things that segment asks about most."}
        </div>
      </div>

      <NewSegmentModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={addSegment} />
    </div>
  );
}
