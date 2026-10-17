import { addDays, parseDate, startOfDay, startOfToday } from "@/lib/dates";
import type {
  DashboardData,
  JobQuotaFlags,
  JobRecord,
  QuotaJobsCounts,
} from "@/types/jobs";

/**
 * Fuente única de los cupos: clave del filtro (`JobFilters`), clave del flag
 * (`JobQuotaFlags`) y etiqueta visible. Todo lo que lista cupos deriva de acá.
 */
export const QUOTAS = [
  {
    filterKey: "afro",
    quotaKey: "afrodescendientes",
    dashboardKey: "afrodescendientes",
    label: "Afrodescendientes",
  },
  {
    filterKey: "discapacidad",
    quotaKey: "discapacidad",
    dashboardKey: "discapacidad",
    label: "Discapacidad",
  },
  {
    filterKey: "trans",
    quotaKey: "trans",
    dashboardKey: "trans",
    label: "Personas trans",
  },
  {
    filterKey: "victimas",
    quotaKey: "victimasDelitosViolentos",
    dashboardKey: "victimas",
    label: "Víctimas de delitos violentos",
  },
] as const satisfies readonly {
  filterKey: "afro" | "discapacidad" | "trans" | "victimas";
  quotaKey: keyof JobQuotaFlags;
  dashboardKey: keyof QuotaJobsCounts;
  label: string;
}[];

/** Llamado vigente: ni cerrado ni con cierre vencido. Fuente única de "activo". */
export function isJobActive(
  job: Pick<JobRecord, "status" | "closingDate">,
  today: Date = startOfToday(),
): boolean {
  if (job.status === "cerrado") return false;
  if (!job.closingDate) return true;
  const closing = parseDate(job.closingDate);
  if (!closing) return true;
  return startOfDay(closing) >= today;
}

export function filterActiveJobs(
  jobs: JobRecord[],
  today: Date = startOfToday(),
): JobRecord[] {
  return jobs.filter((job) => isJobActive(job, today));
}

/** Estadísticas agregadas de los llamados vigentes, calculadas en build. */
export function computeDashboard(
  jobs: JobRecord[],
  scrapedAt: string,
): DashboardData {
  const reference = parseDate(scrapedAt) ?? new Date();
  const todayStart = startOfDay(reference);
  const activeJobs = filterActiveJobs(jobs, todayStart);

  const orgCounts = new Map<string, number>();
  for (const job of activeJobs) {
    if (job.organization) {
      orgCounts.set(
        job.organization,
        (orgCounts.get(job.organization) ?? 0) + 1,
      );
    }
  }
  const topOrganizations = [...orgCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const taskTypeCounts = new Map<string, number>();
  for (const job of activeJobs) {
    if (job.taskType) {
      taskTypeCounts.set(
        job.taskType,
        (taskTypeCounts.get(job.taskType) ?? 0) + 1,
      );
    }
  }
  const totalWithType = activeJobs.reduce(
    (sum, job) => sum + (job.taskType ? 1 : 0),
    0,
  );
  const taskTypeDistribution = [...taskTypeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      percentage:
        totalWithType > 0 ? Math.round((count / totalWithType) * 1000) / 10 : 0,
    }));

  const quotaJobs: QuotaJobsCounts = {
    afrodescendientes: 0,
    trans: 0,
    discapacidad: 0,
    victimas: 0,
  };
  for (const quota of QUOTAS) {
    quotaJobs[quota.dashboardKey] = activeJobs.filter(
      (job) => job.quotas[quota.quotaKey],
    ).length;
  }

  const sevenDaysFromNow = addDays(todayStart, 7);
  const closingByDate = new Map<string, number>();
  for (const job of activeJobs) {
    if (!job.closingDate) continue;
    const closing = parseDate(job.closingDate);
    if (!closing) continue;
    const closeDay = startOfDay(closing);
    if (closeDay >= todayStart && closeDay <= sevenDaysFromNow) {
      closingByDate.set(
        job.closingDate,
        (closingByDate.get(job.closingDate) ?? 0) + 1,
      );
    }
  }
  const byDate = [...closingByDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));
  const totalClosing = byDate.reduce((sum, day) => sum + day.count, 0);

  return {
    topOrganizations,
    taskTypeDistribution,
    quotaJobs,
    next7Days: { totalClosing, byDate },
    evolution: [
      {
        date: scrapedAt,
        total: activeJobs.length,
        organizations: topOrganizations.length,
      },
    ],
  };
}
