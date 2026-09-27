# ADR 0002: Auditoría de carreras UTEC

Fecha: 2026-09-27
Estado: aceptado
Alcance: `web/src/content/careers/*utec*.md` (43).
Aplica el estándar de ADR 0001; aquí solo lo específico de UTEC.

## Fuentes propias

Fichas en `utec.edu.uy/es/educacion/{carrera,posgrado}/`, catálogo
`descubri.utec.edu.uy`, planes PDF en `/uploads/plan/`, noticias del dominio.
`web/docs/utec/` (snapshot manual sin fecha) se borró al cerrar.

## Estado inicial

41/43 en `draft: true`; 11 sin `location`, 5 tecnólogos sin `duration`,
36/43 con `weeklyHours: "No informada"`; 1 website duplicado (LTI vs su título
intermedio TSU); 12 pares grado ↔ tecnólogo por título intermedio.

## Decisiones UTEC-específicas

- Duplicado TSU-TI conservado como ficha propia (título intermedio, regla ADR 0001.4).
- Conflicto 2-vs-3 años (TAGD/LIDIA) zanjado por el plan PDF oficial: 6 semestres,
  3 años, 240 créditos; citado en `sources:` de ambas fichas.
- `secretaria.lidia@utec.edu.uy` removido: no figura en ficha ES/EN, Descubrí ni
  contacto oficial. Email de Ciberseguridad confirmado en noticia oficial del dominio.
- URLs plurales `/educacion/carreras/<slug>/` medidas con curl: 200 sin redirect
  → páginas propias, se conservan.
- Slug LTI renombrado al canónico oficial sin redirect (sitio sin producción ni
  tráfico externo).
- Ninguna preinscripción de posgrado abierta al 2026-09-27 (4 cohortes en curso,
  3 sin convocatoria): fechas vencidas quitadas de frontmatter y cuerpos.

## Resultado

43/43 verificadas y visibles, `sources[]` con URL oficial en todas.
Rama `feat/utec-careers-audit`.
