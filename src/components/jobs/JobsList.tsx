import { Icon } from "@iconify/react/offline";

import OrganizationLabel from "@/components/jobs/OrganizationLabel";
import {
  MAX_TITLE_LENGTH,
  formatDate,
  shorten,
  statusClass,
} from "@/components/jobs/jobs";
import { appIcons } from "@/lib/icons";
import type { JobRecord } from "@/types/jobs";

interface Props {
  jobs: JobRecord[];
}

export default function JobsList({ jobs }: Props) {
  return (
    <div className="flex flex-col gap-4 md:hidden">
      {jobs.map((job) => (
        <article key={job.id} className="card">
          <header className="flex flex-wrap items-center gap-2">
            <a
              href={job.detailUrl}
              target="_blank"
              rel="noreferrer"
              className="badge-outline"
            >
              {job.callNumber}
            </a>
            <span className={statusClass(job.status)}>{job.status}</span>
            {job.isNew ? <span className="badge">Nuevo</span> : null}
          </header>
          <section>
            <h3 className="text-base font-semibold">
              <span className="block truncate" title={job.title}>
                {shorten(job.title, MAX_TITLE_LENGTH)}
              </span>
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              <OrganizationLabel
                organization={job.organization}
                subOrganization={job.subOrganization}
              />
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
  );
}
