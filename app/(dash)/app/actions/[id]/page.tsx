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
import NewActionButton from "../NewActionButton";
import { CollectingNotice, NotAvailablePanel, SetupNotice } from "../Panels";
import {
  actionsScreen,
  enginesLabel,
  findGap,
  fmtDateTime,
  historyLabel,
  kindLabel,
  rankLabel,
  slugify,
  truncate,
} from "../rows";
import { gapBriefReport } from "../reports";

/* Action detail — one observed gap, in full.

   This route replaces the hard-coded /app/actions/92, which was a brief for a
   fixture: a "Nike vs Adidas" comparison page with an invented +2.8pt estimate,
   41 affected prompts, an assignee ("Dana Okafor"), a created date, a
   three-step implementation checklist and three reference URLs with citation
   counts. None of it existed.

   The id here is derived from the prompt text (see ../rows.ts), so a row in the
   queue opens the evidence behind it: which engines answered, whether the brand
   was named and how early, which tracked competitors appeared, when it last ran
   and what one of the answers actually said. An id that matches nothing —
   including the old /app/actions/92 link — gets an honest "no longer exists"
   panel rather than a 404 or a resurrected fixture.

   Two panels state what is missing instead of filling it in: the pipeline
   writes no remediation steps, and citations are aggregated workspace-wide
   rather than per prompt, so no source list can be attributed to this gap. */

export const metadata: Metadata = {
  title: "Action detail — Answr",
};

export const dynamic = "force-dynamic";

/* Same tenant resolution as the queue screen: one id, used for both the live
   metrics behind the gap and the caller's own saved actions. */

const EXPORT_PILL: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--mut)",
  background: "rgba(255,255,255,0.045)",
  borderRadius: "7px",
  padding: "6px 12px",
  border: "none",
  fontFamily: "inherit",
  cursor: "pointer",
};

const KIND_STYLE = {
  missing: { color: "#e5636e", border: "1px solid rgba(229,99,110,.35)" },
  trailing: { color: "#d9b679", border: "1px solid rgba(217,182,121,.35)" },
} as const;

const CHIP: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 600,
  color: "var(--mut)",
  border: "1px solid var(--brd)",
  borderRadius: "4px",
  padding: "2px 7px",
};

const backLink: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 500,
  color: "var(--ac)",
  textDecoration: "none",
  marginTop: "12px",
  display: "inline-block",
};

