"use client";

import { useState } from "react";
import Hint from "@/components/ui/Hint";
import AddBrandModal from "@/components/app/AddBrandModal";
import { BRANDS, useSelectedBrand, type Brand } from "@/lib/brands";
import { METRICS } from "@/lib/metrics";
import AddBrandButton from "./AddBrandButton";

/* All-assets body — client so the "Search assets" input filters the brand cards
   as you type and both add-brand affordances open the real add-brand form.

   Cards render from lib/brands.ts, the same list the sidebar switcher reads, so
   the "Current" badge here always agrees with the brand ticked in the switcher.
   Markup and every stat are the frame's, unchanged. */

const COMPETITORS_HINT = "Rival brands we compare you against";

function Stat({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"11px",color:"var(--fnt)"}}>{label}<Hint text={hint} size={12} /></div>
      <div style={{fontSize:"17px",fontWeight:"600",fontVariantNumeric:"tabular-nums",marginTop:"3px"}}>{children}</div>
    </div>
  );
}

function BrandCard({ brand, current }: { brand: Brand; current: boolean }) {
  return (
    <div style={{background:"var(--bg1)",border:current?"1px solid var(--ac)":"1px solid var(--brd)",borderRadius:"10px",padding:"16px",boxShadow:current?"0 0 0 1px rgba(142,124,242,0.2)":undefined}}>
      <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
        <div style={{width:"30px",height:"30px",borderRadius:"8px",background:brand.gradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"700",color:"#fff"}}>{brand.initial}</div>
        <div>
          <div style={{fontSize:"14px",fontWeight:"600"}}>
            {current ? `${brand.name} ` : brand.name}
            {current && <span style={{fontSize:"10px",fontWeight:"600",color:"#b3a7f8",background:"rgba(142,124,242,0.16)",borderRadius:"4px",padding:"2px 6px",marginLeft:"4px"}}>{"Current"}</span>}
          </div>
          <div style={{fontSize:"11px",color:"var(--fnt)"}}>{`${brand.domain} · ${brand.category}`}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:"20px",marginTop:"14px"}}>
        <Stat label="Visibility" hint={METRICS.visibility_score.plain}>
          {`${brand.visibility} `}<span style={{fontSize:"11px",color:brand.deltaUp?"#4cb782":"#e5636e"}}>{brand.delta}</span>
        </Stat>
        <Stat label="Prompts" hint={METRICS.prompts_tracked.plain}>
          {brand.prompts}<span style={{fontSize:"11px",color:"var(--fnt)"}}>{brand.promptQuota}</span>
        </Stat>
        <Stat label="Competitors" hint={COMPETITORS_HINT}>
          {brand.competitors}
        </Stat>
      </div>
    </div>
  );
}

export default function AssetsBody() {
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const selected = useSelectedBrand();
  const q = query.trim().toLowerCase();
  const visible = q ? BRANDS.filter((b) => b.search.includes(q)) : BRANDS;

  return (
    <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:"14px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"16px",fontWeight:"600"}}>{"Assets"}<Hint text="Brands this workspace keeps an eye on" /></div><div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"3px"}}>{"Brands tracked in this workspace · each has its own prompt set and competitor list"}</div></div>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <input
            aria-label="Search assets"
            placeholder="Search assets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{fontSize:"12px",color:"var(--tx)",background:"rgba(255,255,255,0.045)",border:"none",borderRadius:"7px",padding:"6px 12px",fontFamily:"inherit",width:"150px"}}
          />
          <AddBrandButton />
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
        {visible.map((b) => (
          <BrandCard key={b.id} brand={b} current={b.id === selected.id} />
        ))}
        <button type="button" onClick={() => setAddOpen(true)} style={{border:"1px dashed var(--brd)",borderRadius:"10px",padding:"16px",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--fnt)",fontSize:"13px",minHeight:"120px",background:"transparent",cursor:"pointer",fontFamily:"inherit"}}>{"+ Add a brand — new prompt set, own competitor list"}</button>
      </div>
      {q && visible.length === 0 && (
        <div style={{fontSize:"12px",color:"var(--fnt)"}}>{`No assets match "${query.trim()}".`}</div>
      )}
      <div style={{fontSize:"12px",color:"var(--mut)",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"11px 14px",lineHeight:"1.55"}}>{"Switch between these from the workspace line at the top of the sidebar. Plan quota is pooled across assets."}</div>
      <AddBrandModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
