import { useEffect, useMemo, useState } from "react";

import JobsDataTable from "@/components/jobs/JobsDataTable";
import JobsSkeleton from "@/components/jobs/JobsSkeleton";
import useJobs from "@/components/jobs/useJobs";
import { getSavedJobIds, subscribeToSavedJobs } from "@/lib/saved-jobs";

export default function SavedJobsBoard() {
  const { jobs, isLoading, loadError, retry } = useJobs();
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setSavedIds(getSavedJobIds());
    sync();
    return subscribeToSavedJobs(sync);
  }, []);

  const savedIdsSet = useMemo(() => new Set(savedIds), [savedIds]);

  const savedJobs = useMemo(
    () => jobs.filter((job) => savedIdsSet.has(job.id)),
    [jobs, savedIdsSet],
  );

  if (isLoading) {
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

  if (savedJobs.length === 0) {
    return (
      <section className="flex flex-col items-center gap-4 rounded-lg border border-border bg-muted/30 p-12 text-center">
        <p className="text-lg font-semibold text-foreground">
          No tenés empleos guardados
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          Cuando encuentres un llamado que te interese, tocá el marcador
          <span aria-hidden="true"> 🔖</span> para guardarlo acá.
        </p>
        <a href="/empleos" className="btn">
          Explorar llamados
        </a>
      </section>
    );
  }

  return (
    <JobsDataTable
      jobs={savedJobs}
      searchPlaceholder="Buscar en guardados"
    />
  );
}
