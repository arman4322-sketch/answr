"use client";

import { useEffect, useMemo, useState } from "react";
import FilterPill from "@/components/ui/FilterPill";
import Hint from "@/components/ui/Hint";
import { toast } from "@/lib/toast";
import {
  CONVERSATIONS,
  mentionLabel,
  transcriptText,
  type Conversation,
  type Seg,
} from "@/lib/data/conversations";

/* Conversation Explorer — client shell.

   Activated (F1 playbook): every list row is a real button that loads its
   transcript into the reading pane; the search box filters the list; the
   Mentions pill is the shared FilterPill; "Copy link" copies a working deep
   link (?c=<id>) which the page reads back on load; citation markers and the
   SOURCES footer are real links to the researched pages.

   Pixel fidelity: the frame's inline styles are kept verbatim. Buttons only
   add the resets they need (border/background/appearance/font + a left
   text-align) and cursor:pointer. The reading pane gained an inner scroll
   region because transcripts now run to six turns; spacing is unchanged
   because the wrapper inherits the same 18px column gap. */

const DEMO_NOTE = "This filter needs a live workspace — the demo ships one fixture set for this list.";

const MENTION_ITEMS = [
  "Mentions: Nike",
  "Mentions: any tracked brand",
  "Mentions: Adidas",
  "Mentions: Asics",
  "No brand mentioned",
];

/* ---------------------------------------------------------------- segments */

