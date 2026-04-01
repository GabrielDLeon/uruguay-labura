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
  detailUrl: string;
  applyUrl: string | null;
  scrapedAt: string;
}

export interface JobsDataset {
  source: string;
  scrapedAt: string;
  total: number;
  jobs: JobRecord[];
}
