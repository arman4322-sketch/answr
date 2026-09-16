import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { getWorkspace } from "@/lib/workspace";
import { ToastButton, Toggle } from "../DemoControls";
import SettingsRail from "../SettingsRail";
import { EmptyState, NoBrandPanel, brandLabel, slugify } from "../states";

/* Settings — Data quality.

   The only citation tag this deployment can state as fact is the workspace's
   own domain: that is what lib/live/metrics uses to split owned from earned
   citations. Competitor and community tags, alias lists, the matching regex and
   the extraction instructions have no store behind them, so each says so rather
   than shipping a worked example. The entity-mapping blurb that used to live in
   the instructions box (disambiguating a brand from its namesake) went with the
   rest of the fixture. */

export const metadata: Metadata = {
  title: "Data quality — Settings",
};

export const dynamic = "force-dynamic";

const NOT_WIRED = "Data-quality rules have no store yet — nothing here is saved.";

const card: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "16px",
};

const field: React.CSSProperties = {
  background: "var(--bg0)",
  border: "1px solid var(--brd)",
  borderRadius: "7px",
  padding: "9px 12px",
  fontSize: "12px",
  color: "var(--mut)",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export default async function DataQualityPage() {
  const ws = await getWorkspace();
  const brand = brandLabel(ws?.brand);
  const slug = slugify(ws?.brand) || "workspace";

  /* Tag rows are derived, never fixture: the owned domain is the one tag the
     scoring layer actually applies. */
  const tagRows: string[][] = [
    ["Domain", "Tag", "Subpaths inherit"],
    ...(ws?.domain ? [[ws.domain, "OWNED", "on"]] : []),
  ];
  const hasTags = tagRows.length > 1;

  return (
    <>
      <Topbar
        crumb={["Settings", "Data quality"]}
        brand={brand}
        rangeNote="Data-quality rules are current settings, not a reported window. The date range re-slices Overview, Insights, Citations and Agent Analytics."
        platformNote="Data-quality rules apply to every platform — they aren't split by the platform filter."
        exportLabel={hasTags ? "Export" : null}
        exportFilename={`${slug}-data-quality.csv`}
        exportRows={hasTags ? tagRows : undefined}
        exportWindow="Citation tag rules as currently configured — settings, not a date window"
        actionNote="Nothing to export — no citation tags are configured yet."
      />
      <div className="frame-m-quality" style={{ flex: "1", display: "flex" }}>
        <SettingsRail />
        <div style={{ flex: "1", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {!ws ? (
            <NoBrandPanel what="Citation tags and matching rules describe a brand, and none is configured yet." />
          ) : (
            <>
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>{"Citation tags"}<Hint text="Labels saying who owns each website" /></div>
                <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>{"classify domains so the owned/earned mix stays accurate · subpaths inherit the tag when on"}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginTop: "12px", fontSize: "12.5px" }}>
                  {ws.domain ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "var(--bg0)", border: "1px solid var(--brd)", borderRadius: "7px" }}>
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>{ws.domain}</span>
                      <span style={{ fontSize: "9.5px", fontWeight: "600", color: "#b3a7f8", background: "rgba(142,124,242,0.16)", borderRadius: "4px", padding: "2px 6px" }}>{"OWNED"}</span>
                      <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--mut)" }}>{"subpaths"}<Hint text="Give sub-pages the same label" size={12} align="right" /></span>
                      <Toggle label={`Toggle subpath inheritance for ${ws.domain}`} note={NOT_WIRED} />
                    </div>
                  ) : (
                    <EmptyState
                      line="No owned domain set."
                      note="Citations can only be split into owned and earned once the workspace names a domain."
                    />
                  )}
                  <EmptyState
                    line="No other domains tagged."
                    note="Competitor and community tags are not stored yet, so every domain outside your own counts as earned."
                  />
                  <ToastButton
                    note={NOT_WIRED}
                    style={{
                      fontSize: "11.5px",
                      color: "var(--fnt)",
                      border: "1px dashed var(--brd)",
                      borderRadius: "7px",
                      padding: "8px 12px",
                      background: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                    }}
                  >
                    {"+ tag a domain"}
                  </ToastButton>
                </div>
              </div>
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>{"Matching rules"}<Hint text="How we spot your brand in text" /></div>
                <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>{`how Answr recognizes ${ws.brand} in answer text`}</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px", alignItems: "center" }}>
                  {/* The brand name is the one term the scorer really matches on. */}
                  <span
                    style={{
                      fontSize: "11.5px",
                      background: "var(--bg2)",
                      border: "1px solid var(--brd)",
                      borderRadius: "5px",
                      padding: "4px 9px",
                      color: "var(--tx)",
                    }}
                  >
                    {ws.brand}
                  </span>
                  <span style={{ fontSize: "11.5px", color: "var(--fnt)" }}>{"— the brand name, matched on word boundaries. No aliases configured."}</span>
                  <ToastButton
                    note={NOT_WIRED}
                    style={{ fontSize: "11.5px", color: "var(--fnt)", border: "1px dashed var(--brd)", borderRadius: "5px", padding: "4px 9px", background: "none", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {"+ alias"}
                  </ToastButton>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "500" }}>{"Advanced: regular expression"}<Hint text="A search pattern for tricky name matches" size={12} /></span>
                  <Toggle label="Toggle regular-expression matching" note={NOT_WIRED} defaultOn={false} />
                </div>
                <input
                  aria-label="Regular expression"
                  defaultValue=""
                  placeholder="No pattern saved — matching falls back to the brand name"
                  style={{ ...field, marginTop: "8px", fontVariantNumeric: "tabular-nums" }}
                />
                <div style={{ marginTop: "12px" }}>
                  <label htmlFor="extraction-instructions" style={{ display: "block", fontSize: "12px", fontWeight: "500" }}>
                    {"Extraction instructions "}
                    <Hint text="Plain notes telling us what counts" size={12} />
                    <span style={{ fontSize: "10.5px", color: "var(--fnt)", fontWeight: "400", marginLeft: "6px", fontVariantNumeric: "tabular-nums" }}>{"max 500 characters"}</span>
                  </label>
                  <textarea
                    id="extraction-instructions"
                    rows={3}
                    maxLength={500}
                    defaultValue=""
                    placeholder="None saved. Notes here would tell the scorer what to count — for example which meaning of an ambiguous brand name qualifies."
                    style={{ ...field, marginTop: "7px", lineHeight: "1.6", resize: "vertical", display: "block" }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
