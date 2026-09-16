"use client";

import { useState } from "react";
import Link from "next/link";
import Hint from "@/components/ui/Hint";
import { brandSubtitle, type BrandIdentity } from "@/lib/brands";
import { METRICS } from "@/lib/metrics";

/* All-assets body — client so the "Search assets" input filters as you type.

   The asset is the ONE workspace this deployment tracks (lib/workspace.ts), and
   every figure on the card comes from the live layer, computed by the page above.
   There is no brand list and no "add a brand": the product tracks a single
   workspace, so the card that used to invite a second brand now says where the
   tracked one is changed instead. Markup and layout are the frame's, unchanged. */

const COMPETITORS_HINT = "Rival brands we compare you against";

/** One tracked asset, fully resolved by the server page. */
export type AssetSummary = {
  brand: BrandIdentity;
  /** % of sampled answers naming the brand; null until the sampler has run */
  visibility: number | null;
  /** change in percentage points across sampled history; null below two days */
  delta: number | null;
  /** distinct days the sampler has run — what the delta is measured over */
  days: number;
  /** tracked prompts in the workspace's prompt set */
  prompts: number;
  /** competitors the workspace compares against */
  competitors: number;
  /** lowercase haystack for the search box */
  search: string;
};

function Stat({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"11px",color:"var(--fnt)"}}>{label}<Hint text={hint} size={12} /></div>
      <div style={{fontSize:"17px",fontWeight:"600",fontVariantNumeric:"tabular-nums",marginTop:"3px"}}>{children}</div>
    </div>
  );
}

function AssetCard({ asset }: { asset: AssetSummary }) {
  const { brand } = asset;
  const sub = brandSubtitle(brand);
  return (
    <div style={{background:"var(--bg1)",border:"1px solid var(--ac)",borderRadius:"10px",padding:"16px",boxShadow:"0 0 0 1px rgba(142,124,242,0.2)"}}>
      <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
        <div style={{width:"30px",height:"30px",borderRadius:"8px",background:brand.gradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"700",color:"#fff"}}>{brand.initial}</div>
        <div>
          <div style={{fontSize:"14px",fontWeight:"600"}}>
            {`${brand.name} `}
            <span style={{fontSize:"10px",fontWeight:"600",color:"#b3a7f8",background:"rgba(142,124,242,0.16)",borderRadius:"4px",padding:"2px 6px",marginLeft:"4px"}}>{"Current"}</span>
          </div>
          <div style={{fontSize:"11px",color:"var(--fnt)"}}>{sub || "Tracked brand"}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:"20px",marginTop:"14px"}}>
        <Stat label="Visibility" hint={METRICS.visibility_score.plain}>
          {asset.visibility === null ? (
            <span style={{fontSize:"13px",fontWeight:500,color:"var(--fnt)"}}>{"Collecting"}</span>
          ) : (
            <>
              {`${asset.visibility}% `}
              {asset.delta !== null && (
                <span
                  title={`Change in percentage points across ${asset.days} sampled day${asset.days === 1 ? "" : "s"}`}
                  style={{fontSize:"11px",color:asset.delta >= 0 ? "#4cb782" : "#e5636e"}}
                >
                  {`${asset.delta >= 0 ? "↑" : "↓"}${Math.abs(asset.delta)}`}
                </span>
              )}
            </>
          )}
        </Stat>
        <Stat label="Prompts" hint={METRICS.prompts_tracked.plain}>
          {asset.prompts}
        </Stat>
        <Stat label="Competitors" hint={COMPETITORS_HINT}>
          {asset.competitors}
        </Stat>
      </div>
    </div>
  );
}

export default function AssetsBody({ asset }: { asset: AssetSummary | null }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = asset !== null && (q === "" || asset.search.includes(q));

  return (
    <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:"14px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"16px",fontWeight:"600"}}>{"Assets"}<Hint text="The brand this workspace keeps an eye on" /></div><div style={{fontSize:"12px",color:"var(--fnt)",marginTop:"3px"}}>{"The brand tracked in this workspace · its prompt set and competitor list"}</div></div>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <input
            aria-label="Search assets"
            placeholder="Search assets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{fontSize:"12px",color:"var(--tx)",background:"rgba(255,255,255,0.045)",border:"none",borderRadius:"7px",padding:"6px 12px",fontFamily:"inherit",width:"150px"}}
          />
          <Link
            href={asset ? "/app/settings" : "/onboarding/brand"}
            className="btn-ac"
            style={{fontSize:"12.5px",fontWeight:"500",borderRadius:"7px",padding:"6px 14px",textDecoration:"none"}}
          >
            {asset ? "Brand settings" : "Set up brand"}
          </Link>
        </div>
      </div>

      {asset === null ? (
        <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"22px 24px"}}>
          <div style={{fontSize:"14.5px",fontWeight:600}}>{"No brand configured"}</div>
          <div style={{fontSize:"12.5px",color:"var(--mut)",lineHeight:1.55,marginTop:"6px",maxWidth:"72ch"}}>
            {"This workspace has no brand yet, so there is nothing to track and nothing to show. Name the brand, its website and the competitors to compare against, and the prompt set is generated for you."}
          </div>
          <Link href="/onboarding/brand" style={{fontSize:"12.5px",fontWeight:500,color:"var(--ac)",textDecoration:"none",marginTop:"12px",display:"inline-block"}}>
            {"Set up your brand →"}
          </Link>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
          {matches && <AssetCard asset={asset} />}
          <Link
            href="/app/settings"
            style={{border:"1px dashed var(--brd)",borderRadius:"10px",padding:"16px",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",color:"var(--fnt)",fontSize:"12.5px",lineHeight:1.5,minHeight:"120px",background:"transparent",textDecoration:"none"}}
          >
            {"Answr tracks one brand per deployment — change the tracked brand, its competitors and its prompt set in brand settings."}
          </Link>
        </div>
      )}

      {asset !== null && !matches && (
        <div style={{fontSize:"12px",color:"var(--fnt)"}}>{`No assets match "${query.trim()}".`}</div>
      )}

      {asset !== null && (
        <div style={{fontSize:"12px",color:"var(--mut)",background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"8px",padding:"11px 14px",lineHeight:"1.55"}}>{"This is the brand shown on the workspace line at the top of the sidebar. Every dashboard figure is sampled for it — nothing here is an estimate."}</div>
      )}
    </div>
  );
}
