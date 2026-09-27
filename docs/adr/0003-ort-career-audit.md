# ADR 0003: Auditoría de carreras ORT

Fecha: 2026-09-28
Estado: aceptado
Alcance: 98 fichas ORT reales (`website` en `*.ort.edu.uy`).
Aplica el estándar de ADR 0001; aquí solo lo específico de ORT.

## Fuentes propias

Fichas por facultad (`fa/facs/fc/fd/fi/id/ie.ort.edu.uy`), sin endpoint JSON
público de catálogo (la existencia se confirma por fetch directo de cada ficha).
Contacto = formulario "Solicitá más información" (ninguna ficha publica email;
`info@ort.edu.uy` general). Costos: la etiqueta `Arancelado` es correcta, el
sitio no publica montos (entrevista personal).

## Estado inicial

114/115 en `draft` (conteo con 17 falsos positivos del glob `*ort*`:
*transporte*, *ortopedia*, *portugués* de otras instituciones — excluidos,
quedan 98). 1 visible (Ingeniería en Sistemas).

## Decisiones ORT-específicas

- `weeklyHours: "No especificado"` eliminado en las 98; el campo pasó a opcional
  en el schema y la fila se oculta si no hay dato (fix code:
  `content.config.ts` + `[slug].astro`).
- `shift` también opcional: sin horario publicado se omite (fallback "A consultar").
  Mapeo: matutino-only → `day` ("Diurno"); vespertino/nocturno → `night`.
- `hibrido` = mapeo oficial de "Presencial + HyFlex® opcional" (cuerpos lo
  documentan); solo se usa `presencial`/`virtual` donde es estructural.
- Bloqueantes corregidos: Doctorado en Ingeniería `cost` → "Sin costo";
  Bioinformática, Finanzas (lic.) y Business Analytics a "En trámite de
  reconocimiento (MEC)"; Diseño Estratégico y Operador Inmobiliario ya
  reconocidos (res. 14/04/2026 y 10/09/2026) + cuerpos actualizados.
- `credits: 180` → 240 en 6 licenciaturas de Comunicación (180 = intermedio).
- 6 slugs renombrados al canónico oficial + `similar[]` actualizados.
- Dermatología (id.ort.edu.uy), Operador Inmobiliario y Productor Musical:
  existen, son de ORT, no convenios.
- `location: "Montevideo"` se mantiene (sin sede explícita por ficha).

## Resultado

98/98 verificadas y visibles. Rama `feat/ort-careers-audit`.
