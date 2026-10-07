export type JobStatus = "abierto" | "cerrado" | "otro";

export interface JobQuotaFlags {
  afrodescendientes: boolean;
  discapacidad: boolean;
  trans: boolean;
  victimasDelitosViolentos: boolean;
}

export interface JobDocument {
  id: string;
  name: string;
}

export interface JobRecord {
  id: string;
  source: string;
  sourceJobId: string;
  callNumber: string;
  title: string;
  position: string | null;
  location: string | null;
  organization: string | null;
  subOrganization: string | null;
  department: string | null;
  locality: string | null;
  inciso: string | null;
  taskType: string | null;
  status: JobStatus;
  openingDate: string | null;
  closingDate: string | null;
  quotas: JobQuotaFlags;
  contractType: string | null;
  totalPositions: number | null;
  tags: string[];
  documents: JobDocument[];
  origin: string;
  applyUrl: string | null;
  applyEmail: string | null;
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

/** Criterios de filtrado del tablero de llamados. */
export interface JobFilters {
  query: string;
  organization: string;
  taskType: string;
  afro: boolean;
  discapacidad: boolean;
  trans: boolean;
  victimas: boolean;
}

/**
 * Búsqueda guardada en el navegador (sin cuenta). `seenJobIds` es el snapshot
 * contra el que se calcula qué llamados son novedad respecto de la última visita.
 */
export interface SavedSearch {
  id: string;
  name: string;
  criteria: JobFilters;
  createdAt: string;
  lastSeenAt: string | null;
  seenJobIds: string[];
}
