# Becas — content reference

Scholarship files document funding opportunities. Body is Spanish; the `##` headings are the page tabs. Unlike careers, the `sources` also live in the body under a `## Fuentes` tab rather than in the frontmatter.

## Frontmatter fields

```yaml
---
title: "Becas ANII"
type: "Beca estatal para posgrados"
institution: "Agencia Nacional de Investigación e Innovación (ANII)"
description: "Estipendios mensuales para maestrías, doctorados y posdoctorados en Uruguay y en el exterior. Montos desde $36.263/mes."
website: "https://anii.org.uy/"
tags:
  - "estatal"
  - "posgrado"
  - "maestría"
  - "doctorado"
  - "investigación"
draft: false
createdAt: "2026-07-31 16:58:06"
updatedAt: "2026-08-04 16:48:16"
---
```

| Field | Notes / allowed values |
|---|---|
| `title` | required; scholarship name. |
| `short` | optional. |
| `type` | required; a free Spanish label, e.g. `Beca estatal para posgrados`. |
| `institution` | required; the granting body or institution (free display string). |
| `description` | optional; short Spanish summary with key figures. |
| `website` | required; official page. |
| `tags` | optional; Spanish topical tags. |
| `draft` | default `false`. |
| `createdAt` / `updatedAt` | optional; `YYYY-MM-DD HH:MM:SS`. |

## Body — canonical tabs

Emit these four tabs; tables are welcome for amounts, durations, and deadlines.

```markdown
## Cobertura

Estipendio mensual directo al becario:

| Modalidad | Mensual (2026) | Duración |
|---|---|---|
| Maestría nacional | $36.263 | 24 meses |
| Doctorado nacional | $56.706 | 36-48 meses |

Permite hasta 10 horas semanales de docencia remunerada.

## Requisitos

**A quién está dirigida:** profesionales con título de grado reconocido por el MEC.

- Título de grado reconocido.
- Carta de admisión al programa.
- No tener otra beca concurrente.

## Cómo Postular

A través del sitio web oficial. Publicación de bases en julio, cierre en agosto.

## Fuentes

- [ANII - Formación](https://anii.org.uy/apoyos/formacion/)
- [UDELAR - Becas ANII](https://udelar.edu.uy/)
```

The `## Fuentes` tab is mandatory — every factual claim must link to a reachable official source.