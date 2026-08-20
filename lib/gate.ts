/* Demo access gate.

   This build is a pitch asset, not a multi-tenant product: there is no user
   database and no per-account identity. What it needs is simply that the
   dashboard is not browsable by direct URL and not indexable — the marketing
   site stays public, since showing it is the point.

   So: one shared passphrase, verified server-side, stored as an HTTP-only
   cookie. The passphrase lives in DEMO_PASSWORD (set it in Vercel to rotate);
   the fallback keeps local development frictionless.

   Do NOT mistake this for authentication. It has no accounts, no per-user
   sessions and no authorization. Anyone with the passphrase sees everything.
   Real auth is Phase 3 of READINESS.md and needs an identity provider. */

export const GATE_COOKIE = "answr_demo_access";
export const DEMO_EMAIL = "dana@nike.com";

/** The shared passphrase. Override per environment via DEMO_PASSWORD. */
export function demoPassword(): string {
  return process.env.DEMO_PASSWORD || "answr-demo";
}

/** Opaque-ish cookie value derived from the passphrase, so a stale cookie
    stops working the moment the passphrase is rotated. */
export function gateToken(): string {
  return Buffer.from(`answr:${demoPassword()}`).toString("base64url");
}

export function isUnlocked(cookieValue: string | undefined): boolean {
  return !!cookieValue && cookieValue === gateToken();
}

/** Paths the gate protects. Marketing, auth screens and the capture endpoints
    stay open — crawlers must still reach public pages for telemetry to mean
    anything. */
export function isGated(pathname: string): boolean {
  return pathname.startsWith("/app");
}
