# Content Guide — Educación

## Tabs automáticos

Los `##` headings generan tabs automáticamente. Cada `##` es un tab.

## Estructura estándar

```
## Resumen                → tab "Resumen"
### Sobre la Carrera
### Título Intermedio      (opcional)
### Proceso de Selección   (opcional)
### Becas                  (opcional)
### Comunidades            (opcional)

## Ingreso                 → tab "Ingreso"
### Requisitos de Ingreso
### Fechas                 (opcional, si hay startDate/applicationDeadline)
### Ciclo Inicial Optativo (opcional)

## Plan de Estudio         → tab "Plan de Estudio" (opcional)
```

## Reglas

- **Siempre** empezar con `## Resumen` / `### Sobre la Carrera`.
- **Tabs fijos:** `Resumen` e `Ingreso` están siempre presentes.
- **Tab opcional:** `Plan de Estudio` solo cuando hay malla curricular.
- **`###`** son subsecciones dentro del tab que las contiene.
- **Componentes Astro/React** (como `<RedditComments />`) funcionan dentro de cualquier sección.
- **`import`** de componentes va al inicio del archivo, como siempre (después del frontmatter, antes del primer `##`).
- **No hace falta** importar nada de tabs. Es automático.

## Frontmatter

El `<aside>` (Detalles, Contacto) se genera desde el frontmatter.

Campos del schema (`src/content.config.ts`):

```yaml
title: "Ingeniería en Computación"
short: "Ing. en Computación"          # opcional
institutionName: "Universidad de la República (UDELAR)"
institution: "udelar"                   # slug, opcional
campus: "Sede Paysandú"                # opcional
degreeType: "ingenieria"                # enum
area: "Tecnologías de la Información"
modality: "presencial"                  # enum: presencial, virtual, hibrido
shift: "day"                            # enum: day, night, both
weeklyHours: "40 horas"
duration: "5 años"
credits: 450                            # opcional
cost: "Gratuita"
language: "Español"
website: "https://..."
contactEmail: "..."                     # opcional
location: "Paysandú, Salto"            # opcional
accreditation: "UDELAR"                # opcional
description: "Descripción corta..."     # opcional, para SEO/previews
startDate: "2026-04-01"                # opcional
applicationDeadline: "2026-02-28"      # opcional
tags:
  - "ingeniería"
  - "computación"
similar:
  - "licenciatura-tecnologias-informacion-utec"  # opcional
becas:
  - "fondo-solidaridad"                # opcional, slugs de colección becas
draft: false                            # opcional, default false
```

## Colección becas

Las becas se modelan como una colección independiente en `src/content/becas/`.

Frontmatter de una beca:

```yaml
title: "Fondo de Solidaridad"
type: "Beca económica estatal nacional"
institution: "Fondo de Solidaridad"
description: "Descripción corta para SEO..."   # opcional
website: "https://..."
tags:
  - "estatal"
  - "udelar"
draft: false
```

El contenido detallado (cobertura, audiencia, requisitos, cómo postular) va en el **body** con secciones `##`.

Cada carrera referencia becas mediante el campo `becas` en su frontmatter.

## Tecnología

- **Build time:** `src/lib/remark-tabs.js` procesa el AST de MDX y genera la estructura HTML de `.tabs` de basecoat.
- **Client:** el MutationObserver de basecoat activa la interactividad (click, teclado, ARIA).
- **Sin scripts adicionales, sin flash, sin imports por archivo.

## Archivos existentes

| Archivo | Tabs generados |
|---|---|
| `ingenieria-en-computacion-udelar.mdx` | Resumen, Ingreso |
| `licenciatura-tecnologias-informacion-utec.mdx` | Resumen, Ingreso, Plan de Estudio |
| `tecnicatura-superior-ts-utec.mdx` | Resumen, Ingreso |
| `especializacion-gestion-proyectos-ort.mdx` | Resumen, Ingreso |
