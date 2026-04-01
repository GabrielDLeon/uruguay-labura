import { Icon } from "@iconify/react/offline";

import OrganizationLabel from "@/components/jobs/OrganizationLabel";
import { MAX_TITLE_LENGTH, formatDate, shorten } from "@/components/jobs/jobs";
import type { JobRecord } from "@/types/jobs";

interface Props {
  jobs: JobRecord[];
}

export default function JobsTable({ jobs }: Props) {
  return (
    <div className="hidden md:block">
      <section className="overflow-x-auto">
        <table className="table table-fixed w-full min-w-[900px]">
          <colgroup>
            <col className="w-24" />
            <col className="w-48" />
            <col />
            <col className="w-28" />
            <col className="w-28" />
            <col className="w-40" />
          </colgroup>
          <thead>
            <tr>
              <th>Llamado</th>
              <th>Tipo</th>
              <th>Titulo</th>
              <th>Apertura</th>
              <th>Cierre</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="whitespace-nowrap">
                  <a
                    href={job.detailUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="badge-outline inline-flex items-center"
                  >
                    {job.callNumber}
                  </a>
                </td>
                <td className="truncate" title={job.taskType ?? "Sin dato"}>
                  {job.taskType ?? "Sin dato"}
                </td>
                <td>
                  <div className="font-semibold">
                    <span
                      className="block max-w-[42ch] truncate"
                      title={job.title}
                    >
                      {shorten(job.title, MAX_TITLE_LENGTH)}
                    </span>
                  </div>
                  <div
                    className="text-muted-foreground max-w-[42ch] text-xs"
                    title={`${job.organization ?? "Sin dato"}${job.subOrganization ? ` (${job.subOrganization})` : ""}`}
                  >
                    <OrganizationLabel
                      organization={job.organization}
                      subOrganization={job.subOrganization}
                    />
                  </div>
                </td>
                <td className="whitespace-nowrap">
                  {formatDate(job.openingDate)}
                </td>
                <td className="whitespace-nowrap">
                  {formatDate(job.closingDate)}
                </td>
                <td className="whitespace-nowrap">
                  <a
                    className="btn btn-sm inline-flex items-center gap-1"
                    href={job.applyUrl ?? job.detailUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver llamado
                    <Icon
                      icon="mdi:account-credit-card"
                      width="24"
                      height="24"
                    />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
