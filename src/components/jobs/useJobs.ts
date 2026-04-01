import { useCallback, useEffect, useState } from "react";

import type { JobRecord } from "@/types/jobs";

const JOBS_DATASET_URL = "/jobs.generated.json";

interface JobsDatasetPayload {
  jobs: JobRecord[];
  scrapedAt: string;
}

export default function useJobs() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [scrapedAt, setScrapedAt] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestAttempt, setRequestAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadJobs() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(JOBS_DATASET_URL, {
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`No se pudo cargar el dataset (${response.status})`);
        }

        const payload = await response.json();
        if (!payload || typeof payload !== "object") {
          throw new Error("Dataset con formato invalido");
        }

        const dataset = payload as JobsDatasetPayload;
        if (
          !Array.isArray(dataset.jobs) ||
          typeof dataset.scrapedAt !== "string"
        ) {
          throw new Error("Dataset con formato invalido");
        }

        setJobs(dataset.jobs);
        setScrapedAt(dataset.scrapedAt);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los llamados",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      controller.abort();
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
