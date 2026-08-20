"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import KpiCard from "@/components/app/KpiCard";
import Hint from "@/components/ui/Hint";
import { toast } from "@/lib/toast";
import { EVENT_FIELDS, PIPELINE, PIPELINE_STEPS } from "@/lib/telemetry/pipeline";
import type { TelemetrySummary, TestHitResult } from "@/lib/telemetry";

/* Live view over first-party telemetry. Every number here was observed on THIS
   deployment — no fixtures, ever. Polls the read endpoint every 10s, and "Send a
   test crawler hit" makes a real GPTBot-UA request to this deployment on demand
   so the pipeline can be demonstrated without waiting for a crawler to show up.

   Zero events is a legitimate state, not an error: with no Redis attached the
   store is an in-process ring buffer, so a fresh serverless instance genuinely
   has nothing. The empty layout therefore leads with what the pipeline IS —
   the capture path and the size of the user-agent catalog, both derived from
   real code in lib/telemetry/pipeline.ts — and makes the test hit the single
   obvious action. It never invents an event to fill the space. */

function ago(ts: number) {
  return `${dur(Date.now() - ts)} ago`;
}

function dur(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  return `${Math.round(s / 3600)}h`;
}

const card: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "17px 19px",
};

const cardTitle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const th: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 500,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--fnt)",
  textAlign: "left",
  paddingBottom: "8px",
};

const td: React.CSSProperties = {
  fontSize: "12.5px",
  color: "var(--mut)",
  padding: "7px 0",
  borderTop: "1px solid var(--brd)",
  fontVariantNumeric: "tabular-nums",
};

const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

const codeBlock: React.CSSProperties = {
  fontFamily: mono,
  fontSize: "11.5px",
  color: "var(--tx)",
  background: "var(--bg0)",
  border: "1px solid var(--brd)",
  borderRadius: "7px",
  padding: "10px 12px",
  marginTop: "10px",
  overflowX: "auto",
};

/* Fires a genuine crawler request at this deployment and refreshes the view. */
function TestHitButton({
  onResult,
  size = "sm",
}: {
  onResult: (s: TelemetrySummary | null) => void;
  size?: "sm" | "lg";
}) {
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    try {
      const r = await fetch("/api/telemetry/test-hit", { method: "POST", cache: "no-store" });
      const j = (await r.json()) as TestHitResult;
      onResult(j.summary);

      if (!j.ok) {
        toast(`Test hit failed — ${j.error ?? "the request never completed"}.`);
      } else if (j.recorded) {
        const via = j.observedVia === "proxy" ? "the proxy" : "the test route";
        const blocked = j.status >= 400 ? ` This deployment answered ${j.status}, so the crawler was turned away — recorded with that status.` : "";
        toast(`GPTBot fetched ${j.path} → ${j.status}. Captured by ${via} in ${j.elapsedMs}ms.${blocked}`);
      } else {
        toast(`GPTBot fetched ${j.path} → ${j.status}, but nothing was recorded — the store rejected the write.`);
      }
    } catch {
      toast("Couldn't reach /api/telemetry/test-hit — check that the route is deployed.");
    } finally {
      setBusy(false);
    }
  }

  const lg = size === "lg";

  return (
    <button
      type="button"
      className="btn-ac"
      onClick={send}
      disabled={busy}
      style={{
        fontSize: lg ? "13px" : "12.5px",
        fontWeight: lg ? 600 : 500,
        borderRadius: lg ? "8px" : "7px",
        padding: lg ? "10px 18px" : "6px 14px",
        border: "none",
        cursor: busy ? "progress" : "pointer",
        fontFamily: "inherit",
        opacity: busy ? 0.7 : 1,
        flex: "none",
      }}
    >
      {busy ? "Sending…" : "Send a test crawler hit"}
    </button>
  );
}

/* The capture path, drawn from PIPELINE_STEPS so the diagram can't drift from
   the code it describes. */
