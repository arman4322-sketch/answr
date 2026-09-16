import Link from "next/link";
import Hint from "@/components/ui/Hint";
import type { LiveMetrics } from "@/lib/live/metrics";
import CardNote from "./CardNote";
import { int, pct, s } from "./format";

/* "Top cited sources" — the domains the sampled answers actually linked to.

   Rows are LiveMetrics.citedDomains (top six), each with its real citation
   count and its share of all citations in the latest run of each prompt. Bar
   width encodes the row's count relative to the most-cited domain, which is
   what the frame's bars encoded; the number beside it is the count itself, so
   nothing is implied that isn't measured. Domains the workspace owns are
   marked rather than inferred from a fixture flag. */

const MAX_ROWS = 6;

export default function TopSourcesCard({ m }: { m: LiveMetrics }) {
  const rows = m.citedDomains.slice(0, MAX_ROWS);
  const top = rows[0]?.count ?? 0;
  const owned = rows.filter((r) => r.owned).length;

  return (
    <div style={{background:"var(--bg1)",border:"1px solid var(--brd)",borderRadius:"10px",padding:"17px 19px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
          <div style={{fontSize:"13px",fontWeight:"600"}}>{"Top cited sources"}</div>
          <Hint text="Websites AI quotes most for these questions" />
        </div>
        <Link href="/app/citations" style={{fontSize:"11.5px",fontWeight:"500",color:"var(--ac)"}}>{"View all →"}</Link>
      </div>

      {rows.length === 0 ? (
        <div style={{ marginTop: "15px" }}>
          <CardNote
            title={m.configured ? (m.hasData ? "No citations captured yet" : "Collecting — first sample runs tonight") : "Not set up yet"}
            body={
              !m.configured
                ? "Set up your brand to start collecting data — cited sources are parsed from the answers as they arrive."
                : m.hasData
                  ? "The answers sampled so far returned no source links. Not every engine exposes citations on every answer."
                  : "Cited domains are parsed out of sampled answers. None have been collected yet."
            }
          />
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"12px",marginTop:"15px"}}>
          {rows.map((r) => (
            <div className="row-hover" key={r.domain}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"12.5px",marginBottom:"5px",gap:"10px"}}>
                <span style={{display:"flex",alignItems:"center",gap:"7px",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {r.domain}
                  {r.owned && (
                    <span style={{fontSize:"10px",fontWeight:"600",color:"#b3a7f8",background:"rgba(142,124,242,0.16)",borderRadius:"4px",padding:"1px 6px",flex:"none"}}>{"Yours"}</span>
                  )}
                </span>
                <span style={{fontWeight:"600",fontVariantNumeric:"tabular-nums",color:"var(--mut)",flex:"none"}}>
                  {`${int(r.count)} `}
                  <span style={{color:"var(--fnt)",fontWeight:"500",fontSize:"11.5px"}}>{pct(r.share)}</span>
                </span>
              </div>
              <div style={{height:"3px",background:"var(--bg2)",borderRadius:"2px"}}>
                <div style={{width:`${top ? Math.max(2, Math.round((r.count / top) * 100)) : 0}%`,height:"3px",background:"var(--ac)",borderRadius:"2px",opacity:r.owned ? undefined : "0.75"}} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{marginTop:"16px",padding:"11px 13px",border:"1px solid var(--brd)",borderRadius:"8px",background:"var(--bg0)",display:"flex",gap:"9px",alignItems:"flex-start"}}>
        <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"var(--ac)",marginTop:"6px",flex:"none"}} />
        <div style={{fontSize:"12px",color:"var(--mut)",lineHeight:"1.55"}}>
          {m.citationsCount > 0 ? (
            <>
              <span style={{color:"var(--tx)",fontWeight:"500"}}>{`${int(m.citationsCount)} citation${s(m.citationsCount)}`}</span>
              {` across ${int(m.uniqueCitedDomains)} domain${s(m.uniqueCitedDomains)} in the sampled answers · ${pct(m.ownedCitationShare)} point at ${m.workspace?.domain || "your own domain"}${owned ? "" : ", none of them in this top list"}.`}
            </>
          ) : (
            <>
              <span style={{color:"var(--tx)",fontWeight:"500"}}>{"No citations yet."}</span>
              {` ${pct(m.answersWithCitationRate)} of sampled answers carried source links.`}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
