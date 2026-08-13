---
name: uruguay-labura-content
description: Author and maintain the Uruguay-labura content files — create or edit a career (carrera), institution, or scholarship entry under src/content so it matches the site's fixed frontmatter schemas, H2-based tab sections, and Spanish-language body. Use when writing, editing, or generating any career, institution, or scholarship markdown file for the site.
---

# Uruguay-labura content authoring

The site is a directory of Uruguay education: **carreras**, **instituciones**, and **becas**. Agents author and maintain every content file, so the output must be consistent across sessions — the same file shape every run, not just a plausible page. This skill fixes that contract.

Three collections live under `src/content/`:

| Collection | Path | Routed at |
|---|---|---|
| Carreras | `src/content/careers/*.md` | `/educacion/carreras/[slug]` |
| Instituciones | `src/content/institutions/*.md` | `/educacion/instituciones/[slug]` |
| Becas | `src/content/scholarships/*.md` | `/educacion/becas/[slug]` |

## The tab mechanism (the one structural rule)

Every Markdown file is split by **second-level headings**: each `##` heading becomes a **tab** on the rendered page (the `sections-loader` does this — do not write a different header scheme). The text before the first `##` is the intro paragraph rendered above the tabs.

Therefore:

- **`##` = a page tab.** Keep the canonical set per collection (below), and only those tabs the entry genuinely needs.
- **`###` = a subsection inside a tab.** Use them to organize long tabs.
- **Intro prose** (before the first `##`) is optional; entries usually skip it and start straight at `## Resumen`.

## File naming and routes

- The **file name is the content slug**: the title, slugified — lowercase, accents stripped, words joined by `-`. The file `id` (name without `.md`) is the URL slug, so the name is the route.
- For **careers**, append the institution's short code (from the `institution` field) to disambiguate between institutions, e.g. `master-en-educacion-ort`, `economia-derecho-y-gestion-del-deporte-especializacion-udelar`.
- The `institution` frontmatter field is the institution **short slug** (`ort`, `udelar`, `utec`, …); the human-readable name goes in `institutionName`.

## Writing language

The body of every entry is **Spanish**. Frontmatter string values (titles, descriptions, tags, headings, sources) are also Spanish. The skill's prose, field names, and schema stay in English — only the user-facing content is Spanish.

**Schema enum keys are applied verbatim** even when they are not Spanish. Most enum values happen to be Spanish (`modality: hibrido`, `degreeType: maestria`, `area`), but not all — `shift` uses English keys `day` / `night` / `both`. Write every enum value exactly as the reference tables list it; do not translate or infer it. Writing `Día` for `shift` breaks the schema.

## Authoring process

Follow this in order. Each step ends on a checkable bound.

1. **Identify the target and its example.** Determine the collection and the exact file path (see naming above). Read the matching per-collection reference below, and open at least one sibling file of the same collection to mirror its concrete style.

2. **Create or edit the file.** Write the full file: frontmatter block, then the body in Spanish. Match the per-collection template.

    _Done when:_ the file exists at the exact path, the frontmatter has no unknown or misspelled field, and every required field is present per its collection reference.

3. **Write the body with tabs.** Add the canonical H2 tabs for the collection (see below and the per-collection files). Only tabs with real content.

    _Done when:_ every `##` in the body is a member of that collection's canonical set, and the intro text (if any) precedes the first `##`.

4. **Trace every claim to a source.** Each fact in the body must be backed by a `sources` frontmatter entry (careers and scholarships) pointing at the official institution or program page — not scraped aggregators. Facts with no source do not ship.

    _Done when:_ every claim and every `description` maps to a source that is present and linkable.

5. **Strip scraped artifacts.** Scraped sources will inherit formatting that must not ship: leftover `MSWord` markers, invisible text, stray tokens like `Normal 0 21 false false`, and duplicated blocks. Rewrite the body as clean, human-authored Spanish prose.

    _Done when:_ the rendered body reads as clean Spanish prose with no embedded artifacts.

6. **Validate the build.** If the file is non-trivial, run `pnpm check` to catch schema violations. Fix anything it flags.

    _Done when:_ `pnpm check` passes, or the error is pre-existing and unrelated to this file.

## Canonical tabs

- **Carreras** — `## Resumen` (always present), `## Ingreso`, `## Plan de Estudio`.
- **Instituciones** — the body is plain introductory prose; **no tabs** (no `##` headings). All structured data lives in the frontmatter.
- **Becas** — `## Cobertura`, `## Requisitos`, `## Cómo Postular`, y opcional `## Fechas y Plazas` (las fuentes viven en el frontmatter, no en el body).

The exact frontmatter schema, the Spanish tab templates, and the H3 subsection conventions for each collection live further in the reference, and are not repeated here.

## Reference: per-collection details

- **Carreras** — frontmatter fields, the `Resumen` / `Ingreso` / `Plan de Estudio` structure, H3 conventions, and the `area`, `degreeType`, `selected` values. See [`careers.md`](careers.md).
- **Instituciones** — frontmatter fields, campus/department structure, and the body-as-prose rule. See [`institutions.md`](institutions.md).
- **Becas** — frontmatter fields (incluye `sources`), la regla BPC (montos en unidades estables, sin pesos) y la forma de los tabs `Cobertura` / `Requisitos` / `Cómo Postular` / `Fechas y Plazas`. See [`scholarships.md`](scholarships.md).

Open the matching reference and produce from it. Do not invent fields, tabs, or controlled values beyond what the schemas and examples hold.