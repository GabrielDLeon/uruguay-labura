import type { Crumb } from "./seo";

/**
 * Labels for known sections so breadcrumb trails can be derived from the route
 * instead of being hand-written per page.
 */
const SECTION_LABELS: Record<string, string> = {
  "/educacion": "Educación",
  "/educacion/becas": "Becas",
  "/educacion/carreras": "Carreras",
  "/educacion/instituciones": "Instituciones",
  "/empleos": "Empleos",
  "/carreras": "Carreras",
  "/acerca": "Acerca",
};

/**
 * Build a breadcrumb trail from a site-relative pathname. The last crumb is
 * always the current page (no url, matching the schema.org BreadcrumbList) and
 * is a link in the ancestors. Pass `currentLabel` to override the label of the
 * current page (e.g. the title of a detail entry).
 */
export function getBreadcrumbs(
  pathname: string,
  currentLabel?: string,
): Crumb[] {
  const crumbs: Crumb[] = [{ label: "Inicio", url: "/" }];
  const segments = pathname.split("/").filter(Boolean);
  let acc = "";

  for (const [i, segment] of segments.entries()) {
    acc += `/${segment}`;
    const label = SECTION_LABELS[acc] ?? segment;
    if (i === segments.length - 1) {
      crumbs.push({ label: currentLabel ?? label });
    } else {
      crumbs.push({ label, url: acc });
    }
  }

  return crumbs;
}