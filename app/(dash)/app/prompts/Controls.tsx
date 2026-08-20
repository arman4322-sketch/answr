"use client";

import { toast } from "@/lib/toast";
import { buildExecutiveCsv, csvBlob, wrapRows } from "@/lib/export/report";

/* Prompts fixture rows + topbar controls. The Export pill downloads the
   visible fixture table as a real CSV (playbook 1, keeping the frame's muted
   pill styling); "+ Add prompts" opens the real add-prompts modal, which lives
   in AddPromptsModal.tsx (it owns its own trigger button, same as the Citations
   export modal). */

export type PromptRow = {
  prompt: string;
  intent: "COMMERCIAL" | "INFORMATIONAL" | "BRANDED";
  volume: string;
  visibility: string;
  position: string;
};

export const PROMPT_ROWS: PromptRow[] = [
  { prompt: "best running shoes for marathon training", intent: "COMMERCIAL", volume: "High", visibility: "78%", position: "1.4" },
  { prompt: "how do runners choose shoes for long distances", intent: "INFORMATIONAL", volume: "High", visibility: "54%", position: "2.1" },
  { prompt: "Nike vs Adidas running shoes", intent: "BRANDED", volume: "Med", visibility: "96%", position: "1.1" },
  { prompt: "training apparel with moisture-wicking fabric", intent: "COMMERCIAL", volume: "Med", visibility: "61%", position: "1.8" },
  { prompt: "is the Nike Pegasus worth it for a first marathon", intent: "BRANDED", volume: "Med", visibility: "92%", position: "1.0" },
  { prompt: "alternatives to carbon-plate racing shoes", intent: "INFORMATIONAL", volume: "Med", visibility: "31%", position: "3.6" },
  { prompt: "how to recycle worn-out running shoes", intent: "INFORMATIONAL", volume: "Low", visibility: "18%", position: "4.2" },
  { prompt: "top basketball shoes 2026", intent: "COMMERCIAL", volume: "High", visibility: "44%", position: "2.9" },
];

export const PROMPT_CSV_HEADER = ["Prompt", "Intent", "Volume", "Visibility", "Position"];

export function promptRowToCsv(r: PromptRow): string[] {
  return [r.prompt, r.intent, r.volume, r.visibility, r.position];
}

/* Prompts exports used to ship a bare table — no header, so the file never said
   what window its Visibility / Position columns cover. They now go through the
   same executive envelope as every other export, which states the reporting
   window on the file itself (lib/export/report.ts). The Prompts screen hides
   both topbar filters, so there is no workspace selection to reconcile. */
const PROMPTS_WINDOW = "Last 30 days (Jul 7 – Aug 5, 2026) — visibility and position per prompt";

export function downloadCsv(filename: string, rows: string[][], sectionTitle = "Tracked prompts") {
  const csv = buildExecutiveCsv(
    wrapRows(rows, { module: "Prompts", brand: "Nike", window: PROMPTS_WINDOW, sectionTitle })
  );
  const blob = csvBlob(csv);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast(`Downloaded ${filename} — ${rows.length - 1} rows.`);
}

export function ExportPromptsButton() {
  return (
    <button
      type="button"
      onClick={() => downloadCsv("nike-prompts-30d.csv", [PROMPT_CSV_HEADER, ...PROMPT_ROWS.map(promptRowToCsv)])}
      style={{fontSize:"12px",fontWeight:500,color:"var(--mut)",background:"rgba(255,255,255,0.045)",borderRadius:"7px",padding:"6px 12px",border:"none",cursor:"pointer",fontFamily:"inherit"}}
    >
      {"Export 412 prompts"}
    </button>
  );
}
