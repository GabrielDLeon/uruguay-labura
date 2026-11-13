import fs from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { AstroIntegration } from "astro";
import {
  close as closePagefind,
  createIndex,
  type CustomRecord,
  type PagefindServiceConfig,
} from "pagefind";

import type { JobDetailsDataset, JobRecord } from "../src/types/jobs";

const MIME_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
};

/** Job listings, which are not rendered as pages. */
export interface JobsRecordsOptions {
  dataPath: string;
  detailsPath: string;
  urlPrefix: string;
}

export interface PagefindOptions {
  indexConfig?: PagefindServiceConfig;
  /** Set to `false` to index the rendered pages only. */
  jobs?: JobsRecordsOptions | false;
}

const DEFAULT_JOBS: JobsRecordsOptions = {
  dataPath: "src/data/jobs.generated.json",
  detailsPath: "src/data/job-details.generated.json",
  urlPrefix: "/empleos?job=",
};

interface JobsDataset {
  jobs: JobRecord[];
}

function readDataset<T>(root: string, relativePath: string): T | null {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(root, relativePath), "utf-8"),
    ) as T;
  } catch {
    // The datasets are generated, so they may be missing on a clean checkout.
    return null;
  }
}

function markdownToText(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function joinParts(parts: Array<string | number | null | undefined>): string {
  return parts
    .filter((part) => part !== null && part !== undefined && part !== "")
    .join("\n");
}

/** One record per job listing, with its detail text. */
export function buildJobRecords(
  root: string,
  options: JobsRecordsOptions,
): CustomRecord[] {
  const dataset = readDataset<JobsDataset>(root, options.dataPath);
  if (!dataset?.jobs?.length) return [];

  const details = readDataset<JobDetailsDataset>(root, options.detailsPath);
  const detailById = new Map(
    (details?.details ?? [])
      .filter((detail) => detail.markdown)
      .map((detail) => [detail.id, markdownToText(detail.markdown ?? "")]),
  );

  return dataset.jobs.map((job) => {
    const detail = detailById.get(job.id);
    const quotas = [
      job.quotas.afrodescendientes && "cuota afrodescendiente",
      job.quotas.discapacidad && "cuota discapacidad",
      job.quotas.trans && "cuota trans",
      job.quotas.victimasDelitosViolentos &&
        "cuota víctimas de delitos violentos",
    ].filter((quota): quota is string => typeof quota === "string");

    const content = joinParts([
      job.title,
      job.callNumber && `Llamado ${job.callNumber}`,
      job.organization,
      job.subOrganization !== job.organization ? job.subOrganization : null,
      job.taskType,
      job.grado,
      job.location,
      job.contractType,
      job.totalPositions ? `${job.totalPositions} puestos` : null,
      job.openingDate && `Apertura ${job.openingDate}`,
      job.closingDate && `Cierre ${job.closingDate}`,
      job.status,
      ...quotas,
      ...job.tags,
      detail,
    ]);

    return {
      url: `${options.urlPrefix}${encodeURIComponent(job.id)}`,
      language: "es",
      content,
      meta: {
        title: job.title,
        kind: "llamado",
        description: joinParts([job.organization, job.taskType]).replace(
          /\n/g,
          " · ",
        ),
        organization: job.organization ?? "",
        taskType: job.taskType ?? "",
        status: job.status,
        closingDate: job.closingDate ?? "",
        callNumber: job.callNumber,
      },
    };
  });
}

/**
 * Static builds write the index to the output root, adapter builds to the
 * client directory.
 */
export function resolveIndexDir(candidates: string[]): string | undefined {
  return candidates.find((dir) =>
    fs.existsSync(path.join(dir, "pagefind", "pagefind-entry.json")),
  );
}

/** `astro dev` has no index of its own, so serve the last build's. */
function serveIndex(
  candidates: string[],
  base: string,
): (req: IncomingMessage, res: ServerResponse, next: () => void) => void {
  const prefix = `${base.replace(/\/$/, "")}/pagefind/`;
  let indexRoot: string | undefined;
  let missingLogged = false;

  return (req, res, next) => {
    const pathname = new URL(req.url ?? "", "http://localhost").pathname;
    if (!pathname.startsWith(prefix)) return next();

    // Resolved lazily so a build run while `astro dev` is open is picked up.
    indexRoot ??= resolveIndexDir(candidates);

    const indexDir = indexRoot && path.join(indexRoot, "pagefind");

    if (!indexDir) {
      if (!missingLogged) {
        missingLogged = true;
        console.log(
          `[pagefind] No search index found in ${candidates.join(" or ")}. Run \`pnpm build\` to create one.`,
        );
      }
      res.statusCode = 404;
      res.end("Not found");
      return;
    }

    const relativePath = decodeURIComponent(pathname.slice(prefix.length));
    const filePath = path.join(indexDir, relativePath);

    if (!filePath.startsWith(indexDir)) return next();

    fs.readFile(filePath, (error, data) => {
      if (error) {
        if (!missingLogged) {
          missingLogged = true;
          console.log(
            `[pagefind] No search index in ${indexDir}. Run \`pnpm build\` to create one.`,
          );
        }
        res.statusCode = 404;
        res.end("Not found");
        return;
      }

      res.statusCode = 200;
      res.setHeader(
        "Content-Type",
        MIME_TYPES[path.extname(filePath)] ?? "application/octet-stream",
      );
      res.setHeader("Cache-Control", "no-cache");
      res.end(data);
    });
  };
}

export default function pagefind({
  indexConfig,
  jobs = DEFAULT_JOBS,
}: PagefindOptions = {}): AstroIntegration {
  let root = process.cwd();
  let indexCandidates: string[] = [];
  let base = "/";

  return {
    name: "pagefind",
    hooks: {
      "astro:config:setup": ({ config }) => {
        root = fileURLToPath(config.root);
        const clientDir = fileURLToPath(config.build.client);
        indexCandidates = [clientDir, path.dirname(clientDir)];
        base = config.base;
      },

      "astro:server:setup": ({ server }) => {
        server.middlewares.use(serveIndex(indexCandidates, base));
      },

      "astro:build:done": async ({ dir, logger }) => {
        const buildDir = fileURLToPath(dir);
        const started = performance.now();

        const { index, errors: createErrors } = await createIndex(indexConfig);
        if (!index) {
          throw new Error(
            `Pagefind failed to create the index: ${createErrors.join("; ")}`,
          );
        }

        try {
          const { page_count, errors } = await index.addDirectory({
            path: buildDir,
          });
          if (errors.length > 0) {
            throw new Error(
              `Pagefind failed to index the build output: ${errors.join("; ")}`,
            );
          }
          logger.info(`Indexed ${page_count} pages`);

          if (jobs) {
            const records = buildJobRecords(root, jobs);
            for (const record of records) {
              const { errors: recordErrors } =
                await index.addCustomRecord(record);
              if (recordErrors.length > 0) {
                logger.warn(
                  `Skipped "${record.meta?.title ?? record.url}": ${recordErrors.join("; ")}`,
                );
              }
            }
            logger.info(`Indexed ${records.length} job listings`);
          }

          const { errors: writeErrors } = await index.writeFiles({
            outputPath: path.join(buildDir, "pagefind"),
          });
          if (writeErrors.length > 0) {
            throw new Error(
              `Pagefind failed to write the index: ${writeErrors.join("; ")}`,
            );
          }

          const elapsed = performance.now() - started;
          logger.info(`Search index ready in ${Math.round(elapsed)}ms`);
        } finally {
          await closePagefind();
        }
      },
    },
  };
}
