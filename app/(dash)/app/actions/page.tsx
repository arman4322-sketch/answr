import Link from "next/link";
import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import KpiCard from "@/components/app/KpiCard";
import Hint from "@/components/ui/Hint";
import ReportCsvButton from "@/components/ui/ReportCsvButton";
import { getLiveMetrics } from "@/lib/live/metrics";
import { listActions } from "@/lib/db/entities";
import { db } from "@/lib/db";
import { currentWorkspaceId } from "@/lib/tenant";
import NewActionButton from "./NewActionButton";
import { CollectingNotice, NoGapsNotice, NotAvailablePanel, SetupNotice } from "./Panels";
import {
  actionsScreen,
  fmtDate,
  fmtDateTime,
  historyLabel,
  kindLabel,
  rankLabel,
  savedStatusLabel,
  slugify,
  type ActionsScreen,
  type GapRow,
} from "./rows";
import { actionsReport } from "./reports";

/* Actions — the queue, derived from real gaps in the sampled answers.

   Every fixture on this screen is gone: the five painted action cards (92 / 87 /
   81 / 76 / 64), their impact estimates and effort sizes, the owner avatars, the
   open / in-progress / shipped-90d counts, the "+9.4pt available" KPI and the
   whole impact-model chart with its measured-and-projected curves from
   lib/data/optimize.

   What replaces them is the observation itself. lib/live/metrics reports the
   latest run per tracked prompt; a prompt whose answers never name the brand is
   a visibility gap, and one where a tracked competitor is named first is a
   ranking gap. Those become the queue, worst-first (see ./rows.ts).

   Columns the pipeline cannot fill are not rendered as "—", they are absent:
   there is no impact score, no effort size, no owner, no due date and no status
   on a derived row, because nothing measures or assigns them. The only rows
   carrying a status are the actions the user saved through /api/actions, which
   have real ones. The sidebar's impact model is replaced by a panel saying
   plainly what measuring impact would require.

   The two topbar filter pills went with the fixtures: the live rows have no
   category to filter by, and the queue has one honest order — worst-first — so
   a "Sort: Impact" pill would be sorting on a number that does not exist. */

export const metadata: Metadata = {
  title: "Actions — Answr",
};

export const dynamic = "force-dynamic";

/* Saved actions belong to the workspace this request is for. The screen used
   to read a hardcoded "demo" bucket shared by every tenant; it now resolves the
   tenant once (lib/tenant) and hands the SAME id to the metrics layer, so the
   queue and the saved list can never describe two different workspaces. */

/* Quiet export pill — same treatment as Agent Analytics' "Export 48,231 events". */
const EXPORT_PILL: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--mut)",
  background: "rgba(255,255,255,0.045)",
  borderRadius: "7px",
  padding: "6px 12px",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};

const KIND_STYLE: Record<GapRow["kind"], React.CSSProperties> = {
  missing: { color: "#e5636e", border: "1px solid rgba(229,99,110,.35)" },
  trailing: { color: "#d9b679", border: "1px solid rgba(217,182,121,.35)" },
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
      <span>{label}</span>
      <span style={{ fontSize: "11.5px", fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "var(--tx)" }}>{value}</span>
    </div>
  );
}

function GapCard({ row, position }: { row: GapRow; position: number }) {
  const kind = KIND_STYLE[row.kind];
  return (
    <Link
      href={`/app/actions/${row.id}`}
      className="card-hover"
      style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "16px 18px", display: "flex", gap: "16px", alignItems: "flex-start", color: "var(--tx)" }}
    >
      <div style={{ width: "44px", height: "44px", flex: "none", borderRadius: "9px", background: "color-mix(in oklab,var(--ac) 12%,transparent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--ac)" }}>
        {position}
      </div>
      <div style={{ flex: "1", minWidth: "0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>{row.title}</div>
          <span style={{ fontSize: "10px", fontWeight: 500, fontVariantNumeric: "tabular-nums", borderRadius: "4px", padding: "2px 6px", ...kind }}>
            {kindLabel(row.kind)}
          </span>
        </div>
        <div style={{ fontSize: "12.5px", color: "var(--mut)", lineHeight: "1.55", marginTop: "5px" }}>{row.evidence}</div>
        <div style={{ display: "flex", gap: "16px", marginTop: "10px", fontSize: "11px", fontWeight: 400, fontVariantNumeric: "tabular-nums", color: "var(--fnt)", flexWrap: "wrap" }}>
          {/* no <Hint> inside this card: it renders a button, and a button
              nested in the row's <Link> is invalid and would swallow the click */}
          <span>{`Engines answered ${row.providersAnswered}`}</span>
          <span>{`Rank ${row.kind === "missing" ? "not named" : rankLabel(row.rank)}`}</span>
          <span>{`Competitors named ${row.competitorsMentioned.length}`}</span>
          <span>{`Last run ${fmtDate(row.ts)}`}</span>
        </div>
      </div>
    </Link>
  );
}

