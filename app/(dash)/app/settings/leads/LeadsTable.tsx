"use client";

import { useEffect, useState } from "react";

type Lead = { id: string; email: string; name?: string; company?: string; source: string; createdAt: number };

function fmt(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`;
}

/* Reads captured leads from /api/lead (same route module the forms POST to, so
   the in-memory store is shared; durable once KV is configured). */
export default function LeadsTable() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [durable, setDurable] = useState(false);

  useEffect(() => {
    fetch("/api/lead")
      .then((r) => r.json())
      .then((d: { ok: boolean; durable?: boolean; leads?: Lead[] }) => {
        if (d.ok) {
          setLeads(d.leads ?? []);
          setDurable(!!d.durable);
        } else setLeads([]);
      })
      .catch(() => setLeads([]));
  }, []);

  return (
    <>
      <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "16px 18px" }}>
        <div style={{ fontSize: "14px", fontWeight: 600 }}>Captured leads</div>
        <div style={{ fontSize: "12.5px", color: "var(--mut)", marginTop: "6px", lineHeight: 1.6 }}>
          {leads === null
            ? "Loading…"
            : leads.length === 0
              ? "No leads captured yet. Submit the homepage snapshot or the demo form and they appear here."
              : `${leads.length} lead${leads.length === 1 ? "" : "s"} captured.`}
          {leads !== null && !durable && " Storage is in-memory — set a KV/Redis key (Settings › Integrations) to retain leads across restarts."}
        </div>
      </div>

      {leads && leads.length > 0 && (
        <div style={{ border: "1px solid var(--brd)", borderRadius: "10px", overflow: "hidden", background: "var(--bg1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.2fr .7fr 1fr", padding: "10px 16px", fontSize: "10px", fontWeight: 500, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--fnt)", borderBottom: "1px solid var(--brd)" }}>
            <span>Email / domain</span>
            <span>Company</span>
            <span>Source</span>
            <span>When</span>
          </div>
          {leads.map((l) => (
            <div key={l.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.2fr .7fr 1fr", padding: "11px 16px", fontSize: "12.5px", borderBottom: "1px solid var(--brd)", alignItems: "center" }}>
              <span style={{ color: "var(--tx)" }}>{l.email || "—"}</span>
              <span style={{ color: "var(--mut)" }}>{l.company || "—"}</span>
              <span style={{ color: "var(--mut)" }}>{l.source}</span>
              <span style={{ color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>{fmt(l.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
