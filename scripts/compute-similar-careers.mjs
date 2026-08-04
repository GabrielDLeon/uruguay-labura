#!/usr/bin/env node
/**
 * Generación automática de carreras similares (campo `similar`) para
 * src/content/careers.
 *
 * Objetivo: que TODAS las carreras apunten a otras realmente relacionadas,
 * sin mantenimiento manual. Estrategia híbrida:
 *
 *  1. SEÑAL PRIMARIA → tags: se exige al menos un tag compartido (piso de
 *     relación real). Los tags ya son un vocabulario curado y confiable.
 *  2. REFINAMIENTO → tokens del título y de la descripción con ponderación
 *     IDF: los tokens raros compartidos (p. ej. "cardiologia", "robotica")
 *     pesan mucho más que los comunes. Discrimina dentro de disciplinas
 *     amplias: "cardiología" se vincula a "cardiología pediátrica" y no a
 *     "dermatología".
 *  3. TIEBREAKERS → misma `area` (contexto), mismo `degreeType` y un bonus
 *     leve de diversidad cross-institución.
 *
 * Para cada carrera se eligen las N (por defecto 3) más similares con un
 * score mínimo. La relación es direccional top-N (consistente con la
 * convención actual).
 *
 * Modo dry-run (default): imprime reporte y NO escribe nada.
 * Modo apply: `node scripts/compute-similar-careers.mjs --apply`
 *
 * Escribe SOLO el bloque `similar:` (sustituyéndolo si existe o insertándolo
 * después de `short:`/`title:` si no). El resto del frontmatter queda
 * byte-idéntico.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let YAML;
try {
  YAML = require("yaml");
} catch {
  YAML = require(
    "/home/gabriel/dev/uruguay-labura/node_modules/.pnpm/yaml@2.8.3/node_modules/yaml",
  );
}

const DIR = join(process.cwd(), "src/content/careers");
const APPLY = process.argv.includes("--apply");

// ── Parámetros (ajustables) ────────────────────────────────────────────────
const TOP_N = 6; // máx. de similares por carrera (no fuerza a llenar; toma hasta N que pasen el filtro)
const MIN_THRESHOLD = 2.4; // score mínimo para sugerir (≈ un tag compartido)

// ── Normalización ──────────────────────────────────────────────────────────
const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Palabras "de relleno" del título: sin señal disciplinar útil.
const STOPWORDS = new Set([
  "de", "la", "el", "en", "los", "las", "del", "al", "y", "o", "a", "con",
  "por", "para", "su", "e", "un", "una", "de-la", "de-el",
  // nivel / tipo de grado (no discrimina disciplina)
  "especializacion", "maestria", "licenciatura", "tecnicatura", "tecnologo",
  "carrera", "diploma", "doctorado", "ciclo", "curso", "posgrado", "master",
  "universitario", "universitaria", "superior", "tecnico", "grado", "area",
  "programa", "fundamentos", "en-el", "aplicada", "aplicado", "introduccion",
  "taller", "taller-de", "nuevo",
]);

// Palabras de relleno para `description` (texto libre más ruidoso).
const DESC_STOPWORDS = new Set([
  ...STOPWORDS, "titulo", "titulos", "formacion", "formar", "formando", "carrera",
  "universidad", "universitaria", "estudiantes", "estudiante", "modalidad",
  "presencial", "virtual", "hibrida", "curso", "cursos", "creditos", "anos",
  "gratuita", "gratuito", "contar", "cuenta", "brindar", "brinda", "ofrece",
  "ofrecen", "objetivo", "objetivos", "permitir", "permite", "permiten",
  "través", "traves", "parte", "medio", "nivel", "niveles", "grado", "area",
  "derecho", "fecha", "ingreso", "plan", "estudio", "estudios", "materias",
  "asignaturas", "final", "egresados", "egresado", "profesional", "profesionales",
  "laboral", "campo", "desempeño", "desempeno", "disciplina", "cientifica",
  "cientifico", "conocimientos", "conocimiento", "habilidades", "competencias",
  "preparar", "prepara", "habilita", "habilitar", "habilitados", "amplia",
  "amplio", "todos", "todas", "cada", "más", "mas", "muy", "ser", "son",
  "tener", "tiene", "pueden", "puede", "desde", "hasta", "entre", "sobre",
  "también", "tambien", "así", "asi", "como", "tanto", "este", "esta",
  "podrá", "podran", "podrá", "incluye", "incluyen", "incluso", "además",
  "ademas", "requiere", "requieren", "se", "al", "lo", "le", "les", "sus",
  // instituciones / geografía (no discriminan disciplina)
  "udelar", "ort", "utec", "uruguay", "republica", "montevideo", "universidad-de-la-republica",
]);

function significantTokens(title) {
  const tokens = new Set();
  for (const w of norm(title).split(/[^a-z0-9]+/)) {
    if (w && !STOPWORDS.has(w)) tokens.add(w);
  }
  return tokens;
}

// Tokens significativos de la descripción (texto libre, se filtra más).
function descriptionTokens(desc) {
  const tokens = new Set();
  for (const w of norm(desc).split(/[^a-z0-9]+/)) {
    if (w && !DESC_STOPWORDS.has(w)) tokens.add(w);
  }
  return tokens;
}

// ── Carga ──────────────────────────────────────────────────────────────────
const files = readdirSync(DIR).filter((f) => f.endsWith(".mdx")).sort();
const careers = [];
for (const file of files) {
  const path = join(DIR, file);
  const raw = readFileSync(path, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) continue;
  let doc;
  try {
    doc = YAML.parse(m[1]);
  } catch {
    continue;
  }
  if (!doc || typeof doc.title !== "string") continue;
  const slug = file.replace(/\.mdx$/, "");
  careers.push({
    slug,
    file,
    title: doc.title,
    short: doc.short,
    tags: new Set((doc.tags ?? []).map((t) => String(t))),
    area: doc.area ?? "",
    degreeType: doc.degreeType ?? "",
    institution: doc.institution ?? "",
    draft: !!doc.draft,
    tokens: significantTokens(doc.title),
    descTokens: descriptionTokens(doc.description ?? ""),
    raw,
    fm: m[1],
  });
}

// Se procesan TODAS las carreras (draft o no): el campo `similar` es dato
// puro del frontmatter y debe quedar listo aunque el flag `draft` cambie
// luego. El render ya filtra drafts en [slug].astro.
const N = careers.length;

// ── IDF por token (título y descripción por separado) ─────────────────────
const df = new Map();
const dfDesc = new Map();
for (const c of careers) {
  for (const t of c.tokens) df.set(t, (df.get(t) || 0) + 1);
  for (const t of c.descTokens) dfDesc.set(t, (dfDesc.get(t) || 0) + 1);
}
const idf = (t) => Math.log((N + 1) / ((df.get(t) || 0) + 1));
const idfDesc = (t) => Math.log((N + 1) / ((dfDesc.get(t) || 0) + 1));

// ── Similitud entre dos carreras ───────────────────────────────────────────
function similarity(a, b) {
  if (a.slug === b.slug) return -1;
  let score = 0;

  // señal primaria
  let shared = 0;
  for (const t of a.tags) if (b.tags.has(t)) shared++;
  score += 2.5 * shared;

  // tiebreakers
  if (a.area && a.area === b.area) score += 0.7;
  if (a.degreeType && a.degreeType === b.degreeType) score += 0.2;
  // diversidad: bonus leve si son de instituciones distintas
  if (a.institution && b.institution && a.institution !== b.institution) score += 0.3;

  // refinamiento por token del título
  let tokenScore = 0;
  for (const t of a.tokens) if (b.tokens.has(t)) tokenScore += idf(t);
  score += tokenScore;

  // refinamiento por descripción (peso menor: texto libre, más ruido)
  let descScore = 0;
  for (const t of a.descTokens) if (b.descTokens.has(t)) descScore += idfDesc(t);
  score += descScore * 0.6;

  return { score, shared };
}

// ── Cálculo de sugerencias ─────────────────────────────────────────────────
const plan = new Map(); // slug -> [ {slug, score} ]
for (const a of careers) {
  let candidates = [];
  for (const b of careers) {
    if (a.slug === b.slug) continue;
    const { score, shared } = similarity(a, b);
    // piso: relación real exige ≥1 tag compartido, salvo que la carrera no
    // tenga tags (entonces se admite por similitud de título/descripción).
    const floor = shared >= 1 || a.tags.size === 0;
    if (!floor) continue;
    if (score < MIN_THRESHOLD) continue;
    candidates.push({ slug: b.slug, score });
  }
  candidates.sort((x, y) => y.score - x.score || x.slug.localeCompare(y.slug));
  plan.set(a.slug, candidates.slice(0, TOP_N));
}

// ── Reporte ────────────────────────────────────────────────────────────────
let changed = 0;
const report = [];
for (const c of careers) {
  const newSlugs = (plan.get(c.slug) ?? []).map((x) => x.slug);
  let oldSlugs = [];
  try {
    const doc = YAML.parse(c.fm);
    oldSlugs = (doc.similar ?? []).map((s) => String(s));
  } catch {}
  const same =
    oldSlugs.length === newSlugs.length &&
    oldSlugs
      .map((s) => (s || "").replace(/^-\s*/, "").trim())
      .sort()
      .join("|") === newSlugs.sort().join("|");
  if (!same) changed++;
  report.push({
    file: c.file,
    old: oldSlugs.join(",") || "-",
    next: newSlugs.join(",") || "-",
    same,
    draft: c.draft,
  });
}

