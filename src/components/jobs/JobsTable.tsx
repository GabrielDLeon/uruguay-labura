import OrgLogo from "@/components/jobs/OrgLogo";
import { Icon } from "@iconify/react/offline";

import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import SaveButton from "@/components/jobs/SaveButton";
import { formatDateShort, formatRelative } from "@/lib/dates";

import {
  HIDDEN_TAGS,
  MAX_TITLE_LENGTH,
  TAG_LABELS,
  getDisplayStatus,
  isUpcoming,
  shorten,
} from "@/components/jobs/jobs";
import { appIcons } from "@/lib/icons";
import type { JobRecord } from "@/types/jobs";

interface Props {
  jobs: JobRecord[];
}

const SHOW_TAGS = false;

export default function JobsTable({ jobs }: Props) {
  return (
    <div className="hidden md:block">
      <section className="overflow-x-auto">
        <table className="table table-fixed w-full min-w-[900px]">
          <colgroup>
            <col className="w-24" />
            <col className="w-10" />
            <col className="w-80" />
            {SHOW_TAGS ? <col className="w-78" /> : null}
            <col className="w-32" />
            <col className="w-20" />
            <col className="w-28" />
            <col className="w-20" />
          </colgroup>
          <thead>
            <tr>
              <th>Llamado</th>
              <th>
                <span className="sr-only">Organismo</span>
              </th>
              <th>Título</th>
              {SHOW_TAGS ? <th>Tags</th> : null}
              <th>Lugar</th>
              <th>Estado</th>
              <th>Cierre</th>
              <th className="text-center">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const displayStatus = getDisplayStatus(job);

              return (
                <tr key={job.id} className="hover:bg-[var(--muted)]">
                  <td className="whitespace-nowrap">
                    <span
                      className="badge inline-flex items-center"
                      data-variant="outline"
                    >
                      {job.callNumber}
                    </span>
                  </td>
                  <td>
                    <OrgLogo organization={job.organization} />
                  </td>
                  <td>
                    <div className="font-semibold">
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
                  </td>
                  {SHOW_TAGS ? (
                    <td
                      className="truncate"
                      title={job.tags
                        .filter((t) => !HIDDEN_TAGS.has(t))
                        .map((t) => TAG_LABELS[t] ?? t)
                        .join(", ")}
                    >
                      <span className="inline-flex gap-1">
                        {job.tags
                          .filter((t) => !HIDDEN_TAGS.has(t))
                          .map((tag) => (
                            <span
                              key={tag}
                              className="badge text-xs"
                              data-variant="outline"
                            >
                              {TAG_LABELS[tag] ?? tag}
                            </span>
                          ))}
                      </span>
                    </td>
                  ) : null}
                  <td
                    className="truncate text-xs"
                    title={job.location ?? undefined}
                  >
                    {job.location ?? "—"}
                  </td>
                  <td className="whitespace-nowrap">
                    {isUpcoming(job) ? (
                      <span className="text-muted-foreground text-xs">
                        {formatDateShort(job.openingDate)}
                      </span>
                    ) : (
                      <JobStatusBadge status={displayStatus} />
                    )}
                  </td>
                  <td
                    className="whitespace-nowrap"
                    title={formatRelative(job.closingDate)?.title}
                  >
                    {formatRelative(job.closingDate)?.label ?? "-"}
                  </td>
                  <td className="whitespace-nowrap">
                    <span
                      className="inline-flex items-center gap-0.5"
                      role="toolbar"
                      aria-label="Acciones"
                    >
                      <a
                        href={job.applyUrl ?? job.detailUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Abrir llamado"
                        aria-label="Abrir llamado"
                        className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center justify-center rounded p-1 transition-colors"
                      >
                        <Icon
                          icon={appIcons.externalLink}
                          width="18"
                          height="18"
                        />
                      </a>
                      <SaveButton jobId={job.id} />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
