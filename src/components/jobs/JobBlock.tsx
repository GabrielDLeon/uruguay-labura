import { Icon } from "@iconify/react/offline";

import { BLOCK_BASE_CLASS } from "@/components/common/block";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import OrgLogo from "@/components/jobs/OrgLogo";
import OrganizationLabel from "@/components/jobs/OrganizationLabel";
import SaveButton from "@/components/jobs/SaveButton";
import { getDisplayStatus, isUpcoming } from "@/components/jobs/jobs";
import { formatDateShort, formatRelative } from "@/lib/dates";
import { appIcons } from "@/lib/icons";
import type { JobRecord } from "@/types/jobs";

interface Props {
  job: JobRecord;
  selected: boolean;
  onSelect: (jobId: string) => void;
}

export default function JobBlock({ job, selected, onSelect }: Props) {
  const displayStatus = getDisplayStatus(job);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onSelect(job.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(job.id);
        }
      }}
      className={`${BLOCK_BASE_CLASS} w-full min-w-0 cursor-pointer overflow-hidden border-b border-border text-left transition-colors hover:bg-muted/40 ${
        selected ? "bg-muted" : ""
      }`}
    >
      <header className="flex items-start gap-3">
        <OrgLogo organization={job.organization} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold" title={job.title}>
            {job.title}
          </h3>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            <OrganizationLabel
              organization={job.organization}
              subOrganization={job.subOrganization}
            />
          </p>
        </div>
        <span className="shrink-0">
          <SaveButton jobId={job.id} />
        </span>
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isUpcoming(job) ? (
          <span className="text-muted-foreground text-xs">
            Abre {formatDateShort(job.openingDate)}
          </span>
        ) : (
          <JobStatusBadge status={displayStatus} />
        )}
        {job.location ? (
          <span className="text-muted-foreground inline-flex max-w-full min-w-0 items-center gap-1 text-xs">
            <Icon
              icon={appIcons.department}
              width="14"
              height="14"
              className="shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">{job.location}</span>
          </span>
        ) : null}
        {job.taskType ? (
          <span className="text-muted-foreground inline-flex max-w-full min-w-0 items-center gap-1 text-xs">
            <Icon
              icon={appIcons.taskType}
              width="14"
              height="14"
              className="shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">{job.taskType}</span>
          </span>
        ) : null}
      </div>

      <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        {job.openingDate ? (
          <span>Inscripciones desde {formatDateShort(job.openingDate)}</span>
        ) : null}
        {job.closingDate ? (
          <span title={formatRelative(job.closingDate)?.title}>
            Cierra {formatRelative(job.closingDate)?.label ?? "—"}
          </span>
        ) : null}
      </div>
    </div>
  );
}
