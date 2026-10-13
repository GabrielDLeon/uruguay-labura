import type { APIContext } from "astro";

import jobDetailsDatasetRaw from "@/data/job-details.generated.json";
import type { JobDetailsDataset } from "@/types/jobs";

export const prerender = true;

// The generated file may be empty on a clean checkout; the cast keeps
// TypeScript from inferring `never[]` from the empty list.
const jobDetailsDataset = jobDetailsDatasetRaw as JobDetailsDataset;

export function getStaticPaths() {
  return jobDetailsDataset.details
    .filter((detail) => detail.markdown)
    .map((detail) => ({ params: { id: detail.id } }));
}

export function GET({ params }: APIContext) {
  const id = params.id ?? "";
  const detail = jobDetailsDataset.details.find((item) => item.id === id);

  if (!detail || !detail.markdown) {
    return new Response(JSON.stringify({ error: "Detalle no disponible" }), {
      status: 404,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  return new Response(JSON.stringify({ id, markdown: detail.markdown }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
