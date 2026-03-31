# CONTEXT

## Objetivo

- Construir una plataforma para visualizar llamados laborales de Uruguay en un solo lugar, empezando por Uruguay Concursa.
- Mejorar la experiencia de búsqueda y filtrado respecto al sitio original.

## Alcance inicial

- Fuente inicial: Uruguay Concursa.
- Sitio estático con scraping ejecutado antes de cada build.
- UI con Astro como shell y React islands para la parte interactiva (listado + filtros).
- Librería visual: Basecoat (en lugar de DaisyUI).

## Decisiones tomadas

- Opción elegida: `Astro + Basecoat + React island`.
- No usar i18n por ahora.
- No usar MDX ni colecciones de páginas del template actual.
- Preparar estructura para escalar a nuevas fuentes en futuras fases.

## Problema a resolver

- Centralizar llamados en una experiencia rápida, clara y usable.
- Permitir filtros útiles (texto, nro llamado, departamento, estado, tipo, cupos, etc.).
