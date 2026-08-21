"use client";

import { useState } from "react";

/* Homepage free-snapshot form (INTERACTIVITY_CONVENTIONS playbook 9 — marketing
   forms submit for real and swap to an inline success state; marketing never
   toasts a demo line). The depicted domain field + "Get my free snapshot"
   button keep their exact frame styling; only the submit behaviour is new.

   The frame's field row and the trailing reassurance line are both owned here
   so the success state can replace the row in place. */

const ROW: React.CSSProperties = { display: "flex", justifyContent: "center", gap: "10px", marginTop: "26px" };
const FOOT: React.CSSProperties = { fontSize: "11.5px", color: "var(--fnt)", marginTop: "14px" };

export default function SnapshotForm() {
  const [domain, setDomain] = useState("yourcompany.com");
  const [invalid, setInvalid] = useState(false);
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) {
      setInvalid(true);
      return;
    }
    // Persist the interest (durable once storage is configured; captured either way).
    void fetch("/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ source: "snapshot", company: domain.trim() }),
    }).catch(() => {});
    setSent(true);
  }

  if (sent) {
    return (
      <>
        <div role="status" style={{ ...ROW, flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", gap: "11px", alignItems: "baseline" }}>
            <span style={{ color: "var(--ac)", fontWeight: "700" }}>{"✓"}</span>
            <span style={{ fontSize: "16px", fontWeight: "600" }}>{`Queued — we're sampling ${domain.trim()} now.`}</span>
          </div>
          <div style={{ fontSize: "13.5px", color: "var(--mut)", lineHeight: "1.6", maxWidth: "480px" }}>
            {"25 starter prompts across five platforms. Your snapshot lands in your inbox within the hour."}
          </div>
        </div>
        <div style={FOOT}>{"2,400+ teams started here · no sales follow-up unless you ask for it"}</div>
      </>
    );
  }

  return (
    <>
      <form onSubmit={submit} noValidate style={ROW}>
        <label style={{width:"340px",border:`1px solid ${invalid ? "var(--bad)" : "var(--brd)"}`,borderRadius:"8px",background:"var(--bg0)",padding:"12px 15px",fontSize:"13.5px",textAlign:"left",color:"var(--fnt)",display:"flex",alignItems:"center"}}>
          <span>{"https://"}</span>
          <input
            type="text"
            value={domain}
            onChange={(e) => { setDomain(e.target.value); setInvalid(false); }}
            aria-label="Your company domain"
            aria-invalid={invalid}
            style={{flex:"1",minWidth:"0",background:"transparent",border:"none",padding:"0",color:"var(--tx)",fontSize:"13.5px",fontFamily:"inherit"}}
          />
        </label>
        <button type="submit" className="btn-ac" style={{display:"inline-flex",alignItems:"center",gap:"8px",fontSize:"13.5px",fontWeight:"600",borderRadius:"8px",padding:"12px 22px",border:"none",cursor:"pointer",fontFamily:"inherit"}}>{"Get my free snapshot"}
          <span style={{display:"inline-block"}}>{"→"}</span>
        </button>
      </form>
      <div style={FOOT}>
        {invalid ? <span style={{ color: "var(--bad)" }}>{"Enter your domain — that's all we need to start sampling."}</span> : "2,400+ teams started here · no sales follow-up unless you ask for it"}
      </div>
    </>
  );
}
