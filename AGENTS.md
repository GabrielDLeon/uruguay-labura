# AGENTS.md

## Commands

- **Build**: `pnpm build`
- **Type check**: `pnpm check`
- **Format**: `pnpm prettier --write .`

**Important**: Never run `pnpm build`, `pnpm dev`, or `pnpm start`.

## Code Style

- **TypeScript**: Strict mode with strictNullChecks enabled
- **Imports**: Use `@/*` path alias for src/ directory
- **Naming**: camelCase for functions/variables, PascalCase for components
- **Types**: Use Zod schemas for content collections and validation
- **Error handling**: Provide fallbacks (e.g., default locale in i18n)
- **Formatting**: Prettier with astro plugin for .astro files (no semicolons, single quotes)
- **Components**: Astro components with frontmatter for logic and TypeScript interfaces for props
- **Collections**: Define content collections in content.config.ts
- **Icons**: Import from `astro-icon/components` (e.g., `import { Icon } from "astro-icon/components"`), use MDI icons (e.g., `mdi:menu`)
- **Styling**: Tailwind CSS + Basecoat CSS (see `node_modules/basecoat-css/dist/basecoat.css` for component styles)
- **Config**: YAML files for site configuration

## Agent Specific Rules

- Only execute `pnpm check` for significant changes that might introduce breaking issues.
- Do not execute any `git` commands unless explicitly requested by the user.

## Documentation

Official documentation here: [Astro Docs](https://docs.astro.build/llms.txt)
