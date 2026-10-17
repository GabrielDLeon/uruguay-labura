import "dotenv/config";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceUrl = process.env.SOURCE_URL;
const rootDir = process.cwd();
const outputPath = path.join(rootDir, "src/data/jobs.generated.json");
const datasetExists = existsSync(outputPath);

if (!sourceUrl && !datasetExists) {
  throw new Error("SOURCE_URL no definida en .env y no existe dataset previo");
}

export async function fetchAndProcessJobs(sourceUrl) {
  const rootDir = process.cwd();
  const outputPath = path.join(rootDir, "src/data/jobs.generated.json");
  const ucJobUrlBase = "https://www.uruguayconcursa.gub.uy/llamado/";

  function toNullableString(value) {
    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  function stripInvisible(text) {
    return text
      .normalize("NFC")
      .replace(/\p{Cf}/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function toCleanString(value) {
    const text = toNullableString(value);
    if (!text) {
      return null;
    }

    return stripInvisible(text) || null;
  }

  function passthroughModalidad(value) {
    if (Array.isArray(value))
      return value.map((v) => String(v)).filter(Boolean);
    if (typeof value !== "string") return [];
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed))
        return parsed.map((v) => String(v)).filter(Boolean);
    } catch {
      /* plain string */
    }
    return [trimmed];
  }

  function normalizeText(value) {
    return value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();
  }

  function normalizeStatus(rawStatus) {
    const status = normalizeText(rawStatus ?? "");
    if (status === "abierto") return "abierto";
    if (status === "cerrado") return "cerrado";
    return "otro";
  }

  function flattenRawJobs(payload) {
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid gist payload: root must be an object");
    }

    if (!Array.isArray(payload.jobs)) {
      throw new Error("Invalid gist payload: root.jobs must be an array");
    }

    return payload.jobs;
  }

  function normalizeJob(rawJob, nowIso) {
    if (!rawJob || typeof rawJob !== "object") {
      throw new Error("Invalid job record: expected an object");
    }

    const sourceJobId = toNullableString(rawJob.source_job_id);
    const callNumber = toNullableString(rawJob.call_number);
    const title = toNullableString(rawJob.title);
    const source = toNullableString(rawJob.source) ?? "uruguay-concursa";
    const status = normalizeStatus(rawJob.status);

    if (!sourceJobId || !callNumber || !title) {
      throw new Error(
        "Invalid job record: source_job_id, call_number and title are required",
      );
    }

    const openingDate = toNullableString(rawJob.opening_date);
    const closingDate = toNullableString(rawJob.closing_date);
    const contractType = toNullableString(rawJob.link_type);
    const totalPositions =
      typeof rawJob.total_positions === "number"
        ? rawJob.total_positions
        : null;
    const origin =
      toNullableString(rawJob.detail_url) ?? `${ucJobUrlBase}${sourceJobId}`;
    const applyUrl = toNullableString(rawJob.apply_url) ?? origin;
    const applyEmail = toNullableString(rawJob.apply_email);
    const documents = Array.isArray(rawJob.documentos)
      ? rawJob.documentos
          .map((item) => ({
            id: toNullableString(String(item?.id ?? "")) ?? "",
            name: toNullableString(item?.nombre) ?? "",
          }))
          .filter((item) => item.id.length > 0 && item.name.length > 0)
      : [];

    return {
      id: `${source}-${sourceJobId}`,
      source,
      sourceJobId,
      callNumber,
      title,
      position: toNullableString(rawJob.cargo),
      location: toNullableString(rawJob.lugar),
      modalidad: passthroughModalidad(rawJob.modalidad),
      grado: toNullableString(rawJob.grado),
      organization: toCleanString(rawJob.organization),
      subOrganization: toCleanString(rawJob.sub_organization),
      taskType: toNullableString(rawJob.task_type),
      status,
      openingDate,
      closingDate,
      quotas: {
        afrodescendientes: Boolean(rawJob.quota_afro),
        discapacidad: Boolean(rawJob.quota_disability),
        trans: Boolean(rawJob.quota_trans),
        victimasDelitosViolentos: Boolean(rawJob.quota_victims),
      },
      contractType,
      totalPositions,
      tags: Array.isArray(rawJob.tags) ? rawJob.tags : [],
      documents,
      origin,
      applyUrl,
      applyEmail,
      scrapedAt: nowIso,
    };
  }

  function compareNullableIsoDatesAsc(leftDate, rightDate) {
    if (leftDate === rightDate) {
      return 0;
    }

    if (!leftDate) {
      return 1;
    }

    if (!rightDate) {
      return -1;
    }

    return leftDate.localeCompare(rightDate);
  }

  function sortJobsByClosingDate(jobs) {
    return [...jobs].sort((left, right) => {
      const byClosing = compareNullableIsoDatesAsc(
        left.closingDate,
        right.closingDate,
      );
      if (byClosing !== 0) {
        return byClosing;
      }

      const byOpening = compareNullableIsoDatesAsc(
        left.openingDate,
        right.openingDate,
      );
      if (byOpening !== 0) {
        return byOpening;
      }

      return left.callNumber.localeCompare(right.callNumber, "es");
    });
  }

  async function readSourceData(source) {
    if (source.startsWith("http://") || source.startsWith("https://")) {
      const headers = {};
      const authToken = process.env.AUTH_TOKEN;
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const response = await fetch(source, { headers });

      if (!response.ok) {
        throw new Error(
          `Could not fetch source data (${response.status} ${response.statusText})`,
        );
      }

      return response.json();
    }

    const absolutePath = path.resolve(process.cwd(), source);
    const content = await readFile(absolutePath, "utf8");
    return JSON.parse(content);
  }

  async function writeDataset(dataset) {
    const outputDir = path.dirname(outputPath);
    await mkdir(outputDir, { recursive: true });
    await writeFile(
      outputPath,
      `${JSON.stringify(dataset, null, 2)}\n`,
      "utf8",
    );
  }

  async function writeDetailsDataset(dataset) {
    const detailsPath = path.join(
      rootDir,
      "src/data/job-details.generated.json",
    );
    await mkdir(path.dirname(detailsPath), { recursive: true });
    await writeFile(
      detailsPath,
      `${JSON.stringify(dataset, null, 2)}\n`,
      "utf8",
    );
  }

  const sourcePayload = await readSourceData(sourceUrl);
  // Day precision: keeps the generated dataset byte-identical between builds
  // on the same day, so the module hash of jobs.generated.json doesn't change.
  const nowIso = new Date().toISOString().slice(0, 10);
  const rawJobs = flattenRawJobs(sourcePayload);
  const jobsWithDetails = sortJobsByClosingDate(
    rawJobs.map((rawJob) => ({
      ...normalizeJob(rawJob, nowIso),
      detailMarkdown: toNullableString(rawJob.detail_markdown),
    })),
  );
  // Details are kept out of jobs.generated.json so the browser only downloads
  // the detail of the job the visitor opens, from /empleos/<id>.json. Closed
  // jobs are dropped here so their detail page and JSON stop existing.
  const details = jobsWithDetails
    .filter(
      (job) =>
        job.detailMarkdown &&
        job.status !== "cerrado" &&
        (!job.closingDate || job.closingDate >= nowIso),
    )
    .map((job) => ({ id: job.id, markdown: job.detailMarkdown }));
  const jobs = jobsWithDetails.map(({ detailMarkdown, ...job }) => job);

  const normalized = {
    source: "multiple",
    scrapedAt: nowIso,
    total: jobs.length,
    jobs,
  };

  await writeDataset(normalized);
  await writeDetailsDataset({
    scrapedAt: nowIso,
    total: details.length,
    details,
  });

  console.log(
    `[prebuild-jobs] Dataset ready at src/data/jobs.generated.json with ${jobs.length} jobs`,
  );
  console.log(
    `[prebuild-jobs] Job details ready at src/data/job-details.generated.json with ${details.length} entries`,
  );
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  if (!sourceUrl && datasetExists) {
    console.log("[prebuild-jobs] No SOURCE_URL, using existing dataset");
  } else {
    await fetchAndProcessJobs(sourceUrl);
  }
}
