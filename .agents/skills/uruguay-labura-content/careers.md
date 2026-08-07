# Carreras — content reference

The career file is the heart of the site (622 entries). Body is always Spanish; the `##` headings are the page tabs.

## Frontmatter fields

Copy this shape; fill every value in Spanish unless noted. Do not rename or invent fields.

```yaml
---
title: "Especialización en Análisis de Datos"
similar:
  - ciencia-de-datos-maestria-udelar
  - licenciatura-en-analitica-de-negocios-ort
institutionName: "Universidad de la República (UDELAR)"
institution: "udelar"
degreeType: "especializacion"
area: "Tecnologías de la Información"
modality: "hibrido"
shift: "both"
weeklyHours: "No especificado"
duration: "2 años"
credits: 60
cost: "Arancelada"
language: "Español"
website: "https://cap.posgrados.udelar.edu.uy/"
location: "Facultad de Ciencias Económicas y de Administración"
accreditation: "Ministerio de Educación y Cultura"
startDate: ""
applicationDeadline: ""
description: "Una línea breve que resume el programa y su objetivo."
tags:
  - analitica
  - datos
draft: true
createdAt: "2026-07-31 16:58:06"
updatedAt: "2026-08-04 19:47:33"
sources:
  - label: 'Catálogo de la carrera'
    url: 'https://...'
  - label: 'Plan de estudios'
    url: 'https://...'
---
```

Known fields and their allowed values:

| Field | Notes / allowed values |
|---|---|
| `title` | required; display name of the career. |
| `similar` | optional; list of career slugs (other files) suggested on the page. |
| `institutionName` | required; full human-readable institution name, e.g. `Universidad ORT Uruguay`. |
| `institution` | required; the institution **short slug** — `ort`, `udelar`, `utec` (match an `institutions/*.md` id). |
| `degreeType` | required; one of the enum: `maestria`, `especializacion`, `ingenieria`, `doctorado`, `diplomado`, `posdoctorado`, `tecnologo`, `licenciatura`, `tecnicatura`, `carrera`, `ciclo`, `otro`. |
| `area` | required; one of the site's controlled areas (see below). |
| `modality` | required; `presencial` \| `virtual` \| `hibrido`. |
| `shift` | required; `day` \| `night` \| `both`. |
| `weeklyHours` | required; string, e.g. `No especificado`. |
| `duration` | optional; string like `2 años`. |
| `credits` | optional; integer. |
| `cost` | required; string like `Gratuita`, `Arancelada`, `Arancelado`. |
| `language` | default `Español`. |
| `website` | required; official program URL. |
| `accreditation` | optional; accrediting body. |
| `description` | optional; one-line Spanish summary shown in listings. |
| `startDate` / `applicationDeadline` | optional; empty string when unknown. |
| `tags` | optional; Spanish topical tags (lowercase). |
| `draft` | `true` while unpublished. |
| `createdAt` / `updatedAt` | optional; `YYYY-MM-DD HH:MM:SS`. |
| `sources` | recommended; list of `{ label, url }` backing the body facts. |

### Choosing `degreeType` from the title

Match the degree in the career name to the enum key:

| Title says | Use |
|---|---|
| Maestría | `maestria` |
| Especialización | `especializacion` |
| Licenciatura | `licenciatura` |
| Tecnicatura | `tecnicatura` |
| Doctorado | `doctorado` |
| Posdoctorado | `posdoctorado` |
| Tecnólogo | `tecnologo` |
| Ingeniería | `ingenieria` |
| Diplomado / Diploma | `diplomado` |
| Ciclo | `ciclo` |
| No narrower term | `carrera` |
| Genuinely outside the list | `otro` |

## Controlled `area` values (observed usage)

Use one of these exactly when it fits; otherwise the closest existing value.

`Tecnologías y Ciencias de la Naturaleza y el Hábitat`, `Ciencias de la Salud`, `Social y Artística`, `Administración y Negocios`, `Comunicación`, `Ingeniería`, `Tecnologías de la Información`, `Mecatrónica, Logística y Biomédica`, `Diseño`, `Sostenibilidad ambiental`, `Educación`, `Arquitectura`, `Educación, innovación y tecnología`, `Alimentos`, `Sin clasificar`, `Innovación y Emprendimientos`.

## Body — canonical tabs

The `##` headings are the tabs. Emit at least `## Resumen`; add `## Ingreso` and `## Plan de Estudio` where the entry has that content (`Ingreso` is usually omitted for doctorado/posgrado without admission steps).

```markdown
## Resumen

### Sobre la Carrera

Párrafo en español sobre el programa, su perfil y para quién es el estudiante.

### Títulos y Reconocimientos

### Duración y Horarios

### Becas

## Ingreso

### Requisitos de Ingreso

### Proceso de Selección

## Plan de Estudio

### Primer año
```

### H3 subsection convention (under each tab)

- **`## Resumen`** may contain: `Sobre la Carrera`, `Objetivo`, `Perfil de egreso`, `Referentes académicos`, `Docentes`, `Títulos y Reconocimientos`, `Título Intermedio`, `Modalidad`, `Duración y Horarios`, `Becas`, `Comunidades`, `Salida Laboral`, `Valor de las Cuotas`.
- **`## Ingreso`** may contain: `Requisitos de Ingreso`, `Reglamento`, `Proceso de Selección`, `Requisito de Graduación`, `Reválidas`.
- **`## Plan de Estudio`** is usually a `###` per course/módulo; for graded careers use `###` per year (e.g. `### 2.º año`) and `####` per semester, listing the subjects.

Use only the subsections that fit the entry; do not invent others.