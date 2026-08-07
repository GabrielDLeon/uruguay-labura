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
 * Build a schema.org BreadcrumbList node. The last crumb has no `item`
 * (it represents the current page).
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
      ...(item.url ? { item: item.url } : {}),
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
 * e.g. "4 años" -> P4Y, "18 meses" -> P18M, "2 semestres" -> P12M.
 * Returns undefined when the string is not matched.
 */
export function durationToIso8601(
  duration: string | undefined,
): string | undefined {
  if (!duration) return undefined;
  const annos = /(\d+)\s+años?/i.exec(duration);
  if (annos) return `P${annos[1]}Y`;
  const meses = /(\d+)\s+meses?/i.exec(duration);
  if (meses) return `P${meses[1]}M`;
  const semestres = /(\d+)\s+semestres?/i.exec(duration);
  if (semestres) return `P${Number(semestres[1]) * 6}M`;
  return undefined;
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
