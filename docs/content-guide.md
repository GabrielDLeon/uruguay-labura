# Content Guide — Educación

## Tabs automáticos

Los `##` headings generan tabs automáticamente. Cada `##` es un tab.

## Estructura estándar

```
## Resumen                → tab "Resumen"
### Sobre la Carrera
### Título Intermedio      (opcional)
### Objetivo               (opcional, posgrados UDELAR)
### Perfil de egreso       (opcional)
### Referentes académicos  (opcional)
### Docentes               (opcional, solo listas cortas curadas: coordinadores, plantel, comisiones)
### Proceso de Selección   (opcional)
### Becas                  (opcional)
### Comunidades            (opcional)

## Ingreso                 → tab "Ingreso"
### Requisitos de Ingreso
### Fechas                 (opcional, si hay startDate/applicationDeadline)
### Ciclo Inicial Optativo (opcional)
### Reglamento             (opcional)

## Plan de Estudio         → tab "Plan de Estudio" (opcional)
### Programa               (opcional)
### Unidades curriculares  (opcional)

## Fuentes                 → tab "Fuentes" (opcional, siempre al final)
```

## Reglas

- **Siempre** empezar con `## Resumen` / `### Sobre la Carrera`. Si el archivo
  no tiene texto introductorio propio, `### Sobre la Carrera` se puede sembrar
  desde el campo `description` del frontmatter.
- **Tabs fijos:** `Resumen` está siempre presente; `Ingreso` y `Plan de
  Estudio` aparecen solo si hay contenido de ingreso / malla curricular.
- **`## Fuentes`**: tab opcional al final con links a fuentes oficiales
  (catálogo, ficha PDF, página oficial). No lleva subsecciones.
- **`###`** son subsecciones dentro del tab que las contiene.
- **Componentes Astro/React** (como `<RedditComments />`) funcionan dentro de cualquier sección.
- **`import`** de componentes va al inicio del archivo, como siempre (después del frontmatter, antes del primer `##`).
- **No hace falta** importar nada de tabs. Es automático.

## Mapeo de secciones scrapeadas del CAP (UDELAR)

Las carreras UDELAR scrapeadas del [Catálogo de Posgrados (CAP)](https://cap.posgrados.udelar.edu.uy/)
usan secciones propias. Al normalizar (`scripts/normalize-body.mjs`) se mapean así:

| Sección original | Destino |
|---|---|
| `## Objetivo` | `## Resumen` → `### Objetivo` |
| `## Perfil de egreso` | `## Resumen` → `### Perfil de egreso` |
| `## Referentes académicos` | `## Resumen` → `### Referentes académicos` |
| `## Requisitos para postular` | `## Ingreso` → `### Requisitos de Ingreso` |
| `## Reglamento` | `## Ingreso` → `### Reglamento` |
| `## Programa` | `## Plan de Estudio` → `### Programa` |
| `## Unidades curriculares` | `## Plan de Estudio` → `### Unidades curriculares` |
| `## Información adicional` | `## Ingreso` → `### Requisitos de Ingreso` (si arranca con "Requisitos de ingreso/inscripción:", sin el prefijo) o `### Información adicional` |
| `## Fuentes` | `## Fuentes` (se conserva) |
| `## Docentes` | `## Resumen` → `### Docentes` si es lista corta (≤600 chars) con info curada (coordinadores, plantel, comisiones); los muros de nombres del CAP se descartan |
| `## Departamentos donde se dicta el posgrado` | la sección no se renderiza; el valor (ciudad, p. ej. "Montevideo", "Paysandú") se anexa al campo `location` del frontmatter cuando no está ya presente |


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

## Colección institutions

Las instituciones usan datos estructurados en el frontmatter; el body queda para narrativa sin cifras duras.

```yaml
name: "Universidad ORT Uruguay"
short: "ORT"                               # opcional
type: "private"                            # enum: public, private
website: "https://www.ort.edu.uy"
contactEmail: "info@..."                   # opcional, solo si está publicado
phone: "+598 ..."                         # central oficial
founded: 1942                              # opcional, solo alimenta foundingDate del JSON-LD
campuses:                                  # sede = nombre + localidad + dirección
  - name: "Campus Centro"
    location: "Montevideo"
    address: "Cuareim 1451, Montevideo"
```

Reglas:

- Nada de años de fundación ni conteos en el prose: descripción cualitativa.
- Toda cifra lleva fuente o se marca como aproximada.
- El sidebar renderiza Contacto y Presencia. No se renderizan Facultades, Cifras ni Tags.

## Colección scholarships

Las becas se modelan como una colección independiente en `src/content/scholarships/`.

Frontmatter de una beca (schema `scholarshipSchema` en `src/content.config.ts`):

```yaml
title: "Fondo de Solidaridad"
type: "Beca económica estatal nacional"
institution: "Fondo de Solidaridad"
description: "Descripción corta para SEO..."   # opcional
website: "https://..."                        # sitio oficial del programa
applicationUrl: "https://..."                 # link directo de postulación, distinto de website (opcional)
amount: "2 BPC mensuales"                      # opcional; montos anclados a índices en unidad estable (ej. BPC), sin $ hardcodeados
level: ["grado"]                               # enum: grado, posgrado, tecnico, diplomado, educacion-media
renewable: true                                  # default false; true si se renueva o se mantiene toda la carrera con rendimiento
applicationDeadline: "2026-09-30"              # fecha ISO o "" si solo hay ventana recurrente
sources:                                         # links oficiales de respaldo
  - label: "Sitio oficial"
    url: "https://..."
tags:
  - "estatal"
  - "udelar"
draft: false
```

Reglas:

- `amount` en BPC/€/U$S según la fuente; si se da equivalencia en $UY, fecharla ("a valores enero 2026").
- `applicationDeadline` con fecha real cuando la convocatoria la tenga (aunque el body describa varias ediciones); `""` solo si es ventana recurrente sin fecha fija.
- `renewable: true` para becas que se mantienen toda la carrera con rendimiento (privadas) o se renuevan año a año (estatales).

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
| `agronomia-maestria-udelar.mdx` | Resumen, Ingreso, Plan de Estudio, Fuentes |
| `abogacia-udelar.mdx` | Resumen, Ingreso, Fuentes |
