# Becas — content reference

Scholarship files document funding opportunities. Body is Spanish; the `##` headings are the page tabs. Sources live in the **frontmatter** (`sources`), exactly like careers, and render in the page aside — there is no `## Fuentes` tab.

## Frontmatter fields

```yaml
---
title: "Becas ANII"
type: "Beca estatal para posgrados"
institution: "Agencia Nacional de Investigación e Innovación (ANII)"
description: "Estipendios mensuales para maestrías, doctorados y posdoctorados en Uruguay y en el exterior."
website: "https://anii.org.uy/"
applicationUrl: "https://www.anii.org.uy/apoyos/formacion/"
amount: "Estipendio mensual según modalidad (valores 2026)"
image: "@/assets/institutions/anii.webp"
level:
  - "posgrado"
renewable: false
applicationDeadline: ""
sources:
  - label: "ANII - Formación"
    url: "https://anii.org.uy/apoyos/formacion/"
tags:
  - "estatal"
  - "posgrado"
draft: false
createdAt: "2026-07-31 16:58:06"
updatedAt: "2026-08-12 12:00:00"
---
```

| Field                     | Notes / allowed values                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                   | required; scholarship name.                                                                                                                                               |
| `short`                   | optional.                                                                                                                                                                 |
| `type`                    | required; free Spanish label, e.g. `Beca estatal para posgrados`.                                                                                                         |
| `institution`             | required; granting body or institution (free display string).                                                                                                             |
| `description`             | optional; short Spanish summary. Avoid hardcoding peso amounts (see BPC rule).                                                                                            |
| `website`                 | required; official page.                                                                                                                                                  |
| `applicationUrl`          | optional; direct application link (often different from `website`). Renders as the "Postular" button.                                                                     |
| `amount`                  | optional; one-line summary in stable units (see BPC rule).                                                                                                                |
| `image`                   | optional; path to the scholarship's image (e.g. `@/assets/scholarships/xxx.jpg`), same convention as institution `logo`. Renders in the page header and the listing card. |
| `level`                   | optional; array of `grado \| posgrado \| tecnico \| diplomado \| educacion-media`. Aligned with `BecaLevel` in `src/lib/scholarships.ts`.                                 |
| `renewable`               | optional; default `false`. `true` = a renewal mechanism exists (conditions go in the body under `### Renovación`).                                                        |
| `applicationDeadline`     | optional; ISO `YYYY-MM-DD` for a concrete closing date, or `""` when only the recurring window is known.                                                                  |
| `sources`                 | required for every factual claim; array of `{ label, url }` pointing at official pages. Renders in the aside.                                                             |
| `tags`                    | optional; Spanish topical tags.                                                                                                                                           |
| `draft`                   | default `false`.                                                                                                                                                          |
| `createdAt` / `updatedAt` | optional; `YYYY-MM-DD HH:MM:SS`.                                                                                                                                          |

## BPC rule (amounts that track an index)

- Amounts anchored to the BPC (or any legal index) are written in the **stable unit, never in pesos**: `2 BPC mensuales`, `1/4 BPC`, `0,67 BPC`. The peso value changes yearly by decree and must NOT be hardcoded in content.
- The current BPC value lives centrally in `src/config/financial.ts` (`BPC` export). When the annual decree changes, update it there — not in the content files.
- Fixed amounts set by resolution (e.g. ANII stipends) are written with the year annotated: `$36.263/mes (2026)`, so the next change is visible in the diff.
- Percentages (ORT, UCU, UM) and foreign-currency amounts (Erasmus €, Roberto Rocca U$S) are stable and written as-is.

## Body — canonical tabs

Emit these tabs; there is **no** `## Fuentes` tab (sources are in the frontmatter). Tables are welcome for amounts, durations, and deadlines.

```markdown
## Cobertura

What it covers and how much. BPC-anchored amounts in stable units; tables per modality welcome.

### Renovación

Renewal conditions, when applicable (H3 inside Cobertura).

## Requisitos

**A quién está dirigida:** who it is for.

- Concrete requirements.

## Cómo Postular

How and where to apply; `### Documentación` as H3 when needed; link the `applicationUrl`.

## Fechas y Plazas

Recurring application windows — only when there is no concrete `applicationDeadline`.
```

`## Fechas y Plazas` is optional: add it when the deadline is a recurring window rather than a concrete date (which goes in `applicationDeadline`).
