import { useMemo, useState } from "react";

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
    <section className="space-y-5">
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <label className="form-control lg:col-span-2">
            <span className="label text-xs font-semibold uppercase text-slate-600">
              Buscar
            </span>
            <input
              className="input"
              placeholder="Titulo, organismo, departamento"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <label className="form-control">
            <span className="label text-xs font-semibold uppercase text-slate-600">
              N de llamado
            </span>
            <input
              className="input"
              placeholder="0015/2026"
              value={callNumber}
              onChange={(event) => setCallNumber(event.target.value)}
            />
          </label>

          <label className="form-control">
            <span className="label text-xs font-semibold uppercase text-slate-600">
              Departamento
            </span>
            <select
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
          </label>

          <label className="form-control">
            <span className="label text-xs font-semibold uppercase text-slate-600">
              Estado
            </span>
            <select
              className="select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">Todos</option>
              <option value="abierto">Abierto</option>
              <option value="cerrado">Cerrado</option>
              <option value="otro">Otro</option>
            </select>
          </label>

          <label className="form-control">
            <span className="label text-xs font-semibold uppercase text-slate-600">
              Tipo de tarea
            </span>
            <select
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
          </label>
        </div>

        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-5">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={onlyNew}
              onChange={(event) => setOnlyNew(event.target.checked)}
            />
            Solo nuevos
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={afro}
              onChange={(event) => setAfro(event.target.checked)}
            />
            Afrodescendientes
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={discapacidad}
              onChange={(event) => setDiscapacidad(event.target.checked)}
            />
            Discapacidad
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={trans}
              onChange={(event) => setTrans(event.target.checked)}
            />
            Personas trans
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={victimas}
              onChange={(event) => setVictimas(event.target.checked)}
            />
            Victimas delitos violentos
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="badge badge-secondary">
            {filtered.length} resultados
          </span>
          <span className="text-slate-600">
            Actualizado: {formatDate(scrapedAt)}
          </span>
        </div>
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] md:block">
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
                  <div className="font-semibold text-slate-900">
                    <a href={job.detailUrl} target="_blank" rel="noreferrer">
                      {job.title}
                    </a>
                  </div>
                  <div className="text-xs text-slate-600">
                    {[job.organization, job.department]
                      .filter(Boolean)
                      .join(" - ") || "Sin dato"}
                  </div>
                </td>
                <td>{job.taskType ?? "Sin dato"}</td>
                <td>{formatDate(job.openingDate)}</td>
                <td>{formatDate(job.closingDate)}</td>
                <td>
                  <span className="badge badge-outline">{job.status}</span>
                </td>
                <td>
                  <a
                    className="btn btn-sm"
                    href={job.applyUrl ?? job.detailUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver llamado
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {filtered.map((job) => (
          <article
            key={job.id}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-outline">{job.callNumber}</span>
              <span className="badge badge-secondary">{job.status}</span>
              {job.isNew ? <span className="badge">Nuevo</span> : null}
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900">
              <a href={job.detailUrl} target="_blank" rel="noreferrer">
                {job.title}
              </a>
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {[job.organization, job.department, job.locality]
                .filter(Boolean)
                .join(" - ") || "Sin dato"}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700">
              <span>Apertura: {formatDate(job.openingDate)}</span>
              <span>Cierre: {formatDate(job.closingDate)}</span>
              <span>Tipo: {job.taskType ?? "Sin dato"}</span>
              <span>Inciso: {job.inciso ?? "Sin dato"}</span>
            </div>
            <a
              className="btn btn-sm mt-4"
              href={job.applyUrl ?? job.detailUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ver llamado
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
