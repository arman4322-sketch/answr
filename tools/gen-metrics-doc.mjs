// Generates METRICS.md from lib/metrics.ts (regex-parsed; the TS file is canonical).
// Usage: node tools/gen-metrics-doc.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "lib/metrics.ts"), "utf8");

const entries = [];
const re = /(\w+):\s*\{\s*label:\s*"([^"]+)",\s*definition:\s*("(?:[^"\\]|\\.)*"),\s*source:\s*("(?:[^"\\]|\\.)*"),\s*calculation:\s*("(?:[^"\\]|\\.)*"),\s*cadence:\s*"([^"]+)",\s*unit:\s*"(\w+)"/gs;
const unq = (s) => JSON.parse(s.replace(/\s*\n\s*/g, " "));
let m;
while ((m = re.exec(src))) {
  entries.push({ id: m[1], label: m[2], definition: unq(m[3]), source: unq(m[4]), calculation: unq(m[5]), cadence: m[6], unit: m[7] });
}

let md = `# Answr — Metrics dictionary

What every number in the dashboard means, where its real data comes from once
production pipelines are connected, and how it is calculated. Generated from
\`lib/metrics.ts\` (canonical) by \`tools/gen-metrics-doc.mjs\` — the same entries
power the ⓘ popovers on the dashboard's KPI cards.

The demo workspace (Solara) ships fixture values; every fixture number is chosen
to be internally consistent with these definitions.

`;
for (const e of entries) {
  md += `## ${e.label}\n\n_${e.definition}_\n\n- **Source:** ${e.source}\n- **Calculation:** ${e.calculation}\n- **Cadence:** ${e.cadence}\n- **Dictionary id:** \`${e.id}\` · unit: ${e.unit}\n\n`;
}
writeFileSync(join(root, "METRICS.md"), md);
console.log(`METRICS.md written — ${entries.length} metrics`);
