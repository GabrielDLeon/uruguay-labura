import { filterJobs } from "@/components/jobs/jobs";
import type { JobRecord, SavedSearch } from "@/types/jobs";

export interface SearchNews {
  search: SavedSearch;
  /** Todo el listado vigente que engloba la búsqueda. */
  matches: JobRecord[];
  /** Subconjunto nuevo respecto de la última visita. */
  newJobs: JobRecord[];
}

/** Calcula las novedades de una búsqueda contra el dataset vigente. */
export function getSearchNews(
  jobs: JobRecord[],
  search: SavedSearch,
): SearchNews {
  const matches = filterJobs(jobs, search.criteria);
  const seen = new Set(search.seenJobIds);
  const newJobs = matches.filter((job) => !seen.has(job.id));

  return { search, matches, newJobs };
}

export function getSearchesNews(
  jobs: JobRecord[],
  searches: SavedSearch[],
): SearchNews[] {
  return searches.map((search) => getSearchNews(jobs, search));
}

/** Cantidad de llamados nuevos únicos sumando todas las búsquedas. */
export function countUniqueNewJobs(news: SearchNews[]): number {
  const ids = new Set<string>();
  for (const item of news) {
    for (const job of item.newJobs) {
      ids.add(job.id);
    }
  }
  return ids.size;
}
