import { useDeferredValue, useEffect, useMemo, useState } from "react";

import "@/styles/global.css";

import type { SearchableSelectOption } from "@/components/common/SearchableSelect";
import JobsFilters from "@/components/jobs/JobsFilters";
import JobsList from "@/components/jobs/JobsList";
import JobsSkeleton from "@/components/jobs/JobsSkeleton";
import JobsTable from "@/components/jobs/JobsTable";
import {
  MIN_CALL_NUMBER_CHARS,
  MAX_VISIBLE_RESULTS,
  cleanOption,
  normalize,
} from "@/components/jobs/jobs";
import useJobs from "@/components/jobs/useJobs";
import {
  getOrganizationAbbreviation,
  getOrganizationFullName,
  getOrganizationSearchText,
} from "@/lib/organizations";

export default function JobsBoard() {
  const { jobs, scrapedAt, loadError, isLoading, retry } = useJobs();

  const [query, setQuery] = useState("");
  const [callNumber, setCallNumber] = useState("");
  const [organization, setOrganization] = useState("");
  const [taskType, setTaskType] = useState("");
  const [afro, setAfro] = useState(false);
  const [discapacidad, setDiscapacidad] = useState(false);
  const [trans, setTrans] = useState(false);
  const [victimas, setVictimas] = useState(false);
  const [viewportMode, setViewportMode] = useState<
    "both" | "desktop" | "mobile"
  >("both");

  const deferredQuery = useDeferredValue(query);
  const deferredCallNumber = useDeferredValue(callNumber);
  const normalizedCallNumber = normalize(deferredCallNumber).trim();
  const hasCallNumberFilter =
    normalizedCallNumber.length >= MIN_CALL_NUMBER_CHARS;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const applyMode = () => {
      setViewportMode(mediaQuery.matches ? "desktop" : "mobile");
    };

    applyMode();
    mediaQuery.addEventListener("change", applyMode);

    return () => {
      mediaQuery.removeEventListener("change", applyMode);
    };
  }, []);

  const organizationOptions = useMemo<SearchableSelectOption[]>(() => {
    return [...new Set(jobs.map((job) => cleanOption(job.organization)))]
      .sort((a, b) => a.localeCompare(b, "es"))
      .map((organizationName) => {
        const abbreviation = getOrganizationAbbreviation(organizationName);
        const fullName = getOrganizationFullName(organizationName);

        return {
          value: organizationName,
          label: abbreviation,
          description: abbreviation === fullName ? undefined : fullName,
          searchText: getOrganizationSearchText(organizationName),
        };
      });
  }, [jobs]);

  const taskTypeOptions = useMemo<SearchableSelectOption[]>(() => {
    return [...new Set(jobs.map((job) => cleanOption(job.taskType)))]
      .sort((a, b) => a.localeCompare(b, "es"))
      .map((option) => ({
        value: option,
        label: option,
      }));
  }, [jobs]);

  const filtered = useMemo(() => {
    const text = normalize(deferredQuery);
    const targetCallNumber = normalizedCallNumber;

    return jobs.filter((job) => {
      if (text) {
        const haystack = normalize(
          [
            job.title,
            job.callNumber,
            job.organization,
            job.subOrganization,
            job.locality,
            job.taskType,
          ]
            .filter(Boolean)
            .join(" "),
        );
        if (!haystack.includes(text)) {
          return false;
        }
      }

      if (
        hasCallNumberFilter &&
        !normalize(job.callNumber).includes(targetCallNumber)
      ) {
        return false;
      }

      if (organization && cleanOption(job.organization) !== organization) {
        return false;
      }

      if (taskType && cleanOption(job.taskType) !== taskType) {
        return false;
      }

      if (afro && !job.quotas.afrodescendientes) {
        return false;
      }

      if (discapacidad && !job.quotas.discapacidad) {
        return false;
      }

      if (trans && !job.quotas.trans) {
        return false;
      }

      if (victimas && !job.quotas.victimasDelitosViolentos) {
        return false;
      }

      return true;
    });
  }, [
    jobs,
    deferredQuery,
    normalizedCallNumber,
    hasCallNumberFilter,
    organization,
    taskType,
    afro,
    discapacidad,
    trans,
    victimas,
  ]);

  const visibleJobs = useMemo(
    () => filtered.slice(0, MAX_VISIBLE_RESULTS),
    [filtered],
  );
  const hasMoreResults = filtered.length > MAX_VISIBLE_RESULTS;
  const hasNoResults = filtered.length === 0;

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
          <button type="button" className="btn btn-sm" onClick={retry}>
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <JobsFilters
        query={query}
        callNumber={callNumber}
        organization={organization}
        taskType={taskType}
        afro={afro}
        discapacidad={discapacidad}
        trans={trans}
        victimas={victimas}
        organizationOptions={organizationOptions}
        taskTypeOptions={taskTypeOptions}
        filteredCount={filtered.length}
        hasMoreResults={hasMoreResults}
        scrapedAt={scrapedAt}
        onQueryChange={setQuery}
        onCallNumberChange={setCallNumber}
        onOrganizationChange={setOrganization}
        onTaskTypeChange={setTaskType}
        onAfroChange={setAfro}
        onDiscapacidadChange={setDiscapacidad}
        onTransChange={setTrans}
        onVictimasChange={setVictimas}
      />

      {hasNoResults ? (
        <p className="text-muted-foreground text-sm">
          No se encontraron resultados.
        </p>
      ) : null}

      {!hasNoResults && viewportMode !== "mobile" ? (
        <JobsTable jobs={visibleJobs} />
      ) : null}

      {!hasNoResults && viewportMode !== "desktop" ? (
        <JobsList jobs={visibleJobs} />
      ) : null}
    </section>
  );
}
