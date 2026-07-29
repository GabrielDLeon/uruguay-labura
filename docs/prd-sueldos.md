# PRD: Sección de Sueldos

## Problem Statement

Uruguay Labura actualmente cubre empleos públicos y educación, pero no ofrece información sobre la situación salarial en el país. Los usuarios que buscan entender el mercado laboral uruguayo no tienen una referencia unificada de sueldos por sector, puesto o institución. La información está dispersa en fuentes oficiales (INE) y ofertas laborales, sin una vista consolidada.

## Solution

Agregar una nueva sección `/sueldos` que presente datos estáticos de salarios en los sectores de **educación** y **salud**, con visualizaciones interactivas (gráficos de rango salarial), filtros por sector/departamento/experiencia, y sorting por diferentes criterios. Los datos se almacenan en un archivo TypeScript estático y se consumen mediante un React island, siguiendo el patrón existente de la sección de empleos.

## User Stories

1. As a job seeker, I want to see salary ranges for education positions in Uruguay, so that I can evaluate if a job offer is competitive
2. As a job seeker, I want to see salary ranges for health positions in Uruguay, so that I can compare opportunities across sectors
3. As a user, I want to filter salaries by sector (education/health), so that I can focus on my area of interest
4. As a user, I want to filter salaries by department, so that I can see local market conditions
5. As a user, I want to filter salaries by experience level, so that I can find relevant ranges for my career stage
6. As a user, I want to sort salaries by minimum, maximum, or average, so that I can quickly identify the best opportunities
7. As a user, I want to see salary ranges as horizontal bar charts, so that I can visually compare positions
8. As a user, I want to see tooltips with detailed information when hovering over a chart, so that I can get exact numbers
9. As a user, I want to see salary data by institution type (public/private), so that I can compare sectors
10. As a user, I want to see observations about benefits or bonuses, so that I have a complete picture
11. As a user, I want the salary section to be accessible from the main navigation, so that I can find it easily
12. As a user, I want the salary section to be listed on the homepage, so that I can discover it when visiting the site
13. As a user, I want the salary page to work on mobile devices, so that I can access it from my phone
14. As a user, I want the salary page to support dark mode, so that I can use it comfortably at night
15. As a contributor, I want the data structure to be easy to extend, so that more sectors can be added later
16. As a future feature, I want the architecture to support user-submitted data via forms, so that the dataset can grow organically
17. As a user, I want to see the data source and last updated date, so that I can assess data freshness
18. As a user, I want to see a summary of available positions per sector, so that I can quickly understand the landscape
19. As a user, I want the page to load quickly with static data, so that I have a good experience

## Implementation Decisions

### Data Structure

Crear `src/data/sueldos.ts` con una interfaz `SueldoEntry` y un array estático de entradas:

```typescript
export interface SueldoEntry {
  sector: 'educacion' | 'salud'
  puesto: string
  institucion: string
  tipoInstitucion: 'publica' | 'privada'
  departamento: string
  salarioMinimo: number
  salarioMaximo: number
  salarioPromedio: number
  experiencia: 'Junior' | 'Semi-Senior' | 'Senior' | 'Jefe/Coordinador'
  observaciones?: string
}
```

### New Components (React island pattern like JobsBoard)

- `src/components/sueldos/SueldosBoard.tsx` — main orchestrator, manages state and filtering
- `src/components/sueldos/SueldosFilters.tsx` — filter controls (sector, department, experience, institution type)
- `src/components/sueldos/SueldosChart.tsx` — horizontal bar chart visualization with tooltips
- `src/components/sueldos/SueldosTable.tsx` — alternative table view (responsive, like JobsTable)
- `src/components/sueldos/SueldosSort.tsx` — sorting controls
- `src/components/sueldos/sueldos-utils.ts` — filtering, sorting, and formatting utilities

### Chart Library

Instalar una charting library ligera para React (a evaluar: Recharts, Victory, o similar). Debe:
- Soportar dark mode via CSS variables
- Soportar tooltips con contenido personalizado
- Ser compatible con React 19
- Tener bundle size pequeño

### Page Structure

- `src/pages/sueldos.astro` — Astro page con React island
- Reutilizar `PageHeader` para título y descripción consistente
- Pasar filtros iniciales desde URL search params (como en `/empleos`)

### Navigation Updates

- Agregar link "Sueldos" en `src/components/Header.astro` (nav desktop y mobile)
- Agregar link "Sueldos" en `src/components/Footer.astro` (sección navegación)
- Agregar card "Sueldos" en `src/pages/index.astro` (homepage grid)

### Data Sources (para dataset inicial)

- INE Observatorio de Precios y Salarios — datos oficiales
- Ofertas laborales públicas de ASSE, ANEP, Hospital Policial, SMMU
- Cruzar escalas oficiales con ofertas del mercado
- Target: 20-30 entries entre educación y salud

### Patterns to Reuse

- `SearchableSelect` component para filtros dropdown
- `departments.ts` mapping para filtros por departamento
- `formatCurrency` de `educacion.ts` para formateo de salarios
- Basecoat CSS classes: `card`, `badge`, `btn`, `input`, `select`, `table`
- URL state sync pattern de JobsBoard (`history.replaceState` + `popstate`)

## Testing Decisions

- **What makes a good test:** Test external behavior (filtering, sorting, rendering), not implementation details
- **Modules to test:**
  - `sueldos-utils.ts` — pure functions for filtering and sorting
  - `SueldosBoard` — integration tests for filter interactions
  - `SueldosChart` — rendering tests with mock data
- **Prior art:** No existing tests in the codebase — this would be the first test suite. Consider adding Vitest configuration if tests are desired.

## Out of Scope

- User-submitted data via forms (noted as future architecture consideration)
- Real-time data fetching or API endpoints
- Authentication or user accounts
- Advanced analytics or machine learning
- Export/download functionality
- Comparison between education and health sectors
- Historical salary trends or time-series data
- Additional sectors beyond education and health (can be added later)
- Search functionality (Pagefind integration can be added later)
- URL deep linking for filters (can be added later, like empleos)

## Further Notes

- El dataset inicial será curado manualmente de fuentes públicas
- La estructura de datos está diseñada para ser fácilmente extensible a futuro
- Las visualizaciones deben ser responsive y funcionar bien en mobile
- El dark mode es obligatorio — todas las nuevas CSS variables deben definirse en ambos temas
- El proyecto usa pnpm para gestión de paquetes
- No ejecutar comandos `git` a menos que el usuario lo solicite explícitamente
- La sección de sueldos podría expandirse a más sectores en el futuro
- El formulario de contribución anónima queda como nota para futuro
