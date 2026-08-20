"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "@/lib/toast";

/* Demo credential gate — no backend. The demo workspace accepts
   dana@nike.com / answr-demo; anything else shows the field-error state.

   The OAuth-style buttons follow INTERACTIVITY_CONVENTIONS playbook 10 (toast
   pointing at the credential login). Toasts render via the Toaster mounted in
   the (auth) layout. */


const OAUTH_TOAST = "This demo uses the credential login below — dana@nike.com / answr-demo.";

const oauthBtn: React.CSSProperties = {
  border: "1px solid var(--brd)",
  borderRadius: "8px",
  padding: "10px 0",
  textAlign: "center",
  fontSize: "13px",
  fontWeight: "500",
  background: "var(--bg2)",
  color: "var(--tx)",
  fontFamily: "inherit",
  cursor: "pointer",
  width: "100%",
};

export default function LoginForm() {
  const [email, setEmail] = useState("dana@nike.com");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const next = useSearchParams().get("next") || "/app/overview";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (r.ok) {
        // Full navigation, not router.push: the gate cookie was just set and the
        // proxy must see it on the next request.
        window.location.assign(next);
      } else {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "That email and password don't match.");
      }
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="frame-login">
      <div style={{ width: "100%", maxWidth: "380px", background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "12px", padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: "linear-gradient(135deg,#a394ff,#6d5ce6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#fff" }}>
            A
          </div>
          <div style={{ fontSize: "17px", fontWeight: 600 }}>Answr</div>
        </div>
        <div style={{ fontSize: "19px", fontWeight: 600, marginTop: "24px" }}>Welcome back</div>
        <div style={{ fontSize: "13px", color: "var(--mut)", marginTop: "5px" }}>Log in to your workspace.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "22px" }}>
          <button type="button" style={oauthBtn} onClick={() => toast(OAUTH_TOAST)}>Continue with Google</button>
          <button type="button" style={oauthBtn} onClick={() => toast(OAUTH_TOAST)}>Continue with SSO / SAML</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--brd)" }} />
          <span style={{ fontSize: "10.5px", fontVariantNumeric: "tabular-nums", color: "var(--fnt)" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "var(--brd)" }} />
        </div>
        <form onSubmit={submit} noValidate>
          <label htmlFor="login-email" style={{ display: "block", fontSize: "10.5px", fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "var(--fnt)" }}>
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            autoComplete="email"
            style={{ display: "block", width: "100%", boxSizing: "border-box", border: `1px solid ${error ? "var(--bad)" : "var(--brd)"}`, borderRadius: "8px", background: "var(--bg0)", padding: "10px 12px", fontSize: "13px", color: "var(--tx)", fontFamily: "inherit", marginTop: "7px" }}
          />
          <label htmlFor="login-password" style={{ display: "block", fontSize: "10.5px", fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "var(--fnt)", marginTop: "14px" }}>
            Password
          </label>
          <div style={{ border: `1px solid ${error ? "var(--bad)" : "var(--ac)"}`, borderRadius: "8px", background: "var(--bg0)", padding: "10px 12px", fontSize: "13px", marginTop: "7px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
            <input
              id="login-password"
              name="password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              placeholder="Your password"
              autoComplete="current-password"
              style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", padding: 0, fontSize: "13px", color: "var(--tx)", fontFamily: "inherit", outline: "none" }}
            />
            <button type="button" onClick={() => setShow(!show)} style={{ color: "var(--fnt)", fontSize: "12px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
              {show ? "Hide" : "Show"}
            </button>
          </div>
          {error && (
            <div role="alert" style={{ fontSize: "12px", color: "var(--bad)", marginTop: "10px", lineHeight: 1.5 }}>
              {error}
            </div>
          )}
          <button type="submit" className="btn-ac" disabled={busy} style={{ display: "block", width: "100%", textAlign: "center", fontSize: "13px", fontWeight: 600, borderRadius: "8px", padding: "11px 0", marginTop: "20px", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            {busy ? "Signing in…" : "Log in"}
          </button>
        </form>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", fontSize: "12px" }}>
          <Link href="/reset-password">Forgot password?</Link>
          <span style={{ color: "var(--mut)" }}>
            No account? <Link href="/signup">Sign up</Link>
          </span>
        </div>
        <div style={{ borderTop: "1px solid var(--brd)", marginTop: "20px", paddingTop: "14px", fontSize: "11.5px", color: "var(--fnt)", lineHeight: 1.6, fontVariantNumeric: "tabular-nums" }}>
          Demo workspace — <span style={{ color: "var(--mut)" }}>dana@nike.com</span> · password <span style={{ color: "var(--mut)" }}>answr-demo</span>
        </div>
      </div>
    </div>
  );
}
