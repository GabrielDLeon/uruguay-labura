import jobsDatasetRaw from "@/data/jobs.generated.json";
import { parseJobsDataset } from "@/lib/jobs-schema";

export const prerender = true;

export function GET() {
  const dataset = parseJobsDataset(jobsDatasetRaw);

  return new Response(JSON.stringify(dataset), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
