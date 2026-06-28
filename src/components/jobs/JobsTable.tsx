import OrganizationLabel from "@/components/jobs/OrganizationLabel";
import {
  HIDDEN_TAGS,
  MAX_TITLE_LENGTH,
  TAG_LABELS,
  formatDate,
  formatRelative,
  shorten,
} from "@/components/jobs/jobs";
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
            <col />
            <col className="w-78" />
            <col className="w-28" />
            <col className="w-28" />
          </colgroup>
          <thead>
            <tr>
              <th>Llamado</th>
              <th>Titulo</th>
              <th>Tags</th>
              <th>Apertura</th>
              <th>Cierre</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job.id}
                onClick={() =>
                  window.open(job.applyUrl ?? job.detailUrl, "_blank")
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    window.open(job.applyUrl ?? job.detailUrl, "_blank");
                  }
                }}
                tabIndex={0}
                role="link"
                className="cursor-pointer hover:bg-[var(--muted)]"
              >
                <td className="whitespace-nowrap">
                  <span className="badge-outline inline-flex items-center">
                    {job.callNumber}
                  </span>
                </td>
                <td>
                  <div className="font-semibold">
                    <span className="block truncate" title={job.title}>
                      {shorten(job.title, MAX_TITLE_LENGTH)}
                    </span>
                  </div>
                  <div
                    className="text-muted-foreground truncate text-xs"
                    title={`${job.organization ?? "Sin dato"}${job.subOrganization ? ` (${job.subOrganization})` : ""}`}
                  >
                    <OrganizationLabel
                      organization={job.organization}
                      subOrganization={job.subOrganization}
                    />
                  </div>
                </td>
                <td
                  className="truncate"
                  title={job.tags.filter((t) => !HIDDEN_TAGS.has(t)).map((t) => TAG_LABELS[t] ?? t).join(", ")}
                >
                  <span className="inline-flex gap-1">
                    {job.tags.filter((t) => !HIDDEN_TAGS.has(t)).map((tag) => (
                      <span key={tag} className="badge-outline text-xs">
                        {TAG_LABELS[tag] ?? tag}
                      </span>
                    ))}
                  </span>
                </td>
                <td className="whitespace-nowrap">
                  {formatDate(job.openingDate)}
                </td>
                <td
                  className="whitespace-nowrap"
                  title={formatRelative(job.closingDate)?.title}
                >
                  {formatRelative(job.closingDate)?.label ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
