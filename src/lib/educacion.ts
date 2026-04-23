export const degreeTypeLabels: Record<string, string> = {
  maestria: "Maestria",
  especializacion: "Especializacion",
  doctorado: "Doctorado",
  diplomado: "Diplomado",
  posdoctorado: "Posdoctorado",
  otro: "Otro",
};

export const modalityLabels: Record<string, string> = {
  presencial: "Presencial",
  virtual: "Virtual",
  hibrido: "Hibrido",
};

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
