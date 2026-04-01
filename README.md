# Uruguay Labura

Sitio estatico para centralizar llamados laborales en Uruguay.

## Stack

- Astro como shell
- React islands para filtros/listado
- Tailwind + Basecoat para UI
- Dataset generado por scraping previo al build

## Comandos

- `pnpm install`
- `pnpm check`
- `pnpm scrape:jobs`

## Scraping pre-build

`pnpm build` ejecuta automaticamente `scripts/prebuild-jobs.mjs` via `prebuild`.

Opciones:

1. Definir comando custom con `JOBS_SCRAPER_CMD`.
2. O colocar script Python en `scripts/scrape_jobs.py`.

El prebuild espera o genera `src/data/jobs.generated.json`.

## Documentacion de trabajo

- `CONTEXT.md`
- `PLAN.md`
- `TASKS.md`
