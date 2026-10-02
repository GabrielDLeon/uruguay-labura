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
  carrera: "Carrera",
  ciclo: "Ciclo",
  otro: "Otro",
};

export const shiftLabels: Record<string, string> = {
  day: "Diurno",
  night: "Nocturno",
  both: "Ambos",
};

export const accreditationLabels: Record<string, string> = {
  "Reconocida por el MEC": "✓ Reconocida por el MEC",
  "En trámite ante el MEC": "⏳ En trámite ante el MEC",
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
  ciclo: "Ciclo",
};

const degreeTypeGroupMap: Record<string, { group: string; filled: number }> = {
  diplomado: { group: "diplomado", filled: 1 },
  otro: { group: "diplomado", filled: 1 },
  tecnicatura: { group: "tecnico", filled: 2 },
  tecnologo: { group: "tecnico", filled: 2 },
  licenciatura: { group: "grado", filled: 3 },
  ingenieria: { group: "grado", filled: 3 },
  carrera: { group: "grado", filled: 3 },
  ciclo: { group: "ciclo", filled: 1 },
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
  const text = duration.toLowerCase();
  const years = /(\d+(?:\.\d+)?)\s*año/.exec(text);
  const months = /(\d+)\s*mes(?:es)?/.exec(text);
  if (!years && !months) return Number.NaN;
  return (years ? Number(years[1]) : 0) + (months ? Number(months[1]) / 12 : 0);
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
