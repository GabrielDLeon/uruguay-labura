import { useEffect, useId, useMemo, useState } from "react";
import { Icon } from "@iconify/react/offline";

import JobsDataTable from "@/components/jobs/JobsDataTable";
import { formatDateShort } from "@/lib/dates";
import { appIcons } from "@/lib/icons";
import {
  criteriaChips,
  criteriaToSearchParams,
  type CriteriaChipKind,
} from "@/lib/saved-searches";
import type { JobRecord, SavedSearch } from "@/types/jobs";

const CHIP_ICONS: Record<CriteriaChipKind, typeof appIcons.search> = {
  query: appIcons.search,
  organization: appIcons.institution,
  taskType: appIcons.taskType,
  quota: appIcons.quota,
};

interface Props {
  search: SavedSearch;
  matches: JobRecord[];
  newJobs: JobRecord[];
  open: boolean;
  updatedAt: string | null;
  onToggle: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onMarkSeen: () => void;
}

export default function SavedSearchCard({
  search,
  matches,
  newJobs,
  open,
  updatedAt,
  onToggle,
  onRename,
  onDelete,
  onMarkSeen,
}: Props) {
  const nameInputId = useId();
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(search.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);

  const chips = criteriaChips(search.criteria);
  const params = criteriaToSearchParams(search.criteria).toString();
  const newCount = newJobs.length;
  const matchCount = matches.length;
  const newIds = useMemo(() => new Set(newJobs.map((job) => job.id)), [newJobs]);
  const displayJobs = onlyNew ? newJobs : matches;

  useEffect(() => {
    if (newCount === 0) {
      setOnlyNew(false);
    }
  }, [newCount]);

  const startRename = () => {
    setDraftName(search.name);
    setRenaming(true);
  };

  const submitRename = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    onRename(draftName);
    setRenaming(false);
  };

  return (
    <article
      className={`rounded-lg border bg-muted/30 transition-colors ${
        open ? "border-primary/40" : "border-border"
      }`}
    >
      <div className="flex items-start gap-4 p-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <Icon
            icon={appIcons.star}
            className="size-6 text-primary"
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            {renaming ? (
              <form
                onSubmit={submitRename}
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                <label htmlFor={nameInputId} className="sr-only">
                  Nombre de la búsqueda
                </label>
                <input
                  id={nameInputId}
                  className="input"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn" data-size="sm">
                  Guardar
                </button>
                <button
                  type="button"
                  className="btn"
                  data-size="sm"
                  data-variant="ghost"
                  onClick={() => setRenaming(false)}
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <h3 className="min-w-0 truncate text-sm font-semibold text-foreground">
                {search.name}
              </h3>
            )}

            {newCount > 0 ? (
              <span
                className="badge shrink-0 text-xs"
                data-variant="success"
                title="Nuevos desde tu última visita"
              >
                {newCount} nueva{newCount !== 1 ? "s" : ""}
              </span>
            ) : (
              <span
                className="badge shrink-0 text-xs"
                data-variant="secondary"
              >
                Sin novedades
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            {matchCount} llamado{matchCount !== 1 ? "s" : ""} coincide
            {matchCount !== 1 ? "n" : ""} hoy
            {updatedAt ? ` · Actualizado: ${formatDateShort(updatedAt)}` : ""}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {chips.length > 0 ? (
              chips.map((chip) => (
                <span
                  key={chip.key}
                  className="badge text-xs"
                  data-variant="outline"
                >
                  <Icon
                    icon={CHIP_ICONS[chip.kind]}
                    width="14"
                    height="14"
                    className="shrink-0"
                    aria-hidden="true"
                  />
                  {chip.label}
                </span>
              ))
            ) : (
              <span className="badge text-xs" data-variant="outline">
                Todos los llamados
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-t border-border px-4 py-2">
        <button
          type="button"
          className="btn"
          data-size="sm"
          data-variant="ghost"
          onClick={onToggle}
          aria-expanded={open}
        >
          <Icon
            icon={appIcons.chevronDown}
            width="16"
            height="16"
            className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
          {open ? "Ocultar novedades" : "Ver novedades"}
        </button>

        <div className="ml-auto flex items-center gap-1">
          <a
            href={params ? `/empleos?${params}` : "/empleos"}
            className="btn"
            data-size="icon-sm"
            data-variant="ghost"
            title="Ver resultados en llamados"
            aria-label="Ver resultados en llamados"
          >
            <Icon icon={appIcons.externalLink} width="18" height="18" />
          </a>

          <button
            type="button"
            className="btn"
            data-size="icon-sm"
            data-variant="ghost"
            onClick={startRename}
            title="Renombrar"
            aria-label="Renombrar búsqueda"
          >
            <Icon icon={appIcons.pencil} width="18" height="18" />
          </button>

          {confirmingDelete ? (
            <span className="flex items-center gap-1">
              <button
                type="button"
                className="btn"
                data-size="sm"
                data-variant="destructive"
                onClick={onDelete}
              >
                Eliminar
              </button>
              <button
                type="button"
                className="btn"
                data-size="sm"
                data-variant="ghost"
                onClick={() => setConfirmingDelete(false)}
              >
                Cancelar
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="btn"
              data-size="icon-sm"
              data-variant="ghost"
              onClick={() => setConfirmingDelete(true)}
              title="Eliminar"
              aria-label="Eliminar búsqueda"
            >
              <Icon icon={appIcons.trash} width="18" height="18" />
            </button>
          )}
        </div>
      </div>

      {open ? (
        <div className="grid gap-4 border-t border-border bg-background p-4">
          {matchCount === 0 ? (
            <p className="text-sm text-muted-foreground">
              Hoy no hay llamados que coincidan con esta búsqueda.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    className="input"
                    checked={onlyNew}
                    disabled={newCount === 0}
                    onChange={(event) => setOnlyNew(event.target.checked)}
                  />
                  Solo nuevos{newCount > 0 ? ` (${newCount})` : ""}
                </label>

                {newCount > 0 ? (
                  <button
                    type="button"
                    className="btn"
                    data-size="sm"
                    data-variant="outline"
                    onClick={onMarkSeen}
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
                ) : null}
              </div>

              {displayJobs.length > 0 ? (
                <JobsDataTable
                  jobs={displayJobs}
                  newJobIds={onlyNew ? undefined : newIds}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Estás al día: no hay llamados nuevos para esta búsqueda.
                </p>
              )}
            </>
          )}
        </div>
      ) : null}
    </article>
  );
}
