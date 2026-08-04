#!/usr/bin/env node
/**
 * Metadatos createdAt / updatedAt para el contenido educativo
 * (src/content/{careers,institutions,scholarships}).
 *
 * Origen de los datos: HISTORIAL DE GIT. Para cada archivo se extrae:
 *
 *   createdAt  → fecha del commit que CREÓ el archivo (primer add, siguiendo
 *                renames con `--follow`). Es la fecha de nacimiento del dato.
 *   updatedAt  → fecha del ÚLTIMO commit que modificó el CONTENIDO REAL del
 *                archivo. Los commits que solo tocan las líneas de metadata
 *                (createdAt/updatedAt) se ignoran, de modo que el script es
 *                idempotente y no se contamina a sí mismo al re-ejecutarse.
 *
 * Formato de salida (estable, sin zona horaria — hora local del autor):
 *   createdAt: "YYYY-MM-DD HH:MM:SS"
 *   updatedAt: "YYYY-MM-DD HH:MM:SS"
 *
 * Uso:
 *   node scripts/update-content-dates.mjs            # dry-run (no escribe)
 *   node scripts/update-content-dates.mjs --apply    # escribe los cambios
 *
 * Flujo de mantenimiento sugerido (automatizable):
 *   1. Editás el contenido de una carrera/beca/institución.
 *   2. Corrés `pnpm update:dates` (agrega/actualiza updatedAt).
 *   3. Comiteás contenido + metadata juntos → updatedAt refleja ese commit.
 *
 * También puede correrse como git hook post-commit, o en CI para validar que
 * las fechas estén al día (con `--check`).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = new URL("..", import.meta.url).pathname;
const DIRS = ["careers", "institutions", "scholarships"].map((d) =>
  join(ROOT, "src", "content", d),
);
const EXTS = [".md", ".mdx"];
const APPLY = process.argv.includes("--apply");
const CHECK = process.argv.includes("--check");

// ── helpers git ────────────────────────────────────────────────────────────
function git(args, cwd = ROOT) {
  return execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

/** Fecha "createdAt": primer commit que agregó el archivo (siguiendo renames). */
function createdAtDate(rel) {
  const out = git([
    "log",
    "--follow",
    "--diff-filter=A",
    "--format=%ai",
    "--",
    rel,
  ])
    .trim()
    .split("\n")
    .filter(Boolean);
  // git log devuelve de más nuevo a más viejo → la creación es la última.
  return out.length ? out[out.length - 1] : null;
}

/** Devuelve [commitHash, authorDateISO] de todos los commits que tocaron el
 *  archivo en su ruta actual, de más nuevo a más viejo. */
function commitsTouching(rel) {
  return git(["log", "--format=%H\t%ai", "--", rel])
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash, ...rest] = line.split("\t");
      return { hash, date: rest.join("\t") };
    });
}

/** Blob del archivo en un commit (ruta actual). Null si no existe ahí. */
function blobAt(commit, rel) {
  try {
    return git(["show", `${commit}:${rel}`]);
  } catch {
    return null;
  }
}

/** Texto del archivo sin las líneas de metadata createdAt/updatedAt. */
function withoutMeta(text) {
  if (text == null) return text;
  return text
    .split("\n")
    .filter((l) => !/^\s*(createdAt|updatedAt)\s*:/.test(l))
    .join("\n");
}

/**
 * Fecha "updatedAt": último commit que cambió el contenido REAL.
 * Se saltean commits cuyo único cambio (vs. su padre) son las líneas
 * createdAt/updatedAt. Así re-ejecutar el script no pisa fechas con la fecha
 * del propio commit de metadata.
 */
function updatedAtDate(rel, commits) {
  for (const c of commits) {
    const prev = blobAt(`${c.hash}^`, rel);
    const curr = blobAt(c.hash, rel);
    if (prev == null || curr == null) {
      // creación/rename en esta ruta → primer commit real → es un cambio de
      // contenido (o el nacimiento del archivo en su ruta actual).
      return c.date;
    }
    if (withoutMeta(prev) === withoutMeta(curr)) continue; // solo metadata
    return c.date;
  }
  return commits.length ? commits[commits.length - 1].date : null;
}

const fmtDate = (iso) => (iso ? iso.slice(0, 19) : ""); // "YYYY-MM-DD HH:MM:SS"

// ── procesamiento ──────────────────────────────────────────────────────────
const files = [];
for (const dir of DIRS) {
  const walk = (p) => {
    for (const entry of readdirSync(p)) {
      const full = join(p, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (EXTS.some((e) => entry.endsWith(e))) files.push(full);
    }
  };
  walk(dir);
}
files.sort();

const report = [];
let toWrite = 0;

for (const path of files) {
  const rel = path.slice(ROOT.length);
  const raw = readFileSync(path, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) {
    report.push({ rel, note: "⚠️  sin frontmatter: se omite" });
    continue;
  }
  let fm = m[1];

  const createdAt = fmtDate(createdAtDate(rel));
  const commits = commitsTouching(rel);
  const updatedAt = fmtDate(updatedAtDate(rel, commits));

  if (!createdAt && !updatedAt) {
    report.push({ rel, note: "⚠️  sin historial git (archivo sin trackear): se omite" });
    continue;
  }

  // Normalizar líneas existentes
  fm = fm.replace(/^createdAt:.*$/m, "").replace(/^updatedAt:.*$/m, "");
  // Limpiar posibles líneas vacías duplicadas al inicio
  fm = fm.replace(/^\n+/, "");

  const newFm = `createdAt: "${createdAt}"\nupdatedAt: "${updatedAt}"\n${fm}`;
  const newRaw = raw.replace(m[0], `---\n${newFm}\n---`);

  const changed = newRaw !== raw;
  if (changed) toWrite++;
  report.push({ rel, createdAt, updatedAt, changed });
}

// ── salida ─────────────────────────────────────────────────────────────────
for (const r of report) {
  if (r.note) {
    console.log(`${r.note}  ${r.rel}`);
  } else {
    const flag = r.changed ? "→" : "=";
    console.log(`${flag} ${r.rel}`);
    if (r.changed || process.argv.includes("--verbose")) {
      console.log(`    createdAt: ${r.createdAt}  updatedAt: ${r.updatedAt}`);
    }
  }
}
console.log(`\nArchivos procesados: ${files.length}`);
console.log(`Archivos a modificar: ${toWrite}`);

if (CHECK && toWrite > 0) {
  console.error(`\n❌ ${toWrite} archivo(s) con fechas desactualizadas. Corré el script con --apply.`);
  process.exit(1);
}

if (!APPLY) {
  console.log("\n⚠️  Modo dry-run: no se escribió nada. Usá --apply para aplicar.");
} else if (toWrite > 0) {
  for (const r of report) {
    if (r.changed) {
      const raw = readFileSync(join(ROOT, r.rel), "utf8");
      const fm = raw.match(/^---\n([\s\S]*?)\n---/)[1];
      const newFm = `createdAt: "${r.createdAt}"\nupdatedAt: "${r.updatedAt}"\n${fm
        .replace(/^createdAt:.*$/m, "")
        .replace(/^updatedAt:.*$/m, "")
        .replace(/^\n+/, "")}`;
      writeFileSync(join(ROOT, r.rel), raw.replace(/^---\n[\s\S]*?\n---/, `---\n${newFm}\n---`), "utf8");
    }
  }
  console.log(`\n✅ ${toWrite} archivo(s) actualizado(s).`);
}
