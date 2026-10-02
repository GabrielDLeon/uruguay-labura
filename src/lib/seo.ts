export const SITE_URL = import.meta.env.SITE as string;

/** Build an absolute URL from a site-relative path. */
export function absUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export interface Crumb {
  label: string;
  url?: string;
}

/**
 * Build a schema.org BreadcrumbList node from site-relative paths.
 * The last crumb has no `item` (it represents the current page).
 * Every `url` is converted to an absolute URL, because structured data
 * requires absolute URLs.
 */
export function breadcrumbList(
  items: Crumb[],
  id?: string,
): Record<string, unknown> {
  const node: Record<string, unknown> = {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.url ? { item: absUrl(item.url) } : {}),
    })),
  };
  if (id) node["@id"] = id;
  return node;
}

/** Map site modality (presencial/virtual/hibrido) to schema.org educationalProgramMode. */
export const educationalProgramMode: Record<string, string> = {
  presencial: "onsite",
  virtual: "online",
  hibrido: "blended",
};

/**
 * Convert a human-friendly duration string to an ISO 8601 Duration,
 * e.g. "4 años" -> P4Y, "1.5 años" -> P1Y6M, "2 años y 1 mes" -> P2Y1M.
 * Returns undefined when the string is not matched.
 */
export function durationToIso8601(
  duration: string | undefined,
): string | undefined {
  if (!duration) return undefined;
  const text = duration.toLowerCase();
  const years = /(\d+(?:\.\d+)?)\s*año/.exec(text);
  const months = /(\d+)\s*mes(?:es)?/.exec(text);
  if (!years && !months) {
    const semesters = /(\d+)\s*semestre/.exec(text);
    if (semesters) return `P${Number(semesters[1]) * 6}M`;
    return undefined;
  }
  const total = Math.round(
    (years ? Number(years[1]) * 12 : 0) + (months ? Number(months[1]) : 0),
  );
  if (total <= 0) return undefined;
  const y = Math.floor(total / 12);
  const m = total % 12;
  if (y > 0 && m > 0) return `P${y}Y${m}M`;
  if (y > 0) return `P${y}Y`;
  return `P${m}M`;
}

/**
 * Try to parse a cost string into a numeric price.
 * "gratuita"/"gratis"/"$0" -> 0; otherwise pull the first numeric figure
 * (UY decimal thousands). Returns undefined when nothing parseable.
 */
export function parseCost(cost: string | undefined): number | undefined {
  if (!cost) return undefined;
  const lower = cost.toLowerCase();
  if (/gratuit|gratis/.test(lower) || /\$\s*0\b/.test(lower)) return 0;
  const raw = cost.replace(/[^\d.,-]/g, "");
  if (!raw || raw === "-") return undefined;
  const cleaned = raw.replace(/\.(?=\d{3}\b)/g, "").replace(",", ".");
  const num = Number(cleaned);
  return Number.isFinite(num) && num >= 0 ? num : undefined;
}