function SavedActions({ data }: { data: ActionsScreen }) {
  if (!data.saved.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
        <div style={{ fontSize: "13.5px", fontWeight: 600 }}>{`Actions you saved · ${data.saved.length}`}</div>
        <Hint text="Actions you created by hand in this workspace" />
      </div>
      {!data.savedDurable && (
        <div style={{ fontSize: "11px", color: "var(--fnt)", lineHeight: 1.5 }}>
          {"Stored in memory on this instance — add a KV key in the environment to persist them."}
        </div>
      )}
      {data.saved.map((a) => (
        <div key={a.id} style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "13px 16px", display: "flex", gap: "14px", alignItems: "center" }}>
          <div style={{ flex: "1", minWidth: "0" }}>
            <div style={{ fontSize: "13px", fontWeight: 500 }}>{a.title}</div>
            <div style={{ display: "flex", gap: "14px", marginTop: "6px", fontSize: "11px", fontVariantNumeric: "tabular-nums", color: "var(--fnt)", flexWrap: "wrap" }}>
              <span>{a.impact ? `Your estimate ${a.impact}` : "No estimate given"}</span>
              {a.effort && <span>{`Effort ${a.effort}`}</span>}
              <span>{`Created ${fmtDateTime(a.createdAt)}`}</span>
            </div>
          </div>
          <span style={{ fontSize: "10.5px", fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "var(--mut)", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 9px", flex: "none" }}>
            {savedStatusLabel(a.status)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function ActionsPage() {
  const wsId = await currentWorkspaceId();
  const [metrics, saved] = await Promise.all([getLiveMetrics(wsId), listActions(wsId).catch(() => [])]);
  const data = actionsScreen(
    metrics,
    saved.map((a) => ({ id: a.id, title: a.title, impact: a.impact, effort: a.effort, status: a.status, createdAt: a.createdAt })),
    db().durable,
  );
  const report = actionsReport(data);

  return (
    <div className="frame-actions" style={{ flex: "1", display: "flex", flexDirection: "column", minWidth: 0 }}>
      <Topbar
        crumb="Actions"
        brand={data.brand || "Workspace"}
        showDateRange={false}
        showPlatforms={false}
        exportLabel={null}
        extra={
          <>
            <ReportCsvButton filename={`${slugify(data.brand)}-actions.csv`} report={report} style={EXPORT_PILL}>
              {"Export queue"}
            </ReportCsvButton>
            <NewActionButton />
          </>
        }
      />
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {!data.configured ? (
          <>
            <SetupNotice />
            <SavedActions data={data} />
          </>
        ) : !data.hasData ? (
          <>
            <CollectingNotice prompts={data.promptsTracked} />
            <SavedActions data={data} />
          </>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
              <KpiCard
                label="Visibility gaps"
                value={String(data.missingCount)}
                hint="Prompts where no engine named you"
                valueColor={data.missingCount > 0 ? "var(--bad)" : undefined}
              />
              <KpiCard label="Ranking gaps" value={String(data.trailingCount)} hint="Prompts where a rival is named first" />
              <KpiCard label="Named first" value={String(data.leadCount)} hint="Prompts you already lead" />
              <KpiCard
                label="Prompts sampled"
                value={String(data.promptsSampled)}
                hint="Prompts with a completed run"
                sub={`${historyLabel(data.days)} · last run ${fmtDate(data.lastRunAt)}`}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "16px", alignItems: "start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {data.gaps.length === 0 ? (
                  <NoGapsNotice brand={data.brand} sampled={data.promptsSampled} />
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", fontSize: "11.5px", color: "var(--fnt)", lineHeight: 1.5 }}>
                      <span>
                        {`Worst-first: prompts no engine answered with ${data.brand || "your brand"} come first, then prompts where a competitor is named before you. Each row is the latest sampled run for that prompt.`}
                      </span>
                      <Hint text="Rank is how early your brand is named" />
                    </div>
                    {data.gaps.map((row, i) => (
                      <GapCard key={row.id} row={row} position={i + 1} />
                    ))}
                  </>
                )}
                <SavedActions data={data} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "sticky", top: "0" }}>
                <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"What the queue is built from"}</div>
                    <Hint text="The sampled runs behind these rows" />
                  </div>
                  <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "9px", fontSize: "12px", color: "var(--mut)" }}>
                    <SummaryRow label="Visibility gaps" value={String(data.missingCount)} />
                    <SummaryRow label="Ranking gaps" value={String(data.trailingCount)} />
                    <SummaryRow label="Prompts named first" value={String(data.leadCount)} />
                    <SummaryRow label="Prompts sampled" value={String(data.promptsSampled)} />
                    <SummaryRow label="Prompts tracked now" value={String(data.promptsTracked)} />
                    <SummaryRow label="Answers sampled" value={String(data.answersSampled)} />
                    <SummaryRow label="Sampled history" value={historyLabel(data.days)} />
                    <SummaryRow label="Last run" value={fmtDate(data.lastRunAt)} />
                  </div>
                </div>
                {data.rivals.length > 0 && (
                  <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"Named in these answers"}</div>
                      <Hint text="Rivals the answers name where you fall short" />
                    </div>
                    <div style={{ fontSize: "11.5px", color: "var(--fnt)", lineHeight: 1.5, marginTop: "6px" }}>
                      {"Tracked competitors appearing in the answers behind the queue, counted by prompt."}
                    </div>
                    <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "9px", fontSize: "12px", color: "var(--mut)" }}>
                      {data.rivals.map((r) => (
                        <SummaryRow key={r.name} label={r.name} value={`${r.prompts} prompt${r.prompts === 1 ? "" : "s"}`} />
                      ))}
                    </div>
                  </div>
                )}
                <NotAvailablePanel
                  compact
                  heading="Impact modelling isn't collecting data yet"
                  requires="Projecting what a fix is worth needs before-and-after measurement of shipped changes, which nothing in the pipeline records — the sampler stores answers, not the edits you make to your site."
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
