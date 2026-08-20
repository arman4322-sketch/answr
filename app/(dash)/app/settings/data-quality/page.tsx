import type { Metadata } from "next";
import Topbar from "@/components/app/Topbar";
import Hint from "@/components/ui/Hint";
import { ToastButton, Toggle } from "../DemoControls";
import SettingsRail from "../SettingsRail";

/* Settings — Data quality (frame #m-quality). */

export const metadata: Metadata = {
  title: "Data quality — Settings",
};

const QUALITY_NOTE = "Data-quality settings apply on live workspaces.";

/* Citation-tag fixture table, downloaded by the Topbar export. */
const TAG_ROWS: string[][] = [
  ["Domain", "Tag", "Subpaths inherit"],
  ["nike.com", "OWNED", "on"],
  ["adidas.com", "COMPETITOR", "on"],
  ["reddit.com", "COMMUNITY", "off"],
];

export default function DataQualityPage() {
  return (
    <>
      <Topbar
        crumb={["Settings", "Data quality"]}
        rangeNote="Data-quality rules are current settings, not a reported window. The date range re-slices Overview, Insights, Citations and Agent Analytics."
        platformNote="Data-quality rules apply to every platform — they aren't split by the platform filter."
        exportFilename="nike-data-quality.csv"
        exportRows={TAG_ROWS}
        exportWindow="Citation tag rules as configured on Aug 5, 2026 — settings, not a date window"
      />
      <div className="frame-m-quality" style={{ flex: "1", display: "flex" }}>
        <SettingsRail />
        <div style={{ flex: "1", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>{"Citation tags"}<Hint text="Labels saying who owns each website" /></div>
            <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>{"classify domains so the owned/earned mix stays accurate · subpaths inherit the tag when on"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginTop: "12px", fontSize: "12.5px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "var(--bg0)", border: "1px solid var(--brd)", borderRadius: "7px" }}>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{"nike.com"}</span>
                <span style={{ fontSize: "9.5px", fontWeight: "600", color: "#b3a7f8", background: "rgba(142,124,242,0.16)", borderRadius: "4px", padding: "2px 6px" }}>{"OWNED"}</span>
                <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--mut)" }}>{"subpaths"}<Hint text="Give sub-pages the same label" size={12} align="right" /></span>
                <Toggle label="Toggle subpath inheritance for nike.com" note={QUALITY_NOTE} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "var(--bg0)", border: "1px solid var(--brd)", borderRadius: "7px" }}>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{"adidas.com"}</span>
                <span style={{ fontSize: "9.5px", fontWeight: "600", color: "#7fa7d9", border: "1px solid rgba(127,167,217,.35)", borderRadius: "4px", padding: "2px 6px" }}>{"COMPETITOR"}</span>
                <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--mut)" }}>{"subpaths"}<Hint text="Give sub-pages the same label" size={12} align="right" /></span>
                <Toggle label="Toggle subpath inheritance for adidas.com" note={QUALITY_NOTE} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "var(--bg0)", border: "1px solid var(--brd)", borderRadius: "7px" }}>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{"reddit.com"}</span>
                <span style={{ fontSize: "9.5px", fontWeight: "600", color: "#b98ed9", border: "1px solid rgba(185,142,217,.35)", borderRadius: "4px", padding: "2px 6px" }}>{"COMMUNITY"}</span>
                <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--mut)" }}>{"subpaths"}<Hint text="Give sub-pages the same label" size={12} align="right" /></span>
                <Toggle label="Toggle subpath inheritance for reddit.com" note={QUALITY_NOTE} defaultOn={false} />
              </div>
              <ToastButton
                note="Tagging a domain needs a live workspace — this demo is read-only."
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
                {"+ tag a domain — changes apply to new answers within ~10 minutes"}
              </ToastButton>
            </div>
          </div>
          <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "10px", padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600" }}>{"Matching rules"}<Hint text="How we spot your brand in text" /></div>
            <div style={{ fontSize: "11.5px", color: "var(--fnt)", marginTop: "3px" }}>{"how Answr recognizes Nike in answer text"}</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px" }}>
              <ToastButton
                note="Matching rules update on live workspaces — this demo is read-only."
                style={{ fontSize: "11.5px", background: "var(--bg2)", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 9px", color: "var(--tx)", cursor: "pointer", fontFamily: "inherit" }}
              >
                {"Nike ✕"}
              </ToastButton>
              <ToastButton
                note="Matching rules update on live workspaces — this demo is read-only."
                style={{ fontSize: "11.5px", background: "var(--bg2)", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 9px", color: "var(--tx)", cursor: "pointer", fontFamily: "inherit" }}
              >
                {"Nike Running ✕"}
              </ToastButton>
              <ToastButton
                note="Matching rules update on live workspaces — this demo is read-only."
                style={{ fontSize: "11.5px", background: "var(--bg2)", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 9px", color: "var(--tx)", cursor: "pointer", fontFamily: "inherit" }}
              >
                {"nikeinc ✕"}
              </ToastButton>
              <ToastButton
                note="Adding an alias needs a live workspace — this demo is read-only."
                style={{ fontSize: "11.5px", color: "var(--fnt)", border: "1px dashed var(--brd)", borderRadius: "5px", padding: "4px 9px", background: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                {"+ alias"}
              </ToastButton>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "500" }}>{"Advanced: regular expression"}<Hint text="A search pattern for tricky name matches" size={12} /></span>
              <Toggle label="Toggle regular-expression matching" note={QUALITY_NOTE} />
            </div>
            <input
              aria-label="Regular expression"
              defaultValue={"/(nike|nike\\s?inc)(\\s?(running|training))?/i"}
              style={{
                marginTop: "8px",
                background: "var(--bg0)",
                border: "1px solid var(--brd)",
                borderRadius: "7px",
                padding: "9px 12px",
                fontSize: "12px",
                color: "var(--mut)",
                fontVariantNumeric: "tabular-nums",
                width: "100%",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
            <div style={{ marginTop: "12px" }}>
              <label htmlFor="extraction-instructions" style={{ display: "block", fontSize: "12px", fontWeight: "500" }}>
                {"Extraction instructions "}
                <Hint text="Plain notes telling us what counts" size={12} />
                <span style={{ fontSize: "10.5px", color: "var(--fnt)", fontWeight: "400", marginLeft: "6px", fontVariantNumeric: "tabular-nums" }}>{"142/500"}</span>
              </label>
              <textarea
                id="extraction-instructions"
                rows={3}
                defaultValue={'Treat "Nike" the Greek goddess as a different entity — only count footwear and sportswear contexts. Map "Nike Inc" to the parent brand.'}
                style={{
                  marginTop: "7px",
                  background: "var(--bg0)",
                  border: "1px solid var(--brd)",
                  borderRadius: "7px",
                  padding: "10px 12px",
                  fontSize: "12px",
                  color: "var(--mut)",
                  lineHeight: "1.6",
                  width: "100%",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  resize: "vertical",
                  display: "block",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
