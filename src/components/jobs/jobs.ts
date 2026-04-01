import type { JobRecord } from "@/types/jobs";

export const MAX_TITLE_LENGTH = 110;
export const MAX_VISIBLE_RESULTS = 50;
export const MIN_CALL_NUMBER_CHARS = 2;

export function normalize(text: string | null | undefined) {
  return (text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function formatDate(date: string | null) {
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

export function cleanOption(value: string | null) {
  return value?.trim() || "Sin dato";
}

export function shorten(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}...`;
}

export function statusClass(status: JobRecord["status"]) {
  if (status === "abierto") {
    return "badge-secondary";
  }

  if (status === "cerrado") {
    return "badge-destructive";
  }

  return "badge-outline";
}
