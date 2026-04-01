import { Icon } from "@iconify/react/offline";

import SearchableSelect, {
  type SearchableSelectOption,
} from "@/components/common/SearchableSelect";
import { appIcons } from "@/lib/icons";

import { formatDate, MAX_VISIBLE_RESULTS } from "@/components/jobs/jobs";

interface Props {
  query: string;
  callNumber: string;
  organization: string;
  taskType: string;
  afro: boolean;
  discapacidad: boolean;
  trans: boolean;
  victimas: boolean;
  organizationOptions: SearchableSelectOption[];
  taskTypeOptions: SearchableSelectOption[];
  filteredCount: number;
  hasMoreResults: boolean;
  scrapedAt: string | null;
  onQueryChange: (value: string) => void;
  onCallNumberChange: (value: string) => void;
  onOrganizationChange: (value: string) => void;
  onTaskTypeChange: (value: string) => void;
  onAfroChange: (value: boolean) => void;
  onDiscapacidadChange: (value: boolean) => void;
  onTransChange: (value: boolean) => void;
  onVictimasChange: (value: boolean) => void;
}

export default function JobsFilters({
  query,
  callNumber,
  organization,
  taskType,
  afro,
  discapacidad,
  trans,
  victimas,
  organizationOptions,
  taskTypeOptions,
  filteredCount,
  hasMoreResults,
  scrapedAt,
  onQueryChange,
  onCallNumberChange,
  onOrganizationChange,
  onTaskTypeChange,
  onAfroChange,
  onDiscapacidadChange,
  onTransChange,
  onVictimasChange,
}: Props) {
  return (
    <div className="card bg-transparent">
      <section className="form grid gap-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div role="group" className="field lg:col-span-2">
            <label
              className="inline-flex items-center gap-2"
              htmlFor="job-search"
            >
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
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </div>

          <div role="group" className="field">
            <label
              className="inline-flex items-center gap-2"
              htmlFor="job-call-number"
            >
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
              onChange={(event) => onCallNumberChange(event.target.value)}
            />
          </div>

          <div role="group" className="field">
            <label
              className="inline-flex items-center gap-2"
              htmlFor="job-organization"
            >
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
              onChange={onOrganizationChange}
            />
          </div>

          <div role="group" className="field">
            <label
              className="inline-flex items-center gap-2"
              htmlFor="job-task-type"
            >
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
              onChange={onTaskTypeChange}
            />
          </div>
        </div>

        <fieldset className="fieldset gap-2">
          <legend>Cupos</legend>
          <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-5">
            <div role="group" className="field" data-orientation="horizontal">
              <input
                id="quota-afro"
                type="checkbox"
                className="input"
                checked={afro}
                onChange={(event) => onAfroChange(event.target.checked)}
              />
              <label htmlFor="quota-afro">Afrodescendientes</label>
            </div>
            <div role="group" className="field" data-orientation="horizontal">
              <input
                id="quota-discapacidad"
                type="checkbox"
                className="input"
                checked={discapacidad}
                onChange={(event) => onDiscapacidadChange(event.target.checked)}
              />
              <label htmlFor="quota-discapacidad">Discapacidad</label>
            </div>
            <div role="group" className="field" data-orientation="horizontal">
              <input
                id="quota-trans"
                type="checkbox"
                className="input"
                checked={trans}
                onChange={(event) => onTransChange(event.target.checked)}
              />
              <label htmlFor="quota-trans">Personas trans</label>
            </div>
            <div role="group" className="field" data-orientation="horizontal">
              <input
                id="quota-victimas"
                type="checkbox"
                className="input"
                checked={victimas}
                onChange={(event) => onVictimasChange(event.target.checked)}
              />
              <label htmlFor="quota-victimas">Victimas delitos violentos</label>
            </div>
          </div>
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
            {filteredCount} resultados
          </span>
          {hasMoreResults ? (
            <span className="text-muted-foreground">
              Mostrando {MAX_VISIBLE_RESULTS} de {filteredCount}
            </span>
          ) : null}
          {scrapedAt ? (
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
          ) : null}
        </div>
      </section>
    </div>
  );
}
