import { ImageResponse } from "next/og";

/* Default Open Graph / social share image (Next.js native). Renders a branded
   1200×630 card so links to useanswr.com no longer preview blank. Pages can
   override with their own opengraph-image if needed. */
export const runtime = "nodejs";
export const alt = "Answr — Answer Engine Optimization";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0e0f11 0%, #17161f 55%, #241f3a 100%)",
          padding: "72px",
          color: "#f4f4f6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "#8e7cf2",
              color: "#0e0f11",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "34px",
              fontWeight: 800,
            }}
          >
            A
          </div>
          <div style={{ fontSize: "30px", fontWeight: 700, letterSpacing: "-0.02em" }}>Answr</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: "66px", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, maxWidth: "900px" }}>
            Know what AI says about your brand.
          </div>
          <div style={{ fontSize: "28px", color: "#b7b7c2", maxWidth: "860px", lineHeight: 1.4 }}>
            Monitor ChatGPT, Claude, Gemini, Perplexity &amp; AI Overviews — and win the answers your buyers see.
          </div>
        </div>
        <div style={{ display: "flex", gap: "14px", fontSize: "22px", color: "#8e7cf2", fontWeight: 600 }}>
          <span>Answer Engine Optimization</span>
          <span style={{ color: "#4a4a55" }}>·</span>
          <span style={{ color: "#b7b7c2" }}>useanswr.com</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
