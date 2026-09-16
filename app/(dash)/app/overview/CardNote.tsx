/* The honest in-card states this screen falls back to.

   Three of them, matching the three states the live metrics layer reports:
   not configured, configured but no runs yet, and "has data but not enough of
   it" (a trend that needs a second sampled day). None of them draws a number.
   Styling is the card interior the frame already uses — dimmed body text on the
   card's own background — so the layout is unchanged. */

export default function CardNote({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        border: "1px dashed var(--brd)",
        borderRadius: "8px",
        background: "var(--bg0)",
        padding: "16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
      }}
    >
      <div style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--tx)" }}>{title}</div>
      <div style={{ fontSize: "11.5px", color: "var(--mut)", lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}
