#!/usr/bin/env node
/**
 * Sync createdAt / updatedAt in content frontmatter
 * (src/content/{careers,institutions,scholarships}) with git history:
 *
 *   createdAt - author date of the first commit that added the file
 *               (follows renames with --follow)
 *   updatedAt - author date of the last commit that changed real content;
 *               metadata-only commits are ignored, so re-running is idempotent
 *
 * Dates use "YYYY-MM-DD HH:MM:SS" (local author time) and are placed right
 * below the status field (`draft` for careers/scholarships, `isActive` for
 * institutions), or at the end of the frontmatter.
 *
 * Usage:
 *   node scripts/update-content-dates.mjs           # dry-run
 *   node scripts/update-content-dates.mjs --apply   # write changes
 *   node scripts/update-content-dates.mjs --check   # fail if any stale date
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = new URL("..", import.meta.url).pathname;
const DIRS = ["careers", "institutions", "scholarships"].map((d) =>
  join(ROOT, "src", "content", d),
);
const EXTS = [".md", ".mdx"];
const APPLY = process.argv.includes("--apply");
const CHECK = process.argv.includes("--check");
const VERBOSE = process.argv.includes("--verbose");
const META_LINE = /^\s*(createdAt|updatedAt)\s*:/;

// ---- helpers ---------------------------------------------------------------

function git(args) {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"], // keep git noise off stdout/stderr
  });
}

/** Author date of the first commit that added the file (following renames). */
function createdAtDate(rel) {
  const log = git(["log", "--follow", "--diff-filter=A", "--format=%ai", "--", rel])
    .trim()
    .split("\n")
    .filter(Boolean);
  return log.at(-1) ?? null; // log is newest-first, so creation is last
}

/** Commits touching the file, newest first. */
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

/** File content at a commit, or null if the file did not exist there. */
function blobAt(commit, rel) {
  try {
    return git(["show", `${commit}:${rel}`]);
  } catch {
    return null;
  }
}

/** Content without the createdAt/updatedAt lines. */
function withoutMeta(text) {
  if (text == null) return text;
  return text.split("\n").filter((l) => !META_LINE.test(l)).join("\n");
}

/**
 * Date of the last commit that changed real content.
 * Skips commits whose only difference from their parent is the date lines.
 */
function updatedAtDate(rel, commits) {
  for (const c of commits) {
    const prev = blobAt(`${c.hash}^`, rel);
    const curr = blobAt(c.hash, rel);
    if (prev == null || curr == null) return c.date; // created/renamed here
    if (withoutMeta(prev) === withoutMeta(curr)) continue; // metadata-only
    return c.date;
  }
  return commits.at(-1)?.date ?? null;
}

const fmtDate = (iso) => (iso ? iso.slice(0, 19) : ""); // YYYY-MM-DD HH:MM:SS

/**
 * Insert the dates right below the status field (`draft`/`isActive`),
 * or append them at the end when no such field exists.
 */
function withDates(fm, createdAt, updatedAt) {
  const dates = `createdAt: "${createdAt}"\nupdatedAt: "${updatedAt}"`;
  const anchor = fm.match(/^([ \t]*(?:draft|isActive)\s*:.*)$/m);
  if (anchor) {
    const at = fm.indexOf(anchor[1]) + anchor[1].length;
    return `${fm.slice(0, at)}\n${dates}${fm.slice(at)}`;
  }
  return fm ? `${fm}\n${dates}` : dates;
}

// ---- main ------------------------------------------------------------------

const files = DIRS.flatMap((dir) =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && EXTS.some((ext) => e.name.endsWith(ext)))
    .map((e) => join(e.parentPath, e.name)),
).sort();

const report = [];

for (const file of files) {
  const rel = relative(ROOT, file);
  const raw = readFileSync(file, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) {
    report.push({ rel, note: "⚠️  sin frontmatter: se omite" });
    continue;
  }

  const createdAt = fmtDate(createdAtDate(rel));
  const updatedAt = fmtDate(updatedAtDate(rel, commitsTouching(rel)));

  if (!createdAt && !updatedAt) {
    report.push({ rel, note: "⚠️  sin historial git (archivo sin trackear): se omite" });
    continue;
  }

  const newFm = withDates(withoutMeta(m[1]).replace(/^\n+/, ""), createdAt, updatedAt);
  const newRaw = raw.replace(m[0], `---\n${newFm}\n---`);

  report.push({ rel, createdAt, updatedAt, changed: newRaw !== raw, newRaw });
}

const toWrite = report.filter((r) => r.changed).length;

// ---- output ----------------------------------------------------------------

for (const r of report) {
  if (r.note) {
    console.log(`${r.note}  ${r.rel}`);
  } else {
    console.log(`${r.changed ? "→" : "="} ${r.rel}`);
    if (r.changed || VERBOSE) {
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
    if (r.changed) writeFileSync(join(ROOT, r.rel), r.newRaw, "utf8");
  }
  console.log(`\n✅ ${toWrite} archivo(s) actualizado(s).`);
}
