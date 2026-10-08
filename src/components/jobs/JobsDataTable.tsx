import { Icon } from "@iconify/react/offline";

import DataTable, {
  type DataTableColumn,
} from "@/components/common/DataTable";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import OrgLogo from "@/components/jobs/OrgLogo";
import SaveButton from "@/components/jobs/SaveButton";
import {
  MAX_TITLE_LENGTH,
  getDisplayStatus,
  isUpcoming,
  shorten,
} from "@/components/jobs/jobs";
import { formatDateShort, formatRelative } from "@/lib/dates";
import { appIcons } from "@/lib/icons";
import type { JobRecord } from "@/types/jobs";

const columns: DataTableColumn<JobRecord>[] = [
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
    render: (job) => (
      <div className="min-w-0">
        <div className="font-semibold text-foreground">
          <span className="block truncate" title={job.title}>
            {shorten(job.title, MAX_TITLE_LENGTH)}
          </span>
        </div>
        <div
          className="text-muted-foreground truncate text-xs"
          title={`${job.organization ?? "Sin dato"}${job.subOrganization ? ` - ${job.subOrganization}` : ""}`}
        >
          {job.subOrganization ?? "Sin dato"}
        </div>
      </div>
    ),
  },
  {
    header: "Lugar",
    searchText: (job) => [job.location ?? "", job.locality ?? ""],
    render: (job) => (
      <span className="text-xs" title={job.location ?? undefined}>
        {job.location ?? "—"}
      </span>
    ),
  },
  {
    header: "Estado",
    render: (job) =>
      isUpcoming(job) ? (
        <span className="text-muted-foreground text-xs">
          {formatDateShort(job.openingDate)}
        </span>
      ) : (
        <JobStatusBadge status={getDisplayStatus(job)} />
      ),
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

interface Props {
  jobs: JobRecord[];
  searchPlaceholder?: string;
}

export default function JobsDataTable({
  jobs,
  searchPlaceholder = "Buscar en estos llamados",
}: Props) {
  return (
    <DataTable
      rows={jobs}
      columns={columns}
      getRowId={(job) => job.id}
      noun="llamados"
      searchPlaceholder={searchPlaceholder}
      emptyMessage="No se encontraron llamados."
    />
  );
}
