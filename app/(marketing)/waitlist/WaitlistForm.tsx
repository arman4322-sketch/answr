"use client";

import { useState } from "react";

/* Waitlist capture — a real demand-validation tool. Persists to /api/lead with
   source "waitlist" (durable once storage is configured; visible in
   Settings › Leads). Point campaign traffic here to measure interest before
   launch. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source: "waitlist", email: email.trim(), company: company.trim() }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) setDone(true);
      else {
        setError(data.error ?? "Something went wrong.");
        setBusy(false);
      }
    } catch {
      setError("Could not reach the server.");
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div role="status" style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "12px", padding: "28px", textAlign: "center" }}>
        <div style={{ fontSize: "17px", fontWeight: 600 }}>
          <span style={{ color: "var(--ac)", marginRight: "8px" }}>✓</span>You're on the list.
        </div>
        <div style={{ fontSize: "13.5px", color: "var(--mut)", marginTop: "8px", lineHeight: 1.6, maxWidth: "440px", margin: "8px auto 0" }}>
          We'll email <strong>{email.trim()}</strong> when Answr opens. No spam, no sales follow-up unless you ask.
        </div>
      </div>
    );
  }

  const input: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    border: `1px solid ${error ? "var(--bad)" : "var(--brd)"}`,
    borderRadius: "8px",
    background: "var(--bg0)",
    padding: "12px 14px",
    fontSize: "14px",
    color: "var(--tx)",
    fontFamily: "inherit",
  };

  return (
    <form onSubmit={submit} noValidate style={{ display: "grid", gap: "10px", maxWidth: "440px", margin: "0 auto" }}>
      <input
        type="email"
        aria-label="Work email"
        placeholder="you@company.com"
        autoComplete="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError(null); }}
        style={input}
      />
      <input
        type="text"
        aria-label="Company or domain (optional)"
        placeholder="Company or domain (optional)"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        style={{ ...input, border: "1px solid var(--brd)" }}
      />
      {error && <div role="alert" style={{ fontSize: "12px", color: "var(--bad)" }}>{error}</div>}
      <button type="submit" disabled={busy} className="btn-ac" style={{ fontSize: "14px", fontWeight: 600, borderRadius: "8px", padding: "12px 0", border: "none", cursor: busy ? "default" : "pointer", fontFamily: "inherit", opacity: busy ? 0.7 : 1 }}>
        {busy ? "Joining…" : "Join the waitlist →"}
      </button>
      <div style={{ fontSize: "11.5px", color: "var(--fnt)", textAlign: "center" }}>Early access · no card required · unsubscribe anytime</div>
    </form>
  );
}