function CiteMark({ refs, sources }: { refs: number[]; sources: Conversation["sources"] }) {
  return (
    <span style={{fontSize:"10px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>
      {refs.map((n) => {
        const src = sources.find((s) => s.n === n);
        if (!src) return <span key={n}>{`[${n}]`}</span>;
        return (
          <a
            key={n}
            className="cite-link"
            href={src.url}
            target="_blank"
            rel="noreferrer noopener"
            title={src.title}
            style={{color:"inherit",textDecoration:"none",cursor:"pointer"}}
          >
            {`[${n}]`}
          </a>
        );
      })}
    </span>
  );
}

function Segments({ segs, sources }: { segs: Seg[]; sources: Conversation["sources"] }) {
  return (
    <>
      {segs.map((s, i) => {
        if (s.t === "br") return <br key={i} />;
        if (s.t === "cite") return <CiteMark key={i} refs={s.refs} sources={sources} />;
        if (s.t === "lead") return <span key={i} style={{color:"var(--tx)"}}>{s.v}</span>;
        if (s.t === "brand")
          return (
            <span key={i} style={{background:"color-mix(in oklab,var(--ac) 22%,transparent)",color:"var(--tx)",borderRadius:"3px",padding:"1px 3px"}}>{s.v}</span>
          );
        return <span key={i}>{s.v}</span>;
      })}
    </>
  );
}

/* -------------------------------------------------------------------- rows */

function Row({
  conv,
  selected,
  last,
  onSelect,
}: {
  conv: Conversation;
  selected: boolean;
  last: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className="row-hover conv-row"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      style={{
        border:"none",
        padding:"14px 16px",
        ...(last ? {} : { borderBottom:"1px solid var(--brd)" }),
        ...(selected
          ? { background:"color-mix(in oklab,var(--ac) 6%,transparent)", borderLeft:"2px solid var(--ac)" }
          : {}),
      }}
    >
      <div style={selected ? {fontSize:"13px",fontWeight:"500",lineHeight:"1.45",color:"var(--tx)"} : {fontSize:"13px",fontWeight:"500",lineHeight:"1.45",color:"var(--mut)"}}>{`"${conv.title}"`}</div>
      <div style={{display:"flex",gap:"8px",marginTop:"8px",fontSize:"10.5px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>
        <span>{conv.platform}</span>
        <span>{"·"}</span>
        <span>{conv.date}</span>
        <span>{"·"}</span>
        <span>{`${conv.turns} turns`}</span>
        <span style={selected ? {marginLeft:"auto",color:"var(--ac)"} : {marginLeft:"auto"}}>{mentionLabel(conv)}</span>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------- shell */

export default function Explorer() {
  const [selectedId, setSelectedId] = useState(CONVERSATIONS[0].id);
  const [query, setQuery] = useState("");

  /* deep link: /app/conversations?c=<id> opens that transcript */
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get("c");
    if (want && CONVERSATIONS.some((c) => c.id === want)) setSelectedId(want);
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CONVERSATIONS;
    return CONVERSATIONS.filter((c) =>
      `${c.title} ${c.platform} ${c.region} ${transcriptText(c)}`.toLowerCase().includes(q)
    );
  }, [query]);

  const open = CONVERSATIONS.find((c) => c.id === selectedId) ?? CONVERSATIONS[0];

  function select(id: string) {
    setSelectedId(id);
    window.history.replaceState(null, "", `${window.location.pathname}?c=${id}`);
  }

  async function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}?c=${open.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Conversation link copied — it reopens this transcript.");
    } catch {
      toast("Couldn't copy — the browser blocked clipboard access.");
    }
  }

  const countLine = query.trim()
    ? `${shown.length} matching · 2,841 in the sample`
    : "2,841 conversations · sampled from consented panels";

  return (
    <>
      <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:"8px",padding:"12px 24px",borderBottom:"1px solid var(--brd)"}}>
        <input
          type="search"
          aria-label="Search conversations"
          placeholder="⌕ Search conversations…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{fontSize:"12px",fontWeight:400,fontVariantNumeric:"tabular-nums",color:"var(--tx)",background:"rgba(255,255,255,0.045)",border:"none",borderRadius:"7px",padding:"6px 12px",width:"220px",fontFamily:"inherit"}}
        />
        <FilterPill label="Mentions: Nike" items={MENTION_ITEMS} note={DEMO_NOTE} />
        <Hint text="Shows chats where this brand comes up." align="right" />
      </div>

      <div style={{flex:"1",display:"flex",minHeight:"0"}}>
        {/* ------------------------------------------------------- list pane */}
        <div style={{width:"400px",flex:"none",borderRight:"1px solid var(--brd)",display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",alignItems:"center",gap:"6px",padding:"12px 16px",fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)",borderBottom:"1px solid var(--brd)"}}>
            <span>{countLine}</span>
            <Hint text="Real chats with AI assistants, shared with permission." size={12} />
          </div>
          <div style={{flex:"1",minHeight:"0",overflowY:"auto"}}>
            {shown.map((c, i) => (
              <Row
                key={c.id}
                conv={c}
                selected={c.id === open.id}
                last={i === shown.length - 1}
                onSelect={() => select(c.id)}
              />
            ))}
            {shown.length === 0 && (
              <div style={{padding:"14px 16px",fontSize:"12px",fontWeight:"400",lineHeight:"1.45",color:"var(--fnt)"}}>
                {`No conversations match “${query.trim()}”.`}
              </div>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------- reading pane */}
        <div style={{flex:"1",minWidth:"0",display:"flex",flexDirection:"column",padding:"24px 28px",gap:"18px",overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <span style={{fontSize:"10px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--mut)",background:"var(--bg2)",borderRadius:"4px",padding:"3px 8px"}}>{open.platformTag}</span>
            <span style={{fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>{`${open.dateLong} · ${open.turns} turns · ${open.region} · consented panel`}</span>
            <Hint text="Which assistant, when, and how many messages." size={12} />
            <button
              type="button"
              onClick={copyLink}
              style={{marginLeft:"auto",fontSize:"11px",fontWeight:400,fontVariantNumeric:"tabular-nums",color:"var(--ac)",background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:"inherit"}}
            >
              {"Copy link"}
            </button>
          </div>

          <div style={{flex:"1",minHeight:"0",display:"flex",flexDirection:"column",gap:"18px",overflowY:"auto"}}>
            {open.transcript.map((turn, i) =>
              turn.role === "user" ? (
                <div key={i} style={{alignSelf:"flex-end",maxWidth:"70%",background:"var(--bg2)",border:"1px solid var(--brd)",borderRadius:"12px 12px 3px 12px",padding:"12px 16px",fontSize:"13px",lineHeight:"1.55",color:"var(--tx)"}}>
                  <Segments segs={turn.segs} sources={open.sources} />
                </div>
              ) : (
                <div key={i} style={{alignSelf:"flex-start",maxWidth:"82%",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"12px 12px 12px 3px",padding:"14px 18px",fontSize:"13px",lineHeight:"1.65",color:"var(--mut)"}}>
                  <Segments segs={turn.segs} sources={open.sources} />
                </div>
              )
            )}
          </div>

          <div style={{marginTop:"auto",borderTop:"1px solid var(--brd)",paddingTop:"14px",display:"flex",alignItems:"center",gap:"14px",fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)",flexWrap:"wrap"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
              {"SOURCES:"}
              <Hint text="Pages the assistant used to write this answer." size={12} />
            </span>
            {open.sources.map((s) => (
              <a
                key={s.n}
                className="cite-link"
                href={s.url}
                target="_blank"
                rel="noreferrer noopener"
                title={s.title}
                style={{color:"var(--mut)",textDecoration:"none",cursor:"pointer"}}
              >
                {`[${s.n}] ${s.label}`}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
