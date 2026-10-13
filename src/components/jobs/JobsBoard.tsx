import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "@/styles/global.css";

import type { FilterMenuOption } from "@/components/common/FilterMenu";
import DataTablePagination from "@/components/common/DataTablePagination";
import { BLOCK_BASE_CLASS } from "@/components/common/block";
import JobBlock from "@/components/jobs/JobBlock";
import JobDetail from "@/components/jobs/JobDetail";
import JobsFilters from "@/components/jobs/JobsFilters";
import JobsSkeleton from "@/components/jobs/JobsSkeleton";
import {
  ITEMS_PER_PAGE,
  cleanOption,
  filterJobs,
} from "@/components/jobs/jobs";
import SaveSearchButton from "@/components/jobs/SaveSearchButton";
import useJobs from "@/components/jobs/useJobs";
import type { JobFilters } from "@/types/jobs";
import {
  getOrganizationAbbreviation,
  getOrganizationFullName,
  getOrganizationLogo,
  getOrganizationSearchText,
} from "@/lib/organizations";
import { hasActiveFilters } from "@/lib/saved-searches";

interface JobsBoardProps {
  initialQuery?: string;
  initialOrganization?: string;
  initialTaskType?: string;
  initialAfro?: boolean;
  initialDiscapacidad?: boolean;
  initialTrans?: boolean;
  initialVictimas?: boolean;
  initialPage?: number;
  initialJobId?: string;
}

