# Instituciones — content reference

Institution files document each education provider (currently `ort`, `ucu`, `ude`, `udelar`, `um`, `utec`). Body is Spanish prose; the structured data lives in the frontmatter.

## Frontmatter fields

```yaml
---
name: "Universidad ORT Uruguay"
short: "ORT"
logo: "@/assets/institutions/ort-logo.jpg"
color: "#78071B"
type: "private"
website: "https://www.ort.edu.uy"
contactEmail: "info@ort.edu.uy"
phone: "+598 2902 1543"
location: "Montevideo"
tags:
  - "tecnología"
  - "ingeniería"
  - "negocios"
departments:
  - "Montevideo"
campuses:
  - name: "Campus Centro"
    location: "Montevideo"
    address: "Cuareim 1451, Montevideo"
description: "Dos o tres líneas que presentan a la institución."
isActive: true
createdAt: "2026-05-14 20:08:25"
updatedAt: "2026-08-04 15:30:00"
---
```

| Field | Notes / allowed values |
|---|---|
| `name` | required; full institution name. |
| `short` | optional; short code. |
| `logo` | optional; image asset path under `@/assets/institutions/`. |
| `color` | optional; hex brand color. |
| `type` | required; `public` \| `private`. |
| `website` | required; official site. |
| `contactEmail` / `phone` | optional; official contact. |
| `location` | optional; main location. |
| `tags` | optional; Spanish topical tags. |
| `departments` | optional; list of department regions/departments. |
| `campuses` | optional; list of `{ name, location, address }` objects. |
| `description` | optional; short Spanish summary. |
| `isActive` | default `true`. |
| `createdAt` / `updatedAt` | optional; `YYYY-MM-DD HH:MM:SS`. |

## Body — the pros rule

The institution body is **plain introductory prose, with no `##` tabs** — a few fluent Spanish paragraphs describing the institution (history, standing, strengths, campuses, ties). A longer entry may use `###` for optional subsections if authoring benefits, but never `##`. All structured facts belong in the frontmatter, not the body.

```markdown
La Universidad ORT Uruguay es una universidad privada fundada en 1943 como
instituto técnico y reconocida como universidad en 1996...

ORT es particularmente reconocida por sus programas de ingeniería, tecnología
y negocios, y se posiciona entre las mejores universidades de América Latina
en innovación...
```