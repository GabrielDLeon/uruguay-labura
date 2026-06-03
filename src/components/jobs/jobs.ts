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

export function formatRelative(
  date: string | null,
): { label: string; title: string } | null {
  if (!date) return null

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return { label: date, title: date }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
  )
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )

  const title = new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed)

  if (diffDays === 0) return { label: "Hoy", title }
  if (diffDays === 1) return { label: "Mañana", title }
  if (diffDays === -1) return { label: "Ayer", title }

  const absDays = Math.abs(diffDays)

  if (absDays <= 6) {
    return diffDays > 1
      ? { label: `En ${diffDays} días`, title }
      : { label: `Hace ${absDays} días`, title }
  }

  const weeks = Math.floor(absDays / 7)
  const weekLabel = weeks === 1 ? "semana" : "semanas"

  if (diffDays > 1 && absDays <= 30)
    return { label: `En ${weeks} ${weekLabel}`, title }
  if (diffDays < -1 && absDays <= 30)
    return { label: `Hace ${weeks} ${weekLabel}`, title }

  return { label: title, title }
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
