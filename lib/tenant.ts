import { cookies } from "next/headers";
import { AUTH_COOKIE, sessionUser } from "@/lib/auth";
import { GATE_COOKIE, isUnlocked } from "@/lib/gate";

/* Which workspace a request is acting on.
 *
 * Signup has always minted a workspace id for every account (lib/auth →
 * User.workspaceId). Nothing read it. Every store wrote to one global key —
 * one workspace record at id "active", one Redis list of sampled answers, one
 * set of sentiment rows — so a person who signed up and onboarded their own
 * brand landed in a dashboard full of somebody else's data, and saving their
 * brand would have overwritten it.
 *
 * This module is the one place that answers "whose data is this request
 * about", and every store scopes its keys by what it returns.
 *
 * Three kinds of caller:
 *   a signed-in account  → its own workspace, empty until it onboards
 *   the shared demo gate → the demo workspace, which is the tracked showcase
 *   anyone else          → NO_WORKSPACE_ID, which holds no data at all
 *
 * It fails CLOSED. Resolution never falls back to the demo workspace, because
 * falling back there hands one tenant another tenant's brand. Signup sets the
 * demo gate cookie alongside the session cookie (app/api/auth/signup), and that
 * gate cookie is STATELESS and lasts 30 days — so an account whose session
 * record is missing or expired stays past the /app guard while no longer
 * resolving to a user. Under the old fall-through that request landed in the
 * demo workspace and was shown another brand's data. It now resolves to
 * NO_WORKSPACE_ID, so the screens render their honest not-set-up state.
 *
 * An account's session therefore wins outright when both cookies are present:
 * the presence of the auth cookie, not its validity, decides that this is an
 * account request rather than a demo one. */

/** The workspace the passphrase-only demo shows. */
export const DEMO_WORKSPACE_ID = "active";

/**
 * The dataless sentinel: a real, legal workspace id that deliberately holds
 * nothing.
 *
 * Every unresolved request gets this instead of the demo workspace. It is a
 * legal `scopeKey` suffix and a legal `isWorkspaceId` value, so stores namespace
 * it like any other tenant and simply find empty collections. It is RESERVED:
 * nothing may ever write a workspace record under it, which is what makes
 * `getWorkspace(NO_WORKSPACE_ID)` return null. The leading underscore keeps it
 * out of the space `newId("ws")` can mint (`ws_…`), so no account can ever be
 * issued this id.
 */
export const NO_WORKSPACE_ID = "_none";

/** Data written before workspaces were scoped lives under the demo id. */
export const LEGACY_WORKSPACE_ID = DEMO_WORKSPACE_ID;

export interface Tenant {
  workspaceId: string;
  /** how the request was identified */
  via: "account" | "demo" | "none";
  userId?: string;
  email?: string;
}

/** The unresolved tenant. Not a constant object — callers must not mutate it. */
function noTenant(): Tenant {
  return { workspaceId: NO_WORKSPACE_ID, via: "none" };
}

/**
 * Resolve the tenant from request cookies.
 *
 * Request-scoped: only valid where `cookies()` is (server components, route
 * handlers). Background work — cron, the sampler, scripts — has no request, so
 * it must be given a workspace id explicitly rather than calling this.
 *
 * The four cases, exhaustively:
 *   auth cookie present, resolves to a user → that user's workspace, "account"
 *   auth cookie present, does NOT resolve   → NO_WORKSPACE_ID, "none"
 *   no auth cookie, demo gate unlocked      → the demo workspace, "demo"
 *   neither                                 → NO_WORKSPACE_ID, "none"
 */
export async function currentTenant(): Promise<Tenant> {
  let jar: Awaited<ReturnType<typeof cookies>>;
  try {
    jar = await cookies();
  } catch {
    // Outside a request (a build-time render, a background job). There is no
    // caller to attribute, so there is no data to show.
    return noTenant();
  }

  // PRESENCE, not truthiness. An auth cookie sent as an empty string is still
  // an account request that failed to identify itself, and `if (token)` treated
  // it as absent — which dropped it into the demo branch and handed it the demo
  // brand's data.
  const authCookie = jar.get(AUTH_COOKIE);
  if (authCookie !== undefined) {
    const user = await sessionUser(authCookie.value).catch(() => null);
    if (user && isWorkspaceId(user.workspaceId)) {
      return { workspaceId: user.workspaceId, via: "account", userId: user.id, email: user.email };
    }
    /* An auth cookie that does not resolve — expired session, session record
       lost with the in-memory store, a user record without a usable workspace
       id — is an ACCOUNT request that failed to identify itself. It must not
       inherit the demo workspace just because signup also left a 30-day gate
       cookie behind. Fail closed. */
    return noTenant();
  }

  if (isUnlocked(jar.get(GATE_COOKIE)?.value)) {
    return { workspaceId: DEMO_WORKSPACE_ID, via: "demo" };
  }

  return noTenant();
}

/** The workspace id for the current request. */
export async function currentWorkspaceId(): Promise<string> {
  return (await currentTenant()).workspaceId;
}

/**
 * The tenant when the request is authorized to touch workspace data, else null.
 *
 * "Authorized" means identified: a valid account session, or the shared demo
 * passphrase. Route handlers use this instead of checking the gate cookie by
 * hand, so an account session is accepted on its own merit and an unresolvable
 * one is rejected rather than quietly served the demo workspace.
 */
export async function authorizedTenant(): Promise<Tenant | null> {
  const tenant = await currentTenant();
  return tenant.via === "none" ? null : tenant;
}

/**
 * Namespace a storage key by workspace.
 *
 * The demo workspace keeps the unsuffixed key so everything collected before
 * workspaces were scoped stays exactly where it is and keeps rendering.
 *
 * Anything that is not a well-formed workspace id — an empty string most of
 * all, which `??` chains do not catch — is treated as the dataless sentinel and
 * gets its own suffixed namespace. It must never collapse onto the demo's
 * unsuffixed key: that is how a caller with no identity ends up reading, and
 * writing, the demo brand's data.
 */
export function scopeKey(base: string, workspaceId: string): string {
  const id = isWorkspaceId(workspaceId) ? workspaceId : NO_WORKSPACE_ID;
  return id === DEMO_WORKSPACE_ID ? base : `${base}:${id}`;
}

/** Accept only a plausible workspace id from untrusted input. */
export function isWorkspaceId(v: unknown): v is string {
  return typeof v === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(v);
}

/**
 * Coerce any candidate id to one that is safe to scope by.
 *
 * Use this wherever a workspace id arrives from a `??` chain, a query string or
 * a stored record: an empty or malformed value becomes the dataless sentinel,
 * never the demo workspace.
 */
export function safeWorkspaceId(v: unknown): string {
  return isWorkspaceId(v) ? v : NO_WORKSPACE_ID;
}

/**
 * True when a workspace record may be created or updated under this id.
 *
 * The sentinel is reserved and must stay empty — `getWorkspace` returning null
 * for it is the whole reason unresolved callers see an honest not-set-up state
 * instead of someone else's brand.
 */
export function isWritableWorkspaceId(v: unknown): v is string {
  return isWorkspaceId(v) && v !== NO_WORKSPACE_ID;
}
