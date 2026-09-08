import type { JobDisplayStatus } from "@/components/jobs/jobs";
import { DISPLAY_STATUS_LABELS } from "@/components/jobs/jobs";

const STATUS_STYLES: Record<JobDisplayStatus, string> = {
  abierto: "border-emerald-600/30 bg-emerald-600/15 text-emerald-700",
  cerrado: "border-red-600/30 bg-red-600/15 text-red-700",
};

export default function JobStatusBadge({
  status,
}: {
  status: JobDisplayStatus;
}) {
  return (
    <span
      className={`badge inline-flex whitespace-nowrap ${STATUS_STYLES[status]}`}
    >
      {DISPLAY_STATUS_LABELS[status]}
    </span>
  );
}
