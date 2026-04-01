import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const outputPath = path.join(rootDir, "src/data/jobs.generated.json");
const sourceUrl =
  "https://gist.githubusercontent.com/GabrielDLeon/152fb922300190a5c43ecf0318ed0ce2/raw/d6339a99536217c20725f29f576227ba9b229cb2/concursos.json";
const sourceName = "uruguay-concursa";
const jobUrlBase =
  "https://www.uruguayconcursa.gub.uy/Portal/servlet/com.si.recsel.verllamado?";

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

function parseDateToIso(rawDate) {
  if (typeof rawDate !== "string") {
    return null;
  }

  const trimmed = rawDate.trim();
  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
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

function inferQuotas(rawQuotas) {
  const labels = Array.isArray(rawQuotas)
    ? rawQuotas
        .filter((quota) => typeof quota === "string")
        .map((quota) => normalizeText(quota))
    : [];

  const hasQuota = (matcher) => labels.some((label) => matcher(label));

  return {
    afrodescendientes: hasQuota((label) => label.includes("afrodescend")),
    discapacidad: hasQuota((label) => label.includes("discapacidad")),
    trans: hasQuota((label) => label.includes("trans")),
    victimasDelitosViolentos: hasQuota(
      (label) =>
        label.includes("victima") &&
        label.includes("delitos") &&
        label.includes("violentos"),
    ),
  };
}

function flattenRawJobs(payload) {
  if (!Array.isArray(payload)) {
    throw new Error("Invalid gist payload: root must be an array");
  }

  const flattened = [];

  for (const entry of payload) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    if (Array.isArray(entry.jobs)) {
      flattened.push(...entry.jobs);
      continue;
    }

    if ("id_llamado" in entry) {
      flattened.push(entry);
    }
  }

  if (flattened.length === 0) {
    throw new Error("Invalid gist payload: no jobs found");
  }

  return flattened;
}

function normalizeJob(rawJob, nowIso) {
  if (!rawJob || typeof rawJob !== "object") {
    throw new Error("Invalid job record: expected an object");
  }

  const sourceJobId = toNullableString(rawJob.id_llamado);
  const callNumber = toNullableString(rawJob.numero_llamado);
  const title = toNullableString(rawJob.descripcion);
  const statusRaw = toNullableString(rawJob.estado) ?? "otro";

  if (!sourceJobId || !callNumber || !title) {
    throw new Error(
      "Invalid job record: id_llamado, numero_llamado and descripcion are required",
    );
  }

  const openingDate = parseDateToIso(rawJob.fecha_publicacion);
  const closingDate = parseDateToIso(rawJob.fecha_cierre);

  return {
    id: `${sourceName}-${sourceJobId}`,
    source: sourceName,
    sourceJobId,
    callNumber,
    title,
    organization: toNullableString(rawJob.organismo),
    subOrganization: toNullableString(rawJob.sub_organismo),
    department: null,
    locality: null,
    inciso: null,
    taskType: toNullableString(rawJob.tipo_tarea),
    status: normalizeStatus(statusRaw),
    openingDate,
    closingDate,
    isNew: isRecent(openingDate, nowIso),
    quotas: inferQuotas(rawJob.cupos),
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

async function fetchSourceData() {
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(
      `Could not fetch source data (${response.status} ${response.statusText})`,
    );
  }

  return response.json();
}

async function writeDataset(dataset) {
  const outputDir = path.dirname(outputPath);
  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
}

const sourcePayload = await fetchSourceData();
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
