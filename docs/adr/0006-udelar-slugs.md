# ADR 0006: Slugs canónicos UDELAR

Fecha: 2026-09-28
Estado: aceptado
Alcance: `web/src/content/careers/*udelar.md` (458 fichas).
Rama: `feat/udelar-slugs`.

## Contexto

El sufijo `-udelar` es convención propia (namespace por institución) y se
conserva. La parte previa debe coincidir con el slug de la ficha oficial
`udelar.edu.uy/carrera/<slug>`. Además, muchas fichas apuntaban a páginas de
facultad/sede en vez de la ficha canónica.

## Decisión

1. **Renames (9):** 6 Artes (se elimina el infijo `artes-` duplicado, p. ej.
   `licenciatura-en-artes-ceramica` → `licenciatura-en-ceramica`), 2 typos
   (`promcoion` → `promocion`, `maestria-y-en-politicas-publicas-maestria` →
   `politicas-publicas-maestria`, `maestria-en-ciencia-politica-maestria` →
   `ciencia-politica-maestria`). Cada rename actualiza sus referencias
   `similar:` en todo el repo, un commit por rename.
2. **No se renombra:** el doctorado FHCE multi-disciplina (el nombre largo
   pegado ES el oficial CAP 19/97), las 4 licenciaturas de música (la ficha
   oficial es una página índice compartida; renombrarlas colisionaría),
   bachiller/binacional (títulos propios con fuente de sede válida).
3. **Website canónico:** 129 fichas pasaron a `udelar.edu.uy/carrera/<slug>`
   (verificado HTTP 200 una por una); la URL anterior de facultad/sede se
   conserva en `sources[]`. 4 sin ficha directa conservan su fuente
   (ingeniería biológica, recursos hídricos, bachiller, binacional).

## Consecuencias

- `similar:` sigue resolviendo (`pnpm check` limpio).
- Sitio sin producción ni tráfico externo: sin redirects (regla AGENTS.md).
