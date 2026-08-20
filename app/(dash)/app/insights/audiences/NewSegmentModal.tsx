"use client";

import { useEffect, useRef, useState } from "react";
import { generatePromptSet, INTENT_COLORS, type GeneratedPrompt } from "@/lib/data/audiences";

/* "+ New segment" flow (INTERACTIVITY_CONVENTIONS playbook 3 + 9): the dashed
   card on Audiences opens this dialog. Describe an audience → "Generate prompt
   set" thinks for ~700ms → 8 prompts derived from what was typed, in Nike's
   category, each tagged with the intent it expresses → "Add segment" appends a
   real (pending-first-run) segment card to the page.

   Dismissal: ✕, Cancel, Esc, backdrop click. */

const PLACEHOLDER =
  "e.g. trail runners in cold, wet climates who train four times a week and care about grip and waterproofing";

export default function NewSegmentModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (description: string, prompts: GeneratedPrompt[]) => void;
}) {
  const [description, setDescription] = useState("");
  const [thinking, setThinking] = useState(false);
  const [prompts, setPrompts] = useState<GeneratedPrompt[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Reset whenever the dialog is reopened, and stop any in-flight "thinking". */
  useEffect(() => {
    if (open) return;
    if (timer.current) clearTimeout(timer.current);
    setDescription("");
    setThinking(false);
    setPrompts(null);
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  if (!open) return null;

  function generate() {
    const text = description.trim();
    if (text.length < 8) {
      setError("Describe the audience in a sentence — who they are and what they care about.");
      return;
    }
    setError(null);
    setPrompts(null);
    setThinking(true);
    timer.current = setTimeout(() => {
      setPrompts(generatePromptSet(text));
      setThinking(false);
    }, 700);
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(5,5,8,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New audience segment"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "620px",
          maxWidth: "100%",
          maxHeight: "86vh",
          overflowY: "auto",
          background: "var(--bg2)",
          border: "1px solid var(--brd)",
          borderRadius: "12px",
          padding: "22px",
          boxShadow: "0 30px 80px rgba(0,0,0,.6)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "15px", fontWeight: 600 }}>{"New segment"}</span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{ color: "var(--fnt)", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "inherit", fontFamily: "inherit", lineHeight: 1 }}
          >
            {"✕"}
          </button>
        </div>
        <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "4px", lineHeight: 1.5 }}>
          {"Describe an audience in your own words — Answr writes the prompt set it would run for them every day."}
        </div>

        <label
          htmlFor="segment-description"
          style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "var(--fnt)", marginTop: "16px", marginBottom: "6px" }}
        >
          {"Audience description"}
        </label>
        <textarea
          id="segment-description"
          autoFocus
          rows={3}
          value={description}
          onChange={(e) => { setDescription(e.target.value); if (error) setError(null); }}
          placeholder={PLACEHOLDER}
          style={{
            width: "100%",
            resize: "vertical",
            background: "var(--bg0)",
            border: `1px solid ${error ? "#e5636e" : "var(--brd)"}`,
            borderRadius: "8px",
            padding: "10px 12px",
            fontSize: "12.5px",
            lineHeight: 1.55,
            color: "var(--tx)",
            fontFamily: "inherit",
            outline: "none",
          }}
        />
        {error && <div style={{ fontSize: "11.5px", color: "#e5636e", marginTop: "6px" }}>{error}</div>}

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
          <button
            type="button"
            className="btn-ac"
            onClick={generate}
            disabled={thinking}
            style={{ fontSize: "12.5px", fontWeight: 500, borderRadius: "7px", padding: "8px 14px", border: "none", cursor: thinking ? "progress" : "pointer", fontFamily: "inherit", opacity: thinking ? 0.7 : 1 }}
          >
            {thinking ? "Generating…" : prompts ? "Regenerate prompt set" : "Generate prompt set"}
          </button>
          <span style={{ fontSize: "11.5px", color: "var(--fnt)" }}>
            {"Prompt sets rerun daily like any tracked prompt."}
          </span>
        </div>

        {thinking && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{ height: "34px", borderRadius: "7px", background: "var(--bg1)", border: "1px solid var(--brd)", opacity: 0.55 }}
              />
            ))}
          </div>
        )}

        {prompts && !thinking && (
          <>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "18px" }}>
              <span style={{ fontSize: "12.5px", fontWeight: 600 }}>{"Generated prompt set"}</span>
              <span style={{ fontSize: "10.5px", color: "var(--fnt)", fontVariantNumeric: "tabular-nums" }}>
                {`${prompts.length} prompts · running shoes / training apparel`}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "9px" }}>
              {prompts.map((p) => {
                const c = INTENT_COLORS[p.intent] ?? INTENT_COLORS.Support;
                return (
                  <div
                    key={p.text}
                    style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--bg0)", border: "1px solid var(--brd)", borderRadius: "7px", padding: "9px 11px", fontSize: "12px", lineHeight: 1.45 }}
                  >
                    <span style={{ flex: 1, color: "var(--mut)" }}>{`"${p.text}"`}</span>
                    <span style={{ fontSize: "10px", fontWeight: 600, color: c.fg, background: c.bg, borderRadius: "4px", padding: "2px 6px", flex: "none" }}>
                      {p.intent}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
          <button
            type="button"
            className="btn-ac"
            disabled={!prompts || thinking}
            onClick={() => prompts && onAdd(description.trim(), prompts)}
            style={{ flex: 1, textAlign: "center", fontSize: "12.5px", fontWeight: 500, borderRadius: "7px", padding: "9px 0", border: "none", cursor: !prompts || thinking ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: !prompts || thinking ? 0.45 : 1 }}
          >
            {"Add segment"}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, textAlign: "center", fontSize: "12.5px", fontWeight: 500, color: "var(--tx)", background: "transparent", border: "1px solid var(--brd)", borderRadius: "7px", padding: "9px 0", cursor: "pointer", fontFamily: "inherit" }}
          >
            {"Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
