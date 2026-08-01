import type { CollectionEntry } from "astro:content";

import type { EducacionEntry } from "@/content.config";

type BecaEntry = CollectionEntry<"becas">;

export type BecaLevel =
  | "grado"
  | "posgrado"
  | "tecnico"
  | "diplomado"
  | "educacion-media";

const degreeTypeLevelMap: Record<string, BecaLevel> = {
  maestria: "posgrado",
  especializacion: "posgrado",
  doctorado: "posgrado",
  posdoctorado: "posgrado",
  tecnologo: "tecnico",
  tecnicatura: "tecnico",
  licenciatura: "grado",
  ingenieria: "grado",
  diplomado: "diplomado",
  carrera: "grado",
  ciclo: "grado",
  otro: "grado",
};

export function parseDurationYears(duration: string): number | undefined {
  if (!duration) return undefined;
  const text = duration.toLowerCase();

  const yearsMatch = text.match(/(\d+(?:[.,]\d+)?)\s*años?/);
  if (yearsMatch) {
    let years = parseFloat(yearsMatch[1].replace(",", "."));
    if (/y\s*medio/.test(text)) years += 0.5;
    return years;
  }

  const monthsMatch = text.match(/(\d+(?:[.,]\d+)?)\s*meses?/);
  if (monthsMatch) {
    return parseFloat(monthsMatch[1].replace(",", ".")) / 12;
  }

  const semestersMatch = text.match(/(\d+(?:[.,]\d+)?)\s*semestres?/);
  if (semestersMatch) {
    return parseFloat(semestersMatch[1].replace(",", ".")) / 2;
  }

  return undefined;
}

function getDegreeLevel(
  degreeType: string,
  duration: string,
): BecaLevel | undefined {
  const base = degreeTypeLevelMap[degreeType];
  if (base === "posgrado" && degreeType === "doctorado") {
    const years = parseDurationYears(duration);
    if (years !== undefined && years >= 4) return "grado";
  }
  return base;
}

export interface BecaRule {
  institutions?: string[];
  degreeLevels?: BecaLevel[];
  degreeTypes?: EducacionEntry["degreeType"][];
  titleIncludes?: string[];
  tags?: string[];
  minYears?: number;
  maxYears?: number;
}

const becaRules: Record<string, BecaRule> = {
  "fondo-solidaridad": {
    institutions: ["udelar", "utec", "utu"],
    degreeLevels: ["grado", "tecnico"],
  },
  "bienestar-universitario-udelar": {
    institutions: ["udelar"],
  },
  "becas-butia": {
    degreeLevels: ["educacion-media"],
  },
  "ort-excelencia-academica": {
    institutions: ["ort"],
  },
  "ucu-damaso-antonio-larranaga": {
    institutions: ["ucu"],
    degreeLevels: ["grado"],
  },
  "universidad-de-montevideo": {
    institutions: ["um"],
    degreeLevels: ["grado"],
  },
  "programa-roberto-rocca": {
    tags: ["programa-roberto-rocca"],
  },
  funiber: {
    degreeLevels: ["posgrado"],
  },
  anii: {
    degreeLevels: ["posgrado"],
    degreeTypes: ["maestria", "doctorado", "posdoctorado"],
  },
  "erasmus-plus": {
    institutions: ["udelar", "ort", "utec", "ucu", "um"],
  },
  "inefop-bachilleres": {
    degreeLevels: ["educacion-media"],
  },
  "smu-congresos-medicos": {
    titleIncludes: ["medicina"],
  },
};

export function becaMatchesCareer(
  beca: BecaEntry,
  career: EducacionEntry,
): boolean {
  const rule = becaRules[beca.id];
  if (!rule) return false;

  const {
    institutions,
    degreeLevels,
    degreeTypes,
    titleIncludes,
    tags,
    minYears,
    maxYears,
  } = rule;

  if (institutions && institutions.length > 0) {
    const slug = career.institution?.toLowerCase();
    if (!slug || !institutions.includes(slug)) return false;
  }

  if (degreeLevels && degreeLevels.length > 0) {
    const level = getDegreeLevel(career.degreeType, career.duration);
    if (!level || !degreeLevels.includes(level)) return false;
  }

  if (degreeTypes && degreeTypes.length > 0) {
    if (!degreeTypes.includes(career.degreeType)) return false;
  }

  if (titleIncludes && titleIncludes.length > 0) {
    const title = career.title.toLowerCase();
    if (!titleIncludes.some((k) => title.includes(k.toLowerCase()))) {
      return false;
    }
  }

  if (tags && tags.length > 0) {
    const careerTags = career.tags.map((t) => t.toLowerCase());
    if (!tags.some((t) => careerTags.includes(t.toLowerCase()))) {
      return false;
    }
  }

  if (minYears !== undefined || maxYears !== undefined) {
    const years = parseDurationYears(career.duration);
    if (years !== undefined) {
      if (minYears !== undefined && years < minYears) return false;
      if (maxYears !== undefined && years > maxYears) return false;
    }
  }

  return true;
}

export function getMatchingBecas(
  career: EducacionEntry,
  becas: BecaEntry[],
): BecaEntry[] {
  return becas.filter((beca) => becaMatchesCareer(beca, career));
}
