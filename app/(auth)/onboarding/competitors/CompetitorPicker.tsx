"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";

/* Onboarding step 2 — competitor picker (client), real local state:
   - the ✕ on a tracked row removes it (and hands it back to Suggested)
   - a Suggested chip adds that brand to the tracked list
   - the search field is a real form — Enter adds whatever domain you typed
   - the frame's own rule ("Add up to 10") is enforced with a toast
   Row/chip styles are the frame's, verbatim. */

type Brand = { name: string; domain: string; color: string };

const MAX = 10;

const initialTracked: Brand[] = [
  { name: "Adidas", domain: "adidas.com", color: "#7fa7d9" },
  { name: "Brooks", domain: "brooksrunning.com", color: "#b98ed9" },
  { name: "Asics", domain: "asics.com", color: "#d9b679" },
];

const initialSuggested: Brand[] = [
  { name: "New Balance", domain: "newbalance.com", color: "#d985a8" },
  { name: "Saucony", domain: "saucony.com", color: "#7fd9c4" },
  { name: "Hoka", domain: "hoka.com", color: "#e0a878" },
];

const swatches = ["#7fa7d9", "#b98ed9", "#d9b679", "#d985a8", "#7fd9c4", "#e0a878", "#8e7cf2", "#4cb782"];

function brandFromInput(raw: string, used: number): Brand {
  const cleaned = raw.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();
  const label = cleaned.split(".")[0] || cleaned;
  return {
    name: label.charAt(0).toUpperCase() + label.slice(1),
    domain: cleaned.includes(".") ? cleaned : `${cleaned}.com`,
    color: swatches[used % swatches.length],
  };
}

export default function CompetitorPicker() {
  const [tracked, setTracked] = useState<Brand[]>(initialTracked);
  const [suggested, setSuggested] = useState<Brand[]>(initialSuggested);
  const [query, setQuery] = useState("");
  const [added, setAdded] = useState(0);

  function add(brand: Brand) {
    if (tracked.length >= MAX) {
      toast("Share of voice is measured against up to 10 brands — remove one to add another.");
      return;
    }
    if (tracked.some((b) => b.domain === brand.domain)) {
      toast(`${brand.name} is already on the list.`);
      return;
    }
    setTracked((list) => [...list, brand]);
    setSuggested((list) => list.filter((b) => b.domain !== brand.domain));
  }

  function remove(brand: Brand) {
    setTracked((list) => list.filter((b) => b.domain !== brand.domain));
    setSuggested((list) => (list.some((b) => b.domain === brand.domain) ? list : [...list, brand]));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    add(brandFromInput(query, added));
    setAdded((n) => n + 1);
    setQuery("");
  }

  return (
    <>
      <form onSubmit={submit} noValidate style={{margin:0}}>
        <input
          aria-label="Search or paste a domain"
          name="competitor"
          type="text"
          placeholder="⌕ Search or paste a domain…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{display:"block",width:"100%",boxSizing:"border-box",border:"1px solid var(--brd)",borderRadius:"8px",background:"var(--bg0)",padding:"11px 13px",fontSize:"13px",color:"var(--tx)",fontFamily:"inherit",marginTop:"20px"}}
        />
      </form>
      <div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"14px"}}>
        {tracked.map((b) => (
          <div key={b.domain} style={{display:"flex",alignItems:"center",gap:"10px",background:"var(--bg0)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"10px 14px",fontSize:"13px"}}>
            <span style={{width:"7px",height:"7px",borderRadius:"2px",background:b.color}} />
            <span style={{fontWeight:"500"}}>{b.name}</span>
            <span style={{fontSize:"11px",fontWeight:"400",fontVariantNumeric:"tabular-nums",color:"var(--fnt)"}}>{b.domain}</span>
            <button
              type="button"
              onClick={() => remove(b)}
              aria-label={`Remove ${b.name}`}
              style={{marginLeft:"auto",color:"var(--fnt)",background:"transparent",border:"none",padding:"0",fontSize:"13px",fontFamily:"inherit",lineHeight:"1",cursor:"pointer"}}
            >{"✕"}</button>
          </div>
        ))}
        {tracked.length === 0 && (
          <div style={{fontSize:"12.5px",color:"var(--fnt)",lineHeight:"1.55",padding:"2px 0"}}>{"No competitors yet — add one above, or pick from Suggested."}</div>
        )}
      </div>
      {suggested.length > 0 && (
        <>
          <div style={{fontSize:"10.5px",fontWeight:"500",fontVariantNumeric:"tabular-nums",color:"var(--fnt)",marginTop:"18px"}}>{"Suggested"}</div>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginTop:"10px"}}>
            {suggested.map((b) => (
              <button
                key={b.domain}
                type="button"
                onClick={() => add(b)}
                style={{fontSize:"12px",border:"1px dashed var(--brd)",borderRadius:"6px",padding:"6px 11px",color:"var(--mut)",background:"transparent",fontFamily:"inherit",cursor:"pointer"}}
              >{`+ ${b.name}`}</button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
