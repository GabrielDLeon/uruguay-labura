#!/usr/bin/env node
/**
 * Limpieza y regeneración de tags de carreras (src/content/careers).
 *
 * Estrategia:
 *  1. Clasificador de palabras clave sobre el título → tags de área fina
 *  2. Fallback por campo `area`
 *  3. Tag editorial `programa-roberto-rocca` (ingenierías UDELAR + ORT, según doc)
 *
 * Modo dry-run (default): imprime reporte y NO escribe nada.
 * Modo apply: `node scripts/cleanup-tags.mjs --apply`
 *
 * El resto del frontmatter queda byte-idéntico (solo se reemplaza el bloque `tags:`).
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
  YAML = require(
    "/home/gabriel/dev/uruguay-labura/node_modules/.pnpm/yaml@2.8.3/node_modules/yaml",
  );
}

const DIR = join(process.cwd(), "src/content/careers");
const APPLY = process.argv.includes("--apply");

// ── Normalización: minúsculas + sin acentos para matching ────────────────
const norm = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// ── Vocabulario controlado: tag → palabras clave (raíces/prefix) ─────────
// Matching por PREFIJO: la keyword debe aparecer al inicio de una palabra
// (p.ej. "cardiolog" matchea "cardiologia"). Frases con espacio hacen
// substring. `exclude` desactiva toda la regla si la frase aparece.
const KEYWORDS = [
  { tag: "medicina", words: ["anatomia patologica", "banco de tejidos", "cuidados intensivos", "medicina nuclear", "salud familiar", "genetica medica", "cardiolog", "cirug", "pediatr", "neurolog", "psiquiatr", "dermatolog", "gineco", "obstetric", "oftalmolog", "otorrinolaringolog", "urolog", "nefrolog", "oncolog", "hematolog", "endocrinolog", "gastroenterolog", "neumolog", "traumatolog", "ortopedia", "anestesiolog", "alergolog", "diabetolog", "infectolog", "reumatolog", "geriatr", "medicina", "imagenolog", "emergentolog", "toxicolog", "transplante", "trasplante", "neurocirug", "neuropediatr", "neurofisiolog", "endoscopia", "farmacolog", "hemoterapia", "hemato", "radiofarmacia", "urgencia", "cardiaca", "vascular", "progenitores", "rehabilitacion", "paliativos", "parasitolog", "micolog", "microbiolog", "neurodesarrollo", "fisiatria", "salud mental", "intensivos", "intensiva", "intensivo", "quirurg", "instrumentacion", "inmunogenet"], exclude: ["ciencias de la salud", "ingenieria biomedica"] },
  { tag: "odontologia", words: ["odontopediatr", "ortodoncia", "prostodoncia", "implantolog", "periodoncia", "endodoncia", "odontolog", "buco", "dento", "higienista", "laboratorista en odontologia"] },
  { tag: "enfermeria", words: ["enfermer"] },
  { tag: "psicologia", words: ["psicoterapia", "psicogerontolog", "psicomotricidad", "psicolog", "cognitiva", "cognitivas"] },
  { tag: "farmacia", words: ["farmacia", "farmaceutica"] },
  { tag: "nutricion", words: ["nutricion", "nutricional"] },
  { tag: "veterinaria", words: ["veterinaria", "veterinarias", "salud animal", "produccion animal", "rumiantes", "equina", "lecheria", "animal"] },
  { tag: "fisioterapia", words: ["fisioterapia", "kinesiolog"] },
  { tag: "fonoaudiologia", words: ["fonoaudiolog"] },
  { tag: "terapia ocupacional", words: ["terapia ocupacional"] },
  { tag: "biologia", words: ["biomoleculares", "biotecnolog", "bioinformatic", "biociencias", "genetic", "biologic", "microbiolog", "ciencias biologicas"] },
  { tag: "quimica", words: ["bioquim", "tecnologias de la quimica", "quimic", "quimico"] },
  { tag: "fisica", words: ["fisico-matematica", "astrofisica", "atmosfera", "fisica", "fisico"], exclude: ["educacion fisica", "actividad fisica"] },
  { tag: "matematica", words: ["matematica", "matematicas", "investigacion de operaciones", "optimizacion"] },
  { tag: "estadistica", words: ["estadistica"] },
  { tag: "informatica", words: ["tecnologias de la informacion", "inteligencia artificial", "machine learning", "aprendizaje automatico", "sistemas de informacion", "seguridad informatica", "ciencia de datos", "big data", "business intelligence", "analitica de datos", "analitica de big data", "analitica de negocio", "analitica", "bases de datos", "informatica", "computacion", "programacion", "programador", "software", "ciberseguridad", "cloud", "testing", "robotica", "iot", "datos", "servidores", "bioinformatic", "telecomunicaciones", "gestion de datos", "analisis de datos", "analisis y gestion de datos", "sistemas"], exclude: ["sistemas integrados", "sistemas electricos", "sistemas de informacion de las organizaciones", "sistemas de informacion y tecnologias"] },
  { tag: "ciberseguridad", words: ["ciberseguridad", "seguridad informatica"] },
  { tag: "inteligencia artificial", words: ["inteligencia artificial", "machine learning", "aprendizaje automatico", "robotica"] },
  { tag: "ciencia de datos", words: ["ciencia de datos", "big data", "analitica de datos", "analitica de big data", "business intelligence", "datos"] },
  { tag: "ingenieria", words: ["ingenier", "mecatronica", "naval", "electromecanica", "agroambiental", "biomedica", "forestal", "automatica", "electrica", "electricos", "electronica", "energias renovables", "mantenimiento industrial", "industrial", "madera"], exclude: ["farmacia industrial"] },
  { tag: "arquitectura", words: ["arquitectura", "urbanismo", "ordenamiento territorial", "habitat", "vivienda", "paisaje", "paisajismo", "construccion", "edificaciones"] },
  { tag: "diseno", words: ["diseno de ambientes", "interiorismo", "diseno", "moda", "mobiliario", "juguetes", "prototipado", "grafico", "proyectual"] },
  { tag: "derecho", words: ["derecho", "juridica", "notariado", "procesal", "penalidad", "abogac"] },
  { tag: "economia", words: ["economia", "economista", "economico"] },
  { tag: "finanzas", words: ["finanzas", "financiera", "financiero", "bancaria", "impuestos", "niif", "tributaria"] },
  { tag: "contabilidad", words: ["contabilidad", "contador", "auditoria", "costos"] },
  { tag: "administracion", words: ["administracion", "administrador", "administrativo", "gestion", "gerencia", "empresas", "mba", "emprendimientos", "innovacion", "recursos humanos", "organizaciones", "transformacion organizacional"], exclude: ["administrador de servidores", "administracion de servidores"] },
  { tag: "negocios", words: ["negocios", "comercio exterior", "ventas", "inmobiliario", "comercial", "negocios digitales", "gerencia"] },
  { tag: "marketing", words: ["marketing", "publicidad", "direccion comercial"] },
  { tag: "recursos humanos", words: ["recursos humanos", "rrhh"] },
  { tag: "logistica", words: ["logistica", "cadenas de suministro", "suministros", "transporte"] },
  { tag: "comunicacion", words: ["informacion y comunicacion", "relaciones publicas", "comunicacion", "periodismo", "creacion de contenidos", "comunicacion corporativa", "comunicacion global"] },
  { tag: "audiovisual", words: ["audiovisual", "cine", "animacion", "videojuegos", "realizacion", "entretenimiento digital", "sonido", "fotografia"] },
  { tag: "educacion", words: ["educacion", "ensenanza", "pedagogia", "docencia", "didactica", "formacion de formadores", "educativa", "aprendizaje", "tecnologia educativa", "bachiller"] },
  { tag: "ciencias sociales", words: ["ciencias sociales", "sociolog", "antropolog", "ciencia politica", "politicas publicas", "politicas sociales", "genero", "demografia", "sociodemografic", "infancia", "juventud", "discapacidad", "crimen", "penalidad", "trabajo social", "intervencion", "desarrollo", "estudios contemporaneos", "migracion", "social", "geografia", "cartografia"] },
  { tag: "trabajo social", words: ["trabajo social"] },
  { tag: "historia", words: ["historia", "historica", "archivolog", "patrimonio documental"] },
  { tag: "filosofia", words: ["filosofia"] },
  { tag: "letras", words: ["linguistica", "lenguas", "gramatica", "literatura", "correccion de estilo", "letras", "humanidades", "bibliotecolog", "espanol", "aleman", "frances", "ingles", "italiano", "portugues"] },
  { tag: "traduccion", words: ["traductorado", "traduccion", "interpretacion", "lsu"] },
  { tag: "arte", words: ["artes plasticas", "arte digital", "artes", "danza", "dramaturgia", "escultura", "pintura", "ceramica", "dibujo", "bienes culturales", "carnaval", "cultural", "arte"] },
  { tag: "musica", words: ["musicolog", "composicion", "direccion coral", "direccion orquestal", "musica", "musical", "jazz", "canto", "sonoro", "interpretacion musical", "produccion musical", "coros"] },
  { tag: "turismo", words: ["turismo", "hoteleria", "gastronomia"] },
  { tag: "agronomia", words: ["agronom", "agropecuari", "agrarias", "agricola", "agroalimentaria", "forestal", "agrimensura", "recursos naturales", "desarrollo rural", "produccion lechera", "carnica", "alimentos de origen animal"] },
  { tag: "medio ambiente", words: ["ambiental", "ambiente", "ecologia", "sostenibilidad", "sustentable", "hidrologia", "recursos hidricos", "manejo costero", "efluentes", "energias renovables", "biodiversidad", "control ambiental", "agroambiental"] },
  { tag: "energia", words: ["energia", "energetico", "eolica", "solar", "energias renovables"] },
  { tag: "alimentos", words: ["alimentos", "alimentaria", "lacteos", "carnica", "carnico", "inocuidad", "tecnologia de los alimentos"] },
  { tag: "deporte", words: ["educacion fisica", "deporte", "deportes", "guardavidas", "actividad fisica"] },
  { tag: "salud publica", words: ["salud publica", "salud ocupacional", "epidemiolog", "salud y psiquiatria", "salud mental", "atencion a la salud", "salud"] },
  { tag: "geologia", words: ["geolog", "geociencias", "minas", "minero"] },
  { tag: "astronomia", words: ["astronomia"] },
];

// Fallback: campo `area` → tags (solo si el título no clasificó nada)
const AREA_FALLBACK = {
  "Administración y Negocios": ["administracion", "negocios"],
  "Comunicación": ["comunicacion"],
  "Ingeniería": ["ingenieria"],
  "Tecnologías de la Información": ["informatica"],
  "Mecatrónica, Logística y Biomédica": ["ingenieria", "logistica"],
  "Diseño": ["diseno"],
  "Sostenibilidad ambiental": ["medio ambiente"],
  "Educación": ["educacion"],
  "Arquitectura": ["arquitectura"],
  "Educación, innovación y tecnología": ["educacion", "informatica"],
  "Alimentos": ["alimentos"],
  "Innovación y Emprendimientos": ["negocios"],
  "Salud": ["salud"],
  "Ciencias de la Salud": ["salud"],
  "Social y Artística": ["ciencias sociales"],
  "Tecnologías y Ciencias de la Naturaleza y el Hábitat": [],
  "Sin clasificar": [],
};

// ── Clasificador ─────────────────────────────────────────────────────────
function classify(title, area, degreeType, institution) {
  const t = norm(title);
  const tags = new Set();

  for (const rule of KEYWORDS) {
    const excluded = (rule.exclude ?? []).some((e) => t.includes(norm(e)));
    if (excluded) continue;
    for (const w of rule.words) {
      const wn = norm(w);
      if (wn.includes(" ")) {
        if (t.includes(wn)) tags.add(rule.tag);
      } else if (new RegExp(`(^|[^a-z0-9])${wn}`).test(t)) {
        // prefix: keyword al inicio de una palabra
        tags.add(rule.tag);
      }
    }
  }

  // nivel / tipo
  if (degreeType === "ingenieria") tags.add("ingenieria");

  // fallback por área
  if (tags.size === 0) {
    const fb = AREA_FALLBACK[area] ?? [];
    fb.forEach((t) => tags.add(t));
  }

  // tag editorial: elegibilidad Programa Roberto Rocca
  // (doc: estudiantes de ingeniería de UDELAR, UCU, ORT y UM)
  if (
    degreeType === "ingenieria" &&
    ["udelar", "ort"].includes(institution)
  ) {
    tags.add("programa-roberto-rocca");
  }

  return [...tags].sort();
}

// ── Edición quirúrgica del bloque tags ────────────────────────────────────
function replaceTagsBlock(frontmatter, newTags) {
  const block = newTags.length
    ? `tags:\n${newTags.map((t) => `  - ${t}`).join("\n")}`
    : `tags: []`;
  // `tags:` hasta la próxima clave de primer nivel o fin del frontmatter
  // `(?!\u00a0)` -> fin real de input; `\n[a-zA-Z]` -> próxima clave
  const re = /tags:[\s\S]*?(?=\n[a-zA-Z][\w-]*:|(?![\s\S]))/;
  if (!re.test(frontmatter)) return null;
  return frontmatter.replace(re, block);
}

// ── Main ──────────────────────────────────────────────────────────────────
const files = readdirSync(DIR).filter((f) => f.endsWith(".mdx")).sort();
let changed = 0;
let noTags = 0;
const reports = [];

for (const file of files) {
  const path = join(DIR, file);
  const raw = readFileSync(path, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) {
    reports.push(`${file}\tNO_FRONTMATTER`);
    continue;
  }
  const fm = m[1];
  const doc = YAML.parse(fm);
  if (!doc || typeof doc.title !== "string") {
    reports.push(`${file}\tPARSE_ERROR`);
    continue;
  }

  const newTags = classify(
    doc.title,
    doc.area ?? "",
    doc.degreeType ?? "",
    doc.institution ?? "",
  );
  const oldTags = (doc.tags ?? []).map((t) => String(t));

  // igualdad (como sets)
  const same =
    oldTags.length === newTags.length &&
    [...oldTags].sort().join("|") === newTags.join("|");

  if (newTags.length === 0) noTags++;
  if (!same) changed++;

  reports.push(
    `${file}\t${oldTags.join(",") || "-"}\t→\t${newTags.join(",") || "-"}`,
  );

  if (APPLY && !same) {
    const updated = replaceTagsBlock(fm, newTags);
    if (updated) {
      writeFileSync(path, raw.replace(fm, updated), "utf8");
    } else {
      reports.push(`${file}\tWARN_NO_TAGS_BLOCK`);
    }
  }
}

// ── Reporte ───────────────────────────────────────────────────────────────
console.log(`Archivos procesados: ${files.length}`);
console.log(`Con cambios: ${changed}`);
console.log(`Sin tags resultantes: ${noTags}`);
const vocab = new Set();
for (const r of reports) {
  const tags = r.split("\t→\t")[1]?.trim();
  if (tags && tags !== "-") tags.split(",").forEach((t) => vocab.add(t));
}
console.log(`Vocabulario resultante (${vocab.size} tags): ${[...vocab].sort().join(", ")}`);
console.log("\n── Reporte detallado (archivo → tags) ──");
console.log(reports.join("\n"));
if (!APPLY) {
  console.log("\n⚠️  Modo dry-run: no se escribió nada. Usá --apply para aplicar.");
} else {
  console.log(`\n✅ Aplicado. ${changed} archivos modificados.`);
}
