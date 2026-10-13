import type { JobDetailPayload } from "@/types/jobs";

const detailCache = new Map<string, JobDetailPayload>();
const inflightRequests = new Map<string, Promise<JobDetailPayload>>();

function isJobDetailPayload(value: unknown): value is JobDetailPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<JobDetailPayload>;
  return (
    typeof payload.id === "string" &&
    (payload.markdown === null || typeof payload.markdown === "string")
  );
}

/**
 * Fetches (or reuses) the text detail of one job from its static file
 * `/empleos/<id>.json`. The board never downloads every detail: only the one
 * for the block the visitor opens.
 */
export function loadJobDetail(id: string): Promise<JobDetailPayload> {
  const cached = detailCache.get(id);
  if (cached) {
    return Promise.resolve(cached);
  }

  const inflight = inflightRequests.get(id);
  if (inflight) {
    return inflight;
  }

  let request: Promise<JobDetailPayload>;
  request = fetch(`/empleos/${encodeURIComponent(id)}.json`, {
    headers: { Accept: "application/json" },
  })
    .then((response) => {
      // A job without text detail has no static file: treat it as "no detail"
      // instead of an error, so the panel can show its friendly fallback.
      if (response.status === 404) {
        return { id, markdown: null };
      }

      if (!response.ok) {
        throw new Error(`No se pudo cargar el detalle (${response.status})`);
      }

      return response.json();
    })
    .then((payload: unknown) => {
      if (!isJobDetailPayload(payload)) {
        throw new Error("Detalle con formato invalido");
      }

      detailCache.set(id, payload);
      return payload;
    })
    .finally(() => {
      if (inflightRequests.get(id) === request) {
        inflightRequests.delete(id);
      }
    });

  inflightRequests.set(id, request);
  return request;
}
