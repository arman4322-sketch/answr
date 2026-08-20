"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* Support-chat panel — from canvas frame #m-surfaces. Opened from a small floating
   "?" launcher (bottom-right). Audit fix: the frame's panel had no close affordance —
   a ✕ button is added in the header.
   Send box is live (INTERACTIVITY_CONVENTIONS playbook 9): Enter appends the
   message to the thread and a canned reply lands after 600ms. "Show robots.txt"
   appends the robots.txt snippet as an assistant message. */

type Msg = { from: "user" | "bot"; text: string; mono?: boolean };

const ROBOTS_TXT = "User-agent: Googlebot\nAllow: /\n\nUser-agent: *\nDisallow: /docs";

const CANNED_REPLY =
  "Thanks — logged for the Nike workspace. A strategist will follow up within one business day.";

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [msgs]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setMsgs((m) => [...m, { from: "user", text }]);
    window.setTimeout(() => {
      setMsgs((m) => [...m, { from: "bot", text: CANNED_REPLY }]);
    }, 600);
  };

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Open support chat"
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
    <div role="dialog" aria-label="Support chat" style={{ position: "fixed", right: "28px", bottom: "24px", width: "330px", zIndex: 95 }}>
      <div style={{ background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "12px", boxShadow: "0 30px 80px rgba(0,0,0,.5)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "12px 16px", borderBottom: "1px solid var(--brd)" }}>
          <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: "linear-gradient(135deg,#a394ff,#6d5ce6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff" }}>{"A"}</div>
          <div>
            <div style={{ fontSize: "12.5px", fontWeight: 600 }}>{"Answr Assist"}</div>
            <div style={{ fontSize: "10px", color: "#4cb782" }}>{"online"}</div>
          </div>
          <button
            type="button"
            aria-label="Close support chat"
            onClick={() => setOpen(false)}
            style={{ marginLeft: "auto", background: "transparent", border: "none", color: "var(--fnt)", fontSize: "12px", cursor: "pointer", padding: "2px 4px", lineHeight: 1, fontFamily: "inherit" }}
          >
            {"✕"}
          </button>
        </div>
        <div ref={listRef} style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px", maxHeight: "320px", overflowY: "auto" }}>
          <div style={{ alignSelf: "flex-end", maxWidth: "85%", background: "var(--bg2)", border: "1px solid var(--brd)", borderRadius: "10px 10px 3px 10px", padding: "9px 12px", fontSize: "12px", lineHeight: "1.5" }}>
            {"why did ClaudeBot get blocked on /docs?"}
          </div>
          <div style={{ alignSelf: "flex-start", maxWidth: "90%", background: "var(--bg0)", border: "1px solid var(--brd)", borderRadius: "10px 10px 10px 3px", padding: "9px 12px", fontSize: "12px", lineHeight: "1.6", color: "var(--mut)" }}>
            {"Your robots.txt disallows /docs for all agents except Googlebot. Action "}
            <span style={{ color: "var(--tx)" }}>{"#87"}</span>
            {" has the one-line fix — want me to open it?"}
          </div>
          <div style={{ alignSelf: "flex-start", display: "flex", gap: "6px" }}>
            <Link
              href="/app/actions"
              onClick={() => setOpen(false)}
              style={{ fontSize: "11px", color: "var(--ac)", border: "1px solid color-mix(in oklab,var(--ac) 40%,transparent)", borderRadius: "5px", padding: "4px 9px" }}
            >
              {"Open action #87"}
            </Link>
            <button
              type="button"
              onClick={() => setMsgs((m) => [...m, { from: "bot", text: ROBOTS_TXT, mono: true }])}
              style={{ fontSize: "11px", color: "var(--mut)", border: "1px solid var(--brd)", borderRadius: "5px", padding: "4px 9px", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}
            >
              {"Show robots.txt"}
            </button>
          </div>
          {msgs.map((m, i) =>
            m.from === "user" ? (
              <div key={i} style={{ alignSelf: "flex-end", maxWidth: "85%", background: "var(--bg2)", border: "1px solid var(--brd)", borderRadius: "10px 10px 3px 10px", padding: "9px 12px", fontSize: "12px", lineHeight: "1.5" }}>
                {m.text}
              </div>
            ) : (
              <div
                key={i}
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "90%",
                  background: "var(--bg0)",
                  border: "1px solid var(--brd)",
                  borderRadius: "10px 10px 10px 3px",
                  padding: "9px 12px",
                  fontSize: m.mono ? "11px" : "12px",
                  lineHeight: "1.6",
                  color: "var(--mut)",
                  fontFamily: m.mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined,
                  whiteSpace: m.mono ? "pre-wrap" : undefined,
                }}
              >
                {m.text}
              </div>
            )
          )}
        </div>
        <div style={{ marginTop: "auto", display: "flex", gap: "8px", alignItems: "center", padding: "12px 16px", borderTop: "1px solid var(--brd)", fontSize: "12px", color: "var(--fnt)" }}>
          <span>{"⊕"}</span>
          <input
            aria-label="Message Answr Assist"
            placeholder="Message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
            style={{ flex: 1, fontSize: "12px", color: "var(--tx)", background: "transparent", border: "none", outline: "none", fontFamily: "inherit", padding: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
