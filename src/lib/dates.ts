const LOCALE = "es-UY";

const shortDateOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
};

const readableDateOptions: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

const shortMonthDateOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

/** Parse a date string. Returns null for empty or invalid values. */
export function parseDate(date: string | null | undefined): Date | null {
  if (!date) {
    return null;
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

/** Truncate a date to its local calendar day (midnight). */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Today's date truncated to local midnight. */
export function startOfToday(): Date {
  return startOfDay(new Date());
}

/** Add days to a date, keeping local time. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Whole calendar days between two dates (from - to). */
export function diffInDays(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function format(
  date: string | null | undefined,
  options: Intl.DateTimeFormatOptions,
): string {
  const parsed = parseDate(date);
  if (!parsed) {
    return date || "-";
  }

  return new Intl.DateTimeFormat(LOCALE, options).format(parsed);
}

/** Short format: 28/05/2026 */
export function formatDateShort(date: string | null | undefined): string {
  return format(date, shortDateOptions);
}

/** Readable format: 28 de mayo de 2026 */
export function formatDateReadable(date: string | null | undefined): string {
  return format(date, readableDateOptions);
}

/** Short month format: 28 may 2026 */
export function formatDateShortMonth(date: string | null | undefined): string {
  return format(date, shortMonthDateOptions);
}

/**
 * Relative label for a date compared to today:
 * "Hoy", "Mañana", "En X días", "Hace X semanas" or the short date.
 */
export function formatRelative(
  date: string | null | undefined,
): { label: string; title: string } | null {
  const parsed = parseDate(date);
  if (!parsed) {
    return date ? { label: date, title: date } : null;
  }

  const today = startOfToday();
  const target = startOfDay(parsed);
  const diffDays = diffInDays(today, target);
  const title = formatDateShort(date);

  if (diffDays === 0) return { label: "Hoy", title };
  if (diffDays === 1) return { label: "Mañana", title };
  if (diffDays === -1) return { label: "Ayer", title };

  const absDays = Math.abs(diffDays);

  if (absDays <= 6) {
    return diffDays > 1
      ? { label: `En ${diffDays} días`, title }
      : { label: `Hace ${absDays} días`, title };
  }

  const weeks = Math.floor(absDays / 7);
  const weekLabel = weeks === 1 ? "semana" : "semanas";

  if (diffDays > 1 && absDays <= 30)
    return { label: `En ${weeks} ${weekLabel}`, title };
  if (diffDays < -1 && absDays <= 30)
    return { label: `Hace ${weeks} ${weekLabel}`, title };

  return { label: title, title };
}
