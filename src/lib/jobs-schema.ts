import { z } from "astro/zod";

export const jobSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  sourceJobId: z.string().min(1),
  callNumber: z.string().min(1),
  title: z.string().min(1),
  organization: z.string().nullable(),
  department: z.string().nullable(),
  locality: z.string().nullable(),
  inciso: z.string().nullable(),
  taskType: z.string().nullable(),
  status: z.enum(["abierto", "cerrado", "otro"]),
  openingDate: z.string().nullable(),
  closingDate: z.string().nullable(),
  isNew: z.boolean(),
  quotas: z.object({
    afrodescendientes: z.boolean(),
    discapacidad: z.boolean(),
    trans: z.boolean(),
    victimasDelitosViolentos: z.boolean(),
  }),
  detailUrl: z.string().url(),
  applyUrl: z.string().url().nullable(),
  scrapedAt: z.string(),
});

export const jobsDatasetSchema = z.object({
  source: z.string().min(1),
  scrapedAt: z.string(),
  total: z.number().nonnegative(),
  jobs: z.array(jobSchema),
});

export function parseJobsDataset(input: unknown) {
  return jobsDatasetSchema.parse(input);
}
