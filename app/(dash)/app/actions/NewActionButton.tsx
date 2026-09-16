"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

/* "+ New action" — the real write path.

   It used to fire a toast saying creating an action "needs a live workspace".
   It doesn't: /api/actions persists an action for this workspace (durably once
   a KV key is set). So the button opens a small form and posts it.

   Impact starts EMPTY and stays the user's own words. Nothing in the sampling
   pipeline projects the effect of a fix, so a prefilled estimate would be an
   invented number — the field says as much underneath. */

const FIELD = {
  width: "100%",
  background: "var(--bg0)",
  border: "1px solid var(--brd)",
  borderRadius: "7px",
  padding: "8px 10px",
  fontSize: "12.5px",
  color: "var(--tx)",
  fontFamily: "inherit",
} as const;
const LABEL = {
  fontSize: "10px",
  fontWeight: 500,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color: "var(--fnt)",
  display: "block",
  marginBottom: "5px",
} as const;

const EFFORTS = ["S", "M", "L"];

export default function NewActionButton({
  defaultTitle = "",
  label = "+ New action",
  className = "btn-ac",
  style,
}: {
  /** prefill when the action is raised from a specific observed gap */
  defaultTitle?: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [impact, setImpact] = useState("");
  const [effort, setEffort] = useState("M");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function save() {
    const t = title.trim();
    if (!t) {
      toast("Give the action a title first.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: t, impact: impact.trim(), effort }),
      });
      const data = (await res.json()) as { ok: boolean; total?: number; durable?: boolean; error?: string };
      if (data.ok) {
        toast(
          `“${t}” saved — ${data.total} action${data.total === 1 ? "" : "s"} in the queue.` +
            (data.durable ? "" : " Stored in memory until you add a KV key."),
        );
        setOpen(false);
        setTitle(defaultTitle);
        setImpact("");
        router.refresh();
      } else {
        toast(data.error ?? "Could not save the action.");
      }
    } catch {
      toast("Could not reach the server to save the action.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
        style={
          style ?? {
            fontSize: "12.5px",
            fontWeight: 500,
            borderRadius: "7px",
            padding: "6px 14px",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }
        }
      >
        {label}
      </button>
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(5,5,8,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="New action"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "520px", maxHeight: "88vh", overflowY: "auto", background: "var(--bg1)", border: "1px solid var(--brd)", borderRadius: "12px", padding: "22px", boxShadow: "0 30px 80px rgba(0,0,0,.5)", textAlign: "left" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 600 }}>{"New action"}</div>
                <div style={{ fontSize: "12px", color: "var(--fnt)", marginTop: "4px", lineHeight: 1.5 }}>
                  {"Saved to this workspace's action queue."}
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                style={{ color: "var(--fnt)", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "14px", fontFamily: "inherit", lineHeight: 1 }}
              >
                {"✕"}
              </button>
            </div>

            <div style={{ marginTop: "16px" }}>
              <label style={LABEL} htmlFor="new-action-title">{"Title"}</label>
              <input id="new-action-title" value={title} onChange={(e) => setTitle(e.target.value)} style={FIELD} placeholder="What needs to change" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
              <div>
                <label style={LABEL} htmlFor="new-action-impact">{"Your impact estimate"}</label>
                <input
                  id="new-action-impact"
                  value={impact}
                  placeholder="optional"
                  onChange={(e) => setImpact(e.target.value)}
                  style={{ ...FIELD, fontVariantNumeric: "tabular-nums" }}
                />
              </div>
              <div>
                <label style={LABEL} htmlFor="new-action-effort">{"Effort"}</label>
                <select id="new-action-effort" value={effort} onChange={(e) => setEffort(e.target.value)} style={FIELD}>
                  {EFFORTS.map((e2) => (
                    <option key={e2} value={e2}>{e2}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ fontSize: "10.5px", color: "var(--fnt)", marginTop: "8px", lineHeight: 1.5 }}>
              {"Impact is left for you to estimate — Answr doesn't project the effect of an action, so it never prefills one."}
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
              <button
                type="button"
                className="btn-ac"
                onClick={save}
                disabled={saving}
                style={{ flex: 1, textAlign: "center", fontSize: "12.5px", fontWeight: 500, borderRadius: "7px", padding: "9px 0", border: "none", cursor: saving ? "default" : "pointer", fontFamily: "inherit", opacity: saving || !title.trim() ? 0.6 : 1 }}
              >
                {saving ? "Saving…" : "Save action"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{ flex: 1, textAlign: "center", fontSize: "12.5px", fontWeight: 500, color: "var(--tx)", background: "transparent", border: "1px solid var(--brd)", borderRadius: "7px", padding: "9px 0", cursor: "pointer", fontFamily: "inherit" }}
              >
                {"Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
