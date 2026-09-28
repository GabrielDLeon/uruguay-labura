# ADR 0005: Triage de carreras UDELAR (qué va y qué no)

Fecha: 2026-09-28
Estado: aceptado
Alcance: `web/src/content/careers/*udelar.md` (481 fichas, 480 en draft).
Rama: `feat/udelar-triage`.

## Contexto

El inventario Udelar mezclaba carreras reales con categorías de catálogo,
cursos sueltos, ciclos de ingreso sin título propio, programas descontinuados
y fichas duplicadas por sede o por registro histórico. Sin decidir qué va,
cualquier pasada de contenido construye sobre arena.

## Decisión

1. **Es carrera si otorga título propio oficial y está vigente.** Fuentes en
   orden: ficha `udelar.edu.uy/carrera/`, sitio de la facultad/sede, CAP
   (`postulaciones.posgrados.udelar.edu.uy`, campo Vigente) para posgrados.
2. **Va afuera (commit `remove:`):** categorías del CAP, cursos sin título de
   grado/pregrado, CIO y ciclos sin título propio, programas con
   `Vigente: No` o sin cohortes en años, duplicados exactos (se conserva la
   canónica y se pliegan sede/fuentes), fichas de otra institución sin
   cogestión Udelar.
3. **Quedan:** tecnólogos/tecnaturas en convenio con UTU/UTEC **con**
   titulación compartida Udelar (cárnico, informática, industrial mecánico,
   químico, madera, equina); Diploma Oficial habilitante (Guardavidas
   Maldonado); programas paraguas CAP reales (biomédico, gramática ANEP).
4. **Taxonomía CAP:** "Diplomatura" en FMed es nivel Especialización
   (el CAP lista `Nivel: Especialización, Nombre: Diplomatura - X`); no se
   retipifica a `diplomado`.
5. **Sin cambios de visibilidad:** todo sigue en draft; el triage no publica.

## Resultado

481 → 458 fichas (−23): 6 ciclos CIO, 11 posgrados no vigentes, 2 merges de
sede/denominación (educación física Rivera, turismo sustentable), 3 merges de
programas absorbidos (economía FCS ×2, gramática queda doble titulada),
1 curso sin cohortes desde 2017 (políticas de drogas, con body copiado).
Además: 10 duraciones corregidas contra fuente oficial (el "5 años" genérico),
4 títulos/URLs (typos Promoción, Maestría duplicada en título, CAP ids).

## Consecuencias

- Pendiente conocido (no bloquea): normalización de slugs al canónico oficial
  (`filosofia`, `historia`, `linguistica`, `ingenieria-de-alimentos`,
  `correccion-de-estilo`), descripción de filosofía copiada de otra carrera,
  renombre sugerido del doctorado FHCE multi-disciplina.
- Próxima pasada: contenido de grado verificable por facultad, empezando por
  las ~140 de grado (las más buscadas).
