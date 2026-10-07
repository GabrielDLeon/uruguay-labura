import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react/offline";

import JobsList from "@/components/jobs/JobsList";
import JobsSkeleton from "@/components/jobs/JobsSkeleton";
import JobsTable from "@/components/jobs/JobsTable";
import { filterJobs, isClosingSoon } from "@/components/jobs/jobs";
import useJobs from "@/components/jobs/useJobs";
import { formatDateShort } from "@/lib/dates";
import { appIcons } from "@/lib/icons";
import {
  criteriaToSearchParams,
  describeCriteria,
  getSavedSearches,
  markSavedSearchSeen,
  removeSavedSearch,
  subscribeToSavedSearches,
} from "@/lib/saved-searches";
import type { JobRecord, SavedSearch } from "@/types/jobs";

type ViewportMode = "both" | "desktop" | "mobile";

interface SearchWithNews {
  search: SavedSearch;
  matches: JobRecord[];
  newJobs: JobRecord[];
  closingSoonJobs: JobRecord[];
}

function getNews(jobs: JobRecord[], search: SavedSearch): SearchWithNews {
  const matches = filterJobs(jobs, search.criteria);
  const seen = new Set(search.seenJobIds);
  const newJobs = matches.filter((job) => !seen.has(job.id));
  const newIds = new Set(newJobs.map((job) => job.id));
  const closingSoonJobs = matches.filter(
    (job) => !newIds.has(job.id) && isClosingSoon(job),
  );

  return { search, matches, newJobs, closingSoonJobs };
}

interface NewsGroupProps {
  title: string;
  jobs: JobRecord[];
  viewportMode: ViewportMode;
}

function NewsGroup({ title, jobs, viewportMode }: NewsGroupProps) {
  if (jobs.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">
        {title} ({jobs.length})
      </h3>
      {viewportMode !== "mobile" ? <JobsTable jobs={jobs} /> : null}
      {viewportMode !== "desktop" ? <JobsList jobs={jobs} /> : null}
    </section>
  );
}

export default function SavedSearchesBoard() {
  const { jobs, isLoading, loadError, retry } = useJobs();
  const [searches, setSearches] = useState<SavedSearch[] | null>(null);
  const [viewportMode, setViewportMode] = useState<ViewportMode>("both");

  useEffect(() => {
    const sync = () => setSearches(getSavedSearches());
    sync();
    return subscribeToSavedSearches(sync);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const applyMode = () => {
      setViewportMode(mediaQuery.matches ? "desktop" : "mobile");
    };

    applyMode();
    mediaQuery.addEventListener("change", applyMode);
    return () => mediaQuery.removeEventListener("change", applyMode);
  }, []);

  const news = useMemo(() => {
    if (!searches) return [];
    return searches.map((search) => getNews(jobs, search));
  }, [jobs, searches]);

  if (isLoading || searches === null) {
    return <JobsSkeleton />;
  }

  if (loadError) {
    return (
      <section className="grid gap-4">
        <p className="text-sm text-destructive">
          No se pudieron cargar los llamados. {loadError}
        </p>
        <div>
          <button type="button" className="btn" data-size="sm" onClick={retry}>
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  if (searches.length === 0) {
    return (
      <section className="flex flex-col items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--card-bg)] p-12 text-center">
        <p className="text-lg font-semibold text-foreground">
          Todavía no guardaste búsquedas
        </p>
        <p className="text-sm text-muted-foreground max-w-md">
          Filtrá los llamados como quieras y tocá “Guardar búsqueda”. Cuando
          vuelvas, acá vas a ver qué llamados nuevos aparecieron para cada
          búsqueda.
        </p>
        <a href="/empleos" className="btn">
          Explorar llamados
        </a>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {searches.length} búsqueda{searches.length !== 1 ? "s" : ""} guardada
        {searches.length !== 1 ? "s" : ""}. Las novedades se calculan en tu
        navegador cada vez que entrás.
      </p>

      {news.map(({ search, matches, newJobs, closingSoonJobs }) => {
        const newCount = newJobs.length;
        const params = criteriaToSearchParams(search.criteria).toString();
        const chips = describeCriteria(search.criteria);

        return (
          <article key={search.id} className="card flex flex-col gap-4">
            <header className="flex flex-wrap items-start gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-foreground">
                  {search.name}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {chips.length > 0 ? (
                    chips.map((chip) => (
                      <span
                        key={chip}
                        className="badge"
                        data-variant="secondary"
                      >
                        {chip}
                      </span>
                    ))
                  ) : (
                    <span className="badge" data-variant="secondary">
                      Todos los llamados
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {matches.length} llamado
                  {matches.length !== 1 ? "s" : ""} coincide
                  {matches.length !== 1 ? "n" : ""} hoy
                  {search.lastSeenAt
                    ? ` · Última visita: ${formatDateShort(search.lastSeenAt)}`
                    : ""}
                </p>
              </div>

              <div className="ml-auto flex flex-wrap items-center gap-2">
                {newCount > 0 ? (
                  <span
                    className="badge"
                    data-variant="success"
                    title="Nuevos desde tu última visita"
                  >
                    {newCount} nueva{newCount !== 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Sin novedades
                  </span>
                )}
              </div>
            </header>

            {newCount > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn"
                  data-size="sm"
                  onClick={() =>
                    markSavedSearchSeen(
                      search.id,
                      matches.map((job) => job.id),
                    )
                  }
                >
                  <Icon
                    icon={appIcons.check}
                    width="16"
                    height="16"
                    className="shrink-0"
                    aria-hidden="true"
                  />
                  Marcar como visto
                </button>
              </div>
            ) : null}

            {newCount > 0 || closingSoonJobs.length > 0 ? (
              <div className="flex flex-col gap-5">
                <NewsGroup
                  title="Nuevos desde tu última visita"
                  jobs={newJobs}
                  viewportMode={viewportMode}
                />
                <NewsGroup
                  title="Cierran pronto"
                  jobs={closingSoonJobs}
                  viewportMode={viewportMode}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {matches.length === 0
                  ? "Hoy no hay llamados que coincidan con esta búsqueda."
                  : "Estás al día: no hay llamados nuevos para esta búsqueda."}
              </p>
            )}

            <footer className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <a
                className="btn"
                data-size="sm"
                data-variant="outline"
                href={params ? `/empleos?${params}` : "/empleos"}
              >
                Ver resultados
              </a>
              <button
                type="button"
                className="btn ml-auto"
                data-size="sm"
                data-variant="ghost"
                onClick={() => removeSavedSearch(search.id)}
              >
                Eliminar
              </button>
            </footer>
          </article>
        );
      })}
    </section>
  );
}
