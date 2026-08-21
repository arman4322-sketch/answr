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
type Funnel = { views: number; signups: number; conversion: number; bySource: { source: string; views: number; signups: number; conversion: number }[] };

export default function LeadsTable() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [durable, setDurable] = useState(false);
  const [funnel, setFunnel] = useState<Funnel | null>(null);

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
    fetch("/api/waitlist/view")
      .then((r) => r.json())
      .then((d: Funnel & { ok: boolean }) => { if (d.ok) setFunnel(d); })
      .catch(() => {});
  }, []);

  return (
    <>
      {funnel && (funnel.views > 0 || funnel.signups > 0) && (
        <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "16px 18px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>Waitlist funnel</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginTop: "12px" }}>
            {[["Views", String(funnel.views)], ["Signups", String(funnel.signups)], ["Conversion", `${funnel.conversion}%`]].map(([l, v]) => (
              <div key={l} style={{ background: "var(--bg2)", border: "1px solid var(--brd)", borderRadius: "8px", padding: "10px 12px" }}>
                <div style={{ fontSize: "18px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{v}</div>
                <div style={{ fontSize: "10.5px", color: "var(--mut)", marginTop: "2px" }}>{l}</div>
              </div>
            ))}
          </div>
          {funnel.bySource.length > 0 && (
            <div style={{ marginTop: "12px", borderTop: "1px solid var(--brd)", paddingTop: "10px" }}>
              <div style={{ fontSize: "10.5px", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--fnt)", marginBottom: "6px" }}>By source</div>
              {funnel.bySource.map((s) => (
                <div key={s.source} style={{ display: "grid", gridTemplateColumns: "1.4fr .6fr .6fr .6fr", fontSize: "12.5px", padding: "5px 0", color: "var(--mut)", fontVariantNumeric: "tabular-nums" }}>
                  <span style={{ color: "var(--tx)" }}>{s.source}</span>
                  <span>{s.views} v</span>
                  <span>{s.signups} s</span>
                  <span>{s.conversion}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
