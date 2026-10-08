import { useMemo } from "react";
import { Icon } from "@iconify/react/offline";

import DataTable, {
  type DataTableColumn,
} from "@/components/common/DataTable";
import OrgLogo from "@/components/jobs/OrgLogo";
import SaveButton from "@/components/jobs/SaveButton";
import { MAX_TITLE_LENGTH, shorten } from "@/components/jobs/jobs";
import { formatRelative } from "@/lib/dates";
import { appIcons } from "@/lib/icons";
import type { JobRecord } from "@/types/jobs";

function buildColumns(
  newJobIds?: Set<string>,
): DataTableColumn<JobRecord>[] {
  return [
    {
      header: "Organismo",
      searchText: (job) => [job.organization ?? "", job.subOrganization ?? ""],
      render: (job) => <OrgLogo organization={job.organization} />,
    },
    {
      header: "Título",
      searchText: (job) => [
        job.title,
        job.position ?? "",
        job.callNumber,
        job.taskType ?? "",
        job.tags.join(" "),
      ],
      render: (job) => {
        const isNew = newJobIds?.has(job.id) ?? false;

        return (
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="truncate font-semibold text-foreground"
                title={job.title}
              >
                {shorten(job.title, MAX_TITLE_LENGTH)}
              </span>
              {isNew ? (
                <span
                  className="badge shrink-0 text-xs"
                  data-variant="success"
                >
                  Nuevo
                </span>
              ) : null}
            </div>
            <div
              className="text-muted-foreground truncate text-xs"
              title={`${job.organization ?? "Sin dato"}${job.subOrganization ? ` - ${job.subOrganization}` : ""}`}
            >
              {job.subOrganization ?? "Sin dato"}
            </div>
          </div>
        );
      },
    },
    {
      header: "Cierre",
      render: (job) => (
        <span
          className="whitespace-nowrap"
          title={formatRelative(job.closingDate)?.title}
        >
          {formatRelative(job.closingDate)?.label ?? "-"}
        </span>
      ),
    },
    {
      header: "Acciones",
      render: (job) => (
        <span
          className="inline-flex items-center gap-0.5"
          role="toolbar"
          aria-label="Acciones"
        >
          <a
            href={job.applyUrl ?? job.origin}
            target="_blank"
            rel="noreferrer"
            title="Abrir llamado"
            aria-label="Abrir llamado"
            className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center justify-center rounded p-1 transition-colors"
          >
            <Icon icon={appIcons.externalLink} width="18" height="18" />
          </a>
          <SaveButton jobId={job.id} />
        </span>
      ),
    },
  ];
}

interface Props {
  jobs: JobRecord[];
  /** Ids a marcar con la etiqueta "Nuevo". */
  newJobIds?: Set<string>;
  searchPlaceholder?: string;
}

export default function JobsDataTable({
  jobs,
  newJobIds,
  searchPlaceholder = "Buscar en estos llamados",
}: Props) {
  const columns = useMemo(() => buildColumns(newJobIds), [newJobIds]);

  return (
    <DataTable
      rows={jobs}
      columns={columns}
      getRowId={(job) => job.id}
      noun="llamados"
      singularNoun="llamado"
      searchPlaceholder={searchPlaceholder}
      emptyMessage="No se encontraron llamados."
    />
  );
}
