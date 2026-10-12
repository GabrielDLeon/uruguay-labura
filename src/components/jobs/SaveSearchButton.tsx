import { useId, useState } from "react";
import { Icon } from "@iconify/react/offline";

import { filterJobs } from "@/components/jobs/jobs";
import { appIcons } from "@/lib/icons";
import { createSavedSearch, defaultSearchName } from "@/lib/saved-searches";
import type { JobFilters, JobRecord } from "@/types/jobs";

interface Props {
  filters: JobFilters;
  jobs: JobRecord[];
}

export default function SaveSearchButton({ filters, jobs }: Props) {
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  const handleOpen = () => {
    setName(defaultSearchName(filters));
    setOpen(true);
  };

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    const matchedIds = filterJobs(jobs, filters).map((job) => job.id);
    createSavedSearch(name, filters, matchedIds);

    setOpen(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {open ? (
        <form
          className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
          onSubmit={handleSubmit}
        >
          <label htmlFor={inputId} className="sr-only">
            Nombre de la búsqueda
          </label>
          <input
            id={inputId}
            type="text"
            className="input w-full sm:w-64"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre de la búsqueda"
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
            onClick={() => setOpen(false)}
          >
            Cancelar
          </button>
        </form>
      ) : (
        <button
          type="button"
          className="btn"
          data-size="sm"
          data-variant="outline"
          onClick={handleOpen}
        >
          <Icon
            icon={saved ? appIcons.check : appIcons.starOutline}
            width="16"
            height="16"
            className="shrink-0"
            aria-hidden="true"
          />
          {saved ? "Búsqueda guardada" : "Guardar búsqueda"}
        </button>
      )}
    </div>
  );
}
