// Frame → TSX converter.
// Extracts every frame (top-level div with id + data-screen-label) from a .dc.html
// canvas, strips canvas furniture (caption bar), and emits:
//   staging/<canvas>/<frame-id>.tsx   — default-export React component, styles inline
//   staging/<canvas>/<frame-id>.css   — hover rules collected from style-hover attrs
// Anchors (#frame-id) are rewritten to app routes via tools/routes.mjs.
//
// Usage: node tools/convert.mjs <input.dc.html> <canvas-key>

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseFragment } from "parse5";
import { ALL_ROUTES } from "./routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const [, , inputPath, canvasKey] = process.argv;
if (!inputPath || !canvasKey) {
  console.error("usage: node tools/convert.mjs <input.dc.html> <canvas-key>");
  process.exit(1);
}

const src = readFileSync(inputPath, "utf8");
const dcMatch = /<x-dc(?:\s[^>]*)?>([\s\S]*?)<\/x-dc>/.exec(src);
if (!dcMatch) throw new Error("no <x-dc> canvas found");
const frag = parseFragment(dcMatch[1]);

// ---------- helpers ----------

const SVG_ATTR_MAP = {
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-opacity": "strokeOpacity",
  "stroke-miterlimit": "strokeMiterlimit",
  "fill-opacity": "fillOpacity",
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
  "clip-path": "clipPath",
  "font-size": "fontSize",
  "font-weight": "fontWeight",
  "font-family": "fontFamily",
  "letter-spacing": "letterSpacing",
  "text-anchor": "textAnchor",
  "dominant-baseline": "dominantBaseline",
  "alignment-baseline": "alignmentBaseline",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "shape-rendering": "shapeRendering",
  "vector-effect": "vectorEffect",
  "gradientunits": "gradientUnits",
  "gradienttransform": "gradientTransform",
  "patternunits": "patternUnits",
  "patterntransform": "patternTransform",
  "preserveaspectratio": "preserveAspectRatio",
  viewbox: "viewBox",
  "xml:space": "xmlSpace",
};

// split a style string on ';' at paren depth 0
function splitDecls(style) {
  const out = [];
  let depth = 0,
    cur = "";
  for (const ch of style) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === ";" && depth === 0) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function cssPropToJs(prop) {
  if (prop.startsWith("--")) return prop; // CSS custom property: keep as-is
  let p = prop.trim();
  if (p.startsWith("-webkit-")) { const r = p.slice(8).replace(/-([a-z])/g, (_, c) => c.toUpperCase()); p = "Webkit" + r.charAt(0).toUpperCase() + r.slice(1); }
  else if (p.startsWith("-moz-")) { const r = p.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase()); p = "Moz" + r.charAt(0).toUpperCase() + r.slice(1); }
  else p = p.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  return p.charAt(0) === "W" || p.charAt(0) === "M" ? p : p.charAt(0).toLowerCase() + p.slice(1);
}

function styleToObject(style) {
  const entries = [];
  for (const decl of splitDecls(style)) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop || !val) continue;
    const jsProp = cssPropToJs(prop);
    const key = jsProp.startsWith("--") ? JSON.stringify(jsProp) : /^[A-Za-z$_][A-Za-z0-9$_]*$/.test(jsProp) ? jsProp : JSON.stringify(jsProp);
    entries.push(`${key}:${JSON.stringify(val)}`);
  }
  return `{${entries.join(",")}}`;
}

function isWhitespaceText(t) {
  return /^\s*$/.test(t);
}

// ---------- per-frame emission ----------

let hoverRules; // reset per frame
let hoverCount;

