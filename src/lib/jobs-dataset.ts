import { parseDate, startOfDay, startOfToday } from "@/lib/dates";
import type { JobRecord } from "@/types/jobs";

export interface JobsDatasetPayload {
  jobs: JobRecord[];
  scrapedAt: string;
}

const JOBS_DATASET_URL = "/jobs.generated.json";

/**
 * Cache a nivel de módulo: el tablero, el centro de novedades y el badge del
 * header comparten una única descarga del dataset dentro de la misma página.
 */
let cachedDataset: JobsDatasetPayload | null = null;
let inflightRequest: Promise<JobsDatasetPayload> | null = null;

function isJobsDatasetPayload(value: unknown): value is JobsDatasetPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<JobsDatasetPayload>;
  return (
    Array.isArray(payload.jobs) && typeof payload.scrapedAt === "string"
  );
}

/**
 * Descarga (o reutiliza) el dataset de llamados.
 * `force` ignora la cache y vuelve a pedirlo (usado por el reintento).
 */
export function loadJobsDataset(force = false): Promise<JobsDatasetPayload> {
  if (!force && cachedDataset) {
    return Promise.resolve(cachedDataset);
  }

  if (!force && inflightRequest) {
    return inflightRequest;
  }

  let request: Promise<JobsDatasetPayload>;
  request = fetch(JOBS_DATASET_URL, {
    headers: { Accept: "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`No se pudo cargar el dataset (${response.status})`);
      }

      return response.json();
    })
    .then((payload: unknown) => {
      if (!isJobsDatasetPayload(payload)) {
        throw new Error("Dataset con formato invalido");
      }

      cachedDataset = payload;
      return payload;
    })
    .finally(() => {
      if (inflightRequest === request) {
        inflightRequest = null;
      }
    });

  inflightRequest = request;
  return request;
}

/** Solo llamados vigentes: sin cierre o con cierre hoy o después. */
export function filterActiveJobs(jobs: JobRecord[]): JobRecord[] {
  const today = startOfToday();

  return jobs.filter((job) => {
    if (!job.closingDate) return true;
    const closing = parseDate(job.closingDate);
    if (!closing) return true;
    return startOfDay(closing) >= today;
  });
}
