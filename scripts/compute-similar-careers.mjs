#!/usr/bin/env node
/**
 * Auto-generates the `similar` field for src/content/careers.
 *
 * Hybrid strategy: shared tags weighted by IDF (rare tags like "telematica"
 * weigh far more than generic ones like "salud"), refined by title and
 * description tokens with IDF weighting, plus tiebreakers (same area, same
 * degreeType, cross-institution diversity).
 *
 * Usage:
 *   node scripts/compute-similar-careers.mjs           # dry-run
 *   node scripts/compute-similar-careers.mjs --apply   # write changes
 *
 * Only the `similar:` block is written (replaced if present, or inserted
 * after `short:`/`title:`); the rest of the frontmatter stays untouched.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// yaml is not a direct dependency, so fall back to the highest version in the pnpm store.
function loadYaml() {
  try {
    return require("yaml");
  } catch {
    const store = join(ROOT, "node_modules", ".pnpm");
    const best = readdirSync(store)
      .filter((d) => d.startsWith("yaml@"))
      .map((d) => ({ dir: d, ver: d.split("@")[1].split(".").map(Number) }))
      .sort((a, b) => {
        for (let i = 0; i < 3; i++) {
          const d = (a.ver[i] ?? 0) - (b.ver[i] ?? 0);
          if (d !== 0) return d;
        }
        return 0;
      })
      .at(-1);
    if (!best) throw new Error("yaml not found in node_modules");
    return require(join(store, best.dir, "node_modules", "yaml"));
  }
}

const ROOT = new URL("..", import.meta.url).pathname;
const DIR = join(ROOT, "src", "content", "careers");
const YAML = loadYaml();
const APPLY = process.argv.includes("--apply");

const TOP_N = 6;
const MIN_THRESHOLD = 2.4;
const TAG_STRONG = 5.5; // a shared specific tag alone is enough
const TAG_WEAK = 3.0; // weaker tags need same area/degreeType as confirmation
const TOKEN_TAG_MIN = 2.0; // a shared title token requires at least some tag signal

const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const STOPWORDS = new Set([
  "de", "la", "el", "en", "los", "las", "del", "al", "y", "o", "a", "con",
  "por", "para", "su", "e", "un", "una", "de-la", "de-el",
  "especializacion", "maestria", "licenciatura", "tecnicatura", "tecnologo",
  "carrera", "diploma", "doctorado", "ciclo", "curso", "posgrado", "master",
  "universitario", "universitaria", "superior", "tecnico", "grado", "area",
  "programa", "fundamentos", "en-el", "aplicada", "aplicado", "introduccion",
  "taller", "taller-de", "nuevo",
]);

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
  "udelar", "ort", "utec", "uruguay", "republica", "montevideo", "universidad-de-la-republica",
]);

function significantTokens(title) {
  const tokens = new Set();
  for (const w of norm(title).split(/[^a-z0-9]+/)) {
    if (w && !STOPWORDS.has(w)) tokens.add(w);
  }
  return tokens;
}

function descriptionTokens(desc) {
  const tokens = new Set();
  for (const w of norm(desc).split(/[^a-z0-9]+/)) {
    if (w && !DESC_STOPWORDS.has(w)) tokens.add(w);
  }
  return tokens;
}

const files = readdirSync(DIR).filter((f) => f.endsWith(".md")).sort();
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
  const slug = file.replace(/\.md$/, "");
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

// All careers are processed (draft or not) so `similar` is ready regardless of the draft flag.
const N = careers.length;

const df = new Map();
const dfDesc = new Map();
for (const c of careers) {
  for (const t of c.tokens) df.set(t, (df.get(t) || 0) + 1);
  for (const t of c.descTokens) dfDesc.set(t, (dfDesc.get(t) || 0) + 1);
}
const idf = (t) => Math.log((N + 1) / ((df.get(t) || 0) + 1));
const idfDesc = (t) => Math.log((N + 1) / ((dfDesc.get(t) || 0) + 1));

const dfTag = new Map();
for (const c of careers) for (const t of c.tags) dfTag.set(t, (dfTag.get(t) || 0) + 1);
const idfTag = (t) => Math.log((N + 1) / ((dfTag.get(t) || 0) + 1));

function similarity(a, b) {
  if (a.slug === b.slug) return -1;
  let score = 0;

  let shared = 0;
  let tagScore = 0;
  for (const t of a.tags) {
    if (b.tags.has(t)) {
      shared++;
      tagScore += idfTag(t);
    }
  }
  score += tagScore;

  const sameArea = a.area && a.area === b.area;
  const sameDegree = a.degreeType && a.degreeType === b.degreeType;
  if (sameArea) score += 0.7;
  if (sameDegree) score += 0.2;
  if (a.institution && b.institution && a.institution !== b.institution) score += 0.3;

  let tokenScore = 0;
  let sharedTitleToken = false;
  for (const t of a.tokens) if (b.tokens.has(t)) { tokenScore += idf(t); sharedTitleToken = true; }
  score += tokenScore;

  let descScore = 0;
  for (const t of a.descTokens) if (b.descTokens.has(t)) descScore += idfDesc(t);
  score += descScore * 0.6;

  return { score, shared, tagScore, sharedTitleToken, sameArea, sameDegree };
}

const plan = new Map();
for (const a of careers) {
  let candidates = [];
  for (const b of careers) {
    if (a.slug === b.slug) continue;
    const { score, shared, tagScore, sharedTitleToken, sameArea, sameDegree } = similarity(a, b);
    // A shared generic tag ("salud", "medicina") is not enough on its own: require
    // evidence proportional to tag rarity (specific tag alone, weak tag + same
    // area/degreeType, or shared title token + some tag signal). Careers without
    // tags are admitted on title/description similarity alone.
    const strongTag = tagScore >= TAG_STRONG;
    const weakTagConfirmed = tagScore >= TAG_WEAK && (sameArea || sameDegree);
    const tokenEvidence = sharedTitleToken && tagScore >= TOKEN_TAG_MIN;
    const floor =
      a.tags.size === 0 ? true : shared >= 1 && (strongTag || weakTagConfirmed || tokenEvidence);
    if (!floor) continue;
    if (score < MIN_THRESHOLD) continue;
    candidates.push({ slug: b.slug, score });
  }
  candidates.sort((x, y) => y.score - x.score || x.slug.localeCompare(y.slug));
  plan.set(a.slug, candidates.slice(0, TOP_N));
}

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

if (APPLY) {
  let written = 0;
  for (const c of careers) {
    const newSlugs = (plan.get(c.slug) ?? []).map((x) => x.slug);
    const list = newSlugs.map((s) => "  - " + s).join("\n");
    const block = newSlugs.length ? "similar:\n" + list : "similar: []";
    let updated;
    const re = /similar:[\s\S]*?(?=\n[a-zA-Z][\w-]*:|(?![\s\S]))/;
    if (re.test(c.fm)) {
      updated = c.fm.replace(re, block);
    } else {
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
