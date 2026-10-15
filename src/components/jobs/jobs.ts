import { parseDate, startOfDay, startOfToday } from "@/lib/dates";
import { QUOTAS } from "@/lib/jobs-domain";
import { getOrganizationSearchText } from "@/lib/organizations";
import type { JobFilters, JobRecord } from "@/types/jobs";

export const MAX_TITLE_LENGTH = 110;
export const ITEMS_PER_PAGE = 25;

// Strips Unicode format characters (soft hyphen, zero-width joiners, BOM…) that
// leak from scraped HTML and would otherwise create duplicate organisms.
export function stripInvisible(text: string | null | undefined) {
  return (text ?? "").normalize("NFC").replace(/\p{Cf}/gu, "");
}

function normalize(text: string | null | undefined) {
  return stripInvisible(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function cleanOption(value: string | null) {
  return stripInvisible(value).replace(/\s+/g, " ").trim() || "Sin dato";
}

export function shorten(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}...`;
}

export type JobDisplayStatus = "abierto" | "cerrado";

export const DISPLAY_STATUS_LABELS: Record<JobDisplayStatus, string> = {
  abierto: "Abierto",
  cerrado: "Cerrado",
};

export function getDisplayStatus(job: JobRecord): JobDisplayStatus {
  if (job.status === "cerrado") return "cerrado";
  if (job.status === "abierto") return "abierto";

  const today = startOfToday();
  const closing = parseDate(job.closingDate);

  if (!closing || startOfDay(closing) >= today) return "abierto";

  return "cerrado";
}

export function isUpcoming(job: JobRecord): boolean {
  const opening = parseDate(job.openingDate);

  return Boolean(opening && startOfDay(opening) > startOfToday());
}

/** ¿El llamado matchea los criterios de una búsqueda guardada? */
export function jobMatchesFilters(
  job: JobRecord,
  filters: JobFilters,
): boolean {
  if (filters.query) {
    const text = normalize(filters.query);
    const haystack = normalize(
      [
        job.title,
        job.position,
        job.callNumber,
        getOrganizationSearchText(job.organization ?? ""),
        job.subOrganization,
        job.location,
        job.taskType,
        job.tags.join(" "),
      ]
        .filter(Boolean)
        .join(" "),
    );
    if (!haystack.includes(text)) {
      return false;
    }
  }

  if (
    filters.organization &&
    cleanOption(job.organization) !== filters.organization
  ) {
    return false;
  }

  if (filters.taskType && cleanOption(job.taskType) !== filters.taskType) {
    return false;
  }

  for (const quota of QUOTAS) {
    if (filters[quota.filterKey] && !job.quotas[quota.quotaKey]) {
      return false;
    }
  }

  return true;
}

/** Filtra un dataset con los mismos criterios que usa el tablero de llamados. */
export function filterJobs(
  jobs: JobRecord[],
  filters: JobFilters,
): JobRecord[] {
  return jobs.filter((job) => jobMatchesFilters(job, filters));
}
