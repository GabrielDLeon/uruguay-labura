import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceUrl = process.env.SOURCE_URL;
if (!sourceUrl) {
  throw new Error("SOURCE_URL no definida en .env");
}

export async function fetchAndProcessJobs(sourceUrl) {
  const rootDir = process.cwd();
  const outputPath = path.join(rootDir, "src/data/jobs.generated.json");
  const sourceName = "uruguay-concursa";
  const jobUrlBase = "https://www.uruguayconcursa.gub.uy/llamado/";

  function toNullableString(value) {
    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  function normalizeText(value) {
    return value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();
  }

  function normalizeStatus(rawStatus) {
    const status = normalizeText(rawStatus);

    if (status === "abierto") {
      return "abierto";
    }

    if (status === "cerrado") {
      return "cerrado";
    }

    return "otro";
  }

  function isRecent(openingDateIso, nowIso) {
    if (!openingDateIso) {
      return false;
    }

    const openingDate = new Date(`${openingDateIso}T00:00:00.000Z`);
    const now = new Date(nowIso);

    if (Number.isNaN(openingDate.getTime()) || Number.isNaN(now.getTime())) {
      return false;
    }

    const diffInMs = now.getTime() - openingDate.getTime();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    return diffInMs >= 0 && diffInMs <= sevenDaysInMs;
  }

  function flattenRawJobs(payload) {
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid gist payload: root must be an object");
    }

    if (!Array.isArray(payload.jobs) || payload.jobs.length === 0) {
      throw new Error(
        "Invalid gist payload: root.jobs must be a non-empty array",
      );
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
    const statusRaw = toNullableString(rawJob.status) ?? "otro";

    if (!sourceJobId || !callNumber || !title) {
      throw new Error(
        "Invalid job record: source_job_id, call_number and title are required",
      );
    }

    const openingDate = toNullableString(rawJob.opening_date);
    const closingDate = toNullableString(rawJob.closing_date);
    const vinculoType = toNullableString(rawJob.link_type);
    const totalPositions =
      typeof rawJob.total_positions === "number"
        ? rawJob.total_positions
        : null;

    return {
      id: `${sourceName}-${sourceJobId}`,
      source: sourceName,
      sourceJobId,
      callNumber,
      title,
      organization: toNullableString(rawJob.organization),
      subOrganization: toNullableString(rawJob.sub_organization),
      department: null,
      locality: null,
      inciso: null,
      taskType: toNullableString(rawJob.task_type),
      status: normalizeStatus(statusRaw),
      openingDate,
      closingDate,
      isNew: isRecent(openingDate, nowIso),
      quotas: {
        afrodescendientes: Boolean(rawJob.quota_afro),
        discapacidad: Boolean(rawJob.quota_disability),
        trans: Boolean(rawJob.quota_trans),
        victimasDelitosViolentos: Boolean(rawJob.quota_victims),
      },
      vinculoType,
      totalPositions,
      detailUrl: `${jobUrlBase}${sourceJobId}`,
      applyUrl: `${jobUrlBase}${sourceJobId}`,
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
      const response = await fetch(source);

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

  const sourcePayload = await readSourceData(sourceUrl);
  const nowIso = new Date().toISOString();
  const rawJobs = flattenRawJobs(sourcePayload);
  const jobs = sortJobsByClosingDate(
    rawJobs.map((rawJob) => normalizeJob(rawJob, nowIso)),
  );

  const normalized = {
    source: sourceName,
    scrapedAt: nowIso,
    total: jobs.length,
    jobs,
  };

  await writeDataset(normalized);

  console.log(
    `[prebuild-jobs] Dataset ready at src/data/jobs.generated.json with ${jobs.length} jobs`,
  );
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  await fetchAndProcessJobs(sourceUrl);
}
