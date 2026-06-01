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

export const modalityLabels: Record<string, string> = {
  presencial: "Presencial",
  virtual: "Virtual",
  hibrido: "Hibrido",
};

import { SOLIDARITY_INSTITUTIONS } from "@/config/financial";

export function getSolidarityFundInfo(
  institutionSlug: string | undefined,
  duration: string,
): { applies: boolean; tier: "short" | "long" | null; additional: boolean } {
  if (!institutionSlug)
    return { applies: false, tier: null, additional: false };

  const slug = institutionSlug.toLowerCase();
  const applies = SOLIDARITY_INSTITUTIONS.includes(slug);
  if (!applies) return { applies: false, tier: null, additional: false };

  const years = parseInt(duration, 10);
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