export default function JobsBoard({
  initialQuery = "",
  initialOrganization = "",
  initialTaskType = "",
  initialAfro = false,
  initialDiscapacidad = false,
  initialTrans = false,
  initialVictimas = false,
  initialPage = 1,
  initialJobId = "",
}: JobsBoardProps) {
  const { jobs, loadError, isLoading, retry } = useJobs();

  const [query, setQuery] = useState(initialQuery);
  const [organization, setOrganization] = useState(initialOrganization);
  const [taskType, setTaskType] = useState(initialTaskType);
  const [afro, setAfro] = useState(initialAfro);
  const [discapacidad, setDiscapacidad] = useState(initialDiscapacidad);
  const [trans, setTrans] = useState(initialTrans);
  const [victimas, setVictimas] = useState(initialVictimas);
  const [viewportMode, setViewportMode] = useState<
    "both" | "desktop" | "mobile"
  >("both");

  const [page, setPage] = useState(initialPage);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    initialJobId || null,
  );
  // The board is a static page, so build-time `Astro.url.searchParams` is
  // empty: the deep link is read from the browser URL on mount instead.
  const [urlReady, setUrlReady] = useState(false);
  // True when opening the drawer pushed a history entry from the list. Direct
  // entry via a shared `?job=` link has no board entry to go back to.
  const pushedJobRef = useRef(false);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };
  const handleOrganizationChange = (value: string) => {
    setOrganization(value);
    setPage(1);
  };
  const handleTaskTypeChange = (value: string) => {
    setTaskType(value);
    setPage(1);
  };
  const handleAfroChange = (value: boolean) => {
    setAfro(value);
    setPage(1);
  };
  const handleDiscapacidadChange = (value: boolean) => {
    setDiscapacidad(value);
    setPage(1);
  };
  const handleTransChange = (value: boolean) => {
    setTrans(value);
    setPage(1);
  };
  const handleVictimasChange = (value: boolean) => {
    setVictimas(value);
    setPage(1);
  };

  const deferredQuery = useDeferredValue(query);

  const criteria: JobFilters = {
    query,
    organization,
    taskType,
    afro,
    discapacidad,
    trans,
    victimas,
  };

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") ?? "");
    setOrganization(params.get("org") ?? "");
    setTaskType(params.get("type") ?? "");
    setAfro(params.get("afro") === "1");
    setDiscapacidad(params.get("disc") === "1");
    setTrans(params.get("trans") === "1");
    setVictimas(params.get("vict") === "1");
    setPage(Number(params.get("page") ?? "1"));
    setSelectedJobId(params.get("job") || null);
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady) return;

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (organization) params.set("org", organization);
    if (taskType) params.set("type", taskType);
    if (afro) params.set("afro", "1");
    if (discapacidad) params.set("disc", "1");
    if (trans) params.set("trans", "1");
    if (victimas) params.set("vict", "1");
    if (page > 1) params.set("page", String(page));
    if (selectedJobId) params.set("job", selectedJobId);

    const search = params.toString();
    const newURL = search ? `?${search}` : window.location.pathname;
    history.replaceState(null, "", newURL);
  }, [
    query,
    organization,
    taskType,
    afro,
    discapacidad,
    trans,
    victimas,
    page,
    selectedJobId,
    urlReady,
  ]);

  useEffect(() => {
    const onPopState = () => {
      pushedJobRef.current = false;
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
      setOrganization(params.get("org") ?? "");
      setTaskType(params.get("type") ?? "");
      setAfro(params.get("afro") === "1");
      setDiscapacidad(params.get("disc") === "1");
      setTrans(params.get("trans") === "1");
      setVictimas(params.get("vict") === "1");
      setPage(Number(params.get("page") ?? "1"));
      setSelectedJobId(params.get("job") || null);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleSelectJob = useCallback((jobId: string) => {
    setSelectedJobId(jobId);
    // On small screens the detail is a drawer, so push a history entry with
    // the deep link: the back button or gesture then closes it.
    if (!window.matchMedia("(max-width: 767px)").matches) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set("job", jobId);
    pushedJobRef.current = true;
    window.history.pushState(null, "", `?${params.toString()}`);
  }, []);

  const closeDrawer = useCallback(() => {
    // Opened from the list: the previous history entry is the board itself.
    if (pushedJobRef.current) {
      pushedJobRef.current = false;
      window.history.back();
      return;
    }
    // Direct entry via a shared link: there is no board entry to go back to,
    // so clean the job param in place and never leave the site.
    const params = new URLSearchParams(window.location.search);
    params.delete("job");
    const search = params.toString();
    window.history.replaceState(
      null,
      "",
      search ? `/empleos?${search}` : "/empleos",
    );
    setSelectedJobId(null);
  }, []);

  const organizationOptions = useMemo<FilterMenuOption[]>(() => {
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
          logo: getOrganizationLogo(organizationName),
        };
      });
  }, [jobs]);

  const taskTypeOptions = useMemo<FilterMenuOption[]>(() => {
    return [...new Set(jobs.map((job) => cleanOption(job.taskType)))]
      .sort((a, b) => a.localeCompare(b, "es"))
      .map((option) => ({
        value: option,
        label: option,
      }));
  }, [jobs]);

  const filtered = useMemo(() => {
    return filterJobs(jobs, {
      query: deferredQuery,
      organization,
      taskType,
      afro,
      discapacidad,
      trans,
      victimas,
    });
  }, [
    jobs,
    deferredQuery,
    organization,
    taskType,
    afro,
    discapacidad,
    trans,
    victimas,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const clampedPage = Math.min(page, totalPages);
  const startOffset = (clampedPage - 1) * ITEMS_PER_PAGE;
  const visibleJobs = filtered.slice(startOffset, startOffset + ITEMS_PER_PAGE);
  const hasNoResults = filtered.length === 0;

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? null,
    [jobs, selectedJobId],
  );
  const isMobile = viewportMode === "mobile";
  const isDrawerOpen = isMobile && selectedJob !== null;

  useEffect(() => {
    if (!isDrawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isDrawerOpen]);

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

  return (
    <section className="flex flex-col">
      <div className={`${BLOCK_BASE_CLASS} border-b border-border`}>
        <JobsFilters
          query={query}
          organization={organization}
          taskType={taskType}
          afro={afro}
          discapacidad={discapacidad}
          trans={trans}
          victimas={victimas}
          organizationOptions={organizationOptions}
          taskTypeOptions={taskTypeOptions}
          onQueryChange={handleQueryChange}
          onOrganizationChange={handleOrganizationChange}
          onTaskTypeChange={handleTaskTypeChange}
          onAfroChange={handleAfroChange}
          onDiscapacidadChange={handleDiscapacidadChange}
          onTransChange={handleTransChange}
          onVictimasChange={handleVictimasChange}
        >
          {hasActiveFilters(criteria) ? (
            <SaveSearchButton filters={criteria} jobs={jobs} />
          ) : null}
        </JobsFilters>
      </div>

      {hasNoResults ? (
        <p className={`${BLOCK_BASE_CLASS} text-muted-foreground text-sm`}>
          No se encontraron resultados.
        </p>
      ) : (
        <div className="grid lg:h-[calc(100vh-6rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:overflow-hidden">
          {!isMobile || !selectedJob ? (
            <div className="flex min-w-0 flex-col lg:overflow-y-auto">
              {visibleJobs.map((job) => (
                <JobBlock
                  key={job.id}
                  job={job}
                  selected={job.id === selectedJobId}
                  onSelect={handleSelectJob}
                />
              ))}

              {filtered.length > ITEMS_PER_PAGE ? (
                <div
                  className={`${BLOCK_BASE_CLASS} shrink-0 border-b border-border`}
                >
                  <DataTablePagination
                    page={clampedPage}
                    totalPages={totalPages}
                    total={filtered.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setPage}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {!isMobile ? (
            <div className="hidden min-w-0 lg:block lg:overflow-y-auto lg:border-l lg:border-border">
              {selectedJob ? (
                <JobDetail job={selectedJob} />
              ) : (
                <p
                  className={`${BLOCK_BASE_CLASS} text-muted-foreground min-h-full text-sm`}
                >
                  Elegí un llamado de la lista para ver el detalle completo sin
                  salir del sitio.
                </p>
              )}
            </div>
          ) : null}
        </div>
      )}

      {isDrawerOpen && selectedJob ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Detalle del llamado ${selectedJob.title}`}
          className="bg-background fixed inset-0 z-50 overflow-x-hidden overflow-y-auto lg:hidden"
        >
          <JobDetail job={selectedJob} onBack={closeDrawer} />
        </div>
      ) : null}
    </section>
  );
}
