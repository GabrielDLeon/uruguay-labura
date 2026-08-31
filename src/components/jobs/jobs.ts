import type { JobRecord } from "@/types/jobs";

export const MAX_TITLE_LENGTH = 110;
export const ITEMS_PER_PAGE = 25;
export const MIN_CALL_NUMBER_CHARS = 2;

/** Tags que no se muestran en la columna de la tabla (siguen funcionando para búsqueda y filtros). */
export const HIDDEN_TAGS = new Set(["salud"]);

export function normalize(text: string | null | undefined) {
  return (text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function cleanOption(value: string | null) {
  return value?.trim() || "Sin dato";
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
  veterinaria: "Veterinaria",
  administracion_salud: "Adm. Salud",
}

export function statusVariant(status: JobRecord["status"]) {
  if (status === "abierto") return "secondary";
  if (status === "cerrado") return "destructive";
  return "outline";
}
