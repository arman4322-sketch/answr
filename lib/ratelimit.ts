/* Best-effort in-memory rate limiter for public AI endpoints (onboarding
   suggestions). Per-instance only — a production build would use the shared
   KV/Redis store — but it's enough to blunt casual abuse of the LLM key on a
   pre-launch demo. Fails open on a fresh instance; the provider's own free-tier
   limits are the backstop. */

const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

/** Extract a caller key from a request (best-effort IP). */
export function callerKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : "") || req.headers.get("x-real-ip") || "anon";
}
