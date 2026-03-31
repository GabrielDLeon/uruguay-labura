import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const outputPath = path.join(rootDir, "src/data/jobs.generated.json");
const defaultScraperPath = path.join(rootDir, "scripts/scrape_jobs.py");

function buildEmptyDataset() {
  return {
    source: "uruguay-concursa",
    scrapedAt: new Date().toISOString(),
    total: 0,
    jobs: [],
  };
}

function runScraper() {
  const customCommand = process.env.JOBS_SCRAPER_CMD;

  if (customCommand) {
    execSync(customCommand, { stdio: "inherit", cwd: rootDir, shell: true });
    return;
  }

  if (existsSync(defaultScraperPath)) {
    execSync(`python3 "${defaultScraperPath}"`, {
      stdio: "inherit",
      cwd: rootDir,
      shell: true,
    });
    return;
  }

  console.log(
    "[prebuild-jobs] No scraper detected. Using existing generated data file.",
  );
}

async function ensureOutputExists() {
  const outputDir = path.dirname(outputPath);
  await mkdir(outputDir, { recursive: true });

  if (!existsSync(outputPath)) {
    const fallback = buildEmptyDataset();
    await writeFile(
      outputPath,
      `${JSON.stringify(fallback, null, 2)}\n`,
      "utf8",
    );
  }
}

async function normalizeOutput() {
  const content = await readFile(outputPath, "utf8");
  const parsed = JSON.parse(content);

  if (!Array.isArray(parsed.jobs)) {
    throw new Error("Invalid jobs dataset: jobs must be an array");
  }

  const normalized = {
    source:
      typeof parsed.source === "string" && parsed.source.length > 0
        ? parsed.source
        : "unknown",
    scrapedAt:
      typeof parsed.scrapedAt === "string" && parsed.scrapedAt.length > 0
        ? parsed.scrapedAt
        : new Date().toISOString(),
    total: parsed.jobs.length,
    jobs: parsed.jobs,
  };

  await writeFile(
    outputPath,
    `${JSON.stringify(normalized, null, 2)}\n`,
    "utf8",
  );
}

await ensureOutputExists();
runScraper();
await ensureOutputExists();
await normalizeOutput();

console.log("[prebuild-jobs] Dataset ready at src/data/jobs.generated.json");
