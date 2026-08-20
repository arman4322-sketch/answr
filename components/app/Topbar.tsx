import FilterPill from "@/components/ui/FilterPill";
import ExportButton from "@/components/ui/ExportButton";
import DemoActionButton from "@/components/ui/DemoActionButton";
import type { ReportSpec } from "@/lib/export/report";
import { PLATFORM_LABELS, RANGE_LABELS } from "@/lib/filters/windows";

/* Dashboard topbar — canonical controls (audit fix C4). The date-range and
   platform pills are the workspace filters: they write to the shared
   FilterContext and really re-slice the data on wired screens (see
   lib/filters/windows.ts). Export downloads the page's data as CSV when
   `exportReport` (preferred — a full executive report: summary + trend + every
   supporting table) or `exportRows` (single table) is provided, else renders
   the plain labeled button. `exportWindow` names the window the exported ROWS
   actually cover — pass it wherever the rows are not a 30-day sample (rosters,
   key inventories, invoice history, a single scored draft) so the CSV's
   "Reporting window" header can never mislabel the file.

   Screens that cannot re-slice a filter pass `rangeLive={false}` (the default)
   / `platformLive={false}`. Those pills render INERT (audit fix — "never
   display a scope the screen does not honor"): dimmed, not-allowed, no menu,
   showing the fixed sample this screen actually reports, with a ? tooltip
   saying so. They used to be fully live-looking controls that fired a 3.6s
   toast and then left the pill claiming a window the screen never used; the
   toast is gone because the control is now permanently, visibly honest. The
   workspace selection itself is untouched and still applies on wired screens. */

const RANGE_STATIC_NOTE =
  "This screen reports the fixed 30-day sample. The date range re-slices Overview, Insights, Citations and Agent Analytics.";
const PLATFORM_STATIC_NOTE =
  "This screen is scored across all platforms. The platform filter re-slices Overview.";

export const DATE_RANGE_ITEMS = RANGE_LABELS;

export const PLATFORM_ITEMS = PLATFORM_LABELS;

export default function Topbar({
  crumb,
  extra,
  showDateRange = true,
  showPlatforms = true,
  exportLabel = "Export",
  exportFilename,
  exportRows,
  exportReport,
  exportModule,
  exportWindow,
  actionNote,
  rangeLive = false,
  platformLive = false,
  platformNote,
  rangeNote,
}: {
  crumb: string | string[];
  extra?: React.ReactNode;
  showDateRange?: boolean;
  showPlatforms?: boolean;
  /** this screen really re-slices on the date range (live pill, not inert) */
  rangeLive?: boolean;
  /** this screen really re-slices on the platform filter */
  platformLive?: boolean;
  /** tooltip on the inert platform pill — what this screen actually reports */
  platformNote?: string;
  /** tooltip on the inert date-range pill — what this screen actually reports */
  rangeNote?: string;
  exportLabel?: string | null;
  /** with exportReport/exportRows: the Export button downloads this CSV */
  exportFilename?: string;
  exportRows?: string[][];
  /** full executive report for this screen — preferred over exportRows */
  exportReport?: ReportSpec;
  /** module name for the exported report's header block */
  exportModule?: string;
  /** with exportRows: the window the ROWS actually cover, printed as the CSV's
      "Reporting window". Defaults to the 30-day sample — override on screens
      whose rows are not a 30-day window (rosters, key inventories, invoice
      history, a single scored draft) so a downloaded file is never mislabeled. */
  exportWindow?: string;
  /** toast shown when the action slot has no CSV behind it (create-style actions) */
  actionNote?: string;
}) {
  const parts = Array.isArray(crumb) ? crumb : [crumb];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 24px", borderBottom: "1px solid var(--brd)" }}>
      <div style={{ fontSize: "12.5px", color: "var(--fnt)" }}>
        Nike{" "}
        {parts.map((p, i) => (
          <span key={i}>
            <span style={{ color: "#3a3b40" }}>/</span>{" "}
            <span style={{ color: i === parts.length - 1 ? "var(--tx)" : "var(--mut)", fontWeight: i === parts.length - 1 ? 500 : 400 }}>{p}</span>{" "}
          </span>
        ))}
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
        {showDateRange && (
          <FilterPill bind="range" inert={!rangeLive} note={rangeLive ? undefined : rangeNote ?? RANGE_STATIC_NOTE} />
        )}
        {showPlatforms && (
          <FilterPill
            bind="platform"
            inert={!platformLive}
            note={platformLive ? undefined : platformNote ?? PLATFORM_STATIC_NOTE}
          />
        )}
        {extra}
        {exportLabel &&
          ((exportReport || exportRows) && exportFilename ? (
            <ExportButton
              label={exportLabel}
              filename={exportFilename}
              report={exportReport}
              rows={exportRows}
              module={exportModule ?? (Array.isArray(crumb) ? crumb[crumb.length - 1] : crumb)}
              window={exportWindow}
            />
          ) : (
            /* No fixture rows to export (or the slot is a create-style action):
               never render a dead button — say what a live workspace would do. */
            <DemoActionButton
              label={exportLabel}
              message={actionNote ?? `${exportLabel.replace(/^\+\s*/, "")} needs a live workspace — this demo is read-only.`}
            />
          ))}
      </div>
    </div>
  );
}
