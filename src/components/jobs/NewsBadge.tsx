import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react/offline";

import { appIcons } from "@/lib/icons";
import { filterActiveJobs, loadJobsDataset } from "@/lib/jobs-dataset";
import { countUniqueNewJobs, getSearchesNews } from "@/lib/search-news";
import {
  getSavedSearches,
  subscribeToSavedSearches,
} from "@/lib/saved-searches";
import type { JobRecord, SavedSearch } from "@/types/jobs";

/**
 * Contador global de novedades para el header. Solo descarga el dataset si el
 * usuario tiene búsquedas guardadas; si no, no renderiza nada.
 */
export default function NewsBadge() {
  const [searches, setSearches] = useState<SavedSearch[] | null>(null);
  const [jobs, setJobs] = useState<JobRecord[]>([]);

  useEffect(() => {
    const sync = () => setSearches(getSavedSearches());
    sync();
    return subscribeToSavedSearches(sync);
  }, []);

  const hasSearches = searches !== null && searches.length > 0;

  useEffect(() => {
    if (!hasSearches) {
      return;
    }

    let active = true;
    loadJobsDataset()
      .then((dataset) => {
        if (active) {
          setJobs(filterActiveJobs(dataset.jobs));
        }
      })
      .catch(() => {
        // El badge es secundario: si falla, simplemente no muestra conteo.
      });

    return () => {
      active = false;
    };
  }, [hasSearches]);

  const newsCount = useMemo(() => {
    if (!searches) {
      return 0;
    }

    return countUniqueNewJobs(getSearchesNews(jobs, searches));
  }, [jobs, searches]);

  if (!hasSearches) {
    return null;
  }

  const label =
    newsCount > 0
      ? `${newsCount} llamado${newsCount !== 1 ? "s" : ""} nuevo${
          newsCount !== 1 ? "s" : ""
        } en tus búsquedas`
      : "Búsquedas guardadas, sin novedades";

  return (
    <a
      href="/empleos/guardados?tab=busquedas"
      className="btn relative"
      data-variant="outline"
      data-size="icon-sm"
      aria-label={label}
      title={label}
    >
      <Icon
        icon={newsCount > 0 ? appIcons.star : appIcons.starOutline}
        width="24"
        height="24"
        aria-hidden="true"
      />
      {newsCount > 0 ? (
        <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--destructive)] px-1 text-[10px] leading-none font-semibold text-white">
          {newsCount > 99 ? "99+" : newsCount}
        </span>
      ) : null}
    </a>
  );
}
