import { filterJobs, isClosingSoon } from "@/components/jobs/jobs";
import type { JobRecord, SavedSearch } from "@/types/jobs";

export interface SearchNews {
  search: SavedSearch;
  matches: JobRecord[];
  newJobs: JobRecord[];
  closingSoonJobs: JobRecord[];
}

/** Calcula las novedades de una búsqueda contra el dataset vigente. */
export function getSearchNews(
  jobs: JobRecord[],
  search: SavedSearch,
): SearchNews {
  const matches = filterJobs(jobs, search.criteria);
  const seen = new Set(search.seenJobIds);
  const newJobs = matches.filter((job) => !seen.has(job.id));
  const newIds = new Set(newJobs.map((job) => job.id));
  const closingSoonJobs = matches.filter(
    (job) => !newIds.has(job.id) && isClosingSoon(job),
  );

  return { search, matches, newJobs, closingSoonJobs };
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
