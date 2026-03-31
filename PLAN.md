# PLAN

## Fase 1 - Limpieza del template (prioridad)

- Remover i18n de configuración y utilidades.
- Remover MDX y colecciones de páginas.
- Eliminar rutas y contenido heredado del template que ya no aplica.
- Dejar una base Astro mínima para una única app en español.

## Fase 2 - Base UI y arquitectura

- Quitar DaisyUI e incorporar Basecoat.
- Definir layout base de la app (header, main, footer, SEO básico).
- Preparar estructura de componentes Astro + React islands.

## Fase 3 - Datos y scraping pre-build

- Integrar script de scraping existente al flujo de build.
- Definir formato final de datos normalizados de empleos.
- Generar artefacto estático (JSON) consumible por Astro.

## Fase 4 - Listado y filtros

- Implementar tabla/listado de empleos.
- Implementar filtros principales en island React.
- Mostrar estado, fechas, tipo de tarea, cupos y enlaces.

## Fase 5 - Cierre de MVP

- Ajustes de UX responsive.
- Validación de tipos y calidad de datos.
- Documentación operativa mínima para mantener y escalar.
