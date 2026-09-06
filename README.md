# Uruguay Labura

Uruguay Labura es un sitio web que centraliza el acceso a oportunidades laborales y educativas en Uruguay.

Actualmente, la información sobre llamados laborales y oferta educativa se encuentra dispersa en decenas de sitios institucionales, con interfaces dispares que dificultan la búsqueda y la comparación. Este proyecto reúne esa oferta en un único directorio con búsqueda, filtros y fichas comparables.

El contenido educativo como lo son carreras, instituciones y becas; constituyen el núcleo del sitio y se mantiene como contenido curado dentro del repositorio. Los llamados laborales se incorporan por agregación de fuentes externas, actualmente Uruguay Concursa. El sitio no gestiona postulaciones: cada ficha enlaza a la fuente oficial correspondiente.

## Alcance

- **Educación:** directorio de carreras, instituciones y becas en `src/content/` (~860 carreras, instituciones y becas). Las fichas de carrera generan pestañas automáticamente a partir de encabezados `##` (Resumen, Ingreso, Plan de Estudio, Fuentes).
- **Empleo:** vista centralizada de llamados de Uruguay Concursa con filtros, generada durante el build en `src/data/jobs.generated.json`.

## Stack

- Astro 7 + React 19
- Tailwind CSS v4 + Basecoat
- Pagefind, astro-seo + sitemap

## Instalación

Requisitos: Node 20+ y pnpm.

```bash
pnpm install
cp .env.example .env
pnpm dev
```

### Variables de entorno

| Variable      | Requerida | Descripción                                                                       |
| ------------- | --------- | --------------------------------------------------------------------------------- |
| `SOURCE_URL`  | No\*      | URL del JSON con llamados. \*Obligatoria solo si no existe `jobs.generated.json`. |
| `AUTH_TOKEN`  | No        | Token Bearer opcional, solo si la fuente lo requiere.                             |
| `SHOW_DRAFTS` | No        | `true` para visualizar contenido con `draft: true`. Valor por defecto: `false`.   |

Ver `.env.example` para el formato.

### Comandos

| Comando             | Descripción                                               |
| ------------------- | --------------------------------------------------------- |
| `pnpm dev`          | Servidor de desarrollo.                                   |
| `pnpm build`        | Build de producción (incluye obtención de llamados).      |
| `pnpm preview`      | Previsualización del build.                               |
| `pnpm check`        | Verificación de tipos (Astro + TypeScript estricto).      |
| `pnpm scrape:jobs`  | Regeneración de `jobs.generated.json` sin build completo. |
| `pnpm check:dates`  | Verificación de fechas del contenido.                     |
| `pnpm update:dates` | Actualización de fechas del contenido.                    |

## Contribución

Repositorio público y colaborativo. Cualquier persona puede abrir un pull request; todos son revisados. No se requiere autorización previa.

### Tipos de aporte

- **Contenido:** alta o corrección de carreras, instituciones o becas en `src/content/`. No requiere conocimientos de programación.
- **Código:** corrección de errores, nuevas funcionalidades o refactorización.
- **Documentación:** mejoras a la documentación o a este README.

Indicar el tipo en el pull request según `.github/PULL_REQUEST_TEMPLATE.md`.

### Procedimiento

1. Crear un fork del repositorio y una rama (`git checkout -b feat/nueva-funcionalidad`).
2. Verificar los cambios localmente (`pnpm dev`).
3. Ejecutar `pnpm check` si se modificó código o frontmatter.
4. Abrir un pull request contra `main` con descripción, tipo de cambio y capturas en caso de cambios visuales.

El template del pull request incluye la lista de verificación, el issue relacionado y la evidencia requerida.

### Convenciones

- TypeScript estricto, imports con alias `@/*` y formato con Prettier (`pnpm prettier --write .`).
- Contenido: frontmatter válido según `src/content.config.ts` y secciones con `##` según `docs/content-guide.md`.
- Vocabulario del dominio (`CONTEXT.md`): **llamado** (no concurso ni puesto), **carrera** (no curso ni programa), **beca**, **institución**, **nivel**, **tipo de grado**. Aplica a issues, pull requests y contenido.

## Estructura del proyecto

```
src/
├── content/          # carreras, instituciones, becas (Markdown + frontmatter)
├── content.config.ts # schemas Zod de las colecciones
├── data/             # jobs.generated.json (llamados, generado en build)
├── pages/            # rutas (empleos, educacion, carreras, acerca)
├── components/       # componentes Astro/React
└── lib/              # utilidades (tabs, carreras, etc.)
scripts/              # prebuild-jobs, normalización y mantenimiento de contenido
docs/                 # content-guide y documentación por fuente (udelar, utec, ort)
```

## Licencia

MIT
