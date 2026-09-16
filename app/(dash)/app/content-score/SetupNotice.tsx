import Link from "next/link";

/* No workspace configured — there is not even a prompt set to grade a draft
   against.

   This is a real statement about this deployment's state rather than an
   illustration, so it sits OUTSIDE <LockedPreview> and carries no figures. (It
   used to live in ./NotAvailable, which the illustrative preview replaced.)

   Card chrome matches every other panel in the dashboard (bg1 / brd / radius 10). */

const panel: React.CSSProperties = {
  background: "var(--bg1)",
  border: "1px solid var(--brd)",
  borderRadius: "10px",
  padding: "22px 24px",
};
const title: React.CSSProperties = { fontSize: "14.5px", fontWeight: 600 };
const body: React.CSSProperties = {
  fontSize: "12.5px",
  color: "var(--mut)",
  lineHeight: 1.6,
  marginTop: "6px",
  maxWidth: "72ch",
};
const link: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 500,
  color: "var(--ac)",
  textDecoration: "none",
};
const linkBlock: React.CSSProperties = { ...link, marginTop: "12px", display: "inline-block" };

export default function SetupNotice() {
  return (
    <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={panel}>
        <div style={title}>Set up your brand to start collecting data</div>
        <div style={body}>
          A content score would grade a draft against the answers sampled for your tracked prompts. No workspace exists
          yet, so there is no brand, no prompt set and no sampled answer to grade anything against. No estimated figures
          are shown.
        </div>
        <Link href="/onboarding/brand" style={linkBlock}>
          Set up your brand →
        </Link>
        <span style={{ ...linkBlock, color: "var(--fnt)", marginLeft: "14px" }}>
          or open{" "}
          <Link href="/app/settings" style={link}>
            Settings
          </Link>
        </span>
      </div>
    </div>
  );
}
