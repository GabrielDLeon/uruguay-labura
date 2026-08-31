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
  ...STOPWORDS, "titulo", "titulos", "formacion", "formar", "formando", "forman", "carrera",
  "carreras", "universidad", "universitaria", "universitario", "facultad", "instituto",
  "escuela", "centro", "estudiantes", "estudiante", "alumnos", "alumno", "modalidad",
  "modalidades", "presencial", "virtual", "hibrida", "hibrido", "semipresencial",
  "curso", "cursos", "creditos", "anos", "anio", "horas", "hora", "semestre",
  "semestres", "gratuita", "gratuito", "gratis", "arancelada", "arancelado", "paga",
  "contar", "cuenta", "brindar", "brinda", "brindan", "ofrece", "ofrecen", "ofrecer",
  "objetivo", "objetivos", "permitir", "permite", "permiten", "permitira", "busca",
  "buscan", "buscar", "través", "traves", "parte", "medio", "nivel", "niveles",
  "grado", "area", "fecha", "fechas", "ingreso", "ingresos", "plan", "planes",
  "estudio", "estudios", "materias", "materia", "asignaturas", "asignatura", "final",
  "finales", "egresados", "egresado", "profesional", "profesionales", "laboral",
  "laborales", "campo", "campos", "desempeño", "desempeno", "desempeñarse", "disciplina",
  "disciplinas", "cientifica", "cientifico", "cientificas", "cientificos", "conocimientos",
  "conocimiento", "habilidades", "habilidad", "competencias", "competencia", "destrezas",
  "capacidades", "capacidad", "preparar", "prepara", "preparan", "habilita", "habilitar",
  "habilitados", "habilita", "amplia", "amplio", "todos", "todas", "todo", "toda",
  "cada", "más", "mas", "muy", "ser", "son", "es", "está", "esta", "estan",
  "están", "estar", "tener", "tiene", "tienen", "pueden", "puede", "podrá",
  "podran", "podra", "podras", "debe", "deben", "deberá", "deberan", "desde",
  "hasta", "entre", "sobre", "también", "tambien", "así", "asi", "como", "tanto",
  "tanta", "este", "esta", "estos", "estas", "ese", "esa", "incluye", "incluyen",
  "incluso", "además", "ademas", "requiere", "requieren", "requisitos", "requisito",
  "se", "al", "lo", "le", "les", "sus", "con", "sin", "por", "para", "durante",
  "mediante", "donde", "cuando", "quien", "quienes", "cual", "cuales", "ello",
  "ellos", "ellas", "nosotros", "usted", "ustedes", "nuevo", "nueva", "nuevos",
  "nuevas", "diferentes", "distintos", "distintas", "diversos", "diversas", "principales",
  "principal", "gran", "mayor", "menor", "mejor", "peor", "mayoria", "misma", "mismo",
  "mismos", "mismas", "otros", "otras", "otro", "otra", "años", "meses", "dias",
  "días", "semanas", "título", "titulos", "titulacion", "titulaciones", "profesorado",
  "docentes", "docente", "profesores", "profesor", "enseñanza", "ensenanza", "enseñar",
  "aprendizaje", "aprender", "contenidos", "contenido", "temas", "tema", "temática",
  "tematica", "tematicas", "unidad", "unidades", "modulos", "modulo", "bloque",
  "bloques", "teoricos", "teoricas", "practicos", "practicas", "teoria", "teoria",
  "practica", "teórico", "práctico", "evaluacion", "evaluacion", "evaluaciones",
  "examen", "examenes", "parciales", "trabajos", "trabajo", "pruebas", "cursado",
  "cursada", "cursar", "aprobar", "rendir", "inscribirse", "inscripcion", "inscripciones",
  "preinscripcion", "matricula", "postular", "postulacion", "postulantes", "seleccion",
  "admisión", "admision", "acceso", "acceder", "perfil", "perfiles", "actividades",
  "actividad", "proyectos", "proyecto", "pasantias", "pasantías", "tutorias", "tutorías",
  "acompañamiento", "acompanamiento", "seguimiento", "orientacion", "orientación",
  "orientado", "orientada", "orientados", "orientadas", "dirigido", "dirigida", "dirigidos",
  "dirigidas", "destinado", "destinada", "bibliografia", "bibliografia", "referencias",
  "fuentes", "fuente", "informacion", "información", "actualizacion", "actualización",
  "permanente", "continua", "continuo", "integral", "integrales", "transversal",
  "transversales", "interdisciplinaria", "interdisciplinario", "multidisciplinaria",
  "multidisciplinario", "especifica", "específica", "especificas", "específicas",
  "especifico", "específico", "general", "generales", "basica", "básica", "basicas",
  "básicas", "avanzada", "avanzado", "avanzadas", "avanzados", "nucleo", "núcleo",
  "tronco", "comun", "común", "optativas", "optativa", "electivas", "electiva",
  "obligatorias", "obligatoria", "intermedio", "intermedia", "carga", "horaria", "malla",
  "curricular", "duracion", "duración", "modalidades", "metodologia", "metodología",
  "metodologias", "estrategias", "estrategia", "tecnicas", "técnicas", "herramientas",
  "herramienta", "recursos", "recurso", "materiales", "material", "marco", "contexto",
  "ámbito", "ambito", "ámbitos", "ambitos", "tipo", "tipos", "serie", "base", "bases",
  "aspectos", "aspecto", "elementos", "elemento", "componentes", "componente", "fases",
  "fase", "etapas", "etapa", "proceso", "procesos", "sistema", "sistemas", "modelo",
  "modelos", "metodo", "metodos", "técnica", "tecnica", "funciones", "funcion", "rol",
  "roles", "tareas", "tarea", "posibilidades", "posibilidad", "oportunidades", "oportunidad",
  "desafios", "desafíos", "desafio", "necesidades", "necesidad", "demandas", "demanda",
  "sectores", "sector", "organizaciones", "organizacion", "empresas", "empresa",
  "instituciones", "institucion", "institucional", "social", "sociales", "economico",
  "economica", "economicos", "economicas", "productivo", "productiva", "publico",
  "pública", "público", "publica", "privado", "privada", "nacional", "nacionales",
  "regional", "regionales", "internacional", "internacionales", "mundo", "actual",
  "hoy", "personas", "persona", "individuos", "comunidades", "comunidad", "grupos",
  "grupo", "equipos", "equipo", "vida", "calidad", "desarrollo", "crecimiento", "bienestar",
  "salud", "educacion", "formación", "aporte", "aportes", "contribucion", "contribución",
  "contribuir", "garantizar", "asegurar", "promover", "promueve", "promueven", "fomentar",
  "fomenta", "impulsar", "fortalecer", "fortalece", "mejorar", "mejora", "generar",
  "genera", "crear", "diseñar", "planificar", "organizar", "coordinar", "dirigir",
  "gestionar", "administrar", "evaluar", "analizar", "estudiar", "investigar",
  "comprender", "entender", "aplicar", "resolver", "identificar", "reconocer", "valorar",
  "respetar", "atender", "cuidar", "proteger", "preservar", "conservar", "transformar",
  "innovar", "emprender", "liderar", "realizar", "desarrollar", "capacitar", "aportar",
  "poder", "hacer", "decir", "ver", "saber", "llegar", "pasar", "dejar", "quedar",
  "entrar", "salir", "volver", "encontrar", "usar", "utilizar", "emplear", "permita",
  "permitan", "permitio", "consta", "constan", "compone", "componen", "conformada",
  "conformado", "conforman", "estructura", "estructurada", "organizada", "organizado",
  "plantea", "plantean", "propone", "proponen", "pretende", "pretenden", "implica",
  "implican", "requeridos", "requeridas", "exigidos", "exigidas", "obtencion", "obtención",
  "otorga", "otorgan", "certificado", "certificados", "constancia", "constancias",
  "expedido", "expedida", "avalado", "avalada", "reconocido", "reconocida", "regulado",
  "regulada", "acreditada", "acreditado", "acreditacion", "acreditación", "habilitacion",
  "habilitación", "mercado", "salida", "salidas", "insercion", "inserción", "inserir",
  "ampliar", "complementar", "profundizar", "especializar", "especializarse", "actualizar",
  "perfeccionar", "perfeccionamiento", "actualizarse", "capacitacion", "capacitación",
  "egreso", "graduacion", "graduación", "graduados", "graduado", "titulados", "titulado",
  "aplicacion", "aplicación", "aplicaciones", "utilizacion", "utilización", "uso", "manejo",
  "dominio", "pensamiento", "razonamiento", "analisis", "análisis", "sintesis", "síntesis",
  "reflexion", "reflexión", "critico", "crítico", "critica", "crítica", "creatividad",
  "innovacion", "innovación", "tecnologia", "tecnología", "tecnologias", "tecnologías",
  "digital", "digitales", "nuevas-tecnologias", "ciencia", "ciencias", "cientificas",
  "cientificos", "humanisticas", "humanísticas", "humanistica", "exactas", "naturales",
  "aplicadas", "teoricas", "practicas", "formacion-profesional", "formacion-academica",
  "perfil-de-egreso", "plan-de-estudios", "titulo-intermedio", "educacion-superior",
  "educacion-terciaria", "educacion-universitaria", "nivel-superior", "enseñanza-media",
  "udelar", "ort", "utec", "ucu", "um", "ude", "uruguay", "republica", "montevideo",
  "universidad-de-la-republica", "universidad-ort", "universidad-catolica", "universidad-de-montevideo",
  "universidad-de-la-empresa", "uta", "claeh", "crandon", "bios", "cupe", "escola",
  "tecnica", "tecnico", "tecnicos", "tecnica", "estatal", "privado", "publica", "pública",
  "arancel", "cuota", "cuotas", "mensualidad", "mensualidades", "financiamiento",
  "financiacion", "financiación", "becas", "beca", "ayudas", "beneficios", "beneficio",
  "descuentos", "descuento", "cupos", "cupo", "vacantes", "vacante", "inscriptos",
  "inscriptas", "anual", "anuales", "cuatrimestral", "cuatrimestre", "cuatrimestres",
  "turnos", "turno", "manana", "mañana", "tarde", "noche", "vespertino", "matutino",
  "nocturno", "jornada", "jornadas", "completa", "parcial", "tiempo", "completo",
  "extension", "extensión", "universitaria", "investigacion", "investigaciones", "investigador",
  "investigadores", "extensionista", "extensionistas", "vinculacion", "vinculación", "vinculo",
  "vínculo", "territorio", "territorial", "territoriales", "local", "locales", "departamental",
  "departamentales", "país", "pais", "paises", "países", "latinoamerica", "latinoamericano",
  "latinoamericana", "iberoamerica", "iberoamericano", "mercosur", "region", "región",
  "américa", "america", "europa", "mundo-laboral", "mundo-profesional", "insercion-laboral",
  "inserción-laboral", "salida-laboral", "campo-laboral", "mercado-laboral", "mundo-del-trabajo",
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
    // Normalize tag spelling to kebab-case (lowercase, no accents, spaces→hyphens)
    // so that vocabulary variants like "comercio exterior" vs "comercio-exterior"
    // or "diseño" vs "diseno" compare equal.
    tags: new Set((doc.tags ?? []).map((t) => norm(String(t)).replace(/\s+/g, "-"))),
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
