import { Icon } from "@iconify/react/offline";

import MultiSelect from "@/components/common/MultiSelect";
import SearchableSelect, {
  type SearchableSelectOption,
} from "@/components/common/SearchableSelect";
import { appIcons } from "@/lib/icons";

const QUOTA_OPTIONS = [
  { value: "afro", label: "Afrodescendientes" },
  { value: "discapacidad", label: "Discapacidad" },
  { value: "trans", label: "Personas trans" },
  { value: "victimas", label: "Victimas delitos violentos" },
];

interface Props {
  query: string;
  organization: string;
  taskType: string;
  afro: boolean;
  discapacidad: boolean;
  trans: boolean;
  victimas: boolean;
  organizationOptions: SearchableSelectOption[];
  taskTypeOptions: SearchableSelectOption[];
  onQueryChange: (value: string) => void;
  onOrganizationChange: (value: string) => void;
  onTaskTypeChange: (value: string) => void;
  onAfroChange: (value: boolean) => void;
  onDiscapacidadChange: (value: boolean) => void;
  onTransChange: (value: boolean) => void;
  onVictimasChange: (value: boolean) => void;
}

export default function JobsFilters({
  query,
  organization,
  taskType,
  afro,
  discapacidad,
  trans,
  victimas,
  organizationOptions,
  taskTypeOptions,
  onQueryChange,
  onOrganizationChange,
  onTaskTypeChange,
  onAfroChange,
  onDiscapacidadChange,
  onTransChange,
  onVictimasChange,
}: Props) {
  const selectedQuotas = [
    afro ? "afro" : null,
    discapacidad ? "discapacidad" : null,
    trans ? "trans" : null,
    victimas ? "victimas" : null,
  ].filter((value): value is string => value !== null);

  const handleQuotasChange = (nextValues: string[]) => {
    onAfroChange(nextValues.includes("afro"));
    onDiscapacidadChange(nextValues.includes("discapacidad"));
    onTransChange(nextValues.includes("trans"));
    onVictimasChange(nextValues.includes("victimas"));
  };

  return (
    <div className="card bg-transparent overflow-visible">
      <section className="form grid gap-4">
        <div role="group" className="field">
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
            type="text"
            autoFocus
            className="input"
            placeholder="Titulo, organismo, suborganismo o N de llamado"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
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

          <div role="group" className="field">
            <label
              className="inline-flex items-center gap-2"
              htmlFor="job-quotas"
            >
              <Icon
                icon={appIcons.quota}
                width="16"
                height="16"
                className="shrink-0"
                aria-hidden="true"
              />
              Cupos
            </label>
            <MultiSelect
              id="job-quotas"
              values={selectedQuotas}
              options={QUOTA_OPTIONS}
              allLabel="Todos"
              onChange={handleQuotasChange}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
