import Link from "next/link";

/* No workspace yet — there is nothing for a rule to watch in the first place.

   This is the only non-preview panel Workflows renders: it is a real statement
   about this deployment's state, not an illustration, so it sits OUTSIDE
   <LockedPreview> and carries no figures. (It used to live in ./NotAvailable,
   which the illustrative preview replaced.)

   Card chrome matches the rest of the dashboard (bg1 / brd / radius 10). */

const panel: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "22px 24px",
};
const heading: React.CSSProperties = { fontSize: "14.5px", fontWeight: 600 };
const body: React.CSSProperties = {
  fontSize: "12.5px",
  color: "var(--mut)",
  lineHeight: 1.6,
  marginTop: "6px",
  maxWidth: "72ch",
};

export default function SetupNotice() {
  return (
    <div style={panel}>
      <div style={heading}>Set up your brand to start collecting data</div>
      <div style={body}>
        A workflow would watch what AI assistants say about your brand. No brand, domain or prompt set is configured on
        this deployment, so nothing is being sampled and there is nothing for a rule to react to.
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
        <Link
          href="/onboarding/brand"
          className="btn-ac"
          style={{ fontSize: "12.5px", fontWeight: 500, borderRadius: "7px", padding: "7px 14px" }}
        >
          Set up brand
        </Link>
        <Link
          href="/app/settings"
          style={{
            fontSize: "12.5px",
            fontWeight: 500,
            color: "var(--mut)",
            background: "rgba(255,255,255,0.045)",
            borderRadius: "7px",
            padding: "7px 14px",
          }}
        >
          Settings
        </Link>
      </div>
    </div>
  );
}
