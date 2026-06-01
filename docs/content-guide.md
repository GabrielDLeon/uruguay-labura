# Content Guide — Educación

## Tabs automáticos

Los `##` headings generan tabs automáticamente. Cada `##` es un tab.

## Estructura estándar

El primer tab siempre es `## Resumen`, con `### Sobre la Carrera` como primer subheading:

```
## Resumen                → tab "Resumen"
### Sobre la Carrera
Contenido de la carrera...

## <Otro tema>            → tab siguiente
Contenido...

### Subsección (opcional)
Más contenido...
```

## Reglas

- **Siempre** empezar con `## Resumen` / `### Sobre la Carrera`.
- **`###`** se renderizan como subsecciones dentro del tab que las contiene.
- **Componentes Astro/React** (como `<RedditComments />`) funcionan dentro de cualquier sección.
- **`import`** de componentes va al inicio del archivo, como siempre.
- **No hace falta** importar nada de tabs. Es automático.

## Sidebar

El `<aside>` (Detalles, Contacto) se genera desde el frontmatter (ver esquema en `src/content.config.ts`).

Ejemplo de frontmatter completo:

```yaml
title: "Ingeniería en Computación"
institutionName: "Universidad de la República (UDELAR)"
institution: "udelar"
degreeType: "ingenieria"
area: "Tecnologías de la Información"
modality: "presencial"
duration: "5 años"
credits: 450
cost: "Gratuita"
language: "Español"
website: "https://..."
description: "Descripción corta para sidebar"
location: "Paysandú, Salto"
accreditation: "UDELAR"
tags:
  - "ingeniería"
  - "computación"
```

## Tecnología

- **Build time:** `src/lib/remark-tabs.js` procesa el AST de MDX y genera la estructura HTML de `.tabs` de basecoat.
- **Client:** el MutationObserver de basecoat activa la interactividad (click, teclado, ARIA).
- **Sin scripts adicionales, sin flash, sin imports por archivo.**

## Archivos existentes

| Archivo | Tabs generados |
|---|---|
| `ingenieria-en-computacion-udelar.mdx` | Resumen, Títulos intermedios, Ciclo Inicial Optativo, Requisitos de Ingreso, Comunidades |
| `licenciatura-tecnologias-informacion-utec.mdx` | Resumen, Plan de Estudio |
| `tecnicatura-superior-ts-utec.mdx` | Resumen, Requisitos de Ingreso, Carreras similares |
| `especializacion-gestion-proyectos-ort.mdx` | Resumen |