function PathDiagram() {
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: "8px", flexWrap: "wrap", marginTop: "13px" }}>
      {PIPELINE_STEPS.map((s, i) => (
        <Fragment key={s.name}>
          <div
            style={{
              flex: "1 1 150px",
              minWidth: "142px",
              background: "var(--bg0)",
              border: "1px solid var(--brd)",
              borderRadius: "8px",
              padding: "9px 11px",
            }}
          >
            <div style={{ fontFamily: mono, fontSize: "11.5px", color: "var(--tx)" }}>{s.name}</div>
            <div style={{ fontSize: "10.5px", color: "var(--fnt)", marginTop: "3px", lineHeight: 1.4 }}>{s.detail}</div>
          </div>
          {i < PIPELINE_STEPS.length - 1 && (
            <div aria-hidden style={{ alignSelf: "center", color: "var(--fnt)", fontSize: "11px", flex: "none" }}>
              →
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}

/* Facts that hold whether or not a single event has been captured — all derived
   from lib/bots.ts and the store's retention constant, none of them traffic
   claims. This is what gives the page substance at zero. */
function PipelineFacts() {
  const facts: { n: string; label: string }[] = [
    { n: String(PIPELINE.uaPatterns), label: `AI user-agent patterns matched (${PIPELINE.crawlerPatterns} crawlers, ${PIPELINE.assistantPatterns} assistant fetchers)` },
    { n: String(PIPELINE.operators), label: "operators covered — OpenAI, Anthropic, Perplexity, Google, Microsoft…" },
    { n: String(PIPELINE.referralSources), label: "assistants attributed on the human side, via referrer or utm_source" },
    { n: PIPELINE.retention.toLocaleString(), label: `events retained per store · view refreshes every ${PIPELINE.refreshSeconds}s` },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginTop: "15px" }}>
      {facts.map((f) => (
        <div key={f.label} style={{ borderTop: "1px solid var(--brd)", paddingTop: "9px" }}>
          <div style={{ fontSize: "17px", fontWeight: 600, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>{f.n}</div>
          <div style={{ fontSize: "11px", color: "var(--fnt)", lineHeight: 1.5, marginTop: "3px" }}>{f.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function LiveTelemetry() {
  const [data, setData] = useState<TelemetrySummary | null>(null);
  const [err, setErr] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(0);
  const [origin, setOrigin] = useState("");
  const alive = useRef(true);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/telemetry", { cache: "no-store" });
      const j = (await r.json()) as TelemetrySummary;
      if (alive.current) {
        setData(j);
        setUpdatedAt(Date.now());
        setErr(false);
      }
    } catch {
      if (alive.current) setErr(true);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    setOrigin(window.location.origin);
    load();
    const t = setInterval(load, 10_000);
    return () => {
      alive.current = false;
      clearInterval(t);
    };
  }, [load]);

  // The test route hands back a fresh summary, so adopt it instead of re-polling.
  const adopt = useCallback(
    (s: TelemetrySummary | null) => {
      if (!s) return void load();
      setData(s);
      setUpdatedAt(Date.now());
      setErr(false);
    },
    [load],
  );

  if (err) {
    return (
      <div style={{ ...card, color: "var(--bad)", fontSize: "13px" }}>
        Couldn&apos;t reach the telemetry endpoint. The capture pipeline runs server-side — check that /api/telemetry is deployed.
      </div>
    );
  }

  if (!data) {
    return <div style={{ ...card, color: "var(--fnt)", fontSize: "13px" }}>Reading captured events…</div>;
  }

  const empty = data.crawlerEvents === 0 && data.referrals === 0;
  const durable = data.store.durable && !data.store.degraded;
  // `origin` is read from window on mount, so this fallback only shows for the
  // first paint / SSR — keep it on the canonical domain.
  const curlOrigin = origin || "https://useanswr.com";
  // One rule for every zero on the page: a zero is a real reading, so it stays a
  // numeral (never a dash) and is simply drawn muted rather than as headline text.
  const zero = (n: number) => (n === 0 ? "var(--fnt)" : undefined);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "var(--mut)" }}>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: durable ? "var(--good)" : "var(--gold)",
              flex: "none",
            }}
          />
          <span>
            Listening · {data.store.label} · updated {ago(updatedAt)}
          </span>
          <Hint text="Where captured visits are being kept right now" />
        </div>
        {!empty && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Hint text="Sends a real bot request to this site so you can watch it land" align="right" />
            <TestHitButton onResult={adopt} />
          </div>
        )}
      </div>

      {empty && (
        <div style={{ ...card, borderLeft: "2px solid var(--ac)", padding: "19px 21px" }}>
          <div style={cardTitle}>
            The capture path is running — this instance hasn&apos;t seen a visit yet
            <Hint text="Nothing has visited since this server started listening" />
          </div>
          <div style={{ fontSize: "12.5px", color: "var(--mut)", lineHeight: 1.65, marginTop: "7px", maxWidth: "78ch" }}>
            Requests to this deployment pass through the proxy, where the user-agent is matched against the AI crawler catalog;
            matches are classified and written server-side. That path is live right now. What this demo deliberately does{" "}
            <em>not</em> ship is a shared database — so each serverless instance keeps its own {PIPELINE.retention}-event buffer,
            and the one answering you has yet to record a match. An empty buffer is a property of demo hosting, not a broken
            pipeline.
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
              marginTop: "15px",
              padding: "13px 15px",
              background: "var(--bg0)",
              border: "1px solid var(--brd)",
              borderRadius: "9px",
            }}
          >
            <TestHitButton onResult={adopt} size="lg" />
            <div style={{ fontSize: "11.5px", color: "var(--mut)", lineHeight: 1.55, flex: "1 1 340px", minWidth: "260px" }}>
              Fetches this deployment&apos;s own <code style={{ fontFamily: mono }}>/pricing</code> with a GPTBot user-agent and
              returns the updated read in the same response — usually inside a second. The event you see afterwards describes a
              request that genuinely happened, with the status code this site actually returned.
            </div>
          </div>

          <div style={{ fontSize: "11.5px", color: "var(--fnt)", lineHeight: 1.6, marginTop: "14px" }}>
            Or send the same request yourself — anything that hits the pipeline shows up here:
          </div>
          <pre style={codeBlock}>curl -A &quot;GPTBot/1.2&quot; {curlOrigin}/pricing</pre>

          <div style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--tx)", marginTop: "18px" }}>The capture path</div>
          <PathDiagram />
          <div style={{ fontSize: "11.5px", color: "var(--fnt)", lineHeight: 1.6, marginTop: "11px" }}>
            Each captured event records {EVENT_FIELDS.slice(0, -1).join(", ")} and {EVENT_FIELDS[EVENT_FIELDS.length - 1]}. AI
            crawlers don&apos;t execute JavaScript, so capture has to happen server-side — a client-side tag cannot see them at
            all.
          </div>
          <PipelineFacts />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
        <KpiCard
          label="Crawler events"
          value={data.crawlerEvents.toLocaleString()}
          metricId="crawler_events"
          sub="captured by this instance"
          valueColor={zero(data.crawlerEvents)}
        />
        <KpiCard
          label="Unique agents"
          value={data.uniqueAgents.toLocaleString()}
          metricId="unique_agents"
          sub="distinct AI crawlers seen"
          valueColor={zero(data.uniqueAgents)}
        />
        <KpiCard
          label="Pages crawled"
          value={data.pagesCrawled.toLocaleString()}
          metricId="pages_crawled"
          sub="distinct paths fetched"
          valueColor={zero(data.pagesCrawled)}
        />
        <KpiCard
          label="AI referrals"
          value={data.referrals.toLocaleString()}
          metricId="ai_referrals"
          sub="human click-throughs"
          valueColor={zero(data.referrals)}
        />
      </div>

      {!empty && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "start" }}>
            <div style={card}>
              <div style={cardTitle}>
                By agent
                <Hint text="Which AI bots visited, and how often" />
              </div>
              {data.byBot.length === 0 ? (
                <div style={{ fontSize: "12.5px", color: "var(--fnt)", marginTop: "10px" }}>No crawler activity captured yet.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12px" }}>
                  <thead>
                    <tr>
                      <th style={th}>Agent</th>
                      <th style={th}>Operator</th>
                      <th style={{ ...th, textAlign: "right" }}>Requests</th>
                      <th style={{ ...th, textAlign: "right" }}>Last seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byBot.map((b) => (
                      <tr key={b.label} className="row-hover">
                        <td style={{ ...td, color: "var(--tx)", fontWeight: 500 }}>{b.label}</td>
                        <td style={td}>{b.operator}</td>
                        <td style={{ ...td, textAlign: "right", color: "var(--tx)" }}>{b.count}</td>
                        <td style={{ ...td, textAlign: "right" }}>{ago(b.lastSeen)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={card}>
              <div style={cardTitle}>
                Most-crawled paths
                <Hint text="The pages bots read the most" />
              </div>
              {data.byPath.length === 0 ? (
                <div style={{ fontSize: "12.5px", color: "var(--fnt)", marginTop: "10px" }}>No paths fetched yet.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12px" }}>
                  <thead>
                    <tr>
                      <th style={th}>Path</th>
                      <th style={{ ...th, textAlign: "right" }}>Fetches</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byPath.map((p) => (
                      <tr key={p.path} className="row-hover">
                        <td style={{ ...td, color: "var(--tx)" }}>{p.path}</td>
                        <td style={{ ...td, textAlign: "right" }}>{p.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {data.bySource.length > 0 && (
            <div style={card}>
              <div style={cardTitle}>
                AI referrals by source
                <Hint text="Which assistants sent real people to this site" />
              </div>
              <div style={{ display: "flex", gap: "22px", marginTop: "12px", flexWrap: "wrap" }}>
                {data.bySource.map((s) => (
                  <div key={s.label}>
                    <div style={{ fontSize: "20px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{s.count}</div>
                    <div style={{ fontSize: "11.5px", color: "var(--mut)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={card}>
            <div style={cardTitle}>
              Recent events
              <Hint text="The newest visits, newest first" />
            </div>
            {data.recent.length === 0 ? (
              <div style={{ fontSize: "12.5px", color: "var(--fnt)", marginTop: "10px" }}>Nothing captured yet.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12px" }}>
                <thead>
                  <tr>
                    <th style={th}>When</th>
                    <th style={th}>Agent</th>
                    <th style={th}>Path</th>
                    <th style={th}>Kind</th>
                    <th style={{ ...th, textAlign: "right" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        Verification
                        <Hint text="Whether we proved the bot is who it claims" align="right" size={12} />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((e, i) => (
                    <tr key={i} className="row-hover">
                      <td style={td}>{ago(e.ts)}</td>
                      <td style={{ ...td, color: "var(--tx)", fontWeight: 500 }}>{e.botLabel}</td>
                      <td style={td}>{e.path}</td>
                      <td style={td}>{e.kind === "crawler" ? "Crawl" : "Assistant fetch"}</td>
                      <td style={{ ...td, textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 500,
                            letterSpacing: ".06em",
                            textTransform: "uppercase",
                            color: e.verification === "verified" ? "var(--good)" : "var(--gold)",
                            border: `1px solid ${e.verification === "verified" ? "rgba(76,183,130,.35)" : "rgba(232,179,75,.35)"}`,
                            borderRadius: "4px",
                            padding: "2px 6px",
                          }}
                        >
                          {e.verification}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={card}>
            <div style={cardTitle}>
              The capture path
              <Hint text="How a bot visit becomes a row above" />
            </div>
            <PathDiagram />
            <PipelineFacts />
          </div>
        </>
      )}

      <div
        style={{
          ...card,
          borderLeft: `2px solid ${durable ? "var(--good)" : "var(--gold)"}`,
          background: "var(--bg0)",
        }}
      >
        <div style={{ fontSize: "12px", fontWeight: 600, color: durable ? "var(--good)" : "var(--gold)", display: "flex", alignItems: "center", gap: "6px" }}>
          {durable ? "Durable capture active" : "Reading one instance"}
          <Hint text={durable ? "Every instance writes to one shared store" : "Each server keeps its own short list of visits"} />
        </div>

        {durable ? (
          <div style={{ fontSize: "11.5px", color: "var(--mut)", lineHeight: 1.7, marginTop: "5px" }}>
            A KV env pair is set, so the store swapped itself to <strong style={{ color: "var(--tx)" }}>{data.store.label}</strong>{" "}
            at boot. Events are written to one shared Redis list (last {PIPELINE.retention}) that every serverless instance reads
            and writes, so this page shows the whole window and a cold start no longer clears it. Nothing else in the app changed
            — the swap is one <code style={{ fontFamily: mono }}>TelemetryStore</code> implementation.
          </div>
        ) : (
          <>
            <div style={{ fontSize: "11.5px", color: "var(--mut)", lineHeight: 1.7, marginTop: "5px" }}>
              Capture is real; retention is not yet. Events live in an in-process ring buffer (last {PIPELINE.retention}) and
              serverless spreads requests across instances — so this page shows whichever instance answered, and a cold start
              clears it. Counts here are a <em>floor</em>, never a total.
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--mut)", lineHeight: 1.7, marginTop: "8px" }}>
              <strong style={{ color: "var(--tx)" }}>Durable storage switches on by itself</strong> — set either env pair below
              and the next boot writes to one shared Redis list instead. No code change, no redeploy of the app logic, and no
              credential in this repo.
            </div>
            <pre style={codeBlock}>{`KV_REST_API_URL + KV_REST_API_TOKEN
    a Vercel Marketplace Redis store (and the legacy Vercel KV store)

UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
    an Upstash Redis database provisioned directly`}</pre>
          </>
        )}

        {data.store.degraded && (
          <div style={{ fontSize: "11.5px", color: "var(--bad)", lineHeight: 1.7, marginTop: "8px" }}>{data.store.degraded}</div>
        )}

        <div style={{ fontSize: "11.5px", color: "var(--mut)", lineHeight: 1.7, marginTop: "8px" }}>
          {durable ? "Shared store collecting for" : "This instance has been collecting for"} {dur(Date.now() - data.since)} ·
          refreshes every {PIPELINE.refreshSeconds}s. &ldquo;Declared&rdquo; means the user-agent matched a published pattern;
          promoting to &ldquo;verified&rdquo; needs the reverse-DNS / IP-range check in INTEGRATIONS.md §2.2.
        </div>
      </div>
    </div>
  );
}
