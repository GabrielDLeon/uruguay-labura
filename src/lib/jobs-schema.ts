import { z } from "astro/zod";

const topOrganizationSchema = z.object({
  name: z.string().min(1),
  count: z.number().nonnegative(),
});

const taskTypeEntrySchema = z.object({
  name: z.string().min(1),
  count: z.number().nonnegative(),
  percentage: z.number(),
});

const quotaJobsCountsSchema = z.object({
  afrodescendientes: z.number().nonnegative(),
  trans: z.number().nonnegative(),
  discapacidad: z.number().nonnegative(),
  victimas: z.number().nonnegative(),
});

const dailyClosingSchema = z.object({
  date: z.string(),
  count: z.number().nonnegative(),
});

const next7DaysSchema = z.object({
  totalClosing: z.number().nonnegative(),
  byDate: z.array(dailyClosingSchema),
});

const evolutionSnapshotSchema = z.object({
  date: z.string(),
  total: z.number().nonnegative(),
  organizations: z.number().nonnegative(),
});

const dashboardSchema = z.object({
  topOrganizations: z.array(topOrganizationSchema),
  taskTypeDistribution: z.array(taskTypeEntrySchema),
  quotaJobs: quotaJobsCountsSchema,
  next7Days: next7DaysSchema,
  evolution: z.array(evolutionSnapshotSchema),
});

const documentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const jobSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  sourceJobId: z.string().min(1),
  callNumber: z.string().min(1),
  title: z.string().min(1),
  position: z.string().nullable(),
  location: z.string().nullable(),
  organization: z.string().nullable(),
  subOrganization: z.string().nullable(),
  department: z.string().nullable(),
  locality: z.string().nullable(),
  inciso: z.string().nullable(),
  taskType: z.string().nullable(),
  status: z.enum(["abierto", "cerrado", "otro"]),
  openingDate: z.string().nullable(),
  closingDate: z.string().nullable(),
  quotas: z.object({
    afrodescendientes: z.boolean(),
    discapacidad: z.boolean(),
    trans: z.boolean(),
    victimasDelitosViolentos: z.boolean(),
  }),
  contractType: z.string().nullable(),
  totalPositions: z.number().nullable(),
  tags: z.array(z.string()),
  documents: z.array(documentSchema).default([]),
  origin: z.url(),
  applyUrl: z.url().nullable(),
  applyEmail: z.string().nullable(),
  scrapedAt: z.string(),
});

export const jobsDatasetSchema = z.object({
  source: z.string().min(1),
  scrapedAt: z.string(),
  total: z.number().nonnegative(),
  jobs: z.array(jobSchema),
  dashboard: dashboardSchema.optional(),
});

export function parseJobsDataset(input: unknown) {
  return jobsDatasetSchema.parse(input);
}
