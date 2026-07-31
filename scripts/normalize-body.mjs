#!/usr/bin/env node
/**
 * Normalización del cuerpo de las carreras (src/content/educacion).
 *
 * Alinea el cuerpo de los archivos MDX con el estándar documentado en
 * docs/content-guide.md (## Resumen / ## Ingreso / ## Plan de Estudio con
 * ### como subsecciones; ## Fuentes opcional al final).
 *
 * Las carreras de UDELAR scrapeadas del CAP usan secciones propias
 * (## Objetivo, ## Perfil de egreso, ## Programa, ...) que se mapean a los
 * tabs estándar. ## Docentes (ruido masivo de nombres) y
 * ## Departamentos donde se dicta el posgrado (redundante con `location`)
 * se descartan.
 *
 * Modo dry-run (default): imprime reporte y NO escribe nada.
 * Modo apply: `node scripts/normalize-body.mjs --apply`
 *
 * Idempotente: un segundo run no produce cambios.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let YAML;
try {
  YAML = require("yaml");
} catch {
  // pnpm store fallback
  YAML = require("/home/gabriel/dev/uruguay-labura/node_modules/.pnpm/yaml@2.8.3/node_modules/yaml");
}

const DIR = join(process.cwd(), "src/content/educacion");
const APPLY = process.argv.includes("--apply");

// Orden canónico de los tabs en el cuerpo normalizado
const TAB_ORDER = ["Resumen", "Ingreso", "Plan de Estudio", "Fuentes"];

// Mapeo sección fuente → tab destino.
//  - { tab, passThrough: true }       → contenido verbatim bajo el tab
//  - { tab, subsection }              → ### subsection bajo el tab
//  - { tab, subsection, stripPrefix } → igual + limpia prefijo "Requisitos de ingreso:"
//  - null                             → se descarta la sección
const SECTION_MAP = {
  // tabs estándar ya existentes (se conservan)
  Resumen: { tab: "Resumen", passThrough: true },
  Ingreso: { tab: "Ingreso", passThrough: true },
  "Plan de Estudio": { tab: "Plan de Estudio", passThrough: true },
  Fuentes: { tab: "Fuentes", passThrough: true },

  // estructura CAP → estándar
  Objetivo: { tab: "Resumen", subsection: "Objetivo" },
  "Perfil de egreso": { tab: "Resumen", subsection: "Perfil de egreso" },
  "Perfil del egresado": { tab: "Resumen", subsection: "Perfil de egreso" },
  "Referentes académicos": {
    tab: "Resumen",
    subsection: "Referentes académicos",
  },
  "Requisitos para postular": {
    tab: "Ingreso",
    subsection: "Requisitos de Ingreso",
  },
  Reglamento: { tab: "Ingreso", subsection: "Reglamento" },
  Programa: { tab: "Plan de Estudio", subsection: "Programa" },
  "Unidades curriculares": {
    tab: "Plan de Estudio",
    subsection: "Unidades curriculares",
  },
  // El contenido suele arrancar con "Requisitos de ingreso:/inscripción:".
  // Si arranca así → ### Requisitos de Ingreso (sin el prefijo); si no, la
  // sección se conserva como ### Información adicional dentro del tab Ingreso.
  "Información adicional": { tab: "Ingreso", dynamic: true },

  // Secciones cortas (<=600 chars, != "No corresponde") con info curada
  // (coordinadores, plantel editorial, comisiones) se conservan como
  // ### Docentes en Resumen; los muros de nombres del CAP se descartan.
  Docentes: {
    tab: "Resumen",
    subsection: "Docentes",
    maxLen: 600,
    skipIf: (c) => c.trim() === "No corresponde",
  },
  // La sección no se renderiza, pero el valor (ciudad) enriquece el campo
  // `location` del frontmatter (p. ej. "Facultad de Agronomía, Montevideo").
  "Departamentos donde se dicta el posgrado": { locationFrom: true },
};

// ── Parsing del cuerpo en secciones ───────────────────────────────────────
function splitSections(body) {
  const lines = body.split("\n");
  const sections = [];
  let current = { heading: null, lines: [] };
  for (const line of lines) {
    const m = line.match(/^## (.+)$/);
    if (m) {
      sections.push(current);
      current = { heading: m[1].trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);
  return sections;
}

// ── Render de un tab desde sus bloques ────────────────────────────────────
// Devuelve { text, insertedSobre }.
function renderTab(tabName, blocks) {
  const parts = [];
  let insertedSobre = false;
  for (const block of blocks) {
    if (block.passThrough) {
      const content = block.content.trim();
      if (content) parts.push(content);
    } else if (block.subsection) {
      const content = block.content.trim();
      if (content) parts.push(`### ${block.subsection}\n\n${content}`);
    }
  }
  let text = parts.join("\n\n");

  if (tabName === "Resumen" && text) {
    const firstLine = text.split("\n")[0];
    if (!firstLine.startsWith("### ")) {
      text = `### Sobre la Carrera\n\n${text}`;
      insertedSobre = true;
    }
  }
  return { text, insertedSobre };
}

// ── Transformación del cuerpo ─────────────────────────────────────────────
// Devuelve { body, changed, srcSections, dropped, seeded, sobreInserted,
//   merged, tabs, locationUpdate } o null si el archivo ya está normalizado.
// locationUpdate: nuevo valor de `location` (ciudad del departamento
//   universitario anexada) o null si no cambia.
function transformBody(body, doc) {
  const description = doc.description ?? "";
  const sections = splitSections(body);
  const intro = sections[0].heading === null ? sections[0].lines : [];
  const rest = sections[0].heading === null ? sections.slice(1) : sections;

  const tabs = new Map(); // tab → array de bloques
  const srcSections = [];
  const dropped = [];
  const merged = [];
  let hasLegacy = false;
  let departamento = null;

  for (const sec of rest) {
    const rule = SECTION_MAP[sec.heading];
    if (rule === undefined) {
      // heading desconocido (no debería ocurrir): se conserva como ## literal
      const t = tabs.get("__raw__") || [];
      t.push({ raw: `## ${sec.heading}\n${sec.lines.join("\n").trimEnd()}` });
      tabs.set("__raw__", t);
      srcSections.push(sec.heading);
      continue;
    }
    srcSections.push(sec.heading);

    if (rule.locationFrom) {
      departamento = sec.lines.join("\n").trim();
      dropped.push(sec.heading);
      hasLegacy = true;
      continue;
    }

    if (rule.maxLen) {
      // Docentes: se conserva solo si es una lista corta con info curada
      const content = sec.lines.join("\n").trim();
      if (rule.skipIf?.(content) || content.length > rule.maxLen) {
        dropped.push(sec.heading);
        hasLegacy = true;
        continue;
      }
      const t = tabs.get(rule.tab) || [];
      t.push({ subsection: rule.subsection, content });
      tabs.set(rule.tab, t);
      hasLegacy = true;
      continue;
    }

    if (rule === null) {
      dropped.push(sec.heading);
      hasLegacy = true;
      continue;
    }

    if (rule.passThrough) {
      const content = sec.lines.join("\n").trim();
      if (content) {
        const t = tabs.get(rule.tab) || [];
        t.push({ passThrough: true, content });
        tabs.set(rule.tab, t);
      }
      continue;
    }

    hasLegacy = true;
    let content = sec.lines.join("\n").trim();
    let subsection = rule.subsection;
    if (rule.dynamic) {
      const stripped = content.replace(
        /^Requisitos de (?:ingreso|inscripción)\s*:?\s*/i,
        "",
      );
      if (stripped !== content) {
        merged.push(sec.heading);
        content = stripped.trim();
        subsection = "Requisitos de Ingreso";
      } else {
        subsection = "Información adicional";
      }
    }

    const t = tabs.get(rule.tab) || [];
    // colisión defensiva: misma subsección → se concatena
    const last = t[t.length - 1];
    if (last && last.subsection === subsection) {
      last.content = `${last.content}\n\n${content}`;
    } else if (content) {
      t.push({ subsection, content });
    }
    tabs.set(rule.tab, t);
  }

  // `location` enriquecido con la ciudad del departamento universitario
  // (p. ej. "Facultad de Veterinaria, Paysandú") cuando no está ya presente.
  let locationUpdate = null;
  if (departamento) {
    const current = typeof doc.location === "string" ? doc.location : "";
    if (
      !current.toLowerCase().includes(departamento.toLowerCase()) &&
      departamento.trim() !== ""
    ) {
      locationUpdate = current ? `${current}, ${departamento}` : departamento;
    }
  }

  // Resumen sin contenido sustantivo (sin Objetivo/Perfil de egreso/texto
  // passthrough) → sembrar ### Sobre la Carrera desde description si existe.
  const resumenBlocks = tabs.get("Resumen") || [];
  const hasSubstance = resumenBlocks.some(
    (b) =>
      b.passThrough ||
      b.subsection === "Objetivo" ||
      b.subsection === "Perfil de egreso",
  );
  let seeded = false;
  if (!hasSubstance && description && description.trim().length > 0) {
    tabs.set("Resumen", [
      { subsection: "Sobre la Carrera", content: description.trim() },
      ...resumenBlocks,
    ]);
    seeded = true;
    hasLegacy = true;
  }

  // Necesita ## Resumen pero sin contenido posible → no se emite el tab
  if (resumenBlocks.length === 0 && !seeded) {
    tabs.delete("Resumen");
  }

  if (!hasLegacy && dropped.length === 0) return null;

  // Ensamblado
  const parts = [intro.join("\n").trimEnd()];
  let sobreInserted = 0;
  for (const tabName of TAB_ORDER) {
    const blocks = tabs.get(tabName);
    if (!blocks || blocks.length === 0) continue;
    const { text: rendered, insertedSobre } = renderTab(tabName, blocks);
    if (!rendered) continue;
    if (insertedSobre) sobreInserted++;
    parts.push(`## ${tabName}\n\n${rendered}`);
  }
  // headings desconocidos (defensivo) al final
  const raw = tabs.get("__raw__");
  if (raw) raw.forEach((r) => parts.push(r.raw));

  const newBody = parts.join("\n\n");
  const tabsSummary = TAB_ORDER.filter((t) =>
    (tabs.get(t) || []).some((b) => (b.content || "").trim()),
  ).join("|");

  return {
    body: newBody,
    changed: newBody !== body || locationUpdate !== null,
    srcSections,
    dropped,
    seeded,
    sobreInserted,
    merged,
    tabs: tabsSummary,
    locationUpdate,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────
const files = readdirSync(DIR)
  .filter((f) => f.endsWith(".mdx"))
  .sort();
let changed = 0;
let unchanged = 0;
let parseErrors = 0;
let seededTotal = 0;
let sobreTotal = 0;
const droppedCounts = {};
const mergedTotal = [];
const byPattern = new Map();
const detail = [];
const warnings = [];

for (const file of files) {
  const path = join(DIR, file);
  const raw = readFileSync(path, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) {
    warnings.push(`${file}\tNO_FRONTMATTER`);
    parseErrors++;
    continue;
  }
  const fm = m[1];
  let doc;
  try {
    doc = YAML.parse(fm);
  } catch {
    warnings.push(`${file}\tYAML_PARSE_ERROR`);
    parseErrors++;
    continue;
  }
  if (!doc || typeof doc.title !== "string") {
    warnings.push(`${file}\tPARSE_ERROR`);
    parseErrors++;
    continue;
  }

  const body = raw.slice(m[0].length);
  const result = transformBody(body, doc);

  if (!result || !result.changed) {
    unchanged++;
    continue;
  }
  changed++;
  if (result.seeded) seededTotal++;
  if (result.sobreInserted) sobreTotal++;
  result.dropped.forEach((s) => {
    droppedCounts[s] = (droppedCounts[s] || 0) + 1;
  });
  result.merged.forEach((s) => mergedTotal.push(s));

  const srcSig = result.srcSections.join("|") || "-";
  const targetSig = result.tabs;
  const key = `${srcSig}\t→\t${targetSig}`;
  byPattern.set(key, (byPattern.get(key) || 0) + 1);

  detail.push(
    `${file}\t${srcSig}\t→\t${targetSig}${result.seeded ? "\t(seed: description)" : ""}${result.locationUpdate ? `\t(location: ${result.locationUpdate})` : ""}${result.dropped.length ? `\t(drop: ${result.dropped.join(",")})` : ""}`,
  );

  if (APPLY) {
    const trailing = raw.endsWith("\n") ? "\n" : "";
    // `raw.slice(0, m[0].length)` incluye el frontmatter completo (`---\n{fm}\n---`);
    // si hay locationUpdate, se reemplaza la línea `location:` en esa porción.
    const head = result.locationUpdate
      ? raw
          .slice(0, m[0].length)
          .replace(/^(location:\s*).*$/m, `$1"${result.locationUpdate}"`)
      : raw.slice(0, m[0].length);
    writeFileSync(path, `${head}${result.body}${trailing}`, "utf8");
  }
}

// ── Reporte ───────────────────────────────────────────────────────────────
console.log(`Archivos procesados: ${files.length}`);
console.log(`Modificados: ${changed}`);
console.log(`Sin cambios (ya estándar): ${unchanged}`);
console.log(`Errores de parseo: ${parseErrors}`);
if (Object.keys(droppedCounts).length) {
  console.log(
    `Secciones descartadas: ${Object.entries(droppedCounts)
      .map(([s, c]) => `${s} (${c})`)
      .join(", ")}`,
  );
}
if (mergedTotal.length) {
  console.log(
    `Prefijo 'Requisitos de ...' limpiado en: ${mergedTotal.length} secciones`,
  );
}
console.log(`Resumen sembrado desde description: ${seededTotal}`);
console.log(`### Sobre la Carrera insertado: ${sobreTotal}`);
console.log(
  warnings.length
    ? `Advertencias:\n  ${warnings.join("\n  ")}`
    : "Advertencias: 0",
);

console.log(`\n── Por patrón (secciones origen → tabs destino) ──`);
[...byPattern.entries()]
  .sort((a, b) => b[1] - a[1])
  .forEach(([key, count]) => {
    console.log(String(count).padStart(4), key);
  });

console.log(`\n── Detalle por archivo (${detail.length}) ──`);
console.log(detail.join("\n"));

if (!APPLY) {
  console.log(
    "\n⚠️  Modo dry-run: no se escribió nada. Usá --apply para aplicar.",
  );
} else {
  console.log(`\n✅ Aplicado. ${changed} archivos modificados.`);
}
