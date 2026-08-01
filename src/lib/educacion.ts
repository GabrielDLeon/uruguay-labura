export const showDrafts = import.meta.env.SHOW_DRAFTS === "true";

export const degreeTypeLabels: Record<string, string> = {
  maestria: "Maestria",
  especializacion: "Especializacion",
  doctorado: "Doctorado",
  diplomado: "Diplomado",
  posdoctorado: "Posdoctorado",
  tecnologo: "Tecnologo",
  ingenieria: "Ingenieria",
  licenciatura: "Licenciatura",
  tecnicatura: "Tecnicatura",
  otro: "Otro",
};

export const shiftLabels: Record<string, string> = {
  day: "Diurno",
  night: "Nocturno",
  both: "Ambos",
};

export const modalityLabels: Record<string, string> = {
  presencial: "Presencial",
  virtual: "Virtual",
  hibrido: "Hibrido",
};

export const modalityBarFilled: Record<string, number> = {
  presencial: 1,
  hibrido: 2,
  virtual: 3,
};

export const degreeTypeGroupLabels: Record<string, string> = {
  diplomado: "Diplomado",
  tecnico: "Tecnico",
  grado: "Grado",
  posgrado: "Posgrado",
};

const degreeTypeGroupMap: Record<string, { group: string; filled: number }> = {
  diplomado: { group: "diplomado", filled: 1 },
  otro: { group: "diplomado", filled: 1 },
  tecnicatura: { group: "tecnico", filled: 2 },
  tecnologo: { group: "tecnico", filled: 2 },
  licenciatura: { group: "grado", filled: 3 },
  ingenieria: { group: "grado", filled: 3 },
  especializacion: { group: "posgrado", filled: 4 },
  maestria: { group: "posgrado", filled: 4 },
  doctorado: { group: "posgrado", filled: 4 },
  posdoctorado: { group: "posgrado", filled: 4 },
};

export function getDegreeTypeBarInfo(degreeType: string): {
  group: string;
  filled: number;
} {
  return degreeTypeGroupMap[degreeType] ?? { group: "diplomado", filled: 1 };
}

import { SOLIDARITY_INSTITUTIONS } from "@/config/financial";

export function parseDurationYears(duration: string | undefined): number {
  if (!duration) return Number.NaN;
  const meses = /(\d+)\s+meses?/.exec(duration);
  if (meses) return Number(meses[1]) / 12;
  const años = /(\d+)\s+años?/.exec(duration);
  if (años) return Number(años[1]);
  const lead = /^\d+/.exec(duration);
  return lead ? Number(lead[0]) : Number.NaN;
}

export function getSolidarityFundInfo(
  institutionSlug: string | undefined,
  duration: string | undefined,
): { applies: boolean; tier: "short" | "long" | null; additional: boolean } {
  if (!institutionSlug)
    return { applies: false, tier: null, additional: false };

  const slug = institutionSlug.toLowerCase();
  const applies = SOLIDARITY_INSTITUTIONS.includes(slug);
  if (!applies) return { applies: false, tier: null, additional: false };

  const years = parseDurationYears(duration);
  const tier = Number.isNaN(years) || years < 4 ? "short" : "long";
  const additional = slug === "udelar" && !Number.isNaN(years) && years >= 5;

  return { applies: true, tier, additional };
}

export function formatCurrency(amount: number): string {
  return `$${new Intl.NumberFormat("es-UY").format(amount)}`;
}

export function formatDate(date: string | null | undefined) {
  if (!date) {
    return "-";
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}
