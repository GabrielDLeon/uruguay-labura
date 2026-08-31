export type JobStatus = "abierto" | "cerrado" | "otro";

export interface JobQuotaFlags {
  afrodescendientes: boolean;
  discapacidad: boolean;
  trans: boolean;
  victimasDelitosViolentos: boolean;
}

export interface JobRecord {
  id: string;
  source: string;
  sourceJobId: string;
  callNumber: string;
  title: string;
  organization: string | null;
  subOrganization: string | null;
  department: string | null;
  locality: string | null;
  inciso: string | null;
  taskType: string | null;
  status: JobStatus;
  openingDate: string | null;
  closingDate: string | null;
  isNew: boolean;
  quotas: JobQuotaFlags;
  vinculoType: string | null;
  totalPositions: number | null;
  tags: string[];
  detailUrl: string;
  applyUrl: string | null;
  scrapedAt: string;
}

export interface TopOrganization {
  name: string;
  count: number;
}

export interface TaskTypeEntry {
  name: string;
  count: number;
  percentage: number;
}

export interface QuotaJobsCounts {
  afrodescendientes: number;
  trans: number;
  discapacidad: number;
  victimas: number;
}

export interface DailyClosing {
  date: string;
  count: number;
}

export interface Next7Days {
  totalClosing: number;
  byDate: DailyClosing[];
}

export interface EvolutionSnapshot {
  date: string;
  total: number;
  organizations: number;
}

export interface DashboardData {
  topOrganizations: TopOrganization[];
  taskTypeDistribution: TaskTypeEntry[];
  quotaJobs: QuotaJobsCounts;
  next7Days: Next7Days;
  evolution: EvolutionSnapshot[];
}

export interface JobsDataset {
  source: string;
  scrapedAt: string;
  total: number;
  jobs: JobRecord[];
  dashboard?: DashboardData;
}
