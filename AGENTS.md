# AGENTS.md

## Commands

- **Build**: `pnpm build`
- **Type check**: `pnpm check`
- **Format**: `pnpm format` (Prettier). Check with `pnpm format:check`.

**Important**: Never run `pnpm build`, `pnpm dev`, or `pnpm start`.

**Formatting is not optional**: there is no ESLint/Biome in this repo, only Prettier (`.prettierrc`) plus `astro check` for types. After writing or editing any file, run `pnpm format` (or `pnpm format:check`) before finishing. Do not hand-format or follow other style conventions — Prettier is the single source of truth.

## Code Style

- **TypeScript**: Strict mode with strictNullChecks enabled
- **Imports**: Use `@/*` path alias for src/ directory
- **Naming**: camelCase for functions/variables, PascalCase for components
- **Types**: Use Zod schemas for content collections and validation
- **Error handling**: Provide fallbacks (e.g., default locale in i18n)
- **Formatting**: Prettier (`.prettierrc`): semicolons, double quotes, printWidth 80, trailing commas. Never hand-format; run `pnpm format`.
- **Components**: Astro components with frontmatter for logic and TypeScript interfaces for props
- **Collections**: Define content collections in content.config.ts
- **Icons**: Import from `astro-icon/components` (e.g., `import { Icon } from "astro-icon/components"`), use Keyline Icons, base fill style (e.g., `keyline-icons:menu-fill`); MDI (`mdi:*`) only for brands/icons missing from Keyline (e.g., `mdi:github`). React islands use `@iconify/react/offline` with data from `@iconify-icons/keyline-icons/<name>` (no `.js` suffix) via `appIcons` in `src/lib/icons.ts`
- **Styling**: Tailwind CSS + Basecoat CSS (see `node_modules/basecoat-css/dist/basecoat.css` for component styles)
- **Config**: YAML files for site configuration

## Agent Specific Rules

- Only execute `pnpm check` for significant changes that might introduce breaking issues.
- Do not execute any `git` commands unless explicitly requested by the user.
- The site is not in production and receives no external traffic: breaking old URLs is fine — no redirects or backward compatibility needed.

## Documentation

Official documentation here: [Astro Docs](https://docs.astro.build/llms.txt)

## Agent skills

### Issue tracker

Issues live in GitHub Issues, operated via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles are kept as default label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` plus `docs/adr/` at the repo root. See `docs/agents/domain.md`.
