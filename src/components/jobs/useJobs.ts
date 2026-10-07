import { useCallback, useEffect, useState } from "react";

import type { JobRecord } from "@/types/jobs";
import { filterActiveJobs, loadJobsDataset } from "@/lib/jobs-dataset";

export default function useJobs() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [scrapedAt, setScrapedAt] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestAttempt, setRequestAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setLoadError(null);

    loadJobsDataset(requestAttempt > 0)
      .then((dataset) => {
        if (!active) return;
        setJobs(filterActiveJobs(dataset.jobs));
        setScrapedAt(dataset.scrapedAt);
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los llamados",
        );
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [requestAttempt]);

  const retry = useCallback(() => {
    setRequestAttempt((current) => current + 1);
  }, []);

  return {
    jobs,
    scrapedAt,
    loadError,
    isLoading,
    retry,
  };
}
