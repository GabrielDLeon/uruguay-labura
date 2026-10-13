import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react/offline";
import type { ReactNode } from "react";

import { BLOCK_BASE_CLASS } from "@/components/common/block";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import OrgLogo from "@/components/jobs/OrgLogo";
import OrganizationLabel from "@/components/jobs/OrganizationLabel";
import SaveButton from "@/components/jobs/SaveButton";
import { getDisplayStatus, isUpcoming } from "@/components/jobs/jobs";
import {
  formatDateReadable,
  formatDateShort,
  formatRelative,
} from "@/lib/dates";
import { parseJobDetailSections } from "@/lib/job-detail-markdown";
import { loadJobDetail } from "@/lib/jobs-details";
import { appIcons } from "@/lib/icons";
import type { JobRecord } from "@/types/jobs";

interface Props {
  job: JobRecord;
  onBack?: () => void;
}

type DetailState =
  | { status: "loading" }
  | { status: "ready"; markdown: string | null }
  | { status: "error"; message: string };

function DetailSections({ markdown }: { markdown: string }) {
  const sections = useMemo(() => parseJobDetailSections(markdown), [markdown]);

  return (
    <div className="flex flex-col gap-5">
      {sections.map((section, index) => (
        <section key={`${section.heading ?? "intro"}-${index}`}>
          {section.heading ? (
            <h4 className="mb-1.5 text-sm font-semibold">{section.heading}</h4>
          ) : null}
          {section.body ? (
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {section.body}
            </p>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function MetaItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export default function JobDetail({ job, onBack }: Props) {
  const [detail, setDetail] = useState<DetailState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    setDetail({ status: "loading" });

    loadJobDetail(job.id)
      .then((payload) => {
        if (!active) return;
        setDetail({ status: "ready", markdown: payload.markdown });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setDetail({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "No se pudo cargar el detalle",
        });
      });

    return () => {
      active = false;
    };
  }, [job.id]);

  const displayStatus = getDisplayStatus(job);

  const quotaLabels = [
    job.quotas.afrodescendientes ? "Afrodescendientes" : null,
    job.quotas.discapacidad ? "Discapacidad" : null,
    job.quotas.trans ? "Personas trans" : null,
    job.quotas.victimasDelitosViolentos
      ? "Víctimas de delitos violentos"
      : null,
  ].filter((label): label is string => label !== null);

  const registrationPeriod =
    job.openingDate || job.closingDate
      ? [job.openingDate, job.closingDate]
          .filter((value): value is string => Boolean(value))
          .map((value) => formatDateReadable(value))
          .join(" — ")
      : null;

  return (
    <article
      className={`${BLOCK_BASE_CLASS} flex min-h-full min-w-0 flex-col gap-4`}
    >
      {onBack ? (
        <button
          type="button"
          className="btn self-start"
          data-size="sm"
          data-variant="outline"
          onClick={onBack}
        >
          <Icon
            icon={appIcons.chevronDown}
            width="16"
            height="16"
            className="shrink-0 rotate-90"
            aria-hidden="true"
          />
          Volver a la lista
        </button>
      ) : null}

      <header className="flex items-start gap-3">
        <OrgLogo organization={job.organization} />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">{job.title}</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            <OrganizationLabel
              organization={job.organization}
              subOrganization={job.subOrganization}
            />
            {job.callNumber ? ` · Llamado ${job.callNumber}` : null}
          </p>
        </div>
        <SaveButton jobId={job.id} />
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {isUpcoming(job) ? (
          <span className="badge" data-variant="outline">
            Abre el {formatDateShort(job.openingDate)}
          </span>
        ) : (
          <JobStatusBadge status={displayStatus} />
        )}
        {quotaLabels.map((label) => (
          <span key={label} className="badge" data-variant="outline">
            {label}
          </span>
        ))}
      </div>

      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {job.taskType ? (
          <MetaItem label="Tipo de tarea">{job.taskType}</MetaItem>
        ) : null}
        {job.grado ? <MetaItem label="Grado">{job.grado}</MetaItem> : null}
        {job.modalidad.length > 0 ? (
          <MetaItem label="Modalidad">{job.modalidad.join(", ")}</MetaItem>
        ) : null}
        {job.contractType ? (
          <MetaItem label="Tipo de vínculo">{job.contractType}</MetaItem>
        ) : null}
        {job.location ? (
          <MetaItem label="Lugar de desempeño">{job.location}</MetaItem>
        ) : null}
        {job.totalPositions !== null ? (
          <MetaItem label="Puestos">
            {job.totalPositions.toLocaleString("es-UY")}
          </MetaItem>
        ) : null}
        {registrationPeriod ? (
          <MetaItem label="Inscripciones">{registrationPeriod}</MetaItem>
        ) : null}
        {job.closingDate ? (
          <MetaItem label="Cierre">
            {formatDateShort(job.closingDate)}{" "}
            <span className="text-muted-foreground">
              ({formatRelative(job.closingDate)?.label ?? "—"})
            </span>
          </MetaItem>
        ) : null}
      </dl>

      <div className="border-t border-border pt-4">
        {detail.status === "loading" ? (
          <p className="text-muted-foreground text-sm">
            Cargando detalle del llamado…
          </p>
        ) : null}

        {detail.status === "error" ? (
          <p className="text-muted-foreground text-sm">
            No se pudo cargar el detalle del llamado. {detail.message}
          </p>
        ) : null}

        {detail.status === "ready" && detail.markdown ? (
          <DetailSections markdown={detail.markdown} />
        ) : null}

        {detail.status === "ready" && !detail.markdown ? (
          <p className="text-muted-foreground text-sm">
            El detalle en texto de este llamado no está disponible. Podés
            consultarlo en la ficha oficial.
          </p>
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <a
          className="btn"
          href={job.applyUrl ?? job.origin}
          target="_blank"
          rel="noreferrer"
        >
          Postularse en el portal oficial
          <Icon
            icon={appIcons.externalLink}
            width="16"
            height="16"
            className="shrink-0"
            aria-hidden="true"
          />
        </a>
        <p className="text-muted-foreground text-xs">
          Este sitio no gestiona postulaciones: el trámite se hace en el portal
          de origen.
        </p>
      </footer>
    </article>
  );
}