export default async function ActionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const wsId = await currentWorkspaceId();
  const [metrics, saved] = await Promise.all([getLiveMetrics(wsId), listActions(wsId).catch(() => [])]);
  const data = actionsScreen(
    metrics,
    saved.map((a) => ({ id: a.id, title: a.title, impact: a.impact, effort: a.effort, status: a.status, createdAt: a.createdAt })),
    db().durable,
  );
  const gap = findGap(data, id);

  const topbar = (
    <Topbar
      crumb={["Actions", gap ? truncate(gap.prompt) : "Not found"]}
      brand={data.brand || "Workspace"}
      showDateRange={false}
      showPlatforms={false}
      exportLabel={null}
      extra={
        <>
          <Link href="/app/actions" style={{ ...EXPORT_PILL, textDecoration: "none", display: "inline-block" }}>
            {"‹ Back to queue"}
          </Link>
          {gap && (
            <ReportCsvButton filename={`${slugify(data.brand)}-gap-${gap.id}.csv`} report={gapBriefReport(data, gap)} style={EXPORT_PILL}>
              {"Export brief"}
            </ReportCsvButton>
          )}
        </>
      }
    />
  );

  if (!gap) {
    return (
      <div className="frame-p2-action-detail" style={{ flex: "1", display: "flex", flexDirection: "column", minWidth: 0 }}>
        {topbar}
        <div style={{ padding: "24px" }}>
          {!data.configured ? (
            <SetupNotice />
          ) : !data.hasData ? (
            <CollectingNotice prompts={data.promptsTracked} />
          ) : (
            <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "22px 24px" }}>
              <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{"This action isn't in the queue"}</div>
              <div style={{ fontSize: "12.5px", color: "var(--mut)", lineHeight: 1.6, marginTop: "6px", maxWidth: "72ch" }}>
                {`Actions are derived from the latest sampled run of each tracked prompt, so a row exists only while its gap does. Either this prompt is no longer tracked, or the latest answers now name ${data.brand || "your brand"} ahead of every tracked competitor.`}
              </div>
              <Link href="/app/actions" style={backLink}>
                {"Back to the queue →"}
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  const kind = KIND_STYLE[gap.kind];

  return (
    <div className="frame-p2-action-detail" style={{ flex: "1", display: "flex", flexDirection: "column", minWidth: 0 }}>
      {topbar}
      <div style={{ flex: "1", display: "flex" }}>
        <div style={{ flex: "1", padding: "28px 32px", display: "flex", flexDirection: "column", gap: "22px", minWidth: "0" }}>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 600, letterSpacing: "-0.01em" }}>{gap.title}</div>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "10px", fontWeight: 600, borderRadius: "4px", padding: "2px 7px", ...kind }}>{kindLabel(gap.kind)}</span>
              <span style={CHIP}>{`${enginesLabel(gap.providersAnswered).toUpperCase()} ANSWERED`}</span>
              <span style={CHIP}>{`LAST RUN ${fmtDateTime(gap.ts).toUpperCase()}`}</span>
              <Hint text="Everything here comes from that one sampled run" size={12} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: "13.5px", fontWeight: 600 }}>{"The prompt"}</div>
            <div style={{ fontSize: "13px", color: "var(--mut)", lineHeight: "1.7", marginTop: "8px", maxWidth: "640px", padding: "10px 12px", background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "8px" }}>
              {gap.prompt}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 600 }}>{"What the answers show"}</div>
              <Hint text="Observed in the latest run — nothing projected" />
            </div>
            <div style={{ fontSize: "13px", color: "var(--mut)", lineHeight: "1.7", marginTop: "8px", maxWidth: "640px" }}>{gap.evidence}</div>
            {gap.competitorsMentioned.length > 0 && (
              <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                {gap.competitorsMentioned.map((c) => (
                  <span key={c} style={{ ...CHIP, fontSize: "11px", fontWeight: 500, padding: "4px 9px" }}>{c}</span>
                ))}
              </div>
            )}
          </div>

          {gap.excerpt && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ fontSize: "13.5px", fontWeight: 600 }}>{"Sampled answer — excerpt"}</div>
                <Hint text="The opening of a real answer we received" />
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--mut)", lineHeight: "1.7", marginTop: "8px", maxWidth: "640px", padding: "13px 15px", background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "9px" }}>
                {gap.excerpt}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "640px" }}>
            <NotAvailablePanel
              compact
              heading="Implementation steps aren't generated yet"
              requires="Turning a gap into steps needs a remediation engine that reads your site; the pipeline records what the answers said and nothing about your pages."
            />
            <NotAvailablePanel
              compact
              heading="Per-prompt sources aren't available yet"
              requires="Citations are counted across the whole workspace rather than per prompt, so no source list can be attributed to this one."
            />
          </div>
        </div>

        <div style={{ width: "340px", flex: "none", borderLeft: "1px solid var(--brd)", background: "var(--bg1)", padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <KpiCard
            label="Rank in latest answers"
            value={gap.kind === "missing" ? "Not named" : rankLabel(gap.rank)}
            hint="How early your brand is named in the answer"
            sub={`${enginesLabel(gap.providersAnswered)} answered · ${fmtDateTime(gap.ts)}`}
          />
          <div style={{ borderTop: "1px solid var(--brd)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--fnt)" }}>
                {"Gap"}
                <Hint text="Not named at all, or named after a rival" />
              </span>
              <span style={{ fontWeight: 500 }}>{gap.kind === "missing" ? "Not named" : "Named after a rival"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <span style={{ color: "var(--fnt)" }}>{"Competitors named"}</span>
              <span style={{ fontWeight: 500 }}>{gap.competitorsMentioned.length ? gap.competitorsMentioned.join(", ") : "none"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <span style={{ color: "var(--fnt)" }}>{"Sampled history"}</span>
              <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}>{historyLabel(data.days)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <span style={{ color: "var(--fnt)" }}>{"Queue position"}</span>
              <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--mut)" }}>
                {`${data.gaps.findIndex((g) => g.id === gap.id) + 1} of ${data.gaps.length}`}
              </span>
            </div>
          </div>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
            <NewActionButton
              defaultTitle={gap.title}
              label="Save to action queue"
              style={{ textAlign: "center", fontSize: "13px", fontWeight: 500, borderRadius: "7px", padding: "10px 0", border: "none", cursor: "pointer", fontFamily: "inherit" }}
            />
            <div style={{ fontSize: "10.5px", color: "var(--fnt)", lineHeight: 1.5 }}>
              {"Saves a titled action to this workspace. Statuses beyond that aren't tracked yet, so none are shown."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
