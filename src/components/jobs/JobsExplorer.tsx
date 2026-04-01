import { useMemo, useState } from "react";
import { Icon } from "@iconify/react/offline";
import "@/styles/global.css";

import { appIcons } from "@/lib/icons";
import type { JobRecord } from "@/types/jobs";

interface Props {
  jobs: JobRecord[];
  scrapedAt: string;
}

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

  return new Intl.DateTimeFormat("es-UY").format(parsed);
}

function cleanOption(value: string | null) {
  return value?.trim() || "Sin dato";
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
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [taskType, setTaskType] = useState("");
  const [onlyNew, setOnlyNew] = useState(false);
  const [afro, setAfro] = useState(false);
  const [discapacidad, setDiscapacidad] = useState(false);
  const [trans, setTrans] = useState(false);
  const [victimas, setVictimas] = useState(false);

  const departmentOptions = useMemo(() => {
    return [...new Set(jobs.map((job) => cleanOption(job.department)))].sort(
      (a, b) => a.localeCompare(b, "es"),
    );
  }, [jobs]);

  const taskTypeOptions = useMemo(() => {
    return [...new Set(jobs.map((job) => cleanOption(job.taskType)))].sort(
      (a, b) => a.localeCompare(b, "es"),
    );
  }, [jobs]);

  const filtered = useMemo(() => {
    const text = normalize(query);
    const targetCallNumber = normalize(callNumber);

    return jobs.filter((job) => {
      if (text) {
        const haystack = normalize(
          [
            job.title,
            job.callNumber,
            job.organization,
            job.department,
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

      if (department && cleanOption(job.department) !== department) {
        return false;
      }

      if (status && job.status !== status) {
        return false;
      }

      if (taskType && cleanOption(job.taskType) !== taskType) {
        return false;
      }

      if (onlyNew && !job.isNew) {
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
    query,
    callNumber,
    department,
    status,
    taskType,
    onlyNew,
    afro,
    discapacidad,
    trans,
    victimas,
  ]);

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
                placeholder="Titulo, organismo, departamento"
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
              <label className="label gap-2" htmlFor="job-department">
                <Icon
                  icon={appIcons.department}
                  width="16"
                  height="16"
                  className="shrink-0"
                  aria-hidden="true"
                />
                Departamento
              </label>
              <select
                id="job-department"
                className="select"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
              >
                <option value="">Todos</option>
                {departmentOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="label gap-2" htmlFor="job-status">
                <Icon
                  icon={appIcons.status}
                  width="16"
                  height="16"
                  className="shrink-0"
                  aria-hidden="true"
                />
                Estado
              </label>
              <select
                id="job-status"
                className="select"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">Todos</option>
                <option value="abierto">Abierto</option>
                <option value="cerrado">Cerrado</option>
                <option value="otro">Otro</option>
              </select>
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
              <select
                id="job-task-type"
                className="select"
                value={taskType}
                onChange={(event) => setTaskType(event.target.value)}
              >
                <option value="">Todos</option>
                {taskTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-5">
            <label className="label gap-2 font-normal">
              <input
                type="checkbox"
                className="input"
                checked={onlyNew}
                onChange={(event) => setOnlyNew(event.target.checked)}
              />
              Solo nuevos
            </label>
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
        </section>
      </div>

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
                <th>Estado</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => (
                <tr key={job.id}>
                  <td>{job.callNumber}</td>
                  <td>
                    <div className="font-semibold">
                      <a href={job.detailUrl} target="_blank" rel="noreferrer">
                        {job.title}
                      </a>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {[job.organization, job.department]
                        .filter(Boolean)
                        .join(" - ") || "Sin dato"}
                    </div>
                  </td>
                  <td>{job.taskType ?? "Sin dato"}</td>
                  <td>{formatDate(job.openingDate)}</td>
                  <td>{formatDate(job.closingDate)}</td>
                  <td>
                    <span className={statusClass(job.status)}>
                      {job.status}
                    </span>
                  </td>
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

      <div className="grid gap-3 md:hidden">
        {filtered.map((job) => (
          <article key={job.id} className="card">
            <header className="flex flex-wrap items-center gap-2">
              <span className="badge-outline">{job.callNumber}</span>
              <span className={statusClass(job.status)}>{job.status}</span>
              {job.isNew ? <span className="badge">Nuevo</span> : null}
            </header>
            <section>
              <h3 className="text-base font-semibold">
                <a href={job.detailUrl} target="_blank" rel="noreferrer">
                  {job.title}
                </a>
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {[job.organization, job.department, job.locality]
                  .filter(Boolean)
                  .join(" - ") || "Sin dato"}
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
    </section>
  );
}
