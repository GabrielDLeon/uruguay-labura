#!/usr/bin/env node
/**
 * Validates and applies the tag work produced by sub-agents.
 *
 * Usage:
 *   node scripts/tag-work/apply-tags.mjs          # validate only (no writes)
 *   node scripts/tag-work/apply-tags.mjs --apply  # validate + write tags
 *
 * Reads scripts/tag-work/tags-<grupo>.json (one per group), validates every
 * career has a complete final tag list, normalizes residual synonym/format
 * variants, and (with --apply) rewrites the `tags:` block of each frontmatter.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const store = join(process.cwd(), "node_modules", ".pnpm");
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
const YAML = require(join(store, best.dir, "node_modules", "yaml"));

const ROOT = new URL("../..", import.meta.url).pathname;
const DIR = join(ROOT, "src", "content", "careers");
const WORK = join(ROOT, "scripts", "tag-work");
const APPLY = process.argv.includes("--apply");

const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Synonym map: variant -> canonical. Applied as a safety net on top of the
// agents' work (VOCABULARIO.md is the source of truth for authors).
const SYNONYMS = {
  diseño: "diseno",
  diseños: "diseno",
  "diseño grafico": "diseno grafico",
  "diseño industrial": "diseno industrial",
  "diseño de interiores": "diseno de interiores",
  "diseño de moda": "diseno de moda",
  "diseño textil": "diseno textil",
  "diseño de packaging": "diseno de packaging",
  "diseño de juegos": "diseno de juegos",
  "diseño ux": "diseno ux",
  "diseño web": "diseno web",
  "diseño digital": "diseno digital",
  "diseño de productos": "diseno de productos",
  "diseño de espacios": "diseno de espacios",
  "diseño de servicios": "diseno de servicios",
  "diseño de experiencia": "diseno de experiencia",
  "diseño de indumentaria": "diseno de indumentaria",
  "diseño editorial": "diseno editorial",
  "diseño industrial": "diseno industrial",
  comercio_exterior: "comercio exterior",
  "comercio-exterior": "comercio exterior",
  "ciencia-de-datos": "ciencia de datos",
  "data science": "ciencia de datos",
  analytics: "ciencia de datos",
  analitica: "ciencia de datos",
  "analitica de datos": "ciencia de datos",
  "analisis de datos": "ciencia de datos",
  "analisis-de-datos": "ciencia de datos",
  "inteligencia-artificial": "inteligencia artificial",
  "salud-mental": "salud mental",
  "cadena-de-suministros": "cadena de suministros",
  "supply chain": "cadena de suministros",
  "gestion-de-personas": "gestion de personas",
  "talento humano": "gestion de personas",
  talento: "gestion de personas",
  "gestion de talento": "gestion de personas",
  "recursos-humanos": "recursos humanos",
  rrhh: "recursos humanos",
  "marketing-digital": "marketing digital",
  "politicas-publicas": "politicas publicas",
  "gestion-del-cambio": "gestion del cambio",
  "toma-de-decisiones": "toma de decisiones",
  "artes-escenicas": "artes escenicas",
  "artes-visuales": "artes visuales",
  "cultura-organizacional": "cultura organizacional",
  "direccion-comercial": "direccion comercial",
  "educacion-inicial": "primera infancia",
  "primera-infancia": "primera infancia",
  "industria-alimentaria": "industria alimentaria",
  "seguridad-informatica": "seguridad informatica",
  "relaciones-laborales": "relaciones laborales",
  "inteligencia-emocional": "inteligencia emocional",
  "habilidades-gerenciales": "habilidades gerenciales",
  "ensenanza bilingue": "educacion bilingue",
  ensenanza: "educacion",
  agro: "agropecuario",
  ambiente: "medio ambiente",
  ecommerce: "comercio electronico",
  contaduria: "contabilidad",
  "derecho contractual": "contratos",
  "derecho de salud": "derecho sanitario",
  "desarrollo de software": "software",
  jung: "psicologia analitica",
  inversion: "inversiones",
  "mercado de capitales": "mercado de capitales",
  "mercados de capitales": "mercado de capitales",
  sustentabilidad: "sostenibilidad",
  tributaria: "tributacion",
  ninos: "ninos y adolescentes",
  adolescentes: "ninos y adolescentes",
  infancia: "ninos y adolescentes",
  superdotacion: "altas habilidades",
  interiores: "interiorismo",
  "acompanamiento-terapeutico": "acompanamiento terapeutico",
  "acompañamiento-terapeutico": "acompanamiento terapeutico",
  management: "direccion de empresas",
  "moldería": "molderia",
  moldería: "molderia",
  tendencia: "tendencias",
  "ciencia-de-la-computacion": "informatica",
  "ingenieria en computacion": "informatica",
  "ingenieria de computacion": "informatica",
  bioquimica: "bioquimica",
  "tecnicatura": null, // degree-type tags are dropped
  "tecnico superior": null,
  tecnico: null,
  tecnicaturas: null,
  grado: null,
  posgrado: null,
  especializacion: null,
  maestria: null,
  doctorado: null,
  diplomado: null,
  "master en derecho": "derecho",
};

// Degree-type tags that must never appear as topical tags.
const DROP_TAGS = new Set([
  "tecnicatura", "tecnico", "tecnico superior", "grado", "posgrado",
  "especializacion", "maestria", "doctorado", "diplomado", "carrera",
  "licenciatura", "tecnologo", "ciclo", "curso", "master", "diploma",
]);

function canonicalTag(raw) {
  let t = norm(raw);
  if (SYNONYMS[t] === null || DROP_TAGS.has(t)) return null;
  if (SYNONYMS[t]) t = SYNONYMS[t];
  t = norm(t);
  if (DROP_TAGS.has(t)) return null;
  return t.replace(/\s+/g, "-"); // kebab-case output
}

const workFiles = readdirSync(WORK)
  .filter((f) => /^tags-.*\.json$/.test(f))
  .sort();

const plan = new Map();
for (const wf of workFiles) {
  const data = JSON.parse(readFileSync(join(WORK, wf), "utf8"));
  for (const [slug, tags] of Object.entries(data)) {
    plan.set(slug, Array.isArray(tags) ? tags : []);
  }
}

// Load current careers.
const files = readdirSync(DIR).filter((f) => f.endsWith(".md")).sort();
const errors = [];
let ok = 0;
for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const raw = readFileSync(join(DIR, file), "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) continue;
  const doc = YAML.parse(m[1]);
  if (!doc) continue;

  if (!plan.has(slug)) {
    errors.push(`MISSING ${file}: no tag list produced for this career`);
    continue;
  }
  const rawTags = plan.get(slug);
  const tags = [];
  const seen = new Set();
  for (const t of rawTags) {
    const c = canonicalTag(String(t));
    if (!c) {
      errors.push(`DROPPED ${file}: tag "${t}" is a degree-type/stop tag`);
      continue;
    }
    if (seen.has(c)) {
      errors.push(`DUP ${file}: tag "${c}" repeated`);
      continue;
    }
    seen.add(c);
    tags.push(c);
  }
  if (tags.length < 2) {
    errors.push(`FEW ${file}: only ${tags.length} tags after cleanup`);
    continue;
  }
  if (tags.length > 8) {
    errors.push(`MANY ${file}: ${tags.length} tags (max 6 expected)`);
    continue;
  }
  if (APPLY) {
    const list = tags.map((t) => `  - ${t}`).join("\n");
    const block = `tags:\n${list}`;
    const re = /tags:[\s\S]*?(?=\n[a-zA-Z][\w-]*:|(?![\s\S]))/;
    if (re.test(m[1])) {
      const updated = m[1].replace(re, block);
      writeFileSync(join(DIR, file), raw.replace(m[1], updated), "utf8");
    } else {
      errors.push(`NO-TAGS-FIELD ${file}`);
    }
  }
  ok++;
}

console.log(`Carreras con plan: ${plan.size}`);
console.log(`Carreras OK: ${ok}`);
console.log(`Errores: ${errors.length}`);
for (const e of errors.slice(0, 60)) console.log("  " + e);
if (errors.length > 60) console.log(`  ... y ${errors.length - 60} más`);
console.log(APPLY ? "\n✅ Aplicado." : "\n⚠️  Solo validación: use --apply para escribir.");
