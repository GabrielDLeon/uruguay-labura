import { Icon } from "@iconify/react/offline";
import type { ReactNode } from "react";

import FilterMenu, {
  type FilterMenuOption,
} from "@/components/common/FilterMenu";
import { appIcons } from "@/lib/icons";

const QUOTA_OPTIONS: FilterMenuOption[] = [
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
  organizationOptions: FilterMenuOption[];
  taskTypeOptions: FilterMenuOption[];
  onQueryChange: (value: string) => void;
  onOrganizationChange: (value: string) => void;
  onTaskTypeChange: (value: string) => void;
  onAfroChange: (value: boolean) => void;
  onDiscapacidadChange: (value: boolean) => void;
  onTransChange: (value: boolean) => void;
  onVictimasChange: (value: boolean) => void;
  /** Extra actions rendered at the end of the filter row. */
  children?: ReactNode;
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
  children,
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
    <div className="form grid gap-4">
      <div role="group" className="field">
        <div className="relative">
          <Icon
            icon={appIcons.search}
            width="16"
            height="16"
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            id="job-search"
            type="text"
            autoFocus
            className="input pl-9"
            placeholder="Buscar por título, organismo (o sigla), tarea o número de llamado"
            aria-label="Buscar llamado"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterMenu
          id="job-organization"
          label="Organismo"
          values={organization ? [organization] : []}
          options={organizationOptions}
          searchable
          searchPlaceholder="Buscar organismo"
          onChange={(nextValues) => onOrganizationChange(nextValues[0] ?? "")}
        />
        <FilterMenu
          id="job-task-type"
          label="Tipo de tarea"
          values={taskType ? [taskType] : []}
          options={taskTypeOptions}
          onChange={(nextValues) => onTaskTypeChange(nextValues[0] ?? "")}
        />
        <FilterMenu
          id="job-quotas"
          label="Cupos"
          values={selectedQuotas}
          options={QUOTA_OPTIONS}
          multiple
          onChange={handleQuotasChange}
        />
        {children ? (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
