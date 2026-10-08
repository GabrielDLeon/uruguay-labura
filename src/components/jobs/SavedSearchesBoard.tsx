import { useEffect, useMemo, useState } from "react";

import JobsSkeleton from "@/components/jobs/JobsSkeleton";
import SavedSearchCard from "@/components/jobs/SavedSearchCard";
import useJobs from "@/components/jobs/useJobs";
import { formatDateShort } from "@/lib/dates";
import {
  getSavedSearches,
  markSavedSearchSeen,
  removeSavedSearch,
  renameSavedSearch,
  subscribeToSavedSearches,
} from "@/lib/saved-searches";
import { countUniqueNewJobs, getSearchesNews } from "@/lib/search-news";
import type { SavedSearch } from "@/types/jobs";

export default function SavedSearchesBoard() {
  const { jobs, isLoading, loadError, retry, scrapedAt } = useJobs();
  const [searches, setSearches] = useState<SavedSearch[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setSearches(getSavedSearches());
    sync();
    return subscribeToSavedSearches(sync);
  }, []);

  const news = useMemo(() => {
    if (!searches) return [];
    return getSearchesNews(jobs, searches);
  }, [jobs, searches]);

  const totalNews = useMemo(() => countUniqueNewJobs(news), [news]);

  // Al entrar, abrimos la primera búsqueda con novedades.
  useEffect(() => {
    if (openId !== null || news.length === 0) {
      return;
    }

    const first = news.find((item) => item.newJobs.length > 0);
    if (first) {
      setOpenId(first.search.id);
    }
  }, [news, openId]);

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
      <section className="flex flex-col items-center gap-4 rounded-lg border border-border bg-muted/30 p-12 text-center">
        <p className="text-lg font-semibold text-foreground">
          Todavía no guardaste búsquedas
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          Filtrá los llamados como quieras y tocá “Guardar búsqueda”. Cuando
          vuelvas, acá vas a ver qué llamados nuevos aparecieron.
        </p>
        <a href="/empleos" className="btn">
          Explorar llamados
        </a>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <p className="text-sm text-muted-foreground" role="status">
        {searches.length} búsqueda{searches.length !== 1 ? "s" : ""} guardada
        {searches.length !== 1 ? "s" : ""}.{" "}
        {totalNews > 0
          ? `Tenés ${totalNews} llamado${totalNews !== 1 ? "s" : ""} nuevo${
              totalNews !== 1 ? "s" : ""
            } en tus búsquedas.`
          : "Estás al día."}
        {scrapedAt ? ` · Actualizado: ${formatDateShort(scrapedAt)}` : ""}
      </p>

      <div className="grid gap-4">
        {news.map(({ search, matches, newJobs, closingSoonJobs }) => (
          <SavedSearchCard
            key={search.id}
            search={search}
            matchCount={matches.length}
            newJobs={newJobs}
            closingSoonJobs={closingSoonJobs}
            open={openId === search.id}
            updatedAt={scrapedAt}
            onToggle={() =>
              setOpenId((current) =>
                current === search.id ? null : search.id,
              )
            }
            onRename={(name) => renameSavedSearch(search.id, name)}
            onDelete={() => {
              removeSavedSearch(search.id);
              if (openId === search.id) {
                setOpenId(null);
              }
            }}
            onMarkSeen={() =>
              markSavedSearchSeen(
                search.id,
                matches.map((job) => job.id),
              )
            }
          />
        ))}
      </div>
    </section>
  );
}