function emitNode(node, indent) {
  if (node.nodeName === "#text") {
    const t = node.value;
    if (isWhitespaceText(t)) {
      return t.includes("\n") ? "" : t === "" ? "" : `{" "}`;
    }
    return `{${JSON.stringify(t)}}`;
  }
  if (node.nodeName === "#comment") return "";
  if (!node.tagName) return "";

  const tag = node.tagName;
  const attrs = [];
  const classNames = [];
  let routeHref = null;
  let isInternalLink = false;

  for (const a of node.attrs ?? []) {
    const name = a.name;
    const value = a.value;
    if (name === "style") {
      attrs.push(`style={${styleToObject(value)}}`);
    } else if (name === "style-hover") {
      hoverCount++;
      const cls = `hv${hoverCount}`;
      classNames.push(cls);
      hoverRules.push(`.FRAME_SCOPE .${cls}:hover{${value}}`);
    } else if (name === "class") {
      classNames.push(...value.split(/\s+/).filter(Boolean));
    } else if (name === "href" && tag === "a") {
      if (value.startsWith("#")) {
        const target = value.slice(1);
        if (ALL_ROUTES[target]) {
          routeHref = ALL_ROUTES[target];
          isInternalLink = true;
        } else {
          attrs.push(`href=${JSON.stringify(value)}`); // in-page anchor, keep
        }
      } else if (/\.dc\.html/.test(value)) {
        // cross-canvas link: "Answr Dashboard.dc.html#login" etc.
        const m = /#(.+)$/.exec(value);
        const target = m ? m[1] : null;
        if (target && ALL_ROUTES[target]) {
          routeHref = ALL_ROUTES[target];
          isInternalLink = true;
        } else {
          routeHref = "/";
          isInternalLink = true;
        }
      } else {
        attrs.push(`href=${JSON.stringify(value)}`);
      }
    } else if (name === "id" || name === "data-screen-label") {
      // drop frame identity attrs; pages own identity now
    } else if (SVG_ATTR_MAP[name]) {
      attrs.push(`${SVG_ATTR_MAP[name]}=${JSON.stringify(value)}`);
    } else if (/^[a-zA-Z-]+$/.test(name)) {
      const jsxName = name.includes("-") && !name.startsWith("data-") && !name.startsWith("aria-")
        ? name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
        : name;
      attrs.push(`${jsxName}=${JSON.stringify(value)}`);
    }
  }

  if (isInternalLink) attrs.unshift(`href=${JSON.stringify(routeHref)}`);
  if (classNames.length) attrs.push(`className=${JSON.stringify(classNames.join(" "))}`);

  const outTag = isInternalLink ? "Link" : tag;
  const attrStr = attrs.length ? " " + attrs.join(" ") : "";

  const kids = (node.childNodes ?? [])
    .map((c) => emitNode(c, indent + "  "))
    .filter(Boolean);

  const VOID = new Set(["br", "hr", "img", "input", "path", "circle", "rect", "line", "polyline", "polygon", "ellipse", "stop", "use"]);
  if (kids.length === 0) {
    return `<${outTag}${attrStr} />`;
  }
  if (VOID.has(tag)) return `<${outTag}${attrStr} />`;
  return `<${outTag}${attrStr}>${kids.join("")}</${outTag}>`;
}

// ---------- walk canvas ----------

function findFrames(root) {
  const frames = [];
  for (const top of root.childNodes ?? []) {
    walk(top);
  }
  function walk(node) {
    if (!node.tagName) return;
    const attrs = Object.fromEntries((node.attrs ?? []).map((a) => [a.name, a.value]));
    if (attrs.id && attrs["data-screen-label"] !== undefined) {
      frames.push({ id: attrs.id, label: attrs["data-screen-label"], node });
      return; // don't descend into frames
    }
    for (const c of node.childNodes ?? []) walk(c);
  }
  return frames;
}

function stripCaption(frameNode) {
  // canvas furniture: first element child with uppercase micro-label styling
  const kids = (frameNode.childNodes ?? []).filter((n) => n.tagName || (n.nodeName === "#text" && !isWhitespaceText(n.value)));
  const els = kids.filter((n) => n.tagName);
  if (els.length >= 2) {
    const first = els[0];
    const style = (first.attrs ?? []).find((a) => a.name === "style")?.value ?? "";
    if (/text-transform:\s*uppercase/.test(style) && /letter-spacing/.test(style)) {
      return els.slice(1);
    }
  }
  return els;
}

const outDir = join(__dirname, "..", "staging", canvasKey);
mkdirSync(outDir, { recursive: true });

const frames = findFrames(frag);
const manifest = [];
for (const f of frames) {
  hoverRules = [];
  hoverCount = 0;
  const roots = stripCaption(f.node);
  const body = roots.map((r) => emitNode(r, "  ")).join("\n");
  const scopeClass = `frame-${f.id}`;
  const css = hoverRules.map((r) => r.replaceAll(".FRAME_SCOPE", `.${scopeClass}`)).join("\n");
  const needsLink = body.includes("<Link ");
  const tsx = `${needsLink ? 'import Link from "next/link";\n' : ""}import "./${f.id}.css";

/* ${f.label} — auto-converted from canvas frame #${f.id}. */
export default function Frame() {
  return (
    <div className="${scopeClass}">
      ${roots.length > 1 ? `<>${body}</>` : body}
    </div>
  );
}
`;
  writeFileSync(join(outDir, `${f.id}.tsx`), tsx);
  writeFileSync(join(outDir, `${f.id}.css`), css + "\n");
  manifest.push({ id: f.id, label: f.label, hoverRules: hoverRules.length, bytes: tsx.length });
}
writeFileSync(join(outDir, "_manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`${canvasKey}: ${frames.length} frames staged → ${outDir}`);
for (const m of manifest) console.log(`  ${m.id.padEnd(22)} ${String(m.bytes).padStart(7)}B  hover:${m.hoverRules}  ${m.label}`);