console.log(`Carreras procesadas: ${careers.length}`);
const withSimilar = [...plan.values()].filter((v) => v.length > 0).length;
console.log(`Con similares sugeridas: ${withSimilar}/${careers.length}`);
console.log(`Catalogadas sin similares: ${careers.length - withSimilar}`);
console.log(`Con cambios vs. estado actual: ${changed}`);
console.log("\n── Reporte detallado ──");
for (const r of report) {
  const flag = r.same ? "=" : "→";
  console.log(`${flag} ${r.file}`);
  console.log(`    antes: ${r.old}${r.same ? "" : `\n    ahora: ${r.next}`}`);
}
if (!APPLY) {
  console.log("\n⚠️  Modo dry-run: no se escribió nada. Usá --apply para aplicar.");
}

// ── Aplicar ────────────────────────────────────────────────────────────────
if (APPLY) {
  let written = 0;
  for (const c of careers) {
    const newSlugs = (plan.get(c.slug) ?? []).map((x) => x.slug);
    const list = newSlugs.map((s) => "  - " + s).join("\n");
    const block = newSlugs.length ? "similar:\n" + list : "similar: []";
    let updated;
    const re = /similar:[\s\S]*?(?=\n[a-zA-Z][\w-]*:|(?![\s\S]))/;
    if (re.test(c.fm)) {
      // el campo ya existe → sustituir el bloque
      updated = c.fm.replace(re, block);
    } else {
      // no existía → insertar después de `short:` (o `title:`)
      const anchorLine =
        (c.fm.match(/^short:.*$/m) ?? c.fm.match(/^title:.*$/m))?.[0] ?? "";
      if (!anchorLine) {
        console.warn(`⚠️  Sin ancla title/short en ${c.file}: se omite.`);
        continue;
      }
      updated = c.fm.replace(anchorLine, anchorLine + "\n" + block);
    }
    writeFileSync(join(DIR, c.file), c.raw.replace(c.fm, updated), "utf8");
    written++;
  }
  console.log(`Escritura completada (${written} archivos).`);
}