import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react/offline";
import "@/styles/global.css";

import SearchableSelect, {
  type SearchableSelectOption,
} from "@/components/common/SearchableSelect";
import OrganizationLabel from "@/components/jobs/OrganizationLabel";
import {
  getOrganizationAbbreviation,
  getOrganizationFullName,
  getOrganizationSearchText,
} from "@/lib/organizations";
import { appIcons } from "@/lib/icons";
import type { JobRecord } from "@/types/jobs";

interface Props {
  jobs: JobRecord[];
  scrapedAt: string;
}

const MAX_TITLE_LENGTH = 110;
const MAX_VISIBLE_RESULTS = 50;
const MIN_CALL_NUMBER_CHARS = 3;

function normalize(text: string | null | undefined) {
  return (text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function formatDate(date: string | null) {
  if (!date) {
    return "-";
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function cleanOption(value: string | null) {
  return value?.trim() || "Sin dato";
}

function shorten(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}...`;
}

function statusClass(status: JobRecord["status"]) {
  if (status === "abierto") {
    return "badge-secondary";
  }

  if (status === "cerrado") {
    return "badge-destructive";
  }

  return "badge-outline";
}

export default function JobsExplorer({ jobs, scrapedAt }: Props) {
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
  const hasCallNumberFilter = normalizedCallNumber.length > 0;
  const callNumberTooShort =
    hasCallNumberFilter && normalizedCallNumber.length < MIN_CALL_NUMBER_CHARS;

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
    if (callNumberTooShort) {
      return [];
    }

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
        targetCallNumber &&
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
    callNumberTooShort,
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

  return (
    <section className="grid gap-5">
      <div className="card">
        <section className="form grid gap-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div className="grid gap-2 lg:col-span-2">
              <label className="label gap-2" htmlFor="job-search">
                <Icon
                  icon={appIcons.search}
                  width="16"
                  height="16"
                  className="shrink-0"
                  aria-hidden="true"
                />
                Buscar
              </label>
              <input
                id="job-search"
                className="input"
                placeholder="Titulo, organismo o suborganismo"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="label gap-2" htmlFor="job-call-number">
                <Icon
                  icon={appIcons.callNumber}
                  width="16"
                  height="16"
                  className="shrink-0"
                  aria-hidden="true"
                />
                N de llamado
              </label>
              <input
                id="job-call-number"
                className="input"
                placeholder="0015/2026"
                value={callNumber}
                onChange={(event) => setCallNumber(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="label gap-2" htmlFor="job-organization">
                <Icon
                  icon={appIcons.department}
                  width="16"
                  height="16"
                  className="shrink-0"
                  aria-hidden="true"
                />
                Organismo
              </label>
              <SearchableSelect
                id="job-organization"
                value={organization}
                options={organizationOptions}
                allLabel="Todos"
                searchPlaceholder="Buscar organismo"
                onChange={setOrganization}
              />
            </div>

            <div className="grid gap-2">
              <label className="label gap-2" htmlFor="job-task-type">
                <Icon
                  icon={appIcons.taskType}
                  width="16"
                  height="16"
                  className="shrink-0"
                  aria-hidden="true"
                />
                Tipo de tarea
              </label>
              <SearchableSelect
                id="job-task-type"
                value={taskType}
                options={taskTypeOptions}
                allLabel="Todos"
                searchPlaceholder="Buscar tipo de tarea"
                onChange={setTaskType}
              />
            </div>
          </div>

          <fieldset className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-5">
            <label className="label gap-2 font-normal">
              <input
                type="checkbox"
                className="input"
                checked={afro}
                onChange={(event) => setAfro(event.target.checked)}
              />
              Afrodescendientes
            </label>
            <label className="label gap-2 font-normal">
              <input
                type="checkbox"
                className="input"
                checked={discapacidad}
                onChange={(event) => setDiscapacidad(event.target.checked)}
              />
              Discapacidad
            </label>
            <label className="label gap-2 font-normal">
              <input
                type="checkbox"
                className="input"
                checked={trans}
                onChange={(event) => setTrans(event.target.checked)}
              />
              Personas trans
            </label>
            <label className="label gap-2 font-normal">
              <input
                type="checkbox"
                className="input"
                checked={victimas}
                onChange={(event) => setVictimas(event.target.checked)}
              />
              Victimas delitos violentos
            </label>
          </fieldset>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="badge-secondary inline-flex items-center gap-1">
              <Icon
                icon={appIcons.jobsCount}
                width="14"
                height="14"
                className="shrink-0"
                aria-hidden="true"
              />
              {filtered.length} resultados
            </span>
            {hasMoreResults ? (
              <span className="text-muted-foreground">
                Mostrando {MAX_VISIBLE_RESULTS} de {filtered.length}
              </span>
            ) : null}
            <span className="text-muted-foreground inline-flex items-center gap-1">
              <Icon
                icon={appIcons.updatedAt}
                width="14"
                height="14"
                className="shrink-0"
                aria-hidden="true"
              />
              Actualizado: {formatDate(scrapedAt)}
            </span>
          </div>

          {callNumberTooShort ? (
            <p className="text-muted-foreground text-sm">
              Ingresa al menos {MIN_CALL_NUMBER_CHARS} caracteres en N de
              llamado para mostrar resultados.
            </p>
          ) : null}
        </section>
      </div>

      {viewportMode !== "mobile" ? (
        <div className="card hidden md:block">
          <section className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>N llamado</th>
                  <th>Titulo</th>
                  <th>Tipo</th>
                  <th>Apertura</th>
                  <th>Cierre</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {visibleJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <a
                        href={job.detailUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="badge-outline inline-flex items-center"
                      >
                        {job.callNumber}
                      </a>
                    </td>
                    <td>
                      <div className="font-semibold">
                        <span
                          className="block max-w-[42ch] truncate"
                          title={job.title}
                        >
                          {shorten(job.title, MAX_TITLE_LENGTH)}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        <OrganizationLabel
                          organization={job.organization}
                          subOrganization={job.subOrganization}
                        />
                      </div>
                    </td>
                    <td>{job.taskType ?? "Sin dato"}</td>
                    <td>{formatDate(job.openingDate)}</td>
                    <td>{formatDate(job.closingDate)}</td>
                    <td>
                      <a
                        className="btn btn-sm inline-flex items-center gap-1"
                        href={job.applyUrl ?? job.detailUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver llamado
                        <Icon
                          icon="mdi:account-credit-card"
                          width="24"
                          height="24"
                        />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      ) : null}

      {viewportMode !== "desktop" ? (
        <div className="grid gap-3 md:hidden">
          {visibleJobs.map((job) => (
            <article key={job.id} className="card">
              <header className="flex flex-wrap items-center gap-2">
                <a
                  href={job.detailUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="badge-outline"
                >
                  {job.callNumber}
                </a>
                <span className={statusClass(job.status)}>{job.status}</span>
                {job.isNew ? <span className="badge">Nuevo</span> : null}
              </header>
              <section>
                <h3 className="text-base font-semibold">
                  <span className="block truncate" title={job.title}>
                    {shorten(job.title, MAX_TITLE_LENGTH)}
                  </span>
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  <OrganizationLabel
                    organization={job.organization}
                    subOrganization={job.subOrganization}
                  />
                </p>
                <div className="text-muted-foreground mt-3 grid grid-cols-2 gap-2 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <Icon
                      icon={appIcons.openingDate}
                      width="14"
                      height="14"
                      className="shrink-0"
                      aria-hidden="true"
                    />
                    Apertura: {formatDate(job.openingDate)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icon
                      icon={appIcons.closingDate}
                      width="14"
                      height="14"
                      className="shrink-0"
                      aria-hidden="true"
                    />
                    Cierre: {formatDate(job.closingDate)}
                  </span>
                  <span>Tipo: {job.taskType ?? "Sin dato"}</span>
                  <span>Inciso: {job.inciso ?? "Sin dato"}</span>
                </div>
              </section>
              <footer>
                <a
                  className="btn btn-sm inline-flex items-center gap-1"
                  href={job.applyUrl ?? job.detailUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver llamado
                  <Icon
                    icon={appIcons.externalLink}
                    width="16"
                    height="16"
                    className="shrink-0"
                    aria-hidden="true"
                  />
                </a>
              </footer>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
