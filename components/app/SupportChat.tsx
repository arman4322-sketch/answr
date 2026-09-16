"use client";

import { useEffect, useState } from "react";

/* Support panel — opened from the small floating "?" launcher (bottom-right).

   Sale-readiness pass: this panel used to open on a scripted conversation — a
   crawler question the user never asked, an agent reply diagnosing a robots.txt
   rule, and a link to an action number that does not exist — plus a send box
   whose "reply" was a setTimeout. Nothing was ever sent anywhere.

   There is no support desk wired to this deployment. No help-desk provider, no
   inbox, no chat routing, and no verified support mailbox: the only support
   address in the tree (app/not-found.tsx) is on answr.io, which ASSETS_IP.md
   lists as an unconfirmed domain, so linking it here would promise a route that
   may bounce. /api/lead is marketing lead capture, not support, and its email
   notification is a no-op unless RESEND_API_KEY and LEAD_NOTIFY_EMAIL are set —
   neither is. So the panel states the situation and carries no message box:
   an input that discards what is typed is worse than no input. */

export default function SupportChat() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Open support"
        className="btn-ac"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: "28px",
          bottom: "24px",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "none",
          fontSize: "16px",
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 10px 30px rgba(0,0,0,.5)",
          zIndex: 94,
        }}
      >
        {"?"}
      </button>
    );
  }

  return (
    <div role="dialog" aria-label="Support" style={{ position: "fixed", right: "28px", bottom: "24px", width: "330px", zIndex: 95 }}>
      <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "12px", boxShadow: "0 30px 80px rgba(0,0,0,.5)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "12px 16px", borderBottom: "1px solid var(--brd)" }}>
          <div>
            <div style={{ fontSize: "12.5px", fontWeight: 600 }}>{"Support"}</div>
            <div style={{ fontSize: "10px", color: "var(--fnt)" }}>{"Not connected"}</div>
          </div>
          <button
            type="button"
            aria-label="Close support"
            onClick={() => setOpen(false)}
            style={{ marginLeft: "auto", background: "transparent", border: "none", color: "var(--fnt)", fontSize: "12px", cursor: "pointer", padding: "2px 4px", lineHeight: 1, fontFamily: "inherit" }}
          >
            {"✕"}
          </button>
        </div>
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "12px", lineHeight: "1.6", color: "var(--tx)" }}>
            {"No support channel is connected to this deployment."}
          </div>
          <div style={{ fontSize: "11.5px", lineHeight: "1.6", color: "var(--mut)" }}>
            {"There is no help desk, support inbox or chat routing configured here, so this panel cannot send a message and none is offered. Contact whoever operates this instance directly."}
          </div>
        </div>
      </div>
    </div>
  );
}
