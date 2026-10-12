import { parseDate, startOfDay, startOfToday } from "@/lib/dates";
import type { JobFilters, JobRecord } from "@/types/jobs";

export const MAX_TITLE_LENGTH = 110;
export const ITEMS_PER_PAGE = 25;

export const HIDDEN_TAGS = new Set(["salud"]);

// Strips Unicode format characters (soft hyphen, zero-width joiners, BOM…) that
// leak from scraped HTML and would otherwise create duplicate organisms.
export function stripInvisible(text: string | null | undefined) {
  return (text ?? "").normalize("NFC").replace(/\p{Cf}/gu, "");
}

export function normalize(text: string | null | undefined) {
  return stripInvisible(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function cleanOption(value: string | null) {
  return stripInvisible(value).replace(/\s+/g, " ").trim() || "Sin dato";
}

export function shorten(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}...`;
}

export const TAG_LABELS: Record<string, string> = {
  salud: "Salud",
  educacion: "Educación",
  tecnologia: "Tecnología",
  administracion: "Administración",
  legal: "Legal",
  ingenieria: "Ingeniería",
  ciencia: "Ciencia",
  seguridad: "Seguridad",
  comunicaciones: "Comunicaciones",
  transporte: "Transporte",
  artes: "Artes",
  medio_ambiente: "Medio Ambiente",
  agro: "Agro",
  docente: "Docente",
  profesional: "Profesional",
  tecnico: "Técnico",
  asistente: "Asistente",
  administrativo: "Administrativo",
  especializado: "Especializado",
  directivo: "Directivo",
  operativo: "Operativo",
  supervision: "Supervisión",
  cardiologia: "Cardiología",
  neurologia: "Neurología",
  traumatologia: "Traumatología",
  hemoterapia: "Hemoterapia",
  anestesiologia: "Anestesiología",
  oftalmologia: "Oftalmología",
  psiquiatria: "Psiquiatría",
  neumologia: "Neumología",
  endocrinologia: "Endocrinología",
  urologia: "Urología",
  gastroenterologia: "Gastroenterología",
  medicina_interna: "Medicina Interna",
  medicina_nuclear: "Medicina Nuclear",
  medicina_preventiva: "Medicina Preventiva",
  medicina_familiar: "Medicina Familiar",
  medicina_intensiva: "Medicina Intensiva",
  otorrinolaringologia: "Otorrinolaringología",
  patologia: "Patología",
  obstetricia: "Obstetricia y Ginecología",
  cirugia: "Cirugía",
  odontologia: "Odontología",
  fisioterapia: "Fisioterapia",
  radioterapia: "Radioterapia",
  enfermeria: "Enfermería",
  farmacia: "Farmacia",
  nutricion: "Nutrición",
  laboratorio: "Laboratorio",
  imagenologia: "Imagenología",
  bioquimica: "Bioquímica",
  bacteriologia: "Bacteriología",
  virologia: "Virología",
  histologia: "Histología",
  embriologia: "Embriología",
  inmunobiologia: "Inmunobiología",
  fisiopatologia: "Fisiopatología",
  fisiologia: "Fisiología",
  psicologia_medica: "Psicología Médica",
  medicina_emergencia: "Emergencia",
  medicina_fisica_rehab: "Med. Física y Rehab.",
  infectologia: "Infectología",
  kinesiologia: "Kinesiología",
  veterinaria: "Veterinaria",
  administracion_salud: "Adm. Salud",
};

export type JobDisplayStatus = "abierto" | "cerrado";

export const DISPLAY_STATUS_LABELS: Record<JobDisplayStatus, string> = {
  abierto: "Abierto",
  cerrado: "Cerrado",
};

export function getDisplayStatus(job: JobRecord): JobDisplayStatus {
  if (job.status === "cerrado") return "cerrado";
  if (job.status === "abierto") return "abierto";

  const today = startOfToday();
  const closing = parseDate(job.closingDate);

  if (!closing || startOfDay(closing) >= today) return "abierto";

  return "cerrado";
}

export function isUpcoming(job: JobRecord): boolean {
  const opening = parseDate(job.openingDate);

  return Boolean(opening && startOfDay(opening) > startOfToday());
}

/** ¿El llamado matchea los criterios de una búsqueda guardada? */
export function jobMatchesFilters(
  job: JobRecord,
  filters: JobFilters,
): boolean {
  if (filters.query) {
    const text = normalize(filters.query);
    const haystack = normalize(
      [
        job.title,
        job.position,
        job.callNumber,
        job.organization,
        job.subOrganization,
        job.locality,
        job.location,
        job.taskType,
        job.tags.join(" "),
      ]
        .filter(Boolean)
        .join(" "),
    );
    if (!haystack.includes(text)) {
      return false;
    }
  }

  if (filters.organization && cleanOption(job.organization) !== filters.organization) {
    return false;
  }

  if (filters.taskType && cleanOption(job.taskType) !== filters.taskType) {
    return false;
  }

  if (filters.afro && !job.quotas.afrodescendientes) {
    return false;
  }

  if (filters.discapacidad && !job.quotas.discapacidad) {
    return false;
  }

  if (filters.trans && !job.quotas.trans) {
    return false;
  }

  if (filters.victimas && !job.quotas.victimasDelitosViolentos) {
    return false;
  }

  return true;
}

/** Filtra un dataset con los mismos criterios que usa el tablero de llamados. */
export function filterJobs(
  jobs: JobRecord[],
  filters: JobFilters,
): JobRecord[] {
  return jobs.filter((job) => jobMatchesFilters(job, filters));
}
